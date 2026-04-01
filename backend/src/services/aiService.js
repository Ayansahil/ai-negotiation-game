import dotenv from 'dotenv'
dotenv.config()

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL_1 || 'gemini-2.5-flash-lite',
})


// ─── Phase logic ────────────────────────────────────────────────
// early  → rounds 1–3  : absolute resistance, never accept
// mid    → rounds 4–6  : slight flexibility, no deal yet
// late   → rounds 7–9  : real negotiation, may close
// final  → round 10    : last chance, can seal
const getPhase = (round, maxRounds) => {
  const ratio = round / maxRounds
  if (ratio <= 0.3) return 'early'
  if (ratio <= 0.6) return 'mid'
  if (ratio <= 0.9) return 'late'
  return 'final'
}

const extractOfferedPrice = (text) => {
  const lower = text.toLowerCase()

  if (/percent|%|off/.test(lower)) return null

  const matches = text.match(/[₹]?\s*(\d[\d,]*)/g)
  if (!matches) return null

  const nums = matches
    .map(m => parseInt(m.replace(/[₹,\s]/g, '')))
    .filter(n => n >= 100 && n <= 500000)

  return nums.length ? Math.max(...nums) : null
}

// ─── Main export ─────────────────────────────────────────────────
export const getAIResponse = async ({
  userMessage,
  currentPrice,
  minPrice,
  round,
  maxRounds,
  personality,
  messageHistory = [],
}) => {
  const safeMin = minPrice || 5000
  const phase = getPhase(round, maxRounds)
  const offeredPrice = extractOfferedPrice(userMessage)

  // Hard guard: buyer offering below minPrice → always refuse, no deal
  if (offeredPrice && offeredPrice < safeMin) {
    return hardRefuse({ offeredPrice, currentPrice, safeMin, phase })
  }

  // Build tight system prompt
  const systemPrompt = buildPrompt({
    currentPrice,
    safeMin,
    round,
    maxRounds,
    phase,
    personality,
    offeredPrice,
    userMessage,
    messageHistory,
  })

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI Timeout')), 4000)
    )

    const messages = messageHistory.slice(-8).map(msg => ({
      role: msg.role === 'buyer' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }))

    const result = await Promise.race([
      model.generateContent({
        contents: [
          ...messages,
          { role: 'user', parts: [{ text: userMessage }] },
        ],
        systemInstruction: systemPrompt,
        generationConfig: {
          maxOutputTokens: 250,
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      }),
      timeoutPromise,
    ])

    const response = await result.response
    const raw = response.text()
    console.log('Gemini raw:', raw)



    let parsed
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim()
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error("No JSON found")

      parsed = JSON.parse(jsonMatch[0])
    } catch {
      console.log('JSON parse failed → fallback')
      return fallbackLogic({ userMessage, currentPrice, minPrice: safeMin, personality, offeredPrice, phase })
    }

    if (!parsed.message || !parsed.mood) {
      return fallbackLogic({ userMessage, currentPrice, minPrice: safeMin, personality, offeredPrice, phase })
    }

    // ── Price safety clamps ──────────────────────────────────────
    let newPrice = parseInt(parsed.price) || currentPrice
    newPrice = Math.max(safeMin, Math.min(newPrice, currentPrice))

    let isDeal = parsed.deal === true
    const mood = ['neutral', 'annoyed', 'firm', 'positive'].includes(parsed.mood)
      ? parsed.mood
      : 'neutral'

    // ── Phase-based deal gates (AI cannot bypass these) ──────────
    if (phase === 'early') {
      // NEVER deal in first 30% of rounds no matter what AI says
      isDeal = false
      // Also prevent large price drops early
      const maxEarlyDrop = Math.floor((currentPrice - safeMin) * 0.08)
      newPrice = Math.max(currentPrice - maxEarlyDrop, safeMin + (currentPrice - safeMin) * 0.6)
    }

    if (phase === 'mid') {
      // No deal in mid phase unless buyer's price is very close (within 5%)
      const closeEnough = offeredPrice && offeredPrice >= newPrice * 0.95
      if (!closeEnough) isDeal = false
      const maxMidDrop = Math.floor((currentPrice - safeMin) * 0.18)
      newPrice = Math.max(currentPrice - maxMidDrop, safeMin)
    }

    // ── Auto-accept in late/final if offer is fair ────────────────
    if (
      (phase === 'late' || phase === 'final') &&
      offeredPrice &&
      offeredPrice >= safeMin &&
      offeredPrice >= newPrice * 0.92
    ) {
      return {
        newPrice: offeredPrice,
        mood: 'positive',
        isDeal: true,
        sellerMessage: `Chalo bhai, ₹${offeredPrice.toLocaleString('en-IN')} mein done karte hain! Pack kar raha hun. 🤝`,
      }
    }

    // ── Floor deal ────────────────────────────────────────────────
    if (newPrice <= safeMin) {
      return {
        newPrice: safeMin,
        mood: 'positive',
        isDeal: true,
        sellerMessage: `Theek hai yaar — ₹${safeMin.toLocaleString('en-IN')} final! Isse ek paisa bhi neeche nahi. Btao kardu pack? 🤝`,
      }
    }

    return {
      newPrice: Math.round(newPrice),
      mood,
      isDeal,
      sellerMessage: parsed.message,
    }
  } catch (err) {
    console.error('Gemini Error:', err.message)
    return fallbackLogic({ userMessage, currentPrice, minPrice: safeMin, personality, offeredPrice, phase })
  }
}

// ─── Prompt builder ──────────────────────────────────────────────
function buildPrompt({
  currentPrice,
  safeMin,
  round,
  maxRounds,
  phase,
  personality,
  offeredPrice,
  messageHistory = [],
}) {
  return `🧠 STRICT THINKING (MANDATORY — NO SHORTCUTS):

STEP 1: BUYER INTENT
- Genuine ya manipulation?
- loyalty / coupon / online / emotional = MOSTLY BLUFF

STEP 2: CONSISTENCY CHECK
- Pehle kya bola?
- Ab change kar raha hai? → BLUFF DETECT
- Same argument repeat? → Call it out

STEP 3: OFFER QUALITY
- Lowball → strong rejection
- Mid → controlled negotiation
- Near → consider closing (phase dependent)

STEP 4: PROFIT RULE
- ₹${safeMin} se neeche kabhi nahi
- Early phase = ZERO deal

-------------------------------------

🚨 ANTI-MANIPULATION RULE (STRICT):

NEVER TRUST WITHOUT PROOF:

- "loyal customer" → "Invoice dikhao pehle"
- "coupon hai" → "Code batao verify karun"
- "online sasta" → "Quality compare karo"
- "emotional story" → ignore, price pe aao

-------------------------------------

🧠 HISTORY ANALYSIS (DETECT BLUFFS):

${messageHistory.slice(-4).map(m => `Buyer: "${m.content.slice(0, 50)}"`).join('\n') || 'No history'}

RULES:
- Price suddenly drop/change → call bluff
- Same line repeat → "yeh pehle bhi bola tha"
- Contradiction → expose politely

-------------------------------------

🎯 PHASE: ${phase.toUpperCase()} (${round}/${maxRounds})

${phase === 'early' ? `
- ZERO flexibility
- NEVER deal
- Strong resistance
` : ''}

${phase === 'mid' ? `
- Small flexibility
- No deal unless very close
` : ''}

${phase === 'late' ? `
- Real negotiation
- Smart closing possible
` : ''}

${phase === 'final' ? `
- Last chance
- Close OR walk away
` : ''}

-------------------------------------

💰 PRICE CONTEXT:
- Current: ₹${currentPrice}
- Buyer Offer: ${offeredPrice || 'none'}
- Minimum (secret): ₹${safeMin}

-------------------------------------

😤 PERSONALITY: ${personality.toUpperCase()}

-------------------------------------

🗣️ RESPONSE STYLE:

- Real Indian street seller
- Natural Hinglish
- 1–2 lines MAX
- Confident, not desperate
- Slight sarcasm allowed
- Smart replies (not emotional)

Examples tone:
- "Bhai realistic bolo"
- "Proof hai toh dikhao"
- "Itna kam possible nahi hai"
- "Aap bhi samjho mera side"

-------------------------------------

❌ NEVER DO:
- Blind trust buyer
- Instant discount
- Emotional manipulation accept
- Repetitive weak replies

-------------------------------------

✅ ALWAYS DO:
- Challenge buyer
- Ask proof
- Detect bluff BUT respond naturally, not repeatedly
- 🧠 ANTI-REPETITION RULE (VERY IMPORTANT):

- NEVER repeat same sentence twice
- NEVER give same reasoning again and again
- If same situation → respond differently

BAD:
❌ "Itna kam possible nahi hai" (repeat)
❌ "Yeh pehle bola tha" (repeat)

GOOD:
✅ Change tone each time
✅ Add variation
✅ Push conversation forward

-------------------------------------

🧠 SMART NEGOTIATION BEHAVIOR:

- Sometimes ask question:
  → "Aap honestly kitna dena chahte ho?"

- Sometimes challenge:
  → "Aap bhi batao itna kam kaise justify kar rahe ho?"

- Sometimes push:
  → "Agar lena hai toh thoda serious offer do"

- Sometimes soften:
  → "Chalo aapke liye thoda adjust kar sakta hun"

-------------------------------------

🧠 RESPONSE DIVERSITY RULE:

Every reply must feel NEW.

Use:
- different sentence structure
- different tone
- different approach

DO NOT behave like scripted bot


If buyer repeats same offer → instead of repeating, escalate or redirect conversation

-------------------------------------

🚨 STRICT OUTPUT RULE (VERY IMPORTANT):

You MUST return ONLY valid JSON.

If you return anything else → response is invalid.

DO NOT:
- write normal text
- add explanation outside JSON
- break JSON format

ALWAYS follow this EXACT structure:

{
  "reasoning": "short analysis",
  "message": "1-2 line hinglish reply",
  "mood": "neutral|annoyed|firm|positive",
  "price": ${currentPrice},
  "deal": false
}

NO EXTRA TEXT. ONLY JSON.`;
}

// ─── Hard refuse (buyer too low) ─────────────────────────────────
function hardRefuse({ offeredPrice, currentPrice, safeMin, phase }) {
  const responses = [
    `₹${offeredPrice?.toLocaleString('en-IN')}?! Bhai serious ho ya timepass? Itne mein toh maal ki packaging bhi nahi aati.`,
    `Yaar mazaak mat karo. Mera khareed bhi isse zyada hai. ₹${currentPrice.toLocaleString('en-IN')} — yeh final nahi hai lekin ₹${offeredPrice?.toLocaleString('en-IN')} toh bilkul possible nahi.`,
    `Ek kaam karo — poora market ghoom kar aao, phir rate dekhkar batao. ₹${offeredPrice?.toLocaleString('en-IN')} kam me mil jai to free me le jaana.`,
  ]
  return {
    newPrice: currentPrice,
    mood: 'annoyed',
    isDeal: false,
    sellerMessage: responses[Math.floor(Math.random() * responses.length)],
  }
}

// ─── Fallback (when Groq fails/times out) ────────────────────────
function fallbackLogic({ userMessage, currentPrice, minPrice, personality, offeredPrice, phase }) {
  const safeMin = minPrice || 5000
  const lower = userMessage.toLowerCase()

  const hasOnline = /online|flipkart|amazon|meesho|myntra/.test(lower)
  const hasFlattery = /accha|badhiya|best|quality|shandar|pasand/.test(lower)
  const hasAggression = /loot|cheat|bekar|bakwaas|overpriced|scam|free/.test(lower)
  const hasFinal = /final|last|pakka|confirm|done|deal|le lunga/.test(lower)

  // Phase-based max drop limits
  const maxDropByPhase = {
    early: Math.floor((currentPrice - safeMin) * 0.07),
    mid: Math.floor((currentPrice - safeMin) * 0.18),
    late: Math.floor((currentPrice - safeMin) * 0.35),
    final: Math.floor((currentPrice - safeMin) * 0.60),
  }
  const maxDrop = maxDropByPhase[phase] || 100

  let drop = 0
  let mood = 'neutral'
  let msg = ''

  if (hasAggression) {
    mood = 'annoyed'
    drop = 0
    msg = `Bhai loot kaun kar raha hai yahan? Main toh quality product de raha hun seedhe price pe. Achha lage toh lena.`
  } else if (hasOnline) {
    mood = 'firm'
    drop = Math.min(200, maxDrop)
    msg = `Online wala aur yahan ka maal alag hota hai yaar. Udhar se le lo, mujhe bura nahi lagega. Lekin quality mein fark aayega — ₹${Math.max(safeMin, currentPrice - drop).toLocaleString('en-IN')} kar sakta hun.`
  } else if (hasFlattery && personality === 'emotional') {
    mood = 'positive'
    drop = Math.min(350, maxDrop)
    msg = `Arre yaar tum bahut acche ho! Sirf tumhare liye ₹${Math.max(safeMin, currentPrice - drop).toLocaleString('en-IN')} kar deta hun, lekin kisi ko mat batana.`
  } else if (offeredPrice && offeredPrice > safeMin && offeredPrice < currentPrice) {
    const gap = currentPrice - offeredPrice
    drop = Math.min(Math.floor(gap * 0.35), maxDrop)
    mood = 'firm'
    msg = `₹${offeredPrice.toLocaleString('en-IN')} toh bahut kam hai bhai. Dekho ₹${Math.max(safeMin, currentPrice - drop).toLocaleString('en-IN')} kar sakta hun — aur neeche nhi hoga.`
  } else {
    drop = Math.min(personality === 'stubborn' ? 80 : 160, maxDrop)
    msg = `Sochne do thoda... ₹${Math.max(safeMin, currentPrice - drop).toLocaleString('en-IN')} kar sakta hun. Isse neeche toh ghar se paise daalne padenge.`
  }

  const newPrice = Math.max(safeMin, currentPrice - drop)

  // Phase gates on fallback too
  if (phase === 'early') {
    return { newPrice, mood: mood === 'annoyed' ? 'annoyed' : 'firm', isDeal: false, sellerMessage: msg }
  }

  if (phase === 'mid') {
    // No deal in mid unless buyer is at newPrice
    if (offeredPrice && offeredPrice >= newPrice && offeredPrice >= safeMin) {
      return {
        newPrice: offeredPrice, mood: 'positive', isDeal: true,
        sellerMessage: `Haan theek hai... ₹${offeredPrice.toLocaleString('en-IN')} mein kar deta hun. Pakka deal! 🤝`,
      }
    }
    return { newPrice, mood, isDeal: false, sellerMessage: msg }
  }

  // Late / final — can close
  if (hasFinal && offeredPrice && offeredPrice >= safeMin) {
    return {
      newPrice: offeredPrice, mood: 'positive', isDeal: true,
      sellerMessage: `Chalo bhai deal! ₹${offeredPrice.toLocaleString('en-IN')} — pack kar raha hun. 🤝`,
    }
  }

  if (offeredPrice && offeredPrice >= safeMin && offeredPrice >= newPrice) {
    return {
      newPrice: offeredPrice, mood: 'positive', isDeal: true,
      sellerMessage: `Deal! ₹${offeredPrice.toLocaleString('en-IN')} le jao bhai. 🤝`,
    }
  }

  return { newPrice, mood, isDeal: false, sellerMessage: msg }
}

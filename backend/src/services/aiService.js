import dotenv from 'dotenv'
dotenv.config()

import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
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
  const matches = text.match(/[₹]?\s*(\d[\d,]*)/g)
  if (!matches) return null
  const nums = matches
    .map(m => parseInt(m.replace(/[₹,\s]/g, '')))
    .filter(n => n >= 50 && n <= 500000)
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

    const messages = [
      { role: 'system', content: systemPrompt },
      ...messageHistory.slice(-8).map(msg => ({
        role: msg.role === 'buyer' ? 'user' : 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ]

    const response = await Promise.race([
      groq.chat.completions.create({
        model: process.env.GROQ_MODEL || 'mixtral-8x7b-32768',
        messages,
        max_tokens: 220,
        temperature: 0.4,
      }),
      timeoutPromise,
    ])

    const raw = response.choices[0].message.content
    console.log('Groq raw:', raw)

    let parsed
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(cleaned)
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
    console.error('Groq Error:', err.message)
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
- Detect bluff
- Stay in control

-------------------------------------

📤 STRICT JSON OUTPUT:

{
  "reasoning": "short: manipulation? bluff? logic?",
  "message": "realistic hinglish reply",
  "mood": "neutral|annoyed|firm|positive",
  "price": ${safeMin}-${currentPrice},
  "deal": ${phase === 'late' || phase === 'final' ? 'true/false' : 'false'}
}

NO EXTRA TEXT. ONLY JSON.`;
}

// ─── Hard refuse (buyer too low) ─────────────────────────────────
function hardRefuse({ offeredPrice, currentPrice, safeMin, phase }) {
  const responses = [
    `₹${offeredPrice?.toLocaleString('en-IN')}?! Bhai serious ho ya timepass? Itne mein toh maal ki packaging bhi nahi aati.`,
    `Yaar mazaak mat karo. Mera cost price bhi isse zyada hai. ₹${currentPrice.toLocaleString('en-IN')} — yeh final nahi hai but ₹${offeredPrice?.toLocaleString('en-IN')} toh bilkul possible nahi.`,
    `Ek kaam karo — ghar se khaana khaake aao, phir sahi price batao. ₹${offeredPrice?.toLocaleString('en-IN')} nahi hoga bhai, kabhi nahi.`,
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

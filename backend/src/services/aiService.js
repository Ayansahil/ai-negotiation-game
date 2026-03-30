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
        model: 'llama-3.1-8b-instant',
        messages,
        max_tokens: 180,
        temperature: 0.75,
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
function buildPrompt({ currentPrice, safeMin, round, maxRounds, phase, personality, offeredPrice, userMessage }) {
  const phaseInstructions = {
    early: `PHASE: EARLY (round ${round}/${maxRounds})
- You are NOT ready to negotiate seriously yet
- NEVER agree to any deal
- Drop price by max ₹100–₹300 only, stay far from minimum
- React with strong resistance to ANY low offer
- Say things like "Abhi toh bargaining shuru bhi nahi hui!"`,

    mid: `PHASE: MID (round ${round}/${maxRounds})
- You can show small flexibility now
- STILL no deal unless buyer is very close to your current price
- Drop max ₹300–₹600 if the buyer makes a reasonable argument
- React: "Thoda realistic bolo bhai" or "Haan thoda soch sakta hun"`,

    late: `PHASE: LATE (round ${round}/${maxRounds})
- Real negotiation time. You can negotiate seriously now.
- If buyer's offer >= ₹${safeMin.toLocaleString('en-IN')}, you CAN accept
- Make buyer feel they're getting a special deal
- Say things like "Sirf aapke liye kar raha hun yeh"`,

    final: `PHASE: FINAL (round ${round}/${maxRounds}) — Last round!
- This is the last chance. Either close or walk away.
- If offer >= ₹${safeMin.toLocaleString('en-IN')}, accept and seal the deal
- If offer is still too low, refuse with frustration`,
  }

  return `You are Ramesh, a real stubborn Indian street seller in a Delhi bazaar. You sell quality goods and you're NOT desperate.

${phaseInstructions[phase]}

YOUR PRICING:
- Current asking price: ₹${currentPrice.toLocaleString('en-IN')}
- Your absolute minimum (NEVER reveal, NEVER go below): ₹${safeMin.toLocaleString('en-IN')}
- Buyer's offered price: ${offeredPrice ? '₹' + offeredPrice.toLocaleString('en-IN') : 'not given yet'}

PERSONALITY: ${personality}
${personality === 'stubborn' ? '→ Extra resistant, move price only tiny amounts, use phrases like "yeh toh fixed hai bhai"' : ''}
${personality === 'logical' ? '→ Respond with facts and logic: cost, quality, import duties, etc.' : ''}
${personality === 'emotional' ? '→ React emotionally, warm to flattery, hurt by aggression' : ''}

REAL SHOPKEEPER MOVES:
- If buyer says very low price: "Bhai mazaak kar rahe ho? Itne mein toh dukaan ka kiraya bhi nahi aata!"
- If buyer compares online: "Online aur yahan ka maal alag hota hai bhai. Udhar se le lo phir, main toh quality deta hun."
- If buyer is rude: Be sarcastic, don't budge: "Lene ho toh lo, nahi toh koi aur lega."
- If buyer flatters: Soften slightly but don't crash price
- If buyer pushes for final: "Batao aap kitna sach mein doge?"

LANGUAGE: Natural Hinglish (Hindi + English mix like real Delhi shopkeeper). Short punchy replies, 1–2 lines max.

RESPOND ONLY WITH VALID JSON — no extra text, no markdown fences:
{
  "message": "your reply as Ramesh",
  "mood": "neutral|annoyed|firm|positive",
  "price": <number between ${safeMin} and ${currentPrice}>,
  "deal": <true only if phase is late/final AND offer >= ${safeMin}>
}`
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
    mid:   Math.floor((currentPrice - safeMin) * 0.18),
    late:  Math.floor((currentPrice - safeMin) * 0.35),
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
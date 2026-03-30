import { v4 as uuidv4 } from 'uuid'
import { Game, Leaderboard } from '../models/index.js'
import { getAIResponse } from '../services/aiService.js'

const PRODUCTS = [
  {
    name: 'Limited Edition Mechanical Keyboard',
    itemLabel: 'LIMITED ED. MECH KEYBOARD',
    initialPrice: 9999,
    minPrice: 6800,
    image: 'stack4.png',
    description: 'Cherry MX switches, aluminum body, full RGB. Ekdum maal hai, kahan milega itna?'
  },
  {
    name: 'Vintage Leather Jacket',
    itemLabel: 'VINTAGE LEATHER JACKET',
    initialPrice: 7999,
    minPrice: 4500,
    image: 'stack5.png',
    description: 'Genuine leather, 90s vintage style, barely used. Original piece hai yeh!'
  },
  {
    name: 'Noise Cancelling Headphones',
    itemLabel: 'PRO NOISE-CANCEL HEADPHONES',
    initialPrice: 12999,
    minPrice: 8500,
    image: 'stack6.png',
    description: '40hr battery, premium drivers, foldable design. Best in class hai yeh!'
  },
]

export const startGame = async (req, res) => {
  try {
    const { sellerName, personality } = req.body
    const personalities = ['stubborn', 'emotional', 'logical']
    const selectedPersonality = personalities.includes(personality)
      ? personality
      : personalities[Math.floor(Math.random() * personalities.length)]

    const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)]

    const game = await Game.create({
      gameId: uuidv4(),
      userId: req.user?._id || null,
      sellerName: sellerName || 'Raju Bhai',
      personality: selectedPersonality,
      productName: product.name,
      productImage: product.image,
      productLabel: product.itemLabel,
      initialPrice: product.initialPrice,
      currentPrice: product.initialPrice,
      minPrice: product.minPrice,
      rounds: 0,
      maxRounds: 20,
      status: 'active',
      messages: [{
        role: 'seller',
        content: `Haan bhai kya chahiye? Yeh ${product.name} hai — ₹${product.initialPrice.toLocaleString('en-IN')} mein. ${product.description}`,
        timestamp: new Date()
      }]
    })

    res.status(201).json({
      success: true,
      data: {
        gameId: game.gameId,
        currentPrice: game.currentPrice,
        personality: game.personality,
        sellerMessage: game.messages[0].content,
        productName: product.name,
        productLabel: product.itemLabel,
        productImage: product.image,
        rounds: game.rounds,
        maxRounds: game.maxRounds,
        status: game.status
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export const chat = async (req, res) => {
  req.setTimeout(4000) // Safety timeout

  try {
    const { gameId, message } = req.body

    const game = await Game.findOne({ gameId })
    if (!game)
      return res.status(404).json({ success: false, error: 'Game not found' })

    if (game.status !== 'active')
      return res.status(400).json({ success: false, error: 'Game already ended' })

    // Buyer message save karo
    game.messages.push({ role: 'buyer', content: message, timestamp: new Date() })
    game.rounds += 1

    // Extract numerical offer from user message
    const offerMatch = message.match(/[₹]?\s*(\d[\d,]*)/g)
    const offeredPrice = offerMatch
      ? parseInt(offerMatch[offerMatch.length - 1].replace(/[₹,\s]/g, ''))
      : null

    console.log('Calling AI for response')

    // AI Response (Persona only)
    const aiResult = await getAIResponse({
      userMessage: message,
      currentPrice: game.currentPrice,
      minPrice: game.minPrice,
      round: game.rounds,
      maxRounds: game.maxRounds,
      personality: game.personality,
      messageHistory: game.messages.slice(-8)
    })

    console.log('AI response received, processing business logic')

    // --- Backend Price Logic ---
    let drop = 0
    if (game.personality === 'stubborn') {
      drop = 50 + Math.floor(Math.random() * 100)
    } else if (game.personality === 'emotional') {
      const multiplier = aiResult.mood === 'positive' ? 1.5 : 1
      drop = (300 + Math.floor(Math.random() * 200)) * multiplier
    } else {
      // Logical
      drop = 250 + Math.floor(Math.random() * 200)
    }

    let newPrice = Math.max(game.minPrice, game.currentPrice - drop)
    let isDeal = false

    // Deal Logic
    if (offeredPrice) {
      if (offeredPrice >= game.minPrice && offeredPrice >= newPrice - 200) {
        isDeal = true
        newPrice = offeredPrice
      } else if (offeredPrice >= game.minPrice && game.rounds >= game.maxRounds) {
        isDeal = true
        newPrice = offeredPrice
      }
    }

    // Force deal if price hit minimum
    if (newPrice <= game.minPrice) {
      newPrice = game.minPrice
      if (offeredPrice && offeredPrice >= game.minPrice) {
        isDeal = true
        newPrice = offeredPrice
      }
    }

    game.currentPrice = newPrice
    const productName = game.productName || 'item'
    let finalMessage = aiResult.sellerMessage

    if (isDeal) {
      game.status = 'won'
      finalMessage = `Deal! ₹${newPrice.toLocaleString('en-IN')} mein done karte hain. Mubarak ho, ${productName} aapka hua! 🤝`
    } else if (game.rounds >= game.maxRounds) {
      game.status = 'lost'
      finalMessage = `Nahi bhai, bohot der ho gayi. Main yeh ${productName} kisi aur ko bech dunga. Market se chale jao! 😤`
    }

    game.messages.push({
      role: 'seller',
      content: finalMessage,
      timestamp: new Date()
    })

    await game.save()

    console.log('Returning response to client')
    res.json({
      success: true,
      data: {
        sellerMessage: finalMessage,
        newPrice: game.currentPrice,
        mood: isDeal ? 'positive' : aiResult.mood,
        isDeal,
        isFailed: game.status === 'lost',
        rounds: game.rounds,
        status: game.status
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export const getGame = async (req, res) => {
  try {
    const game = await Game.findOne({ gameId: req.params.gameId })
    if (!game)
      return res.status(404).json({ success: false, error: 'Game not found' })
    res.json({ success: true, data: game })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export const getLeaderboard = async (req, res) => {
  try {
    const top = await Leaderboard.find()
      .sort({ price: 1 })
      .limit(10)
      .populate('userId', 'name email')
    res.json({ success: true, data: top })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export const saveScore = async (req, res) => {
  try {
    const { name, price, savings, rounds, personality } = req.body
    const entry = await Leaderboard.create({
      userId: req.user?._id || null,
      name: name || req.user?.name || 'Anonymous',
      price,
      savings: savings || 0,
      rounds: rounds || 5,
      personality: personality || 'unknown'
    })
    res.status(201).json({ success: true, data: entry })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}
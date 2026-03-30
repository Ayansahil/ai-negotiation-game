import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import connectDB from './config/database.js'
import gameRoutes from './routes/gameRoutes.js'
import authRoutes from './routes/authRoutes.js'

const app = express()
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://ai-negotiation-game-iota.vercel.app'
    ]

    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.json({
    message: 'AI Negotiation Game API',
    version: '1.0.0',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me',
      startGame: 'POST /api/game/start',
      chat: 'POST /api/game/chat',
      getGame: 'GET /api/game/:gameId',
      leaderboard: 'GET /api/game/leaderboard/top',
      saveScore: 'POST /api/game/leaderboard/save',
    }
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/game', gameRoutes)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, error: 'Something went wrong!' })
})

export default app
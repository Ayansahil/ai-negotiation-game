import express from 'express'
import { startGame, chat, getGame, getLeaderboard, saveScore } from '../controllers/gameController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/start', protect, startGame)   // auth required
router.post('/chat', chat)                   // no auth — game in progress
router.get('/:gameId', getGame)
router.get('/leaderboard/top', getLeaderboard)
router.post('/leaderboard/save', protect, saveScore)

export default router
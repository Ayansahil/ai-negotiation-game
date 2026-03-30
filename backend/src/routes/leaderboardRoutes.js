import express from 'express'
import { getTopScores, saveScore } from '../controllers/leaderboardController.js'

const router = express.Router()

router.get('/top', getTopScores)
router.post('/save', saveScore)

export default router
import express from 'express';
const router = express.Router();
import {startGame, chat, getGame, getLeaderboard} from '../controllers/gameController.js';

router.post('/start', startGame);
router.post('/chat', chat);
router.get('/:gameId', getGame);
router.get('/leaderboard/top', getLeaderboard);

export default router;

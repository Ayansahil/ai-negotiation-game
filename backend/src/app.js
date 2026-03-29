import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import gameRoutes from './routes/gameRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get('/', (req, res) => {
  res.json({
    message: 'AI Negotiation Game API',
    version: '1.0.0',
    endpoints: {
      startGame: 'POST /api/game/start',
      chat: 'POST /api/game/chat',
      getGame: 'GET /api/game/:gameId',
      leaderboard: 'GET /api/game/leaderboard/top'
    }
  });
});

app.use('/api/game', gameRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

export default app;
import mongoose from 'mongoose';
import 'dotenv/config';

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error('Missing MONGODB_URI environment variable');
}

mongoose.connect(mongoUri)
  .catch(err => console.error('MongoDB connection error:', err));

const gameSchema = new mongoose.Schema({
  current_price: { type: Number, default: 1000 },
  rounds: { type: Number, default: 0 },
  messages: { type: Array, default: [] },
  status: { type: String, default: 'ongoing' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const leaderboardSchema = new mongoose.Schema({
  username: { type: String, required: true },
  final_price: { type: Number, required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

const Game = mongoose.model('Game', gameSchema);
const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

export { Game, Leaderboard };

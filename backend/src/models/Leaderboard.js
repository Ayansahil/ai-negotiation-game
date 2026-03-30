import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    savings: {
      type: Number,
      default: 0,
    },
    rounds: {
      type: Number,
      default: 0,
    },
    personality: {
      type: String,
      default: 'unknown'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true },
);

export default mongoose.model("Leaderboard", leaderboardSchema);

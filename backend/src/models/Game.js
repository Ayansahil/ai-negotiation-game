import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "ai"],
    required: true
  },
  content: {
    type: String,
    required: true
  }
});

const gameSchema = new mongoose.Schema(
  {
    currentPrice: {
      type: Number,
      default: 1000
    },

    rounds: {
      type: Number,
      default: 0
    },

    messages: [messageSchema],

    status: {
      type: String,
      enum: ["ongoing", "deal", "failed"],
      default: "ongoing"
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Game", gameSchema);
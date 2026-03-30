import mongoose from 'mongoose'

const gameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },

  sellerName: {
    type: String,
    default: 'AI Seller'
  },

  jsproductName: { type: String, default: 'Limited Edition Mechanical Keyboard' },
  productName: { type: String, default: 'Limited Edition Mechanical Keyboard' },
  productImage: { type: String, default: 'keyboard.png' },
  productLabel: { type: String, default: 'LIMITED ED. MECH KEYBOARD' },

  personality:
  {
    type: String,
    enum: ['stubborn', 'emotional', 'logical'],
    default: 'stubborn'
  },

  initialPrice:
  {
    type: Number,
    default: 9999
  },

  currentPrice:
  {
    type: Number,
    default: 9999
  },

  minPrice:
  {
    type: Number,
    default: 6800
  },

  rounds:
  {
    type: Number,
    default: 0
  },

  maxRounds: {
    type: Number,
    default: 5
  },

  status: {
    type: String,
    enum: ['active', 'won', 'lost'],
    default: 'active'
  },

  messages: [{
    role: String, content: String, timestamp: Date
  }],
},

  { timestamps: true })

export default mongoose.model('Game', gameSchema)
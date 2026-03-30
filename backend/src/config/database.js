import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/negotiation-game')
    console.log('MongoDB connected ✅')
  } catch (err) {
    console.error('DB connection ❌:', err.message)
    process.exit(1)
  }
}

export default connectDB
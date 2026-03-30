import { User } from '../models/index.js'
import jwt from 'jsonwebtoken'

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'negotiation_secret_key', { expiresIn: '7d' })

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ success: false, error: 'All fields required' })

    const exists = await User.findOne({ email })
    if (exists)
      return res.status(400).json({ success: false, error: 'User already exists' })

    const user = await User.create({ name, email, password })
    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email }
    })
  } catch (err) {
    console.error('Registration Error:', err)
    
    // Better handling of Mongoose validation/duplicate errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, error: err.message })
    }
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'User already exists' })
    }
    
    res.status(500).json({ success: false, error: err.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ success: false, error: 'Email and password required' })

    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, error: 'Invalid credentials' })

    const token = generateToken(user._id)

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email }
    })
  } catch (err) {
    console.error('Login Error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json({ success: true, user })
  } catch (err) {
    console.error('getMe Error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
}
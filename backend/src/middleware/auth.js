import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null

    if (!token)
      return res.status(401).json({ success: false, error: 'Not authorized' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'negotiation_secret_key')
    req.user = await User.findById(decoded.id).select('-password')
    next()
  } catch {
    res.status(401).json({ success: false, error: 'Token invalid' })
  }
}
import { leaderboardStore } from '../config/database.js'

export const getTopScores = (req, res) => {
  const top = [...leaderboardStore]
    .sort((a, b) => a.price - b.price)
    .slice(0, 10)

  res.json({ success: true, data: top })
}

export const saveScore = (req, res) => {
  const { name, price } = req.body

  if (!name || !price) {
    return res.status(400).json({ success: false, error: 'Name and price required' })
  }

  const entry = { name, price: Number(price), createdAt: new Date() }
  leaderboardStore.push(entry)

  res.status(201).json({ success: true, data: entry })
}
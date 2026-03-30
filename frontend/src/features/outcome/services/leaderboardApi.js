const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const getToken = () => localStorage.getItem('token')

export const getLeaderboard = async () => {
  const res = await fetch(`${BASE}/game/leaderboard/top`)
  return res.json()
}

export const postScore = async ({ name, price, savings, rounds, personality }) => {
  const res = await fetch(`${BASE}/game/leaderboard/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({ name, price, savings, rounds, personality })
  })
  return res.json()
}
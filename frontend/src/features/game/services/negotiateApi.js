const BASE = import.meta.env.VITE_API_BASE_URL
const getToken = () => localStorage.getItem('token')

export const startGame = async ({ sellerName, personality }) => {
  const res = await fetch(`${BASE}/game/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({ sellerName, personality })
  })
  return res.json()
}

export const sendNegotiationOffer = async ({ gameId, userMessage, currentPrice, round, personality }) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 4000)

  try {
    const res = await fetch(`${BASE}/game/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, message: userMessage, currentPrice, round, personality }),
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return res.json()
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw error
  }
}
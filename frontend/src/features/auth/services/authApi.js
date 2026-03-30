const BASE = import.meta.env.VITE_API_BASE_URL

const getToken = () => localStorage.getItem('token')

export const loginUser = async ({ email, password }) => {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return res.json()
}

export const registerUser = async ({ name, email, password }) => {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  })
  return res.json()
}

export const getMe = async () => {
  const res = await fetch(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  return res.json()
}
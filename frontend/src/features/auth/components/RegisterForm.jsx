import { useState } from 'react'
import { registerUser } from '../services/authApi.js'

export default function RegisterForm({ onRegister, onGoLogin }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await registerUser(form)
      if (res.success) {
        localStorage.setItem('token', res.token)
        localStorage.setItem('user', JSON.stringify(res.user))
        onRegister()
      } else {
        setError(res.error || 'Registration failed')
      }
    } catch { setError('Server se connect nahi ho pa raha') }
    finally { setLoading(false) }
  }

  const fields = [
    { label: 'Member Name', key: 'name', type: 'text', placeholder: 'Enter your alias...' },
    { label: 'Comms Channel (Email)', key: 'email', type: 'email', placeholder: 'agent@negotiation.crew' },
    { label: 'Vault Key (Password)', key: 'password', type: 'password', placeholder: '••••••••' },
  ]

  return (
    <div className="w-full max-w-md relative">
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-secondary border-4 border-black rotate-12 z-0 shadow-comic-lg flex items-center justify-center">
        <span className="material-symbols-outlined text-[#ffdbd8] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
      </div>
      <div className="bg-surface border-4 border-black p-8 shadow-comic-lg relative z-10 font-body">
        <h2 className="font-bangers text-6xl text-[#EF4544] mb-6 tracking-wide text-center uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          JOIN THE CREW
        </h2>

        {error && (
          <div className="bg-[#a80619] border-4 border-black p-3 mb-4 font-bold text-white font-headline">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block font-headline text-sm font-extrabold uppercase tracking-tighter text-primary mb-2">
                {label}
              </label>
              <input type={type} value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full bg-[#2c2424] border-[3px] border-black p-4 focus:outline-none focus:-translate-x-[2px] focus:-translate-y-[2px] focus:shadow-[4px_4px_0px_0px_#f59e0b] transition-all placeholder:text-[#4e4646] font-bold text-white font-body"
              />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-[#472a00] font-bangers text-3xl py-4 border-4 border-black shadow-comic-lg hover:scale-105 active:translate-x-0 active:shadow-none transition-all uppercase tracking-widest disabled:opacity-50">
            {loading ? 'JOINING...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className="mt-6 text-center font-headline">
          <button onClick={onGoLogin}
            className="font-black text-primary hover:text-amber-300 uppercase tracking-widest text-xs">
            Already a Member? Login Here
          </button>
        </div>
      </div>
      <div className="absolute -bottom-4 -left-4 w-3/4 h-8 bg-accent border-4 border-black -rotate-1 -z-10" />
    </div>
  )
}
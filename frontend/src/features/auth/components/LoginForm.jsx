import { useState } from 'react'
import { loginUser } from '../services/authApi.js'

export default function LoginForm({ onLogin, onGoRegister }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await loginUser(form)
      if (res.success) {
        localStorage.setItem('token', res.token)
        localStorage.setItem('user', JSON.stringify(res.user))
        onLogin()
      } else {
        setError(res.error || 'Login failed')
      }
    } catch { setError('Server se connect nahi ho pa raha') }
    finally { setLoading(false) }
  }

  return (
    <div className="relative w-full max-w-lg">
      <div className="absolute inset-0 bg-secondary translate-x-2 translate-y-2 border-4 border-black rounded-lg -rotate-1" />
      <div className="relative bg-surface border-4 border-black p-8 rounded-lg shadow-comic-lg z-10">
        <h2 className="font-bangers text-6xl text-primary tracking-widest uppercase leading-none drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] -rotate-2 inline-block mb-8">
          LOGIN TO THE BAZAAR
        </h2>

        {error && (
          <div className="bg-[#a80619] border-4 border-black p-3 mb-4 font-bold text-white font-headline">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-primary mb-2 font-headline">Email</label>
            <input type="email" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="agent@negotiation.crew"
              className="w-full bg-[#2c2424] border-[3px] border-black p-4 font-bold text-white focus:outline-none focus:border-primary focus:-translate-y-1 transition-transform placeholder:text-[#4e4646] font-body"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-primary mb-2 font-headline">Password</label>
            <input type="password" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              className="w-full bg-[#2c2424] border-[3px] border-black p-4 font-bold text-white focus:outline-none focus:border-primary focus:-translate-y-1 transition-transform placeholder:text-[#4e4646] font-body"
            />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-primary border-[4px] border-black py-4 font-bangers text-3xl text-black tracking-wider hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 uppercase">
            {loading ? 'ENTERING...' : 'ENTER THE GAME'}
          </button>
        </form>

        <div className="mt-8 text-center font-headline">
          <button onClick={onGoRegister}
            className="font-black text-sm uppercase text-primary border-b-2 border-primary italic">
            Need an Account? Register Here
          </button>
        </div>
      </div>
    </div>
  )
}
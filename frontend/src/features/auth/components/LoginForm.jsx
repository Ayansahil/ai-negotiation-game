import { useState } from 'react'

export default function LoginForm({ onLogin, onGoRegister }) {
  const [form, setForm] = useState({ username: '', password: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Backend ready hone pe API call yahan
    onLogin()
  }

  return (
    <div className="relative w-full max-w-lg">
      {/* Offset shadow panel */}
      <div className="absolute inset-0 bg-[#ff716a] translate-x-2 translate-y-2 border-4 border-black rounded-lg -rotate-1" />

      <div className="relative bg-[#1f1818] border-4 border-black p-8 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-10">
        <div className="mb-8 text-center">
          <h2 className="font-bangers text-6xl text-[#ffad3a] tracking-widest uppercase leading-none drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] -rotate-2 inline-block">
            LOGIN TO THE BAZAAR
          </h2>
          <p className="mt-4 text-[#7c7373] font-bold uppercase tracking-tight text-sm">
            Haggle your way to the top. The crew is waiting.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-[#ffad3a] mb-2 ml-1">
              Username
            </label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              placeholder="NEGOTIATOR_NAME"
              className="w-full bg-[#2c2424] border-[3px] border-black p-4 font-bold text-white focus:outline-none focus:border-[#ffad3a] focus:-translate-y-1 focus:-translate-x-1 transition-transform placeholder:text-[#4e4646]"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-[#ffad3a] mb-2 ml-1">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              className="w-full bg-[#2c2424] border-[3px] border-black p-4 font-bold text-white focus:outline-none focus:border-[#ffad3a] focus:-translate-y-1 focus:-translate-x-1 transition-transform placeholder:text-[#4e4646]"
            />
          </div>
          <div className="pt-4">
            <button type="submit"
              className="w-full bg-[#ffad3a] border-4 border-black py-4 px-8 rounded-md hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all">
              <span className="font-bangers text-3xl text-black tracking-wider">ENTER THE GAME</span>
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <button onClick={onGoRegister}
            className="font-black text-sm uppercase tracking-tighter text-[#ffad3a] border-b-2 border-[#ffad3a] hover:text-[#ff716a] hover:border-[#ff716a] transition-colors italic">
            Need an Account? Register Here
          </button>
        </div>
      </div>
    </div>
  )
}
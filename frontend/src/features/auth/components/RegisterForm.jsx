import { useState } from 'react'

export default function RegisterForm({ onRegister, onGoLogin }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Backend API call yahan
    onRegister()
  }

  return (
    <div className="w-full max-w-md relative">
      {/* Rocket decoration */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#a80619] border-4 border-black rotate-12 z-0 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
        <span className="material-symbols-outlined text-[#ffdbd8] text-4xl">rocket_launch</span>
      </div>

      <div className="bg-[#1f1818] border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative z-10">
        <h2 className="font-bangers text-6xl text-[#ef4444] mb-8 tracking-wide text-center uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          JOIN THE CREW
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            { label: 'Member Name', key: 'name', type: 'text', placeholder: 'Enter your alias...' },
            { label: 'Comms Channel (Email)', key: 'email', type: 'email', placeholder: 'agent@negotiation.crew' },
            { label: 'Vault Key (Password)', key: 'password', type: 'password', placeholder: '••••••••' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block font-label text-sm font-extrabold uppercase tracking-tighter text-[#ffad3a] mb-2">
                {label}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full bg-[#2c2424] border-[3px] border-black p-4 focus:outline-none focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[4px_4px_0px_0px_rgba(255,173,58,1)] transition-all placeholder:text-[#4e4646] font-bold text-white"
              />
            </div>
          ))}

          <button type="submit"
            className="w-full bg-[#ffad3a] text-[#472a00] font-bangers text-3xl py-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:scale-105 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all uppercase tracking-widest mt-4">
            CREATE ACCOUNT
          </button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={onGoLogin}
            className="font-label font-black text-[#ffad3a] hover:text-amber-300 transition-colors uppercase tracking-widest text-xs">
            Already a Member? Login Here
          </button>
        </div>
      </div>

      <div className="absolute -bottom-4 -left-4 w-3/4 h-8 bg-[#85fff5] border-4 border-black -rotate-1 -z-10" />
    </div>
  )
}
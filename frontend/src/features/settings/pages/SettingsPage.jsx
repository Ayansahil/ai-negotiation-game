export default function SettingsPage({ onBack, onLogout }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <div className="min-h-screen bg-[#0f0a0a] text-white font-body p-8 pt-24">
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#f59e0b] border-b-4 border-black">
        <button onClick={onBack} className="font-headline font-black text-black uppercase text-xl">
          ← BACK
        </button>
        <h1 className="font-headline font-black text-black text-2xl uppercase italic">SETTINGS</h1>
        <div />
      </header>

      <div className="max-w-md mx-auto mt-8 space-y-6">
        {/* Profile card */}
        <div className="bg-[#1f1818] border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="font-bangers text-3xl text-[#ffad3a] mb-4 uppercase">Your Profile</h2>
          <p className="font-bold text-white">Name: <span className="text-[#ffad3a]">{user.name || 'Anonymous'}</span></p>
          <p className="font-bold text-white mt-2">Email: <span className="text-[#ffad3a]">{user.email || 'N/A'}</span></p>
        </div>

        {/* Logout button */}
        <button
          onClick={onLogout}
          className="w-full bg-[#a80619] border-4 border-black py-4 font-bangers text-2xl text-white uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          LOGOUT
        </button>
      </div>
    </div>
  )
}

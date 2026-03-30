import Leaderboard from '../../outcome/components/Leaderboard'

export default function StatsPage({ onBack, onLogout }) {
  return (
    <div className="min-h-screen bg-[#0f0a0a] text-white p-8 flex flex-col items-center gap-8">
      <header className="w-full max-w-4xl flex justify-between items-center">
        <button 
          onClick={onBack}
          className="bg-[#f59e0b] text-black border-4 border-black px-4 py-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
        >
          ← BACK TO SHOP
        </button>
        <h1 className="font-bangers text-4xl tracking-widest text-[#f59e0b]">GLOBAL STATS</h1>
      </header>

      <main className="w-full flex justify-center">
        <Leaderboard />
      </main>
    </div>
  )
}

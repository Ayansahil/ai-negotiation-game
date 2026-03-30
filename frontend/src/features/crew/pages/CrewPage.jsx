export default function CrewPage({ onBack, onLogout }) {
  return (
    <div className="min-h-screen bg-[#0f0a0a] text-white p-8 flex flex-col items-center gap-12">
      <header className="w-full max-w-4xl flex justify-between items-center">
        <button 
          onClick={onBack}
          className="bg-[#ff716a] text-black border-4 border-black px-4 py-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
        >
          ← EXIT CREW CABIN
        </button>
        <h1 className="font-bangers text-4xl tracking-widest text-[#ff716a]">NEGOTIATION CREW</h1>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <div className="bg-[#1a1a2e] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black text-[#ff716a] mb-4 uppercase">THE MASTERMIND</h2>
          <p className="text-[#a0a0b8] font-body">An AI-driven negotiation expert designed to simulate realistic market haggling.</p>
        </div>
        <div className="bg-[#1a1a2e] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black text-[#ff716a] mb-4 uppercase">THE SELLERS</h2>
          <p className="text-[#a0a0b8] font-body">A cast of varied personalities: Stubborn, Emotional, and Logical shopkeepers.</p>
        </div>
      </main>
      
      <div className="mt-12 opacity-50 text-center uppercase tracking-widest font-black text-sm">
        More crew members joining soon...
      </div>
    </div>
  )
}

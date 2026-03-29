const moodEmoji = { neutral:'😐', positive:'😊', annoyed:'😤', angry:'😡' }

export default function StatsBar({ sellerName, currentPrice, roundsUsed, mood }) {
  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-20 bg-[#f59e0b] border-b-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-4">
        <div className="bg-black p-1 border-4 border-black">
          <span className="material-symbols-outlined text-[#ffad3a] text-2xl">menu</span>
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-black uppercase italic tracking-tighter text-black leading-none">
            NEGOTIATION PHASE
          </span>
          <div className="flex items-center gap-2">
            <span className="bg-[#a80619] text-[#ffdbd8] text-[10px] font-black px-2 py-0.5 border-2 border-black uppercase">
              SELLER
            </span>
            <span className="text-black font-bold text-sm">{sellerName}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <span className="font-bangers text-black text-sm tracking-widest leading-none">ASKING PRICE</span>
        <span className="font-bangers text-black text-4xl leading-none">₹{currentPrice.toLocaleString()}</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex gap-1.5">
          {[0,1,2,3,4].map(i => (
            <div key={i}
              className={`w-4 h-4 rounded-full border-2 border-black
                ${i < roundsUsed ? 'bg-[#ffad3a]' : 'bg-black/20'}`}
            />
          ))}
        </div>
        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-1 flex items-center justify-center w-12 h-12">
          <span className="text-3xl">{moodEmoji[mood] || '😐'}</span>
        </div>
      </div>
    </header>
  )
}
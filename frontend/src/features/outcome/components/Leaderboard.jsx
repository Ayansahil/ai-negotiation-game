const MOCK_SCORES = [
  { name: 'RajaRam_G', price: 6850 },
  { name: 'BargainKing', price: 7100 },
  { name: 'AyeshaN', price: 7400 },
  { name: 'PriceHunter', price: 7999 },
]
const medals = ['🥇','🥈','🥉']

export default function Leaderboard({ yourPrice }) {
  let rows = [...MOCK_SCORES]
  if (yourPrice) rows.push({ name: 'YOU', price: yourPrice, you: true })
  rows.sort((a, b) => a.price - b.price)

  return (
    <div className="w-full max-w-md bg-[#1a1a2e] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="bg-[#f59e0b] border-b-4 border-black px-6 py-3">
        <h2 className="font-bangers text-2xl text-black tracking-widest">TOP CLOSERS</h2>
      </div>
      {rows.slice(0, 5).map((r, i) => (
        <div key={i}
          className={`flex items-center gap-4 px-6 py-4 border-b-2 border-[#2a2a45]
            ${r.you ? 'bg-[#f59e0b22]' : ''}`}>
          <span className="text-xl w-8">{medals[i] || `#${i+1}`}</span>
          <span className={`flex-1 font-bold ${r.you ? 'text-[#f59e0b]' : 'text-white'}`}>{r.name}</span>
          <span className="font-bangers text-xl text-[#ffad3a]">₹{r.price.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}
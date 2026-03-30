import { useEffect } from 'react'
import ResultBanner from '../components/ResultBanner'
import Leaderboard from '../components/Leaderboard'
import { playSuccessJingle } from '../services/sound'
import '../styles/outcome.css'

export default function OutcomePage({ won, finalPrice, savings, rounds, personality, buyer, seller, onReplay }) {
  useEffect(() => { if (won) playSuccessJingle() }, [won])

  return (
    <div className="relative min-h-screen bg-[#0f0a0a] text-white font-body overflow-hidden flex flex-col items-center justify-center gap-8 p-8">
      <ResultBanner won={won} finalPrice={finalPrice} savings={savings} buyer={buyer} seller={seller} />
      <Leaderboard
        yourPrice={won ? finalPrice : null}
        savings={savings}
        rounds={rounds}
        personality={personality}
      />
      <button onClick={onReplay}
        className="mt-4 px-12 py-6 bg-[#ffad3a] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-headline text-3xl font-black text-black uppercase tracking-tighter hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
        ↺ PLAY AGAIN
      </button>
    </div>
  )
}
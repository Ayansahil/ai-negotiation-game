import { useEffect, useState } from 'react'
import { getLeaderboard, postScore } from '../services/leaderboardApi'

const medals = ['🥇', '🥈', '🥉']

export default function Leaderboard({ yourPrice, savings, rounds, personality }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        const userName = user?.name || 'Anonymous'

        if (yourPrice && userName) {
          await postScore({
            name: userName,
            price: yourPrice,
            savings: savings || 0,
            rounds: rounds || 5,
            personality: personality || 'unknown'
          })
        }

        const res = await getLeaderboard()
        setRows(res.data || res || [])
      } catch (err) {
        console.error('Leaderboard error:', err)
        setRows([])
      } finally {
        setLoading(false)
      }
    }
    init()
  }, []) // empty deps — run once on mount only

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  if (loading) return (
    <div className="w-full max-w-md bg-[#1a1a2e] border-4 border-black p-6 text-center">
      <span className="font-bangers text-2xl text-[#ffad3a] animate-pulse">LOADING SCORES...</span>
    </div>
  )

  return (
    <div className="w-full max-w-md bg-surface border-4 border-black shadow-comic-lg font-body">
      <div className="bg-primary border-b-4 border-black px-6 py-3">
        <h2 className="font-bangers text-2xl text-black tracking-widest uppercase">TOP CLOSERS</h2>
      </div>
      {rows.length === 0 && (
        <div className="p-6 text-center text-[#7c7373] font-bold">No scores yet. Be the first!</div>
      )}
      {rows.map((r, i) => (
        <div key={r._id || i}
          className={`flex items-center gap-4 px-6 py-4 border-b-2 border-black/20
            ${r.name === currentUser?.name ? 'bg-primary/20' : ''}`}>
          <span className="text-xl w-8">{medals[i] || `#${i + 1}`}</span>
          <div className="flex-1">
            <p className={`font-bold font-headline ${r.name === currentUser?.name ? 'text-primary' : 'text-white'}`}>
              {r.name}
            </p>
            <p className="text-xs text-[#7c7373]">saved ₹{(r.savings || 0).toLocaleString()}</p>
          </div>
          <span className="font-bangers text-2xl text-primary">₹{Number(r.price).toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}
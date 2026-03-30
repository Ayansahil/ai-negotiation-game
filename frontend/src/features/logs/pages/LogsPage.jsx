import { useEffect, useState } from 'react'
import { getLeaderboard } from '../../outcome/services/leaderboardApi'

export default function LogsPage({ onBack }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    getLeaderboard().then(res => {
      const allLogs = res.data || []
      const myLogs = allLogs.filter(l => l.name === user.name)
      setLogs(myLogs)
      setLoading(false)
    })
  }, [user.name])

  return (
    <div className="min-h-screen bg-background text-white font-body p-8 pt-24">
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#f59e0b] border-b-4 border-black">
        <button onClick={onBack} className="font-headline font-black text-black uppercase text-xl">← BACK</button>
        <h1 className="font-headline font-black text-black text-2xl uppercase italic">NEGOTIATION LOGS</h1>
        <div />
      </header>

      <div className="max-w-lg mx-auto mt-8">
        {loading && <p className="font-bangers text-[#ffad3a] text-2xl animate-pulse text-center">LOADING...</p>}
        {!loading && logs.length === 0 && (
          <div className="bg-surface border-4 border-black p-6 text-center">
            <p className="font-bangers text-2xl text-[#ffad3a]">No negotiations yet!</p>
            <p className="text-[#7c7373] mt-2">Play a game to see your logs here.</p>
          </div>
        )}
        {logs.map((log, i) => (
          <div key={i} className="bg-surface border-4 border-black p-4 mb-4 shadow-comic">
            <div className="flex justify-between items-center">
              <span className="font-bangers text-xl text-[#ffad3a]">#{i + 1} — ₹{log.price?.toLocaleString('en-IN')}</span>
              <span className={`font-bold text-sm px-3 py-1 border-2 border-black ${log.price <= 7000 ? 'bg-green-600' : 'bg-[#a80619]'} text-white`}>
                {log.price <= 7000 ? 'GREAT DEAL' : 'DEAL'}
              </span>
            </div>
            <p className="text-[#b3a9a8] text-sm mt-2">Saved: ₹{log.savings?.toLocaleString('en-IN') || 0}</p>
            <p className="text-[#b3a9a8] text-sm">Personality: {log.personality || 'unknown'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

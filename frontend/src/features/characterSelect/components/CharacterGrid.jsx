import { useState } from 'react'
import CharacterCard from './CharacterCard'
import { buyers, sellers } from '../services/characters'
import { useAudioPlayer } from '../../../hooks/useAudioPlayer'


export default function CharacterGrid({ onStart, onGoStats, onGoCrew, onGoLogs, onGoSettings }) {
  const [selectedBuyer, setSelectedBuyer] = useState(null)
  const [selectedSeller, setSelectedSeller] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { playSFX } = useAudioPlayer()

  const handleSelectBuyer = (b) => {
    playSFX('click')
    setSelectedBuyer(b)
  }

  const handleSelectSeller = (s) => {
    playSFX('click')
    setSelectedSeller(s)
  }


  const canStart = selectedBuyer && selectedSeller

  return (
    <>
      {/* Top navbar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-20 bg-[#f59e0b] border-b-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-4">
          {/* Hamburger — mobile only */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
            <span className="material-symbols-outlined text-black text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-black">NEGOTIATION PHASE</h1>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <span className="font-headline font-black text-black underline decoration-4 uppercase tracking-wider cursor-pointer">DEAL</span>
          <span onClick={onGoStats} className="font-headline font-black text-black/70 uppercase tracking-wider cursor-pointer">STATS</span>
          <span onClick={onGoCrew} className="font-headline font-black text-black/70 uppercase tracking-wider cursor-pointer">CREW</span>
          <span onClick={onGoLogs} className="font-headline font-black text-black/70 uppercase tracking-wider cursor-pointer">LOGS</span>
        </div>
        <button onClick={onGoSettings} className="material-symbols-outlined text-black text-2xl cursor-pointer bg-transparent border-none">settings</button>
      </header>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-20 left-0 w-full bg-[#f59e0b] border-b-4 border-black z-50 flex flex-col">
          <button onClick={() => { onGoStats?.(); setMobileMenuOpen(false) }}
            className="font-headline font-black text-black uppercase px-6 py-4 border-b-2 border-black text-left">
            STATS
          </button>
          <button onClick={() => { onGoCrew?.(); setMobileMenuOpen(false) }}
            className="font-headline font-black text-black uppercase px-6 py-4 border-b-2 border-black text-left">
            CREW
          </button>
          <button onClick={() => { onGoLogs?.(); setMobileMenuOpen(false) }}
            className="font-headline font-black text-black uppercase px-6 py-4 border-b-2 border-black text-left">
            LOGS
          </button>
          <button onClick={() => { onGoSettings?.(); setMobileMenuOpen(false) }}
            className="font-headline font-black text-black uppercase px-6 py-4 text-left">
            SETTINGS
          </button>
        </div>
      )}

      {/* Main content */}
      <main className="relative z-10 pt-28 pb-32 px-4 max-w-7xl mx-auto min-h-screen flex flex-col items-center gap-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">

          {/* Buyers */}
          <section className="flex flex-col gap-6">
            <div className="bg-[#f59e0a] p-4 -rotate-1 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] inline-block self-start">
              <h2 className="font-headline text-3xl font-black text-[#472a00] uppercase tracking-widest">
                Choose Your Character
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-6 place-items-center">
              {buyers.map(b => (
                <CharacterCard
                  key={b.id}
                  character={b}
                  selected={selectedBuyer?.id === b.id}
                  onSelect={handleSelectBuyer}
                  mirror={true}
                />

              ))}
            </div>
          </section>

          {/* Sellers */}
          <section className="flex flex-col gap-6">
            <div className="bg-[#ff716a] p-4 rotate-1 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] inline-block self-end">
              <h2 className="font-headline text-3xl font-black text-black uppercase tracking-widest">
                Your Opponent
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-6 place-items-center">
              {sellers.map(s => (
                <CharacterCard
                  key={s.id}
                  character={s}
                  selected={selectedSeller?.id === s.id}
                  onSelect={handleSelectSeller}
                />

              ))}
            </div>
          </section>
        </div>

        {/* Start button */}
        <div className="mt-8">
          <button
            disabled={!canStart}
            onClick={() => {
              playSFX('click')
              onStart({ buyer: selectedBuyer, seller: selectedSeller })
            }}

            className={`group flex items-center gap-4 px-12 py-6 rounded-lg border-4 border-black 
              shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all
              ${canStart
                ? 'bg-[#ffad3a] hover:translate-x-1 hover:translate-y-1 hover:shadow-none cursor-pointer'
                : 'bg-[#2c2424] cursor-not-allowed opacity-50'}`}
          >
            <span className="font-headline text-4xl font-black text-black uppercase tracking-tighter">
              START NEGOTIATION
            </span>
            <span className="material-symbols-outlined text-4xl text-black font-bold group-hover:translate-x-2 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center px-2 h-16 bg-[#1f1818] border-t-4 border-black">
        <a className="flex flex-col items-center bg-[#f59e0b] text-black border-2 border-black rounded-md p-1">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>handshake</span>
          <span className="font-headline font-bold uppercase text-[10px]">DEAL</span>
        </a>
        <a onClick={onGoStats} className="flex flex-col items-center text-white p-2 cursor-pointer">
          <span className="material-symbols-outlined">leaderboard</span>
          <span className="font-headline font-bold uppercase text-[10px]">STATS</span>
        </a>
        <a onClick={onGoCrew} className="flex flex-col items-center text-white p-2 cursor-pointer">
          <span className="material-symbols-outlined">group</span>
          <span className="font-headline font-bold uppercase text-[10px]">CREW</span>
        </a>
        <a onClick={onGoLogs} className="flex flex-col items-center text-white p-2 cursor-pointer">
          <span className="material-symbols-outlined">history</span>
          <span className="font-headline font-bold uppercase text-[10px]">LOGS</span>
        </a>
      </nav>
    </>
  )
}
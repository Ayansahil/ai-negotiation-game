import StatsBar from '../components/StatsBar'
import CharacterDisplay from '../components/CharacterDisplay'
import InputHUD from '../components/InputHUD'
import { useGame } from '../hooks/useGame'
import '../styles/game.css'

export default function GamePage({ buyer, seller, onEnd }) {
  const { gameState, sendOffer } = useGame({ seller, onEnd })

  return (
    <div className="relative min-h-screen bg-[#0f0a0a] text-on-surface font-body overflow-hidden">
      {/* BG effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,#1a0800,transparent)] scale-150" />
        <div className="halftone-bg absolute inset-0" />
      </div>

      {/* Particles */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="particle" style={{ top:'20%', left:'10%', width:'8px', height:'8px' }} />
        <div className="particle" style={{ top:'45%', left:'80%', width:'4px', height:'4px' }} />
        <div className="particle" style={{ top:'70%', left:'30%', width:'12px', height:'12px' }} />
        <div className="particle" style={{ top:'15%', left:'65%', width:'8px', height:'8px' }} />
      </div>

      <StatsBar
        sellerName={seller.name}
        currentPrice={gameState.currentPrice}
        roundsUsed={gameState.round}
        mood={gameState.mood}
      />

      <main className="relative pt-24 pb-48 px-4 h-screen max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <CharacterDisplay
          character={seller}
          bubble={gameState.sellerMessage}
          personality={gameState.personality}
          side="seller"
        />
        <CharacterDisplay
          character={buyer}
          bubble={gameState.lastUserMessage}
          side="buyer"
        />
      </main>

      <InputHUD onSend={sendOffer} disabled={gameState.done} />
    </div>
  )
}
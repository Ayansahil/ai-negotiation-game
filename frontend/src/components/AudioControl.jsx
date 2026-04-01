import { useAudioPlayer } from '../hooks/useAudioPlayer'

export default function AudioControl() {
  const { isMuted, toggleMute } = useAudioPlayer()

  return (
    <div className="fixed top-4 right-16 z-50">

      <button
        onClick={toggleMute}
        title={isMuted ? 'Unmute SFX' : 'Mute SFX'}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
          isMuted ? 'bg-surface shadow-black/50 opacity-60' : 'bg-primary shadow-primary/50'
        } border border-white/10 hover:scale-110 active:scale-95 text-xl`}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
    </div>
  )
}

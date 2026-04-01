import { useState, useEffect } from 'react'

// Import short sound effects
import winSound from '../assets/sounds/win.mp3'
import loseSound from '../assets/sounds/lose.mp3'
import clickSound from '../assets/sounds/click.mp3'

export const useAudioPlayer = () => {
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('audio_volume')
    return saved !== null ? parseFloat(saved) : 0.5
  })
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('audio_muted') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('audio_volume', volume)
    localStorage.setItem('audio_muted', isMuted)
  }, [volume, isMuted])

  const updateVolume = (val) => {
    setVolume(val)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const playSFX = (type) => {
    if (isMuted) return

    let sfxUrl = ''
    if (type === 'win') sfxUrl = winSound
    if (type === 'lose') sfxUrl = loseSound
    if (type === 'click') sfxUrl = clickSound

    if (sfxUrl) {
      const sfx = new Audio(sfxUrl)
      sfx.volume = volume
      sfx.play().catch(e => console.error('SFX play error:', e))
    }
  }

  return {
    volume,
    isMuted,
    updateVolume,
    toggleMute,
    playSFX,
    // Provide dummy values for compatibility with current components
    isPlaying: false,
    togglePlay: () => {},
    currentTrack: { name: 'SFX Only' },
    allTracks: []
  }
}

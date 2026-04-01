import { useState, useEffect, useRef } from 'react'
import AudioControl from './components/AudioControl'
import { useAudioPlayer } from './hooks/useAudioPlayer'

import LoaderPage from './features/loader/pages/LoaderPage'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import CharacterSelectPage from './features/characterSelect/pages/CharacterSelectPage'
import GamePage from './features/game/pages/GamePage'
import OutcomePage from './features/outcome/pages/OutcomePage'
import CrewPage from './features/crew/pages/CrewPage'
import StatsPage from './features/stats/pages/StatsPage'
import SettingsPage from './features/settings/pages/SettingsPage'
import LogsPage from './features/logs/pages/LogsPage'

export default function App() {
  const [screen, setScreen] = useState('loader')
  const [characters, setCharacters] = useState({ buyer: null, seller: null })
  const [result, setResult] = useState({
    won: false, finalPrice: 9999,
    savings: 0, rounds: 5, personality: 'unknown'
  })

  const { isPlaying, togglePlay, playSFX } = useAudioPlayer()



  useEffect(() => {
    if (screen === 'loader') {
      const t = setTimeout(() => {
        const token = localStorage.getItem('token')
        setScreen(token ? 'select' : 'login')
      }, 2500)
      return () => clearTimeout(t)
    }
  }, [screen])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setScreen('login')
  }

  return (
    <>
      {screen === 'loader' && <LoaderPage />}

      {screen === 'login' && (
        <LoginPage
          onLogin={() => setScreen('select')}
          onGoRegister={() => setScreen('register')}
        />
      )}

      {screen === 'register' && (
        <RegisterPage
          onRegister={() => setScreen('login')}
          onGoLogin={() => setScreen('login')}
        />
      )}

      {screen === 'select' && (
        <CharacterSelectPage
          onStart={(chars) => { setCharacters(chars); setScreen('game') }}
          onGoStats={() => setScreen('stats')}
          onGoCrew={() => setScreen('crew')}
          onGoLogs={() => setScreen('logs')}
          onGoSettings={() => setScreen('settings')}
          onLogout={handleLogout}
        />
      )}

      {screen === 'settings' && (
        <SettingsPage onBack={() => setScreen('select')} onLogout={handleLogout} />
      )}

      {screen === 'logs' && (
        <LogsPage onBack={() => setScreen('select')} />
      )}

      {screen === 'game' && (
        <GamePage
          buyer={characters.buyer}
          seller={characters.seller}
          onEnd={(res) => {
            setResult({
              won: res.won,
              finalPrice: res.finalPrice,
              savings: res.savings || 0,
              rounds: res.rounds || 5,
              personality: res.personality || 'unknown'
            })
            setScreen('outcome')
          }}
        />
      )}

      {screen === 'outcome' && (
        <OutcomePage
          won={result.won}
          finalPrice={result.finalPrice}
          savings={result.savings}
          rounds={result.rounds}
          personality={result.personality}
          buyer={characters.buyer}
          seller={characters.seller}
          onReplay={() => setScreen('select')}
          onGoStats={() => setScreen('stats')}
        />
      )}

      {screen === 'crew' && (
        <CrewPage
          onBack={() => setScreen('select')}
          onLogout={handleLogout}
        />
      )}

      {screen === 'stats' && (
        <StatsPage
          onBack={() => setScreen('select')}
          onLogout={handleLogout}
        />
      )}

      {/* Persistent Audio Control */}
      <AudioControl />
    </>

  )
}
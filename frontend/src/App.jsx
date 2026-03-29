import { useState, useEffect } from 'react'
import LoaderPage from './features/loader/pages/LoaderPage'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import CharacterSelectPage from './features/characterSelect/pages/CharacterSelectPage'
import GamePage from './features/game/pages/GamePage'
import OutcomePage from './features/outcome/pages/OutcomePage'

export default function App() {
  const [screen, setScreen] = useState('loader')
  const [characters, setCharacters] = useState({ buyer: null, seller: null })
  const [result, setResult] = useState({ won: false, finalPrice: 9999 })

  // Loader auto-advance
  useEffect(() => {
    if (screen === 'loader') {
      const t = setTimeout(() => setScreen('login'), 2500)
      return () => clearTimeout(t)
    }
  }, [screen])

  return (
    <>
      {screen === 'loader' && (
        <LoaderPage />
      )}

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
          onStart={(chars) => {
            setCharacters(chars)
            setScreen('game')
          }}
        />
      )}

      {screen === 'game' && (
        <GamePage
          buyer={characters.buyer}
          seller={characters.seller}
          onEnd={(res) => {
            setResult(res)
            setScreen('outcome')
          }}
        />
      )}

      {screen === 'outcome' && (
        <OutcomePage
          won={result.won}
          finalPrice={result.finalPrice}
          buyer={characters.buyer}
          seller={characters.seller}
          onReplay={() => setScreen('select')}
        />
      )}
    </>
  )
}
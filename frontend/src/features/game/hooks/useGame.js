import { useState, useEffect } from 'react'
import { startGame, sendNegotiationOffer } from '../services/negotiateApi'

const PERSONALITIES = ['stubborn', 'emotional', 'logical']

export function useGame({ seller, onEnd }) {
  const [gameId, setGameId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [gameState, setGameState] = useState({
    currentPrice: 9999,
    round: 0,
    done: false,
    mood: 'neutral',
    personality: PERSONALITIES[Math.floor(Math.random() * 3)],
    sellerMessage: `Welcome! Make your offer and let's negotiate.`,
    lastUserMessage: null,
    productImage: 'keyboard.png',
    productLabel: 'LIMITED ED. MECH KEYBOARD',
    productName: 'Limited Edition Mechanical Keyboard',
  })

  useEffect(() => {
    const initGame = async () => {
      try {
        const res = await startGame({
          sellerName: seller?.name || 'AI Seller',
          personality: gameState.personality
        })
        if (res.success && res.data?.gameId) {
          setGameId(res.data.gameId)
          setGameState(prev => ({
            ...prev,
            currentPrice: res.data.currentPrice || prev.currentPrice,
            sellerMessage: res.data.sellerMessage || prev.sellerMessage,
            personality: res.data.personality || prev.personality,
            productImage: res.data.productImage || 'keyboard.png',
            productLabel: res.data.productLabel || 'LIMITED ED. MECH KEYBOARD',
            productName: res.data.productName || 'Limited Edition Mechanical Keyboard',
          }))
        }
      } catch (err) {
        console.error('Game init failed:', err)
      }
    }
    initGame()
  }, [])

  const sendOffer = async (userText) => {
    if (gameState.done || loading) return
    setLoading(true)

    try {
      const res = await sendNegotiationOffer({
        gameId,
        userMessage: userText,
        currentPrice: gameState.currentPrice,
        round: gameState.round,
        personality: gameState.personality,
      })

      if (!res.success) { setLoading(false); return }

      const data = res.data
      const newRound = gameState.round + 1

      if (data.isDeal) {
        setGameState(prev => ({ ...prev, done: true }))
        onEnd({
          won: true,
          finalPrice: data.newPrice,
          savings: gameState.currentPrice - data.newPrice,
          rounds: newRound,
          personality: gameState.personality
        })
        return
      }

      if (data.isFailed) {
        setGameState(prev => ({ ...prev, done: true }))
        onEnd({
          won: false,
          finalPrice: data.newPrice ?? gameState.currentPrice,
          savings: 0,
          rounds: newRound,
          personality: gameState.personality
        })
        return
      }

      setGameState(prev => ({
        ...prev,
        currentPrice: data.newPrice ?? prev.currentPrice,
        mood: data.mood || 'neutral',
        round: newRound,
        sellerMessage: data.sellerMessage || data.message || '',
        lastUserMessage: userText,
        done: false,
      }))
    } catch (err) {
      console.error('Offer failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return { gameState, sendOffer, loading }
}
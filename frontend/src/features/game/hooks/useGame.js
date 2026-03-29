import { useState } from 'react'
import { sendNegotiationOffer } from '../services/negotiateApi'

const INITIAL_PRICE = 9999
const PERSONALITIES = ['stubborn', 'emotional', 'logical']

export function useGame({ seller, onEnd }) {
  const [gameState, setGameState] = useState({
    currentPrice: INITIAL_PRICE,
    round: 0,
    done: false,
    mood: 'neutral',
    personality: PERSONALITIES[Math.floor(Math.random() * 3)],
    sellerMessage: `Welcome. I'm selling a Limited Edition Mechanical Keyboard. My price is ₹${INITIAL_PRICE.toLocaleString()}. Make your offer.`,
    lastUserMessage: null,
  })

  const sendOffer = async (userText) => {
    if (gameState.done) return

    const response = await sendNegotiationOffer({
      userMessage: userText,
      currentPrice: gameState.currentPrice,
      round: gameState.round,
      personality: gameState.personality,
    })

    const newRound = gameState.round + 1

    setGameState(prev => ({
      ...prev,
      currentPrice: response.newPrice,
      mood: response.mood,
      round: newRound,
      sellerMessage: response.sellerMessage,
      lastUserMessage: userText,
      done: response.isDeal || newRound >= 5,
    }))

    if (response.isDeal) onEnd({ won: true, finalPrice: response.newPrice })
    else if (newRound >= 5) onEnd({ won: false, finalPrice: response.newPrice })
  }

  return { gameState, sendOffer }
}
import { Game, Leaderboard } from '../config/database.js';
import { getNegotiationResponse } from '../services/aiService.js';

const startGame = async (req, res) => {
  try {
    const game = await Game.create({
      current_price: 1000,
      rounds: 0,
      messages: [],
      status: 'ongoing'
    });

    res.status(201).json({
      success: true,
      data: {
        gameId: game._id,
        currentPrice: game.current_price,
        rounds: game.rounds,
        status: game.status,
        message: "Welcome to the negotiation! I'm selling a product for $1000. Can you negotiate a better price?"
      }
    });
  } catch (error) {
    console.error('Start game error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start game'
    });
  }
};

const chat = async (req, res) => {
  try {
    const { gameId, userMessage } = req.body;

    if (!gameId || !userMessage) {
      return res.status(400).json({
        success: false,
        error: 'gameId and userMessage are required'
      });
    }

    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    if (game.status !== 'ongoing') {
      return res.status(400).json({
        success: false,
        error: `Game already ended with status: ${game.status}`
      });
    }

    const newRounds = game.rounds + 1;

    const updatedMessages = [
      ...game.messages,
      {
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      }
    ];

    const gameState = {
      currentPrice: game.current_price,
      rounds: newRounds,
      messages: updatedMessages,
      status: game.status
    };

    const aiResponse = await getNegotiationResponse(gameState, userMessage);

    const finalMessages = [
      ...updatedMessages,
      {
        role: 'assistant',
        content: aiResponse.message,
        timestamp: new Date().toISOString()
      }
    ];

    const updatedGame = await Game.findByIdAndUpdate(
      gameId,
      {
        current_price: aiResponse.price,
        rounds: newRounds,
        messages: finalMessages,
        status: aiResponse.status
      },
      { new: true }
    );

    if (aiResponse.status === 'deal') {
      await Leaderboard.create({
        username: req.body.username || 'Anonymous',
        final_price: aiResponse.price
      });
    }

    res.json({
      success: true,
      data: {
        gameId: updatedGame._id,
        message: aiResponse.message,
        currentPrice: aiResponse.price,
        rounds: newRounds,
        mood: aiResponse.mood,
        status: aiResponse.status
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process chat message'
    });
  }
};

const getGame = async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    res.json({
      success: true,
      data: {
        gameId: game._id,
        currentPrice: game.current_price,
        rounds: game.rounds,
        messages: game.messages,
        status: game.status,
        createdAt: game.created_at
      }
    });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch game'
    });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find()
      .sort({ final_price: 1 })
      .limit(10);

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
};

export { startGame, chat, getGame, getLeaderboard };

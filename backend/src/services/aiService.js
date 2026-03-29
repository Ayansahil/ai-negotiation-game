const SYSTEM_PROMPT = `You are an AI seller negotiating the sale of a product.

RULES:
- Starting price: 1000
- Minimum acceptable price: 600
- NEVER go below the minimum price of 600
- Reduce price gradually based on the quality of the user's reasoning
- Reward good negotiation tactics and compelling arguments
- Resist lowball offers and poor reasoning
- Be professional but firm when necessary
- End the negotiation with "deal" if you accept their offer
- End with "failed" if they're being unreasonable or you've reached your limit

RESPONSE FORMAT:
You must respond with valid JSON only, in this exact format:
{
  "message": "Your response to the user",
  "price": <current_price_number>,
  "mood": "<firm|neutral|flexible|annoyed>",
  "status": "<ongoing|deal|failed>"
}

Current negotiation state will be provided with each message.`;

async function getNegotiationResponse(gameState, userMessage) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      message: "I'm ready to negotiate! The starting price is $1000. Make me an offer or tell me why I should lower the price.",
      price: gameState.currentPrice,
      mood: "neutral",
      status: "ongoing"
    };
  }

  const conversationHistory = gameState.messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));

  const contextMessage = `Current Price: $${gameState.currentPrice}
Round: ${gameState.rounds}
Status: ${gameState.status}

User's message: ${userMessage}`;

  try {
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...conversationHistory,
            { role: 'user', content: contextMessage }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = JSON.parse(data.choices[0].message.content);

      return {
        message: aiResponse.message,
        price: Math.max(600, Math.min(aiResponse.price, gameState.currentPrice)),
        mood: aiResponse.mood || 'neutral',
        status: aiResponse.status || 'ongoing'
      };
    } else if (process.env.GEMINI_API_KEY) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: SYSTEM_PROMPT },
                { text: conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n') },
                { text: contextMessage }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = JSON.parse(data.candidates[0].content.parts[0].text);

      return {
        message: aiResponse.message,
        price: Math.max(600, Math.min(aiResponse.price, gameState.currentPrice)),
        mood: aiResponse.mood || 'neutral',
        status: aiResponse.status || 'ongoing'
      };
    }
  } catch (error) {
    console.error('AI Service Error:', error);

    return generateFallbackResponse(gameState, userMessage);
  }

  return generateFallbackResponse(gameState, userMessage);
}

function generateFallbackResponse(gameState, userMessage) {
  const message = userMessage.toLowerCase();
  const currentPrice = gameState.currentPrice;

  if (currentPrice <= 600) {
    return {
      message: "That's my final offer at $600. I can't go any lower. Do we have a deal?",
      price: 600,
      mood: "firm",
      status: "ongoing"
    };
  }

  const priceMatch = message.match(/\$?(\d+)/);
  if (priceMatch) {
    const offeredPrice = parseInt(priceMatch[1]);

    if (offeredPrice < 600) {
      return {
        message: "I appreciate your interest, but $600 is my absolute minimum. I can't go below that.",
        price: currentPrice,
        mood: "firm",
        status: "ongoing"
      };
    } else if (offeredPrice >= currentPrice - 50) {
      const newPrice = Math.max(600, currentPrice - 50);
      return {
        message: `You drive a hard bargain! I can come down to $${newPrice}. What do you say?`,
        price: newPrice,
        mood: "flexible",
        status: "ongoing"
      };
    } else {
      return {
        message: "That's quite a jump! How about we meet somewhere in the middle? Let's be reasonable here.",
        price: currentPrice,
        mood: "annoyed",
        status: "ongoing"
      };
    }
  }

  if (message.includes('deal') || message.includes('accept') || message.includes('yes')) {
    return {
      message: `Excellent! We have a deal at $${currentPrice}. Pleasure doing business with you!`,
      price: currentPrice,
      mood: "neutral",
      status: "deal"
    };
  }

  const newPrice = Math.max(600, currentPrice - 30);
  return {
    message: `I hear you. Let me see what I can do... How about $${newPrice}?`,
    price: newPrice,
    mood: "neutral",
    status: "ongoing"
  };
}

export { getNegotiationResponse };

# AI Negotiation Game - Backend API

A Node.js + Express backend for an AI-powered negotiation game where players try to negotiate the best price with an AI seller.

## Features

- Start new negotiation games
- Real-time chat with AI negotiator
- Track game state and history
- Leaderboard for best deals
- MongoDB database integration
- RESTful API design

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **AI**: OpenAI GPT-4 or Google Gemini (configurable)

## Project Structure

```
├── config/
│   └── database.js          #  MongoDB 
├── controllers/
│   └── gameController.js    # Game logic and request handlers
├── routes/
│   └── gameRoutes.js        # API route definitions
├── services/
│   └── aiService.js         # AI integration service
├── .env                     # Environment variables
├── server.js                # Main application entry point
└── package.json
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
MONGO_URI=your_mongodb_url

# Optional: Add AI API key for enhanced responses
OPENAI_API_KEY=your_openai_key
# OR
GEMINI_API_KEY=your_gemini_key
```

3. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### 1. Start New Game

**POST** `/api/game/start`

Initializes a new negotiation game with starting price of $1000.

**Response:**
```json
{
  "success": true,
  "data": {
    "gameId": "uuid",
    "currentPrice": 1000,
    "rounds": 0,
    "status": "ongoing",
    "message": "Welcome message"
  }
}
```

### 2. Send Chat Message

**POST** `/api/game/chat`

Send a negotiation message and get AI response.

**Request Body:**
```json
{
  "gameId": "uuid",
  "userMessage": "I'll offer you $700",
  "username": "PlayerName" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gameId": "uuid",
    "message": "AI response",
    "currentPrice": 950,
    "rounds": 1,
    "mood": "neutral",
    "status": "ongoing"
  }
}
```

**Status Values:**
- `ongoing` - Negotiation continues
- `deal` - Agreement reached
- `failed` - Negotiation failed

**Mood Values:**
- `firm` - AI is holding ground
- `neutral` - Balanced stance
- `flexible` - Willing to negotiate
- `annoyed` - Frustrated with offers

### 3. Get Game Details

**GET** `/api/game/:gameId`

Retrieve full game state and history.

**Response:**
```json
{
  "success": true,
  "data": {
    "gameId": "uuid",
    "currentPrice": 950,
    "rounds": 3,
    "messages": [...],
    "status": "ongoing",
    "createdAt": "timestamp"
  }
}
```

### 4. Get Leaderboard

**GET** `/api/game/leaderboard/top`

Get top 10 best negotiated prices.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "username": "Player1",
      "final_price": 650,
      "created_at": "timestamp"
    }
  ]
}
```

## Game Rules

- **Starting Price**: $1000
- **Minimum Price**: $600 (AI won't go lower)
- **Strategy**: Use compelling arguments and good reasoning
- **Winning**: Get the lowest price possible by reaching a deal
- **Leaderboard**: Completed deals are ranked by final price

## AI Service

The AI service supports two providers:

1. **OpenAI GPT-4**: Set `OPENAI_API_KEY` in `.env`
2. **Google Gemini**: Set `GEMINI_API_KEY` in `.env`

If no API key is provided, the system uses a fallback rule-based negotiator.

## Testing with Postman

1. Start a game:
   - POST `http://localhost:3000/api/game/start`

2. Copy the `gameId` from response

3. Send negotiation message:
   - POST `http://localhost:3000/api/game/chat`
   - Body: `{"gameId": "...", "userMessage": "Your offer"}`

4. View leaderboard:
   - GET `http://localhost:3000/api/game/leaderboard/top`

## Database Schema

### games table
- `id` (uuid) - Primary key
- `current_price` (integer) - Current negotiated price
- `rounds` (integer) - Number of negotiation rounds
- `messages` (jsonb) - Chat history
- `status` (text) - Game status
- `created_at` (timestamp)
- `updated_at` (timestamp)

### leaderboard table
- `id` (uuid) - Primary key
- `username` (text) - Player name
- `final_price` (integer) - Final deal price
- `created_at` (timestamp)

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Server Error

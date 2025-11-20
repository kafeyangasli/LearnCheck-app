# LearnCheck LLM Service

LLM Service untuk LearnCheck menggunakan Google Gemini API untuk generate questions dan feedback.

## Features

- **Question Generation**: Generate soal pilihan ganda berkualitas menggunakan Gemini AI
- **Adaptive Feedback**: Generate feedback yang dipersonalisasi berdasarkan jawaban
- **Difficulty Levels**: Support easy, medium, hard difficulty
- **Prompt Engineering**: Optimized prompts untuk hasil terbaik
- **Redis Caching**: Cache untuk mengurangi API calls
- **Error Handling**: Comprehensive error handling dan retry logic

## Tech Stack

- **Runtime**: Node.js v20
- **Framework**: Express.js v5
- **LLM**: Google Gemini 2.0 Flash
- **Cache**: Redis v7
- **Logging**: Winston

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env`:

```env
PORT=3002
NODE_ENV=development
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp
REDIS_HOST=localhost
REDIS_PORT=6379
LOG_LEVEL=info
```

### Getting Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in dengan Google account
3. Click "Create API Key"
4. Copy API key dan paste ke `.env`

## Running

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## API Endpoints

### Health Check
```
GET /health
Response: { status, message, services: { redis, gemini } }
```

### Generate Questions
```
POST /api/llm/generate-questions
Body: {
  content: string,      // Tutorial content
  difficulty: string,   // "easy" | "medium" | "hard"
  count: number         // 1-10
}

Response: {
  status: "success",
  data: {
    questions: [
      {
        question: string,
        options: [string, string, string, string],
        correct_answer: number,  // 0-3
        difficulty: string
      }
    ]
  }
}
```

### Generate Feedback
```
POST /api/llm/generate-feedback
Body: {
  question: string,
  selectedAnswer: string,
  correctAnswer: string,
  isCorrect: boolean
}

Response: {
  status: "success",
  data: {
    feedback: string,
    isCorrect: boolean
  }
}
```

## Project Structure

```
llm_service/
├── src/
│   ├── config/
│   │   ├── config.js        # Environment config
│   │   ├── logger.js        # Winston logger
│   │   └── redis.js         # Redis client
│   ├── controllers/
│   │   └── llmController.js # Request handlers
│   ├── middleware/
│   │   └── errorHandler.js  # Error handling
│   ├── routes/
│   │   ├── llmRoutes.js     # API routes
│   │   └── healthRoutes.js  # Health check
│   ├── services/
│   │   └── geminiService.js # Gemini AI integration
│   ├── app.js               # Express app
│   └── index.js             # Server entry point
├── logs/                    # Log files
├── .env.example
├── package.json
└── README.md
```

## Prompt Engineering

### Question Generation Prompt

The service uses carefully engineered prompts to ensure:
- High-quality multiple choice questions
- Proper difficulty levels
- Valid JSON output format
- 4 options with only 1 correct answer

### Feedback Generation Prompt

Adaptive feedback based on:
- **Correct Answer**: Encouragement + deeper insights
- **Incorrect Answer**: Constructive guidance + explanation

## Difficulty Levels

### Easy
- Direct recall questions
- Basic definitions
- Simple concepts from content

### Medium
- Application of concepts
- Understanding relationships
- Moderate complexity

### Hard
- Analysis and synthesis
- Complex problem-solving
- Deep understanding required

## Error Handling

Common errors:
- `400` - Bad Request (invalid input)
- `500` - LLM generation failed
- `503` - Gemini API unavailable

All errors are logged to `logs/error.log`

## Performance

### Timeouts
- Question generation: 30 seconds
- Feedback generation: 20 seconds

### Retry Logic
- Automatic retry on transient failures
- Exponential backoff for rate limits

## Security

- API key secured via environment variables
- Input validation on all endpoints
- No sensitive data in logs
- CORS configured for internal service communication

## Logging

Logs written to:
- `logs/error.log` - Errors only
- `logs/combined.log` - All logs

Log levels: error, warn, info, debug

## Testing

Test question generation:
```bash
curl -X POST http://localhost:3002/api/llm/generate-questions \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Artificial Intelligence adalah...",
    "difficulty": "medium",
    "count": 3
  }'
```

Test feedback generation:
```bash
curl -X POST http://localhost:3002/api/llm/generate-feedback \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Apa itu AI?",
    "selectedAnswer": "Artificial Intelligence",
    "correctAnswer": "Artificial Intelligence",
    "isCorrect": true
  }'
```

## Troubleshooting

### API Key Error
```
Error: GEMINI_API_KEY is not configured
```
**Solution**: Set `GEMINI_API_KEY` in `.env` file

### Rate Limit Error
**Solution**: Wait and retry, or upgrade Gemini API quota

### Invalid JSON Response
**Solution**: Check prompt engineering, validate LLM output parsing

## Best Practices

1. Always validate content length before sending to LLM
2. Monitor API usage and costs
3. Use caching to reduce API calls
4. Handle timeouts gracefully
5. Log all LLM interactions for debugging

## Monitoring

Monitor these metrics:
- API response times
- Error rates
- Cache hit rates
- Gemini API usage
- Question quality (manual review)

## Future Improvements

- [ ] Add retry logic with exponential backoff
- [ ] Implement request queuing for high load
- [ ] Add metrics/monitoring endpoints
- [ ] Support multiple LLM providers
- [ ] Add question quality validation
- [ ] Implement A/B testing for prompts

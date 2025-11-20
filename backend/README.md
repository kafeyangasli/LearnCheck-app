# LearnCheck Backend API

Backend API untuk sistem LearnCheck - AI-Powered Formative Assessment System.

## Features

- **Question Generation**: Generate soal pilihan ganda dari konten tutorial
- **Answer Validation**: Validasi jawaban dan generate feedback adaptif
- **Progress Tracking**: Track riwayat percobaan dan progress pengguna
- **Redis Caching**: Cache questions untuk meningkatkan performa
- **Rate Limiting**: 60 requests/menit per IP
- **CORS Support**: Configured untuk iFrame integration
- **Mock Dicoding Integration**: Fetch konten dari Mock Dicoding API

## Tech Stack

- **Runtime**: Node.js v20
- **Framework**: Express.js v5
- **Cache**: Redis v7
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` dan sesuaikan:

```env
PORT=3001
NODE_ENV=development
REDIS_HOST=localhost
REDIS_PORT=6379
LLM_SERVICE_URL=http://localhost:3002
MOCK_DICODING_API_URL=https://learncheck-dicoding-mock-666748076441.europe-west1.run.app
RATE_LIMIT_MAX_REQUESTS=60
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

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
```

### Questions
```
POST /api/questions/generate
Body: { tutorial_id, user_id, attempt_number }
```

### Answers
```
POST /api/answers/submit
Body: { question_id, selected_answer, user_id }
```

### Progress
```
GET /api/progress/:user_id/:tutorial_id
POST /api/progress/save
Body: { user_id, tutorial_id, attempt_data }
```

### Content
```
GET /api/content/:tutorial_id
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── config.js    # Environment config
│   │   ├── logger.js    # Winston logger
│   │   └── redis.js     # Redis client
│   ├── controllers/     # Request handlers
│   │   ├── questionController.js
│   │   ├── progressController.js
│   │   └── contentController.js
│   ├── middleware/      # Express middleware
│   │   ├── cors.js
│   │   ├── rateLimit.js
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── routes/          # API routes
│   │   ├── questionRoutes.js
│   │   ├── progressRoutes.js
│   │   ├── contentRoutes.js
│   │   └── healthRoutes.js
│   ├── services/        # Business logic
│   │   ├── dicodingService.js
│   │   ├── llmService.js
│   │   ├── questionService.js
│   │   └── progressService.js
│   ├── app.js           # Express app
│   └── index.js         # Server entry point
├── logs/                # Log files
├── .env.example
├── package.json
└── README.md
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "status": "error",
  "message": "Error description"
}
```

Common status codes:
- `400` - Bad Request (validation error)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error
- `503` - Service Unavailable (LLM service down)
- `504` - Gateway Timeout

## Logging

Logs are written to:
- `logs/error.log` - Error logs only
- `logs/combined.log` - All logs

## Caching

Redis cache keys format:
```
tutorial:{tutorial_id}:attempt:{attempt_number}:user:{user_id}
```

TTL: 3600 seconds (1 hour)

## Security

- Helmet for security headers
- CORS configuration for iFrame support
- Rate limiting per IP
- Input validation on all endpoints
- No sensitive data in error responses (production)

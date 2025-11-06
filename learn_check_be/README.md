# LearnCheck Backend API

Backend API untuk LearnCheck - AI-Powered Formative Assessment System

## Struktur Folder

```
learn_check_be/
├── src/
│   ├── config/           # Konfigurasi aplikasi
│   │   ├── index.ts      # Export semua konfigurasi
│   │   ├── redis.ts      # Konfigurasi Redis
│   │   └── cors.ts       # Konfigurasi CORS
│   │
│   ├── controllers/      # Request handlers
│   │   ├── question.controller.ts    # Generate questions
│   │   ├── answer.controller.ts      # Submit answers
│   │   ├── progress.controller.ts    # Track progress
│   │   ├── content.controller.ts     # Fetch content dari Dicoding API
│   │   └── health.controller.ts      # Health check endpoint
│   │
│   ├── middleware/       # Express middleware
│   │   ├── error.middleware.ts       # Error handling
│   │   ├── rateLimit.middleware.ts   # Rate limiting (60 req/min)
│   │   ├── validation.middleware.ts  # Request validation
│   │   └── logger.middleware.ts      # Logging
│   │
│   ├── routes/           # Route definitions
│   │   ├── index.ts                  # Main router
│   │   ├── question.routes.ts        # /api/questions/*
│   │   ├── answer.routes.ts          # /api/answers/*
│   │   ├── progress.routes.ts        # /api/progress/*
│   │   └── content.routes.ts         # /api/content/*
│   │
│   ├── services/         # Business logic
│   │   ├── llm.service.ts            # LLM API integration
│   │   ├── cache.service.ts          # Redis caching
│   │   ├── dicoding-api.service.ts   # Mock Dicoding API client
│   │   ├── feedback.service.ts       # Adaptive feedback generation
│   │   └── difficulty.service.ts     # Difficulty adjustment algorithm
│   │
│   ├── types/            # TypeScript type definitions
│   │   ├── index.ts                  # Export semua types
│   │   ├── question.types.ts         # Question-related types
│   │   ├── answer.types.ts           # Answer-related types
│   │   ├── progress.types.ts         # Progress-related types
│   │   └── api.types.ts              # API request/response types
│   │
│   ├── utils/            # Helper functions
│   │   ├── response.util.ts          # Standardized API responses
│   │   ├── validator.util.ts         # Input validation helpers
│   │   └── cache-key.util.ts         # Cache key generator
│   │
│   ├── models/           # Data models
│   │   ├── question.model.ts         # Question model
│   │   ├── answer.model.ts           # Answer model
│   │   └── progress.model.ts         # Progress model
│   │
│   ├── app.ts            # Express app configuration
│   └── server.ts         # Server entry point
│
├── dist/                 # Compiled JavaScript (generated)
├── node_modules/         # Dependencies (generated)
├── .env.example          # Environment variables template
├── .gitignore
├── nodemon.json          # Nodemon configuration
├── package.json
├── tsconfig.json         # TypeScript configuration
└── README.md
```

## Dependencies yang Terinstall

### Production Dependencies
- **express** - Web framework
- **cors** - CORS middleware
- **helmet** - Security headers
- **morgan** - HTTP request logger
- **express-rate-limit** - Rate limiting
- **dotenv** - Environment variables
- **axios** - HTTP client untuk API calls
- **redis** - Redis client untuk caching

### Development Dependencies
- **typescript** - TypeScript compiler
- **ts-node** - TypeScript execution
- **nodemon** - Auto-restart development server
- **@types/node** - Node.js type definitions
- **@types/express** - Express type definitions
- **@types/cors** - CORS type definitions
- **@types/morgan** - Morgan type definitions

## Setup & Installation

1. Copy environment variables:
```bash
cp .env.example .env
```

2. Install dependencies (sudah dilakukan):
```bash
npm install
```

3. Jalankan development server:
```bash
npm run dev
```

4. Build untuk production:
```bash
npm run build
```

5. Jalankan production server:
```bash
npm start
```

## NPM Scripts

- `npm run dev` - Jalankan development server dengan hot-reload
- `npm run build` - Compile TypeScript ke JavaScript
- `npm start` - Jalankan production server
- `npm run start:prod` - Build dan jalankan production server
- `npm run watch` - Watch mode untuk TypeScript compiler

## API Endpoints

### Question Generation
- `POST /api/questions/generate` - Generate 3 MCQ questions

### Answer Submission
- `POST /api/answers/submit` - Submit answer dan dapatkan feedback

### Progress Tracking
- `GET /api/progress/:user_id/:tutorial_id` - Get user progress
- `POST /api/progress/save` - Save progress

### Content
- `GET /api/content/:tutorial_id` - Fetch content dari Mock Dicoding API

### Health Check
- `GET /health` - Health check endpoint

## Environment Variables

Lihat `.env.example` untuk daftar lengkap environment variables yang diperlukan.

## Next Steps

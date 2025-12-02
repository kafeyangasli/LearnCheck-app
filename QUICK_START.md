# Quick Start Guide - LearnCheck App

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js (v16 or higher)
- Redis Server (running on port 6379)
- Gemini API Key

---

## 📦 Installation

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment Variables

```bash
# backend/.env
PORT=3001
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start Redis

```bash
# Windows
redis-server

# Check if Redis is running
redis-cli ping
# Should return: PONG
```

---

## 🏃 Running the Application

### Option 1: All-in-One (Recommended)

The worker now auto-starts with the backend server!

```bash
# Terminal 1 - Backend (includes worker)
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Option 2: Separate Worker (Manual Control)

```bash
# Terminal 1 - Backend Server
cd backend
npm run dev

# Terminal 2 - Backend Worker
cd backend
npm run dev:worker

# Terminal 3 - Frontend
cd frontend
npm run dev
```

---

## ✅ Verify Everything is Working

### 1. Check Backend
```bash
curl http://localhost:3001/api/v1/health
# Expected: {"status":"ok"}
```

### 2. Check Worker Logs
You should see in backend terminal:
```
[info]: Backend server running on http://localhost:3001
[info]: [Worker] Assessment worker started with concurrency: 5
```

### 3. Access Frontend
Open browser and navigate to:
```
http://localhost:5173/?tutorial_id=35363&user_id=3
```

You should see:
1. Loading spinner
2. Quiz questions appear after 5-10 seconds
3. No errors in browser console

---

## 🎯 Test Quiz Generation

```bash
# Request quiz generation
curl "http://localhost:3001/api/v1/assessment?tutorial_id=35363&user_id=3"

# First call: Returns 202 (job created)
# Response: {"status":"processing","jobId":"3-35363"}

# Subsequent calls: Returns 200 (quiz ready)
# Response: {"assessment": {...questions...}}
```

---

## 🔧 Common Issues

### Issue: Jobs stuck in "waiting" state
**Solution:** Make sure worker is running (check logs for "[Worker]" messages)

### Issue: Wrong port error (4001 instead of 3001)
**Solution:** Already fixed! Backend uses port 3001

### Issue: `getUserPreferences is not a function`
**Solution:** Already fixed! Function added to API

### Issue: Redis version warning
**Solution:** Upgrade Redis to 6.2.0+ (optional, but recommended)

**Full troubleshooting guide:** See `TROUBLESHOOTING.md`

---

## 📁 Project Structure

```
LearnCheck-app/
├── backend/
│   ├── src/
│   │   ├── server.ts        # Main server (auto-starts worker)
│   │   ├── worker.ts        # Job processor
│   │   ├── services/
│   │   │   ├── gemini.service.ts
│   │   │   └── redis.service.ts
│   │   └── routes/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── services/
│   │   │   └── api.ts       # API client (port 3001)
│   │   └── utils/
│   └── package.json
├── TROUBLESHOOTING.md       # Detailed troubleshooting
└── QUICK_START.md          # This file
```

---

## 🎉 You're Ready!

Your LearnCheck app should now be running:
- **Backend:** http://localhost:3001
- **Frontend:** http://localhost:5173/?tutorial_id=35363&user_id=3
- **Worker:** Auto-started with backend

### Next Steps:
1. Try generating a quiz with different tutorial IDs
2. Test user preferences (theme, font size, etc.)
3. Review quiz results and analytics

### Need Help?
- Check `TROUBLESHOOTING.md` for common issues
- Review backend logs for worker activity
- Check browser console for frontend errors

---

## 🛠️ Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Backend: Automatically restarts on file changes (ts-node-dev)
- Frontend: Automatically refreshes on file changes (Vite)

### Debugging
```bash
# View Redis keys
redis-cli KEYS "*"

# View specific job
redis-cli GET "bull:assessment-generation:job:3-35363"

# Clear all Redis data (if needed)
redis-cli FLUSHALL
```

### Testing
```bash
# Backend tests
cd backend
npm test

# Integration tests
npm run test:integration
```

---

## 📝 Key Changes (Latest Update)

✅ **Fixed Issues:**
1. Added `getUserPreferences` function to API
2. Changed API URL from port 4001 → 3001
3. Worker now auto-starts with backend server
4. Better error handling and logging

✅ **Improvements:**
1. Clearer error messages
2. Development mode defaults for URL params
3. Comprehensive troubleshooting guide
4. Worker lifecycle management

---

## 📞 Support

If you encounter any issues not covered here:
1. Check `TROUBLESHOOTING.md` first
2. Review console logs (both backend and frontend)
3. Verify all prerequisites are installed and running
4. Try a clean install (`rm -rf node_modules && npm install`)

Happy coding! 🚀
# Troubleshooting Guide - LearnCheck App

## Common Issues and Solutions

### 1. ❌ Error: `getUserPreferences is not a function`

**Problem:** Frontend trying to call a function that doesn't exist in the API.

**Solution:** This has been fixed in `frontend/src/services/api.ts` by adding a mock `getUserPreferences` function that returns default preferences.

**Verification:**
```bash
# Check if the function exists in api.ts
grep -n "getUserPreferences" frontend/src/services/api.ts
```

---

### 2. ⏱️ Error: `Assessment generation timed out or failed`

**Problem:** Backend worker is not processing quiz generation jobs.

**Root Causes:**
1. Worker process not running
2. Wrong API URL (port mismatch)
3. Redis not running or outdated version

**Solutions:**

#### A. **Port Mismatch (FIXED)**
- Backend runs on port **3001** (not 4001)
- Fixed in `frontend/src/services/api.ts`

#### B. **Worker Not Running**

**Option 1: Run Worker Separately (Recommended for Development)**
```bash
# Terminal 1 - Start Backend Server
cd backend
npm run dev

# Terminal 2 - Start Worker
cd backend
npm run dev:worker
```

**Option 2: Auto-start Worker with Server (IMPLEMENTED)**
The worker now automatically starts when you run `npm run dev` in the backend.

**Verification:**
```bash
# You should see these logs when backend starts:
# [info]: Backend server running on http://localhost:3001
# [info]: [Worker] Assessment worker started with concurrency: 5
# [info]: [Worker] Job X-XXXXX is now active
```

#### C. **Redis Issues**

**Check if Redis is running:**
```bash
# Windows (if using Redis for Windows)
redis-cli ping
# Should return: PONG

# Check Redis version
redis-cli INFO server | grep redis_version
```

**Recommended Redis Version:** 6.2.0 or higher
**Current Warning:** Redis 5.0.14.1 (works but not optimal)

**Upgrade Redis (Windows):**
1. Download latest Redis from: https://github.com/tporadowski/redis/releases
2. Install and restart Redis service
3. Restart backend

---

### 3. 🔄 Jobs Stuck in "waiting" State

**Problem:** Backend logs show:
```
[info]: [Assessment] Job 3-35363 already in queue with state: waiting
```

**Cause:** Worker is not running to process the jobs.

**Solution:** Follow step 2B above to ensure worker is running.

**Verification:**
```bash
# When worker is running correctly, you should see:
# [info]: [Worker] Job X-XXXXX is now active
# [info]: [Worker] Processing job X-XXXXX for tutorial...
# [info]: [Worker] Job X-XXXXX completed
```

---

### 4. 🌐 CORS Errors

**Problem:** Browser shows CORS policy errors.

**Solution:**
1. Ensure backend is running on correct port (3001)
2. Check CORS configuration in `backend/src/app.ts`
3. Verify frontend is making requests to correct URL

**Check Configuration:**
```bash
# Frontend should point to:
http://localhost:3001

# Backend should allow:
http://localhost:5173 (or your frontend URL)
```

---

### 5. 🔑 Missing Environment Variables

**Problem:** Backend fails to initialize services.

**Required Environment Variables:**
```env
# backend/.env
PORT=3001
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_gemini_api_key_here
```

**Verification:**
```bash
cd backend
cat .env
```

---

### 6. 📦 Missing URL Parameters

**Problem:** Frontend shows "Missing required parameters: tutorial_id and user_id"

**Solution:**
Add URL parameters when accessing the app:
```
http://localhost:5173/?tutorial_id=35363&user_id=3
```

**Development Mode:**
In development, default values are used:
- `tutorial_id=dev-tutorial-123`
- `user_id=dev-user-456`

---

## Debugging Checklist

When something goes wrong, check these in order:

### Frontend:
- [ ] Is frontend running? (`npm run dev` in `frontend/`)
- [ ] Is API URL pointing to correct port? (should be `localhost:3001`)
- [ ] Are URL parameters provided or in dev mode?
- [ ] Check browser console for errors

### Backend:
- [ ] Is backend running? (`npm run dev` in `backend/`)
- [ ] Is worker running? (check logs for "[Worker]" messages)
- [ ] Is Redis running? (`redis-cli ping`)
- [ ] Check backend logs for errors
- [ ] Verify environment variables are set

### Network:
- [ ] Backend responds to health check: `curl http://localhost:3001/api/v1/health`
- [ ] No firewall blocking ports 3001, 5173, or 6379
- [ ] CORS configured correctly

---

## How to Verify Everything is Working

### 1. Check Backend Health
```bash
curl http://localhost:3001/api/v1/health
# Should return: {"status":"ok"}
```

### 2. Check Redis
```bash
redis-cli ping
# Should return: PONG
```

### 3. Check Worker
Look for these logs when backend starts:
```
[info]: Backend server running on http://localhost:3001
[info]: [Worker] Assessment worker started with concurrency: 5
```

### 4. Test Quiz Generation
```bash
curl "http://localhost:3001/api/v1/assessment?tutorial_id=35363&user_id=3"
# First call returns 202 (job created)
# Subsequent calls return 200 with quiz data (when ready)
```

### 5. Check Frontend
1. Open `http://localhost:5173/?tutorial_id=35363&user_id=3`
2. Should see loading spinner, then quiz questions
3. Check browser console for errors

---

## Log Interpretation

### Good Logs (Everything Working):
```
[info]: Backend server running on http://localhost:3001
[info]: [BullMQ] Redis connection established
[info]: [Worker] Assessment worker started with concurrency: 5
[info]: [Assessment] Added job 3-35363 to queue
[info]: [Worker] Job 3-35363 is now active
[info]: [Worker] Processing job 3-35363 for tutorial 35363
[info]: [Worker] Job 3-35363 completed
[http]: GET /api/v1/assessment?tutorial_id=35363&user_id=3 200
```

### Bad Logs (Problems):
```
# Worker not running:
[info]: [Assessment] Job 3-35363 already in queue with state: waiting

# Redis not connected:
[error]: [Redis] Connection failed

# Missing API key:
[error]: [Gemini] API key not configured

# Wrong port:
[error]: connect ECONNREFUSED ::1:4001
```

---

## Quick Fixes Summary

| Problem | Quick Fix |
|---------|-----------|
| `getUserPreferences is not a function` | Already fixed in code |
| Jobs stuck in waiting | Restart backend (worker auto-starts) |
| Wrong port (4001) | Already fixed in code (now uses 3001) |
| Redis outdated warning | Upgrade Redis to 6.2.0+ |
| Missing URL params | Add `?tutorial_id=35363&user_id=3` to URL |
| CORS errors | Check backend allows frontend origin |

---

## Getting Help

If issues persist:

1. **Collect Information:**
   - Frontend browser console logs
   - Backend terminal output
   - Redis status: `redis-cli INFO`
   - Node version: `node --version`
   - NPM version: `npm --version`

2. **Check Recent Changes:**
   - Git status: `git status`
   - Recent commits: `git log --oneline -5`

3. **Clean Install:**
   ```bash
   # Frontend
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   
   # Backend
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Restart Everything:**
   ```bash
   # Stop all processes (Ctrl+C)
   # Restart Redis
   redis-cli shutdown
   redis-server
   
   # Restart Backend
   cd backend
   npm run dev
   
   # Restart Frontend
   cd frontend
   npm run dev
   ```

---

## Contact & Support

- Check project README for setup instructions
- Review this troubleshooting guide first
- Include logs and error messages when asking for help
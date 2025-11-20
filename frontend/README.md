# LearnCheck Frontend

Frontend React + TypeScript untuk LearnCheck - AI-Powered Formative Assessment System.

## 🚀 Features

- ✅ **React 19** dengan TypeScript
- ✅ **Vite** untuk fast development
- ✅ **React Query** untuk state management
- ✅ **Axios** untuk HTTP requests
- ✅ **iFrame Ready** - Dapat di-embed di LMS
- ✅ **Responsive Design** - Mobile & Desktop
- ✅ **Real-time Feedback** dari AI
- ✅ **Progress Tracking** dengan visual progress bar

## 📦 Installation

```bash
npm install
```

## ⚙️ Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3001
```

## 🏃 Running

### Development Mode

```bash
npm run dev
```

App akan berjalan di `http://localhost:5173`

### Build untuk Production

```bash
npm run build
```

Output akan ada di folder `dist/`

### Preview Production Build

```bash
npm run preview
```

## 🌐 Usage

### Standalone Mode

Akses dengan URL parameters:

```
http://localhost:5173/?tutorial_id=35363&user_id=user123
```

### iFrame Embed Mode

```html
<iframe 
  src="http://localhost:5173/?tutorial_id=35363&user_id=user123"
  width="100%" 
  height="700"
  frameborder="0"
></iframe>
```

### Required Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `tutorial_id` | string | Tutorial/Module ID | `35363` |
| `user_id` | string | User ID | `user123` |

## 📁 Project Structure

```
frontend/
├── public/
│   └── demo-iframe.html       # Demo page untuk iframe
├── src/
│   ├── components/
│   │   ├── QuizContainer.tsx   # Main quiz container
│   │   ├── QuestionCard.tsx    # Question display
│   │   ├── FeedbackCard.tsx    # Feedback display
│   │   ├── ProgressCard.tsx    # Progress tracker
│   │   └── ResultCard.tsx      # Result screen
│   ├── services/
│   │   └── api.ts              # API client
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   ├── utils/
│   │   └── iframeParams.ts     # URL param extraction
│   ├── App.tsx                 # Main app component
│   ├── App.css                 # Styling
│   └── main.tsx                # Entry point
├── .env                        # Environment variables
├── .env.example                # Environment template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎨 Components

### QuizContainer

Main container yang menghandle quiz flow.

```typescript
<QuizContainer
  tutorialId="35363"
  userId="user123"
/>
```

### QuestionCard

Menampilkan pertanyaan dan options.

**Features:**
- Multiple choice (4 options)
- Difficulty badge
- Selected state indication

### FeedbackCard

Menampilkan feedback dari AI setelah submit.

**Features:**
- Correct/Incorrect indication
- AI-generated explanation
- Next question button

### ProgressCard

Menampilkan progress dan score.

**Features:**
- Question counter
- Attempt number
- Score tracking
- Progress bar animation

### ResultCard

Menampilkan hasil akhir quiz.

**Features:**
- Score visualization
- Percentage calculation
- Retry button

## 🔌 API Integration

Frontend berkomunikasi dengan backend melalui REST API:

### Generate Questions

```typescript
POST /api/questions/generate
Body: {
  tutorial_id: string,
  user_id: string,
  attempt_number: number
}
```

### Submit Answer

```typescript
POST /api/answers/submit
Body: {
  question_id: string,
  selected_answer: number,
  user_id: string
}
```

### Save Progress

```typescript
POST /api/progress/save
Body: {
  user_id: string,
  tutorial_id: string,
  attempt_data: {...}
}
```

### Get Progress

```typescript
GET /api/progress/:user_id/:tutorial_id
```

## 🎯 iFrame Integration

### Basic Embed

```html
<iframe 
  src="https://your-domain.com/?tutorial_id={tutorial_id}&user_id={user_id}"
  width="100%" 
  height="700"
></iframe>
```

### Responsive Embed

```html
<div style="position: relative; padding-bottom: 75%; height: 0;">
  <iframe 
    src="https://your-domain.com/?tutorial_id={tutorial_id}&user_id={user_id}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    frameborder="0"
  ></iframe>
</div>
```

### Dynamic Embed (JavaScript)

```javascript
const tutorialId = '35363';
const userId = getCurrentUserId();

const iframe = document.createElement('iframe');
iframe.src = `https://your-domain.com/?tutorial_id=${tutorialId}&user_id=${userId}`;
iframe.width = '100%';
iframe.height = '700';

document.getElementById('container').appendChild(iframe);
```

## 🎨 Styling

### CSS Variables

```css
--primary-color: #3b82f6;
--success-color: #10b981;
--danger-color: #ef4444;
--warning-color: #f59e0b;
```

### Difficulty Badges

- **Easy**: Green badge
- **Medium**: Orange badge
- **Hard**: Red badge

### Responsive Breakpoints

- Desktop: > 640px
- Mobile: ≤ 640px

## 🧪 Testing

### Test Standalone

```bash
npm run dev
```

Akses: `http://localhost:5173/?tutorial_id=35363&user_id=test_user`

### Test iFrame

Buka `public/demo-iframe.html` di browser atau akses:

```
http://localhost:5173/demo-iframe.html
```

## 🚀 Deployment

### Build Production

```bash
npm run build
```

### Deploy ke Static Hosting

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod

# Manual
# Upload folder dist/ ke web server
```

### Environment Variables (Production)

```env
VITE_API_URL=https://api.your-domain.com
```

## 🔒 CORS Configuration

Backend harus mengizinkan origin dari frontend untuk iFrame:

```javascript
// Backend CORS config
ALLOWED_ORIGINS=https://your-frontend.com,https://your-lms.com
```

## 📱 Responsive Design

- Mobile-first approach
- Optimized untuk semua screen sizes
- Touch-friendly buttons
- Smooth animations

## ⚡ Performance

- Code splitting dengan Vite
- Lazy loading components
- React Query caching
- Optimized bundle size

## 🐛 Troubleshooting

### CORS Error

**Problem**: `Access-Control-Allow-Origin error`

**Solution**: 
1. Check backend CORS configuration
2. Add frontend origin ke `ALLOWED_ORIGINS`

### iFrame tidak load

**Problem**: iFrame kosong/blank

**Solution**:
1. Check URL parameters (tutorial_id & user_id)
2. Open browser console untuk error messages
3. Verify backend is running

### Questions tidak muncul

**Problem**: Loading forever

**Solution**:
1. Check backend API URL di `.env`
2. Verify backend & LLM service running
3. Check browser network tab

## 📚 Documentation

- [Main README](../README.md)
- [Backend API Docs](../backend/README.md)
- [LLM Service Docs](../llm_service/README.md)
- [TypeScript Guide](../TYPESCRIPT.md)

## 🎓 Usage Examples

### Example 1: Dicoding Classroom

```html
<!-- Embed di Dicoding Classroom -->
<iframe 
  src="https://learncheck.dicoding.com/?tutorial_id={{tutorial.id}}&user_id={{user.id}}"
  width="100%" 
  height="700"
  allow="fullscreen"
></iframe>
```

### Example 2: Custom LMS

```javascript
// Custom LMS Integration
function embedLearnCheck(containerId, tutorialId, userId) {
  const container = document.getElementById(containerId);
  const iframe = document.createElement('iframe');
  
  iframe.src = `https://learncheck.example.com/?tutorial_id=${tutorialId}&user_id=${userId}`;
  iframe.width = '100%';
  iframe.height = '700';
  iframe.frameBorder = '0';
  iframe.allow = 'fullscreen';
  
  container.appendChild(iframe);
}

// Usage
embedLearnCheck('quiz-container', '35363', 'user123');
```

## 📄 License

ISC

## 👥 Team

Team A25-CS156

---

**Built with ❤️ using React 19 + TypeScript + Vite**

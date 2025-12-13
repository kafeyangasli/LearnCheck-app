# LearnCheck App

LearnCheck adalah aplikasi kuis interaktif yang dirancang untuk diintegrasikan ke dalam platform LMS (seperti Dicoding Classroom) menggunakan iFrame. Aplikasi ini memanfaatkan Generative AI (Gemini) untuk menghasilkan soal-soal formatif secara otomatis berdasarkan konteks materi yang sedang dipelajari siswa.

## Fitur Utama

*   **AI-Powered Assessment**: Menghasilkan soal pilihan ganda (multiple choice) secara otomatis menggunakan Google Gemini AI.
*   **Seamless Integration**: Dirancang untuk di-embed via iFrame dengan dukungan parameter URL (tutorial_id, user_id).
*   **Adaptive UI**: Tampilan yang responsif dan mengikuti tema LMS (mendukung Dark Mode, pengaturan Font Size, dan gaya Font).
*   **State Persistence**: Menyimpan progress pengerjaan kuis di browser siswa, sehingga data aman meskipun berpindah halaman (selama sesi/user valid).
*   **Background Processing**: Menggunakan sistem antrian (Queue) untuk generate soal yang berat agar tidak membebani user experience.

## Tech Stack

### Frontend
*   **Framework**: React (Vite)
*   **Styling**: Tailwind CSS
*   **State Management**: React Query (TanStack Query) & Custom Hooks
*   **Language**: TypeScript

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **AI Integration**: Google Generative AI SDK (Gemini)
*   **Queue System**: BullMQ
*   **Cache & Broker**: Redis
*   **Language**: TypeScript

## Prasyarat

Sebelum menjalankan aplikasi, pastikan Anda telah menginstal:
*   Node.js (v18+)
*   Redis (Wajib untuk backend queue system)

## Cara Menjalankan Aplikasi

### 1. Setup Backend
Masuk ke folder backend, instal dependensi, dan atur environment variables.

```bash
cd backend
npm install
cp .env.example .env
```

**Konfigurasi .env Backend:**
Pastikan Redis berjalan dan Anda memiliki API Key Gemini.
```env
PORT=4001
REDIS_URL=redis://localhost:6379 
GEMINI_API_KEY=masukkan_api_key_gemini_anda
```

Jalankan server backend:
```bash
npm run dev
# Server akan berjalan di http://localhost:4001
```

### 2. Setup Frontend
Buka terminal baru, masuk ke folder frontend.

```bash
cd frontend
npm install
cp .env.example .env
```

**Konfigurasi .env Frontend:**
```env
VITE_API_URL=http://localhost:4001
```

Jalankan aplikasi frontend:
```bash
npm run dev
# Aplikasi akan berjalan di http://localhost:5173
```

## Cara Penggunaan (Simulasi iFrame)

Untuk mensimulasikan penggunaan di dalam LMS, buka browser dengan URL berikut:

```
http://localhost:5173?tutorial_id=35363&user_id=1
```

*   **tutorial_id**: ID materi yang sedang dibuka (contoh: 35363).
*   **user_id**: ID pengguna (contoh: 1, 2, dst).

**Catatan**: Mengganti user_id akan mensimulasikan pengguna yang berbeda dengan preferensi tampilan dan progress kuis yang terisolasi.

## Kontributor (Capstone Team)

*   **R004D5Y0212** - Andika Insan Patria - REBE
*   **R004D5Y0985** - Krisna Setia Himawhan - REBE
*   **R013D5Y1076** - Markus Prap Kurniawan - REBE
*   **R182D5Y1713** - Rifki Saputra - REBE
*   **R200D5Y1085** - Maulana Ghazzam Adil Al Faiq - REBE

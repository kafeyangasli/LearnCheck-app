/**
 * Frontend application constants
 */

export const QUIZ_CONFIG = {
  TIMER_DURATION_MINUTES: 5,
  TOTAL_QUESTIONS: 3,
  DEBOUNCE_MS: 200,
  POSTMESSAGE_DELAY_MS: 300, // Delay for parent window message handling
} as const;

export const STORAGE_CONFIG = {
  KEY_PREFIX: 'learncheck',
} as const;

export const API_ENDPOINTS = {
  PREFERENCES: '/preferences',
  ASSESSMENT: '/assessment',
} as const;

export const THEME_OPTIONS = ['dark', 'light'] as const;
export const FONT_SIZE_OPTIONS = ['small', 'medium', 'large'] as const;
export const FONT_STYLE_OPTIONS = ['default', 'serif', 'mono'] as const;
export const LAYOUT_WIDTH_OPTIONS = ['fullWidth', 'standard'] as const;

export const RESULT_MESSAGES = {
  PERFECT: {
    title: "Luar Biasa! Pemahaman Sempurna!",
    subtitle: "Kamu menguasai materi ini dengan sangat baik! 🎉",
  },
  EXCELLENT: {
    title: "Hebat! Skor Tinggi!",
    subtitle: "Pemahaman kamu sudah sangat baik. Tinggal sedikit lagi untuk sempurna! 🌟",
  },
  GOOD: {
    title: "Bagus! Sudah Lumayan Paham!",
    subtitle: "Kamu sudah menguasai sebagian besar materi. Terus belajar ya! 💪",
  },
  NEED_IMPROVEMENT: {
    title: "Ayo Semangat! Belajar Lagi Yuk!",
    subtitle: "Sepertinya ada beberapa konsep yang perlu dipelajari lagi. Jangan menyerah! 📚",
  },
} as const;

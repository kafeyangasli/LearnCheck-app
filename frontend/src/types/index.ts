// Question types
export interface Question {
  question_id: string;
  question: string;
  options: string[] | { id: string; text: string }[];
  difficulty: "easy" | "medium" | "hard";
  correctOptionId?: string; // For local validation
  explanation?: string;     // For feedback
  _rawOptions?: { id: string; text: string }[]; // Internal use for validation
}

export interface QuestionResponse {
  status: string;
  data: {
    questions: Question[];
    tutorial_id: string;
    user_id: string;
    attempt_number: number;
    difficulty: string;
  };
}

// Answer types removed
// Progress types removed

// App State
export interface QuizState {
  currentQuestionIndex: number;
  selectedAnswers: (number | null)[];
  showFeedback: boolean;
  feedback: string | null;
  isCorrect: boolean | null;
  score: number;
  isCompleted: boolean;
  startTime: number;
  questionStartTimes: number[]; // Track when each question was started
}

// Iframe Params
export interface IframeParams {
  tutorial_id: string;
  user_id: string;
}

// User Preferences
export interface UserPreferences {
  layoutWidth: "fullWidth" | "mediumWidth";
  fontStyle: "default" | "serif" | "monospace";
  theme: "light" | "dark" | "auto";
  fontSize: "small" | "medium" | "large";
}

// Question types
export interface Question {
  question_id: string;
  question: string;
  options: string[];
  difficulty: "easy" | "medium" | "hard";
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

// Answer types
export interface AnswerSubmission {
  question_id: string;
  selected_answer: number;
  user_id: string;
}

export interface AnswerResponse {
  status: string;
  data: {
    is_correct: boolean;
    correct_answer: number;
    selected_answer: number;
    feedback: string;
  };
}

// Progress types
export interface AttemptData {
  timestamp: string;
  score: number;
  total_questions: number;
  difficulty: string;
  time_taken?: number;
  answers: Array<{
    question_id: string;
    selected_answer: number;
    is_correct: boolean;
  }>;
}

export interface Progress {
  user_id: string;
  tutorial_id: string;
  attempts: Array<{
    attempt_number: number;
    timestamp: string;
    score: number;
    total_questions: number;
    difficulty: string;
  }>;
  total_attempts?: number;
  average_score?: string;
  best_score?: number;
}

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
}

// Iframe Params
export interface IframeParams {
  tutorial_id: string;
  user_id: string;
}

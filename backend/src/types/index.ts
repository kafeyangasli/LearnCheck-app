// Question types
export interface Question {
  question: string;
  options: string[];
  correct_answer: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface QuestionWithMetadata extends Question {
  question_id: string;
  tutorial_id: string;
  user_id: string;
  attempt_number: number;
  created_at: string;
}

// Tutorial types
export interface TutorialContent {
  tutorialId: string;
  content: string;
  rawContent: string;
}

// Progress types
export interface AttemptAnswer {
  question_id: string;
  selected_answer: number;
  is_correct: boolean;
}

export interface AttemptData {
  timestamp: string;
  score: number;
  total_questions?: number;
  difficulty?: string;
  time_taken?: number;
  answers?: AttemptAnswer[];
}

export interface Attempt extends AttemptData {
  attempt_number: number;
  total_questions: number;
  difficulty: string;
  answers: AttemptAnswer[];
}

export interface Progress {
  user_id: string;
  tutorial_id: string;
  attempts: Attempt[];
  total_attempts?: number;
  average_score?: string;
  best_score?: number;
  last_attempt?: string;
}

// Answer validation types
export interface AnswerValidationResult {
  isCorrect: boolean;
  correctAnswer: number;
  selectedAnswer: number;
  question: string;
  options: string[];
}

// LLM Service types
export interface LLMQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface LLMQuestionResponse {
  questions: LLMQuestion[];
  count: number;
  difficulty: string;
}

export interface FeedbackResponse {
  feedback: string;
  isCorrect: boolean;
}

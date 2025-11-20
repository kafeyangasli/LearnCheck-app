// LLM Question types
export interface LLMQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface GenerateQuestionsRequest {
  content: string;
  difficulty: "easy" | "medium" | "hard";
  count: number;
}

export interface GenerateQuestionsResponse {
  status: string;
  data: {
    questions: LLMQuestion[];
    count: number;
    difficulty: string;
  };
}

// Feedback types
export interface GenerateFeedbackRequest {
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface GenerateFeedbackResponse {
  status: string;
  data: {
    feedback: string;
    isCorrect: boolean;
  };
}

export interface Question {
    question_id: string;
    question: string;
    options: string[] | { id: string; text: string }[];
    difficulty: "easy" | "medium" | "hard";
    correctOptionId?: string;
    explanation?: string;
    _rawOptions?: { id: string; text: string }[];
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

export interface QuizState {
    currentQuestionIndex: number;
    selectedAnswers: (number | null)[];
    showFeedback: boolean;
    feedback: string | null;
    isCorrect: boolean | null;
    score: number;
    isCompleted: boolean;
    startTime: number;
    questionStartTimes: number[];
}

import { useState, useEffect } from "react";
import { learnCheckApi } from "../services/api";
import type { Question, QuizState } from "../types";
import QuestionCard from "./QuestionCard";
import FeedbackCard from "./FeedbackCard";
import ProgressCard from "./ProgressCard";
import ResultCard from "./ResultCard";

interface QuizContainerProps {
  tutorialId: string;
  userId: string;
}

const QuizContainer = ({ tutorialId, userId }: QuizContainerProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attemptNumber, setAttemptNumber] = useState(1);

  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    selectedAnswers: [],
    showFeedback: false,
    feedback: null,
    isCorrect: null,
    score: 0,
    isCompleted: false,
    startTime: Date.now(),
  });

  // Storage key for persistence
  const STORAGE_KEY = `quiz_state_${tutorialId}_${userId}`;

  // Load questions and state on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);

    if (savedState) {
      try {
        const { questions: savedQuestions, quizState: savedQuizState, attemptNumber: savedAttempt } = JSON.parse(savedState);

        if (savedQuestions && savedQuestions.length > 0) {
          setQuestions(savedQuestions);
          setQuizState(savedQuizState);
          setAttemptNumber(savedAttempt || 1);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved state", e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    loadQuestions();
  }, [tutorialId, userId]);

  // Save state on change
  useEffect(() => {
    if (!loading && questions.length > 0) {
      const stateToSave = {
        questions,
        quizState,
        attemptNumber
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [questions, quizState, attemptNumber, loading]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Default to attempt 1 since backend doesn't track attempts anymore
      setAttemptNumber(1);

      // Generate questions
      const response = await learnCheckApi.generateQuestions(
        tutorialId,
        userId,
        1, // attempt_number
      );

      setQuestions(response.data.questions);
      setQuizState((prev) => ({
        ...prev,
        selectedAnswers: new Array(response.data.questions.length).fill(null),
        startTime: Date.now(),
        isCompleted: false,
        score: 0,
        currentQuestionIndex: 0,
        showFeedback: false,
        feedback: null,
        isCorrect: null,
      }));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load questions");
      console.error("Error loading questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setQuizState((prev) => {
      const newAnswers = [...prev.selectedAnswers];
      newAnswers[prev.currentQuestionIndex] = answerIndex;
      return { ...prev, selectedAnswers: newAnswers };
    });
  };

  const handleSubmitAnswer = async () => {
    const currentQuestion = questions[quizState.currentQuestionIndex];
    const selectedAnswer =
      quizState.selectedAnswers[quizState.currentQuestionIndex];

    if (selectedAnswer === null) {
      alert("Please select an answer");
      return;
    }

    // Local Validation Logic (New Backend)
    let isCorrect = false;
    let feedback = "";

    // Feedback Prefixes (From WS 2)
    const correctPrefixes = [
      "Mantap, jawabanmu benar! ",
      "Tepat sekali! ",
      "Keren, kamu paham konsepnya! ",
      "Betul! Lanjutkan momentum belajarmu! ",
      "Luar biasa, pemahamanmu solid! "
    ];

    const incorrectPrefixes = [
      "Hampir benar! Coba kita lihat lagi yuk. ",
      "Belum tepat, tapi jangan khawatir, ini bagian dari belajar. ",
      "Oops, masih kurang pas. Yuk kita bedah bareng! ",
      "Sedikit lagi! Coba perhatikan penjelasan berikut. ",
      "Jawabanmu keliru, tapi ini kesempatan bagus untuk belajar. "
    ];

    if (currentQuestion._rawOptions && currentQuestion.correctOptionId) {
      const selectedOptionId = currentQuestion._rawOptions[selectedAnswer].id;
      isCorrect = selectedOptionId === currentQuestion.correctOptionId;

      // Smart Feedback Generation
      const prefix = isCorrect
        ? correctPrefixes[Math.floor(Math.random() * correctPrefixes.length)]
        : incorrectPrefixes[Math.floor(Math.random() * incorrectPrefixes.length)];

      // Parse Explanation & Hint
      const rawExplanation = currentQuestion.explanation || "";
      const explanationParts = rawExplanation.split('Hint:');
      const mainExplanation = explanationParts[0].trim();
      const hintText = explanationParts.length > 1 ? explanationParts[1].trim() : null;

      // Combine for WS 1 UI
      feedback = `${prefix}\n\n${mainExplanation}`;
      if (hintText) {
        feedback += `\n\n💡 Hint: ${hintText}`;
      }

    } else {
      // Fallback for legacy or missing data
      console.warn("Missing validation data for question", currentQuestion.question_id);
      feedback = "Feedback unavailable";
    }

    setQuizState((prev) => ({
      ...prev,
      showFeedback: true,
      feedback: feedback,
      isCorrect: isCorrect,
      score: prev.score + (isCorrect ? 1 : 0),
    }));
  };

  const handleNextQuestion = () => {
    const isLastQuestion =
      quizState.currentQuestionIndex === questions.length - 1;

    if (isLastQuestion) {
      // Complete quiz
      completeQuiz();
    } else {
      // Move to next question
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        showFeedback: false,
        feedback: null,
        isCorrect: null,
        isCompleted: false, // Ensure not completed
      }));
    }
  };

  const completeQuiz = async () => {
    // Just mark as completed locally
    setQuizState((prev) => ({ ...prev, isCompleted: true }));
    // We do NOT clear storage here, so user can see result on reload
  };

  const handleRetry = () => {
    // Clear storage to force fresh start
    localStorage.removeItem(STORAGE_KEY);

    setQuizState({
      currentQuestionIndex: 0,
      selectedAnswers: [],
      showFeedback: false,
      feedback: null,
      isCorrect: null,
      score: 0,
      isCompleted: false,
      startTime: Date.now(),
    });
    loadQuestions();
  };

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-container">
        <div className="error-state">
          <h3>❌ Error</h3>
          <p>{error}</p>
          <button onClick={loadQuestions} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (quizState.isCompleted) {
    return (
      <div className="quiz-container">
        <ResultCard
          score={quizState.score}
          totalQuestions={questions.length}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  const currentQuestion = questions[quizState.currentQuestionIndex];
  const selectedAnswer =
    quizState.selectedAnswers[quizState.currentQuestionIndex];

  return (
    <div className="quiz-container">
      <ProgressCard
        currentQuestion={quizState.currentQuestionIndex + 1}
        totalQuestions={questions.length}
        score={quizState.score}
        attemptNumber={attemptNumber}
      />

      {!quizState.showFeedback ? (
        <QuestionCard
          question={currentQuestion}
          questionNumber={quizState.currentQuestionIndex + 1}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={handleAnswerSelect}
          onSubmit={handleSubmitAnswer}
        />
      ) : (
        <FeedbackCard
          feedback={quizState.feedback!}
          isCorrect={quizState.isCorrect!}
          onNext={handleNextQuestion}
          isLastQuestion={
            quizState.currentQuestionIndex === questions.length - 1
          }
        />
      )}
    </div>
  );
};

export default QuizContainer;

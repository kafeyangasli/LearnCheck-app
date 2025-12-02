import { useState, useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { learnCheckApi } from "../services/api";
import type { Question, QuizState } from "../types";
import IntroCard from "./IntroCard";
import QuestionCard from "./QuestionCard";
import ResultCard from "./ResultCard";

interface QuizContainerProps {
  tutorialId: string;
  userId: string;
}

const QuizContainer = ({ tutorialId, userId }: QuizContainerProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);

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

  // Load questions on mount
  useEffect(() => {
    loadQuestions(false);
  }, []);

  const loadQuestions = async (newSession: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await learnCheckApi.generateQuestions(
        tutorialId,
        userId,
        1,
        newSession,
      );

      setQuestions(response.data.questions);
      setQuizState((prev) => ({
        ...prev,
        selectedAnswers: new Array(response.data.questions.length).fill(null),
        startTime: Date.now(),
      }));
    } catch (err: any) {
      const errorMessage =
        err.message || err.response?.data?.message || "Gagal memuat pertanyaan";
      setError(errorMessage);
      console.error("Error loading questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setShowIntro(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (quizState.showFeedback) return;

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
      alert("Silakan pilih jawaban");
      return;
    }

    let isCorrect = false;
    let feedback = "";

    const correctPrefixes = [
      "Mantap, jawabanmu benar! ",
      "Tepat sekali! ",
      "Keren, kamu paham konsepnya! ",
      "Betul! Lanjutkan momentum belajarmu! ",
      "Luar biasa, pemahamanmu solid! ",
    ];

    const incorrectPrefixes = [
      "Yahh, jawabanmu masih kurang tepat! ",
      "Belum tepat, tapi jangan khawatir, ini bagian dari belajar. ",
      "Oops, masih kurang pas. Yuk kita bedah bareng! ",
      "Sedikit lagi! Coba perhatikan penjelasan berikut. ",
      "Jawabanmu keliru, tapi ini kesempatan bagus untuk belajar. ",
    ];

    if (currentQuestion._rawOptions && currentQuestion.correctOptionId) {
      const selectedOptionId = currentQuestion._rawOptions[selectedAnswer].id;
      isCorrect = selectedOptionId === currentQuestion.correctOptionId;

      const prefix = isCorrect
        ? correctPrefixes[Math.floor(Math.random() * correctPrefixes.length)]
        : incorrectPrefixes[
            Math.floor(Math.random() * incorrectPrefixes.length)
          ];

      const rawExplanation = currentQuestion.explanation || "";
      const explanationParts = rawExplanation.split("Hint:");
      const mainExplanation = explanationParts[0].trim();
      const hintText =
        explanationParts.length > 1 ? explanationParts[1].trim() : null;

      feedback = `${prefix}${mainExplanation}`;
      if (hintText) {
        feedback += `\n\nHint: ${hintText}`;
      }
    } else {
      console.warn(
        "Missing validation data for question",
        currentQuestion.question_id,
      );
      feedback = "Feedback tidak tersedia";
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
      completeQuiz();
    } else {
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        showFeedback: false,
        feedback: null,
        isCorrect: null,
      }));
    }
  };

  const completeQuiz = async () => {
    setQuizState((prev) => ({ ...prev, isCompleted: true }));
  };

  const handleRetry = () => {
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
    setShowIntro(true);
    loadQuestions(true);
  };

  // Show error state
  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Terjadi Kesalahan
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => loadQuestions(false)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Show intro card first
  if (showIntro) {
    return (
      <div className="py-8 px-4">
        <IntroCard
          totalQuestions={questions.length > 0 ? questions.length : 3}
          isLoading={loading}
          onStart={handleStartQuiz}
        />
      </div>
    );
  }

  // Show result card when quiz is completed
  if (quizState.isCompleted) {
    return (
      <div className="py-8 px-4">
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
    <div className="py-8 px-4">
      <QuestionCard
        question={currentQuestion}
        questionNumber={quizState.currentQuestionIndex + 1}
        totalQuestions={questions.length}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={handleAnswerSelect}
        onSubmit={handleSubmitAnswer}
        onNext={handleNextQuestion}
        showFeedback={quizState.showFeedback}
        isCorrect={quizState.isCorrect}
        feedback={quizState.feedback}
        isLastQuestion={quizState.currentQuestionIndex === questions.length - 1}
      />
    </div>
  );
};

export default QuizContainer;

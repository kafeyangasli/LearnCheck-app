import { useEffect } from "react";
import QuestionCard from "./QuestionCard";
import IntroCard from "./IntroCard";
import ResultCard from "./ResultCard";
import SkeletonLoader from "../../../components/SkeletonLoader";
import { useQuiz } from "../hooks/useQuiz";
import type { UserPreferences } from "../../../types";

interface QuizContainerProps {
  tutorialId: string;
  userId: string;
  isDark?: boolean;
  fontSize: UserPreferences["fontSize"];
}

const QuizContainer = ({
  tutorialId,
  userId,
  isDark = false,
  fontSize,
}: QuizContainerProps) => {
  const {
    questions,
    quizState,
    loading: isLoading,
    error,

    handleAnswerSelect,
    handleSubmitAnswer,
    handleNextQuestion,
    handleRetry,
    handleRestart,
    handleTimeout,
    quizStarted,
    startQuiz,
  } = useQuiz({ tutorialId, userId });

  // dark mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  if (quizStarted && isLoading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[600px] p-8 rounded-[1.25rem] bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
            Terjadi Kesalahan
          </h2>
          <p className="mb-6 text-slate-700 dark:text-slate-300 text-[0.95rem]">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold border-none cursor-pointer transition-all shadow-sm bg-primary-600 text-white hover:bg-primary-700 hover:-translate-y-px hover:shadow-md"
          >
            Muat Ulang Halaman
          </button>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="w-full flex justify-center">
        <div className="w-full">
          <IntroCard
            totalQuestions={questions.length || 3}
            isLoading={isLoading}
            onStart={startQuiz}
            fontSize={fontSize}
          />
        </div>
      </div>
    );
  }

  if (quizState.isCompleted) {
    return (
      <ResultCard
        score={quizState.score}
        totalQuestions={questions.length}
        onRetry={handleRestart}
        onHome={handleRetry}
        isDark={isDark}
        fontSize={fontSize}
      />
    );
  }

  const currentQuestion = questions[quizState.currentQuestionIndex];
  const selectedAnswer =
    quizState.selectedAnswers[quizState.currentQuestionIndex];

  return (
    <div className="w-full flex justify-center">
      <div className="w-full">
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
          isLastQuestion={
            quizState.currentQuestionIndex === questions.length - 1
          }
          questionStartTime={quizState.startTime}
          onTimeout={handleTimeout}
          fontSize={fontSize}
        />
      </div>
    </div>
  );
};

export default QuizContainer;

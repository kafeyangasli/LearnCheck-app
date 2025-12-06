import { useState, useEffect } from "react";
import { Check, X, Clock, Lightbulb } from "lucide-react";
import type { Question } from "../types";
import { cn } from "../../../lib/utils";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onAnswerSelect: (index: number) => void;
  onSubmit: () => void;
  onNext: () => void;
  showFeedback: boolean;
  isCorrect: boolean | null;
  feedback: string | null;
  isLastQuestion: boolean;
  questionStartTime: number;
  onTimeout: () => void;
}

const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onSubmit,
  onNext,
  showFeedback,
  isCorrect,
  feedback,
  isLastQuestion,
  questionStartTime,
  onTimeout,
}: QuestionCardProps) => {
  const QUESTION_TIME_LIMIT = 180;

  const calculateTimeRemaining = () => {
    const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
    return Math.max(0, QUESTION_TIME_LIMIT - elapsed);
  };

  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        onTimeout();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [showFeedback, questionStartTime, onTimeout]);

  useEffect(() => {
    setTimeRemaining(calculateTimeRemaining());
  }, [questionNumber, questionStartTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}m:${String(secs).padStart(
      2,
      "0"
    )}s`;
  };

  const getCorrectAnswerIndex = (): number => {
    if (question._rawOptions && question.correctOptionId) {
      return question._rawOptions.findIndex(
        (opt) => opt.id === question.correctOptionId
      );
    }
    return -1;
  };

  const correctAnswerIndex = getCorrectAnswerIndex();

  const parseFeedback = (feedbackText: string | null) => {
    if (!feedbackText) return { mainText: "", hint: null };

    const hintMatch = feedbackText.match(/💡 Hint: (.+)$/s);
    let mainText = feedbackText;
    let hint: string | null = null;

    if (hintMatch) {
      mainText = feedbackText.replace(/\n\n💡 Hint: .+$/s, "");
      hint = hintMatch[1];
    }

    return { mainText, hint };
  };

  const { mainText, hint } = parseFeedback(feedback);

  const getOptionStatus = (
    index: number
  ): "correct" | "incorrect" | "selected" | "neutral" => {
    if (!showFeedback) {
      return selectedAnswer === index ? "selected" : "neutral";
    }

    if (index === correctAnswerIndex) {
      return "correct";
    }

    if (index === selectedAnswer && !isCorrect) {
      return "incorrect";
    }

    return "neutral";
  };

  const progress = ((questionNumber) / totalQuestions) * 100;

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header Section */}
      <div className="p-6 md:p-8 pb-0">
        <div className="flex items-center justify-between mb-6">
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            Pertanyaan {questionNumber} dari {totalQuestions}
          </span>
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-sm font-bold">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        </div>

        <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <h2 className="text-xl md:text-2xl font-bold leading-relaxed text-slate-900 dark:text-white mb-8">
          {question.question}
        </h2>

        <div className="flex flex-col gap-4">
          {question.options.map((option, index) => {
            const status = getOptionStatus(index);
            const optionText = typeof option === "object" ? option.text : option;
            const isClickable = !showFeedback;

            return (
              <div
                key={index}
                onClick={() => isClickable && onAnswerSelect(index)}
                className={cn(
                  "group flex items-center justify-between p-4 md:p-5 rounded-lg border transition-all duration-200",
                  !isClickable ? "cursor-default" : "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50",

                  status === "neutral" && "border-slate-200 dark:border-slate-700 bg-transparent",

                  status === "selected" && !showFeedback && "border-slate-400 dark:border-slate-500 bg-slate-50 dark:bg-slate-700/30",

                  status === "correct" && "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",

                  status === "incorrect" && "border-red-400 bg-red-50 dark:bg-red-500/10"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-6 h-6 shrink-0 rounded-full border flex items-center justify-center transition-all",

                    status === "neutral" && "border-slate-400 dark:border-slate-500 group-hover:border-slate-500",

                    status === "selected" && !showFeedback && "border-slate-900 dark:border-white bg-transparent",

                    status === "correct" && "border-emerald-500 bg-emerald-500 text-white",

                    status === "incorrect" && "border-red-500 bg-red-500 text-white"
                  )}>
                    {status === "correct" && <Check className="w-4 h-4" strokeWidth={3} />}
                    {status === "incorrect" && <X className="w-4 h-4" strokeWidth={3} />}
                    {status === "selected" && !showFeedback && <div className="w-3 h-3 rounded-full bg-slate-900 dark:bg-white" />}
                  </div>

                  <span className="text-base font-medium text-slate-700 dark:text-slate-200">
                    {optionText}
                  </span>
                </div>

                {status === "correct" && (
                  <div className="text-emerald-500">
                    <CheckCircleIcon className="w-6 h-6" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showFeedback && (
        <div className="p-6 md:p-8 border-t border-slate-200 dark:border-slate-700 mt-8 bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">
            Penjelasan
          </h3>
          <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300 mb-6">
            {mainText}
          </p>

          {hint && (
            <div className="p-5 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800/50">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-sm font-bold text-cyan-700 dark:text-cyan-300 mb-1">
                    Hint
                  </span>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {hint}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-6 md:p-8 pt-0 mt-8 flex justify-end">
        {!showFeedback ? (
          <button
            onClick={onSubmit}
            disabled={selectedAnswer === null}
            className={cn(
              "px-8 py-3 rounded-lg text-base font-semibold border-none transition-all shadow-sm text-white",
              selectedAnswer !== null
                ? "bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
            )}
          >
            Submit Jawaban
          </button>
        ) : (
          <button
            onClick={onNext}
            className="px-8 py-3 rounded-lg text-base font-semibold border-none cursor-pointer transition-all shadow-sm bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-md"
          >
            {isLastQuestion ? "Akhiri Kuis" : "Soal Berikutnya"}
          </button>
        )}
      </div>
    </div>
  );
};

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

export default QuestionCard;

import { useState, useEffect } from "react";
import { Check, X, Clock, Lightbulb } from "lucide-react";
import type { Question } from "../types";

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
  isDark?: boolean;
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
  isDark = false,
}: QuestionCardProps) => {
  const [timeRemaining, setTimeRemaining] = useState(180);

  // Timer effect
  useEffect(() => {
    if (showFeedback) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showFeedback]);

  // Reset timer when question changes
  useEffect(() => {
    setTimeRemaining(180);
  }, [questionNumber]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}m:${String(secs).padStart(2, "0")}s`;
  };

  // Find the correct answer index
  const getCorrectAnswerIndex = (): number => {
    if (question._rawOptions && question.correctOptionId) {
      return question._rawOptions.findIndex(
        (opt) => opt.id === question.correctOptionId,
      );
    }
    return -1;
  };

  const correctAnswerIndex = getCorrectAnswerIndex();

  // Parse feedback to extract main explanation and hint
  const parseFeedback = (feedbackText: string | null) => {
    if (!feedbackText) return { mainText: "", hint: null };

    const hintMatch = feedbackText.match(/Hint: (.+)$/s);
    let mainText = feedbackText;
    let hint: string | null = null;

    if (hintMatch) {
      mainText = feedbackText.replace(/\n\nHint: .+$/s, "");
      hint = hintMatch[1];
    }

    return { mainText, hint };
  };

  const { mainText, hint } = parseFeedback(feedback);

  // Get option status for styling
  const getOptionStatus = (
    index: number,
  ): "correct" | "incorrect" | "default" | "neutral" => {
    if (!showFeedback) {
      return selectedAnswer === index ? "default" : "neutral";
    }

    if (index === correctAnswerIndex) {
      return "correct";
    }

    if (index === selectedAnswer && !isCorrect) {
      return "incorrect";
    }

    return "neutral";
  };

  return (
    <div
      className={`
        rounded-2xl shadow-lg border overflow-hidden
        ${isDark ? "bg-dark-card border-dark-border" : "bg-white border-gray-200"}
      `}
    >
      {/* Header with question number and timer */}
      <div className="px-6 py-4 flex items-center justify-between">
        <span
          className={`text-sm font-medium ${isDark ? "text-dark-text-muted" : "text-gray-500"}`}
        >
          Pertanyaan {questionNumber} dari {totalQuestions}
        </span>
        <div className="flex items-center gap-1.5 border border-primary text-primary px-3 py-1.5 rounded-md text-sm font-medium">
          <Clock className="w-4 h-4" />
          <span>{formatTime(timeRemaining)}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6">
        <div
          className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-dark-secondary" : "bg-gray-200"}`}
        >
          <div
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-6">
        {/* Question text */}
        <div className="mb-6">
          <p
            className={`font-bold text-lg leading-relaxed ${isDark ? "text-dark-text" : "text-gray-900"}`}
          >
            {question.question}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const status = getOptionStatus(index);
            const optionText =
              typeof option === "object" ? option.text : option;

            // Determine styles based on status and theme
            let containerStyles = "";
            let radioStyles = "";
            let textStyles = "";

            if (status === "correct") {
              containerStyles = "border-emerald-400 bg-emerald-50";
              if (isDark)
                containerStyles = "border-emerald-400 bg-emerald-900/20";
              textStyles = isDark ? "text-emerald-300" : "text-gray-800";
              radioStyles = isDark
                ? "border-gray-400 bg-transparent"
                : "border-gray-400 bg-white";
            } else if (status === "incorrect") {
              containerStyles = "border-red-400 bg-red-50";
              if (isDark) containerStyles = "border-red-400 bg-red-900/20";
              textStyles = isDark ? "text-red-300" : "text-gray-800";
              radioStyles = "border-gray-800 bg-gray-800";
            } else if (status === "default") {
              containerStyles = isDark
                ? "border-dark-border bg-dark-secondary"
                : "border-gray-300 bg-gray-50";
              textStyles = isDark ? "text-dark-text" : "text-gray-700";
              radioStyles = "border-gray-800 bg-gray-800";
            } else {
              containerStyles = isDark
                ? "border-dark-border bg-transparent"
                : "border-gray-200 bg-white";
              textStyles = isDark ? "text-dark-text-muted" : "text-gray-700";
              radioStyles = isDark
                ? "border-dark-border bg-transparent"
                : "border-gray-300 bg-white";
            }

            return (
              <div
                key={index}
                onClick={() => !showFeedback && onAnswerSelect(index)}
                className={`
                  flex items-center justify-between p-4 rounded-xl border-2 transition-all
                  ${containerStyles}
                  ${!showFeedback ? "cursor-pointer hover:border-gray-300" : "cursor-default"}
                `}
              >
                {/* Left side: Radio + Option text */}
                <div className="flex items-center gap-4">
                  {/* Radio button */}
                  <div
                    className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                      ${radioStyles}
                    `}
                  >
                    {(status === "default" || status === "incorrect") && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>

                  {/* Option text */}
                  <span className={`text-sm font-medium ${textStyles}`}>
                    {optionText}
                  </span>
                </div>

                {/* Right side: Status icon */}
                {showFeedback && status === "correct" && (
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                  </div>
                )}
                {showFeedback && status === "incorrect" && (
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                    <X className="w-5 h-5 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Feedback Section - shown after submit */}
        {showFeedback && (
          <div
            className={`mt-6 pt-6 border-t ${isDark ? "border-dark-border" : "border-gray-200"}`}
          >
            <h3
              className={`text-xl font-bold mb-3 ${isDark ? "text-dark-text" : "text-gray-900"}`}
            >
              Penjelasan
            </h3>
            <p
              className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? "text-dark-text-muted" : "text-gray-700"}`}
            >
              {mainText}
            </p>

            {/* Hint box */}
            {hint && (
              <div
                className={`
                  mt-4 p-4 rounded-lg border
                  ${isDark ? "bg-cyan-900/20 border-cyan-700" : "bg-cyan-50 border-cyan-200"}
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb
                    className={`w-4 h-4 ${isDark ? "text-cyan-400" : "text-cyan-600"}`}
                  />
                  <span
                    className={`font-semibold text-sm ${isDark ? "text-cyan-400" : "text-cyan-600"}`}
                  >
                    Hint
                  </span>
                </div>
                <p
                  className={`text-sm leading-relaxed ${isDark ? "text-dark-text-muted" : "text-gray-700"}`}
                >
                  {hint}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action button */}
        <div className="mt-6 flex justify-end">
          {!showFeedback ? (
            <button
              onClick={onSubmit}
              disabled={selectedAnswer === null}
              className={`
                px-6 py-2.5 rounded-lg font-semibold text-sm transition-all
                ${
                  selectedAnswer !== null
                    ? "bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg"
                    : isDark
                      ? "bg-dark-secondary text-dark-text-muted cursor-not-allowed"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }
              `}
            >
              Submit Jawaban
            </button>
          ) : (
            <button
              onClick={onNext}
              className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg"
            >
              {isLastQuestion ? "Akhiri Kuis" : "Soal Berikutnya"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;

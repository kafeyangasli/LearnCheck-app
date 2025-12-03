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
  questionStartTime: number;
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
}: QuestionCardProps) => {
  const QUESTION_TIME_LIMIT = 180; // 3 minutes in seconds

  // Calculate initial time remaining based on elapsed time
  const calculateTimeRemaining = () => {
    const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
    return Math.max(0, QUESTION_TIME_LIMIT - elapsed);
  };

  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());

  // Timer effect
  useEffect(() => {
    if (showFeedback) return;

    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, [showFeedback, questionStartTime]);

  // Update timer when question changes
  useEffect(() => {
    setTimeRemaining(calculateTimeRemaining());
  }, [questionNumber, questionStartTime]);

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

  // Get option status for styling
  const getOptionStatus = (
    index: number,
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header with question number and timer */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Pertanyaan {questionNumber} dari {totalQuestions}
        </span>
        <div className="flex items-center gap-2 border border-cyan-400 text-cyan-600 px-3 py-1.5 rounded-md text-sm font-medium bg-cyan-50">
          <Clock className="w-4 h-4" />
          <span>{formatTime(timeRemaining)}</span>
        </div>
      </div>

      <div className="p-6">
        {/* Question text */}
        <div className="mb-6">
          <p className="font-semibold text-base leading-relaxed text-gray-900 dark:text-white">
            {question.question}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const status = getOptionStatus(index);
            const optionText =
              typeof option === "object" ? option.text : option;

            // Determine styles based on status
            let containerStyles = "";
            let radioStyles = "";
            let textStyles = "text-gray-800";

            if (status === "correct") {
              containerStyles = "border-emerald-400 bg-emerald-50";
              radioStyles = "border-emerald-500 bg-emerald-500";
            } else if (status === "incorrect") {
              containerStyles = "border-red-400 bg-red-50";
              radioStyles = "border-red-500 bg-red-500";
            } else if (status === "selected") {
              containerStyles = "border-emerald-400 bg-emerald-50";
              radioStyles = "border-emerald-500 bg-emerald-500";
            } else {
              containerStyles = "border-gray-200 bg-white hover:border-gray-300";
              radioStyles = "border-gray-300 bg-white";
            }

            return (
              <div
                key={index}
                onClick={() => !showFeedback && onAnswerSelect(index)}
                className={`
                  flex items-center justify-between p-4 rounded-lg border-2 transition-all
                  ${containerStyles}
                  ${!showFeedback ? "cursor-pointer" : "cursor-default"}
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                      ${radioStyles}
                    `}
                  >
                    {(status === "selected" || status === "correct" || status === "incorrect") && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className={`text-sm font-normal ${textStyles}`}>
                    {optionText}
                  </span>
                </div>

                {showFeedback && status === "correct" && (
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                  </div>
                )}
                {showFeedback && status === "incorrect" && (
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                    <X className="w-5 h-5 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Feedback Section - shown after submit */}
        {showFeedback && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
              Penjelasan
            </h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300 mb-4">
              {mainText}
            </p>

            {/* Hint box */}
            {hint && (
              <div className="p-4 rounded-lg bg-cyan-50 border border-cyan-200">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-sm text-cyan-700 block mb-1">
                      Hint
                    </span>
                    <p className="text-sm leading-relaxed text-gray-700">
                      {hint}
                    </p>
                  </div>
                </div>
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
                ${selectedAnswer !== null
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }
              `}
            >
              Submit Jawaban
            </button>
          ) : (
            <button
              onClick={onNext}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all shadow-sm hover:shadow-md"
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


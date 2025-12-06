import { useState, useEffect } from "react";
import { Check, X, Clock, Lightbulb } from "lucide-react";
import type { Question } from "../types";
import "../styles/QuestionCard.css";

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
    return `${String(mins).padStart(2, "0")}m:${String(secs).padStart(
      2,
      "0"
    )}s`;
  };

  // Find the correct answer index
  const getCorrectAnswerIndex = (): number => {
    if (question._rawOptions && question.correctOptionId) {
      return question._rawOptions.findIndex(
        (opt) => opt.id === question.correctOptionId
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

  return (
    <>
      <div className="question-card">
        {/* Header with question number and timer */}
        <div className="question-card__header">
          <span className="question-card__header-text">
            Pertanyaan {questionNumber} dari {totalQuestions}
          </span>
          <div className="question-card__timer">
            <Clock className="question-card__timer-icon" />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        </div>

        <div className="question-card__body">
          {/* Question text */}
          <div className="question-card__question">{question.question}</div>

          {/* Options */}
          <div className="question-card__options">
            {question.options.map((option, index) => {
              const status = getOptionStatus(index);
              const optionText =
                typeof option === "object" ? option.text : option;

              const isClickable = !showFeedback;
              const optionBaseClass = "question-option";
              const optionClasses = [
                optionBaseClass,
                !isClickable ? "question-option--disabled" : "",
                status === "correct" ? "question-option--correct" : "",
                status === "incorrect" ? "question-option--incorrect" : "",
                status === "selected" ? "question-option--selected" : "",
              ]
                .filter(Boolean)
                .join(" ");

              const radioClasses = [
                "question-option__radio",
                (status === "correct" || status === "selected") &&
                  "question-option__radio--correct",
                status === "incorrect" && "question-option__radio--incorrect",
              ]
                .filter(Boolean)
                .join(" ");

              const showDot =
                status === "selected" ||
                status === "correct" ||
                status === "incorrect";

              return (
                <div
                  key={index}
                  onClick={() => isClickable && onAnswerSelect(index)}
                  className={optionClasses}
                >
                  <div className="question-option__left">
                    <div className={radioClasses}>
                      {showDot && (
                        <div className="question-option__radio-dot" />
                      )}
                    </div>
                    <span className="question-option__text">{optionText}</span>
                  </div>

                  {showFeedback && status === "correct" && (
                    <div className="question-option__icon question-option__icon--correct">
                      <Check strokeWidth={3} />
                    </div>
                  )}
                  {showFeedback && status === "incorrect" && (
                    <div className="question-option__icon question-option__icon--incorrect">
                      <X strokeWidth={3} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Feedback Section - shown after submit */}
          {showFeedback && (
            <div className="question-card__feedback">
              <h3 className="question-card__feedback-title">Penjelasan</h3>
              <p className="question-card__feedback-text">{mainText}</p>

              {/* Hint box */}
              {hint && (
                <div className="question-card__hint">
                  <div className="question-card__hint-inner">
                    <Lightbulb className="question-card__hint-icon" />
                    <div>
                      <span className="question-card__hint-label">Hint</span>
                      <p className="question-card__hint-text">{hint}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action button */}
          <div className="question-card__footer">
            {!showFeedback ? (
              <button
                onClick={onSubmit}
                disabled={selectedAnswer === null}
                className={
                  selectedAnswer !== null
                    ? "question-card__button question-card__button--primary"
                    : "question-card__button question-card__button--disabled"
                }
              >
                Submit Jawaban
              </button>
            ) : (
              <button
                onClick={onNext}
                className="question-card__button question-card__button--primary"
              >
                {isLastQuestion ? "Akhiri Kuis" : "Soal Berikutnya"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default QuestionCard;

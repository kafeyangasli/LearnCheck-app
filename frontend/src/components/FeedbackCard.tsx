import React from "react";

interface FeedbackCardProps {
  feedback: string;
  isCorrect: boolean;
  onNext: () => void;
  isLastQuestion: boolean;
}

const FeedbackCard = ({
  feedback,
  isCorrect,
  onNext,
  isLastQuestion,
}: FeedbackCardProps) => {
  return (
    <div className={`feedback-card ${isCorrect ? 'correct' : 'incorrect'}`}>
      <div className="feedback-header">
        <div className="feedback-icon">
          {isCorrect ? '✅' : '❌'}
        </div>
        <h3>{isCorrect ? 'Correct!' : 'Incorrect'}</h3>
      </div>

      <div className="feedback-content">
        <p style={{ whiteSpace: 'pre-wrap' }}>{feedback}</p>
      </div>

      <div className="feedback-actions">
        <button className="btn btn-primary" onClick={onNext}>
          {isLastQuestion ? 'See Results' : 'Next Question'} →
        </button>
      </div>
    </div>
  );
};

export default FeedbackCard;

import React from "react";

interface ResultCardProps {
  score: number;
  totalQuestions: number;
  onRetry: () => void;
}

const ResultCard = ({ score, totalQuestions, onRetry }: ResultCardProps) => {
  const percentage = Math.round((score / totalQuestions) * 100);

  const getResultMessage = () => {
    if (percentage === 100) return 'Perfect! 🎉';
    if (percentage >= 80) return 'Excellent! 🌟';
    if (percentage >= 60) return 'Good Job! 👍';
    return 'Keep Learning! 📚';
  };

  const getResultColor = () => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  return (
    <div className={`result-card result-${getResultColor()}`}>
      <div className="result-icon">
        {percentage === 100 ? '🏆' : percentage >= 80 ? '🌟' : percentage >= 60 ? '👍' : '📚'}
      </div>

      <h2 className="result-title">{getResultMessage()}</h2>

      <div className="result-score">
        <div className="score-circle">
          <span className="score-number">{score}</span>
          <span className="score-total">/ {totalQuestions}</span>
        </div>
        <div className="score-percentage">{percentage}%</div>
      </div>

      <div className="result-message">
        <p>
          You answered <strong>{score}</strong> out of <strong>{totalQuestions}</strong> questions correctly.
        </p>
      </div>

      <div className="result-actions">
        <button className="btn btn-primary" onClick={onRetry}>
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ResultCard;

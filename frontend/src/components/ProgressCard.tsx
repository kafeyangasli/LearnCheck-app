interface ProgressCardProps {
  currentQuestion: number;
  totalQuestions: number;
  score: number;
  attemptNumber: number;
}

const ProgressCard = ({
  currentQuestion,
  totalQuestions,
  score,
  attemptNumber,
}: ProgressCardProps) => {
  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="progress-card">
      <div className="progress-header">
        <div className="progress-info">
          <span className="progress-label">
            Question {currentQuestion} of {totalQuestions}
          </span>
          <span className="attempt-label">
            Attempt #{attemptNumber}
          </span>
        </div>
        <div className="score-info">
          <span className="score-label">Score: {score}</span>
        </div>
      </div>

      <div className="progress-bar-container">
        <div
          className="progress-bar"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressCard;

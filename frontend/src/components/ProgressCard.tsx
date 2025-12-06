import "../styles/ProgressCard.css";

interface ProgressCardProps {
  currentQuestion: number;
  totalQuestions: number;
  score: number;
}

const ProgressCard = ({
  currentQuestion,
  totalQuestions,
  score,
}: ProgressCardProps) => {
  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <>
      <div className="progress-card">
        <div className="progress-card__header">
          <div className="progress-card__left">
            <span className="progress-card__question-text">
              Pertanyaan {currentQuestion} dari {totalQuestions}
            </span>
          </div>
          <div className="progress-card__score">Skor: {score}</div>
        </div>

        <div className="progress-card__bar">
          <div
            className="progress-card__bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </>
  );
};

export default ProgressCard;

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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Pertanyaan {currentQuestion} dari {totalQuestions}
          </span>
          <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded font-medium">
            Percobaan #{attemptNumber}
          </span>
        </div>
        <div className="text-sm font-semibold text-gray-900 dark:text-white">
          Skor: {score}
        </div>
      </div>

      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressCard;


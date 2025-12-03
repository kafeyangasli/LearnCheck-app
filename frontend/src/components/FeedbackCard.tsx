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
    <div className={`rounded-2xl shadow-lg border overflow-hidden ${isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}>
            {isCorrect ? "✅" : "❌"}
          </div>
          <h3 className={`text-xl font-bold ${isCorrect ? 'text-emerald-900' : 'text-red-900'}`}>
            {isCorrect ? "Benar!" : "Belum Tepat"}
          </h3>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{feedback}</p>
        </div>

        <div className="flex justify-end">
          <button className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg" onClick={onNext}>
            {isLastQuestion ? "Lihat Hasil" : "Soal Berikutnya"} →
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackCard;


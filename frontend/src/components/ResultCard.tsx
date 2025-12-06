import { RotateCcw } from "lucide-react";
import "../styles/ResultCard.css";

interface ResultCardProps {
  score: number;
  totalQuestions: number;
  onRetry: () => void;
  onHome?: () => void;
  isDark?: boolean;
}

const ResultCard = ({
  score,
  totalQuestions,
  onRetry,
  isDark = false,
}: ResultCardProps) => {
  const percentage = Math.round((score / totalQuestions) * 100);

  const getMessage = () => {
    if (percentage === 100) {
      return "Selamat! Anda telah berhasil menyelesaikan kuis ini dengan baik. Teruslah semangat dalam belajar dan kembangkan pengetahuan Anda! Anda bisa mengulang kuis untuk memperdalam pemahaman, atau lanjut ke pembelajaran berikutnya untuk melangkah ke materi yang lebih menantang.";
    }
    if (percentage >= 80) {
      return "Luar biasa! Anda hampir sempurna dalam menyelesaikan kuis ini. Terus tingkatkan pemahaman Anda dengan mengulang kuis atau lanjut ke materi berikutnya.";
    }
    if (percentage >= 60) {
      return "Bagus! Anda telah menyelesaikan kuis ini dengan cukup baik. Cobalah mengulang kuis untuk meningkatkan pemahaman Anda, atau lanjut ke pembelajaran berikutnya.";
    }
    return "Jangan menyerah! Belajar adalah proses. Cobalah mengulang kuis ini untuk memperdalam pemahaman Anda sebelum melanjutkan ke materi berikutnya.";
  };

  return (
    <>
      <div className="result-wrapper">
        <div
          className={`result-card ${
            isDark ? "result-card--dark" : "result-card--light"
          }`}
        >
          {/* Title */}
          <h1 className="result-title">Hasil Akhir</h1>

          {/* Stats Table */}
          <div className="result-stats-row">
            {/* Total Soal */}
            <div className="result-stats-cell">
              <p className="result-stats-label">Total Soal</p>
              <p className="result-stats-value">{totalQuestions}</p>
            </div>

            {/* Jawaban Benar */}
            <div className="result-stats-cell">
              <p className="result-stats-label">Jawaban Benar</p>
              <p className="result-stats-value">{score}</p>
            </div>

            {/* Nilai Akhir */}
            <div className="result-stats-cell">
              <p className="result-stats-label">Nilai Akhir</p>
              <p className="result-stats-value">{percentage}%</p>
            </div>
          </div>

          {/* Message */}
          <div className="result-message">{getMessage()}</div>

          {/* Action Buttons */}
          <div className="result-button-row">
            <button onClick={onRetry} className="result-retry-button">
              <RotateCcw size={16} />
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResultCard;

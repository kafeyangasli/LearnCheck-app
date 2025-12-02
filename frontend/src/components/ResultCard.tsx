import { RotateCcw, Home } from "lucide-react";

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
  onHome,
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

  const handleHome = () => {
    if (onHome) {
      onHome();
    } else {
      window.parent.postMessage({ type: "NAVIGATE_HOME" }, "*");
    }
  };

  return (
    <div
      className={`
        rounded-2xl shadow-lg border overflow-hidden
        ${isDark ? "bg-dark-card border-dark-border" : "bg-white border-gray-200"}
      `}
    >
      <div className="p-8">
        {/* Title */}
        <h1
          className={`text-2xl font-bold mb-8 ${isDark ? "text-dark-text" : "text-gray-900"}`}
        >
          Hasil Akhir
        </h1>

        {/* Stats Table */}
        <div
          className={`
            grid grid-cols-3 divide-x py-6 mb-8 border-y
            ${isDark ? "divide-dark-border border-dark-border" : "divide-gray-200 border-gray-200"}
          `}
        >
          {/* Total Soal */}
          <div className="text-center px-4">
            <p
              className={`font-medium mb-2 ${isDark ? "text-dark-text-muted" : "text-gray-600"}`}
            >
              Total Soal
            </p>
            <p
              className={`text-4xl font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}
            >
              {totalQuestions}
            </p>
          </div>

          {/* Jawaban Benar */}
          <div className="text-center px-4">
            <p
              className={`font-medium mb-2 ${isDark ? "text-dark-text-muted" : "text-gray-600"}`}
            >
              Jawaban Benar
            </p>
            <p
              className={`text-4xl font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}
            >
              {score}
            </p>
          </div>

          {/* Nilai Akhir */}
          <div className="text-center px-4">
            <p
              className={`font-medium mb-2 ${isDark ? "text-dark-text-muted" : "text-gray-600"}`}
            >
              Nilai Akhir
            </p>
            <p
              className={`text-4xl font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}
            >
              {percentage}%
            </p>
          </div>
        </div>

        {/* Message */}
        <div className="mb-8">
          <p
            className={`text-sm leading-relaxed ${isDark ? "text-dark-text-muted" : "text-gray-700"}`}
          >
            {getMessage()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onRetry}
            className={`
              inline-flex items-center gap-2 px-6 py-2.5 border-2 rounded-lg font-semibold text-sm transition-all
              ${
                isDark
                  ? "border-dark-border text-dark-text hover:bg-dark-secondary"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              }
            `}
          >
            <RotateCcw className="w-4 h-4" />
            Coba Lagi
          </button>
          <button
            onClick={handleHome}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg"
          >
            <Home className="w-4 h-4" />
            Beranda
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;

import { RotateCcw, Home } from "lucide-react";

interface ResultCardProps {
  score: number;
  totalQuestions: number;
  onRetry: () => void;
  onHome?: () => void;
}

const ResultCard = ({
  score,
  totalQuestions,
  onRetry,
  onHome,
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
      // Default: send message to parent window or navigate
      window.parent.postMessage({ type: "NAVIGATE_HOME" }, "*");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden max-w-2xl mx-auto">
      <div className="p-8">
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Hasil Akhir</h1>

        {/* Stats Table */}
        <div className="grid grid-cols-3 divide-x divide-gray-200 border-y border-gray-200 py-6 mb-8">
          {/* Total Soal */}
          <div className="text-center px-4">
            <p className="text-gray-600 font-medium mb-2">Total Soal</p>
            <p className="text-4xl font-bold text-gray-900">{totalQuestions}</p>
          </div>

          {/* Jawaban Benar */}
          <div className="text-center px-4">
            <p className="text-gray-600 font-medium mb-2">Jawaban Benar</p>
            <p className="text-4xl font-bold text-gray-900">{score}</p>
          </div>

          {/* Nilai Akhir */}
          <div className="text-center px-4">
            <p className="text-gray-600 font-medium mb-2">Nilai Akhir</p>
            <p className="text-4xl font-bold text-gray-900">{percentage}%</p>
          </div>
        </div>

        {/* Message */}
        <div className="mb-8">
          <p className="text-gray-700 text-sm leading-relaxed">
            {getMessage()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold text-sm transition-all hover:bg-gray-50 hover:border-gray-400"
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

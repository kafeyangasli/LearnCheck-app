import { RotateCcw } from "lucide-react";

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
    <div className="w-full flex justify-center mt-16">
      <div
        className={`
          mt-30
          max-w-[900px]
          ${
            isDark
              ? "bg-slate-900 border-slate-700"
              : "bg-white border-gray-200"
          }
          px-6 py-8 md:px-10 md:py-10
        `}
      >
        {/* Title */}
        <h1
          className={`text-[32px] leading-[38px] font-bold mb-6 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Hasil Akhir
        </h1>

        {/* Stats Table */}
        <div
          className={`
            grid grid-cols-3 divide-x py-5 mb-6 border-y
            ${
              isDark
                ? "divide-slate-700 border-slate-700"
                : "divide-gray-200 border-gray-200"
            }
          `}
        >
          {/* Total Soal */}
          <div className="text-center px-4">
            <p
              className={`text-lg md:text-xl font-semibold mb-2 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Total Soal
            </p>
            <p
              className={`text-3xl md:text-4xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {totalQuestions}
            </p>
          </div>

          {/* Jawaban Benar */}
          <div className="text-center px-4">
            <p
              className={`text-lg md:text-xl font-semibold mb-2 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Jawaban Benar
            </p>
            <p
              className={`text-3xl md:text-4xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {score}
            </p>
          </div>

          {/* Nilai Akhir */}
          <div className="text-center px-4">
            <p
              className={`text-lg md:text-xl font-semibold mb-2 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Nilai Akhir
            </p>
            <p
              className={`text-3xl md:text-4xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {percentage}%
            </p>
          </div>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p
            className={`text-base leading-relaxed ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {getMessage()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onRetry}
            className="
              w-36 h-12  inline-flex items-center justify-center gap-2
              text-white text-lg font-semibold
              transition-all rounded-lg bg-sky-600 hover:bg-sky-700 shadow-md hover:shadow-lg
            "
          >
            <RotateCcw className="w-4 h-4" />
            Coba Lagi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;

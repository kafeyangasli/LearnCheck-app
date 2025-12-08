import { RotateCcw } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { UserPreferences } from "../../../types";
import {
  bodyTextClassByFontSize,
  smallTextClassByFontSize,
  buttonTextClassByFontSize,
} from "../utils/fontSize";

interface ResultCardProps {
  score: number;
  totalQuestions: number;
  onRetry: () => void;
  onHome?: () => void;
  isDark?: boolean;
  fontSize: UserPreferences["fontSize"];
}

const ResultCard = ({
  score,
  totalQuestions,
  onRetry,
  onHome,
  isDark = false,
  fontSize,
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
      <div className="w-full flex justify-center">
        <div
          className={cn(
            "w-full max-w-[900px] px-8 py-8 md:px-10 mt-8 rounded-3xl border border-solid box-border",
            isDark
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-slate-200"
          )}
        >
          <h1 className="text-[32px] leading-[38px] font-bold mb-6 text-slate-900 dark:text-white">
            Hasil Akhir
          </h1>

          <div className="grid grid-cols-3 border-y border-slate-200 dark:border-slate-700 py-5 mb-6">
            <div className="text-center px-4 border-r border-slate-200 dark:border-slate-700 last:border-r-0">
              <p
                className={cn(
                  "font-semibold mb-2 text-slate-600 dark:text-slate-300",
                  smallTextClassByFontSize[fontSize]
                )}
              >
                Total Soal
              </p>
              <p
                className={cn(
                  "font-bold text-slate-900 dark:text-white",
                  smallTextClassByFontSize[fontSize]
                )}
              >
                {totalQuestions}
              </p>
            </div>

            <div className="text-center px-4 border-r border-slate-200 dark:border-slate-700 last:border-r-0">
              <p
                className={cn(
                  "font-semibold mb-2 text-slate-600 dark:text-slate-300",
                  smallTextClassByFontSize[fontSize]
                )}
              >
                Jawaban Benar
              </p>
              <p
                className={cn(
                  "font-bold text-slate-900 dark:text-white",
                  smallTextClassByFontSize[fontSize]
                )}
              >
                {score}
              </p>
            </div>

            <div className="text-center px-4 border-r border-slate-200 dark:border-slate-700 last:border-r-0">
              <p
                className={cn(
                  "font-semibold mb-2 text-slate-600 dark:text-slate-300",
                  smallTextClassByFontSize[fontSize]
                )}
              >
                Nilai Akhir
              </p>
              <p
                className={cn(
                  "font-bold text-slate-900 dark:text-white",
                  smallTextClassByFontSize[fontSize]
                )}
              >
                {percentage}%
              </p>
            </div>
          </div>

          <div
            className={cn(
              "mb-6 leading-relaxed text-slate-700 dark:text-slate-300",
              bodyTextClassByFontSize[fontSize]
            )}
          >
            {getMessage()}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            {onHome && (
              <button
                onClick={onHome}
                className={cn(
                  "w-full sm:w-auto px-6 h-12 inline-flex items-center justify-center gap-2  font-semibold rounded-lg border-none cursor-pointer bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:bg-slate-200 dark:hover:bg-slate-600 order-2 sm:order-1"
                )}
              >
                Kembali ke Beranda
              </button>
            )}
            <button
              onClick={onRetry}
              className={cn(
                "w-full sm:w-auto px-6 h-12 inline-flex items-center justify-center gap-2 font-semibold rounded-lg border-none cursor-pointer bg-blue-600 text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg hover:-translate-y-px order-1 sm:order-2",
                buttonTextClassByFontSize[fontSize]
              )}
            >
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

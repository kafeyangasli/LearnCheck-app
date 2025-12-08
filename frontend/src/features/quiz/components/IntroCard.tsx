import { Loader2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { UserPreferences } from "../../../types";
import {
  bodyTextClassByFontSize,
  buttonTextClassByFontSize,
} from "../utils/fontSize";

interface IntroCardProps {
  totalQuestions: number;
  isLoading: boolean;
  onStart: () => void;
  fontSize: UserPreferences["fontSize"];
}

const IntroCard = ({
  totalQuestions,
  isLoading,
  onStart,
  fontSize,
}: IntroCardProps) => {
  return (
    <>
      <div className="flex items-center gap-3 pb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
          LearnCheck!
        </h1>
      </div>

      <p
        className={cn(
          "mb-3 leading-relaxed text-slate-900 dark:text-white",
          bodyTextClassByFontSize[fontSize]
        )}
      >
        LearnCheck! dirancang untuk menguji wawasan Anda terkait materi yang
        telah dipelajari.
      </p>

      <p
        className={cn(
          "mb-3 leading-relaxed text-slate-900 dark:text-white",
          bodyTextClassByFontSize[fontSize]
        )}
      >
        Terdapat {totalQuestions} pertanyaan yang perlu Anda selesaikan dalam
        kuis ini. Beberapa ketentuan penting sebelum memulai:
      </p>

      <ul
        className={cn(
          "mb-3 leading-relaxed text-slate-900 dark:text-white pl-5 list-disc space-y-1",
          bodyTextClassByFontSize[fontSize]
        )}
      >
        <li>Durasi pengerjaan: 3 menit</li>
        <li>
          Soal dihasilkan otomatis oleh AI, mohon tunggu sebentar hingga soal
          siap
        </li>
        <li>
          Selesaikan setiap pertanyaan terlebih dahulu untuk dapat melanjutkan
          ke pertanyaan berikutnya
        </li>
      </ul>

      <p
        className={cn(
          "mb-3 leading-relaxed text-slate-900 dark:text-white",
          bodyTextClassByFontSize[fontSize]
        )}
      >
        Manfaatkan waktu dengan baik dan pastikan Anda fokus pada setiap soal
        yang muncul.
      </p>

      <p
        className={cn(
          "mb-3 leading-relaxed text-slate-900 dark:text-white font-bold",
          bodyTextClassByFontSize[fontSize]
        )}
      >
        Semoga sukses dan selamat mengerjakan!
      </p>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onStart}
          disabled={isLoading}
          className={cn(
            "w-auto px-6 h-12 rounded-lg inline-flex items-center justify-center gap-2 font-semibold text-white border-none cursor-pointer transition-all shadow-md",
            buttonTextClassByFontSize[fontSize],
            "bg-blue-600 hover:bg-blue-700 hover:-translate-y-px hover:shadow-lg",
            "disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
          )}
        >
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          )}
          {isLoading ? "Menyiapkan Soal..." : "Mulai"}
        </button>
      </div>
    </>
  );
};

export default IntroCard;

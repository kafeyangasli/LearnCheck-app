import { CheckCircle, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

interface IntroCardProps {
  totalQuestions: number;
  isLoading: boolean;
  onStart: () => void;
}

const IntroCard = ({ totalQuestions, isLoading, onStart }: IntroCardProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden max-w-2xl mx-auto">
      <div className="p-8">
        {/* Title with verified icon */}
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">LearnCheck!</h1>
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-6">
          LearnCheck! dirancang untuk menguji wawasan Anda terkait materi yang
          telah dipelajari.
        </p>

        {/* Instructions */}
        <p className="text-gray-700 mb-4">
          Terdapat {totalQuestions} pertanyaan yang perlu Anda selesaikan dalam
          kuis ini. Beberapa ketentuan penting sebelum memulai:
        </p>

        <ul className="list-disc list-inside text-gray-700 space-y-1 mb-6 ml-2">
          <li>Durasi pengerjaan: 5 menit</li>
          <li>
            Soal dihasilkan otomatis oleh AI, mohon tunggu sebentar hingga soal
            siap
          </li>
          <li>
            Selesaikan setiap pertanyaan terlebih dahulu untuk dapat melanjutkan
            ke pertanyaan berikutnya
          </li>
        </ul>

        <p className="text-gray-700 mb-6">
          Manfaatkan waktu dengan baik dan pastikan Anda fokus pada setiap soal
          yang muncul.
        </p>

        <p className="text-gray-900 font-bold mb-8">
          Semoga sukses dan selamat mengerjakan!
        </p>

        {/* Start Button */}
        <div className="flex justify-end">
          <button
            onClick={onStart}
            disabled={isLoading}
            className={cn(
              "inline-flex items-center gap-2 px-8 py-2.5 rounded-lg font-semibold text-sm transition-all",
              isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg",
            )}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Memuat Soal..." : "Mulai"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntroCard;

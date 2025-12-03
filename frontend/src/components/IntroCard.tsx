import { CheckCircle, Loader2 } from "lucide-react";

interface IntroCardProps {
  totalQuestions: number;
  isLoading: boolean;
  onStart: () => void;
}

const IntroCard = ({
  totalQuestions,
  isLoading,
  onStart,
}: IntroCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden max-w-2xl mx-auto">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            LearnCheck!
          </h1>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
        </div>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          LearnCheck! dirancang untuk menguji wawasan Anda terkait materi yang
          telah dipelajari.
        </p>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Terdapat {totalQuestions} pertanyaan yang perlu Anda selesaikan dalam
          kuis ini. Beberapa ketentuan penting sebelum memulai:
        </p>

        <ul className="list-disc list-inside space-y-2 mb-6 ml-2 text-gray-700 dark:text-gray-300">
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

        <p className="mb-6 text-gray-700 dark:text-gray-300">
          Manfaatkan waktu dengan baik dan pastikan Anda fokus pada setiap soal
          yang muncul.
        </p>

        <p className="font-bold mb-8 text-gray-900 dark:text-gray-200">
          Semoga sukses dan selamat mengerjakan!
        </p>

        <div className="flex justify-end">
          <button
            onClick={onStart}
            disabled={isLoading}
            className={`
              inline-flex items-center gap-2 px-8 py-2.5 rounded-lg font-semibold text-sm transition-all
              ${isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
              }
            `}
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


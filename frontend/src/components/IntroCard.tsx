import { CheckCircle, Loader2 } from "lucide-react";

interface IntroCardProps {
  totalQuestions: number;
  isLoading: boolean;
  onStart: () => void;
}

const IntroCard = ({ totalQuestions, isLoading, onStart }: IntroCardProps) => {
  return (
    <>
      {/* Card wrapper */}
      <div className="flex items-center gap-3 pb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white">
          LearnCheck!
        </h1>
        <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Teks utama */}
      <p className="mb-4 text-black dark:text-white text-base md:text-lg leading-relaxed">
        LearnCheck! dirancang untuk menguji wawasan Anda terkait materi yang
        telah dipelajari.
      </p>

      <p className="mb-3 text-black dark:text-white text-base md:text-lg leading-relaxed">
        Terdapat {totalQuestions} pertanyaan yang perlu Anda selesaikan dalam
        kuis ini. Beberapa ketentuan penting sebelum memulai:
      </p>

      {/* List aturan */}
      <ul className="list-disc list-inside space-y-1 mb-4 text-black dark:text-white text-base md:text-lg leading-relaxed">
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

      <p className="mb-3 text-black dark:text-white text-base md:text-lg leading-relaxed">
        Manfaatkan waktu dengan baik dan pastikan Anda fokus pada setiap soal
        yang muncul.
      </p>

      <p className="font-bold text-black dark:text-white text-base md:text-lg leading-relaxed">
        Semoga sukses dan selamat mengerjakan!
      </p>

      {/* Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={onStart}
          disabled={isLoading}
          className={`
              w-36 h-12 rounded-lg inline-flex items-center justify-center gap-2
              text-white text-lg font-semibold
              transition-all
              ${
                isLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-sky-600 hover:bg-sky-700"
              }
            `}
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading ? "Memuat..." : "Mulai"}
        </button>
      </div>
    </>
  );
};

export default IntroCard;

import { CheckCircle, Loader2 } from "lucide-react";

interface IntroCardProps {
  totalQuestions: number;
  isLoading: boolean;
  onStart: () => void;
}

const IntroCard = ({ totalQuestions, isLoading, onStart }: IntroCardProps) => {
  return (
    // Wrapper: hanya batasi lebar & kasih padding
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header + icon */}
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white">
          LearnCheck!
        </h1>
        <div className="w-9 h-9 rounded-full bg-sky-600 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Garis pemisah seperti di desain */}
      <div className="h-px bg-black/20 mb-8 dark:text-white" />

      {/* Teks utama */}
      <p className="mb-6 text-black dark:text-white text-lg md:text-xl leading-relaxed">
        LearnCheck! dirancang untuk menguji wawasan Anda terkait materi yang
        telah dipelajari.
      </p>

      <p className="mb-4 text-black dark:text-white text-lg md:text-xl leading-relaxed">
        Terdapat {totalQuestions} pertanyaan yang perlu Anda selesaikan dalam
        kuis ini. Beberapa ketentuan penting sebelum memulai:
      </p>

      {/* List aturan */}
      <ul className="list-disc list-inside space-y-1 mb-6 text-black dark:text-white text-lg md:text-xl leading-relaxed">
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

      <p className="mb-4 text-black dark:text-white text-lg md:text-xl leading-relaxed">
        Manfaatkan waktu dengan baik dan pastikan Anda fokus pada setiap soal
        yang muncul.
      </p>

      <p className="font-bol dark:text-white text-black text-lg md:text-xl leading-relaxed">
        Semoga sukses dan selamat mengerjakan!
      </p>

      {/* Tombol di kanan bawah */}
      <div className="mt-10 flex justify-end">
        <button
          onClick={onStart}
          disabled={isLoading}
          className={`
            w-48 h-16 rounded-lg inline-flex items-center justify-center gap-2
            text-white text-2xl font-bold
            transition-all
            ${
              isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-sky-600 hover:bg-sky-700"
            }
          `}
        >
          {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
          {isLoading ? "Memuat Soal..." : "Mulai"}
        </button>
      </div>
    </div>
  );
};

export default IntroCard;

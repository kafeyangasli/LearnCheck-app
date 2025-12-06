import { CheckCircle, Loader2 } from "lucide-react";
import "../styles/IntroCard.css";

interface IntroCardProps {
  totalQuestions: number;
  isLoading: boolean;
  onStart: () => void;
}

const IntroCard = ({ totalQuestions, isLoading, onStart }: IntroCardProps) => {
  return (
    <>
      <div className="intro-header">
        <h1 className="intro-title">LearnCheck!</h1>
        <div className="intro-icon">
          <CheckCircle />
        </div>
      </div>

      {/* Teks utama */}
      <p className="intro-text">
        LearnCheck! dirancang untuk menguji wawasan Anda terkait materi yang
        telah dipelajari.
      </p>

      <p className="intro-text">
        Terdapat {totalQuestions} pertanyaan yang perlu Anda selesaikan dalam
        kuis ini. Beberapa ketentuan penting sebelum memulai:
      </p>

      {/* List aturan */}
      <ul className="intro-list">
        <li>Durasi pengerjaan: 3 menit/pertanyaan</li>
        <li>
          Soal dihasilkan otomatis oleh AI, mohon tunggu sebentar hingga soal
          siap
        </li>
        <li>
          Selesaikan setiap pertanyaan terlebih dahulu untuk dapat melanjutkan
          ke pertanyaan berikutnya
        </li>
      </ul>

      <p className="intro-text">
        Manfaatkan waktu dengan baik dan pastikan Anda fokus pada setiap soal
        yang muncul.
      </p>

      <p className="intro-text-strong">
        Semoga sukses dan selamat mengerjakan!
      </p>

      {/* Button */}
      <div className="intro-button-row">
        <button
          onClick={onStart}
          disabled={isLoading}
          className={`intro-button ${
            isLoading ? "intro-button--disabled" : ""
          }`}
        >
          {isLoading && (
            <Loader2 className="intro-button-icon spin" aria-hidden="true" />
          )}
          {isLoading ? "Memuat..." : "Mulai"}
        </button>
      </div>
    </>
  );
};

export default IntroCard;

import React, { useMemo } from 'react';
import { useQuizStore } from '../../store/useQuizStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

interface ResultsProps {
  onTryAgain: () => void;
  onGoToIntro: () => void;
}

const Results: React.FC<ResultsProps> = ({ onTryAgain, onGoToIntro }) => {
  const { questions, selectedAnswers } = useQuizStore();

  const score = useMemo(() => questions.reduce((acc, question) => {
    return selectedAnswers[question.id] === question.correctOptionId ? acc + 1 : acc;
  }, 0), [questions, selectedAnswers]);

  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const { title, subtitle } = useMemo(() => {
    if (percentage === 100) {
      return {
        title: "Luar Biasa! Pemahaman Sempurna!",
        subtitle: "Kamu benar-benar menguasai materi ini. Terus pertahankan semangat belajarmu yang membara!"
      };
    }
    if (percentage >= 80) {
      return {
        title: "Kerja Bagus! Kamu di Jalur yang Tepat!",
        subtitle: "Pemahamanmu sudah sangat solid. Tinggal sedikit lagi polesan untuk jadi master!"
      };
    }
    if (percentage >= 50) {
      return {
        title: "Sudah Cukup Baik! Terus Asah Lagi!",
        subtitle: "Dasar-dasarnya sudah kamu pegang. Coba pelajari lagi bagian yang masih ragu untuk pemahaman yang lebih dalam."
      };
    }
    return {
      title: "Jangan Menyerah, Ini Baru Permulaan!",
      subtitle: "Setiap ahli pernah menjadi pemula. Ini adalah kesempatan emas untuk meninjau kembali materi dan membangun fondasi yang lebih kuat."
    };
  }, [percentage]);

  return (
    <div className="space-y-8 flex flex-col items-center">
      <Card className="p-6 text-center w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-4">{subtitle}</p>
        <p className="text-lg text-slate-600 dark:text-slate-400">Skor Akhir</p>
        <p className="text-6xl font-bold my-4">{percentage}%</p>
        <p className="text-slate-600 dark:text-slate-400">Kamu menjawab {score} dari {questions.length} soal dengan benar.</p>
      </Card>

      <div className="text-center mt-4 flex items-center justify-center gap-x-4">
        <Button onClick={onGoToIntro} variant="secondary">Kembali ke Awal</Button>
        <Button onClick={onTryAgain}>Coba Lagi</Button>
      </div>
    </div>
  );
};

export default Results;

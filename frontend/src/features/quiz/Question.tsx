import React, { useMemo } from 'react';
import { useQuizStore } from '../../store/useQuizStore';
import { Question, Option } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { clsx } from 'clsx';

interface QuestionProps {
  question: Question;
}

const QuestionComponent: React.FC<QuestionProps> = ({ question }) => {
  const {
    selectedAnswers,
    selectAnswer,
    submittedAnswers,
    submitAnswer,
    nextQuestion,
    questions,
    currentQuestionIndex
  } = useQuizStore();

  const selectedOptionId = selectedAnswers[question.id];
  const isSubmitted = submittedAnswers[question.id];
  const isAnswerSelected = selectedAnswers.hasOwnProperty(question.id);
  const isCorrect = isSubmitted && selectedOptionId === question.correctOptionId;

  const handleButtonClick = () => {
    if (!isSubmitted) {
      submitAnswer(question.id);
    } else {
      nextQuestion();
    }
  };

  const getOptionClasses = (option: Option) => {
    let classes = 'p-4 border rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-between text-left';
    const isSelected = selectedOptionId === option.id;

    if (!isSubmitted) {
      classes += ' border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800';
      if (isSelected) classes += ' bg-primary-50 dark:bg-primary-900/50 border-primary-500 ring-2 ring-primary-400 dark:ring-primary-600';
    } else {
      const isCorrectOption = option.id === question.correctOptionId;
      if (isCorrectOption) {
        classes += ' bg-green-50 dark:bg-green-900/30 border-green-500';
      } else if (isSelected && !isCorrectOption) {
        classes += ' bg-red-50 dark:bg-red-900/30 border-red-500';
      } else {
        classes += ' border-slate-300 dark:border-slate-700 opacity-60';
      }
    }
    return classes;
  };

  const explanationParts = question.explanation.split('Hint:');
  const mainExplanation = explanationParts[0].trim();
  const hintText = explanationParts.length > 1 ? explanationParts[1].trim() : null;

  const correctPrefixes = [
    "Mantap, jawabanmu benar! ",
    "Tepat sekali! ",
    "Keren, kamu paham konsepnya! ",
    "Betul! Lanjutkan momentum belajarmu! ",
    "Luar biasa, pemahamanmu solid! "
  ];

  const incorrectPrefixes = [
    "Hampir benar! Coba kita lihat lagi yuk. ",
    "Belum tepat, tapi jangan khawatir, ini bagian dari belajar. ",
    "Oops, masih kurang pas. Yuk kita bedah bareng! ",
    "Sedikit lagi! Coba perhatikan penjelasan berikut. ",
    "Jawabanmu keliru, tapi ini kesempatan bagus untuk belajar. "
  ];

  const feedbackPrefix = useMemo(() => {
    if (!isSubmitted) return '';
    const prefixes = isCorrect ? correctPrefixes : incorrectPrefixes;
    return prefixes[Math.floor(Math.random() * prefixes.length)];
  }, [isSubmitted, isCorrect]);

  const fullExplanation = feedbackPrefix + mainExplanation;

  return (
    <Card className="overflow-hidden">
      {isSubmitted && (
        <div className={clsx('p-4 sm:p-5 border-b-2', {
          'bg-red-50 dark:bg-red-900/30 border-red-500': !isCorrect,
          'bg-green-50 dark:bg-green-900/30 border-green-500': isCorrect,
        })}>
          <h3 className={clsx('font-bold text-lg flex items-center gap-2', {
            'text-red-700 dark:text-red-300': !isCorrect,
            'text-green-700 dark:text-green-300': isCorrect,
          })}>
            {!isCorrect ? <XCircle size={22} /> : <CheckCircle2 size={22} />}
            <span>{!isCorrect ? 'Salah' : 'Benar'}</span>
          </h3>
        </div>
      )}
      <div className="p-4 sm:p-6">
        <p className="text-xl md:text-2xl font-bold mb-6">{question.questionText}</p>
        <div className="space-y-4">
          {question.options.map((option) => (
            <div
              key={option.id}
              className={getOptionClasses(option)}
              onClick={() => selectAnswer(question.id, option.id)}
              role="radio"
              aria-checked={selectedOptionId === option.id}
              tabIndex={isSubmitted ? -1 : 0}
            >
              <span>{option.text}</span>
              {isSubmitted && option.id === question.correctOptionId && <CheckCircle2 className="text-green-500" />}
              {isSubmitted && selectedOptionId === option.id && option.id !== question.correctOptionId && <XCircle className="text-red-500" />}
            </div>
          ))}
        </div>
      </div>

      {isSubmitted && (
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
          <h4 className="font-bold text-base mb-2">Penjelasan</h4>
          <p className="text-sm text-slate-700 dark:text-slate-300">{fullExplanation}</p>
          {hintText && (
            <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/40 rounded-lg flex items-start">
              <Lightbulb className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-semibold text-sm text-primary-800 dark:text-primary-200">Hint</h5>
                <p className="text-sm text-primary-700 dark:text-primary-300">{hintText}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900/30">
        <Button onClick={handleButtonClick} disabled={!isAnswerSelected}>
          {isSubmitted
            ? (currentQuestionIndex === questions.length - 1 ? 'Lihat Hasil' : 'Soal Berikutnya')
            : 'Kirim Jawaban'}
        </Button>
      </div>
    </Card>
  );
};

export default QuestionComponent;

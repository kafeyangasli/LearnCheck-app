import React, { useState, useEffect } from 'react';
import { useQuizStore } from '../../store/useQuizStore';
import QuestionComponent from './Question';
import Results from './Results';
import ProgressBar from '../../components/ui/ProgressBar';
import { clsx } from 'clsx';

interface QuizProps {
  onTryAgain: () => void;
  onGoToIntro: () => void;
}

const Quiz: React.FC<QuizProps> = ({ onTryAgain, onGoToIntro }) => {
  const { questions, currentQuestionIndex, quizOver } = useQuizStore();
  const finishQuiz = useQuizStore(state => state.finishQuiz);
  const [timeLeft, setTimeLeft] = useState(5 * 60);

  useEffect(() => {
    if (quizOver) {
      return;
    }
    if (timeLeft <= 0) {
      finishQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quizOver, finishQuiz]);

  if (quizOver) {
    return <Results onTryAgain={onTryAgain} onGoToIntro={onGoToIntro} />;
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return <div className="text-center p-8">No questions available.</div>;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const isTimeCritical = timeLeft <= 60;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Pertanyaan {currentQuestionIndex + 1} dari {questions.length}
        </span>
        <span className={clsx('text-sm font-mono', {
          'text-red-600 dark:text-red-400 font-bold': isTimeCritical,
          'text-slate-600 dark:text-slate-400': !isTimeCritical,
        })}>
          {formattedTime}
        </span>
      </div>
      <ProgressBar value={currentQuestionIndex + 1} max={questions.length} />
      <QuestionComponent question={currentQuestion} />
    </div>
  );
};

export default Quiz;

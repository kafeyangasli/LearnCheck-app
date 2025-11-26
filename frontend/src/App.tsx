import React, { useState, useEffect, useMemo } from 'react';
import { useQuizStore } from './store/useQuizStore';
import useQuizData from './hooks/useQuizData';
import { Question } from './types';
import Loader from './components/ui/Loader';
import SkeletonLoading from './components/ui/SkeletonLoading';
// import { prepareQuiz } from './services/api'; // Disabled to prevent rate limiting

// Imported Components
import QuizContainer from './components/layout/QuizContainer';
import Intro from './features/quiz/Intro';
import Quiz from './features/quiz/Quiz';

const App: React.FC = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const tutorialId = urlParams.get('tutorial_id') || urlParams.get('tutorial');
  const userId = urlParams.get('user_id') || urlParams.get('user');

  const [quizStarted, setQuizStarted] = useState(false);
  const {
    userPreferences,
    assessmentData,
    isLoadingPreferences,
    isGeneratingQuiz,
    error,
    generateQuiz
  } = useQuizData(tutorialId, userId);

  const initialize = useQuizStore(state => state.initialize);
  const setQuestions = useQuizStore(state => state.setQuestions);
  const reset = useQuizStore(state => state.reset);

  const handleStartQuiz = async () => {
    // Prevent double-click and concurrent quiz generation
    if (isGeneratingQuiz || quizStarted) return;

    // Reset quiz state before starting fresh quiz
    reset();

    setQuizStarted(true);
    await generateQuiz(); // First attempt: use cache if available
  };

  const handleTryAgain = async () => {
    reset();
    setQuizStarted(false);
    // Small delay for UI transition
    await new Promise(resolve => setTimeout(resolve, 100));
    setQuizStarted(true);
    await generateQuiz(true); // Retry: skip cache, generate fresh questions
  };

  const handleGoToIntro = () => {
    setQuizStarted(false);
    reset();
  };

  useEffect(() => {
    if (userId && tutorialId) {
      initialize(userId, tutorialId);

      // Trigger background quiz generation when page loads
      // prepareQuiz(tutorialId).catch((err) => {
      //   console.warn('[App] Failed to prepare quiz:', err);
      // });
    }
  }, [userId, tutorialId, initialize]);

  useEffect(() => {
    if (assessmentData?.assessment?.questions) {
      setQuestions(assessmentData.assessment.questions as Question[]);
    }
  }, [assessmentData?.assessment, setQuestions]);

  const quizKey = useMemo(() => `${userId}-${tutorialId}`, [userId, tutorialId]);

  // Detect if running in iframe (embedded mode)
  const isEmbedded = useMemo(() => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true; // If we can't access top, we're probably in an iframe
    }
  }, []);

  const renderContent = () => {
    // Check for missing required params
    if (!tutorialId || !userId) {
      return (
        <div className="text-red-500 p-4 text-center font-bold space-y-2">
          <p className="text-xl">⚠️ Parameter Tidak Lengkap</p>
          <p className="text-sm font-normal">
            Embed URL harus menyertakan <code className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded">tutorial_id</code> dan <code className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded">user_id</code>
          </p>
          <p className="text-xs font-normal text-slate-600 dark:text-slate-400 mt-4">
            Contoh: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
              ?tutorial_id=35363&user_id=1
            </code>
          </p>
        </div>
      );
    }

    if (!quizStarted) {
      return <Intro onStart={handleStartQuiz} isLoading={isLoadingPreferences || isGeneratingQuiz} />;
    }

    // Show skeleton loading while fetching quiz from cache (much faster!)
    if (quizStarted && isGeneratingQuiz) {
      return <SkeletonLoading />;
    }

    if (error && !assessmentData?.assessment) {
      return <div className="text-red-500 p-4 text-center font-bold">Oops, gagal memuat kuis: {error}</div>;
    }
    if (assessmentData?.assessment) {
      return <Quiz key={quizKey} onTryAgain={handleTryAgain} onGoToIntro={handleGoToIntro} />;
    }
    return null;
  };

  return (
    <main className={isEmbedded ? "bg-slate-50 dark:bg-slate-900 min-h-full" : "bg-slate-50 dark:bg-slate-900 min-h-screen"}>
      {userPreferences ? (
        <QuizContainer preferences={userPreferences} isEmbedded={isEmbedded}>
          {renderContent()}
        </QuizContainer>
      ) : error ? (
        <div className={`${isEmbedded ? 'min-h-full' : 'min-h-screen'} flex items-center justify-center p-4 text-center text-red-500 font-bold`}>
          Gagal memuat preferensi pengguna: {error}
        </div>
      ) : (
        <div className={`${isEmbedded ? 'min-h-full' : 'min-h-screen'} flex items-center justify-center`}>
          <Loader />
        </div>
      )}
    </main>
  );
};

export default App;

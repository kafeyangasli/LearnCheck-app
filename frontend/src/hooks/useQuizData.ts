import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { AssessmentData } from '../types';
import { useQuizStore } from '../store/useQuizStore';
import { QUIZ_CONFIG, API_ENDPOINTS } from '../config/constants';

const useQuizData = (tutorialId: string | null, userId: string | null) => {
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState<boolean>(true);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFetchRef = useRef<number>(0);

  const questions = useQuizStore(state => state.questions);

  const fetchPreferences = useCallback(async (forceRefresh = false, silentUpdate = false) => {
    if (!userId) {
      setIsLoadingPreferences(false);
      return;
    }

    if (questions.length > 0 && !silentUpdate) {
      return;
    }

    const now = Date.now();
    if (!forceRefresh && now - lastFetchRef.current < QUIZ_CONFIG.DEBOUNCE_MS) {
      return;
    }

    lastFetchRef.current = now;

    if (!silentUpdate) {
      setIsLoadingPreferences(true);
    }
    setError(null);

    try {
      const response = await api.get(API_ENDPOINTS.PREFERENCES, {
        params: {
          user_id: userId,
          _t: Date.now()
        },
      });

      const newPrefs = response.data.userPreferences;

      setUserPreferences(newPrefs);

    } catch (err: any) {
      if (!silentUpdate) {
        setError(err.response?.data?.message || err.message || 'Failed to load preferences');
      }
    } finally {
      if (!silentUpdate) {
        setIsLoadingPreferences(false);
      }
    }
  }, [userId, questions.length]);

  useEffect(() => {
    fetchPreferences(true);
  }, [userId]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {

      if (event.data?.type === 'preference-updated') {

        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }

        fetchTimeoutRef.current = setTimeout(() => {
          const isInQuiz = questions.length > 0;
          fetchPreferences(true, isInQuiz);
        }, QUIZ_CONFIG.POSTMESSAGE_DELAY_MS);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchPreferences, questions.length]);

  useEffect(() => {
    const handleFocus = () => {
      if (!isGeneratingQuiz && questions.length === 0) {
        fetchPreferences(true, false);
      } else if (questions.length > 0) {
        fetchPreferences(true, true);
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchPreferences, isGeneratingQuiz, questions.length]);

  const generateQuiz = useCallback(async (isRetry: boolean = false) => {
    if (!tutorialId || !userId) {
      setError('Missing tutorial_id or user_id');
      return;
    }

    setIsGeneratingQuiz(true);
    setError(null);

    try {
      const response = await api.get(API_ENDPOINTS.ASSESSMENT, {
        params: {
          tutorial_id: tutorialId,
          user_id: userId,
          ...(isRetry && { fresh: 'true' })
        },
      });
      setAssessmentData(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to generate quiz';
      setError(errorMessage);
    } finally {
      setIsGeneratingQuiz(false);
    }
  }, [tutorialId, userId]);

  return {
    userPreferences,
    assessmentData,
    isLoadingPreferences,
    isGeneratingQuiz,
    error,
    generateQuiz,
    refetchPreferences: () => fetchPreferences(true)
  };
};

export default useQuizData;

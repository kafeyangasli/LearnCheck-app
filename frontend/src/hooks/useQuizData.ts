import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { AssessmentData } from '../types';
import { useQuizStore } from '../store/useQuizStore';
import { QUIZ_CONFIG, API_ENDPOINTS, POLLING_CONFIG, HTTP_STATUS } from '../config/constants';

interface AcceptedResponse {
  status: 'accepted';
  message: string;
  jobId: string;
  tutorialId: string;
  userId: string;
}

const useQuizData = (tutorialId: string | null, userId: string | null) => {
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState<boolean>(true);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pollingStatus, setPollingStatus] = useState<string | null>(null);

  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFetchRef = useRef<number>(0);
  const pollingStartTimeRef = useRef<number>(0);

  const questions = useQuizStore(state => state.questions);

  /**
   * Fetch user preferences with optional silent update
   * When silentUpdate is true, won't set loading state (preserves active quiz)
   */
  const fetchPreferences = useCallback(async (forceRefresh = false, silentUpdate = false) => {
    if (!userId) {
      setIsLoadingPreferences(false);
      return;
    }

    // If quiz is active and not explicitly silent, auto-enable silent update
    const shouldBeSilent = silentUpdate || questions.length > 0;

    const now = Date.now();
    if (!forceRefresh && now - lastFetchRef.current < QUIZ_CONFIG.DEBOUNCE_MS) {
      return;
    }

    lastFetchRef.current = now;

    // Only set loading state if NOT doing silent update
    if (!shouldBeSilent) {
      setIsLoadingPreferences(true);
    }

    // Only clear error if not doing silent update
    if (!shouldBeSilent) {
      setError(null);
    }

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
      // Only set error if not doing silent update
      if (!shouldBeSilent) {
        setError(err.response?.data?.message || err.message || 'Failed to load preferences');
      }
    } finally {
      // Only clear loading state if not doing silent update
      if (!shouldBeSilent) {
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
          // Always do silent update if quiz is active
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
        // Silent update when quiz is active
        fetchPreferences(true, true);
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchPreferences, isGeneratingQuiz, questions.length]);

  /**
   * Stop any ongoing polling
   */
  const stopPolling = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    setPollingStatus(null);
  }, []);

  /**
   * Poll the assessment endpoint until we get a 200 OK or timeout
   */
  const pollForResult = useCallback(async (isRetry: boolean = false): Promise<void> => {
    if (!tutorialId || !userId) {
      throw new Error('Missing tutorial_id or user_id');
    }

    // Check if we've exceeded max timeout
    const elapsedTime = Date.now() - pollingStartTimeRef.current;
    if (elapsedTime >= POLLING_CONFIG.MAX_TIMEOUT_MS) {
      throw new Error('Quiz generation timed out. Please try again.');
    }

    setPollingStatus('Generating quiz...');

    const response = await api.get(API_ENDPOINTS.ASSESSMENT, {
      params: {
        tutorial_id: tutorialId,
        user_id: userId,
        ...(isRetry && { fresh: 'true' })
      },
      validateStatus: (status) => status === HTTP_STATUS.OK || status === HTTP_STATUS.ACCEPTED,
    });

    if (response.status === HTTP_STATUS.OK) {
      // Quiz is ready!
      setAssessmentData(response.data);
      stopPolling();
      return;
    }

    if (response.status === HTTP_STATUS.ACCEPTED) {
      // Still processing, schedule next poll
      const acceptedData = response.data as AcceptedResponse;
      setPollingStatus(`Processing... Job: ${acceptedData.jobId}`);

      return new Promise((resolve, reject) => {
        pollingTimeoutRef.current = setTimeout(async () => {
          try {
            await pollForResult(isRetry);
            resolve();
          } catch (err) {
            reject(err);
          }
        }, POLLING_CONFIG.INTERVAL_MS);
      });
    }

    throw new Error('Unexpected response from server');
  }, [tutorialId, userId, stopPolling]);

  /**
   * Generate quiz with polling support for async backend
   */
  const generateQuiz = useCallback(async (isRetry: boolean = false) => {
    if (!tutorialId || !userId) {
      setError('Missing tutorial_id or user_id');
      return;
    }

    // Stop any existing polling
    stopPolling();

    setIsGeneratingQuiz(true);
    setError(null);
    pollingStartTimeRef.current = Date.now();

    try {
      await pollForResult(isRetry);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to generate quiz';
      setError(errorMessage);
      stopPolling();
    } finally {
      setIsGeneratingQuiz(false);
      setPollingStatus(null);
    }
  }, [tutorialId, userId, pollForResult, stopPolling]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    userPreferences,
    assessmentData,
    isLoadingPreferences,
    isGeneratingQuiz,
    error,
    pollingStatus,
    generateQuiz,
    refetchPreferences: () => fetchPreferences(true),
    stopPolling,
  };
};

export default useQuizData;

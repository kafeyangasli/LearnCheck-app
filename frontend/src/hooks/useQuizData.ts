import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { AssessmentData } from '../types';
import { useQuizStore } from '../store/useQuizStore';
import { QUIZ_CONFIG, API_ENDPOINTS } from '../config/constants';

/**
 * Custom hook for fetching and managing quiz data with real-time preference updates
 * 
 * BEST PRACTICES for User Preferences:
 * 
 * 1. **Non-Blocking Updates During Quiz**
 *    - Preferences should update silently without interrupting quiz flow
 *    - Use `silentUpdate` flag to prevent loading states during active quiz
 * 
 * 2. **Event-Driven Architecture**
 *    - Listen to postMessage from parent window (Dicoding Classroom)
 *    - React to focus events for cross-tab sync
 *    - Avoid continuous polling (performance + UX impact)
 * 
 * 3. **State Isolation**
 *    - Quiz progress stored separately from preferences
 *    - Preference changes don't reset quiz state
 *    - localStorage keys scoped per user+tutorial
 * 
 * 4. **Graceful Degradation**
 *    - Silent failures during quiz (don't show errors)
 *    - Debouncing prevents rapid-fire requests
 *    - Cache busting ensures fresh data when needed
 * 
 * @param tutorialId - Tutorial identifier
 * @param userId - User identifier
 * @returns Quiz data, preferences, loading states, and quiz generation function
 */
const useQuizData = (tutorialId: string | null, userId: string | null) => {
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState<boolean>(true);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFetchRef = useRef<number>(0);

  // Get quiz state to prevent refetch during quiz
  const questions = useQuizStore(state => state.questions);

  // Fetch user preferences with cache busting
  const fetchPreferences = useCallback(async (forceRefresh = false, silentUpdate = false) => {
    if (!userId) {
      setIsLoadingPreferences(false);
      return;
    }

    // CRITICAL: During quiz, only update preferences silently (no loading state)
    if (questions.length > 0 && !silentUpdate) {
      console.log('[LearnCheck] Skipping preference fetch - quiz in progress');
      return;
    }

    // Debounce: Prevent rapid-fire requests
    const now = Date.now();
    if (!forceRefresh && now - lastFetchRef.current < QUIZ_CONFIG.DEBOUNCE_MS) {
      console.log('[LearnCheck] Debouncing preference fetch...');
      return;
    }

    lastFetchRef.current = now;

    // Only show loading state if not during quiz
    if (!silentUpdate) {
      setIsLoadingPreferences(true);
    }
    setError(null);

    try {
      // Add timestamp to prevent caching
      const response = await api.get(API_ENDPOINTS.PREFERENCES, {
        params: {
          user_id: userId,
          _t: Date.now() // Cache buster
        },
      });

      const newPrefs = response.data.userPreferences;

      // Always update preferences (even during quiz)
      console.log('[LearnCheck] Preferences updated:', newPrefs);
      setUserPreferences(newPrefs);

    } catch (err: any) {
      console.error('[LearnCheck] Failed to fetch preferences:', err);
      // Don't set error during quiz (silent fail)
      if (!silentUpdate) {
        setError(err.response?.data?.message || err.message || 'Failed to load preferences');
      }
    } finally {
      if (!silentUpdate) {
        setIsLoadingPreferences(false);
      }
    }
  }, [userId, questions.length]);

  // Initial fetch on mount
  useEffect(() => {
    fetchPreferences(true);
  }, [userId]); // Only depend on userId, not fetchPreferences

  // Listen for messages from parent window (Dicoding Classroom)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: Verify origin if needed
      // if (event.origin !== 'https://dicoding.com') return;

      if (event.data?.type === 'preference-updated') {
        console.log('[LearnCheck] Received preference update from parent');

        // Clear existing timeout
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }

        // Silent update during quiz (no loading state, no interrupt)
        fetchTimeoutRef.current = setTimeout(() => {
          const isInQuiz = questions.length > 0;
          fetchPreferences(true, isInQuiz); // silentUpdate=true if in quiz
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

  // Optional: Refresh preferences when window regains focus
  // Only fetch if NOT during quiz
  useEffect(() => {
    const handleFocus = () => {
      // Only fetch on focus if NOT generating quiz and NO quiz loaded
      if (!isGeneratingQuiz && questions.length === 0) {
        console.log('[LearnCheck] Window focused - refreshing preferences');
        fetchPreferences(true, false);
      } else if (questions.length > 0) {
        console.log('[LearnCheck] Window focused but quiz in progress - silent refresh');
        fetchPreferences(true, true); // Silent update
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchPreferences, isGeneratingQuiz, questions.length]);

  /**
   * Generate quiz with AI
   * @param isRetry - If true, skip cache and generate fresh questions
   */
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
          ...(isRetry && { fresh: 'true' }) // Add fresh=true for retry attempts
        },
      });
      setAssessmentData(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to generate quiz';
      console.error('[LearnCheck] Quiz generation error:', errorMessage);
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
    refetchPreferences: () => fetchPreferences(true) // Expose manual refetch
  };
};

export default useQuizData;

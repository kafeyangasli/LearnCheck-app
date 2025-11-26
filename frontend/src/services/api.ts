
import axios from 'axios';

// TODO: Replace with environment variable for production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4002/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Trigger background quiz generation (non-blocking)
 * Call this when user opens the tutorial page
 * @param tutorialId - Tutorial identifier
 */
export const prepareQuiz = async (tutorialId: string): Promise<void> => {
  try {
    await api.post('/assessment/prepare', { tutorial_id: tutorialId });
    console.log('[API] Background quiz generation triggered');
  } catch (error) {
    // Silent fail - this is optional optimization
    console.warn('[API] Failed to trigger background generation:', error);
  }
};

export default api;

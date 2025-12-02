import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const prepareQuiz = async (tutorialId: string): Promise<void> => {
  try {
    await api.post('/assessment/prepare', { tutorial_id: tutorialId });
  } catch (error) {
  }
};

export default api;

import axios from 'axios';
import type { QuestionResponse, AnswerSubmission, AnswerResponse, AttemptData, Progress } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const learnCheckApi = {
  // Generate questions
  generateQuestions: async (
    tutorial_id: string,
    user_id: string,
    attempt_number: number
  ): Promise<QuestionResponse> => {
    const response = await api.post<QuestionResponse>('/api/questions/generate', {
      tutorial_id,
      user_id,
      attempt_number,
    });
    return response.data;
  },

  // Submit answer
  submitAnswer: async (data: AnswerSubmission): Promise<AnswerResponse> => {
    const response = await api.post<AnswerResponse>('/api/answers/submit', data);
    return response.data;
  },

  // Save progress
  saveProgress: async (
    user_id: string,
    tutorial_id: string,
    attempt_data: AttemptData
  ): Promise<{ status: string; message: string; data: Progress }> => {
    const response = await api.post('/api/progress/save', {
      user_id,
      tutorial_id,
      attempt_data,
    });
    return response.data;
  },

  // Get progress
  getProgress: async (user_id: string, tutorial_id: string): Promise<Progress> => {
    const response = await api.get<{ status: string; data: Progress }>(
      `/api/progress/${user_id}/${tutorial_id}`
    );
    return response.data.data;
  },
};

export default api;

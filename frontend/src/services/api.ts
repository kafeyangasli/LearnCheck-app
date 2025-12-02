import axios from 'axios';
import type { QuestionResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const learnCheckApi = {
  // Generate questions (Adapted for new Backend)
  // Generate questions (Adapted for new Backend with Polling)
  generateQuestions: async (
    tutorial_id: string,
    user_id: string,
    attempt_number: number
  ): Promise<QuestionResponse> => {

    const poll = async (retries = 30): Promise<any> => {
      const response = await api.get('/api/v1/assessment', {
        params: { tutorial_id, user_id },
        validateStatus: (status) => status === 200 || status === 202
      });

      if (response.status === 200) {
        return response.data;
      }

      if (response.status === 202 && retries > 0) {
        // Wait 2 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
        return poll(retries - 1);
      }

      throw new Error('Assessment generation timed out or failed');
    };

    // Start polling
    const data = await poll();
    const newQuestions = data.assessment.questions;

    // Map new structure to old structure
    const mappedQuestions = newQuestions.map((q: any) => ({
      question_id: q.id,
      question: q.questionText,
      // Map options to simple strings for compatibility, OR keep objects if components handle it
      // For now, let's keep the objects but cast them, as we updated the type
      options: q.options.map((opt: any) => opt.text),
      difficulty: 'medium', // Default since new API doesn't return difficulty per question
      correctOptionId: q.correctOptionId,
      explanation: q.explanation,
      _rawOptions: q.options // Store raw options to find correct ID later
    }));

    return {
      status: 'success',
      data: {
        questions: mappedQuestions,
        tutorial_id,
        user_id,
        attempt_number,
        difficulty: 'medium'
      }
    };
  },

  // Submit answer (Local Mock)
  // submitAnswer removed as validation is now local

  // Save progress (Mock - No endpoint yet)
  // saveProgress removed as backend doesn't support it

  // Get progress (Mock - No endpoint yet)
  // getProgress removed as backend doesn't support it
};

export default api;

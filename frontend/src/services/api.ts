import axios from "axios";
import type { QuestionResponse, UserPreferences } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const learnCheckApi = {
  generateQuestions: async (
    tutorial_id: string,
    user_id: string,
    attempt_number: number,
    newSession: boolean = false,
  ): Promise<QuestionResponse> => {
    const poll = async (retries = 30): Promise<any> => {
      const response = await api.get("/api/v1/assessment", {
        params: {
          tutorial_id,
          user_id,
          ...(newSession && { new_session: "true" }),
        },
        validateStatus: (status) => status === 200 || status === 202,
      });

      if (response.status === 200) {
        return response.data;
      }

      if (response.status === 202 && retries > 0) {
        // Wait 2 seconds before retrying
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return poll(retries - 1);
      }

      throw new Error("Assessment generation timed out or failed");
    };

    // Start polling
    const data = await poll();
    const newQuestions = data.assessment.questions;

    const mappedQuestions = newQuestions.map((q: any) => ({
      question_id: q.id,
      question: q.questionText,
      options: q.options.map((opt: any) => opt.text),
      difficulty: "easy",
      correctOptionId: q.correctOptionId,
      explanation: q.explanation,
      _rawOptions: q.options,
    }));

    return {
      status: "success",
      data: {
        questions: mappedQuestions,
        tutorial_id,
        user_id,
        attempt_number,
        difficulty: "medium",
      },
    };
  },

  getUserPreferences: async (user_id: string): Promise<UserPreferences> => {
    try {
      const response = await api.get("/api/v1/preferences", {
        params: { user_id },
      });

      if (response.data?.userPreferences) {
        const pref = response.data.userPreferences;
        return {
          theme: pref.theme || "light",
          fontSize: pref.fontSize || "medium",
          fontStyle: pref.fontStyle || "default",
          layoutWidth: pref.layoutWidth || "centered",
        };
      }

      // Return defaults if response format is unexpected
      return {
        theme: "light",
        fontSize: "medium",
        fontStyle: "default",
        layoutWidth: "centered",
      };
    } catch (error) {
      console.error("Failed to fetch user preferences:", error);
      // Return defaults on error
      return {
        theme: "light",
        fontSize: "medium",
        fontStyle: "default",
        layoutWidth: "centered",
      };
    }
  },
};

export default api;

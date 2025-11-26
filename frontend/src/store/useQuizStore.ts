
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Question } from '../types';

type QuizState = {
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswers: { [questionId: string]: string };
  submittedAnswers: { [questionId: string]: boolean };
  quizOver: boolean;
  revealAnswers: boolean; // To control showing correct/incorrect answers per question
  storageKey: string;
};

type QuizActions = {
  setQuestions: (questions: Question[]) => void;
  selectAnswer: (questionId: string, optionId: string) => void;
  submitAnswer: (questionId: string) => void;
  nextQuestion: () => void;
  finishQuiz: () => void;
  reset: () => void;
  initialize: (userId: string, tutorialId: string) => void;
};

// Fix: The original `getStorage` implementation was incorrect because it cannot access
// the store's `get` function. This proxy storage object is a workaround.
// It allows the storage methods (`getItem`, `setItem`) to dynamically access
// the `storageKey` from the store's state.
const dynamicStorage = {
  _get: (() => ({})) as () => QuizState & QuizActions, // This will be replaced by the store's `get` function.

  getItem: (name: string): string | null => {
    const state = dynamicStorage._get();
    return localStorage.getItem(state.storageKey || name);
  },
  setItem: (name: string, value: string): void => {
    const state = dynamicStorage._get();
    localStorage.setItem(state.storageKey || name, value);
  },
  removeItem: (name: string): void => {
    const state = dynamicStorage._get();
    localStorage.removeItem(state.storageKey || name);
  },
};

export const useQuizStore = create<QuizState & QuizActions>()(
  persist(
    (set, get) => {
      // Provide the store's `get` function to our proxy storage.
      dynamicStorage._get = get;
      
      return {
        questions: [],
        currentQuestionIndex: 0,
        selectedAnswers: {},
        submittedAnswers: {},
        quizOver: false,
        revealAnswers: false,
        storageKey: 'quiz-storage',

        initialize: (userId, tutorialId) => {
          const key = `learncheck-${userId}-${tutorialId}`;
          if (get().storageKey === key) {
            return;
          }

          // Fix: The original logic didn't load persisted state. This implementation
          // manually loads the state from localStorage for the new key.
          const savedStateRaw = localStorage.getItem(key);
          let savedState = {};
          if (savedStateRaw) {
            try {
              savedState = JSON.parse(savedStateRaw).state;
            } catch (e) {
              console.error("Failed to parse saved state", e);
            }
          }
          
          set({
            storageKey: key,
            // Set defaults, then overwrite with any saved progress
            currentQuestionIndex: 0,
            selectedAnswers: {},
            submittedAnswers: {},
            quizOver: false,
            ...savedState,
            // Non-persisted state should always be reset
            revealAnswers: false,
          });
        },

        setQuestions: (questions) => set({ 
          // Set questions and ensure quiz is not over (fresh start)
          questions,
          quizOver: false,
          revealAnswers: false,
        }),

        selectAnswer: (questionId, optionId) => {
          if (get().submittedAnswers[questionId]) return;
          set((state) => ({
            selectedAnswers: {
              ...state.selectedAnswers,
              [questionId]: optionId,
            },
          }));
        },

        submitAnswer: (questionId) => {
          set((state) => ({
            submittedAnswers: {
              ...state.submittedAnswers,
              [questionId]: true,
            },
          }));
        },

        nextQuestion: () => {
          const { currentQuestionIndex, questions } = get();
          if (currentQuestionIndex < questions.length - 1) {
              set((state) => ({
                currentQuestionIndex: state.currentQuestionIndex + 1,
              }));
          } else {
              set({ quizOver: true });
          }
        },

        finishQuiz: () => set({ quizOver: true }),

        reset: () => {
          // Keep the storageKey, but reset progress.
          set({
            currentQuestionIndex: 0,
            selectedAnswers: {},
            submittedAnswers: {},
            quizOver: false,
            revealAnswers: false,
          });
        },
      }
    },
    {
      name: 'quiz-storage', // default name, will be dynamically managed
      // Fix: Replaced the incorrect `getStorage` with the working `storage` proxy.
      storage: createJSONStorage(() => dynamicStorage),
      partialize: (state) => ({
        currentQuestionIndex: state.currentQuestionIndex,
        selectedAnswers: state.selectedAnswers,
        submittedAnswers: state.submittedAnswers,
        quizOver: state.quizOver,
      }),
    }
  )
);

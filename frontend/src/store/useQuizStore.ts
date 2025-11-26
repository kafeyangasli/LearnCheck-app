import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Question } from '../types';

type QuizState = {
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswers: { [questionId: string]: string };
  submittedAnswers: { [questionId: string]: boolean };
  quizOver: boolean;
  revealAnswers: boolean;
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

const dynamicStorage = {
  _get: (() => ({})) as () => QuizState & QuizActions,

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

          const savedStateRaw = localStorage.getItem(key);
          let savedState = {};
          if (savedStateRaw) {
            try {
              savedState = JSON.parse(savedStateRaw).state;
            } catch (e) {
            }
          }

          set({
            storageKey: key,
            currentQuestionIndex: 0,
            selectedAnswers: {},
            submittedAnswers: {},
            quizOver: false,
            ...savedState,
            revealAnswers: false,
          });
        },

        setQuestions: (questions) => set({
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
      name: 'quiz-storage',
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

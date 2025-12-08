import { useState, useEffect } from "react";
import { learnCheckApi } from "../../../services/api";
import type { Question, QuizState } from "../types";

interface UseQuizProps {
    tutorialId: string;
    userId: string;
}

export const useQuiz = ({ tutorialId, userId }: UseQuizProps) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [attemptNumber, setAttemptNumber] = useState(1);
    const [quizStarted, setQuizStarted] = useState(false);

    const [quizState, setQuizState] = useState<QuizState>({
        currentQuestionIndex: 0,
        selectedAnswers: [],
        showFeedback: false,
        feedback: null,
        isCorrect: null,
        score: 0,
        isCompleted: false,
        startTime: Date.now(),
        questionStartTimes: [],
    });

    const STORAGE_KEY = `quiz_state_${tutorialId}_${userId}`;

    const loadQuestions = async (autoStart = false) => {
        try {
            setLoading(true);
            setError(null);

            setAttemptNumber(1);

            const response = await learnCheckApi.generateQuestions(
                tutorialId,
                userId,
                1
            );

            setQuestions(response.data.questions);
            const now = Date.now();
            setQuizState((prev) => ({
                ...prev,
                selectedAnswers: new Array(response.data.questions.length).fill(null),
                startTime: now,
                isCompleted: false,
                score: 0,
                currentQuestionIndex: 0,
                showFeedback: false,
                feedback: null,
                isCorrect: null,
                questionStartTimes: new Array(response.data.questions.length)
                    .fill(0)
                    .map((_, i) => (i === 0 ? now : 0)),
            }));

            if (autoStart) {
                setQuizStarted(true);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to load questions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const savedState = localStorage.getItem(STORAGE_KEY);

        if (savedState) {
            try {
                const {
                    questions: savedQuestions,
                    quizState: savedQuizState,
                    attemptNumber: savedAttempt,
                } = JSON.parse(savedState);

                // Only restore if quiz is NOT completed (in-progress)
                if (savedQuestions && savedQuestions.length > 0 && !savedQuizState.isCompleted) {
                    setQuestions(savedQuestions);
                    setQuizState(savedQuizState);
                    setAttemptNumber(savedAttempt || 1);
                    // Only set quizStarted if user actually started the quiz
                    setQuizStarted(savedQuizState.currentQuestionIndex > 0 || savedQuizState.selectedAnswers.some((a: number | null) => a !== null));
                    return;
                }

                // If completed, clear old state
                localStorage.removeItem(STORAGE_KEY);
            } catch (e) {
                localStorage.removeItem(STORAGE_KEY);
            }
        }

        // If not found in storage (new user/tutorial), reset state
        setQuestions([]);
        setQuizStarted(false);
        setQuizState({
            currentQuestionIndex: 0,
            selectedAnswers: [],
            showFeedback: false,
            feedback: null,
            isCorrect: null,
            score: 0,
            isCompleted: false,
            startTime: Date.now(),
            questionStartTimes: [],
        });
        setAttemptNumber(1);

        // And start background fetch
        loadQuestions(false);
    }, [tutorialId, userId]);

    useEffect(() => {
        if (!loading && questions.length > 0 && quizStarted) {
            const stateToSave = {
                questions,
                quizState,
                attemptNumber,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        }
    }, [questions, quizState, attemptNumber, loading]);

    const startQuiz = () => {
        setQuizStarted(true);
    };

    const handleAnswerSelect = (answerIndex: number) => {
        setQuizState((prev) => {
            const newAnswers = [...prev.selectedAnswers];
            newAnswers[prev.currentQuestionIndex] = answerIndex;
            return { ...prev, selectedAnswers: newAnswers };
        });
    };

    const handleSubmitAnswer = async () => {
        const currentQuestion = questions[quizState.currentQuestionIndex];
        const selectedAnswer =
            quizState.selectedAnswers[quizState.currentQuestionIndex];

        if (selectedAnswer === null) {
            alert("Please select an answer");
            return;
        }

        let isCorrect = false;
        let feedback = "";

        const correctPrefixes = [
            "Mantap, jawabanmu benar! ",
            "Tepat sekali! ",
            "Keren, kamu paham konsepnya! ",
            "Betul! Lanjutkan momentum belajarmu! ",
            "Luar biasa, pemahamanmu solid! ",
        ];

        const incorrectPrefixes = [
            "Hampir benar! Coba kita lihat lagi yuk. ",
            "Belum tepat, tapi jangan khawatir, ini bagian dari belajar. ",
            "Oops, masih kurang pas. Yuk kita bedah bareng! ",
            "Sedikit lagi! Coba perhatikan penjelasan berikut. ",
            "Jawabanmu keliru, tapi ini kesempatan bagus untuk belajar. ",
        ];

        if (currentQuestion._rawOptions && currentQuestion.correctOptionId) {
            const selectedOptionId = currentQuestion._rawOptions[selectedAnswer].id;
            isCorrect = selectedOptionId === currentQuestion.correctOptionId;

            const prefix = isCorrect
                ? correctPrefixes[Math.floor(Math.random() * correctPrefixes.length)]
                : incorrectPrefixes[
                Math.floor(Math.random() * incorrectPrefixes.length)
                ];

            const rawExplanation = currentQuestion.explanation || "";
            const explanationParts = rawExplanation.split("Hint:");
            const mainExplanation = explanationParts[0].trim();
            const hintText =
                explanationParts.length > 1 ? explanationParts[1].trim() : null;

            feedback = `${prefix}\n\n${mainExplanation}`;
            if (hintText) {
                feedback += `\n\n💡 Hint: ${hintText}`;
            }
        } else {
            feedback = "Feedback unavailable";
        }

        setQuizState((prev) => ({
            ...prev,
            showFeedback: true,
            feedback: feedback,
            isCorrect: isCorrect,
            score: prev.score + (isCorrect ? 1 : 0),
        }));
    };

    const completeQuiz = async () => {
        setQuizState((prev) => ({ ...prev, isCompleted: true }));
    };

    const handleNextQuestion = () => {
        const isLastQuestion =
            quizState.currentQuestionIndex === questions.length - 1;

        if (isLastQuestion) {
            completeQuiz();
        } else {
            const nextIndex = quizState.currentQuestionIndex + 1;
            const now = Date.now();

            setQuizState((prev) => {
                const newStartTimes = [...prev.questionStartTimes];
                if (newStartTimes[nextIndex] === 0) {
                    newStartTimes[nextIndex] = now;
                }

                return {
                    ...prev,
                    currentQuestionIndex: nextIndex,
                    showFeedback: false,
                    feedback: null,
                    isCorrect: null,
                    isCompleted: false,
                    questionStartTimes: newStartTimes,
                };
            });
        }
    };

    const handleRetry = () => {
        localStorage.removeItem(STORAGE_KEY);

        setQuizStarted(false);
        setQuestions([]);
        setQuizState({
            currentQuestionIndex: 0,
            selectedAnswers: [],
            showFeedback: false,
            feedback: null,
            isCorrect: null,
            score: 0,
            isCompleted: false,
            startTime: Date.now(),
            questionStartTimes: [],
        });

        // Trigger background fetch again
        loadQuestions(false);
    };

    const handleTimeout = () => {
        setQuizState((prev) => ({ ...prev, isCompleted: true }));
    };

    const handleRestart = () => {
        localStorage.removeItem(STORAGE_KEY);

        setQuestions([]);
        setQuizState({
            currentQuestionIndex: 0,
            selectedAnswers: [],
            showFeedback: false,
            feedback: null,
            isCorrect: null,
            score: 0,
            isCompleted: false,
            startTime: Date.now(),
            questionStartTimes: [],
        });

        loadQuestions(true); // Auto start for restart
    };

    return {
        questions,
        loading,
        error,
        quizState,
        quizStarted,
        loadQuestions,
        startQuiz,
        handleAnswerSelect,
        handleSubmitAnswer,
        handleNextQuestion,
        handleRetry,
        handleRestart,
        handleTimeout,
    };
};

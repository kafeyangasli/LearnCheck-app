import React, { useState, useEffect } from "react";
import { learnCheckApi } from "../services/api";
import type { Question, QuizState, AttemptData } from "../types";
import QuestionCard from "./QuestionCard";
import FeedbackCard from "./FeedbackCard";
import ProgressCard from "./ProgressCard";
import ResultCard from "./ResultCard";

interface QuizContainerProps {
  tutorialId: string;
  userId: string;
}

const QuizContainer = ({ tutorialId, userId }: QuizContainerProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attemptNumber, setAttemptNumber] = useState(1);

  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    selectedAnswers: [],
    showFeedback: false,
    feedback: null,
    isCorrect: null,
    score: 0,
    isCompleted: false,
    startTime: Date.now(),
  });

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get progress to determine attempt number
      const progress = await learnCheckApi.getProgress(userId, tutorialId);
      const nextAttempt = (progress.total_attempts || 0) + 1;
      setAttemptNumber(nextAttempt);

      // Generate questions
      const response = await learnCheckApi.generateQuestions(
        tutorialId,
        userId,
        nextAttempt,
      );

      setQuestions(response.data.questions);
      setQuizState((prev) => ({
        ...prev,
        selectedAnswers: new Array(response.data.questions.length).fill(null),
        startTime: Date.now(),
      }));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load questions");
      console.error("Error loading questions:", err);
    } finally {
      setLoading(false);
    }
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

    try {
      const response = await learnCheckApi.submitAnswer({
        question_id: currentQuestion.question_id,
        selected_answer: selectedAnswer,
        user_id: userId,
      });

      setQuizState((prev) => ({
        ...prev,
        showFeedback: true,
        feedback: response.data.feedback,
        isCorrect: response.data.is_correct,
        score: prev.score + (response.data.is_correct ? 1 : 0),
      }));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit answer");
    }
  };

  const handleNextQuestion = () => {
    const isLastQuestion =
      quizState.currentQuestionIndex === questions.length - 1;

    if (isLastQuestion) {
      // Complete quiz
      completeQuiz();
    } else {
      // Move to next question
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        showFeedback: false,
        feedback: null,
        isCorrect: null,
      }));
    }
  };

  const completeQuiz = async () => {
    const timeTaken = Math.floor((Date.now() - quizState.startTime) / 1000);

    const attemptData: AttemptData = {
      timestamp: new Date().toISOString(),
      score: quizState.score,
      total_questions: questions.length,
      difficulty: questions[0]?.difficulty || "medium",
      time_taken: timeTaken,
      answers: questions.map((q, index) => ({
        question_id: q.question_id,
        selected_answer: quizState.selectedAnswers[index] || 0,
        is_correct: quizState.selectedAnswers[index] !== null,
      })),
    };

    try {
      await learnCheckApi.saveProgress(userId, tutorialId, attemptData);
      setQuizState((prev) => ({ ...prev, isCompleted: true }));
    } catch (err: any) {
      console.error("Failed to save progress:", err);
      setQuizState((prev) => ({ ...prev, isCompleted: true }));
    }
  };

  const handleRetry = () => {
    setQuizState({
      currentQuestionIndex: 0,
      selectedAnswers: [],
      showFeedback: false,
      feedback: null,
      isCorrect: null,
      score: 0,
      isCompleted: false,
      startTime: Date.now(),
    });
    loadQuestions();
  };

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-container">
        <div className="error-state">
          <h3>❌ Error</h3>
          <p>{error}</p>
          <button onClick={loadQuestions} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (quizState.isCompleted) {
    return (
      <div className="quiz-container">
        <ResultCard
          score={quizState.score}
          totalQuestions={questions.length}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  const currentQuestion = questions[quizState.currentQuestionIndex];
  const selectedAnswer =
    quizState.selectedAnswers[quizState.currentQuestionIndex];

  return (
    <div className="quiz-container">
      <ProgressCard
        currentQuestion={quizState.currentQuestionIndex + 1}
        totalQuestions={questions.length}
        score={quizState.score}
        attemptNumber={attemptNumber}
      />

      {!quizState.showFeedback ? (
        <QuestionCard
          question={currentQuestion}
          questionNumber={quizState.currentQuestionIndex + 1}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={handleAnswerSelect}
          onSubmit={handleSubmitAnswer}
        />
      ) : (
        <FeedbackCard
          feedback={quizState.feedback!}
          isCorrect={quizState.isCorrect!}
          onNext={handleNextQuestion}
          isLastQuestion={
            quizState.currentQuestionIndex === questions.length - 1
          }
        />
      )}
    </div>
  );
};

export default QuizContainer;

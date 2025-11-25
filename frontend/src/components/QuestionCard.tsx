import React from "react";
import type { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  selectedAnswer: number | null;
  onAnswerSelect: (index: number) => void;
  onSubmit: () => void;
}

const QuestionCard = ({
  question,
  questionNumber,
  selectedAnswer,
  onAnswerSelect,
  onSubmit,
}: QuestionCardProps) => {
  return (
    <div className="question-card">
      <div className="question-header">
        <h2>Question {questionNumber}</h2>
        <span className={`difficulty-badge difficulty-${question.difficulty}`}>
          {question.difficulty}
        </span>
      </div>

      <div className="question-text">
        <p>{question.question}</p>
      </div>

      <div className="options-container">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={`option-button ${selectedAnswer === index ? 'selected' : ''}`}
            onClick={() => onAnswerSelect(index)}
          >
            <span className="option-letter">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="option-text">
              {typeof option === 'object' ? (option as any).text : option}
            </span>
          </button>
        ))}
      </div>

      <div className="question-actions">
        <button
          className="btn btn-primary"
          onClick={onSubmit}
          disabled={selectedAnswer === null}
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
};

export default QuestionCard;

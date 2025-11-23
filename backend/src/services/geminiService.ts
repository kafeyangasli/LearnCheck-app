import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import config from "../config/config";
import logger from "../config/logger";
import { LLMQuestion } from "../types";

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    if (!config.gemini.apiKey) {
      logger.error("GEMINI_API_KEY is not configured");
      throw new Error("GEMINI_API_KEY is required");
    }

    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: config.gemini.model });
  }

  async generateQuestions(
    content: string,
    difficulty: "easy" | "medium" | "hard" = "medium",
    count: number = 3,
  ): Promise<LLMQuestion[]> {
    try {
      logger.info(
        `Generating ${count} questions with difficulty: ${difficulty}`,
      );

      const prompt = this.buildQuestionPrompt(content, difficulty, count);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON from response
      const questions = this.parseQuestionsFromResponse(text);

      if (!questions || questions.length === 0) {
        throw new Error("Failed to generate valid questions");
      }

      logger.info(`Successfully generated ${questions.length} questions`);
      return questions;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error generating questions: ${err.message}`);
      throw error;
    }
  }

  private buildQuestionPrompt(
    content: string,
    difficulty: string,
    count: number,
  ): string {
    return `You are an expert educational content creator. Generate ${count} multiple-choice questions based on the following tutorial content.

Tutorial Content:
${content}

Requirements:
- Generate exactly ${count} multiple-choice questions
- Difficulty level: ${difficulty}
- Each question must have 4 options (A, B, C, D)
- Only ONE option should be correct
- Questions should test understanding, not just memorization
- Return ONLY a valid JSON array, no additional text

JSON Format (respond with ONLY this JSON, no markdown, no explanations):
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "difficulty": "${difficulty}"
  }
]

Rules:
- correct_answer is the index (0-3) of the correct option
- difficulty must be one of: "easy", "medium", "hard"
- Questions for difficulty levels:
  * easy: Direct recall, definitions, basic concepts
  * medium: Application of concepts, understanding relationships
  * hard: Analysis, synthesis, complex problem-solving

Generate the questions now:`;
  }

  private parseQuestionsFromResponse(text: string): LLMQuestion[] {
    try {
      // Remove markdown code blocks if present
      let jsonText = text.trim();
      jsonText = jsonText.replace(/```json\n?/g, "");
      jsonText = jsonText.replace(/```\n?/g, "");
      jsonText = jsonText.trim();

      // Parse JSON
      const questions = JSON.parse(jsonText);

      // Validate structure
      if (!Array.isArray(questions)) {
        throw new Error("Response is not an array");
      }

      // Validate each question
      const validatedQuestions: LLMQuestion[] = questions.map(
        (q: any, index: number) => {
          if (
            !q.question ||
            !q.options ||
            !Array.isArray(q.options) ||
            q.options.length !== 4
          ) {
            throw new Error(`Invalid question structure at index ${index}`);
          }

          if (
            q.correct_answer === undefined ||
            q.correct_answer < 0 ||
            q.correct_answer > 3
          ) {
            throw new Error(`Invalid correct_answer at index ${index}`);
          }

          return {
            question: q.question,
            options: q.options,
            correct_answer: q.correct_answer,
            difficulty: q.difficulty || "medium",
          };
        },
      );

      return validatedQuestions;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error parsing questions from response: ${err.message}`);
      logger.error(`Response text: ${text}`);
      throw new Error("Failed to parse questions from LLM response");
    }
  }

  async generateFeedback(
    question: string,
    selectedAnswer: string,
    correctAnswer: string,
    isCorrect: boolean,
  ): Promise<string> {
    try {
      logger.info(`Generating feedback for question, isCorrect: ${isCorrect}`);

      const prompt = this.buildFeedbackPrompt(
        question,
        selectedAnswer,
        correctAnswer,
        isCorrect,
      );

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const feedback = response.text();

      logger.info("Successfully generated feedback");
      return feedback.trim();
    } catch (error) {
      const err = error as Error;
      logger.error(`Error generating feedback: ${err.message}`);
      throw error;
    }
  }

  private buildFeedbackPrompt(
    question: string,
    selectedAnswer: string,
    correctAnswer: string,
    isCorrect: boolean,
  ): string {
    if (isCorrect) {
      return `Siswa menjawab pertanyaan berikut dengan benar:

Pertanyaan: ${question}
Jawaban mereka: ${selectedAnswer}
Jawaban yang benar: ${correctAnswer}

Berikan feedback yang mendorong dengan:
1. Konfirmasi bahwa jawaban mereka benar
2. Berikan wawasan tambahan atau penjelasan lebih dalam terkait topik
3. Dorong untuk terus belajar
4. Singkat dan padat (2-3 kalimat)
5. WAJIB gunakan bahasa Indonesia

Berikan feedback sekarang dalam bahasa Indonesia:`;
    } else {
      return `Siswa menjawab pertanyaan berikut dengan salah:

Pertanyaan: ${question}
Jawaban mereka: ${selectedAnswer}
Jawaban yang benar: ${correctAnswer}

Berikan feedback konstruktif yang:
1. Jelaskan mengapa jawaban mereka salah (tanpa mengecilkan hati)
2. Bimbing mereka menuju jawaban yang benar dengan petunjuk
3. Jelaskan mengapa jawaban yang benar itu tepat
4. Tetap membantu dan suportif (3-4 kalimat)
5. WAJIB gunakan bahasa Indonesia

Berikan feedback sekarang dalam bahasa Indonesia:`;
    }
  }
}

export default new GeminiService();

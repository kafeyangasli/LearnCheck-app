import { GoogleGenAI, Type } from '@google/genai';
import { API_CONFIG, ERROR_MESSAGES } from '../config/constants';
import type { Assessment } from '../types/definitions';

if (!process.env.GEMINI_API_KEY) {
  console.error('[Gemini] CRITICAL: GEMINI_API_KEY not found in environment variables');
  throw new Error('GEMINI_API_KEY is required');
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

console.log('[Gemini] SDK initialized successfully');
const assessmentSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      description: "Sebuah array berisi 18 pertanyaan pilihan ganda yang bervariasi.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: "ID unik untuk pertanyaan, contoh: 'q1', 'q2'."
          },
          questionText: {
            type: Type.STRING,
            description: "Teks pertanyaan."
          },
          options: {
            type: Type.ARRAY,
            description: "Sebuah array berisi 4 pilihan jawaban.",
            items: {
              type: Type.OBJECT,
              properties: {
                id: {
                  type: Type.STRING,
                  description: "ID unik untuk pilihan, contoh: 'opt1', 'opt2'."
                },
                text: {
                  type: Type.STRING,
                  description: "Teks jawaban."
                }
              },
              required: ["id", "text"]
            }
          },
          correctOptionId: {
            type: Type.STRING,
            description: "ID dari pilihan jawaban yang benar dari array 'options'."
          },
          explanation: {
            type: Type.STRING,
            description: "Penjelasan netral yang fokus pada konsep, menjelaskan mengapa jawaban benar dan yang lain salah. Harus diakhiri dengan 'Hint:' diikuti petunjuk."
          }
        },
        required: ["id", "questionText", "options", "correctOptionId", "explanation"]
      }
    }
  },
  required: ["questions"]
};

export const generateAssessmentQuestions = async (textContent: string): Promise<Assessment> => {
  const prompt = `
    Berdasarkan konten berikut, buatkan 18 pertanyaan pilihan ganda dalam Bahasa Indonesia untuk menguji pemahaman secara menyeluruh.
    Buat pertanyaan yang bervariasi dari berbagai topik dan tingkat kesulitan (mudah, sedang, sulit) dari materi.
    Setiap pertanyaan harus memiliki 4 pilihan jawaban.
    Untuk setiap pertanyaan, sertakan teks pertanyaan, 4 pilihan jawaban (masing-masing dengan ID unik seperti 'opt1', 'opt2', dst.), ID dari pilihan yang benar, dan sebuah penjelasan.
    
    Penting: Ikuti aturan ini saat membuat penjelasan:
    - Mulai penjelasan secara langsung tanpa kalimat pembuka yang bersifat menilai seperti "Tepat sekali!" atau "Kurang tepat.". Penjelasan harus fokus pada konsepnya.
    - Jelaskan mengapa jawaban yang benar itu benar dan mengapa pilihan-pilihan lain salah, merujuk ke konsep inti dari materi.
    - Jaga agar penjelasan singkat (maksimal 3 kalimat).
    - Setelah penjelasan utama, tambahkan "Hint:" diikuti dengan satu kalimat rekomendasi untuk mempelajari kembali topik spesifik yang relevan dengan pertanyaan ini. Contoh: "Untuk lebih paham, coba pelajari lagi materi tentang state di React."
    - Tulis dalam Bahasa Indonesia yang kasual namun profesional.
    
    Gunakan gaya bahasa yang santai dan mudah dimengerti untuk seluruh soal.

    Konten:
    ---
    ${textContent}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: API_CONFIG.GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: assessmentSchema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error(ERROR_MESSAGES.EMPTY_GEMINI_RESPONSE);
    }

    return JSON.parse(jsonText) as Assessment;
  } catch (error) {
    console.error("[Gemini] Error generating assessment:", error);
    throw new Error(ERROR_MESSAGES.GEMINI_GENERATION_FAILED);
  }
};

export const selectRandomQuestions = (assessment: Assessment): Assessment => {
  const allQuestions = assessment.questions;

  if (allQuestions.length <= 3) {
    return assessment;
  }

  const shuffled = [...allQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return {
    questions: shuffled.slice(0, 3),
  };
};
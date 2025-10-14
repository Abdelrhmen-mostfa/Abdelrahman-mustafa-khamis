
import { GoogleGenAI, Type } from "@google/genai";
import type { Question } from '../types';

// Per coding guidelines, initialize the AI client directly and assume the API key is set in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuizQuestions = async (topic: string, count: number): Promise<Omit<Question, 'id'>[]> => {
  const prompt = `
    أنت خبير في إنشاء محتوى تعليمي للأطفال الذين تتراوح أعمارهم بين 6-10 سنوات.
    مهمتك هي إنشاء مجموعة من أسئلة الاختبار متعددة الخيارات بناءً على موضوع معين.
    يجب أن تكون الأسئلة بسيطة وواضحة وجذابة للجمهور الصغير.
    يجب أن يحتوي كل سؤال على أربع إجابات محتملة بالضبط. يجب أن تكون إجابة واحدة صحيحة. يجب أن تكون الإجابات الثلاثة الأخرى معقولة ولكن غير صحيحة.

    الموضوع هو: ${topic}

    الرجاء إنشاء ${count} أسئلة.
  `;

  const questionSchema = {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING, description: 'نص سؤال الاختبار.' },
      options: {
        type: Type.ARRAY,
        description: 'مجموعة من أربع إجابات محتملة بالضبط.',
        items: { type: Type.STRING },
      },
      correctAnswerIndex: {
        type: Type.INTEGER,
        description: 'الفهرس (0-3) للإجابة الصحيحة في مصفوفة الخيارات.',
      },
    },
    required: ['question', 'options', 'correctAnswerIndex'],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: `مجموعة من ${count} أسئلة اختبار حول ${topic}.`,
          items: questionSchema,
        },
      },
    });

    const jsonString = response.text.trim();
    const generatedQuestions = JSON.parse(jsonString);
    
    // Validate the structure
    if (!Array.isArray(generatedQuestions)) {
        throw new Error("AI response is not an array.");
    }

    return generatedQuestions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
    }));

  } catch (error) {
    console.error("Error generating questions with Gemini:", error);
    throw new Error("فشل في إنشاء الأسئلة. الرجاء المحاولة مرة أخرى.");
  }
};

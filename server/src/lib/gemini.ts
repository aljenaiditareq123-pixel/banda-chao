import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Get the Gemini 1.5 Pro model
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

/**
 * Generate AI response using Gemini 1.5 Pro
 * @param prompt - The full prompt to send to Gemini
 * @returns The generated text response
 */
export async function generateFounderAIResponse(prompt: string): Promise<string> {
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text.trim();
  } catch (error: any) {
    console.error("[FounderAI] Gemini error:", error);
    // Return a user-friendly error message in Arabic
    return "عذراً، حدث خطأ مؤقت في نظام الذكاء الاصطناعي الخاص بباندتشاو. حاول مرة أخرى بعد قليل.";
  }
}

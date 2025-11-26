import { GoogleGenerativeAI } from "@google/generative-ai";

// Check if Gemini API key is available
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini client only if API key is available
let genAI: GoogleGenerativeAI | null = null;
let model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null;

if (GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    });
  } catch (error) {
    console.warn("[FounderAI] Failed to initialize Gemini client:", error);
  }
} else {
  console.warn("[FounderAI] GEMINI_API_KEY is not set. AI features will be disabled.");
}

/**
 * Generate AI response using Gemini 1.5 Pro
 * @param prompt - The full prompt to send to Gemini
 * @returns The generated text response
 */
export async function generateFounderAIResponse(prompt: string): Promise<string> {
  // If Gemini is not available, return a friendly message
  if (!model || !genAI) {
    console.warn("[FounderAI] Gemini API is not available. Returning fallback message.");
    return "عذراً، نظام الذكاء الاصطناعي غير متاح حالياً. يرجى المحاولة لاحقاً.";
  }

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

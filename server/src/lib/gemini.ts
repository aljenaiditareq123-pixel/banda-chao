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
 * @throws Error if Gemini API is not available or if API call fails
 */
export async function generateFounderAIResponse(prompt: string): Promise<string> {
  // Check if Gemini API key is set
  if (!GEMINI_API_KEY) {
    const error = new Error('GEMINI_API_KEY is not set in environment variables');
    console.error("[FounderAI] Gemini API key missing:", error);
    throw error;
  }

  // If Gemini is not initialized, throw error
  if (!model || !genAI) {
    const error = new Error('Gemini client is not initialized. Check GEMINI_API_KEY configuration.');
    console.error("[FounderAI] Gemini client not initialized:", error);
    throw error;
  }

  try {
    console.log("[FounderAI] Sending request to Gemini 1.5 Pro...");
    console.log("[FounderAI] Prompt length:", prompt.length, "characters");
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    
    if (!response) {
      throw new Error('Empty response from Gemini API');
    }
    
    const text = response.text();
    
    if (!text || text.trim().length === 0) {
      throw new Error('Empty text response from Gemini API');
    }
    
    console.log("[FounderAI] Response received successfully, length:", text.length, "characters");
    return text.trim();
  } catch (error: any) {
    console.error("[FounderAI] Gemini API error:", {
      message: error?.message || 'Unknown error',
      status: error?.status || error?.statusCode || 'N/A',
      code: error?.code || 'N/A',
      details: error?.response?.data || error?.details || 'No additional details',
    });
    
    // Re-throw error with more context
    const enhancedError = new Error(
      `Gemini API error: ${error?.message || 'Unknown error'}. ` +
      `Status: ${error?.status || error?.statusCode || 'N/A'}. ` +
      `Code: ${error?.code || 'N/A'}`
    );
    (enhancedError as any).originalError = error;
    throw enhancedError;
  }
}

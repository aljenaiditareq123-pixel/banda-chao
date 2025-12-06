import { GoogleGenerativeAI } from "@google/generative-ai";

// Check if Gemini API key is available
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini client only if API key is available
let genAI: GoogleGenerativeAI | null = null;
let model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null;

if (GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Use gemini-1.5-pro (most reliable) or try gemini-1.5-flash
    // Note: Model availability depends on API key and region
    // If gemini-1.5-pro fails, try: gemini-1.5-flash, gemini-pro, or gemini-2.0-flash-exp
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-pro";
    model = genAI.getGenerativeModel({
      model: modelName,
    });
    console.log(`[FounderAI] ✅ Gemini client initialized with model: ${modelName}`);
  } catch (error) {
    console.warn("[FounderAI] Failed to initialize Gemini client:", error);
  }
} else {
  console.warn("[FounderAI] GEMINI_API_KEY is not set. AI features will be disabled.");
}

/**
 * Generate AI response using Gemini 1.0 Pro
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
    // Try multiple models in order of preference (fallback mechanism)
    const modelNames = process.env.GEMINI_MODEL 
      ? [process.env.GEMINI_MODEL] 
      : ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"];
    
    let lastError: any = null;
    
    for (const modelName of modelNames) {
      try {
        console.log(`[FounderAI] Trying model: ${modelName}...`);
        console.log("[FounderAI] Prompt length:", prompt.length, "characters");
        
        // Create model instance for this attempt
        const attemptModel = genAI!.getGenerativeModel({ model: modelName });
        
        // Add timeout wrapper for Gemini API call (90 seconds)
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Gemini API request timeout after 90 seconds'));
          }, 90000); // 90 seconds timeout
        });
        
        const generatePromise = attemptModel.generateContent(prompt);
        
        // Race between timeout and actual API call
        const result = await Promise.race([generatePromise, timeoutPromise]) as Awaited<ReturnType<typeof attemptModel.generateContent>>;
        const response = result.response;
        
        if (!response) {
          throw new Error('Empty response from Gemini API');
        }
        
        const text = response.text();
        
        if (!text || text.trim().length === 0) {
          throw new Error('Empty text response from Gemini API');
        }
        
        console.log(`[FounderAI] ✅ Response received successfully from ${modelName}, length:`, text.length, "characters");
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

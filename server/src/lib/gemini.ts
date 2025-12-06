import { GoogleGenerativeAI } from "@google/generative-ai";

// Check if Gemini API key is available
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini client only if API key is available
let genAI: GoogleGenerativeAI | null = null;
let availableModels: string[] = [];
let modelsChecked = false;

if (GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log(`[FounderAI] ✅ Gemini client initialized`);
    
    // Check available models on startup (async, non-blocking)
    checkAvailableModels().catch(err => {
      console.warn("[FounderAI] Failed to check available models:", err);
    });
  } catch (error) {
    console.warn("[FounderAI] Failed to initialize Gemini client:", error);
  }
} else {
  console.warn("[FounderAI] GEMINI_API_KEY is not set. AI features will be disabled.");
}

/**
 * Check which Gemini models are actually available via ListModels API
 */
async function checkAvailableModels(): Promise<void> {
  if (!genAI || !GEMINI_API_KEY) return;
  
  try {
    console.log("[FounderAI] Checking available models...");
    
    // Use REST API directly to list models
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + GEMINI_API_KEY);
    
    if (!response.ok) {
      console.warn(`[FounderAI] Failed to list models: ${response.status} ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    const models = data.models || [];
    
    // Filter models that support generateContent
    availableModels = models
      .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m: any) => m.name.replace('models/', ''))
      .filter((name: string) => !name.includes('embedding') && !name.includes('vision'));
    
    modelsChecked = true;
    console.log(`[FounderAI] ✅ Found ${availableModels.length} available models:`, availableModels);
    
    if (availableModels.length === 0) {
      console.error("[FounderAI] ⚠️ WARNING: No available models found! Check API key permissions.");
    }
  } catch (error: any) {
    console.warn("[FounderAI] Failed to check available models:", error?.message);
    // Fallback to default models if check fails
    availableModels = ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"];
  }
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
  if (!genAI) {
    const error = new Error('Gemini client is not initialized. Check GEMINI_API_KEY configuration.');
    console.error("[FounderAI] Gemini client not initialized:", error);
    throw error;
  }

  try {
    // Wait for models check if not done yet (with timeout)
    if (!modelsChecked && availableModels.length === 0) {
      console.log("[FounderAI] Waiting for models check...");
      await Promise.race([
        checkAvailableModels(),
        new Promise(resolve => setTimeout(resolve, 2000)), // 2 second timeout
      ]);
    }
    
    // Use available models if checked, otherwise use default list
    const defaultModels = ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"];
    const modelNames = process.env.GEMINI_MODEL 
      ? [process.env.GEMINI_MODEL] 
      : (availableModels.length > 0 ? availableModels : defaultModels);
    
    console.log(`[FounderAI] Will try models in order:`, modelNames);
    
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
        // Log full error structure for debugging
        console.error(`[FounderAI] Error with model ${modelName}:`, {
          status: error?.status,
          statusCode: error?.statusCode,
          message: error?.message,
          originalError: error?.originalError ? {
            status: error.originalError.status,
            statusCode: error.originalError.statusCode,
            message: error.originalError.message,
          } : null,
        });
        
        // Check for 404 or "not found" errors (model not available)
        // Gemini API errors can be nested in originalError or have different structures
        const errorStatus = error?.status || 
                           error?.statusCode || 
                           error?.originalError?.status || 
                           error?.originalError?.statusCode ||
                           error?.response?.status ||
                           error?.response?.statusCode;
        const errorMessage = (error?.message || error?.originalError?.message || '').toLowerCase();
        
        const is404Error = errorStatus === 404 || 
                          errorMessage.includes('404') || 
                          errorMessage.includes('not found') ||
                          errorMessage.includes('is not found for api version') ||
                          (errorMessage.includes('models/') && errorMessage.includes('is not found'));
        
        if (is404Error) {
          console.warn(`[FounderAI] ⚠️ Model ${modelName} not available (404), trying next model...`);
          lastError = error;
          continue; // Try next model
        }
        // For other errors (timeout, auth, etc.), throw immediately
        console.error(`[FounderAI] ❌ Non-404 error with model ${modelName}:`, errorMessage);
        throw error;
      }
    }
    
    // If all models failed, throw the last error
    throw lastError || new Error('All Gemini models failed');
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

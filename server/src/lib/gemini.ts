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
    // Use setTimeout to ensure it runs after initialization
    setTimeout(() => {
      checkAvailableModels().catch(err => {
        console.warn("[FounderAI] Failed to check available models:", err?.message || err);
      });
    }, 100); // Small delay to ensure everything is ready
  } catch (error) {
    console.warn("[FounderAI] Failed to initialize Gemini client:", error);
  }
} else {
  console.warn("[FounderAI] GEMINI_API_KEY is not set. AI features will be disabled.");
}

/**
 * Check which Gemini models are actually available via ListModels API
 * Tries both v1 and v1beta endpoints
 */
async function checkAvailableModels(): Promise<void> {
  if (!genAI || !GEMINI_API_KEY) {
    console.warn("[FounderAI] Cannot check available models: genAI or API key missing");
    availableModels = ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"];
    modelsChecked = true;
    return;
  }
  
  try {
    console.log("[FounderAI] 🔍 Checking available models via ListModels API...");
    
    // Try v1 API first (more stable)
    let response: Response | null = null;
    let apiVersion = 'v1';
    
    try {
      const v1Url = `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`;
      console.log(`[FounderAI] Trying v1 API: ${v1Url.substring(0, 60)}...`);
      response = await fetch(v1Url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.log(`[FounderAI] v1 API returned ${response.status}, trying v1beta...`);
        apiVersion = 'v1beta';
        const v1betaUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
        response = await fetch(v1betaUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (fetchError: any) {
      console.error(`[FounderAI] ❌ Fetch error when checking models:`, fetchError?.message || fetchError);
      throw fetchError;
    }
    
    if (!response || !response.ok) {
      const status = response?.status || 'unknown';
      const statusText = response?.statusText || 'unknown';
      console.warn(`[FounderAI] ⚠️ Failed to list models (${apiVersion}): ${status} ${statusText}`);
      // Fallback to default models
      availableModels = ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"];
      modelsChecked = true;
      return;
    }
    
    const data = await response.json() as { models?: Array<{ name: string; supportedGenerationMethods?: string[] }> };
    const models = data.models || [];
    
    console.log(`[FounderAI] 📋 Received ${models.length} total models from ${apiVersion} API`);
    
    // Filter models that support generateContent
    availableModels = models
      .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m: any) => m.name.replace('models/', ''))
      .filter((name: string) => !name.includes('embedding') && !name.includes('vision'));
    
    modelsChecked = true;
    console.log(`[FounderAI] ✅ Found ${availableModels.length} available models for generateContent:`, availableModels);
    
    if (availableModels.length === 0) {
      console.error("[FounderAI] ⚠️ WARNING: No available models found! Check API key permissions.");
      // Fallback to default models
      availableModels = ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"];
      console.log(`[FounderAI] 🔄 Using fallback models:`, availableModels);
    }
  } catch (error: any) {
    console.error("[FounderAI] ❌ Failed to check available models:", {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      name: error?.name,
    });
    // Fallback to default models if check fails
    availableModels = ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"];
    modelsChecked = true;
    console.log(`[FounderAI] 🔄 Using fallback models due to error:`, availableModels);
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
        
        // Try REST API directly with v1 endpoint first (more reliable)
        let text: string | null = null;
        
        // First, try REST API v1 (bypass SDK which uses v1beta)
        try {
          const restResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{ text: prompt }]
                }]
              }),
            }
          );
          
          if (restResponse.ok) {
            const restData = await restResponse.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
            const restText = restData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (restText) {
              text = restText;
              console.log(`[FounderAI] ✅ Response received via REST API v1 from ${modelName}, length:`, text.length, "characters");
              return text.trim();
            }
          } else if (restResponse.status !== 404) {
            // If not 404, it's a different error (auth, quota, etc.) - throw it
            throw new Error(`REST API error: ${restResponse.status} ${restResponse.statusText}`);
          }
          // If 404, fall through to SDK attempt
        } catch (restError: any) {
          // If REST API fails with non-404, log and continue to SDK
          if (!restError.message?.includes('404')) {
            console.warn(`[FounderAI] REST API v1 failed for ${modelName}:`, restError.message);
          }
        }
        
        // Fallback: Try SDK (which uses v1beta)
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
        
        text = response.text();
        
        if (!text || text.trim().length === 0) {
          throw new Error('Empty text response from Gemini API');
        }
        
        console.log(`[FounderAI] ✅ Response received via SDK from ${modelName}, length:`, text.length, "characters");
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

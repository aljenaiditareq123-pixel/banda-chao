import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAssistantProfile, mapAssistantId } from '../lib/assistantProfiles';
import { aiRateLimit, founderAIRateLimit } from '../middleware/rateLimiter';
import { aiAssistantValidation } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { requireFounder } from '../middleware/requireFounder';
import { founderPandaService } from '../lib/founderPanda';

// Extend Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email?: string;
  };
}

const router = Router();

/**
 * GET /api/v1/ai/health
 * 
 * Health check endpoint for AI service
 */
router.get('/health', (req: Request, res: Response) => {
  const hasApiKey = !!process.env.GEMINI_API_KEY;
  const apiKeyLength = process.env.GEMINI_API_KEY?.length || 0;
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  
  res.json({
    status: hasApiKey ? 'ok' : 'error',
    service: 'AI Assistant',
    apiKeyConfigured: hasApiKey,
    apiKeyLength: hasApiKey ? apiKeyLength : 0, // Length for debugging, not the key itself
    model: modelName,
    message: hasApiKey 
      ? 'AI service is ready' 
      : 'GEMINI_API_KEY is not configured. Please set it in environment variables.',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

/**
 * POST /api/v1/ai/assistant
 * 
 * Send a message to an AI assistant and get a response
 * 
 * Request body:
 * {
 *   assistant: "founder" | "tech" | "guard" | "commerce" | "content" | "logistics" | "philosopher",
 *   message: string
 * }
 * 
 * Response:
 * {
 *   reply: string,
 *   assistant: string,
 *   timestamp: string
 * }
 */
router.post('/assistant', aiRateLimit, aiAssistantValidation, async (req: Request, res: Response) => {
  try {
    const { assistant: assistantId, message } = req.body;

    // Validate input
    if (!assistantId || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Both "assistant" and "message" are required',
      });
    }

    if (typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid message',
        message: 'Message must be a non-empty string',
      });
    }

    // Check for Gemini API key with clear error handling
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error('[AI] Missing GEMINI_API_KEY environment variable');
      // Development-only logging
      if (process.env.NODE_ENV === 'development') {
        console.error('[AI] GEMINI_API_KEY not found in environment variables');
        console.error('[AI] Available env vars:', Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('API')));
      }
      return res.status(500).json({
        error: 'AI service not configured',
        message: 'GEMINI_API_KEY environment variable is not set',
      });
    }

    // Development-only logging (never log the actual key)
    if (process.env.NODE_ENV === 'development') {
      console.log('[AI] GEMINI_API_KEY found:', geminiApiKey ? `${geminiApiKey.substring(0, 10)}...` : 'MISSING');
    }

    // Initialize Gemini AI client
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    
    // Map frontend assistant ID to backend profile ID
    const profileId = mapAssistantId(assistantId);
    
    // Get assistant profile (system prompt)
    const systemPrompt = getAssistantProfile(profileId);
    
    // Use configurable model name with fallback to gemini-1.5-flash
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    
    // Get Generative Model with system instruction
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      systemInstruction: systemPrompt,
    });

    // Generate response using correct API format
    const result = await model.generateContent({
      contents: [{ 
        role: 'user', 
        parts: [{ text: message.trim() }] 
      }]
    });
    
    const response = result.response;
    const reply = response.text();

    // Return reply
    return res.status(200).json({
      reply: reply,
      assistant: assistantId,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('[AI] Error generating response:', error);
    
    // Handle specific Gemini API errors
    // 401 Unauthorized typically means invalid API key
    if (error.status === 401 || error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      console.error('[AI] 401 Unauthorized - API key is invalid or expired');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'GEMINI_API_KEY is invalid or expired. Please check your API key.',
      });
    }

    if (error.message?.includes('API key') || error.message?.includes('authentication')) {
      return res.status(401).json({
        error: 'Invalid API key',
        message: 'GEMINI_API_KEY is invalid or expired',
      });
    }

    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
      });
    }

    // Generic error with development details
    const errorMessage = error.message || 'Unknown error';
    console.error('[AI] Full error:', {
      message: errorMessage,
      status: error.status,
      statusCode: error.statusCode,
      code: error.code,
    });

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate AI response. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

/**
 * POST /api/v1/ai/founder
 * 
 * Founder Panda - Super Intelligent Founder Assistant
 * EXCLUSIVE for Banda Chao founder only
 * 
 * Request body:
 * {
 *   message: string,
 *   context?: any
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     response: string,
 *     timestamp: Date,
 *     tokensUsed?: number
 *   }
 * }
 */
router.post('/founder', 
  founderAIRateLimit, // Dedicated founder rate limiter
  authenticateToken,
  requireFounder, // CRITICAL: Only founder can access
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { message, context, mode, slashCommand } = req.body;

      // Validate input
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({
          error: 'Invalid message',
          message: 'Message must be a non-empty string'
        });
      }

      if (message.length > 4000) {
        return res.status(400).json({
          error: 'Message too long',
          message: 'Message must be less than 4000 characters'
        });
      }

      // Validate context if provided
      if (context !== undefined) {
        if (typeof context !== 'object' || context === null) {
          return res.status(400).json({
            error: 'Invalid context',
            message: 'Context must be an object if provided'
          });
        }
        
        // Limit context size to prevent abuse
        const contextString = JSON.stringify(context);
        if (contextString.length > 2000) {
          return res.status(400).json({
            error: 'Context too large',
            message: 'Context must be less than 2000 characters when serialized'
          });
        }
      }

      const userId = req.user?.id;
      console.log(`[FounderAI] Request from founder ${userId}`);

      // Double-check founder status (extra security)
      if (req.user?.role !== 'FOUNDER') {
        console.warn(`[FounderAI] Unauthorized access attempt by user ${userId}`);
        return res.status(403).json({
          error: 'Access denied. Founder privileges required.'
        });
      }

      // Generate AI response using Founder Panda service
      const aiResponse = await founderPandaService.getFounderPandaResponse({
        message: message.trim(),
        context,
        mode,
        slashCommand
      });

      // Log successful interaction (without sensitive data)
      console.log(`[FounderAI] Response generated for founder. Tokens: ${aiResponse.tokensUsed || 0}`);

      // Return response
      res.json({
        success: true,
        data: {
          response: aiResponse.response,
          timestamp: aiResponse.timestamp,
          tokensUsed: aiResponse.tokensUsed,
          mode: aiResponse.mode,
          sessionSummary: aiResponse.sessionSummary
        }
      });

    } catch (error: any) {
      console.error('[FounderAI] Error processing request:', error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          return res.status(500).json({
            error: 'AI service configuration error'
          });
        }
        if (error.message.includes('quota')) {
          return res.status(429).json({
            error: 'AI service temporarily unavailable due to quota limits'
          });
        }
        if (error.message.includes('safety')) {
          return res.status(400).json({
            error: 'Content blocked by safety filters'
          });
        }
      }

      // Generic error response
      res.status(500).json({
        error: 'Failed to generate AI response'
      });
    }
  }
);

/**
 * GET /api/v1/ai/founder/health
 * Health check for founder AI service
 */
router.get('/founder/health',
  authenticateToken,
  requireFounder,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const isHealthy = await founderPandaService.healthCheck();
      
      res.json({
        success: true,
        data: {
          status: isHealthy ? 'healthy' : 'unhealthy',
          timestamp: new Date(),
          service: 'Founder Panda AI'
        }
      });
    } catch (error) {
      console.error('[FounderAI] Health check failed:', error);
      res.status(500).json({
        error: 'Health check failed'
      });
    }
  }
);

export default router;


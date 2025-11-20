import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAssistantProfile, mapAssistantId } from '../lib/assistantProfiles';

const router = Router();

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
 *   reply: string
 * }
 */
router.post('/assistant', async (req: Request, res: Response) => {
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

    // Check for Gemini API key
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error('[AI] Missing GEMINI_API_KEY environment variable');
      return res.status(500).json({
        error: 'AI service not configured',
        message: 'GEMINI_API_KEY environment variable is not set',
      });
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    
    // Map frontend assistant ID to backend profile ID
    const profileId = mapAssistantId(assistantId);
    
    // Get assistant profile (system prompt)
    const systemPrompt = getAssistantProfile(profileId);
    
    // Use Gemini 1.5 Flash model for faster responses
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    });

    // Generate response
    const result = await model.generateContent(message.trim());
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
    if (error.message?.includes('API key')) {
      return res.status(500).json({
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

    // Generic error
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate AI response. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;


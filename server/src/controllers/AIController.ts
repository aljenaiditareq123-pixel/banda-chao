import { Request, Response } from 'express';
import { VectorService } from '../services/VectorService';
import { generateFounderAIResponse } from '../lib/gemini';

export class AIController {
  // دالة المحادثة الرئيسية
  static async chat(req: Request, res: Response) {
    try {
      const { message, userId } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'الرسالة مطلوبة' });
      }

      console.log(`🤖 AI received message: ${message}`);

      // Step 1: Define System Prompt about Tariq (ALWAYS used, regardless of memories)
      const SYSTEM_PROMPT = `You are the AI assistant for Banda Chao. The developer and creative engineer is Tariq. You help answer questions about the platform, products, and services. Speak Arabic or English based on the user's language preference.`;

      // Step 2: Perform vector search (optional - results are only for context enhancement)
      let searchResults: any[] = [];
      let memoryContext = '';
      
      try {
        searchResults = await VectorService.searchMemories(message);
        console.log(`[AIController] Vector search completed. Found ${searchResults.length} memories.`);
        
        // Build context from memories if any found (but this is optional)
        if (searchResults.length > 0) {
          memoryContext = '\n**Context from memory:**\n';
          searchResults.forEach((memory, index) => {
            memoryContext += `${index + 1}. ${memory.content}\n`;
          });
        } else {
          console.log('[AIController] No memories found - proceeding to Gemini anyway');
        }
      } catch (vectorError: any) {
        // If vector search fails, log but continue - we ALWAYS call Gemini
        console.warn('[AIController] Vector search failed, but continuing to Gemini:', vectorError?.message);
        searchResults = [];
        memoryContext = '';
      }

      // Step 3: Construct prompt (System Prompt + Optional Context + User Question)
      // NOTE: We ALWAYS call Gemini even if memoryContext is empty
      const fullPrompt = `${SYSTEM_PROMPT}${memoryContext}

**User Question:**
${message}

**Instructions:**
Answer in Arabic or English based on the question language. Be helpful and polite.`;

      // Step 4: Log the prompt
      console.log('[AIController] ========================================');
      console.log('[AIController] Sending prompt to Gemini (ALWAYS, regardless of memory results):');
      console.log('[AIController] ========================================');
      console.log(fullPrompt);
      console.log('[AIController] ========================================');

      // Step 5: ALWAYS call Gemini - NO early returns, NO checks for empty memories
      // This is the critical path - we MUST call Gemini every time
      console.log('[AIController] Calling Gemini.generateContent NOW...');
      const aiReply = await generateFounderAIResponse(fullPrompt);
      console.log('[AIController] ✅ AI response generated successfully');
      console.log('[AIController] Response length:', aiReply.length, 'characters');
      console.log('[AIController] Response preview:', aiReply.substring(0, 200) + '...');
      
      // Step 6: Return Gemini response directly (never return fallback messages)
      return res.json({
        reply: aiReply,
        context: searchResults,
        original_message: message
      });

    } catch (error: any) {
      console.error('❌ AI Chat Error:', error);
      // Only return error if something catastrophic happens - Gemini should always be called
      return res.status(500).json({ 
        error: 'حدث خطأ في معالجة الطلب',
        details: error?.message 
      });
    }
  }

  // دالة لحفظ ذاكرة جديدة يدوياً (للتجربة)
  static async storeMemory(req: Request, res: Response) {
    try {
      const { content, metadata } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: 'المحتوى مطلوب' });
      }

      const memory = await VectorService.storeMemory(content, metadata || {});
      
      return res.json({ 
        success: true, 
        memoryId: memory.id,
        message: "تم حفظ الذاكرة بنجاح" 
      });

    } catch (error) {
      console.error('❌ Store Memory Error:', error);
      return res.status(500).json({ error: 'فشل حفظ الذاكرة' });
    }
  }
}


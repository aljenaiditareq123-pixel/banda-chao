/**
 * Knowledge Base Loader for AI Assistants
 * محمل قاعدة المعرفة لمساعدي الذكاء الاصطناعي
 */

import fs from 'fs';
import path from 'path';

// Get knowledge base directory (works in both dev and production)
const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), 'lib/ai/knowledge-base');

export interface AssistantKnowledge {
  vision: string;      // Founding Panda - كل المعلومات عن المشروع
  technical: string;   // Technical Panda - كل التقنيات والبلدان
  security: string;    // Security Panda - كلمات المرور والأسرار
  commerce: string;    // Commerce Panda - التجارة والتسويق
  content: string;     // Content Panda - المحتوى
  logistics: string;   // Logistics Panda - اللوجستيات
}

/**
 * Load knowledge base for a specific assistant
 */
export function loadKnowledgeBase(assistantKey: string): string {
  try {
    // Map assistant keys to file names
    const fileMap: Record<string, string> = {
      'vision': 'founding',
      'technical': 'technical',
      'security': 'security',
      'commerce': 'commerce',
      'content': 'content',
      'logistics': 'logistics',
    };
    
    const fileName = fileMap[assistantKey] || assistantKey;
    const filePath = path.join(KNOWLEDGE_BASE_DIR, `${fileName}-panda.md`);
    
    console.log(`[Knowledge Loader] Loading: ${assistantKey} -> ${fileName}-panda.md`);
    console.log(`[Knowledge Loader] Path: ${filePath}`);
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      console.log(`[Knowledge Loader] Loaded ${assistantKey}: ${content.length} characters`);
      return content;
    }
    
    console.warn(`[Knowledge Loader] File not found: ${filePath}`);
    // Fallback if file doesn't exist
    return `# ${assistantKey} Knowledge Base\n\nNo knowledge base file found at ${filePath}.`;
  } catch (error) {
    console.error(`[Knowledge Loader] Error loading ${assistantKey}:`, error);
    return '';
  }
}

/**
 * Get enhanced system prompt with knowledge base
 */
export function getEnhancedSystemPrompt(assistantKey: string, basePrompt: string): string {
  const knowledge = loadKnowledgeBase(assistantKey);
  
  if (!knowledge) {
    return basePrompt;
  }
  
  return `${basePrompt}

## Knowledge Base - قاعدة المعرفة:

${knowledge}

---

**Important:** Use the knowledge base above to provide accurate, context-aware responses. You have complete information about the project from day one until now.`;
}

/**
 * Load all knowledge bases (for reference)
 */
export function loadAllKnowledgeBases(): AssistantKnowledge {
  return {
    vision: loadKnowledgeBase('founding'),
    technical: loadKnowledgeBase('technical'),
    security: loadKnowledgeBase('security'),
    commerce: loadKnowledgeBase('commerce'),
    content: loadKnowledgeBase('content'),
    logistics: loadKnowledgeBase('logistics'),
  };
}


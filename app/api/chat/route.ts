import { NextResponse } from 'next/server';
import { getEnhancedSystemPrompt } from '@/lib/ai/knowledge-loader';

const SYSTEM_PROMPT =
  "You are Panda Chat, a friendly and knowledgeable assistant for the Panda Chao e-commerce platform. Panda Chao connects Chinese artisans with global customers through videos, livestreams, and product showcases. Answer questions clearly, help users discover products, and keep responses concise and helpful.";

async function callOpenAI(message: string, systemPrompt?: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const model = process.env.OPENAI_MODEL ?? 'gpt-3.5-turbo';
  const prompt = systemPrompt || SYSTEM_PROMPT;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${errorText}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error('OpenAI response did not contain a reply.');
  }

  return reply;
}

async function callGemini(message: string, systemPrompt?: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[Gemini] No API key found');
    return null;
  }

  // Log first few characters for debugging (never log full key)
  console.log('[Gemini] API Key starts with:', apiKey.substring(0, 10) + '...');
  console.log('[Gemini] API Key length:', apiKey.length);

  const prompt = systemPrompt || SYSTEM_PROMPT;
  const fullPrompt = `${prompt}\n\nUser: ${message}`;

  // Use gemini-2.5-flash-preview-05-20 (fast and available)
  const model = 'gemini-2.5-flash-preview-05-20';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  console.log('[Gemini] Calling API with model:', model);

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: fullPrompt }],
        },
      ],
    }),
  });

  console.log('[Gemini] Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Gemini] Error response:', errorText);
    throw new Error(`Gemini request failed: ${errorText}`);
  }

  const data = await response.json();
  console.log('[Gemini] Response received, candidates:', data.candidates?.length || 0);
  
  const reply =
    data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
    data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text).join('\n')?.trim();

  if (!reply) {
    console.error('[Gemini] No reply in response:', JSON.stringify(data, null, 2));
    throw new Error('Gemini response did not contain a reply.');
  }

  console.log('[Gemini] Reply received, length:', reply.length);
  return reply;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body?.message;
    const customSystemPrompt = body?.systemPrompt; // Optional custom system prompt

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    // Use custom system prompt if provided, otherwise use default
    let systemPrompt = customSystemPrompt || SYSTEM_PROMPT;
    
    // Enhance with knowledge base if assistant type is specified
    const assistantType = body?.assistantType; // e.g., 'vision', 'technical', 'security'
    if (assistantType && customSystemPrompt) {
      // The customSystemPrompt already contains the base prompt for the assistant
      // Now enhance it with knowledge base
      systemPrompt = getEnhancedSystemPrompt(assistantType, customSystemPrompt);
    }

    let reply: string | null = null;

    // Check which API key is available
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasGemini = !!process.env.GEMINI_API_KEY;

    console.log('[Chat API] Available providers:', { hasOpenAI, hasGemini });

    if (hasOpenAI) {
      console.log('[Chat API] Using OpenAI...');
      reply = await callOpenAI(message, systemPrompt);
    } else if (hasGemini) {
      console.log('[Chat API] Using Gemini...');
      reply = await callGemini(message, systemPrompt);
    } else {
      console.error('[Chat API] No API keys found');
      return NextResponse.json(
        { error: 'No AI provider is configured. Please set OPENAI_API_KEY or GEMINI_API_KEY.' },
        { status: 500 }
      );
    }

    if (!reply) {
      throw new Error('Failed to get reply from AI provider');
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('[Chat API] Error:', error);
    console.error('[Chat API] Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    const message =
      error?.message ??
      error?.toString() ??
      'Unexpected server error. Please try again later.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



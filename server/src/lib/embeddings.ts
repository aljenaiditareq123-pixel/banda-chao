/**
 * Embeddings Service - خدمة التضمين
 * Generates embeddings using Gemini Embeddings API
 * Used for semantic search and vector similarity
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Generate embedding for text using Gemini Embeddings API
 * @param text - The text to generate embedding for
 * @returns Embedding vector (array of numbers)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  try {
    // Use Gemini embedding-001 model (768 dimensions)
    // Note: ai_memories table uses 1536 dimensions, so we'll pad to 1536
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/embedding-001:embedContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'models/embedding-001',
          content: {
            parts: [{ text: text }]
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Embeddings] Gemini API error:', response.status, errorText);
      
      // Try alternative endpoint format
      const fallbackResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/embedding-001:embedContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'models/embedding-001',
            content: {
              parts: [{ text: text }]
            },
          }),
        }
      );

      if (!fallbackResponse.ok) {
        throw new Error(`Gemini Embeddings API failed: ${fallbackResponse.status}`);
      }

      const fallbackData = await fallbackResponse.json() as {
        embedding?: { values?: number[] };
      };

      const embedding = fallbackData.embedding?.values;
      if (!embedding || embedding.length === 0) {
        throw new Error('Empty embedding from Gemini API');
      }

      return embedding;
    }

    const data = await response.json() as {
      embedding?: { values?: number[] };
    };

    const embedding = data.embedding?.values;
    if (!embedding || embedding.length === 0) {
      throw new Error('Empty embedding from Gemini API');
    }

    // Pad embedding to 1536 dimensions to match ai_memories table
    // Gemini embedding-001 returns 768 dimensions, we need 1536
    if (embedding.length === 768) {
      return [...embedding, ...new Array(1536 - 768).fill(0)];
    }

    // If already 1536, return as is
    if (embedding.length === 1536) {
      return embedding;
    }

    // Otherwise pad or truncate to 1536
    const padded = embedding.length < 1536
      ? [...embedding, ...new Array(1536 - embedding.length).fill(0)]
      : embedding.slice(0, 1536);

    return padded;
  } catch (error: any) {
    console.error('[Embeddings] Error generating embedding:', error);
    throw error;
  }
}

/**
 * Generate embedding for product search
 * Combines name, description, and category for better search results
 * @param name - Product name
 * @param description - Product description
 * @param category - Product category (optional)
 * @returns Embedding vector
 */
export async function generateProductEmbedding(
  name: string,
  description: string,
  category?: string
): Promise<number[]> {
  // Combine all product text for embedding
  const combinedText = [
    name,
    description,
    category || '',
  ].filter(Boolean).join(' ');

  return generateEmbedding(combinedText);
}

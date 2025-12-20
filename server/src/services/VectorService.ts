/**
 * Vector Service - خدمة الذاكرة المتجهة
 * Core vector memory management for the AI Brain (Neuro-Genesis)
 * 
 * This service handles:
 * - Storing AI memories with embeddings
 * - Vector similarity search
 * - Memory retrieval for context building
 */

import { prisma } from '../utils/prisma';

export interface MemoryMetadata {
  userId?: string;
  sessionId?: string;
  eventType?: string;
  source?: string;
  tags?: string[];
  [key: string]: any;
}

export interface StoredMemory {
  id: string;
  content: string;
  embedding: number[];
  metadata: MemoryMetadata | null;
  created_at: Date;
}

/**
 * Store a memory with its text content
 * Note: This is a placeholder method - embedding generation will be added later
 * 
 * @param text - The text content to store as a memory
 * @param metadata - Optional metadata to attach to the memory
 * @returns The stored memory object
 */
export async function storeMemory(
  text: string,
  metadata?: MemoryMetadata
): Promise<StoredMemory> {
  // TODO: Generate embedding using OpenAI/embedding service
  // For now, create a placeholder embedding (1536 dimensions for OpenAI ada-002)
  const placeholderEmbedding = new Array(1536).fill(0);

  // Convert embedding array to PostgreSQL vector format string
  const embeddingString = `[${placeholderEmbedding.join(',')}]`;

  // Generate UUID for the memory
  const memoryId = crypto.randomUUID();
  const metadataJson = metadata ? JSON.stringify(metadata) : null;

  // Escape SQL strings to prevent injection (basic escaping for text content and metadata)
  const escapedText = text.replace(/'/g, "''");
  const escapedMetadata = metadataJson ? metadataJson.replace(/'/g, "''") : null;

  // Use raw SQL to insert the memory with vector embedding
  // Note: Using $queryRawUnsafe because Prisma doesn't natively support vector type
  // TODO: Consider using pg library directly for better parameterized query support
  const sql = `
    INSERT INTO ai_memories (id, content, embedding, metadata, created_at)
    VALUES (
      '${memoryId}',
      '${escapedText}',
      '${embeddingString}'::vector,
      ${escapedMetadata ? `'${escapedMetadata}'::jsonb` : 'NULL'},
      NOW()
    )
    RETURNING id, content, metadata, created_at
  `;
  
  const result = await prisma.$queryRawUnsafe<Array<{
    id: string;
    content: string;
    metadata: any;
    created_at: Date;
  }>>(sql);

  if (!result || result.length === 0) {
    throw new Error('Failed to store memory');
  }

  const memory = result[0];

  return {
    id: memory.id,
    content: memory.content,
    embedding: placeholderEmbedding, // Return the embedding array
    metadata: memory.metadata as MemoryMetadata | null,
    created_at: memory.created_at,
  };
}

/**
 * Search for similar memories using vector similarity
 * Note: Currently uses placeholder embedding (zeros) for search query
 * TODO: Generate real embedding for the search query
 * 
 * @param query - The search query text
 * @param limit - Maximum number of results to return (default: 5)
 * @returns Array of similar memories with similarity scores
 */
export interface SearchResult extends StoredMemory {
  similarity: number;
}

export async function searchMemories(
  query: string,
  limit: number = 5,
  minSimilarity: number = 0.4
): Promise<SearchResult[]> {
  // TODO: Generate embedding for the query using OpenAI/embedding service
  // For now, use placeholder embedding (zeros) - this will return random/oldest memories
  const queryEmbedding = new Array(1536).fill(0);
  const embeddingString = `[${queryEmbedding.join(',')}]`;

  // Use cosine similarity to find closest memories
  // pgvector uses the <=> operator for cosine distance (lower = more similar)
  // similarity = 1 - distance (where distance is 0-2, similarity is -1 to 1)
  // We filter results with similarity >= minSimilarity
  const sql = `
    SELECT 
      id,
      content,
      metadata,
      created_at,
      1 - (embedding <=> ${embeddingString}::vector) as similarity
    FROM ai_memories
    WHERE embedding IS NOT NULL
      AND (1 - (embedding <=> ${embeddingString}::vector)) >= ${minSimilarity}
    ORDER BY embedding <=> ${embeddingString}::vector
    LIMIT ${limit}
  `;

  try {
    const results = await prisma.$queryRawUnsafe<Array<{
      id: string;
      content: string;
      metadata: any;
      created_at: Date;
      similarity: number;
    }>>(sql);

    const mappedResults = results.map(result => ({
      id: result.id,
      content: result.content,
      embedding: queryEmbedding, // Placeholder
      metadata: result.metadata as MemoryMetadata | null,
      created_at: result.created_at,
      similarity: result.similarity || 0,
    }));

    // Log the top match similarity score for debugging
    if (mappedResults.length > 0) {
      const topMatch = mappedResults[0];
      console.log(`[VectorService] Search query: "${query}"`);
      console.log(`[VectorService] Top match similarity score: ${topMatch.similarity.toFixed(4)}`);
      console.log(`[VectorService] Top match content: "${topMatch.content.substring(0, 100)}..."`);
      console.log(`[VectorService] Total matches found: ${mappedResults.length} (minSimilarity: ${minSimilarity})`);
    } else {
      console.log(`[VectorService] No matches found for query: "${query}" (minSimilarity: ${minSimilarity})`);
    }

    return mappedResults;
  } catch (error: any) {
    console.error('[VectorService] Search failed:', error);
    // Return empty array if search fails (e.g., table doesn't exist yet)
    return [];
  }
}

/**
 * Test the connection to the vector database
 * @returns True if connection is successful
 */
export async function testConnection(): Promise<boolean> {
  try {
    // Try to query the ai_memories table to verify it exists and is accessible
    await prisma.$queryRaw`SELECT 1 FROM ai_memories LIMIT 1`;
    return true;
  } catch (error) {
    console.error('[VectorService] Connection test failed:', error);
    return false;
  }
}

// Export a default object for convenience (allows both named exports and default import)
export const VectorService = {
  storeMemory,
  searchMemories,
  testConnection,
};


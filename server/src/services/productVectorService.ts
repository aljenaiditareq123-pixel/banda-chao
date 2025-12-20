/**
 * Product Vector Service - خدمة البحث الدلالي للمنتجات
 * Handles vector embeddings for products and semantic search
 */

import { prisma } from '../utils/prisma';
import { generateProductEmbedding, generateEmbedding } from '../lib/embeddings';

/**
 * Store product embedding in the database
 * Uses ai_memories table with metadata to identify products
 */
export async function storeProductEmbedding(
  productId: string,
  name: string,
  description: string,
  category?: string
): Promise<void> {
  try {
    // Generate embedding for the product
    const embedding = await generateProductEmbedding(name, description, category);

    // Check if embedding already exists
    const existing = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT id FROM ai_memories WHERE metadata->>'productId' = $1 LIMIT 1`,
      productId
    );

    const embeddingString = `[${embedding.join(',')}]`;
    const metadata = JSON.stringify({
      productId,
      type: 'product',
      name,
      category: category || null,
    });

    if (existing.length > 0) {
      // Update existing embedding
      await prisma.$queryRawUnsafe(
        `UPDATE ai_memories 
         SET content = $1, embedding = $2::vector, metadata = $3::jsonb, created_at = NOW()
         WHERE metadata->>'productId' = $4`,
        `${name} ${description}`,
        embeddingString,
        metadata,
        productId
      );
    } else {
      // Insert new embedding
      const memoryId = crypto.randomUUID();
      await prisma.$queryRawUnsafe(
        `INSERT INTO ai_memories (id, content, embedding, metadata, created_at)
         VALUES ($1, $2, $3::vector, $4::jsonb, NOW())`,
        memoryId,
        `${name} ${description}`,
        embeddingString,
        metadata
      );
    }

    console.log(`[ProductVectorService] ✅ Stored embedding for product: ${productId}`);
  } catch (error: any) {
    console.error(`[ProductVectorService] ❌ Failed to store embedding for product ${productId}:`, error);
    // Don't throw - embedding generation is optional for product creation
  }
}

/**
 * Search products using semantic similarity
 * @param query - Search query text
 * @param limit - Maximum number of results
 * @param minSimilarity - Minimum similarity score (0-1)
 * @returns Array of product IDs with similarity scores
 */
export interface ProductSearchResult {
  productId: string;
  similarity: number;
  name?: string;
  category?: string;
}

export async function searchProductsBySimilarity(
  query: string,
  limit: number = 20,
  minSimilarity: number = 0.3
): Promise<ProductSearchResult[]> {
  try {
    // Generate embedding for the search query (already padded to 1536 in embeddings.ts)
    const queryEmbedding = await generateEmbedding(query);
    const embeddingString = `[${queryEmbedding.join(',')}]`;

    const results = await prisma.$queryRawUnsafe<Array<{
      id: string;
      metadata: any;
      similarity: number;
    }>>(
      `SELECT 
        id,
        metadata,
        1 - (embedding <=> $1::vector) as similarity
      FROM ai_memories
      WHERE metadata->>'type' = 'product'
        AND embedding IS NOT NULL
        AND (1 - (embedding <=> $1::vector)) >= $2
      ORDER BY embedding <=> $1::vector
      LIMIT $3`,
      embeddingString,
      minSimilarity,
      limit
    );

    return results.map(result => ({
      productId: result.metadata?.productId || '',
      similarity: result.similarity || 0,
      name: result.metadata?.name,
      category: result.metadata?.category,
    }));
  } catch (error: any) {
    console.error('[ProductVectorService] Search failed:', error);
    return [];
  }
}

/**
 * Get related products using vector similarity (Nearest Neighbors)
 * Finds products similar to the given product based on their embeddings
 * @param productId - ID of the product to find similar products for
 * @param limit - Maximum number of recommendations (default: 4)
 * @param minSimilarity - Minimum similarity score (0-1, default: 0.5)
 * @returns Array of product IDs with similarity scores
 */
export async function getRelatedProducts(
  productId: string,
  limit: number = 4,
  minSimilarity: number = 0.5
): Promise<ProductSearchResult[]> {
  try {
    // Get the embedding for the current product
    const productEmbedding = await prisma.$queryRawUnsafe<Array<{
      embedding: string;
      metadata: any;
    }>>(
      `SELECT embedding, metadata
       FROM ai_memories
       WHERE metadata->>'productId' = $1
         AND metadata->>'type' = 'product'
         AND embedding IS NOT NULL
       LIMIT 1`,
      productId
    );

    if (productEmbedding.length === 0 || !productEmbedding[0].embedding) {
      console.log(`[ProductVectorService] No embedding found for product: ${productId}`);
      return [];
    }

    const embeddingString = productEmbedding[0].embedding;
    
    // Find nearest neighbors (similar products) excluding the current product
    const results = await prisma.$queryRawUnsafe<Array<{
      id: string;
      metadata: any;
      similarity: number;
    }>>(
      `SELECT 
        id,
        metadata,
        1 - (embedding <=> $1::vector) as similarity
      FROM ai_memories
      WHERE metadata->>'type' = 'product'
        AND metadata->>'productId' != $2
        AND embedding IS NOT NULL
        AND (1 - (embedding <=> $1::vector)) >= $3
      ORDER BY embedding <=> $1::vector
      LIMIT $4`,
      embeddingString,
      productId,
      minSimilarity,
      limit
    );

    return results.map(result => ({
      productId: result.metadata?.productId || '',
      similarity: result.similarity || 0,
      name: result.metadata?.name,
      category: result.metadata?.category,
    }));
  } catch (error: any) {
    console.error(`[ProductVectorService] Failed to get related products for ${productId}:`, error);
    return [];
  }
}

/**
 * Delete product embedding
 */
export async function deleteProductEmbedding(productId: string): Promise<void> {
  try {
    await prisma.$queryRawUnsafe(
      `DELETE FROM ai_memories WHERE metadata->>'productId' = $1`,
      productId
    );
    console.log(`[ProductVectorService] ✅ Deleted embedding for product: ${productId}`);
  } catch (error: any) {
    console.error(`[ProductVectorService] ❌ Failed to delete embedding for product ${productId}:`, error);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get related products using vector similarity (Nearest Neighbors)
 * Finds products similar to the given product based on their embeddings
 */
async function getRelatedProducts(
  productId: string,
  limit: number = 4,
  minSimilarity: number = 0.5
): Promise<Array<{ productId: string; similarity: number }>> {
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
      console.log(`[Recommendations] No embedding found for product: ${productId}`);
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
    }));
  } catch (error: any) {
    console.error(`[Recommendations] Failed to get related products for ${productId}:`, error);
    return [];
  }
}

/**
 * GET /api/products/[id]/recommendations
 * Get AI-powered product recommendations based on vector similarity
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get related product IDs using vector similarity
    const relatedProducts = await getRelatedProducts(productId, 4, 0.5);

    if (relatedProducts.length === 0) {
      return NextResponse.json({
        products: [],
        total: 0,
      });
    }

    // Fetch full product details for recommended products
    const productIds = relatedProducts.map(p => p.productId);
    
    if (productIds.length === 0) {
      return NextResponse.json({
        products: [],
        total: 0,
      });
    }

    // Build SQL query with proper array syntax
    const products = await prisma.$queryRawUnsafe<Array<any>>(`
      SELECT 
        p.id,
        p.name,
        NULL as name_ar,
        NULL as name_zh,
        p.description,
        NULL as description_ar,
        NULL as description_zh,
        p.price,
        p.category,
        p.image_url as "imageUrl",
        p.external_link as "externalLink",
        p.created_at as "createdAt",
        p.updated_at as "updatedAt",
        p.stock,
        p.currency,
        u.id as "userId",
        u.name as "userName",
        u.profile_picture as "userProfilePicture"
      FROM products p
      LEFT JOIN users u ON p."user_id" = u.id
      WHERE p.id = ANY(ARRAY[${productIds.map((_, idx) => `$${idx + 1}::text`).join(',')}])
      ORDER BY array_position(ARRAY[${productIds.map((_, idx) => `$${idx + 1}::text`).join(',')}], p.id)
    `, ...productIds);

    // Map products with similarity scores
    const productsWithSimilarity = products.map((product: any) => {
      const related = relatedProducts.find(r => r.productId === product.id);
      return {
        ...product,
        similarity: related?.similarity || 0,
        displayName: product.name,
        displayDescription: product.description,
      };
    });

    return NextResponse.json({
      products: productsWithSimilarity,
      total: productsWithSimilarity.length,
    });
  } catch (error: any) {
    console.error('[Recommendations] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get recommendations',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

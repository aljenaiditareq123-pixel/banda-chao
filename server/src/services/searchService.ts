import { prisma } from '../utils/prisma';
import { searchProductsBySimilarity } from './productVectorService';

/**
 * Semantic Search Service
 * Uses Vector Embeddings for semantic search + keyword-based search as fallback
 */

interface SearchResult {
  products: any[];
  total: number;
  keywords: string[];
  suggestions: string[];
}

/**
 * Extract keywords from natural language query
 * Example: "شيء سريع للكتابة" -> ["keyboard", "laptop", "pen", "writing"]
 */
function extractKeywords(query: string, locale: string = 'en'): string[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Remove common stop words (multi-language)
  const stopWords: Record<string, string[]> = {
    en: ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'for', 'to', 'of', 'in', 'on', 'at', 'by', 'with', 'from', 'as', 'about', 'into', 'through', 'during', 'including', 'against', 'among', 'throughout', 'despite', 'towards', 'upon', 'concerning', 'to', 'of', 'in', 'for', 'on', 'with', 'as', 'by', 'from', 'about', 'into', 'through', 'during', 'including', 'against', 'among', 'throughout', 'despite', 'towards', 'upon', 'concerning'],
    ar: ['ال', 'في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك', 'كان', 'كانت', 'يكون', 'يكون', 'كانوا', 'كانت', 'هو', 'هي', 'هم', 'هن', 'أن', 'إن', 'أنه', 'إنه', 'لكن', 'لكي', 'لأن', 'لأنه', 'إذا', 'إذ', 'حيث', 'حين', 'حينما', 'بينما', 'بين', 'بينهما', 'بينهم', 'بينهن', 'بيننا', 'بينكم', 'بينكن', 'بينه', 'بينها', 'بينهما', 'بينهم', 'بينهن', 'بيننا', 'بينكم', 'بينكن'],
    zh: ['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'],
  };

  const words = normalizedQuery.split(/\s+/).filter(word => {
    const stopWordsList = stopWords[locale] || stopWords.en;
    return word.length > 2 && !stopWordsList.includes(word);
  });

  // Semantic keyword mapping (intent-based)
  const semanticMap: Record<string, string[]> = {
    // Writing/typing related
    'writing': ['keyboard', 'pen', 'laptop', 'tablet', 'notebook', 'paper'],
    'كتابة': ['keyboard', 'pen', 'laptop', 'tablet', 'notebook', 'paper', 'لوحة مفاتيح', 'قلم', 'كمبيوتر محمول'],
    '打字': ['keyboard', 'laptop', 'tablet', '键盘', '笔记本电脑'],
    
    // Fast/quick related
    'fast': ['laptop', 'phone', 'tablet', 'computer', 'device'],
    'سريع': ['laptop', 'phone', 'tablet', 'computer', 'device', 'كمبيوتر', 'هاتف'],
    '快速': ['laptop', 'phone', 'tablet', 'computer', 'device', '笔记本电脑', '手机'],
    
    // Fashion/clothing
    'clothing': ['shirt', 'dress', 'jacket', 'pants', 'shoes'],
    'ملابس': ['shirt', 'dress', 'jacket', 'pants', 'shoes', 'قميص', 'فستان', 'جاكيت'],
    '服装': ['shirt', 'dress', 'jacket', 'pants', 'shoes', '衬衫', '连衣裙', '夹克'],
    
    // Electronics
    'electronic': ['phone', 'laptop', 'tablet', 'headphone', 'speaker'],
    'إلكتروني': ['phone', 'laptop', 'tablet', 'headphone', 'speaker', 'هاتف', 'كمبيوتر'],
    '电子': ['phone', 'laptop', 'tablet', 'headphone', 'speaker', '手机', '笔记本电脑'],
    
    // Beauty/cosmetics
    'beauty': ['makeup', 'lipstick', 'perfume', 'skincare', 'cosmetic'],
    'جمال': ['makeup', 'lipstick', 'perfume', 'skincare', 'cosmetic', 'مكياج', 'عطر'],
    '美容': ['makeup', 'lipstick', 'perfume', 'skincare', 'cosmetic', '化妆品', '口红'],
  };

  // Extract semantic keywords
  const semanticKeywords: string[] = [];
  for (const [key, values] of Object.entries(semanticMap)) {
    if (normalizedQuery.includes(key)) {
      semanticKeywords.push(...values);
    }
  }

  // Combine direct words with semantic keywords
  return [...new Set([...words, ...semanticKeywords])];
}

/**
 * Search products using semantic understanding
 */
export async function searchProducts(
  query: string,
  options: {
    locale?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    onlyVerified?: boolean;
    sortBy?: 'newest' | 'price_asc' | 'price_desc';
    limit?: number;
    offset?: number;
  } = {}
): Promise<SearchResult> {
  const {
    locale = 'en',
    category,
    minPrice,
    maxPrice,
    onlyVerified,
    sortBy,
    limit = 20,
    offset = 0,
  } = options;

  // Try semantic search first (vector-based)
  try {
    const semanticResults = await searchProductsBySimilarity(query, limit * 2, 0.3);
    
    if (semanticResults.length > 0) {
      // Get product IDs from semantic search
      const productIds = semanticResults.map(r => r.productId);
      
      // Build WHERE clause with product IDs
      const conditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      // Filter by product IDs from semantic search
      if (productIds.length > 0) {
        // Use parameterized query for safety
        const placeholders = productIds.map((_, idx) => `$${paramIndex + idx}`).join(',');
        conditions.push(`p.id IN (${placeholders})`);
        params.push(...productIds);
        paramIndex += productIds.length;
      }

      // Category filter
      if (category) {
        conditions.push(`p.category = $${paramIndex}`);
        params.push(category);
        paramIndex++;
      }

      // Price filters
      if (minPrice !== undefined) {
        conditions.push(`p.price >= $${paramIndex}`);
        params.push(minPrice);
        paramIndex++;
      }

      if (maxPrice !== undefined) {
        conditions.push(`p.price <= $${paramIndex}`);
        params.push(maxPrice);
        paramIndex++;
      }

      // Filter by verified sellers only
      if (onlyVerified) {
        conditions.push(`u."isVerified" = $${paramIndex}`);
        params.push(true);
        paramIndex++;
      }

      // Build ORDER BY clause based on sortBy
      let orderByClause = `array_position(ARRAY[${productIds.map((_, idx) => `$${paramIndex + idx}::text`).join(',')}], p.id)`;
      if (sortBy === 'price_asc') {
        orderByClause = 'p.price ASC';
      } else if (sortBy === 'price_desc') {
        orderByClause = 'p.price DESC';
      } else if (sortBy === 'newest') {
        orderByClause = 'p.created_at DESC';
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Execute search with semantic ordering
      // Note: Using NULL for columns that may not exist in actual DB schema
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
          u.id as "userId",
          u.name as "userName",
          u.profile_picture as "userProfilePicture"
        FROM products p
        LEFT JOIN users u ON p."user_id" = u.id
        ${whereClause}
        ORDER BY ${orderByClause}
        LIMIT $${paramIndex + productIds.length} OFFSET $${paramIndex + productIds.length + 1}
      `, ...params, ...productIds, limit, offset);

      // Get total count (include JOIN for onlyVerified filter)
      const countResult = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(`
        SELECT COUNT(*) as count
        FROM products p
        LEFT JOIN users u ON p."user_id" = u.id
        ${whereClause}
      `, ...params);

      const total = Number(countResult[0]?.count || 0);

      // Generate suggestions
      const suggestions = generateSuggestions(query, locale);

      return {
        products: products.map((p: any) => ({
          ...p,
          displayName: locale === 'ar' ? (p.name_ar || p.name) : 
                       locale === 'zh' ? (p.name_zh || p.name) : p.name,
          displayDescription: locale === 'ar' ? (p.description_ar || p.description) :
                              locale === 'zh' ? (p.description_zh || p.description) : p.description,
        })),
        total,
        keywords: extractKeywords(query, locale),
        suggestions,
      };
    }
  } catch (error: any) {
    console.error('[SearchService] Semantic search failed, falling back to keyword search:', error);
    // Fall through to keyword search
  }

  // Fallback to keyword-based search
  const keywords = extractKeywords(query, locale);
  
  if (keywords.length === 0) {
    // Final fallback to simple LIKE search
    return await simpleSearch(query, { category, minPrice, maxPrice, onlyVerified, sortBy, limit, offset });
  }

  // Build search conditions
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  // Search in name, description, and category using keywords
  const keywordConditions: string[] = [];
  keywords.forEach((keyword) => {
    keywordConditions.push(
      `(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR p.category ILIKE $${paramIndex})`
    );
    params.push(`%${keyword}%`);
    paramIndex++;
  });

  if (keywordConditions.length > 0) {
    conditions.push(`(${keywordConditions.join(' OR ')})`);
  }

  // Category filter
  if (category) {
    conditions.push(`p.category = $${paramIndex}`);
    params.push(category);
    paramIndex++;
  }

  // Price filters
  if (minPrice !== undefined) {
    conditions.push(`p.price >= $${paramIndex}`);
    params.push(minPrice);
    paramIndex++;
  }

  if (maxPrice !== undefined) {
    conditions.push(`p.price <= $${paramIndex}`);
    params.push(maxPrice);
    paramIndex++;
  }

  // Filter by verified sellers only
  if (onlyVerified) {
    conditions.push(`u."isVerified" = $${paramIndex}`);
    params.push(true);
    paramIndex++;
  }

  // Build ORDER BY clause based on sortBy
  let orderByClause = `CASE 
        WHEN p.name ILIKE $${paramIndex} THEN 1
        WHEN p.description ILIKE $${paramIndex} THEN 2
        ELSE 3
      END,
      p.created_at DESC`;
  if (sortBy === 'price_asc') {
    orderByClause = 'p.price ASC';
  } else if (sortBy === 'price_desc') {
    orderByClause = 'p.price DESC';
  } else if (sortBy === 'newest') {
    orderByClause = 'p.created_at DESC';
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Execute search
  // Note: Using NULL for columns that may not exist in actual DB schema
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
      u.id as "userId",
      u.name as "userName",
      u.profile_picture as "userProfilePicture"
    FROM products p
    LEFT JOIN users u ON p."user_id" = u.id
    ${whereClause}
    ORDER BY ${orderByClause}
    LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}
  `, ...params, `%${query}%`, limit, offset);

  // Get total count (include JOIN for onlyVerified filter)
  const countResult = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(`
    SELECT COUNT(*) as count
    FROM products p
    LEFT JOIN users u ON p."user_id" = u.id
    ${whereClause}
  `, ...params);

  const total = Number(countResult[0]?.count || 0);

  // Generate suggestions based on query
  const suggestions = generateSuggestions(query, locale);

  return {
    products: products.map((p: any) => ({
      ...p,
      // Select localized name/description
      displayName: locale === 'ar' ? (p.name_ar || p.name) : 
                   locale === 'zh' ? (p.name_zh || p.name) : p.name,
      displayDescription: locale === 'ar' ? (p.description_ar || p.description) :
                          locale === 'zh' ? (p.description_zh || p.description) : p.description,
    })),
    total,
    keywords,
    suggestions,
  };
}

/**
 * Simple LIKE search (fallback)
 */
async function simpleSearch(
  query: string,
  options: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    onlyVerified?: boolean;
    sortBy?: 'newest' | 'price_asc' | 'price_desc';
    limit?: number;
    offset?: number;
  } = {}
): Promise<SearchResult> {
  const { category, minPrice, maxPrice, onlyVerified, sortBy, limit = 20, offset = 0 } = options;

  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (query) {
    conditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
    params.push(`%${query}%`);
    paramIndex++;
  }

  if (category) {
    conditions.push(`p.category = $${paramIndex}`);
    params.push(category);
    paramIndex++;
  }

  if (minPrice !== undefined) {
    conditions.push(`p.price >= $${paramIndex}`);
    params.push(minPrice);
    paramIndex++;
  }

  if (maxPrice !== undefined) {
    conditions.push(`p.price <= $${paramIndex}`);
    params.push(maxPrice);
    paramIndex++;
  }

  // Filter by verified sellers only
  if (onlyVerified) {
    conditions.push(`u."isVerified" = $${paramIndex}`);
    params.push(true);
    paramIndex++;
  }

  // Build ORDER BY clause based on sortBy
  let orderByClause = 'p.created_at DESC';
  if (sortBy === 'price_asc') {
    orderByClause = 'p.price ASC';
  } else if (sortBy === 'price_desc') {
    orderByClause = 'p.price DESC';
  } else if (sortBy === 'newest') {
    orderByClause = 'p.created_at DESC';
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Note: Using NULL for columns that may not exist in actual DB schema
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
      u.id as "userId",
      u.name as "userName",
      u.profile_picture as "userProfilePicture"
    FROM products p
    LEFT JOIN users u ON p."user_id" = u.id
    ${whereClause}
    ORDER BY ${orderByClause}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `, ...params, limit, offset);

  const countResult = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(`
    SELECT COUNT(*) as count
    FROM products p
    LEFT JOIN users u ON p."user_id" = u.id
    ${whereClause}
  `, ...params);

  return {
    products: products.map((p: any) => ({
      ...p,
      displayName: p.name,
      displayDescription: p.description,
    })),
    total: Number(countResult[0]?.count || 0),
    keywords: [query],
    suggestions: [],
  };
}

/**
 * Generate search suggestions
 */
function generateSuggestions(query: string, locale: string): string[] {
  const normalizedQuery = query.toLowerCase();
  
  const suggestionMap: Record<string, string[]> = {
    en: [
      'laptop',
      'smartphone',
      'fashion',
      'electronics',
      'beauty',
      'home decor',
      'accessories',
    ],
    ar: [
      'كمبيوتر محمول',
      'هاتف ذكي',
      'أزياء',
      'إلكترونيات',
      'جمال',
      'ديكور منزلي',
      'إكسسوارات',
    ],
    zh: [
      '笔记本电脑',
      '智能手机',
      '时尚',
      '电子产品',
      '美容',
      '家居装饰',
      '配饰',
    ],
  };

  const suggestions = suggestionMap[locale] || suggestionMap.en;
  
  // Filter suggestions that match query
  return suggestions
    .filter(s => s.toLowerCase().includes(normalizedQuery) || normalizedQuery.includes(s.toLowerCase()))
    .slice(0, 5);
}

/**
 * Get popular search terms
 */
export async function getPopularSearches(limit: number = 10): Promise<string[]> {
  // TODO: Implement search history tracking
  // For now, return common searches
  return [
    'laptop',
    'smartphone',
    'fashion',
    'electronics',
    'beauty',
    'home decor',
    'accessories',
    'gifts',
    'sale',
    'new arrivals',
  ];
}

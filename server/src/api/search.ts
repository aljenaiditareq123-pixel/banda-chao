import { Router, Request, Response } from 'express';
import { searchProducts, getPopularSearches } from '../services/searchService';

const router = Router();

/**
 * POST /api/v1/search
 * Semantic search endpoint
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      query,
      locale = 'en',
      category,
      minPrice,
      maxPrice,
      limit = 20,
      offset = 0,
    } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Query is required',
      });
    }

    const result = await searchProducts(query.trim(), {
      locale,
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0,
    });

    return res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/search/suggestions
 * Get search suggestions based on query
 */
router.get('/suggestions', async (req: Request, res: Response) => {
  try {
    const { q, locale = 'en' } = req.query;

    if (!q || typeof q !== 'string') {
      return res.json({
        success: true,
        suggestions: [],
      });
    }

    // Get products matching query for suggestions
    const result = await searchProducts(q as string, {
      locale: locale as string,
      limit: 5,
    });

    // Extract product names as suggestions
    const suggestions = result.products
      .map((p: any) => p.displayName || p.name)
      .filter(Boolean)
      .slice(0, 5);

    // Add semantic suggestions
    suggestions.push(...result.suggestions);

    return res.json({
      success: true,
      suggestions: [...new Set(suggestions)].slice(0, 10),
    });
  } catch (error: any) {
    console.error('Suggestions error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get suggestions',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/search/popular
 * Get popular search terms
 */
router.get('/popular', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const searches = await getPopularSearches(limit);

    return res.json({
      success: true,
      searches,
    });
  } catch (error: any) {
    console.error('Popular searches error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get popular searches',
      message: error.message,
    });
  }
});

export default router;

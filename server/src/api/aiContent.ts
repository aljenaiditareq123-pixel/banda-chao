import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { analyzeProductImage } from '../services/aiContentService';

const router = Router();

/**
 * POST /api/v1/ai-content/analyze-product
 * Analyze product image and generate content (names, descriptions, category, price)
 */
router.post('/analyze-product', authenticateToken, async (req: any, res: Response) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required',
      });
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Invalid image URL format',
      });
    }

    // Analyze image (mock AI for now)
    const analysis = await analyzeProductImage(imageUrl);

    res.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Error analyzing product image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze product image',
      error: error.message,
    });
  }
});

export default router;

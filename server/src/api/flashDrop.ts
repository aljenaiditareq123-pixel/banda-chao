import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient() as any;

// Price update interval (10 seconds)
const PRICE_UPDATE_INTERVAL = 10 * 1000; // 10 seconds in milliseconds
const PRICE_DECREMENT = 1.0; // $1 per interval

/**
 * Calculate current price based on time elapsed
 */
function calculateCurrentPrice(flashDrop: any): number {
  if (flashDrop.status !== 'ACTIVE') {
    return flashDrop.current_price;
  }

  const now = new Date();
  const lastUpdate = new Date(flashDrop.last_price_update);
  const elapsedSeconds = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
  const intervalsElapsed = Math.floor(elapsedSeconds / flashDrop.interval_seconds);
  
  if (intervalsElapsed <= 0) {
    return flashDrop.current_price;
  }

  const newPrice = flashDrop.current_price - (intervalsElapsed * flashDrop.price_decrement);
  const minPrice = flashDrop.min_price || 0;
  
  return Math.max(minPrice, newPrice);
}

/**
 * GET /api/v1/flash-drop/active
 * Get active flash drop
 */
router.get('/active', async (req: Request, res: Response) => {
  try {
    const flashDrop = await prisma.flash_drops.findFirst({
      where: {
        status: 'ACTIVE',
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            name_ar: true,
            name_zh: true,
            description: true,
            description_ar: true,
            description_zh: true,
            image_url: true,
            currency: true,
          },
        },
      },
    });

    if (!flashDrop) {
      return res.json({
        success: true,
        flashDrop: null,
        message: 'No active flash drop',
      });
    }

    // Calculate current price
    const currentPrice = calculateCurrentPrice(flashDrop);
    
    // Update price in database if it changed
    if (currentPrice !== flashDrop.current_price) {
      await prisma.flash_drops.update({
        where: { id: flashDrop.id },
        data: {
          current_price: currentPrice,
          last_price_update: new Date(),
        },
      });
      flashDrop.current_price = currentPrice;
    }

    res.json({
      success: true,
      flashDrop: {
        id: flashDrop.id,
        product: flashDrop.product,
        startingPrice: flashDrop.starting_price,
        currentPrice: flashDrop.current_price,
        minPrice: flashDrop.min_price,
        priceDecrement: flashDrop.price_decrement,
        intervalSeconds: flashDrop.interval_seconds,
        status: flashDrop.status,
        frozenByUserId: flashDrop.frozen_by_user_id,
        frozenAt: flashDrop.frozen_at,
        startedAt: flashDrop.started_at,
        lastPriceUpdate: flashDrop.last_price_update,
      },
    });
  } catch (error: any) {
    console.error('Error fetching flash drop:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch flash drop',
      error: error.message 
    });
  }
});

/**
 * POST /api/v1/flash-drop/freeze
 * Freeze the price and claim the purchase (atomic operation)
 */
router.post('/freeze', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Get active flash drop
    const flashDrop = await prisma.flash_drops.findFirst({
      where: {
        status: 'ACTIVE',
      },
    });

    if (!flashDrop) {
      return res.status(404).json({ 
        success: false, 
        message: 'No active flash drop' 
      });
    }

    // Calculate current price
    const currentPrice = calculateCurrentPrice(flashDrop);

    // Atomic update: Only freeze if still ACTIVE (prevents race conditions)
    const updated = await prisma.flash_drops.updateMany({
      where: {
        id: flashDrop.id,
        status: 'ACTIVE', // Only update if still active
      },
      data: {
        status: 'FROZEN',
        current_price: currentPrice,
        frozen_by_user_id: userId,
        frozen_at: new Date(),
        last_price_update: new Date(),
      },
    });

    if (updated.count === 0) {
      // Someone else already froze it
      const currentFlashDrop = await prisma.flash_drops.findUnique({
        where: { id: flashDrop.id },
      });

      return res.status(409).json({
        success: false,
        message: 'Flash drop already claimed by another user',
        flashDrop: {
          status: currentFlashDrop?.status,
          frozenByUserId: currentFlashDrop?.frozen_by_user_id,
        },
      });
    }

    // Record participation
    await prisma.flash_drop_participants.upsert({
      where: {
        flash_drop_id_user_id: {
          flash_drop_id: flashDrop.id,
          user_id: userId,
        },
      },
      create: {
        flash_drop_id: flashDrop.id,
        user_id: userId,
        clicked_buy: true,
      },
      update: {
        clicked_buy: true,
      },
    });

    res.json({
      success: true,
      message: 'Price frozen! Proceed to checkout',
      flashDrop: {
        id: flashDrop.id,
        productId: flashDrop.product_id,
        frozenPrice: currentPrice,
        currency: 'USD', // Default, can be fetched from product
      },
    });
  } catch (error: any) {
    console.error('Error freezing flash drop:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to freeze flash drop',
      error: error.message 
    });
  }
});

/**
 * POST /api/v1/flash-drop/create
 * Create a new flash drop (admin only)
 */
router.post('/create', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Check if user is admin/founder
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN' && user?.role !== 'FOUNDER') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { productId, startingPrice, minPrice, priceDecrement, intervalSeconds } = req.body;

    if (!productId || !startingPrice) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID and starting price are required' 
      });
    }

    // Check if product exists
    const product = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if there's already an active flash drop for this product
    const existing = await prisma.flash_drops.findFirst({
      where: {
        product_id: productId,
        status: 'ACTIVE',
      },
    });

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'Flash drop already exists for this product' 
      });
    }

    // Create flash drop
    const flashDrop = await prisma.flash_drops.create({
      data: {
        product_id: productId,
        starting_price: parseFloat(startingPrice),
        current_price: parseFloat(startingPrice),
        min_price: minPrice ? parseFloat(minPrice) : null,
        price_decrement: priceDecrement ? parseFloat(priceDecrement) : PRICE_DECREMENT,
        interval_seconds: intervalSeconds || 10,
        status: 'ACTIVE',
        started_at: new Date(),
        last_price_update: new Date(),
      },
    });

    res.json({
      success: true,
      flashDrop: {
        id: flashDrop.id,
        productId: flashDrop.product_id,
        startingPrice: flashDrop.starting_price,
        currentPrice: flashDrop.current_price,
        status: flashDrop.status,
      },
    });
  } catch (error: any) {
    console.error('Error creating flash drop:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create flash drop',
      error: error.message 
    });
  }
});

export default router;

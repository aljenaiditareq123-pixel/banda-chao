import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { randomBytes } from 'crypto';

const router = Router();
const prisma = new PrismaClient() as any;

// Hunger decreases by 5 every hour
const HUNGER_DECAY_PER_HOUR = 5;
const MAX_HUNGER = 100;
const MIN_HUNGER = 0;

/**
 * Calculate current hunger level based on last update
 */
function calculateCurrentHunger(petState: any): number {
  if (!petState) return 50; // Default if no pet state
  
  const now = new Date();
  const lastUpdate = new Date(petState.last_hunger_update);
  const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
  
  const hungerLost = Math.floor(hoursSinceUpdate * HUNGER_DECAY_PER_HOUR);
  const newHunger = Math.max(MIN_HUNGER, petState.hunger_level - hungerLost);
  
  return newHunger;
}

/**
 * GET /api/v1/pet/state
 * Get current pet state for authenticated user
 */
router.get('/state', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Get or create pet state
    let petState = await prisma.pet_states.findUnique({
      where: { user_id: userId },
    });

    if (!petState) {
      // Create new pet state
      petState = await prisma.pet_states.create({
        data: {
          user_id: userId,
          hunger_level: MAX_HUNGER,
          happiness_level: 50,
          last_hunger_update: new Date(),
        },
      });
    } else {
      // Update hunger based on time passed
      const currentHunger = calculateCurrentHunger(petState);
      
      if (currentHunger !== petState.hunger_level) {
        petState = await prisma.pet_states.update({
          where: { id: petState.id },
          data: {
            hunger_level: currentHunger,
            last_hunger_update: new Date(),
          },
        });
      }
    }

    // Get recent feed history
    const recentFeeds = await prisma.pet_feed_history.findMany({
      where: { pet_state_id: petState.id },
      orderBy: { created_at: 'desc' },
      take: 5,
    });

    res.json({
      success: true,
      pet: {
        id: petState.id,
        hungerLevel: petState.hunger_level,
        happinessLevel: petState.happiness_level,
        lastFedAt: petState.last_fed_at,
        totalFeeds: petState.total_feeds,
        recentFeeds: recentFeeds.map((feed: any) => ({
          id: feed.id,
          type: feed.feed_type,
          amount: feed.feed_amount,
          createdAt: feed.created_at,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching pet state:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch pet state',
      error: error.message 
    });
  }
});

/**
 * POST /api/v1/pet/feed
 * Feed the pet (browse 5 items, share product, or direct feed)
 */
router.post('/feed', authenticateToken, async (req: any, res: Response) => {
  try {
    const { feedType, metadata } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!feedType || !['BROWSE', 'SHARE', 'DIRECT_FEED'].includes(feedType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid feed type. Must be BROWSE, SHARE, or DIRECT_FEED' 
      });
    }

    // Get or create pet state
    let petState = await prisma.pet_states.findUnique({
      where: { user_id: userId },
    });

    if (!petState) {
      petState = await prisma.pet_states.create({
        data: {
          user_id: userId,
          hunger_level: MAX_HUNGER,
          happiness_level: 50,
          last_hunger_update: new Date(),
        },
      });
    } else {
      // Update hunger based on time passed
      const currentHunger = calculateCurrentHunger(petState);
      petState.hunger_level = currentHunger;
    }

    // Calculate feed amount based on type
    let feedAmount = 10; // Default
    if (feedType === 'BROWSE') {
      feedAmount = 15; // Browsing 5 items gives more
    } else if (feedType === 'SHARE') {
      feedAmount = 20; // Sharing gives even more
    }

    // Cap hunger at MAX_HUNGER
    const newHunger = Math.min(MAX_HUNGER, petState.hunger_level + feedAmount);
    const hungerIncrease = newHunger - petState.hunger_level;

    // Update pet state
    const updatedPetState = await prisma.pet_states.update({
      where: { id: petState.id },
      data: {
        hunger_level: newHunger,
        happiness_level: Math.min(100, petState.happiness_level + 5),
        last_fed_at: new Date(),
        last_hunger_update: new Date(),
        total_feeds: petState.total_feeds + 1,
      },
    });

    // Record feed history
    await prisma.pet_feed_history.create({
      data: {
        pet_state_id: petState.id,
        user_id: userId,
        feed_type: feedType,
        feed_amount: hungerIncrease,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    // Check if pet is fully fed (hunger >= 100) and generate discount code
    let discountCode = null;
    if (newHunger >= MAX_HUNGER && petState.hunger_level < MAX_HUNGER) {
      // Pet just became fully fed - generate discount code
      const code = `PET${randomBytes(4).toString('hex').toUpperCase()}`;
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 7); // Valid for 7 days

      discountCode = await prisma.discount_codes.create({
        data: {
          user_id: userId,
          code,
          discount_type: 'PERCENTAGE',
          discount_value: 10, // 10% discount
          min_purchase: 0,
          max_discount: 50, // Max $50 discount
          valid_until: validUntil,
          max_uses: 1,
          source: 'PET_REWARD',
        },
      });
    }

    res.json({
      success: true,
      pet: {
        id: updatedPetState.id,
        hungerLevel: updatedPetState.hunger_level,
        happinessLevel: updatedPetState.happiness_level,
        lastFedAt: updatedPetState.last_fed_at,
        totalFeeds: updatedPetState.total_feeds,
      },
      feedAmount: hungerIncrease,
      discountCode: discountCode ? {
        code: discountCode.code,
        discountValue: discountCode.discount_value,
        discountType: discountCode.discount_type,
        validUntil: discountCode.valid_until,
      } : null,
    });
  } catch (error: any) {
    console.error('Error feeding pet:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to feed pet',
      error: error.message 
    });
  }
});

/**
 * POST /api/v1/pet/track-browse
 * Track product browsing (call after viewing 5 products)
 */
router.post('/track-browse', authenticateToken, async (req: any, res: Response) => {
  try {
    const { productIds } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!productIds || !Array.isArray(productIds) || productIds.length < 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Must browse at least 5 products' 
      });
    }

    // Feed pet with BROWSE type - call the feed handler directly
    // Instead of making HTTP request, we'll call the feed logic directly
    let petState = await prisma.pet_states.findUnique({
      where: { user_id: userId },
    });

    if (!petState) {
      petState = await prisma.pet_states.create({
        data: {
          user_id: userId,
          hunger_level: MAX_HUNGER,
          happiness_level: 50,
          last_hunger_update: new Date(),
        },
      });
    } else {
      const currentHunger = calculateCurrentHunger(petState);
      petState.hunger_level = currentHunger;
    }

    const feedAmount = 15; // BROWSE gives 15
    const newHunger = Math.min(MAX_HUNGER, petState.hunger_level + feedAmount);
    const hungerIncrease = newHunger - petState.hunger_level;

    const updatedPetState = await prisma.pet_states.update({
      where: { id: petState.id },
      data: {
        hunger_level: newHunger,
        happiness_level: Math.min(100, petState.happiness_level + 5),
        last_fed_at: new Date(),
        last_hunger_update: new Date(),
        total_feeds: petState.total_feeds + 1,
      },
    });

    await prisma.pet_feed_history.create({
      data: {
        pet_state_id: petState.id,
        user_id: userId,
        feed_type: 'BROWSE',
        feed_amount: hungerIncrease,
        metadata: JSON.stringify({ productIds }),
      },
    });

    // Check if pet is fully fed and generate discount code
    let discountCode = null;
    if (newHunger >= MAX_HUNGER && petState.hunger_level < MAX_HUNGER) {
      const code = `PET${randomBytes(4).toString('hex').toUpperCase()}`;
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 7);

      discountCode = await prisma.discount_codes.create({
        data: {
          user_id: userId,
          code,
          discount_type: 'PERCENTAGE',
          discount_value: 10,
          min_purchase: 0,
          max_discount: 50,
          valid_until: validUntil,
          max_uses: 1,
          source: 'PET_REWARD',
        },
      });
    }

    res.json({
      success: true,
      message: 'Browse tracked and pet fed!',
      pet: {
        id: updatedPetState.id,
        hungerLevel: updatedPetState.hunger_level,
        happinessLevel: updatedPetState.happiness_level,
        lastFedAt: updatedPetState.last_fed_at,
        totalFeeds: updatedPetState.total_feeds,
      },
      discountCode: discountCode ? {
        code: discountCode.code,
        discountValue: discountCode.discount_value,
        discountType: discountCode.discount_type,
        validUntil: discountCode.valid_until,
      } : null,
    });
  } catch (error: any) {
    console.error('Error tracking browse:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to track browse',
      error: error.message 
    });
  }
});

/**
 * GET /api/v1/pet/discount-codes
 * Get user's discount codes from pet rewards
 */
router.get('/discount-codes', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const codes = await prisma.discount_codes.findMany({
      where: {
        user_id: userId,
        source: 'PET_REWARD',
        is_active: true,
        valid_until: {
          gte: new Date(),
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({
      success: true,
      codes: codes.map((code: any) => ({
        id: code.id,
        code: code.code,
        discountType: code.discount_type,
        discountValue: code.discount_value,
        minPurchase: code.min_purchase,
        maxDiscount: code.max_discount,
        validUntil: code.valid_until,
        usedCount: code.used_count,
        maxUses: code.max_uses,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching discount codes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch discount codes',
      error: error.message 
    });
  }
});

export default router;

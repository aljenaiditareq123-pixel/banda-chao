import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient() as any;

/**
 * POST /api/v1/blind-box/reveal/:orderItemId
 * Reveal the mystery product from a blind box after payment confirmation
 */
router.post('/reveal/:orderItemId', authenticateToken, async (req: any, res: Response) => {
  try {
    const { orderItemId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Get order item
    const orderItem = await prisma.order_items.findUnique({
      where: { id: orderItemId },
      include: {
        orders: {
          select: {
            id: true,
            user_id: true,
            status: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            is_blind_box: true,
          },
        },
      },
    });

    if (!orderItem) {
      return res.status(404).json({ success: false, message: 'Order item not found' });
    }

    // Verify ownership
    if (orderItem.orders.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Verify it's a blind box
    if (!orderItem.is_blind_box) {
      return res.status(400).json({ 
        success: false, 
        message: 'This item is not a blind box' 
      });
    }

    // Check if already revealed
    if (orderItem.revealed_product_id) {
      // Return the already revealed product
      const revealedProduct = await prisma.products.findUnique({
        where: { id: orderItem.revealed_product_id },
        select: {
          id: true,
          name: true,
          name_ar: true,
          name_zh: true,
          description: true,
          description_ar: true,
          description_zh: true,
          image_url: true,
          price: true,
          currency: true,
        },
      });

      return res.json({
        success: true,
        alreadyRevealed: true,
        product: revealedProduct,
      });
    }

    // Get mystery list for this blind box
    const mysteryList = await prisma.mystery_lists.findMany({
      where: {
        blind_box_product_id: orderItem.product_id,
      },
      include: {
        mystery_product: {
          select: {
            id: true,
            name: true,
            name_ar: true,
            name_zh: true,
            description: true,
            description_ar: true,
            description_zh: true,
            image_url: true,
            price: true,
            currency: true,
            stock: true,
          },
        },
      },
    });

    if (mysteryList.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No mystery products configured for this blind box' 
      });
    }

    // Weighted random selection
    const totalWeight = mysteryList.reduce((sum: number, item: any) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedProduct = null;
    for (const item of mysteryList) {
      random -= item.weight;
      if (random <= 0) {
        selectedProduct = item.mystery_product;
        break;
      }
    }

    // Fallback to first item if selection failed
    if (!selectedProduct) {
      selectedProduct = mysteryList[0].mystery_product;
    }

    // Update order item with revealed product
    await prisma.order_items.update({
      where: { id: orderItemId },
      data: {
        revealed_product_id: selectedProduct.id,
      },
    });

    res.json({
      success: true,
      product: selectedProduct,
    });
  } catch (error: any) {
    console.error('Error revealing blind box:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reveal blind box',
      error: error.message 
    });
  }
});

/**
 * GET /api/v1/blind-box/mystery-list/:blindBoxId
 * Get the list of possible products for a blind box (admin only, for configuration)
 */
router.get('/mystery-list/:blindBoxId', authenticateToken, async (req: any, res: Response) => {
  try {
    const { blindBoxId } = req.params;
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

    const mysteryList = await prisma.mystery_lists.findMany({
      where: {
        blind_box_product_id: blindBoxId,
      },
      include: {
        mystery_product: {
          select: {
            id: true,
            name: true,
            name_ar: true,
            name_zh: true,
            image_url: true,
            price: true,
          },
        },
      },
      orderBy: {
        weight: 'desc',
      },
    });

    res.json({
      success: true,
      mysteryList: mysteryList.map((item: any) => ({
        id: item.id,
        product: item.mystery_product,
        weight: item.weight,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching mystery list:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch mystery list',
      error: error.message 
    });
  }
});

export default router;

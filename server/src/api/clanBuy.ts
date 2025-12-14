import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const prisma = new PrismaClient() as any;

/**
 * POST /api/v1/clan-buy/create
 * Create a new clan buy for a product
 */
router.post('/create', authenticateToken, async (req: any, res: Response) => {
  try {
    const { productId, clanPrice } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!productId || !clanPrice) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID and clan price are required' 
      });
    }

    // Check if product exists
    const product = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Generate unique join token
    const joinToken = uuidv4().replace(/-/g, '').substring(0, 16);

    // Create clan buy (expires in 24 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const clanBuy = await prisma.clan_buys.create({
      data: {
        product_id: productId,
        creator_id: userId,
        join_token: joinToken,
        status: 'WAITING',
        member_count: 1,
        required_count: 2,
        clan_price: parseFloat(clanPrice),
        expires_at: expiresAt,
      },
    });

    // Add creator as first member
    await prisma.clan_buy_members.create({
      data: {
        clan_id: clanBuy.id,
        user_id: userId,
      },
    });

    res.json({
      success: true,
      clanBuy: {
        id: clanBuy.id,
        joinToken: clanBuy.join_token,
        status: clanBuy.status,
        memberCount: clanBuy.member_count,
        requiredCount: clanBuy.required_count,
        clanPrice: clanBuy.clan_price,
        expiresAt: clanBuy.expires_at,
      },
    });
  } catch (error: any) {
    console.error('Error creating clan buy:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create clan buy',
      error: error.message 
    });
  }
});

/**
 * GET /api/v1/clan-buy/:joinToken
 * Get clan buy details by join token
 */
router.get('/:joinToken', async (req: Request, res: Response) => {
  try {
    const { joinToken } = req.params;

    const clanBuy = await prisma.clan_buys.findUnique({
      where: { join_token: joinToken },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            name_ar: true,
            name_zh: true,
            image_url: true,
            price: true,
            currency: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profile_picture: true,
              },
            },
          },
          orderBy: {
            joined_at: 'asc',
          },
        },
      },
    });

    if (!clanBuy) {
      return res.status(404).json({ success: false, message: 'Clan buy not found' });
    }

    // Check if expired
    if (new Date(clanBuy.expires_at) < new Date() && clanBuy.status === 'WAITING') {
      await prisma.clan_buys.update({
        where: { id: clanBuy.id },
        data: { status: 'EXPIRED' },
      });
      clanBuy.status = 'EXPIRED';
    }

    res.json({
      success: true,
      clanBuy: {
        id: clanBuy.id,
        joinToken: clanBuy.join_token,
        status: clanBuy.status,
        memberCount: clanBuy.member_count,
        requiredCount: clanBuy.required_count,
        clanPrice: clanBuy.clan_price,
        expiresAt: clanBuy.expires_at,
        product: clanBuy.product,
        creator: clanBuy.creator,
        members: clanBuy.members.map((m: any) => ({
          id: m.user.id,
          name: m.user.name,
          profilePicture: m.user.profile_picture,
          joinedAt: m.joined_at,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching clan buy:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch clan buy',
      error: error.message 
    });
  }
});

/**
 * POST /api/v1/clan-buy/:joinToken/join
 * Join an existing clan buy
 */
router.post('/:joinToken/join', authenticateToken, async (req: any, res: Response) => {
  try {
    const { joinToken } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const clanBuy = await prisma.clan_buys.findUnique({
      where: { join_token: joinToken },
      include: {
        members: true,
      },
    });

    if (!clanBuy) {
      return res.status(404).json({ success: false, message: 'Clan buy not found' });
    }

    // Check if expired
    if (new Date(clanBuy.expires_at) < new Date()) {
      await prisma.clan_buys.update({
        where: { id: clanBuy.id },
        data: { status: 'EXPIRED' },
      });
      return res.status(400).json({ success: false, message: 'Clan buy has expired' });
    }

    // Check if already completed
    if (clanBuy.status !== 'WAITING') {
      return res.status(400).json({ 
        success: false, 
        message: `Clan buy is ${clanBuy.status.toLowerCase()}` 
      });
    }

    // Check if user is already a member
    const existingMember = clanBuy.members.find((m: any) => m.user_id === userId);
    if (existingMember) {
      return res.status(400).json({ success: false, message: 'You are already a member' });
    }

    // Check if clan is full
    if (clanBuy.member_count >= clanBuy.required_count) {
      return res.status(400).json({ success: false, message: 'Clan buy is full' });
    }

    // Add user as member
    await prisma.clan_buy_members.create({
      data: {
        clan_id: clanBuy.id,
        user_id: userId,
      },
    });

    // Update member count
    const newMemberCount = clanBuy.member_count + 1;
    const isComplete = newMemberCount >= clanBuy.required_count;

    await prisma.clan_buys.update({
      where: { id: clanBuy.id },
      data: {
        member_count: newMemberCount,
        status: isComplete ? 'COMPLETE' : 'WAITING',
        completed_at: isComplete ? new Date() : null,
      },
    });

    res.json({
      success: true,
      message: isComplete ? 'Clan buy completed! Both members can now purchase at discounted price.' : 'Joined clan buy successfully',
      clanBuy: {
        id: clanBuy.id,
        status: isComplete ? 'COMPLETE' : 'WAITING',
        memberCount: newMemberCount,
        requiredCount: clanBuy.required_count,
        isComplete,
      },
    });
  } catch (error: any) {
    console.error('Error joining clan buy:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to join clan buy',
      error: error.message 
    });
  }
});

export default router;

import { prisma } from '../utils/prisma';
import { randomBytes } from 'crypto';

/**
 * Viral Growth Service
 * Handles referral links and clan buying logic
 * 
 * Strategy: Pinduoduo-style group buying with referral incentives
 */

/**
 * Generate unique referral link for user
 * Format: /ref/USER123 or /ref/TOKEN123
 */
export async function generateReferralLink(userId: string): Promise<string> {
  try {
    // Check if user already has a referral code
    const existingCode = await prisma.users.findUnique({
      where: { id: userId },
      select: { referral_code: true },
    } as any);

    if (existingCode?.referral_code) {
      return `/ref/${existingCode.referral_code}`;
    }

    // Generate new referral code (8 characters, alphanumeric)
    const referralCode = randomBytes(4).toString('hex').toUpperCase();

    // Update user with referral code
    await prisma.users.update({
      where: { id: userId },
      data: { referral_code: referralCode },
    } as any);

    return `/ref/${referralCode}`;
  } catch (error) {
    console.error('Error generating referral link:', error);
    // Fallback: use user ID
    return `/ref/${userId.substring(0, 8).toUpperCase()}`;
  }
}

/**
 * Track referral click
 */
export async function trackReferralClick(referralCode: string, visitorId?: string): Promise<void> {
  try {
    // Find user by referral code
    const referrer = await prisma.users.findFirst({
      where: { referral_code: referralCode },
      select: { id: true },
    } as any);

    if (!referrer) return;

    // Track click (you can create a referral_clicks table later)
    // For now, we'll just log it
    console.log(`Referral click: ${referralCode} by visitor ${visitorId || 'unknown'}`);
  } catch (error) {
    console.error('Error tracking referral click:', error);
  }
}

/**
 * Create a new clan buy (group purchase)
 */
export async function createClan(
  productId: string,
  leaderId: string,
  clanPrice: number,
  requiredCount: number = 3
): Promise<{
  success: boolean;
  clanBuy?: any;
  joinToken?: string;
  error?: string;
}> {
  try {
    // Check if product exists
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, price: true },
    } as any);

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    // Generate unique join token
    const joinToken = randomBytes(8).toString('hex');

    // Set expiration (24 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create clan buy
    const clanBuy = await prisma.clan_buys.create({
      data: {
        product_id: productId,
        creator_id: leaderId,
        join_token: joinToken,
        status: 'WAITING',
        member_count: 1,
        required_count: requiredCount,
        clan_price: clanPrice,
        expires_at: expiresAt,
      },
    });

    // Add creator as first member
    await prisma.clan_buy_members.create({
      data: {
        clan_id: clanBuy.id,
        user_id: leaderId,
      },
    });

    return {
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
      joinToken: clanBuy.join_token,
    };
  } catch (error: any) {
    console.error('Error creating clan:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Join an existing clan buy
 */
export async function joinClan(
  clanId: string,
  userId: string
): Promise<{
  success: boolean;
  isComplete?: boolean;
  clanBuy?: any;
  error?: string;
}> {
  try {
    // Get clan buy
    const clanBuy = await prisma.clan_buys.findUnique({
      where: { id: clanId },
      include: {
        members: true,
      },
    });

    if (!clanBuy) {
      return { success: false, error: 'Clan buy not found' };
    }

    // Check if expired
    if (new Date(clanBuy.expires_at) < new Date()) {
      await prisma.clan_buys.update({
        where: { id: clanBuy.id },
        data: { status: 'EXPIRED' },
      });
      return { success: false, error: 'Clan buy has expired' };
    }

    // Check if already completed
    if (clanBuy.status !== 'WAITING') {
      return { success: false, error: `Clan buy is ${clanBuy.status.toLowerCase()}` };
    }

    // Check if user is already a member
    const existingMember = clanBuy.members.find((m: any) => m.user_id === userId);
    if (existingMember) {
      return { success: false, error: 'You are already a member' };
    }

    // Check if clan is full
    if (clanBuy.member_count >= clanBuy.required_count) {
      return { success: false, error: 'Clan buy is full' };
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

    return {
      success: true,
      isComplete,
      clanBuy: {
        id: clanBuy.id,
        status: isComplete ? 'COMPLETE' : 'WAITING',
        memberCount: newMemberCount,
        requiredCount: clanBuy.required_count,
        clanPrice: clanBuy.clan_price,
      },
    };
  } catch (error: any) {
    console.error('Error joining clan:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check and process expired clan buys
 * This should be run periodically (cron job)
 */
export async function processExpiredClans(): Promise<void> {
  try {
    const expiredClans = await prisma.clan_buys.findMany({
      where: {
        status: 'WAITING',
        expires_at: {
          lt: new Date(),
        },
      },
    });

    for (const clan of expiredClans) {
      await prisma.clan_buys.update({
        where: { id: clan.id },
        data: { status: 'EXPIRED' },
      });
    }

    console.log(`Processed ${expiredClans.length} expired clan buys`);
  } catch (error) {
    console.error('Error processing expired clans:', error);
  }
}

/**
 * Get clan buy statistics for a product
 */
export async function getClanBuyStats(productId: string): Promise<{
  activeClans: number;
  totalMembers: number;
  averageDiscount: number;
}> {
  try {
    const activeClans = await prisma.clan_buys.findMany({
      where: {
        product_id: productId,
        status: 'WAITING',
        expires_at: {
          gt: new Date(),
        },
      },
      include: {
        members: true,
      },
    });

    const totalMembers = activeClans.reduce((sum, clan) => sum + clan.member_count, 0);
    
    // Calculate average discount (simplified)
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { price: true },
    } as any);

    const averageDiscount = product
      ? activeClans.reduce((sum, clan) => {
          const discount = ((product.price - clan.clan_price) / product.price) * 100;
          return sum + discount;
        }, 0) / (activeClans.length || 1)
      : 0;

    return {
      activeClans: activeClans.length,
      totalMembers,
      averageDiscount: Math.round(averageDiscount),
    };
  } catch (error) {
    console.error('Error getting clan buy stats:', error);
    return {
      activeClans: 0,
      totalMembers: 0,
      averageDiscount: 0,
    };
  }
}

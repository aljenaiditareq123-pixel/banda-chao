import { prisma } from '../utils/prisma';

/**
 * Wallet Service - Internal Economy System
 * Manages user balance, points conversion, and transaction history
 * 
 * Security: Uses Prisma Transactions for atomic operations
 */

interface Transaction {
  id: string;
  userId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'POINTS_CONVERSION' | 'GAME_REWARD' | 'PURCHASE' | 'REFUND';
  amount: number;
  currency: string;
  description: string;
  relatedOrderId?: string;
  createdAt: Date;
}

/**
 * Get user wallet balance
 */
export async function getWalletBalance(userId: string): Promise<{
  balance: number;
  points: number;
  currency: string;
}> {
  try {
    // Get balance and points using raw SQL
    const walletData = await prisma.$queryRawUnsafe<Array<{ balance: number; points: number; currency: string }>>(
      `SELECT COALESCE(wallet_balance, 0) as balance, COALESCE(points, 0) as points, COALESCE(currency, 'USD') as currency FROM users WHERE id = $1`,
      userId
    );

    if (walletData && walletData.length > 0) {
      return {
        balance: walletData[0].balance || 0,
        points: walletData[0].points || 0,
        currency: walletData[0].currency || 'USD',
      };
    }

    return { balance: 0, points: 0, currency: 'USD' };
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    return { balance: 0, points: 0, currency: 'USD' };
  }
}

/**
 * Convert points to wallet balance (Atomic Transaction)
 * Exchange rate: 100 points = $1
 */
export async function convertPointsToBalance(
  userId: string,
  pointsToConvert: number
): Promise<{
  success: boolean;
  balanceAdded?: number;
  pointsDeducted?: number;
  newBalance?: number;
  newPoints?: number;
  error?: string;
}> {
  try {
    // Validate input
    if (pointsToConvert <= 0) {
      return { success: false, error: 'Points amount must be greater than 0' };
    }

    if (pointsToConvert < 100) {
      return { success: false, error: 'Minimum 100 points required for conversion' };
    }

    // Use Prisma Transaction for atomic operation
    const result = await prisma.$transaction(async (tx) => {
      // Get current balance and points
      const walletData = await tx.$queryRawUnsafe<Array<{ balance: number; points: number; currency: string }>>(
        `SELECT COALESCE(wallet_balance, 0) as balance, COALESCE(points, 0) as points, COALESCE(currency, 'USD') as currency FROM users WHERE id = $1 FOR UPDATE`,
        userId
      );

      if (!walletData || walletData.length === 0) {
        throw new Error('User not found');
      }

      const currentBalance = walletData[0].balance || 0;
      const currentPoints = walletData[0].points || 0;
      const currency = walletData[0].currency || 'USD';

      // Check if user has enough points
      if (currentPoints < pointsToConvert) {
        throw new Error('Insufficient points');
      }

      // Calculate balance to add (100 points = $1)
      const balanceToAdd = pointsToConvert / 100;
      const newBalance = currentBalance + balanceToAdd;
      const newPoints = currentPoints - pointsToConvert;

      // Update user balance and points (atomic)
      await tx.$executeRawUnsafe(
        `UPDATE users SET wallet_balance = $1, points = $2 WHERE id = $3`,
        newBalance,
        newPoints,
        userId
      );

      // Create transaction record
      const transactionId = await tx.$queryRawUnsafe<Array<{ id: string }>>(
        `INSERT INTO wallet_transactions (id, user_id, type, amount, currency, description, created_at) 
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW()) 
         RETURNING id`,
        userId,
        'POINTS_CONVERSION',
        balanceToAdd,
        currency,
        `Converted ${pointsToConvert} points to ${balanceToAdd} ${currency}`
      );

      return {
        balanceAdded: balanceToAdd,
        pointsDeducted: pointsToConvert,
        newBalance,
        newPoints,
      };
    });

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error('Error converting points to balance:', error);
    return {
      success: false,
      error: error.message || 'Failed to convert points',
    };
  }
}

/**
 * Add balance to wallet (for rewards, refunds, etc.)
 */
export async function addBalance(
  userId: string,
  amount: number,
  type: 'DEPOSIT' | 'GAME_REWARD' | 'REFUND',
  description: string,
  relatedOrderId?: string
): Promise<{
  success: boolean;
  newBalance?: number;
  error?: string;
}> {
  try {
    if (amount <= 0) {
      return { success: false, error: 'Amount must be greater than 0' };
    }

    // Use transaction for atomic operation
    const result = await prisma.$transaction(async (tx) => {
      // Get current balance
      const walletData = await tx.$queryRawUnsafe<Array<{ balance: number; currency: string }>>(
        `SELECT COALESCE(wallet_balance, 0) as balance, COALESCE(currency, 'USD') as currency FROM users WHERE id = $1 FOR UPDATE`,
        userId
      );

      if (!walletData || walletData.length === 0) {
        throw new Error('User not found');
      }

      const currentBalance = walletData[0].balance || 0;
      const currency = walletData[0].currency || 'USD';
      const newBalance = currentBalance + amount;

      // Update balance
      await tx.$executeRawUnsafe(
        `UPDATE users SET wallet_balance = $1 WHERE id = $2`,
        newBalance,
        userId
      );

      // Create transaction record
      await tx.$queryRawUnsafe(
        `INSERT INTO wallet_transactions (id, user_id, type, amount, currency, description, related_order_id, created_at) 
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())`,
        userId,
        type,
        amount,
        currency,
        description,
        relatedOrderId || null
      );

      return { newBalance };
    });

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error('Error adding balance:', error);
    return {
      success: false,
      error: error.message || 'Failed to add balance',
    };
  }
}

/**
 * Deduct balance from wallet (for purchases)
 */
export async function deductBalance(
  userId: string,
  amount: number,
  description: string,
  relatedOrderId?: string
): Promise<{
  success: boolean;
  newBalance?: number;
  error?: string;
}> {
  try {
    if (amount <= 0) {
      return { success: false, error: 'Amount must be greater than 0' };
    }

    // Use transaction for atomic operation
    const result = await prisma.$transaction(async (tx) => {
      // Get current balance
      const walletData = await tx.$queryRawUnsafe<Array<{ balance: number; currency: string }>>(
        `SELECT COALESCE(wallet_balance, 0) as balance, COALESCE(currency, 'USD') as currency FROM users WHERE id = $1 FOR UPDATE`,
        userId
      );

      if (!walletData || walletData.length === 0) {
        throw new Error('User not found');
      }

      const currentBalance = walletData[0].balance || 0;
      const currency = walletData[0].currency || 'USD';

      // Check if user has enough balance
      if (currentBalance < amount) {
        throw new Error('Insufficient balance');
      }

      const newBalance = currentBalance - amount;

      // Update balance
      await tx.$executeRawUnsafe(
        `UPDATE users SET wallet_balance = $1 WHERE id = $2`,
        newBalance,
        userId
      );

      // Create transaction record
      await tx.$queryRawUnsafe(
        `INSERT INTO wallet_transactions (id, user_id, type, amount, currency, description, related_order_id, created_at) 
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())`,
        userId,
        'WITHDRAWAL',
        amount,
        currency,
        description,
        relatedOrderId || null
      );

      return { newBalance };
    });

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    console.error('Error deducting balance:', error);
    return {
      success: false,
      error: error.message || 'Failed to deduct balance',
    };
  }
}

/**
 * Get transaction history
 */
export async function getTransactionHistory(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{
  transactions: Transaction[];
  total: number;
}> {
  try {
    // Get transactions using raw SQL (if table exists)
    const transactions = await prisma.$queryRawUnsafe<Array<{
      id: string;
      user_id: string;
      type: string;
      amount: number;
      currency: string;
      description: string;
      related_order_id: string | null;
      created_at: Date;
    }>>(
      `SELECT id, user_id, type, amount, currency, description, related_order_id, created_at 
       FROM wallet_transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      userId,
      limit,
      offset
    );

    // Get total count
    const countResult = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
      `SELECT COUNT(*) as count FROM wallet_transactions WHERE user_id = $1`,
      userId
    );

    const total = Number(countResult[0]?.count || 0);

    return {
      transactions: transactions.map((t) => ({
        id: t.id,
        userId: t.user_id,
        type: t.type as Transaction['type'],
        amount: t.amount,
        currency: t.currency,
        description: t.description,
        relatedOrderId: t.related_order_id || undefined,
        createdAt: t.created_at,
      })),
      total,
    };
  } catch (error) {
    console.error('Error getting transaction history:', error);
    // If table doesn't exist, return empty array
    return {
      transactions: [],
      total: 0,
    };
  }
}

/**
 * Get wallet statistics
 */
export async function getWalletStats(userId: string): Promise<{
  totalEarned: number;
  totalSpent: number;
  totalTransactions: number;
}> {
  try {
    const stats = await prisma.$queryRawUnsafe<Array<{
      total_earned: number;
      total_spent: number;
      total_transactions: number;
    }>>(
      `SELECT 
        COALESCE(SUM(CASE WHEN type IN ('DEPOSIT', 'GAME_REWARD', 'REFUND', 'POINTS_CONVERSION') THEN amount ELSE 0 END), 0) as total_earned,
        COALESCE(SUM(CASE WHEN type IN ('WITHDRAWAL', 'PURCHASE') THEN amount ELSE 0 END), 0) as total_spent,
        COUNT(*) as total_transactions
       FROM wallet_transactions 
       WHERE user_id = $1`,
      userId
    );

    if (stats && stats.length > 0) {
      return {
        totalEarned: stats[0].total_earned || 0,
        totalSpent: stats[0].total_spent || 0,
        totalTransactions: Number(stats[0].total_transactions || 0),
      };
    }

    return {
      totalEarned: 0,
      totalSpent: 0,
      totalTransactions: 0,
    };
  } catch (error) {
    console.error('Error getting wallet stats:', error);
    return {
      totalEarned: 0,
      totalSpent: 0,
      totalTransactions: 0,
    };
  }
}

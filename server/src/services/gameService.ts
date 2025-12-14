import { prisma } from '../utils/prisma';

/**
 * Game Service - Gamification Center
 * Handles daily check-ins, spin wheel, and rewards
 */

interface CheckInStatus {
  hasCheckedIn: boolean;
  streak: number;
  lastCheckIn: Date | null;
  pointsEarned: number;
}

interface SpinResult {
  prize: string;
  prizeType: 'discount' | 'points' | 'nothing';
  value: number;
  message: string;
}

/**
 * Perform daily check-in
 */
export async function performDailyCheckIn(userId: string): Promise<{
  success: boolean;
  streak?: number;
  pointsEarned?: number;
  totalPoints?: number;
  error?: string;
}> {
  try {
    // Get user's last check-in date
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        points: true,
      },
    } as any);

    // Get check-in data from database (using raw SQL if columns don't exist in Prisma)
    let lastCheckIn: Date | null = null;
    let checkInStreak = 0;
    
    try {
      const checkInData = await prisma.$queryRawUnsafe<Array<{ last_check_in: Date | null; check_in_streak: number }>>(
        `SELECT last_check_in, check_in_streak FROM users WHERE id = $1`,
        userId
      );
      if (checkInData && checkInData.length > 0) {
        lastCheckIn = checkInData[0].last_check_in;
        checkInStreak = checkInData[0].check_in_streak || 0;
      }
    } catch (error) {
      // Columns might not exist, use defaults
      console.log('Check-in columns not found, using defaults');
    }

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastCheckInDate = lastCheckIn ? new Date(lastCheckIn) : null;
    
    if (lastCheckInDate) {
      lastCheckInDate.setHours(0, 0, 0, 0);
    }

    // Check if already checked in today
    if (lastCheckInDate && lastCheckInDate.getTime() === today.getTime()) {
      return {
        success: false,
        error: 'Already checked in today',
      };
    }

    // Calculate streak
    let newStreak = 1;
    const currentStreak = checkInStreak || 0;

    if (lastCheckInDate) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      if (lastCheckInDate.getTime() === yesterday.getTime()) {
        // Consecutive day
        newStreak = currentStreak + 1;
      } else {
        // Streak broken
        newStreak = 1;
      }
    }

    // Calculate points (base + streak bonus)
    const basePoints = 10;
    const streakBonus = Math.min(newStreak * 2, 50); // Max 50 bonus points
    const pointsEarned = basePoints + streakBonus;
    const currentPoints = (user as any).points || 0;
    const newTotalPoints = currentPoints + pointsEarned;

    // Update user (using raw SQL if columns don't exist)
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE users SET points = $1, last_check_in = $2, check_in_streak = $3 WHERE id = $4`,
        newTotalPoints,
        today,
        newStreak,
        userId
      );
    } catch (error) {
      // Fallback: update only points using raw SQL
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE users SET points = $1 WHERE id = $2`,
          newTotalPoints,
          userId
        );
      } catch (err) {
        console.error('Error updating points:', err);
        // If points column doesn't exist, we can't update it
        // This is expected if the column hasn't been added to the schema yet
      }
    }

    return {
      success: true,
      streak: newStreak,
      pointsEarned,
      totalPoints: newTotalPoints,
    };
  } catch (error: any) {
    console.error('Error performing check-in:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get check-in status
 */
export async function getCheckInStatus(userId: string): Promise<CheckInStatus> {
  try {
    // Get check-in data using raw SQL
    let lastCheckIn: Date | null = null;
    let checkInStreak = 0;
    
    try {
      const checkInData = await prisma.$queryRawUnsafe<Array<{ last_check_in: Date | null; check_in_streak: number }>>(
        `SELECT last_check_in, check_in_streak FROM users WHERE id = $1`,
        userId
      );
      if (checkInData && checkInData.length > 0) {
        lastCheckIn = checkInData[0].last_check_in;
        checkInStreak = checkInData[0].check_in_streak || 0;
      }
    } catch (error) {
      // Columns might not exist
      console.log('Check-in columns not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastCheckInDate = lastCheckIn ? new Date(lastCheckIn) : null;

    if (lastCheckInDate) {
      lastCheckInDate.setHours(0, 0, 0, 0);
    }

    const hasCheckedIn = lastCheckInDate && lastCheckInDate.getTime() === today.getTime();

    return {
      hasCheckedIn: hasCheckedIn || false,
      streak: checkInStreak,
      lastCheckIn: lastCheckInDate,
      pointsEarned: 0,
    };
  } catch (error) {
    console.error('Error getting check-in status:', error);
    return {
      hasCheckedIn: false,
      streak: 0,
      lastCheckIn: null,
      pointsEarned: 0,
    };
  }
}

/**
 * Get weekly check-in history (last 7 days)
 */
export async function getWeeklyCheckInHistory(userId: string): Promise<boolean[]> {
  try {
    // This would require a check_ins table for full history
    // For now, return simplified version based on streak
    const status = await getCheckInStatus(userId);
    const history: boolean[] = [];

    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      if (status.lastCheckIn) {
        const checkInDate = new Date(status.lastCheckIn);
        checkInDate.setHours(0, 0, 0, 0);
        history.push(checkInDate.getTime() === date.getTime());
      } else {
        history.push(false);
      }
    }

    return history;
  } catch (error) {
    console.error('Error getting weekly history:', error);
    return [false, false, false, false, false, false, false];
  }
}

/**
 * Spin the wheel (server-side RNG for security)
 */
export async function spinTheWheel(userId: string): Promise<{
  success: boolean;
  result?: SpinResult;
  error?: string;
}> {
  try {
    // Check if user has already spun today
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        points: true,
      },
    } as any);

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Get last_spin using raw SQL
    let lastSpin: Date | null = null;
    try {
      const spinData = await prisma.$queryRawUnsafe<Array<{ last_spin: Date | null }>>(
        `SELECT last_spin FROM users WHERE id = $1`,
        userId
      );
      if (spinData && spinData.length > 0) {
        lastSpin = spinData[0].last_spin;
      }
    } catch (error) {
      // Column might not exist
      console.log('last_spin column not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastSpinDate = lastSpin ? new Date(lastSpin) : null;

    if (lastSpinDate) {
      lastSpinDate.setHours(0, 0, 0, 0);
    }

    // Check if already spun today
    if (lastSpinDate && lastSpinDate.getTime() === today.getTime()) {
      return {
        success: false,
        error: 'Already spun today. Come back tomorrow!',
      };
    }

    // Server-side RNG (weighted probabilities)
    const random = Math.random();
    let prize: SpinResult;

    if (random < 0.05) {
      // 5% - Big discount (20%)
      prize = {
        prize: '20% Discount',
        prizeType: 'discount',
        value: 20,
        message: 'Congratulations! You won a 20% discount code!',
      };
    } else if (random < 0.15) {
      // 10% - Medium discount (10%)
      prize = {
        prize: '10% Discount',
        prizeType: 'discount',
        value: 10,
        message: 'Great! You won a 10% discount code!',
      };
    } else if (random < 0.35) {
      // 20% - Small discount (5%)
      prize = {
        prize: '5% Discount',
        prizeType: 'discount',
        value: 5,
        message: 'Nice! You won a 5% discount code!',
      };
    } else if (random < 0.65) {
      // 30% - Points (50-200)
      const points = Math.floor(Math.random() * 150) + 50; // 50-200
      prize = {
        prize: `${points} Points`,
        prizeType: 'points',
        value: points,
        message: `Awesome! You won ${points} points!`,
      };

      // Add points to user (using raw SQL)
      const currentPoints = (user as any).points || 0;
      const newPoints = currentPoints + points;
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE users SET points = $1 WHERE id = $2`,
          newPoints,
          userId
        );
      } catch (error) {
        console.error('Error updating points:', error);
      }
    } else {
      // 35% - Better luck next time
      prize = {
        prize: 'Better Luck Next Time',
        prizeType: 'nothing',
        value: 0,
        message: 'Better luck next time! Try again tomorrow.',
      };
    }

    // Update last spin date (using raw SQL)
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE users SET last_spin = $1 WHERE id = $2`,
        today,
        userId
      );
    } catch (error) {
      // Column might not exist, skip update
      console.log('last_spin column not found, skipping update');
    }

    return {
      success: true,
      result: prize,
    };
  } catch (error: any) {
    console.error('Error spinning wheel:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user's current points and level
 */
export async function getUserGameStats(userId: string): Promise<{
  points: number;
  level: number;
  streak: number;
}> {
  try {
    // Get all stats using raw SQL
    const statsData = await prisma.$queryRawUnsafe<Array<{ points: number; level: number; check_in_streak: number }>>(
      `SELECT points, level, check_in_streak FROM users WHERE id = $1`,
      userId
    );

    if (statsData && statsData.length > 0) {
      return {
        points: statsData[0].points || 0,
        level: statsData[0].level || 1,
        streak: statsData[0].check_in_streak || 0,
      };
    }

    return {
      points: 0,
      level: 1,
      streak: 0,
    };
  } catch (error) {
    console.error('Error getting game stats:', error);
    // Fallback: try to get from Prisma (if columns exist)
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
      } as any);
      return {
        points: (user as any)?.points || 0,
        level: (user as any)?.level || 1,
        streak: 0,
      };
    } catch (err) {
      return {
        points: 0,
        level: 1,
        streak: 0,
      };
    }
  }
}

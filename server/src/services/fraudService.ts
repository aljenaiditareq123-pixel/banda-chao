/**
 * Fraud Service - وكيل الحماية المالي
 * 
 * هذا الخدمة تحمي النظام من الاحتيال المالي عبر:
 * - فحص المعاملات المشبوهة
 * - Velocity Checks (فحص السرعة)
 * - Risk Scoring
 * - Blocking Suspicious Users
 */

import { prisma } from '../utils/prisma';

export interface TransactionRisk {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  shouldBlock: boolean;
  reason: string;
  flags: string[];
}

export interface FraudCheckResult {
  allowed: boolean;
  risk: TransactionRisk;
  requiresReview: boolean;
}

/**
 * فحص مخاطر المعاملة
 * 
 * @param userId - معرف المستخدم
 * @param amount - المبلغ
 * @param ip - عنوان IP
 * @returns نتيجة الفحص
 */
export async function checkTransactionRisk(
  userId: string,
  amount: number,
  ip?: string
): Promise<FraudCheckResult> {
  const flags: string[] = [];
  let riskLevel: TransactionRisk['riskLevel'] = 'LOW';
  let shouldBlock = false;
  let requiresReview = false;

  // قاعدة 1: مستخدم جديد + مبلغ كبير (> 500$)
  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: {
      orders: {
        where: {
          status: { in: ['COMPLETED', 'PENDING'] },
        },
        orderBy: { created_at: 'desc' },
        take: 10,
      },
    },
  });

  if (!user) {
    return {
      allowed: false,
      risk: {
        riskLevel: 'CRITICAL',
        shouldBlock: true,
        reason: 'User not found',
        flags: ['USER_NOT_FOUND'],
      },
      requiresReview: false,
    };
  }

  // حساب عمر الحساب
  const accountAge = Date.now() - new Date(user.created_at).getTime();
  const accountAgeDays = accountAge / (1000 * 60 * 60 * 24);
  const isNewUser = accountAgeDays < 7; // أقل من 7 أيام

  // قاعدة 1: مستخدم جديد + مبلغ > 500$
  if (isNewUser && amount > 500) {
    flags.push('NEW_USER_LARGE_AMOUNT');
    riskLevel = 'HIGH';
    requiresReview = true;
  }

  // قاعدة 2: Velocity Check - محاولات دفع فاشلة متكررة
  const recentFailedPayments = await prisma.orders.count({
    where: {
      user_id: userId,
      status: 'FAILED',
      created_at: {
        gte: new Date(Date.now() - 60 * 60 * 1000), // آخر ساعة
      },
    },
  });

  if (recentFailedPayments >= 3) {
    flags.push('HIGH_FAILURE_RATE');
    riskLevel = 'CRITICAL';
    shouldBlock = true;
  }

  // قاعدة 3: مبلغ غير عادي (أكبر من متوسط الطلبات السابقة)
  if (user.orders.length > 0) {
    const avgOrderAmount = user.orders.reduce((sum, order) => sum + order.totalAmount, 0) / user.orders.length;
    if (amount > avgOrderAmount * 5) {
      flags.push('UNUSUAL_AMOUNT');
      if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
      requiresReview = true;
    }
  }

  // قاعدة 4: IP Check - نفس IP لعدة حسابات
  if (ip) {
    const accountsWithSameIP = await prisma.orders.count({
      where: {
        shipping_address: {
          contains: ip,
        },
        created_at: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // آخر 24 ساعة
        },
      },
      distinct: ['user_id'],
    });

    if (accountsWithSameIP > 5) {
      flags.push('SUSPICIOUS_IP');
      riskLevel = 'HIGH';
      requiresReview = true;
    }
  }

  // قاعدة 5: مستخدم محظور مسبقاً
  const isBlocked = await prisma.users.findFirst({
    where: {
      id: userId,
      role: 'BLOCKED',
    },
  });

  if (isBlocked) {
    return {
      allowed: false,
      risk: {
        riskLevel: 'CRITICAL',
        shouldBlock: true,
        reason: 'User is blocked',
        flags: ['USER_BLOCKED'],
      },
      requiresReview: false,
    };
  }

  // قاعدة 6: عدد طلبات مكثف في وقت قصير
  const recentOrders = await prisma.orders.count({
    where: {
      user_id: userId,
      created_at: {
        gte: new Date(Date.now() - 10 * 60 * 1000), // آخر 10 دقائق
      },
    },
  });

  if (recentOrders >= 5) {
    flags.push('RAPID_ORDERING');
    riskLevel = 'HIGH';
    requiresReview = true;
  }

  const risk: TransactionRisk = {
    riskLevel,
    shouldBlock,
    reason: flags.length > 0 ? flags.join(', ') : 'No risk detected',
    flags,
  };

  return {
    allowed: !shouldBlock,
    risk,
    requiresReview,
  };
}

/**
 * حظر مستخدم بسبب نشاط مشبوه
 */
export async function blockUser(userId: string, reason: string): Promise<void> {
  await prisma.users.update({
    where: { id: userId },
    data: {
      role: 'BLOCKED',
      // يمكن إضافة حقل notes أو audit_log هنا
    },
  });

  // تسجيل في coordinator_logs
  await prisma.coordinator_logs.create({
    data: {
      action_type: 'USER_BLOCKED',
      status: 'SUCCESS',
      details: JSON.stringify({
        userId,
        reason,
        blockedAt: new Date().toISOString(),
      }),
    },
  });
}

/**
 * تسجيل محاولة معاملة مشبوهة
 */
export async function logSuspiciousTransaction(
  userId: string,
  amount: number,
  risk: TransactionRisk,
  ip?: string
): Promise<void> {
  await prisma.coordinator_logs.create({
    data: {
      action_type: 'FRAUD_CHECK',
      status: risk.shouldBlock ? 'FAILED' : 'SUCCESS',
      details: JSON.stringify({
        userId,
        amount,
        riskLevel: risk.riskLevel,
        flags: risk.flags,
        ip,
        checkedAt: new Date().toISOString(),
      }),
      error_message: risk.shouldBlock ? risk.reason : null,
    },
  });
}

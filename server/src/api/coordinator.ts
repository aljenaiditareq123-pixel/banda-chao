import express, { Request, Response } from 'express';
import {
  syncContentToPlatforms,
  queueContentSync,
  getSyncStatus,
  getUserSocialAccounts,
  upsertSocialAccount,
  ContentSyncRequest,
} from '../services/coordinatorService';
import { authenticateToken, requireRole } from '../middleware/auth';
import { interactionRateLimiter } from '../middleware/rateLimit';

const router = express.Router();

/**
 * POST /api/v1/coordinator/sync-content
 * مزامنة المحتوى (فيديو أو منشور) مع المنصات الخارجية
 * يستخدم الطابور (Queue) لحماية قاعدة البيانات من الضغط العالي
 * 
 * Body:
 * {
 *   "contentId": "video-id-123",
 *   "contentType": "VIDEO" | "POST",
 *   "platforms": ["TIKTOK", "YOUTUBE"],
 *   "useQueue": true (optional, default: true)
 * }
 */
router.post(
  '/sync-content',
  authenticateToken,
  interactionRateLimiter,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { contentId, contentType, platforms, useQueue = true } = req.body;

      if (!contentId || !contentType || !platforms || !Array.isArray(platforms)) {
        return res.status(400).json({
          error: 'Missing required fields: contentId, contentType, platforms',
        });
      }

      if (!['VIDEO', 'POST'].includes(contentType)) {
        return res.status(400).json({
          error: 'contentType must be either VIDEO or POST',
        });
      }

      const request: ContentSyncRequest = {
        contentId,
        contentType,
        platforms,
        userId,
      };

      if (useQueue) {
        // استخدام الطابور (Queue) - آمن للضغط العالي
        const jobId = await queueContentSync(request);
        res.json({
          success: true,
          jobId,
          message: 'Content sync queued successfully',
          note: 'Sync will be processed in the background',
        });
      } else {
        // معالجة مباشرة (للاستخدام في الاختبار فقط)
        const results = await syncContentToPlatforms(request);
        res.json({
          success: true,
          results,
          message: 'Content sync completed',
        });
      }
    } catch (error: any) {
      console.error('Error syncing content:', error);
      res.status(500).json({
        error: 'Failed to sync content',
        message: error.message,
      });
    }
  }
);

/**
 * GET /api/v1/coordinator/sync-status/:contentId
 * الحصول على حالة المزامنة للمحتوى
 * 
 * Query params:
 * - contentType: "VIDEO" | "POST"
 */
router.get(
  '/sync-status/:contentId',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { contentId } = req.params;
      const contentType = req.query.contentType as 'VIDEO' | 'POST';

      if (!contentType || !['VIDEO', 'POST'].includes(contentType)) {
        return res.status(400).json({
          error: 'contentType query parameter is required and must be VIDEO or POST',
        });
      }

      const status = await getSyncStatus(contentId, contentType);

      res.json({
        success: true,
        contentId,
        contentType,
        syncStatus: status,
      });
    } catch (error: any) {
      console.error('Error getting sync status:', error);
      res.status(500).json({
        error: 'Failed to get sync status',
        message: error.message,
      });
    }
  }
);

/**
 * GET /api/v1/coordinator/social-accounts
 * الحصول على حسابات المنصات الاجتماعية للمستخدم
 */
router.get(
  '/social-accounts',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const accounts = await getUserSocialAccounts(userId);

      res.json({
        success: true,
        accounts,
      });
    } catch (error: any) {
      console.error('Error getting social accounts:', error);
      res.status(500).json({
        error: 'Failed to get social accounts',
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/v1/coordinator/social-accounts
 * إضافة/تحديث حساب منصة اجتماعية
 * 
 * Body:
 * {
 *   "platform": "TIKTOK" | "YOUTUBE" | "INSTAGRAM",
 *   "accessToken": "token-here",
 *   "refreshToken": "refresh-token-here" (optional),
 *   "platformUserId": "user-id-on-platform" (optional),
 *   "metadata": {} (optional)
 * }
 */
router.post(
  '/social-accounts',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { platform, accessToken, refreshToken, platformUserId, metadata } = req.body;

      if (!platform || !accessToken) {
        return res.status(400).json({
          error: 'Missing required fields: platform, accessToken',
        });
      }

      const account = await upsertSocialAccount(
        userId,
        platform,
        accessToken,
        refreshToken,
        platformUserId,
        metadata
      );

      res.json({
        success: true,
        account: {
          id: account.id,
          platform: account.platform,
          platform_user_id: account.platform_user_id,
          is_active: account.is_active,
          created_at: account.created_at,
        },
        message: 'Social account connected successfully',
      });
    } catch (error: any) {
      console.error('Error upserting social account:', error);
      res.status(500).json({
        error: 'Failed to connect social account',
        message: error.message,
      });
    }
  }
);

/**
 * DELETE /api/v1/coordinator/social-accounts/:accountId
 * إلغاء تفعيل حساب منصة اجتماعية
 */
router.delete(
  '/social-accounts/:accountId',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { accountId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // التحقق من أن الحساب يخص المستخدم
      const { prisma } = await import('../utils/prisma');
      const account = await prisma.social_accounts.findUnique({
        where: { id: accountId },
      });

      if (!account || account.user_id !== userId) {
        return res.status(404).json({ error: 'Account not found' });
      }

      // إلغاء التفعيل بدلاً من الحذف
      await prisma.social_accounts.update({
        where: { id: accountId },
        data: { is_active: false },
      });

      res.json({
        success: true,
        message: 'Social account disconnected',
      });
    } catch (error: any) {
      console.error('Error disconnecting social account:', error);
      res.status(500).json({
        error: 'Failed to disconnect social account',
        message: error.message,
      });
    }
  }
);

export default router;

/**
 * Content Guard Middleware - الرقيب الآلي
 * 
 * هذا الـ Middleware يفحص جميع المحتوى (نصوص، صور) قبل قبوله
 */

import { Request, Response, NextFunction } from 'express';
import { moderateContent } from '../services/moderationService';

/**
 * Content Guard Middleware
 * يفحص المحتوى في body ويرفضه إذا كان غير مناسب
 */
export async function contentGuard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // استخراج النصوص والصور من body
    const textFields: string[] = [];
    const imageFields: string[] = [];

    // فحص الحقول الشائعة
    if (req.body.content) textFields.push(req.body.content);
    if (req.body.description) textFields.push(req.body.description);
    if (req.body.title) textFields.push(req.body.title);
    if (req.body.comment) textFields.push(req.body.comment);
    if (req.body.message) textFields.push(req.body.message);
    if (req.body.bio) textFields.push(req.body.bio);

    // فحص الصور
    if (req.body.image_url) imageFields.push(req.body.image_url);
    if (req.body.thumbnail_url) imageFields.push(req.body.thumbnail_url);
    if (req.body.images) {
      const images = Array.isArray(req.body.images) 
        ? req.body.images 
        : JSON.parse(req.body.images || '[]');
      imageFields.push(...images);
    }

    // دمج النصوص
    const combinedText = textFields.filter(Boolean).join(' ');

    // فحص المحتوى
    if (combinedText || imageFields.length > 0) {
      const result = await moderateContent(combinedText || undefined, imageFields.length > 0 ? imageFields : undefined);

      if (!result.allowed) {
        res.status(403).json({
          error: 'Content moderation failed',
          message: result.reason || 'Content does not meet our community guidelines',
          flagged: true,
        });
        return;
      }
    }

    // المحتوى آمن - المتابعة
    next();
  } catch (error: any) {
    console.error('Error in content guard:', error);
    // في حالة الخطأ، نرفض الطلب للأمان
    res.status(500).json({
      error: 'Content moderation error',
      message: 'Unable to verify content safety',
    });
  }
}

/**
 * Content Guard للـ Posts فقط
 */
export const postContentGuard = contentGuard;

/**
 * Content Guard للـ Comments فقط
 */
export const commentContentGuard = contentGuard;

/**
 * Content Guard للـ Videos فقط
 */
export const videoContentGuard = contentGuard;

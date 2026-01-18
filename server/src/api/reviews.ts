import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { createNotification } from '../lib/notifications';
import { randomUUID } from 'crypto';

const router = Router();

/**
 * POST /api/v1/reviews
 * Create a review for a product
 * شرط: يجب أن يكون المستخدم قد اشترى المنتج فعلاً
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        error: 'User ID not found in token',
      });
    }

    const { productId, rating, comment } = req.body;

    // Validation
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
        error: 'MISSING_PRODUCT_ID',
      });
    }

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5',
        error: 'INVALID_RATING',
      });
    }

    // Check if product exists
    const product = await prisma.products.findUnique({
      where: { id: productId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'PRODUCT_NOT_FOUND',
      });
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.reviews.findUnique({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id: productId,
        },
      },
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
        error: 'REVIEW_ALREADY_EXISTS',
      });
    }

    // Check if user has purchased this product (has order with status PAID or COMPLETED)
    const purchaseCheck = await prisma.order_items.findFirst({
      where: {
        product_id: productId,
        orders: {
          user_id: userId,
          status: {
            in: ['PAID', 'COMPLETED'],
          },
        },
      },
      include: {
        orders: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!purchaseCheck) {
      return res.status(403).json({
        success: false,
        message: 'You must purchase this product before reviewing it',
        error: 'PURCHASE_REQUIRED',
      });
    }

    // Create review
    const review = await prisma.reviews.create({
      data: {
        id: randomUUID(),
        user_id: userId,
        product_id: productId,
        rating: Math.round(rating), // Ensure integer rating
        comment: comment?.trim() || null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
            isVerified: true,
          },
        },
      },
    });

    // Calculate and update product rating and review count
    const allReviews = await prisma.reviews.findMany({
      where: { product_id: productId },
      select: { rating: true },
    });

    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    const reviewCount = allReviews.length;

    await prisma.products.update({
      where: { id: productId },
      data: {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        reviews_count: reviewCount,
        updated_at: new Date(),
      },
    });

    // Send notification to seller
    try {
      await createNotification({
        userId: product.user_id,
        type: 'PRODUCT_REVIEW',
        title: 'حصل منتجك على تقييم جديد',
        message: `حصل منتجك "${product.name}" على تقييم ${rating} نجوم${comment ? ' مع تعليق' : ''}`,
        data: {
          productId: productId,
          productName: product.name,
          rating: rating,
          reviewId: review.id,
        },
      }).catch((err) => {
        console.warn('[Reviews] Failed to send notification to seller (non-fatal):', err);
      });
    } catch (notificationError: any) {
      // Non-critical: Log but don't fail review creation
      console.warn('[Reviews] Error creating notification (non-fatal):', notificationError?.message);
    }

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
        user: {
          id: review.users.id,
          name: review.users.name,
          profilePicture: review.users.profile_picture,
          isVerified: review.users.isVerified,
        },
      },
    });
  } catch (error: any) {
    console.error('Error creating review:', error);
    
    // Handle unique constraint violation (user already reviewed)
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
        error: 'REVIEW_ALREADY_EXISTS',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/v1/reviews/products/:id
 * Get all reviews for a product
 */
router.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id: productId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Check if product exists
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'PRODUCT_NOT_FOUND',
      });
    }

    // Get reviews
    const [reviews, total] = await Promise.all([
      prisma.reviews.findMany({
        where: { product_id: productId },
        skip,
        take: limit,
        include: {
          users: {
            select: {
              id: true,
              name: true,
              profile_picture: true,
              isVerified: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.reviews.count({
        where: { product_id: productId },
      }),
    ]);

    // Calculate average rating
    const allRatings = reviews.map((r) => r.rating);
    const averageRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
      : 0;

    res.json({
      success: true,
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
        updatedAt: review.updated_at,
        user: {
          id: review.users.id,
          name: review.users.name,
          profilePicture: review.users.profile_picture,
          isVerified: review.users.isVerified,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: total,
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { getCache, setCache, invalidateCachePattern } from '../lib/cache';

const router = Router();

// Get all products (with pagination and filters)
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    const category = req.query.category as string;
    const makerId = req.query.makerId as string;
    const search = req.query.search as string;

    const where: any = {
      status: status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED', // Only show published by default
    };
    
    if (category) {
      where.category = category;
    }
    
    if (makerId) {
      where.makerId = makerId;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Use raw SQL to match actual schema (products table doesn't have status, maker, or images)
    let whereClause = '1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      whereClause += ` AND p.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const products = await prisma.$queryRawUnsafe<Array<any>>(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.category,
        p.image_url as "imageUrl",
        p.external_link as "externalLink",
        p.created_at as "createdAt",
        p.updated_at as "updatedAt",
        u.id as "userId",
        u.name as "userName",
        u.profile_picture as "userProfilePicture"
      FROM products p
      LEFT JOIN users u ON p."user_id" = u.id
      WHERE ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, ...params, limit, skip);

    const totalResult = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(`
      SELECT COUNT(*) as count
      FROM products p
      WHERE ${whereClause}
    `, ...params);
    const total = Number(totalResult[0]?.count || 0);

    const response = {
      products,
      pagination: {
        page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache response for 60 seconds
    const cacheKey = `products:${page}:${limit}:${category || ''}:${makerId || ''}:${search || ''}`;
    setCache(cacheKey, response, 60 * 1000);

    res.json(response);
  } catch (error: any) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const products = await prisma.$queryRawUnsafe<Array<any>>(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.category,
        p.image_url as "imageUrl",
        p.external_link as "externalLink",
        p.created_at as "createdAt",
        p.updated_at as "updatedAt",
        u.id as "userId",
        u.name as "userName",
        u.profile_picture as "userProfilePicture"
      FROM products p
      LEFT JOIN users u ON p."user_id" = u.id
      WHERE p.id = $1
    `, req.params.id);

    if (!products || products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product: products[0] });
  } catch (error: any) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get products by maker (using user_id)
router.get('/makers/:makerId', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Get maker's user_id
    const makers = await prisma.$queryRawUnsafe<Array<{ user_id: string }>>(`
      SELECT user_id FROM makers WHERE id = $1 LIMIT 1
    `, req.params.makerId);

    if (!makers || makers.length === 0) {
      return res.status(404).json({ error: 'Maker not found' });
    }

    const userId = makers[0].user_id;

    const products = await prisma.$queryRawUnsafe<Array<any>>(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.category,
        p.image_url as "imageUrl",
        p.external_link as "externalLink",
        p.created_at as "createdAt",
        p.updated_at as "updatedAt",
        u.id as "userId",
        u.name as "userName",
        u.profile_picture as "userProfilePicture"
      FROM products p
      LEFT JOIN users u ON p."user_id" = u.id
      WHERE p."user_id" = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `, userId, limit, skip);

    res.json({ products });
  } catch (error: any) {
    console.error('Get maker products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


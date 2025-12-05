import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../utils/prisma';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { getCache, setCache, invalidateCachePattern } from '../lib/cache';
import { uploadToGCS, isGCSConfigured } from '../lib/gcs';
import { randomUUID } from 'crypto';

const router = Router();

// Configure multer for image uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Use memory storage if GCS is configured, otherwise use disk storage
const storage = isGCSConfigured()
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `product-${uniqueSuffix}${path.extname(file.originalname)}`);
      },
    });

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for product images
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  },
});

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
      SELECT "user_id" FROM makers WHERE id = $1 LIMIT 1
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
  } catch (error: unknown) {
    console.error('Get maker products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create product (authenticated, MAKER role)
router.post('/', authenticateToken, requireRole(['MAKER']), upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    // Invalidate products cache
    invalidateCachePattern('products:');

    const { name, description, price, currency, category, external_link, stock } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Product description is required' });
    }

    const priceNum = price ? parseFloat(price) : null;
    if (priceNum !== null && (isNaN(priceNum) || priceNum < 0)) {
      return res.status(400).json({ error: 'Price must be a valid positive number' });
    }

    // Handle image upload
    let imageUrl: string | null = null;
    if (req.file) {
      if (isGCSConfigured() && req.file.buffer) {
        // Upload to GCS
        imageUrl = await uploadToGCS(req.file.buffer, req.file.originalname, 'products');
      } else if (req.file.path) {
        // Fallback to local storage
        imageUrl = `/uploads/products/${path.basename(req.file.path)}`;
      }
    }

    // Create product
    const product = await prisma.products.create({
      data: {
        id: randomUUID(),
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        category: category?.trim() || null,
        image_url: imageUrl,
        external_link: external_link?.trim() || '',
        user_id: req.userId!,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      product,
      message: 'Product created successfully',
    });
  } catch (error: unknown) {
    console.error('Create product error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: errorMessage });
  }
});

// Update product (authenticated, MAKER role, owner only)
router.put('/:id', authenticateToken, requireRole(['MAKER']), upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    // Invalidate products cache
    invalidateCachePattern('products:');

    const { name, description, price, currency, category, external_link, stock } = req.body;
    const productId = req.params.id;

    // Check if product exists and belongs to the user
    const existingProduct = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (existingProduct.user_id !== req.userId) {
      return res.status(403).json({ error: 'You do not have permission to update this product' });
    }

    // Validation
    if (name !== undefined && (!name || !name.trim())) {
      return res.status(400).json({ error: 'Product name cannot be empty' });
    }

    if (description !== undefined && (!description || !description.trim())) {
      return res.status(400).json({ error: 'Product description cannot be empty' });
    }

    const priceNum = price !== undefined ? (price ? parseFloat(price) : null) : undefined;
    if (priceNum !== undefined && priceNum !== null && (isNaN(priceNum) || priceNum < 0)) {
      return res.status(400).json({ error: 'Price must be a valid positive number' });
    }

    // Handle image upload if new image provided
    let imageUrl: string | undefined = undefined;
    if (req.file) {
      if (isGCSConfigured() && req.file.buffer) {
        // Upload to GCS
        imageUrl = await uploadToGCS(req.file.buffer, req.file.originalname, 'products');
      } else if (req.file.path) {
        // Fallback to local storage
        imageUrl = `/uploads/products/${path.basename(req.file.path)}`;
      }
    }

    // Update product
    const updateData: {
      name?: string;
      description?: string;
      price?: number | null;
      category?: string | null;
      external_link?: string;
      image_url?: string | null;
      updated_at: Date;
    } = {
      updated_at: new Date(),
    };

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (priceNum !== undefined) updateData.price = priceNum;
    if (category !== undefined) updateData.category = category?.trim() || null;
    if (external_link !== undefined) updateData.external_link = external_link.trim();
    if (imageUrl !== undefined) updateData.image_url = imageUrl;

    const product = await prisma.products.update({
      where: { id: productId },
      data: updateData,
    });

    res.json({
      success: true,
      product,
      message: 'Product updated successfully',
    });
  } catch (error: unknown) {
    console.error('Update product error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: errorMessage });
  }
});

// Delete product (authenticated, MAKER role, owner only)
router.delete('/:id', authenticateToken, requireRole(['MAKER']), async (req: AuthRequest, res: Response) => {
  try {
    // Invalidate products cache
    invalidateCachePattern('products:');

    const productId = req.params.id;

    // Check if product exists and belongs to the user
    const existingProduct = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
    }

    if (existingProduct.user_id !== req.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'You do not have permission to delete this product' 
      });
    }

    // Delete product (hard delete)
    await prisma.products.delete({
      where: { id: productId },
    });

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Delete product error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ 
      success: false,
      error: errorMessage 
    });
  }
});

export default router;


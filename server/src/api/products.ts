import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../utils/prisma';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { getCache, setCache, invalidateCachePattern } from '../lib/cache';
import { uploadToGCS, isGCSConfigured } from '../lib/gcs';
import { randomUUID } from 'crypto';
import { storeProductEmbedding } from '../services/productVectorService';

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
    const search_term = req.query.search_term as string; // Alternative search parameter
    const category_id = req.query.category_id as string; // Alternative category parameter
    const min_price = req.query.min_price as string; // Minimum price filter
    const max_price = req.query.max_price as string; // Maximum price filter
    const minPrice = req.query.minPrice as string; // Alternative camelCase parameter
    const maxPrice = req.query.maxPrice as string; // Alternative camelCase parameter
    const onlyVerified = req.query.onlyVerified === 'true' || req.query.onlyVerified === true; // Filter by verified sellers only
    const sortBy = req.query.sortBy as string; // Sort by: newest, price_asc, price_desc
    const sort_by = (req.query.sort_by as string) || (sortBy === 'newest' ? 'created_at' : sortBy === 'price_asc' ? 'price' : sortBy === 'price_desc' ? 'price' : 'created_at');
    const sort_order = (req.query.sort_order as string) || (sortBy === 'price_asc' ? 'asc' : sortBy === 'price_desc' ? 'desc' : 'desc');

    // Use the search_term if provided, otherwise fall back to search
    const searchQuery = search_term || search;

    // Use raw SQL to match actual schema (products table doesn't have status, maker, or images)
    let whereClause = '1=1';
    const params: any[] = [];
    let paramIndex = 1;

    // Filter by category (support both category and category_id)
    const categoryFilter = category_id || category;
    if (categoryFilter) {
      whereClause += ` AND p.category_string = $${paramIndex}`;
      params.push(categoryFilter);
      paramIndex++;
    }

    // Filter by search term (search in name and description)
    if (searchQuery) {
      whereClause += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${searchQuery}%`);
      paramIndex++;
    }

    // Filter by price range (support both snake_case and camelCase)
    const minPriceFilter = minPrice || min_price;
    const maxPriceFilter = maxPrice || max_price;
    
    if (minPriceFilter) {
      const minPriceNum = parseFloat(minPriceFilter);
      if (!isNaN(minPriceNum)) {
        whereClause += ` AND p.price >= $${paramIndex}`;
        params.push(minPriceNum);
        paramIndex++;
      }
    }

    if (maxPriceFilter) {
      const maxPriceNum = parseFloat(maxPriceFilter);
      if (!isNaN(maxPriceNum)) {
        whereClause += ` AND p.price <= $${paramIndex}`;
        params.push(maxPriceNum);
        paramIndex++;
      }
    }

    // Filter by verified sellers only
    if (onlyVerified) {
      whereClause += ` AND u."isVerified" = $${paramIndex}`;
      params.push(true);
      paramIndex++;
    }

    // Filter by makerId
    if (makerId) {
      whereClause += ` AND p."user_id" = $${paramIndex}`;
      params.push(makerId);
      paramIndex++;
    }

    // Build ORDER BY clause
    let orderByClause = 'p.created_at DESC';
    const validSortFields: Record<string, string> = {
      'created_at': 'p.created_at',
      'createdAt': 'p.created_at',
      'price': 'p.price',
      'name': 'p.name',
    };
    const validSortOrders = ['asc', 'desc', 'ASC', 'DESC'];
    
    if (sort_by && validSortFields[sort_by]) {
      const sortField = validSortFields[sort_by];
      const sortOrder = validSortOrders.includes(sort_order) ? sort_order.toUpperCase() : 'DESC';
      orderByClause = `${sortField} ${sortOrder}`;
    }

    // NOTE: Using $queryRawUnsafe with parameterized queries is safe from SQL injection
    // Parameters are passed separately, not interpolated into the query string
    const products = await prisma.$queryRawUnsafe<Array<any>>(`
      SELECT 
        p.id,
        p.name,
        p.name_ar,
        p.description,
        p.description_ar,
        p.price,
        p.category_string as category,
        p.image_url as "imageUrl",
        p.external_link as "externalLink",
        p.created_at as "createdAt",
        p.updated_at as "updatedAt",
        p.is_pre_order as "isPreOrder",
        p.target_quantity as "targetQuantity",
        p.current_orders as "currentOrders",
        p.campaign_end_date as "campaignEndDate",
        p.manufacture_status as "manufactureStatus",
        u.id as "userId",
        u.name as "userName",
        u.profile_picture as "userProfilePicture",
        u."isVerified" as "userIsVerified"
      FROM products p
      LEFT JOIN users u ON p."user_id" = u.id
      WHERE ${whereClause}
      ORDER BY ${orderByClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, ...params, limit, skip);

    // NOTE: Safe parameterized query (include JOIN for onlyVerified filter)
    const totalResult = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(`
      SELECT COUNT(*) as count
      FROM products p
      LEFT JOIN users u ON p."user_id" = u.id
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

    // Cache response for 60 seconds (include all filter params in cache key)
    const cacheKey = `products:${page}:${limit}:${categoryFilter || ''}:${makerId || ''}:${searchQuery || ''}:${min_price || ''}:${max_price || ''}:${sort_by}:${sort_order}`;
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
    // NOTE: Using $queryRawUnsafe with parameterized queries is safe from SQL injection
    // Parameters are passed separately, not interpolated into the query string
    const products = await prisma.$queryRawUnsafe<Array<any>>(`
      SELECT 
        p.id,
        p.name,
        p.name_ar,
        p.description,
        p.description_ar,
        p.price,
        p.category_string as category,
        p.image_url as "imageUrl",
        p.external_link as "externalLink",
        p.created_at as "createdAt",
        p.updated_at as "updatedAt",
        p.is_pre_order as "isPreOrder",
        p.target_quantity as "targetQuantity",
        p.current_orders as "currentOrders",
        p.campaign_end_date as "campaignEndDate",
        p.manufacture_status as "manufactureStatus",
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
    // NOTE: Safe parameterized query
    const makers = await prisma.$queryRawUnsafe<Array<{ user_id: string }>>(`
      SELECT "user_id" FROM makers WHERE id = $1 LIMIT 1
    `, req.params.makerId);

    if (!makers || makers.length === 0) {
      return res.status(404).json({ error: 'Maker not found' });
    }

    const userId = makers[0].user_id;

    // NOTE: Using $queryRawUnsafe with parameterized queries is safe from SQL injection
    // Parameters are passed separately, not interpolated into the query string
    const products = await prisma.$queryRawUnsafe<Array<any>>(`
      SELECT 
        p.id,
        p.name,
        p.name_ar,
        p.description,
        p.description_ar,
        p.price,
        p.category_string as category,
        p.image_url as "imageUrl",
        p.external_link as "externalLink",
        p.created_at as "createdAt",
        p.updated_at as "updatedAt",
        p.is_pre_order as "isPreOrder",
        p.target_quantity as "targetQuantity",
        p.current_orders as "currentOrders",
        p.campaign_end_date as "campaignEndDate",
        p.manufacture_status as "manufactureStatus",
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

    const { name, description, price, currency, category, external_link, stock, isPreOrder, targetQuantity, campaignEndDate, manufactureStatus } = req.body;

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

    // Parse C2M fields
    const isPreOrderBool = isPreOrder === 'true' || isPreOrder === true;
    const targetQuantityNum = targetQuantity ? parseInt(targetQuantity as string) : null;
    const campaignEndDateValue = campaignEndDate ? new Date(campaignEndDate as string) : null;
    const manufactureStatusValue = manufactureStatus?.trim() || 'PENDING';

    // Create product
    const productId = randomUUID();
    const product = await prisma.products.create({
      data: {
        id: productId,
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        category_string: category?.trim() || null,
        image_url: imageUrl,
        external_link: external_link?.trim() || '',
        user_id: req.userId!,
        // C2M fields
        is_pre_order: isPreOrderBool,
        target_quantity: targetQuantityNum,
        current_orders: 0, // Initialize to 0
        campaign_end_date: campaignEndDateValue,
        manufacture_status: manufactureStatusValue,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Generate and store embedding for semantic search (async, non-blocking)
    storeProductEmbedding(
      productId,
      name.trim(),
      description.trim(),
      category?.trim() || undefined
    ).catch(error => {
      console.error('[Products API] Failed to generate embedding for new product:', error);
      // Don't fail the request if embedding generation fails
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

    const { name, description, price, currency, category, external_link, stock, isPreOrder, targetQuantity, campaignEndDate, manufactureStatus } = req.body;
    const productId = req.params.id;

    // Check if product exists and belongs to the user
    const existingProduct = await prisma.products.findUnique({
      where: { id: productId },
      select: {
        id: true,
        user_id: true,
        name: true,
      },
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

    // Parse C2M fields
    let isPreOrderBool: boolean | undefined;
    if (isPreOrder !== undefined) {
      isPreOrderBool = isPreOrder === 'true' || isPreOrder === true;
    }
    
    let targetQuantityNum: number | null | undefined;
    if (targetQuantity !== undefined) {
      targetQuantityNum = targetQuantity ? parseInt(targetQuantity as string) : null;
    }

    let campaignEndDateValue: Date | null | undefined;
    if (campaignEndDate !== undefined) {
      campaignEndDateValue = campaignEndDate ? new Date(campaignEndDate as string) : null;
    }

    // Update product
    const updateData: {
      name?: string;
      description?: string;
      price?: number | null;
      category_string?: string | null;
      external_link?: string;
      image_url?: string | null;
      is_pre_order?: boolean;
      target_quantity?: number | null;
      campaign_end_date?: Date | null;
      manufacture_status?: string;
      updated_at: Date;
    } = {
      updated_at: new Date(),
    };

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (priceNum !== undefined) updateData.price = priceNum;
    if (category !== undefined) updateData.category_string = category?.trim() || null;
    if (external_link !== undefined) updateData.external_link = external_link.trim();
    if (imageUrl !== undefined) updateData.image_url = imageUrl;
    // C2M fields
    if (isPreOrder !== undefined) updateData.is_pre_order = isPreOrderBool;
    if (targetQuantity !== undefined) updateData.target_quantity = targetQuantityNum;
    if (campaignEndDate !== undefined) updateData.campaign_end_date = campaignEndDateValue;
    if (manufactureStatus !== undefined) updateData.manufacture_status = manufactureStatus.trim();

    const product = await prisma.products.update({
      where: { id: productId },
      data: updateData,
    });

    // Update embedding if name, description, or category changed
    const shouldUpdateEmbedding = name !== undefined || description !== undefined || category !== undefined;
    if (shouldUpdateEmbedding) {
      const finalName = name !== undefined ? name.trim() : existingProduct.name;
      let finalDescription = description !== undefined ? description.trim() : '';
      const finalCategory = category !== undefined ? (category?.trim() || undefined) : undefined;
      
      // Get full product to get description if not provided
      if (description === undefined) {
        const fullProduct = await prisma.products.findUnique({
          where: { id: productId },
          select: { description: true },
        });
        if (fullProduct) {
          finalDescription = fullProduct.description;
        }
      }

      storeProductEmbedding(
        productId,
        finalName,
        finalDescription,
        finalCategory
      ).catch(error => {
        console.error('[Products API] Failed to update embedding for product:', error);
        // Don't fail the request if embedding generation fails
      });
    }

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

// Delete product (authenticated, MAKER or ADMIN role, owner only for MAKER, all products for ADMIN)
router.delete('/:id', authenticateToken, requireRole(['MAKER', 'ADMIN', 'FOUNDER']), async (req: AuthRequest, res: Response) => {
  try {
    // Invalidate products cache
    invalidateCachePattern('products:');

    const productId = req.params.id;

    // Check if product exists and belongs to the user
    const existingProduct = await prisma.products.findUnique({
      where: { id: productId },
      select: {
        id: true,
        user_id: true,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
    }

    // ADMIN and FOUNDER can delete any product, MAKER can only delete their own products
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'FOUNDER' && existingProduct.user_id !== req.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'You do not have permission to delete this product' 
      });
    }

    // Delete product (hard delete)
    await prisma.products.delete({
      where: { id: productId },
    });

    // Delete embedding for the product
    const { deleteProductEmbedding } = await import('../services/productVectorService');
    deleteProductEmbedding(productId).catch(error => {
      console.error('[Products API] Failed to delete embedding for product:', error);
      // Don't fail the request if embedding deletion fails
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


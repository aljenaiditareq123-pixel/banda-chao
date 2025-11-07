import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = Router();

// Get all products
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const where = category ? { category: category as string } : {};

    const products = await prisma.product.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Return consistent format with videos API
    res.json({
      data: products,
      total: products.length
    });
  } catch (error: any) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products', message: error.message });
  }
});

// Create a new product
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, imageUrl, externalLink, price, category } = req.body;

    if (!name || !description || !externalLink) {
      return res.status(400).json({ error: 'Name, description, and external link are required' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        imageUrl,
        externalLink,
        price: price ? parseFloat(price) : null,
        category: category || null,
        userId: req.userId!
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Product created successfully',
      data: product
    });
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product', message: error.message });
  }
});

// Get a single product
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error: any) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product', message: error.message });
  }
});

// Update a product
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl, externalLink, price, category } = req.body;

    // Verify ownership
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (existingProduct.userId !== req.userId) {
      return res.status(403).json({ error: 'You can only update your own products' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(externalLink && { externalLink }),
        ...(price !== undefined && { price: price ? parseFloat(price) : null }),
        ...(category !== undefined && { category: category || null })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        }
      }
    });

    res.json({
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error: any) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product', message: error.message });
  }
});

// Delete a product
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (existingProduct.userId !== req.userId) {
      return res.status(403).json({ error: 'You can only delete your own products' });
    }

    await prisma.product.delete({
      where: { id }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product', message: error.message });
  }
});

export default router;


import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';

const router = Router();

// Search across videos, products, and users
router.get('/', async (req: Request, res: Response) => {
  try {
    const { q, type } = req.query;
    const query = (q as string)?.trim();

    if (!query || query.length < 2) {
      return res.json({
        videos: [],
        products: [],
        users: []
      });
    }

    const searchTerm = `%${query}%`;

    // Search videos
    const videos = type === 'videos' || !type
      ? await prisma.video.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } }
            ]
          },
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
          },
          take: 20
        })
      : [];

    // Search products
    const products = type === 'products' || !type
      ? await prisma.product.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } }
            ]
          },
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
          },
          take: 20
        })
      : [];

    // Search users
    const users = type === 'users' || !type
      ? await prisma.user.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } }
            ]
          },
          select: {
            id: true,
            email: true,
            name: true,
            profilePicture: true,
            createdAt: true
          },
          take: 20
        })
      : [];

    res.json({
      query,
      videos,
      products,
      users,
      counts: {
        videos: videos.length,
        products: products.length,
        users: users.length
      }
    });
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to perform search', message: error.message });
  }
});

export default router;



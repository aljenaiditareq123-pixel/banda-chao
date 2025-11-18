import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = Router();

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Helper function to ensure unique slug
async function ensureUniqueSlug(baseSlug: string, excludeMakerId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.maker.findUnique({
      where: { slug },
    });

    if (!existing || (excludeMakerId && existing.id === excludeMakerId)) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * GET /api/v1/makers
 * Get list of makers with optional filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, location } = req.query;

    const where: any = {};

    // Search by name or slug
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Note: location filtering can be added if location field exists in Maker model
    // For now, we'll skip it as it's not in the current schema

    const makers = await prisma.maker.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format response to include essential maker info + user info
    const formattedMakers = makers.map((maker) => ({
      id: maker.id,
      slug: maker.slug,
      name: maker.name,
      bio: maker.bio,
      story: maker.story,
      profilePictureUrl: maker.profilePictureUrl,
      coverPictureUrl: maker.coverPictureUrl,
      createdAt: maker.createdAt,
      updatedAt: maker.updatedAt,
      user: {
        id: maker.user.id,
        name: maker.user.name,
        email: maker.user.email,
        profilePicture: maker.user.profilePicture,
        createdAt: maker.user.createdAt,
      },
    }));

    res.json({
      data: formattedMakers,
      total: formattedMakers.length,
    });
  } catch (error: any) {
    console.error('[Makers API] Get makers error:', error);
    res.status(500).json({
      error: 'Failed to fetch makers',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/makers/:id
 * Get maker details by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const maker = await prisma.maker.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            createdAt: true,
          },
        },
      },
    });

    if (!maker) {
      return res.status(404).json({ error: 'Maker not found' });
    }

    // Format response
    const formattedMaker = {
      id: maker.id,
      slug: maker.slug,
      name: maker.name,
      bio: maker.bio,
      story: maker.story,
      profilePictureUrl: maker.profilePictureUrl,
      coverPictureUrl: maker.coverPictureUrl,
      createdAt: maker.createdAt,
      updatedAt: maker.updatedAt,
      user: {
        id: maker.user.id,
        name: maker.user.name,
        email: maker.user.email,
        profilePicture: maker.user.profilePicture,
        createdAt: maker.user.createdAt,
      },
    };

    res.json({
      data: formattedMaker,
    });
  } catch (error: any) {
    console.error('[Makers API] Get maker error:', error);
    res.status(500).json({
      error: 'Failed to fetch maker',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/makers/slug/:slug
 * Get maker details by slug
 */
router.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const maker = await prisma.maker.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            createdAt: true,
          },
        },
      },
    });

    if (!maker) {
      return res.status(404).json({ error: 'Maker not found' });
    }

    // Format response
    const formattedMaker = {
      id: maker.id,
      slug: maker.slug,
      name: maker.name,
      bio: maker.bio,
      story: maker.story,
      profilePictureUrl: maker.profilePictureUrl,
      coverPictureUrl: maker.coverPictureUrl,
      createdAt: maker.createdAt,
      updatedAt: maker.updatedAt,
      user: {
        id: maker.user.id,
        name: maker.user.name,
        email: maker.user.email,
        profilePicture: maker.user.profilePicture,
        createdAt: maker.user.createdAt,
      },
    };

    res.json({
      data: formattedMaker,
    });
  } catch (error: any) {
    console.error('[Makers API] Get maker by slug error:', error);
    res.status(500).json({
      error: 'Failed to fetch maker',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/makers/me
 * Get current user's maker profile (if exists)
 */
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const maker = await prisma.maker.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            createdAt: true,
          },
        },
      },
    });

    if (!maker) {
      return res.json({
        maker: null,
        canBecomeMaker: true,
      });
    }

    // Format response
    const formattedMaker = {
      id: maker.id,
      slug: maker.slug,
      name: maker.name,
      bio: maker.bio,
      story: maker.story,
      profilePictureUrl: maker.profilePictureUrl,
      coverPictureUrl: maker.coverPictureUrl,
      createdAt: maker.createdAt,
      updatedAt: maker.updatedAt,
      user: {
        id: maker.user.id,
        name: maker.user.name,
        email: maker.user.email,
        profilePicture: maker.user.profilePicture,
        createdAt: maker.user.createdAt,
      },
    };

    res.json({
      maker: formattedMaker,
      canBecomeMaker: false,
    });
  } catch (error: any) {
    console.error('[Makers API] Get my maker error:', error);
    res.status(500).json({
      error: 'Failed to fetch maker profile',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/makers
 * Create a new maker profile for the current user
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, slug, bio, story, profilePictureUrl, coverPictureUrl } = req.body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Name is required',
      });
    }

    // Check if user already has a maker
    const existingMaker = await prisma.maker.findUnique({
      where: { userId },
    });

    if (existingMaker) {
      return res.status(400).json({
        error: 'Maker already exists for this user',
      });
    }

    // Generate slug if not provided
    let finalSlug: string;
    if (slug && typeof slug === 'string' && slug.trim().length > 0) {
      finalSlug = generateSlug(slug);
    } else {
      finalSlug = generateSlug(name);
    }

    // Ensure slug is unique
    finalSlug = await ensureUniqueSlug(finalSlug);

    // Create maker
    const maker = await prisma.maker.create({
      data: {
        userId,
        slug: finalSlug,
        name: name.trim(),
        bio: bio?.trim() || null,
        story: story?.trim() || null,
        profilePictureUrl: profilePictureUrl?.trim() || null,
        coverPictureUrl: coverPictureUrl?.trim() || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            createdAt: true,
          },
        },
      },
    });

    // Format response
    const formattedMaker = {
      id: maker.id,
      slug: maker.slug,
      name: maker.name,
      bio: maker.bio,
      story: maker.story,
      profilePictureUrl: maker.profilePictureUrl,
      coverPictureUrl: maker.coverPictureUrl,
      createdAt: maker.createdAt,
      updatedAt: maker.updatedAt,
      user: {
        id: maker.user.id,
        name: maker.user.name,
        email: maker.user.email,
        profilePicture: maker.user.profilePicture,
        createdAt: maker.user.createdAt,
      },
    };

    res.status(201).json({
      maker: formattedMaker,
      canBecomeMaker: false,
    });
  } catch (error: any) {
    console.error('[Makers API] Create maker error:', error);
    res.status(500).json({
      error: 'Failed to create maker profile',
      message: error.message,
    });
  }
});

/**
 * PUT /api/v1/makers/me
 * Update current user's maker profile
 */
router.put('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, slug, bio, story, profilePictureUrl, coverPictureUrl } = req.body;

    // Find existing maker
    const existingMaker = await prisma.maker.findUnique({
      where: { userId },
    });

    if (!existingMaker) {
      return res.status(404).json({
        error: 'Maker not found for this user',
      });
    }

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          error: 'Name must be a non-empty string',
        });
      }
      updateData.name = name.trim();
    }

    if (slug !== undefined) {
      if (typeof slug !== 'string' || slug.trim().length === 0) {
        return res.status(400).json({
          error: 'Slug must be a non-empty string',
        });
      }
      const generatedSlug = generateSlug(slug);
      updateData.slug = await ensureUniqueSlug(generatedSlug, existingMaker.id);
    } else if (name !== undefined) {
      // If name changed but slug didn't, regenerate slug from new name
      const generatedSlug = generateSlug(updateData.name);
      updateData.slug = await ensureUniqueSlug(generatedSlug, existingMaker.id);
    }

    if (bio !== undefined) {
      updateData.bio = bio?.trim() || null;
    }

    if (story !== undefined) {
      updateData.story = story?.trim() || null;
    }

    if (profilePictureUrl !== undefined) {
      updateData.profilePictureUrl = profilePictureUrl?.trim() || null;
    }

    if (coverPictureUrl !== undefined) {
      updateData.coverPictureUrl = coverPictureUrl?.trim() || null;
    }

    // Update maker
    const updatedMaker = await prisma.maker.update({
      where: { userId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            createdAt: true,
          },
        },
      },
    });

    // Format response
    const formattedMaker = {
      id: updatedMaker.id,
      slug: updatedMaker.slug,
      name: updatedMaker.name,
      bio: updatedMaker.bio,
      story: updatedMaker.story,
      profilePictureUrl: updatedMaker.profilePictureUrl,
      coverPictureUrl: updatedMaker.coverPictureUrl,
      createdAt: updatedMaker.createdAt,
      updatedAt: updatedMaker.updatedAt,
      user: {
        id: updatedMaker.user.id,
        name: updatedMaker.user.name,
        email: updatedMaker.user.email,
        profilePicture: updatedMaker.user.profilePicture,
        createdAt: updatedMaker.user.createdAt,
      },
    };

    res.json({
      maker: formattedMaker,
    });
  } catch (error: any) {
    console.error('[Makers API] Update maker error:', error);
    res.status(500).json({
      error: 'Failed to update maker profile',
      message: error.message,
    });
  }
});

export default router;


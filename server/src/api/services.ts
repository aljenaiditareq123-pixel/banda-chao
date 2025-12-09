import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { randomUUID } from 'crypto';

const router = Router();

// Get all services for the logged-in maker
router.get('/', authenticateToken, requireRole(['MAKER']), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Find maker by user_id
    const maker = await prisma.makers.findUnique({
      where: { user_id: userId },
      select: { id: true },
    });

    if (!maker) {
      return res.status(404).json({
        success: false,
        message: 'Maker profile not found',
      });
    }

    // Get all services for this maker
    const services = await prisma.services.findMany({
      where: {
        maker_id: maker.id,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    res.json({
      success: true,
      services,
    });
  } catch (error: any) {
    console.error('[Services] Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Create a new service
router.post('/', authenticateToken, requireRole(['MAKER']), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { title, description, price, type } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
        code: 'MISSING_TITLE',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Description is required',
        code: 'MISSING_DESCRIPTION',
      });
    }

    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid price is required',
        code: 'INVALID_PRICE',
      });
    }

    if (!type || !['DRIVER', 'AGENT', 'ARTISAN'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be DRIVER, AGENT, or ARTISAN',
        code: 'INVALID_TYPE',
      });
    }

    // Find maker by user_id
    const maker = await prisma.makers.findUnique({
      where: { user_id: userId },
      select: { id: true },
    });

    if (!maker) {
      return res.status(404).json({
        success: false,
        message: 'Maker profile not found',
      });
    }

    // Create service
    const serviceId = randomUUID();
    const service = await prisma.services.create({
      data: {
        id: serviceId,
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        type: type as 'DRIVER' | 'AGENT' | 'ARTISAN',
        maker_id: maker.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      service,
      message: 'Service created successfully',
    });
  } catch (error: any) {
    console.error('[Services] Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Update a service
router.put('/:id', authenticateToken, requireRole(['MAKER']), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const serviceId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Find maker by user_id
    const maker = await prisma.makers.findUnique({
      where: { user_id: userId },
      select: { id: true },
    });

    if (!maker) {
      return res.status(404).json({
        success: false,
        message: 'Maker profile not found',
      });
    }

    // Check if service exists and belongs to this maker
    const existingService = await prisma.services.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    if (existingService.maker_id !== maker.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this service',
      });
    }

    const { title, description, price, type } = req.body;

    // Build update data (only include provided fields)
    const updateData: any = {
      updated_at: new Date(),
    };

    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title cannot be empty',
        });
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      if (!description || !description.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Description cannot be empty',
        });
      }
      updateData.description = description.trim();
    }

    if (price !== undefined) {
      if (isNaN(Number(price)) || Number(price) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid price is required',
        });
      }
      updateData.price = Number(price);
    }

    if (type !== undefined) {
      if (!['DRIVER', 'AGENT', 'ARTISAN'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be DRIVER, AGENT, or ARTISAN',
        });
      }
      updateData.type = type;
    }

    // Update service
    const updatedService = await prisma.services.update({
      where: { id: serviceId },
      data: updateData,
    });

    res.json({
      success: true,
      service: updatedService,
      message: 'Service updated successfully',
    });
  } catch (error: any) {
    console.error('[Services] Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Delete a service
router.delete('/:id', authenticateToken, requireRole(['MAKER']), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const serviceId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Find maker by user_id
    const maker = await prisma.makers.findUnique({
      where: { user_id: userId },
      select: { id: true },
    });

    if (!maker) {
      return res.status(404).json({
        success: false,
        message: 'Maker profile not found',
      });
    }

    // Check if service exists and belongs to this maker
    const existingService = await prisma.services.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    if (existingService.maker_id !== maker.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this service',
      });
    }

    // Delete service
    await prisma.services.delete({
      where: { id: serviceId },
    });

    res.json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error: any) {
    console.error('[Services] Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

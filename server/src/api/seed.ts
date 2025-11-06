import { Router, Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);
const router = Router();

// Secret key for authentication (should be set in environment variables)
const SEED_SECRET = process.env.SEED_SECRET || 'change-this-secret-key-in-production';

/**
 * POST /api/v1/seed
 * Run database seed script remotely
 * 
 * Body: { secret: string }
 */
router.post('/seed', async (req: Request, res: Response) => {
  try {
    // Check if secret is provided
    const { secret } = req.body;

    if (!secret) {
      return res.status(400).json({
        success: false,
        error: 'Secret key is required',
      });
    }

    // Verify secret
    if (secret !== SEED_SECRET) {
      return res.status(401).json({
        success: false,
        error: 'Invalid secret key',
      });
    }

    // Get the path to seed file
    const seedPath = path.join(__dirname, '../../prisma/seed.ts');
    
    // Run seed command
    console.log('🌱 Starting database seed...');
    
    const { stdout, stderr } = await execAsync(
      `npx ts-node ${seedPath}`,
      {
        cwd: path.join(__dirname, '../..'),
        env: {
          ...process.env,
          NODE_ENV: process.env.NODE_ENV || 'production',
        },
      }
    );

    if (stderr && !stderr.includes('Warning')) {
      console.error('Seed error:', stderr);
      return res.status(500).json({
        success: false,
        error: 'Seed execution failed',
        details: stderr,
      });
    }

    console.log('✅ Seed completed successfully');
    console.log(stdout);

    return res.status(200).json({
      success: true,
      message: 'Database seed completed successfully',
      output: stdout,
    });
  } catch (error: any) {
    console.error('❌ Seed error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to run seed',
      details: error.message,
    });
  }
});

export default router;


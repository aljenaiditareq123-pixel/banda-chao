import { Router, Request, Response } from 'express';
import { maintenanceLogger } from '../lib/maintenance-logger';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * The Reporter: Maintenance Logs API
 * Allows viewing maintenance logs (for founder/admin)
 */

// Get maintenance logs summary
router.get('/summary', authenticateToken, requireRole(['FOUNDER', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const summary = maintenanceLogger.getWeeklySummary();
    res.json({
      success: true,
      summary,
    });
  } catch (error: any) {
    console.error('Error fetching maintenance summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance summary',
    });
  }
});

// Get logs by action
router.get('/logs', authenticateToken, requireRole(['FOUNDER', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const action = req.query.action as string;
    const limit = parseInt(req.query.limit as string) || 100;
    const logs = maintenanceLogger.getLogs(action, limit);
    res.json({
      success: true,
      logs,
      count: logs.length,
    });
  } catch (error: any) {
    console.error('Error fetching maintenance logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance logs',
    });
  }
});

// Receive log from frontend (for critical errors)
router.post('/log', async (req: Request, res: Response) => {
  try {
    const { action, timestamp, data, severity } = req.body;
    maintenanceLogger.log(action, data, severity || 'info');
    res.json({
      success: true,
      message: 'Log received',
    });
  } catch (error: any) {
    console.error('Error receiving log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to receive log',
    });
  }
});

export default router;




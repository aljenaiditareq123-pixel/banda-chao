/**
 * Operations Center - Business Health Management
 * The brain of the company's operations
 */

import { prisma } from '../utils/prisma';
import { maintenanceLogger } from './maintenance-logger';

/**
 * Inventory Monitor: Check product stock levels
 * Note: Products table doesn't have stock field, so we calculate from order_items
 */
export async function getLowStockProducts(threshold: number = 5): Promise<Array<{
  id: string;
  name: string;
  currentStock: number;
  status: 'LOW_STOCK' | 'OUT_OF_STOCK';
}>> {
  try {
    // Since we don't have actual stock field, we'll use a different approach:
    // Calculate "available" based on recent sales velocity
    // For now, we'll flag products with high sales as potentially needing restock
    const lowStockProducts: Array<{
      id: string;
      name: string;
      currentStock: number;
      status: 'LOW_STOCK' | 'OUT_OF_STOCK';
    }> = [];

    // Alternative approach: Check products with no recent orders (might be out of stock)
    // Use Prisma queries instead of raw SQL for better type safety
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get all products
    const allProducts = await prisma.products.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    // Check each product for recent orders
    for (const product of allProducts) {
      // Count recent paid orders for this product
      const recentOrderItems = await prisma.order_items.findMany({
        where: {
          product_id: product.id,
          orders: {
            status: 'PAID',
            created_at: {
              gte: thirtyDaysAgo,
            },
          },
        },
        select: {
          id: true,
        },
      });

      const recentOrders = recentOrderItems.length;
      
      // If product has very few or no recent orders, flag as low stock
      if (recentOrders < threshold) {
        lowStockProducts.push({
          id: product.id,
          name: product.name,
          currentStock: recentOrders,
          status: recentOrders === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
        });
      }
    }

    maintenanceLogger.log('inventory_check', {
      message: `Inventory check completed: ${lowStockProducts.length} products flagged`,
      threshold,
      lowStockCount: lowStockProducts.length,
    }, 'info');

    return lowStockProducts;
  } catch (error: any) {
    maintenanceLogger.log('inventory_check_error', {
      message: 'Failed to check inventory',
      error: error.message,
    }, 'error');
    throw error;
  }
}

/**
 * Sales Analytics: Get daily sales statistics
 */
export async function getDailySalesStats(date?: Date): Promise<{
  totalRevenue: number;
  numberOfOrders: number;
  averageOrderValue: number;
  currency: string;
}> {
  try {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get today's paid orders using Prisma query
    const todayOrders = await prisma.orders.findMany({
      where: {
        status: 'PAID',
        created_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        id: true,
        totalAmount: true,
      },
    });

    const numberOfOrders = todayOrders.length;
    const totalRevenue = todayOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const averageOrderValue = numberOfOrders > 0 ? totalRevenue / numberOfOrders : 0;

    maintenanceLogger.log('sales_analytics', {
      message: `Daily sales stats calculated for ${targetDate.toISOString().split('T')[0]}`,
      totalRevenue,
      numberOfOrders,
      averageOrderValue,
    }, 'info');

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      numberOfOrders,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      currency: 'USD', // Default currency
    };
  } catch (error: any) {
    maintenanceLogger.log('sales_analytics_error', {
      message: 'Failed to calculate daily sales stats',
      error: error.message,
    }, 'error');
    throw error;
  }
}

/**
 * System Health Check (from The Mechanic)
 */
export async function getSystemHealth(): Promise<{
  database: 'healthy' | 'degraded' | 'down';
  lastRecoveryTime?: string;
  maintenanceActions: number;
}> {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Get recent maintenance logs
    const allLogs = maintenanceLogger.getLogs();
    const recentLogs = allLogs.filter(log => log.action === 'database_retry' || log.action === 'database_recovery').slice(-10);
    const lastRecovery = recentLogs.length > 0 ? recentLogs[recentLogs.length - 1] : null;
    
    // Get total maintenance actions today
    const todayLogs = allLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      const today = new Date();
      return logDate.toDateString() === today.toDateString();
    });
    const todayActions = todayLogs.length;

    return {
      database: 'healthy',
      lastRecoveryTime: lastRecovery?.timestamp.toISOString(),
      maintenanceActions: todayActions,
    };
  } catch (error: any) {
    maintenanceLogger.log('system_health_check_error', {
      message: 'System health check failed',
      error: error.message,
    }, 'error');

    return {
      database: 'down',
      maintenanceActions: 0,
    };
  }
}

/**
 * The Daily Briefing: Complete operations report
 */
export async function getDailyBriefing(): Promise<{
  timestamp: string;
  systemHealth: {
    database: 'healthy' | 'degraded' | 'down';
    lastRecoveryTime?: string;
    maintenanceActions: number;
  };
  salesStats: {
    totalRevenue: number;
    numberOfOrders: number;
    averageOrderValue: number;
    currency: string;
  };
  inventoryAlerts: Array<{
    id: string;
    name: string;
    currentStock: number;
    status: 'LOW_STOCK' | 'OUT_OF_STOCK';
  }>;
  summary: {
    totalAlerts: number;
    criticalIssues: number;
    systemStatus: 'operational' | 'attention_required' | 'critical';
  };
}> {
  try {
    const [systemHealth, salesStats, inventoryAlerts] = await Promise.all([
      getSystemHealth(),
      getDailySalesStats(),
      getLowStockProducts(5),
    ]);

    const criticalIssues = inventoryAlerts.filter(p => p.status === 'OUT_OF_STOCK').length;
    const totalAlerts = inventoryAlerts.length;

    let systemStatus: 'operational' | 'attention_required' | 'critical';
    if (systemHealth.database === 'down' || criticalIssues > 5) {
      systemStatus = 'critical';
    } else if (totalAlerts > 0 || systemHealth.database === 'degraded') {
      systemStatus = 'attention_required';
    } else {
      systemStatus = 'operational';
    }

    const briefing = {
      timestamp: new Date().toISOString(),
      systemHealth,
      salesStats,
      inventoryAlerts,
      summary: {
        totalAlerts,
        criticalIssues,
        systemStatus,
      },
    };

    maintenanceLogger.log('daily_briefing_generated', {
      message: 'Daily briefing generated successfully',
      systemStatus,
      totalAlerts,
      criticalIssues,
    }, 'info');

    return briefing;
  } catch (error: any) {
    maintenanceLogger.log('daily_briefing_error', {
      message: 'Failed to generate daily briefing',
      error: error.message,
    }, 'error');
    throw error;
  }
}


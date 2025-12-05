/**
 * The Reporter: Silent Maintenance Logging
 * Logs all self-healing actions for weekly reports
 */

interface MaintenanceLog {
  action: string;
  timestamp: Date;
  data: Record<string, any>;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

class MaintenanceLogger {
  private logs: MaintenanceLog[] = [];
  private maxLogs = 1000; // Keep last 1000 logs

  /**
   * Log a maintenance action
   */
  log(action: string, data: Record<string, any> = {}, severity: 'info' | 'warning' | 'error' | 'critical' = 'info') {
    const logEntry: MaintenanceLog = {
      action,
      timestamp: new Date(),
      data,
      severity,
    };

    this.logs.push(logEntry);

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Silent logging - only log to console in development
    if (process.env.NODE_ENV === 'development') {
      const emoji = this.getEmoji(severity);
      console.log(`${emoji} [Maintenance] ${action}`, data);
    }
  }

  /**
   * Get logs for a specific action
   */
  getLogs(action?: string, limit: number = 100): MaintenanceLog[] {
    let filtered = this.logs;
    if (action) {
      filtered = this.logs.filter(log => log.action === action);
    }
    return filtered.slice(-limit);
  }

  /**
   * Get summary for weekly report
   */
  getWeeklySummary(): {
    totalActions: number;
    byAction: Record<string, number>;
    bySeverity: Record<string, number>;
    recentLogs: MaintenanceLog[];
  } {
    const byAction: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    this.logs.forEach(log => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;
    });

    return {
      totalActions: this.logs.length,
      byAction,
      bySeverity,
      recentLogs: this.logs.slice(-50), // Last 50 logs
    };
  }

  private getEmoji(severity: string): string {
    switch (severity) {
      case 'info': return '🔧';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'critical': return '🚨';
      default: return '📝';
    }
  }
}

export const maintenanceLogger = new MaintenanceLogger();




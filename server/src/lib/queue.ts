/**
 * Queue System - نظام الطابور (ممتص الصدمات)
 * 
 * هذا النظام يحمي قاعدة البيانات من "الانفجار الفيروسي" عبر:
 * - تجميع الطلبات (Batching)
 * - معالجة غير متزامنة (Async Processing)
 * - دعم In-Memory و Redis
 * 
 * الاستخدام:
 *   queue.add('process_interaction', { userId, postId, type: 'like' })
 */

import { EventEmitter } from 'events';

export interface QueueJob {
  id: string;
  type: string;
  data: any;
  priority?: number;
  attempts?: number;
  maxAttempts?: number;
  createdAt: Date;
  processedAt?: Date;
  failedAt?: Date;
  error?: string;
}

export interface QueueOptions {
  concurrency?: number; // عدد المهام المتزامنة
  maxRetries?: number; // عدد المحاولات
  retryDelay?: number; // تأخير إعادة المحاولة (ms)
  batchSize?: number; // حجم الدفعة
  batchInterval?: number; // الفترة بين الدفعات (ms)
}

export interface QueueAdapter {
  add(job: QueueJob): Promise<void>;
  process(handler: (job: QueueJob) => Promise<void>): void;
  getStats(): Promise<{ pending: number; processing: number; completed: number; failed: number }>;
  clear(): Promise<void>;
}

/**
 * In-Memory Queue Adapter
 * مناسب للتطوير والاختبار، يمكن استبداله بـ Redis في الإنتاج
 */
class InMemoryQueueAdapter implements QueueAdapter {
  private jobs: QueueJob[] = [];
  private processing: Set<string> = new Set();
  private completed: QueueJob[] = [];
  private failed: QueueJob[] = [];
  private handlers: Map<string, (job: QueueJob) => Promise<void>> = new Map();
  private options: Required<QueueOptions>;
  private eventEmitter: EventEmitter = new EventEmitter();

  constructor(options: QueueOptions = {}) {
    this.options = {
      concurrency: options.concurrency || 5,
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000,
      batchSize: options.batchSize || 10,
      batchInterval: options.batchInterval || 5000,
    };

    // بدء معالج الدفعات
    this.startBatchProcessor();
  }

  async add(job: QueueJob): Promise<void> {
    this.jobs.push(job);
    this.eventEmitter.emit('job:added', job);
    
    // معالجة فورية إذا كان هناك معالج مسجل
    if (this.handlers.size > 0) {
      this.processNext();
    }
  }

  process(handler: (job: QueueJob) => Promise<void>): void {
    // تسجيل معالج عام
    this.handlers.set('*', handler);
    
    // بدء المعالجة
    this.processNext();
  }

  private async processNext(): Promise<void> {
    if (this.processing.size >= this.options.concurrency) {
      return; // وصلنا للحد الأقصى
    }

    const job = this.jobs.shift();
    if (!job) {
      return; // لا توجد مهام
    }

    this.processing.add(job.id);
    this.eventEmitter.emit('job:processing', job);

    try {
      const handler = this.handlers.get(job.type) || this.handlers.get('*');
      if (!handler) {
        throw new Error(`No handler found for job type: ${job.type}`);
      }

      await handler(job);
      
      this.processing.delete(job.id);
      this.completed.push({ ...job, processedAt: new Date() });
      this.eventEmitter.emit('job:completed', job);
    } catch (error: any) {
      this.processing.delete(job.id);
      
      const attempts = (job.attempts || 0) + 1;
      if (attempts < (job.maxAttempts || this.options.maxRetries)) {
        // إعادة المحاولة
        job.attempts = attempts;
        setTimeout(() => {
          this.jobs.push(job);
          this.processNext();
        }, this.options.retryDelay);
        this.eventEmitter.emit('job:retry', job);
      } else {
        // فشل نهائي
        this.failed.push({
          ...job,
          failedAt: new Date(),
          error: error.message,
        });
        this.eventEmitter.emit('job:failed', job);
      }
    }

    // معالجة المهمة التالية
    if (this.jobs.length > 0) {
      this.processNext();
    }
  }

  private startBatchProcessor(): void {
    setInterval(() => {
      if (this.jobs.length >= this.options.batchSize) {
        this.eventEmitter.emit('batch:ready', {
          count: this.options.batchSize,
          jobs: this.jobs.slice(0, this.options.batchSize),
        });
      }
    }, this.options.batchInterval);
  }

  async getStats(): Promise<{ pending: number; processing: number; completed: number; failed: number }> {
    return {
      pending: this.jobs.length,
      processing: this.processing.size,
      completed: this.completed.length,
      failed: this.failed.length,
    };
  }

  async clear(): Promise<void> {
    this.jobs = [];
    this.processing.clear();
    this.completed = [];
    this.failed = [];
  }

  on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  off(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }
}

/**
 * Redis Queue Adapter (TODO: Implementation)
 * للاستخدام في الإنتاج مع Redis
 */
class RedisQueueAdapter implements QueueAdapter {
  // TODO: Implement Redis-based queue
  // This would use BullMQ or similar library
  async add(job: QueueJob): Promise<void> {
    throw new Error('Redis adapter not yet implemented');
  }

  process(handler: (job: QueueJob) => Promise<void>): void {
    throw new Error('Redis adapter not yet implemented');
  }

  async getStats(): Promise<{ pending: number; processing: number; completed: number; failed: number }> {
    throw new Error('Redis adapter not yet implemented');
  }

  async clear(): Promise<void> {
    throw new Error('Redis adapter not yet implemented');
  }
}

/**
 * Queue Manager - واجهة موحدة للطابور
 */
class QueueManager {
  private adapter: QueueAdapter;
  private options: QueueOptions;

  constructor(options: QueueOptions = {}) {
    this.options = options;
    
    // اختيار Adapter بناءً على متغير البيئة
    const useRedis = process.env.REDIS_URL && process.env.USE_REDIS_QUEUE === 'true';
    
    if (useRedis) {
      this.adapter = new RedisQueueAdapter();
    } else {
      this.adapter = new InMemoryQueueAdapter(options);
    }
  }

  /**
   * إضافة مهمة للطابور
   */
  async add(type: string, data: any, options?: { priority?: number; maxAttempts?: number }): Promise<string> {
    const job: QueueJob = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      priority: options?.priority || 0,
      maxAttempts: options?.maxAttempts,
      attempts: 0,
      createdAt: new Date(),
    };

    await this.adapter.add(job);
    return job.id;
  }

  /**
   * تسجيل معالج للمهام
   */
  process(handler: (job: QueueJob) => Promise<void>): void {
    this.adapter.process(handler);
  }

  /**
   * الحصول على إحصائيات الطابور
   */
  async getStats() {
    return await this.adapter.getStats();
  }

  /**
   * مسح الطابور
   */
  async clear(): Promise<void> {
    await this.adapter.clear();
  }

  /**
   * Event listeners (for InMemory adapter)
   */
  on(event: string, listener: (...args: any[]) => void): void {
    if (this.adapter instanceof InMemoryQueueAdapter) {
      this.adapter.on(event, listener);
    }
  }

  off(event: string, listener: (...args: any[]) => void): void {
    if (this.adapter instanceof InMemoryQueueAdapter) {
      this.adapter.off(event, listener);
    }
  }
}

// Export singleton instance
export const queue = new QueueManager({
  concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5'),
  maxRetries: parseInt(process.env.QUEUE_MAX_RETRIES || '3'),
  retryDelay: parseInt(process.env.QUEUE_RETRY_DELAY || '1000'),
  batchSize: parseInt(process.env.QUEUE_BATCH_SIZE || '10'),
  batchInterval: parseInt(process.env.QUEUE_BATCH_INTERVAL || '5000'),
});

// Export types and classes for advanced usage
export { QueueManager, InMemoryQueueAdapter, RedisQueueAdapter };

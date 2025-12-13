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
 * Redis Queue Adapter - تنفيذ كامل للذاكرة الدائمة
 * للاستخدام في الإنتاج مع Redis - يحفظ المهام حتى بعد إعادة تشغيل السيرفر
 */
class RedisQueueAdapter implements QueueAdapter {
  private redis: any;
  private handlers: Map<string, (job: QueueJob) => Promise<void>> = new Map();
  private processing: Set<string> = new Set();
  private isProcessing: boolean = false;
  private options: Required<QueueOptions>;
  private eventEmitter: EventEmitter = new EventEmitter();

  constructor(redisClient: any, options: QueueOptions = {}) {
    this.redis = redisClient;
    this.options = {
      concurrency: options.concurrency || 5,
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000,
      batchSize: options.batchSize || 10,
      batchInterval: options.batchInterval || 5000,
    };

    // بدء معالج المهام
    this.startProcessor();
  }

  async add(job: QueueJob): Promise<void> {
    // حفظ المهمة في Redis
    const jobKey = `queue:job:${job.id}`;
    const pendingKey = 'queue:pending';
    const processingKey = 'queue:processing';

    // حفظ بيانات المهمة
    await this.redis.setex(
      jobKey,
      86400 * 7, // 7 days TTL
      JSON.stringify(job)
    );

    // إضافة للقائمة المعلقة
    await this.redis.lpush(pendingKey, job.id);

    // إضافة للقائمة المرتبة حسب الأولوية
    await this.redis.zadd('queue:priority', job.priority || 0, job.id);

    this.eventEmitter.emit('job:added', job);
  }

  process(handler: (job: QueueJob) => Promise<void>): void {
    this.handlers.set('*', handler);
    this.startProcessor();
  }

  private async startProcessor(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    // معالجة مستمرة
    const processLoop = async () => {
      try {
        // استرجاع المهام المعلقة من Redis
        const pendingIds = await this.redis.lrange('queue:pending', 0, this.options.concurrency - 1);
        
        for (const jobId of pendingIds) {
          if (this.processing.size >= this.options.concurrency) break;
          if (this.processing.has(jobId)) continue;

          // استرجاع بيانات المهمة
          const jobData = await this.redis.get(`queue:job:${jobId}`);
          if (!jobData) {
            await this.redis.lrem('queue:pending', 1, jobId);
            continue;
          }

          const job: QueueJob = JSON.parse(jobData);
          await this.processJob(job);
        }
      } catch (error) {
        console.error('Error in queue processor:', error);
      }

      // الاستمرار في المعالجة
      setTimeout(processLoop, 100);
    };

    processLoop();
  }

  private async processJob(job: QueueJob): Promise<void> {
    this.processing.add(job.id);
    await this.redis.lrem('queue:pending', 1, job.id);
    await this.redis.lpush('queue:processing', job.id);

    this.eventEmitter.emit('job:processing', job);

    try {
      const handler = this.handlers.get(job.type) || this.handlers.get('*');
      if (!handler) {
        throw new Error(`No handler found for job type: ${job.type}`);
      }

      await handler(job);

      // نجحت المهمة
      this.processing.delete(job.id);
      await this.redis.lrem('queue:processing', 1, job.id);
      await this.redis.lpush('queue:completed', job.id);
      await this.redis.setex(`queue:job:${job.id}`, 86400, JSON.stringify({
        ...job,
        processedAt: new Date(),
      }));

      this.eventEmitter.emit('job:completed', job);
    } catch (error: any) {
      this.processing.delete(job.id);
      await this.redis.lrem('queue:processing', 1, job.id);

      const attempts = (job.attempts || 0) + 1;
      if (attempts < (job.maxAttempts || this.options.maxRetries)) {
        // إعادة المحاولة
        job.attempts = attempts;
        await this.redis.setex(
          `queue:job:${job.id}`,
          86400 * 7,
          JSON.stringify(job)
        );
        await this.redis.lpush('queue:pending', job.id);
        this.eventEmitter.emit('job:retry', job);
      } else {
        // فشل نهائي
        await this.redis.lpush('queue:failed', job.id);
        await this.redis.setex(`queue:job:${job.id}`, 86400 * 7, JSON.stringify({
          ...job,
          failedAt: new Date(),
          error: error.message,
        }));
        this.eventEmitter.emit('job:failed', job);
      }
    }
  }

  async getStats(): Promise<{ pending: number; processing: number; completed: number; failed: number }> {
    const pending = await this.redis.llen('queue:pending');
    const processing = await this.redis.llen('queue:processing');
    const completed = await this.redis.llen('queue:completed');
    const failed = await this.redis.llen('queue:failed');

    return {
      pending,
      processing,
      completed,
      failed,
    };
  }

  async clear(): Promise<void> {
    await this.redis.del('queue:pending', 'queue:processing', 'queue:completed', 'queue:failed', 'queue:priority');
    // حذف جميع المهام
    const keys = await this.redis.keys('queue:job:*');
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
    this.processing.clear();
  }

  on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  off(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }

  /**
   * استرجاع المهام المعلقة بعد إعادة التشغيل
   */
  async recoverPendingJobs(): Promise<void> {
    const processingIds = await this.redis.lrange('queue:processing', 0, -1);
    for (const jobId of processingIds) {
      // إعادة المهام المعالجة للقائمة المعلقة
      await this.redis.lrem('queue:processing', 1, jobId);
      await this.redis.lpush('queue:pending', jobId);
    }
  }
}

/**
 * Queue Manager - واجهة موحدة للطابور
 */
class QueueManager {
  private adapter: QueueAdapter;
  private options: QueueOptions;
  private redisClient: any = null;

  constructor(options: QueueOptions = {}) {
    this.options = options;
    
    // اختيار Adapter بناءً على متغير البيئة
    const useRedis = process.env.REDIS_URL && process.env.USE_REDIS_QUEUE === 'true';
    
    if (useRedis) {
      // تهيئة Redis Client
      try {
        const Redis = require('ioredis');
        this.redisClient = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
        });

        this.redisClient.on('error', (err: Error) => {
          console.error('Redis connection error:', err);
        });

        this.redisClient.on('connect', () => {
          console.log('✅ Redis connected for queue persistence');
        });

        this.adapter = new RedisQueueAdapter(this.redisClient, options);
        
        // استرجاع المهام المعلقة بعد إعادة التشغيل
        (this.adapter as RedisQueueAdapter).recoverPendingJobs().catch(console.error);
      } catch (error) {
        console.warn('⚠️ Redis not available, falling back to In-Memory queue:', error);
        this.adapter = new InMemoryQueueAdapter(options);
      }
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

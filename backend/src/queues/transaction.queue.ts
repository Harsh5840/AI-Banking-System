import { Queue } from 'bullmq';
import { redis } from '../lib/redis';

export const TRANSACTION_QUEUE_NAME = 'transaction-queue';

// Reuse the ioredis connection from lib/redis is strictly not recommended for blocking commands,
// but BullMQ creates its own connections usually if we pass connection options.
// Actually, BullMQ Queue accepts a 'connection' object which is a RedisOptions or ioredis instance.
// Best practice: Pass the connection config.

export const transactionQueue = new Queue(TRANSACTION_QUEUE_NAME, {
  connection: redis, // BullMQ reuses this or creates duplicates? It's better to pass options or separate instance if blocking.
                     // The 'connection' option takes an ioredis instance.
                     // IMPORTANT: working with blocking commands (workers) needs separate connections. 
                     // For the Queue (Producer), reusing is fine?
                     // Let's use the exported redis instance for simplicity, BullMQ handles it well.
});

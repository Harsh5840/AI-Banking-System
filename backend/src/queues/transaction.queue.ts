import { Queue } from 'bullmq';
import { redis } from '../lib/redis';

export const TRANSACTION_QUEUE_NAME = 'transaction-queue';

// Wrap queue creation to prevent immediate crash if Redis is offline
// BullMQ will try to connect and might emit 'error'.
export const transactionQueue = new Queue(TRANSACTION_QUEUE_NAME, {
  connection: redis as any, 
});

transactionQueue.on('error', (err) => {
    // Suppress errors if we know we are offline
    // console.warn('Queue Error:', err.message);
});

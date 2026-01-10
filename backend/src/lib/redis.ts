import { Redis } from 'ioredis';

export const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const isTls = redisUrl.startsWith('rediss://');

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Required for BullMQ
  tls: isTls ? {
    rejectUnauthorized: false // Upstash usually works with this, or proper CA
  } : undefined,
  family: 4,
  retryStrategy: (times) => {
    // Retry for 5 seconds then give up/throttle
    if (times > 5) {
      console.warn('⚠️ Redis connection retrying intentionally delayed...');
      return 5000;
    }
    return Math.min(times * 100, 3000);
  },
  lazyConnect: true // Don't crash on startup
});

export let isRedisOnline = false;

redis.on('error', (err) => {
  // Suppress extensive error logs if we know it's offline
  if ((err as any).code === 'ECONNREFUSED') {
    if (isRedisOnline) {
      console.error('❌ Redis Connection Lost');
    }
    isRedisOnline = false;
  } else {
    console.error('Redis Client Error', err.message);
  }
});

redis.on('connect', () => {
  console.log('✅ Redis Client Connected');
  isRedisOnline = true;
});

// Attempt connection immediately but don't await blocking
redis.connect().catch(() => {
    console.warn('⚠️ Redis initial connection failed. Running in offline mode.');
});

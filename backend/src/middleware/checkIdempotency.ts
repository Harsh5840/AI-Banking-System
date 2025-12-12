import { Request, Response, NextFunction } from 'express';
import { redis } from '../lib/redis';

// Extend Express Request interface to include idempotencyKey if needed, 
// though we usually just read the header.
// Also extend Response to handle the custom sendResponse method.
interface CustomResponse extends Response {
  sendResponse?: any;
}

export const checkIdempotency = async (req: Request, res: CustomResponse, next: NextFunction) => {
  const key = req.headers['idempotency-key'];
  
  // If no key is provided, we treat it as a normal non-idempotent request (or enforce it, depending on strictness).
  // The plan usually says "check key", let's be strict for "Transaction" routes, but maybe flexible elsewhere.
  // For now, if present, we check.
  if (!key) return next();

  try {
    const redisKey = `idem:${key}`;
    const cachedResponse = await redis.get(redisKey);

    if (cachedResponse) {
      console.log(`[Idempotency] Hit for key: ${key}`);
      return res.status(200).json(JSON.parse(cachedResponse));
    }

    // Capture the original send/json method
    const originalSend = res.json;

    // Override res.json to cache the response before sending
    res.json = function (body) {
      // Save for 24h (86400 seconds)
      redis.set(redisKey, JSON.stringify(body), 'EX', 86400).catch(err => {
          console.error('[Idempotency] Failed to cache response', err);
      });
      
      // Call original method
      return originalSend.call(this, body);
    };

    next();
  } catch (error) {
    console.error('[Idempotency] Redis error:', error);
    next(); // Fail open or closed? Fail open for now to avoid blocking user.
  }
};

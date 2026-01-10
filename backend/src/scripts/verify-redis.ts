import 'dotenv/config';
import { redis, isRedisOnline } from '../lib/redis';
import { transactionQueue } from '../queues/transaction.queue';
import { Worker } from 'bullmq';

async function verifyInfrastructure() {
  console.log('🔍 Starting Redis & BullMQ Verification...');


  // 1. Check Redis Connection
  console.log('⏳ Checking Redis connection...');
  try {
    const start = Date.now();
    // Race ping against a 2-second timeout
    await Promise.race([
        redis.ping(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 10000))
    ]);
    const latency = Date.now() - start;
    console.log(`✅ Redis is ONLINE (Latency: ${latency}ms)`);
  } catch (error) {
    console.error(`❌ Redis is OFFLINE (${(error as Error).message}).`);
    console.error('   Please ensure Docker is running and the Redis container is started.');
    console.error('   Command: docker-compose up -d redis');
    process.exit(1);
  }

  // 2. Check Queue System
  console.log('\n⏳ Testing BullMQ Queue...');
  const testJobId = `verify-${Date.now()}`;
  
  try {
    // Add a test job
    await transactionQueue.add('verification-job', { 
      message: 'Infrastructure verified', 
      timestamp: Date.now() 
    }, {
      jobId: testJobId
    });
    console.log(`✅ Job added to queue (ID: ${testJobId})`);

    // Create a temporary worker to process it
    console.log('⏳ Waiting for worker to process job...');
    
    return new Promise((resolve, reject) => {
      const worker = new Worker('transaction-queue', async (job) => {
        if (job.id === testJobId) {
          console.log(`✅ Worker received job: ${job.id}`);
          return 'processed';
        }
      }, { 
        connection: redis,
        concurrency: 1 
      });

      worker.on('completed', async (job) => {
        if (job.id === testJobId) {
          console.log('✅ Job successfully processed!');
          await worker.close();
          resolve(true);
        }
      });

      worker.on('failed', async (job, err) => {
        if (job && job.id === testJobId) {
          console.error(`❌ Job failed: ${err.message}`);
          await worker.close();
          reject(err);
        }
      });

      // Timeout after 5 seconds
      setTimeout(async () => {
        console.error('❌ Verification Timed Out (Worker did not pick up job)');
        await worker.close();
        process.exit(1);
      }, 15000);
    });

  } catch (err) {
    console.error('❌ Queue Verification Failed:', err);
    process.exit(1);
  }
}

verifyInfrastructure()
  .then(() => {
    console.log('\n🎉 ALL CHECKS PASSED: Redis and BullMQ are working correctly.');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

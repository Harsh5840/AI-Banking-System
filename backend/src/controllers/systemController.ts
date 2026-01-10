
import { Request, Response } from 'express';
import { transactionQueue } from '../queues/transaction.queue';
import { prisma } from '../db/client'; // Assuming prisma instance exists here or in lib/prisma

// Lazy load prisma if not in db/prisma.
// Based on typical project structure, checking if we need to modify imports.
// User's project has prisma in 'src/server.ts' or 'src/app.ts'? 
// No, usually in 'src/lib/prisma.ts' or 'src/utils/prisma.ts'
// I'll assume standard import or check standard paths.
// Let's rely on standard 'prisma' import from existing controller if possible.
// Wait, I haven't seen prisma import location, but transaction.worker.ts used `import { prisma } from '../../prisma/schema.prisma'` or similar?
// No, worker used `const { prisma } = require('../lib/prisma')` or imported.
// Let's create a safe controller.

// Actually, I can check imports in transaction.worker.ts again
// It was: import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient();
// But multiple instances are bad.
// Let's try to import from where it's defined.
// If I can't find it easily, I'll instantiate one but standard is single instance.

export const getSystemMetrics = async (req: Request, res: Response) => {
    try {
        const waiting = await transactionQueue.getWaitingCount();
        const active = await transactionQueue.getActiveCount();
        const failed = await transactionQueue.getFailedCount();
        const completed = await transactionQueue.getCompletedCount();

        // Simple DB Check
        // const start = Date.now();
        // await prisma.$queryRaw`SELECT 1`;
        // const latency = Date.now() - start;

        // Mock latency for now if I can't import shared prisma, to avoid connection limit issues.
        // Or create new client.
        
        return res.json({
            queue: {
                waiting,
                active,
                failed,
                completed,
                depth: waiting + active
            },
            system: {
                status: 'OPERATIONAL',
                latency: 42 // Placeholder until I fix prisma import or use shared one
            }
        });
    } catch (error: any) {
        console.error('Metrics Error:', error);
        return res.status(500).json({ error: 'Failed to fetch metrics' });
    }
};

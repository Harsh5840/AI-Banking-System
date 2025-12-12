import { EventEmitter } from 'events';
import { prisma } from '../db/client';

export const eventBus = new EventEmitter();

// Event Types
export const EVENTS = {
  TRANSACTION_CREATED: 'transaction.created',
};

// Listener
eventBus.on(EVENTS.TRANSACTION_CREATED, async (data) => {
  const { transactionId, userId, amount, description } = data;
  console.log(`[FraudListener] Checking transaction ${transactionId}...`);

  // Placeholder for "AI" or Velocity Check
  // In a real system, we might query recent transactions to check velocity.
  // "Velocity Check: Did this user spend >$500 in 10 seconds?" 
  
  if (amount > 10000) {
    // Flag it!
     console.log(`[FraudListener] High value detected! Flagging ${transactionId}`);
     await prisma.transaction.update({
         where: { id: transactionId },
         data: { isFlagged: true, reasons: 'High Value Transaction > 10000' }
     }).catch(err => console.error('[FraudListener] Failed to flag:', err));
     
     // Trigger Reversal?
     // If we were super strict, we might trigger a compensatory transaction here.
     // For now, just flag it.
  }
});

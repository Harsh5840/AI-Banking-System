import { Request, Response } from 'express';
import { createTransaction as buildLedgerTxn } from '../core/ledger';
import { classifyCategory } from '../ai/fraud';
import { prisma } from '../db/client';
import { SYSTEM_INCOME_ACCOUNT_ID, SYSTEM_EXPENSE_ACCOUNT_ID } from '../config/env';

import {
  createTransaction,
  reverseTransaction,
  getAllTransactions,
} from '../services/transactionService';

import { transactionQueue } from '../queues/transaction.queue';


export const handleCreateTransaction = async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.user!;
    const idempotencyKey = req.headers['idempotency-key'] as string; // Optional but recommended

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID missing' });
    }

    const { from, to, amount, description, type, timestamp: clientTimestamp } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!["expense", "income", "transfer"].includes(type)) {
      return res.status(400).json({ error: "Invalid transaction type" });
    }

    // Determine from/to accounts based on transaction type
    let fromAccount: string;
    let toAccount: string;

    if (type === "expense") {
      if (!from) return res.status(400).json({ error: 'Missing from account' });
      fromAccount = from;
      toAccount = SYSTEM_EXPENSE_ACCOUNT_ID!; // Ensure env is checked
    } else if (type === "income") {
      if (!to) return res.status(400).json({ error: 'Missing to account' });
      fromAccount = SYSTEM_INCOME_ACCOUNT_ID!;
      toAccount = to;
    } else {
      if (!from || !to) return res.status(400).json({ error: 'Missing accounts' });
      fromAccount = from;
      toAccount = to;
    }

    const timestamp = clientTimestamp || new Date().toISOString();

    // 1. Create Transaction in DB (PENDING status)
    // We create the record *before* queuing to ensure we have an ID to return.
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount: parseFloat(amount),
        category: type,
        description,
        timestamp: new Date(timestamp),
        status: 'PENDING',
        idempotencyKey: idempotencyKey || undefined, // Store if present
        // We don't have accounts linked in Relation yet in the schema, 
        // relying on LedgerEntries later. 
        // But wait, the schema has `user` relation.
      }
    });

    // 2. Add to Queue
    await transactionQueue.add('process-transaction', {
      transactionId: transaction.id,
      userId,
      fromAccount,
      toAccount,
      amount: parseFloat(amount),
      description,
      type,
      timestamp
    });

    // 3. Return 202 Accepted
    return res.status(202).json({
      status: 'ACCEPTED',
      message: 'Transaction queued for processing',
      transactionId: transaction.id,
      originalAmount: amount,
      estimatedTime: '2-5 seconds'
    });

  } catch (error: any) {
    console.error('Transaction creation failed:', error);
    // Handle uniqueness constraint for idempotencyKey
    if (error.code === 'P2002' && error.meta?.target?.includes('idempotencyKey')) {
        return res.status(409).json({ error: 'Duplicate idempotency key' });
    }
    return res.status(500).json({ error: 'Failed to queue transaction', details: error.message });
  }
};

export const handleGetAllTransactions = async (req: Request, res: Response) => {
  try {
    const { id: userId, role } = req.user!;
    
    let transactions: any[];
    
    if (role === 'ADMIN') {
      transactions = await prisma.transaction.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        }
      });
    } else {
      transactions = await getAllTransactions(userId);
    }

    if (!transactions || transactions.length === 0) {
      return res.json([]);
    }

    const enhancedTransactions = transactions.map((tx: any) => {
      // Determine transaction type based on amount
      let type = 'transfer';
      if (tx.category === 'transfer') {
        type = 'transfer';
      } else if (tx.amount > 0) {
        type = 'income';
      } else if (tx.amount < 0) {
        type = 'expense';
      }

      return {
        id: tx.id,
        description: tx.description || 'No description',
        amount: Math.abs(tx.amount), // Always show positive amount
        category: tx.category,
        type: type, // Add transaction type
        timestamp: tx.timestamp.toISOString(),
        createdAt: tx.timestamp.toISOString(), // Add createdAt for frontend compatibility
        date: tx.timestamp.toISOString().split('T')[0],
        riskScore: tx.riskScore || 0,
        isFlagged: tx.isFlagged || false,
        status: 'completed',
        canReverse: !tx.parentId, // Allow reversing any non-reversed transaction
        hash: `tx_${tx.id.slice(0, 8)}`,
        user: role === 'ADMIN' ? {
          id: tx.user?.id || tx.userId,
          name: tx.user?.name || 'Unknown User',
          email: tx.user?.email || 'unknown@example.com'
        } : undefined
      };
    });

    return res.json(enhancedTransactions);
  } catch (error) {
    console.error('Transaction fetch failed:', error);
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

export const handleReverseTransaction = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;

    const reversal = await reverseTransaction(transactionId as string);

    return res.status(201).json({ message: 'Transaction reversed', reversal });
  } catch (error) {
    console.error('Transaction reversal failed:', error);
    return res.status(400).json({ error: (error as Error).message });
  }
};

export const handleGetTransactionById = async (req: Request, res: Response) => {
  try {
      const { id } = req.params;
      const transaction = await prisma.transaction.findUnique({
          where: { id },
          include: {
              ledgerEntries: true, // Fetch double-entry records
          }
      });

      if (!transaction) {
          return res.status(404).json({ error: 'Transaction not found' });
      }

      return res.json(transaction);
  } catch (error: any) {
      console.error('Fetch transaction failed:', error);
      return res.status(500).json({ error: 'Failed to fetch transaction' });
  }
};

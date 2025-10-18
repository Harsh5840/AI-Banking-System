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

export const handleCreateTransaction = async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.user!;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID missing' });
    }

    const { from, to, amount, description, type, timestamp: clientTimestamp } = req.body;

    // Validate required fields
    if (!amount) {
      return res.status(400).json({ error: 'Missing required field: amount' });
    }

    if (!["expense", "income", "transfer"].includes(type)) {
      return res.status(400).json({ error: "Invalid transaction type" });
    }

    // Determine from/to accounts based on transaction type
    let fromAccount: string;
    let toAccount: string;

    if (type === "expense") {
      // Expense: User account (from) -> System expense account (to)
      if (!from) {
        return res.status(400).json({ error: 'Missing required field: from (user account)' });
      }
      if (!SYSTEM_EXPENSE_ACCOUNT_ID) {
        return res.status(500).json({ error: 'System expense account not configured' });
      }
      fromAccount = from;
      toAccount = SYSTEM_EXPENSE_ACCOUNT_ID;
    } else if (type === "income") {
      // Income: System income account (from) -> User account (to)
      if (!to) {
        return res.status(400).json({ error: 'Missing required field: to (user account)' });
      }
      if (!SYSTEM_INCOME_ACCOUNT_ID) {
        return res.status(500).json({ error: 'System income account not configured' });
      }
      fromAccount = SYSTEM_INCOME_ACCOUNT_ID;
      toAccount = to;
    } else {
      // Transfer: User account -> User account
      if (!from || !to) {
        return res.status(400).json({ error: 'Missing required fields: from, to' });
      }
      fromAccount = from;
      toAccount = to;
    }

    // Log the account IDs for debugging
    console.log('Creating transaction:', { type, from: fromAccount, to: toAccount, userId });

    const timestamp = clientTimestamp || new Date().toISOString();

    let debitCategory = "others";
    let creditCategory = "others";

    if (type === "expense") {
      debitCategory = classifyCategory(description);
      console.log(`📊 Classified expense "${description}" as: ${debitCategory}`);
    } else if (type === "income") {
      creditCategory = classifyCategory(description);
      console.log(`📊 Classified income "${description}" as: ${creditCategory}`);
    } else if (type === "transfer") {
      debitCategory = "transfer";
      creditCategory = "transfer";
    }

    const tx = buildLedgerTxn({
      userId,
      from: fromAccount,
      to: toAccount,
      amount: parseFloat(amount),
      description,
      timestamp,
      debitCategory,
      creditCategory,
    });

    const created = await createTransaction(tx);

    return res.status(201).json({ message: 'Transaction added successfully', transaction: created });
  } catch (error: any) {
    console.error('Transaction creation failed:', error);
    console.error('Error details:', error.message, error.stack);
    
    // Handle specific errors
    if (error.message?.includes('account not found')) {
      return res.status(404).json({ 
        error: 'Account not found', 
        details: error.message,
        hint: 'Please ensure both "from" and "to" accounts exist before creating a transaction'
      });
    }
    
    return res.status(500).json({ error: 'Failed to add transaction', details: error.message });
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
        canReverse: tx.amount < 0 && !tx.parentId,
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

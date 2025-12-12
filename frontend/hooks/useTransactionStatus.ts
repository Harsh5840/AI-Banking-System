
import { useState, useEffect, useRef } from 'react';

type TransactionStatus = 'PENDING' | 'QUEUED' | 'PROCESSING' | 'SUCCESS' | 'FAILED';

interface UseTransactionStatusProps {
  transactionId: string | null;
  initialStatus?: TransactionStatus;
  pollingInterval?: number;
}

export const useTransactionStatus = ({
  transactionId,
  initialStatus = 'PENDING',
  pollingInterval = 2000
}: UseTransactionStatusProps) => {
  const [status, setStatus] = useState<TransactionStatus>(initialStatus);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const pollTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!transactionId) return;

    // Reset state on new transactionId
    setStatus(initialStatus);
    setData(null);
    setError(null);

    const checkStatus = async () => {
      try {
        console.log(`[Polling] Checking status for ${transactionId}...`);
        // Assumption: API exposes GET /transactions/:id
        // We might need to adjust the endpoint path based on actual API routes.
        // Assuming user is authenticated via cookie/token handled by browser/axios.
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/transactions/${transactionId}`, {
            headers: {
                'Content-Type': 'application/json',
                // Add Authorization header if needed, but usually handled by global interceptor or cookies
            }
        });
        
        if (!res.ok) {
            throw new Error('Failed to fetch status');
        }

        const json = await res.json();
        // Assuming API returns { status: ... } or the full object
        const newStatus = json.status || json.transaction?.status;
        
        if (newStatus) {
            setStatus(newStatus);
            setData(json);
            
            // Stop polling if complete
            if (newStatus === 'SUCCESS' || newStatus === 'FAILED') {
                 if (pollTimer.current) clearInterval(pollTimer.current);
            }
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        setError(err.message);
      }
    };

    // Start polling
    pollTimer.current = setInterval(checkStatus, pollingInterval);
    checkStatus(); // Initial check

    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [transactionId, initialStatus, pollingInterval]);

  return { status, data, error };
};


import React from 'react';
import { cn } from '@/lib/utils';

interface LedgerEntry {
    id: string;
    timestamp: string;
    type: 'debit' | 'credit';
    amount: number;
    hash: string;
}

interface LedgerTableProps {
    entries: LedgerEntry[];
    className?: string;
}

export const LedgerTable: React.FC<LedgerTableProps> = ({ entries, className }) => {
    return (
        <div className={cn("w-full overflow-hidden border rounded-md shadow-sm bg-card", className)}>
            <div className="bg-muted/50 px-4 py-3 border-b flex justify-between items-center">
                <h3 className="text-sm font-semibold font-mono text-muted-foreground tracking-wider uppercase">
                    Start_Ledger_Stream
                </h3>
                <div className="flex space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-mono text-green-600">LIVE</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-mono">
                    <thead className="bg-muted/30 text-muted-foreground">
                        <tr>
                            <th className="px-4 py-2 font-medium">TIMESTAMP</th>
                            <th className="px-4 py-2 font-medium">TX_HASH</th>
                            <th className="px-4 py-2 font-medium">TYPE</th>
                            <th className="px-4 py-2 font-medium text-right">AMOUNT</th>
                            <th className="px-4 py-2 font-medium">STATUS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {entries.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground italic">
                                    No ledger entries found. Waiting for stream...
                                </td>
                            </tr>
                        ) : (
                            entries.map((entry) => (
                                <tr key={entry.id} className="hover:bg-muted/10 transition-colors">
                                    <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                                        {new Date(entry.timestamp).toLocaleTimeString()}
                                    </td>
                                    <td className="px-4 py-2 text-primary opacity-80" title={entry.hash}>
                                        {entry.hash.substring(0, 10)}...
                                    </td>
                                    <td className={cn(
                                        "px-4 py-2 font-bold uppercase",
                                        entry.type === 'credit' ? "text-green-600" : "text-red-500"
                                    )}>
                                        {entry.type}
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        {entry.type === 'debit' ? '-' : '+'}${Math.abs(entry.amount).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-2 text-muted-foreground flex items-center space-x-1">
                                        <span className="text-green-500">●</span>
                                        <span>COMMITTED</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-t font-mono text-center">
                Double-Entry Verification: <span className="text-green-600 font-bold">ACTIVE</span>
            </div>
        </div>
    );
};

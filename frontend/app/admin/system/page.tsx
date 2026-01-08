
"use client"

import React, { useState, useEffect } from 'react';
import { InfrastructureBar } from '@/components/system/InfrastructureBar';
import { LifecycleTracker } from '@/components/system/LifecycleTracker';
import { LedgerTable } from '@/components/system/LedgerTable';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal, CreditCard, RefreshCw, Database } from "lucide-react"

export default function SystemControlPlane() {
    const [currentTxId, setCurrentTxId] = useState<string | null>(null);
    const { status, data: txData } = useTransactionStatus({ transactionId: currentTxId });
    const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);

    useEffect(() => {
        if (!currentTxId) setLedgerEntries([]);

        const fetchLedger = async () => {
            if (status === 'SUCCESS' && currentTxId) {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/transactions/${currentTxId}/ledger`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.ledgerEntries && Array.isArray(data.ledgerEntries)) {
                            setLedgerEntries(data.ledgerEntries);
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch ledger entries", e);
                }
            }
        }

        fetchLedger();
    }, [currentTxId, status]);

    const handleDemoTransaction = async () => {
        try {
            setCurrentTxId(null);
            setLedgerEntries([]);

            // Call API
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/transaction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'idempotency-key': crypto.randomUUID() },
                body: JSON.stringify({
                    from: "acc_demo_user", // These need to be real IDs in full integration
                    to: "acc_demo_system",
                    amount: 50 + Math.random() * 100, // Random amount
                    type: "transfer",
                    description: "Load Test Transaction"
                })
            });

            const data = await res.json();

            if (res.status === 202) {
                setCurrentTxId(data.transactionId);
            } else {
                alert("Transaction failed to queue: " + (data.error || "Unknown"));
            }
        } catch (e) {
            console.error(e);
            alert("Failed to dispatch transaction. API may be down.");
        }
    };

    return (
        <div className="min-h-screen bg-background font-sans">
            <InfrastructureBar />

            <main className="container mx-auto p-6 space-y-8">
                <div className="flex flex-col space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">System Control Plane</h1>
                    <p className="text-muted-foreground">Real-time distributed ledger monitoring and transaction processing.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Transaction Trigger */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Transaction Simulator</CardTitle>
                            <CardDescription>Initiate high-concurrency transfers</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 border rounded-md bg-secondary/20">
                                <div className="text-sm font-medium mb-2">Payload Preview</div>
                                <pre className="text-xs font-mono bg-black text-green-400 p-2 rounded overflow-x-auto">
                                    {JSON.stringify({
                                        type: "transfer",
                                        amount: "50-150.00",
                                        flow: "ASYNC_QUEUE",
                                        lock: "PESSIMISTIC"
                                    }, null, 2)}
                                </pre>
                            </div>

                            <Button
                                onClick={handleDemoTransaction}
                                className="w-full font-mono font-bold"
                                disabled={status === 'PROCESSING' || status === 'QUEUED'}
                            >
                                {status === 'PROCESSING' || status === 'QUEUED' ? (
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <CreditCard className="mr-2 h-4 w-4" />
                                )}
                                {status === 'PROCESSING' ? 'PROCESSING...' : 'DISPATCH TRANSACTION'}
                            </Button>

                            {currentTxId && (
                                <Alert className="bg-muted/50 border-primary/20">
                                    <Terminal className="h-4 w-4" />
                                    <AlertTitle className="font-mono text-xs text-primary">ID: {currentTxId}</AlertTitle>
                                    <AlertDescription className="text-xs text-muted-foreground">
                                        Tracked via Idempotency Key
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right Column: Visualization */}
                    <div className="md:col-span-2 space-y-6">
                        {/* 1. Lifecycle Tracker */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Request Lifecycle</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <LifecycleTracker status={currentTxId ? status : 'PENDING'} />
                            </CardContent>
                        </Card>

                        {/* 2. Ledger Table */}
                        <Card className="border-t-4 border-t-primary">
                            <CardHeader className="pb-2 bg-muted/10">
                                <CardTitle className="flex items-center space-x-2">
                                    <Database className="h-5 w-5" />
                                    <span>Immutable Ledger Stream</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <LedgerTable entries={ledgerEntries} className="border-0 shadow-none rounded-none" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

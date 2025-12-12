
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Activity, Server, Database, Layers } from 'lucide-react';

export const InfrastructureBar = () => {
    // Mock data for demo purposes, or fetch from API
    // In a real app, this would poll /api/health or /api/metrics
    const [queueDepth, setQueueDepth] = useState(0);
    const [latency, setLatency] = useState(45);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/system/metrics`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.queue) setQueueDepth(data.queue.depth);
                    if (data.system) setLatency(data.system.latency);
                }
            } catch (e) {
                // Fail silently, keep 0
                console.error("Metrics poll failed", e);
            }
        };

        fetchMetrics();
        const interval = setInterval(fetchMetrics, 3000); // 3s poll
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full bg-black text-green-500 font-mono text-xs py-1 px-4 border-b border-green-900 group">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex space-x-6">
                    <div className="flex items-center space-x-2">
                        <Activity className="h-3 w-3" />
                        <span>SYSTEM: <span className="text-white font-bold">OPERATIONAL</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Layers className="h-3 w-3" />
                        <span>QUEUE_DEPTH: <span className="text-white font-bold">{queueDepth}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Database className="h-3 w-3" />
                        <span>DB_LOCKS: <span className="text-white font-bold">LOW</span></span>
                    </div>
                </div>
                <div className="flex items-center space-x-2 opacity-50">
                    <Server className="h-3 w-3" />
                    <span>LATENCY: {latency}ms</span>
                    <span className="animate-pulse">_</span>
                </div>
            </div>
        </div>
    );
};

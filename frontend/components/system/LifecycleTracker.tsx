
import React from 'react';
import { CheckCircle, Clock, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming standard cn utility exists

interface LifecycleTrackerProps {
    status: 'PENDING' | 'QUEUED' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
}

const STEPS = [
    { id: 'PENDING', label: 'Accepted', icon: Clock },
    { id: 'QUEUED', label: 'Queued', icon: Loader2 },
    { id: 'PROCESSING', label: 'Processing', icon: Lock },
    { id: 'SUCCESS', label: 'Settled', icon: CheckCircle },
];

export const LifecycleTracker: React.FC<LifecycleTrackerProps> = ({ status }) => {
    // Map status to index for progress
    const statusOrder = ['PENDING', 'QUEUED', 'PROCESSING', 'SUCCESS'];
    const currentIndex = statusOrder.indexOf(status);
    const isFailed = status === 'FAILED';

    if (isFailed) {
        return (
            <div className="flex items-center space-x-2 text-destructive p-4 border border-destructive/20 rounded-lg bg-destructive/10">
                <CheckCircle className="h-5 w-5" />
                <span className="font-mono font-bold">TRANSACTION FAILED</span>
            </div>
        );
    }

    return (
        <div className="w-full py-4">
            <div className="flex items-center justify-between relative">
                {/* Connector Line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted z-0"></div>
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary z-0 transition-all duration-500 ease-in-out"
                    style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
                ></div>

                {/* Steps */}
                {STEPS.map((step, index) => {
                    const isActive = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div
                                className={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 bg-background",
                                    isActive ? "border-primary text-primary" : "border-muted text-muted-foreground",
                                    isCurrent && status === 'QUEUED' && "animate-pulse" // Optional pulse for queued
                                )}
                            >
                                <Icon className={cn("h-5 w-5", isCurrent && step.id === 'QUEUED' && "animate-spin")} />
                            </div>
                            <span className={cn(
                                "mt-2 text-xs font-mono font-medium tracking-wide bg-background px-1",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

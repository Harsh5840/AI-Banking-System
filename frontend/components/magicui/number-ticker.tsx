"use client";

import { cn } from "@/lib/utils";

export default function NumberTicker({
    value,
    direction = "up",
    delay = 0,
    className,
}: {
    value: number;
    direction?: "up" | "down";
    className?: string;
    delay?: number; // delay in s
}) {
    // Simplified version without framer-motion due to environment installation issues
    return (
        <span
            className={cn(
                "inline-block tabular-nums text-black dark:text-white tracking-wider",
                className,
            )}
        >
            {Intl.NumberFormat("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(value)}
        </span>
    );
}

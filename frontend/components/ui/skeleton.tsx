import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200 dark:bg-slate-800", className)}
      {...props}
    />
  )
}

// Card Skeleton
function CardSkeleton() {
  return (
    <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

// Table Row Skeleton
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-4 flex-1">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  )
}

// Stat Card Skeleton
function StatCardSkeleton() {
  return (
    <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <Skeleton className="h-8 w-32 mb-1" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

// Chart Skeleton
function ChartSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-end justify-between h-64">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="w-8"
            style={{ height: `${Math.random() * 100 + 20}%` }}
          />
        ))}
      </div>
      <div className="flex justify-center space-x-8">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

export { Skeleton, CardSkeleton, TableSkeleton, StatCardSkeleton, ChartSkeleton }

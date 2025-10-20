import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn("flex items-center space-x-2 text-sm mb-6", className)} aria-label="Breadcrumb">
      <Link
        href="/"
        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-600" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 dark:text-slate-100 font-medium">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}

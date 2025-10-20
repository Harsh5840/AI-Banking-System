"use client"

import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"

interface FormFieldProps {
  label?: string
  error?: string
  success?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function FormField({
  label,
  error,
  success,
  hint,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {children}
        
        {/* Error Icon */}
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
        
        {/* Success Icon */}
        {success && !error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start space-x-2 text-sm text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && !error && (
        <div className="flex items-start space-x-2 text-sm text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-top-1 duration-200">
          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Hint Message */}
      {hint && !error && !success && (
        <div className="flex items-start space-x-2 text-sm text-slate-600 dark:text-slate-400">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{hint}</span>
        </div>
      )}
    </div>
  )
}

interface InputPrefixProps {
  children: React.ReactNode
  className?: string
}

export function InputPrefix({ children, className }: InputPrefixProps) {
  return (
    <div className={cn(
      "absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 pointer-events-none",
      className
    )}>
      {children}
    </div>
  )
}

interface InputSuffixProps {
  children: React.ReactNode
  className?: string
}

export function InputSuffix({ children, className }: InputSuffixProps) {
  return (
    <div className={cn(
      "absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400",
      className
    )}>
      {children}
    </div>
  )
}

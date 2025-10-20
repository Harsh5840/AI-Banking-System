"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface StickyHeaderProps {
  children: React.ReactNode
  className?: string
  threshold?: number
}

export function StickyHeader({ children, className, threshold = 50 }: StickyHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [threshold])

  return (
    <header
      className={cn(
        "sticky top-0 z-30 transition-all duration-300",
        isScrolled
          ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-md"
          : "bg-transparent",
        className
      )}
    >
      {children}
    </header>
  )
}

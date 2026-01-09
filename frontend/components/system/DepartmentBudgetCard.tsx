"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Building2, TrendingUp } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/api-endpoints"

interface DepartmentBudget {
    departmentName: string
    budgetLimit: number
    currentSpend: number
    organizationName: string
}

export function DepartmentBudgetCard() {
    const [budgetData, setBudgetData] = useState<DepartmentBudget | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchBudgetData() {
            try {
                const token = localStorage.getItem("token")
                if (!token) return

                // This endpoint would need to be created in the backend
                const res = await fetch(`${API_ENDPOINTS.TRANSACTIONS.BASE}/department-budget`, {
                    headers: { Authorization: `Bearer ${token}` },
                })

                if (res.ok) {
                    const data = await res.json()
                    setBudgetData(data)
                }
            } catch (error) {
                console.error("Failed to fetch department budget:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchBudgetData()
    }, [])

    if (loading || !budgetData) {
        return null // Don't show if user isn't part of a department
    }

    const percentUsed = (budgetData.currentSpend / budgetData.budgetLimit) * 100
    const remaining = budgetData.budgetLimit - budgetData.currentSpend
    const isNearLimit = percentUsed > 80
    const isOverBudget = percentUsed >= 100

    return (
    \u003cCard className = "border-l-4 border-l-blue-500 bg-white/80 backdrop-blur-sm dark:bg-slate-900/80"\u003e
    \u003cCardHeader\u003e
    \u003cdiv className = "flex items-start justify-between"\u003e
    \u003cdiv\u003e
    \u003cCardTitle className = "flex items-center gap-2"\u003e
    \u003cBuilding2 className = "h-5 w-5 text-blue-500" /\u003e
              Department Budget
    \u003c / CardTitle\u003e
    \u003cCardDescription\u003e
    { budgetData.departmentName } • { budgetData.organizationName }
    \u003c / CardDescription\u003e
    \u003c / div\u003e
    {
        isNearLimit \u0026\u0026(
            \u003cBadge variant = "destructive" className = "gap-1"\u003e
            \u003cAlertTriangle className = "h-3 w-3" /\u003e
              { isOverBudget? "Over Budget": "Near Limit" }
            \u003c / Badge\u003e
        )
    }
    \u003c / div\u003e
    \u003c / CardHeader\u003e
    \u003cCardContent className = "space-y-4"\u003e
    {/* Budget Progress */ }
    \u003cdiv className = "space-y-2"\u003e
    \u003cdiv className = "flex justify-between text-sm"\u003e
    \u003cspan className = "text-slate-600 dark:text-slate-400"\u003eSpent this month\u003c / span\u003e
    \u003cspan className = "font-semibold text-slate-900 dark:text-white"\u003e
              ${ budgetData.currentSpend.toLocaleString() } / ${budgetData.budgetLimit.toLocaleString()}
    \u003c / span\u003e
    \u003c / div\u003e
    \u003cProgress
    value = { Math.min(percentUsed, 100) }
    className = "h-2"
    indicatorClassName = { isOverBudget? "bg-red-500": isNearLimit ? "bg-yellow-500" : "bg-blue-500" }
        /\u003e
    \u003cdiv className = "flex justify-between items-center"\u003e
    \u003cspan className = "text-xs text-slate-500"\u003e
    { percentUsed.toFixed(1) }% used
    \u003c / span\u003e
    \u003cspan className = {`text-xs font-medium ${remaining \u003c 0 ? "text-red-600" : "text-slate-600 dark:text-slate-400"
} `}\u003e
              {remaining \u003e 0 ? `$${ remaining.toLocaleString() } remaining` : `$${ Math.abs(remaining).toLocaleString() } over`}
            \u003c/span\u003e
          \u003c/div\u003e
        \u003c/div\u003e

        {/* Warning Message */}
        {isNearLimit \u0026\u0026 (
          \u003cdiv className={`p - 3 rounded - lg ${ isOverBudget ? "bg-red-50 dark:bg-red-950" : "bg-yellow-50 dark:bg-yellow-950" } `}\u003e
            \u003cp className={`text - sm ${ isOverBudget ? "text-red-700 dark:text-red-300" : "text-yellow-700 dark:text-yellow-300" } `}\u003e
              {isOverBudget 
                ? "⚠️ Your department has exceeded the monthly budget. New transactions may be blocked." 
                : "⚠️ Approaching budget limit. Consider reducing spending."}
            \u003c/p\u003e
          \u003c/div\u003e
        )}
      \u003c/CardContent\u003e
    \u003c/Card\u003e
  )
}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Building2 } from "lucide-react"
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

        const res = await fetch(`${API_ENDPOINTS.TRANSACTIONS.ALL}/department-budget`, {
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
    return null
  }

  const percentUsed = (budgetData.currentSpend / budgetData.budgetLimit) * 100
  const remaining = budgetData.budgetLimit - budgetData.currentSpend
  const isNearLimit = percentUsed > 80
  const isOverBudget = percentUsed >= 100

  return (
    <Card className="border-l-4 border-l-blue-500 bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              Department Budget
            </CardTitle>
            <CardDescription>
              {budgetData.departmentName} • {budgetData.organizationName}
            </CardDescription>
          </div>
          {isNearLimit && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {isOverBudget ? "Over Budget" : "Near Limit"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Spent this month</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              ${budgetData.currentSpend.toLocaleString()} / ${budgetData.budgetLimit.toLocaleString()}
            </span>
          </div>
          <Progress
            value={Math.min(percentUsed, 100)}
            className="h-2"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">
              {percentUsed.toFixed(1)}% used
            </span>
            <span className={`text-xs font-medium ${remaining < 0 ? "text-red-600" : "text-slate-600 dark:text-slate-400"}`}>
              {remaining > 0 ? `$${remaining.toLocaleString()} remaining` : `$${Math.abs(remaining).toLocaleString()} over`}
            </span>
          </div>
        </div>

        {isNearLimit && (
          <div className={`p-3 rounded-lg ${isOverBudget ? "bg-red-50 dark:bg-red-950" : "bg-yellow-50 dark:bg-yellow-950"}`}>
            <p className={`text-sm ${isOverBudget ? "text-red-700 dark:text-red-300" : "text-yellow-700 dark:text-yellow-300"}`}>
              {isOverBudget
                ? "⚠️ Your department has exceeded the monthly budget. New transactions may be blocked."
                : "⚠️ Approaching budget limit. Consider reducing spending."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

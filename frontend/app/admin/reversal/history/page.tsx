"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { Search, RotateCcw, ArrowLeft, ArrowUpRight, ArrowDownRight, Calendar, User } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ReversalHistoryPage() {
  const [reversals, setReversals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const router = useRouter()

  useEffect(() => {
    setLoading(true)
    setError(null)
    const fetchReversals = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Authentication required. Please log in.")
          return
        }

        // Fetch all transactions and filter for reversals
        const res = await fetch("http://localhost:5000/api/transactions/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }

        const data = await res.json()
        if (Array.isArray(data)) {
          // Filter for transactions that are reversals (have parentId)
          const reversalTransactions = data.filter((tx: any) => tx.parentId)
          setReversals(reversalTransactions)
        } else {
          setError("Failed to load reversals: Invalid response format.")
        }
      } catch (e) {
        console.error("Error fetching reversals:", e)
        setError(`Failed to load reversals: ${e instanceof Error ? e.message : "Unknown error"}`)
      } finally {
        setLoading(false)
      }
    }
    fetchReversals()
  }, [])

  const filteredReversals = reversals.filter((reversal) => {
    const matchesSearch =
      reversal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reversal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reversal.parentId && reversal.parentId.toLowerCase().includes(searchTerm.toLowerCase()))

    // Date filtering logic would go here
    return matchesSearch
  })

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="ADMIN" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar userRole="ADMIN" userName="Admin User" />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.back()}
                className="bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center space-x-3">
                  <RotateCcw className="h-8 w-8 text-blue-600" />
                  <span>Reversal History</span>
                </h1>
                <p className="text-slate-600 dark:text-slate-400">Complete history of all transaction reversals</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="neumorphic border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reversals</CardTitle>
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reversals.length}</div>
                <p className="text-xs text-muted-foreground">All-time reversals</p>
              </CardContent>
            </Card>

            <Card className="neumorphic border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {reversals.filter((r) => {
                    const today = new Date().toDateString()
                    return new Date(r.createdAt).toDateString() === today
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground">Reversals today</p>
              </CardContent>
            </Card>

            <Card className="neumorphic border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <Calendar className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {reversals.filter((r) => {
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return new Date(r.createdAt) >= weekAgo
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </CardContent>
            </Card>

            <Card className="neumorphic border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  ${reversals.reduce((sum, r) => sum + Math.abs(r.amount), 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Reversed amount</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="neumorphic border-0 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by transaction ID, description, or original ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reversals List */}
          <Card className="neumorphic border-0">
            <CardHeader>
              <CardTitle>All Reversals</CardTitle>
              <CardDescription>
                {loading ? "Loading..." : error ? "Error loading reversals" : `${filteredReversals.length} reversals found`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-muted-foreground mt-4">Loading reversal history...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-4">⚠️ Error</div>
                  <p className="text-muted-foreground">{error}</p>
                  <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              )}

              {!loading && !error && filteredReversals.length === 0 && (
                <div className="text-center py-12">
                  <RotateCcw className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Reversals Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "No reversals match your search criteria" : "No transaction reversals have been made yet"}
                  </p>
                </div>
              )}

              {!loading && !error && filteredReversals.length > 0 && (
                <div className="space-y-4">
                  {filteredReversals.map((reversal) => (
                    <div
                      key={reversal.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-l-4 border-blue-600"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                          <RotateCcw className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-medium">{reversal.description}</p>
                            <Badge variant="outline" className="text-xs">
                              Reversal
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>
                              <strong>Reversal ID:</strong> {reversal.id}
                            </p>
                            <p>
                              <strong>Original Transaction:</strong> {reversal.parentId || "N/A"}
                            </p>
                            <p>
                              <strong>Date:</strong> {new Date(reversal.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="text-xl font-semibold text-blue-600">
                            ${Math.abs(reversal.amount).toFixed(2)}
                          </p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {reversal.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

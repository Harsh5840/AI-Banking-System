"use client"


import { API_ENDPOINTS } from "@/lib/api-endpoints"
import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, TrendingUp, DollarSign, Users, Activity, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts"

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [timeRange, setTimeRange] = useState("1month")

  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {}

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true)
      setError(null)
      try {
        // Fetch all users
        const usersRes = await axios.get(API_ENDPOINTS.USERS.ALL, config)
        const users = usersRes.data

        // Fetch all transactions
        const transactionsRes = await axios.get(API_ENDPOINTS.TRANSACTIONS.ALL, config)
        const transactions = transactionsRes.data

        // Calculate analytics
        const totalUsers = users.length
        const activeUsers = users.filter((u: any) => u.status === 'active').length
        const totalTransactions = transactions.length
        const totalVolume = transactions.reduce((sum: number, tx: any) => sum + Math.abs(tx.amount), 0)
        
        // Category breakdown
        const categoryMap: { [key: string]: number } = {}
        transactions.forEach((tx: any) => {
          const cat = tx.category || 'others'
          categoryMap[cat] = (categoryMap[cat] || 0) + Math.abs(tx.amount)
        })
        const topCategories = Object.entries(categoryMap)
          .map(([category, total]) => ({ category, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5)

        // Monthly trend (last 6 months)
        const monthlyData: { [key: string]: number } = {}
        transactions.forEach((tx: any) => {
          const date = new Date(tx.createdAt)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Math.abs(tx.amount)
        })
        const monthlyTrend = Object.entries(monthlyData)
          .map(([month, total]) => ({ month, total }))
          .sort((a, b) => a.month.localeCompare(b.month))
          .slice(-6)

        // Risk analysis
        const highRisk = transactions.filter((tx: any) => tx.riskScore >= 70).length
        const mediumRisk = transactions.filter((tx: any) => tx.riskScore >= 40 && tx.riskScore < 70).length
        const lowRisk = transactions.filter((tx: any) => tx.riskScore < 40).length

        // User activity (transactions per user)
        const userActivity = users.map((u: any) => ({
          name: u.name || u.email,
          transactions: u.totalTransactions || 0,
          volume: u.totalVolume || 0,
        })).sort((a: any, b: any) => b.volume - a.volume).slice(0, 10)

        setAnalytics({
          totalUsers,
          activeUsers,
          totalTransactions,
          totalVolume,
          topCategories,
          monthlyTrend,
          riskDistribution: [
            { name: 'Low Risk', value: lowRisk, color: '#10B981' },
            { name: 'Medium Risk', value: mediumRisk, color: '#F59E0B' },
            { name: 'High Risk', value: highRisk, color: '#EF4444' },
          ],
          userActivity,
        })
      } catch (err: any) {
        setError("Could not fetch analytics data.")
        toast({
          title: "Error loading analytics",
          description: err?.response?.data?.error || "Could not fetch analytics data.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchAnalytics()
  }, [token, timeRange])

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your analytics report is being generated...",
    })
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar userRole="ADMIN" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar userRole="ADMIN" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Analytics</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="ADMIN" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar userRole="ADMIN" userName="Admin User" />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">System Analytics</h1>
              <p className="text-slate-600 dark:text-slate-400">Platform-wide insights and performance metrics</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="neumorphic border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalUsers}</div>
                <p className="text-xs text-muted-foreground">{analytics.activeUsers} active users</p>
              </CardContent>
            </Card>

            <Card className="neumorphic border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{analytics.totalTransactions}</div>
                <p className="text-xs text-muted-foreground">All-time transactions</p>
              </CardContent>
            </Card>

            <Card className="neumorphic border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${analytics.totalVolume.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Transaction volume</p>
              </CardContent>
            </Card>

            <Card className="neumorphic border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg per User</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  ${(analytics.totalVolume / analytics.totalUsers).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <p className="text-xs text-muted-foreground">Average volume per user</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Trend */}
            <Card className="neumorphic border-0">
              <CardHeader>
                <CardTitle>Monthly Transaction Volume</CardTitle>
                <CardDescription>Last 6 months transaction trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="total" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card className="neumorphic border-0">
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
                <CardDescription>Spending distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={analytics.topCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="total"
                      label
                    >
                      {analytics.topCategories.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {analytics.topCategories.map((cat: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span>{cat.category}</span>
                      </div>
                      <span className="font-medium">${cat.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Risk Distribution */}
            <Card className="neumorphic border-0">
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>Transaction risk assessment breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.riskDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6">
                      {analytics.riskDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Users */}
            <Card className="neumorphic border-0">
              <CardHeader>
                <CardTitle>Most Active Users</CardTitle>
                <CardDescription>Top 10 users by transaction volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {analytics.userActivity.map((user: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.transactions} transactions</p>
                        </div>
                      </div>
                      <p className="font-semibold text-green-600">${user.volume.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}


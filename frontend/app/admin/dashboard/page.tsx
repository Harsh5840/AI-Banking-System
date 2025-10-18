"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { Users, AlertTriangle, RotateCcw, TrendingUp, Shield, Activity } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { useEffect, useState } from "react"

export default function AdminDashboard() {
  // State for all users and transactions
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [allTransactions, setAllTransactions] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [transactionsLoading, setTransactionsLoading] = useState(true)

  // Fetch all users
  useEffect(() => {
    setUsersLoading(true)
    const fetchUsers = async () => {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:5000/api/users/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setAllUsers(Array.isArray(data) ? data : [])
      setUsersLoading(false)
    }
    fetchUsers()
  }, [])

  // Fetch all transactions
  useEffect(() => {
    setTransactionsLoading(true)
    const fetchTransactions = async () => {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:5000/api/transactions/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setAllTransactions(Array.isArray(data) ? data : [])
      setTransactionsLoading(false)
    }
    fetchTransactions()
  }, [])

  // Calculate statistics
  const loading = usersLoading || transactionsLoading
  const totalUsers = allUsers.length
  const activeUsers = allUsers.filter(u => u.status === 'active').length
  const totalTransactions = allTransactions.length
  const totalVolume = allTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
  const highRiskTransactions = allTransactions.filter(tx => tx.riskScore >= 70).length
  const reversedTransactions = allTransactions.filter(tx => tx.parentId).length

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userRole="ADMIN" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar userRole="ADMIN" userName="Admin User" />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Admin Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400">System overview and key metrics</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="neumorphic border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "Loading..." : `${activeUsers} active users`}
                </p>
              </CardContent>
            </Card>

            <Card className="neumorphic border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : totalTransactions}</div>
                <p className="text-xs text-muted-foreground">All-time transactions</p>
              </CardContent>
            </Card>

            <Card className="neumorphic border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {loading ? "..." : `$${totalVolume.toLocaleString()}`}
                </div>
                <p className="text-xs text-muted-foreground">Transaction volume</p>
              </CardContent>
            </Card>

            <Card className="neumorphic border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {loading ? "..." : highRiskTransactions}
                </div>
                <p className="text-xs text-muted-foreground">Flagged transactions</p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="neumorphic border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reversals</CardTitle>
                <RotateCcw className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {loading ? "..." : reversedTransactions}
                </div>
                <p className="text-xs text-muted-foreground">Total reversals</p>
              </CardContent>
            </Card>

            <Card className="neumorphic border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Shield className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-green-600 rounded-full animate-pulse"></div>
                  <span className="text-lg font-semibold text-green-600">Operational</span>
                </div>
                <p className="text-xs text-muted-foreground">All systems running</p>
              </CardContent>
            </Card>

            <Card className="neumorphic border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {loading ? "..." : activeUsers}
                </div>
                <p className="text-xs text-muted-foreground">Currently online</p>
              </CardContent>
            </Card>
          </div>

          {/* All Users Table */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>List of all users in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div>Loading users...</div>
              ) : (
                <div className="space-y-2">
                  {allUsers.map(user => (
                    <div key={user.id} className="flex justify-between border-b py-2">
                      <span>{user.name} ({user.email})</span>
                      <span>{user.status}</span>
                    </div>
                  ))}
                  {allUsers.length === 0 && <div>No users found.</div>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest 10 transactions across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-muted-foreground mt-4">Loading transactions...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allTransactions.slice(0, 10).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${tx.amount > 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                          <Activity className={`h-4 w-4 ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">{tx.user?.email || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.amount > 0 ? '+' : ''}${tx.amount.toFixed(2)}
                        </p>
                        <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {allTransactions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">No transactions found.</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

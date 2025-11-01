"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { ArrowLeft, AlertTriangle, CheckCircle, RotateCcw, ArrowRight } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { API_ENDPOINTS } from "@/lib/api-endpoints"

export default function DetailedReversalPage() {
  const params = useParams()
  const hash = params?.hash as string
  const router = useRouter()
  const { toast } = useToast()
  
  const [transaction, setTransaction] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reversalReason, setReversalReason] = useState("")
  const [confirmationCode, setConfirmationCode] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!hash) return
    
    const fetchTransaction = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Authentication required. Please log in.")
          return
        }

        // Fetch all transactions and find the one with this hash
        const res = await fetch(API_ENDPOINTS.TRANSACTIONS.ALL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }

        const data = await res.json()
        if (Array.isArray(data)) {
          // Find transaction by ID (using hash as ID for now)
          const tx = data.find((t: any) => t.id === hash || t.hash === hash)
          if (tx) {
            setTransaction(tx)
          } else {
            setError("Transaction not found")
          }
        } else {
          setError("Failed to load transaction")
        }
      } catch (e) {
        console.error("Error fetching transaction:", e)
        setError(`Failed to load transaction: ${e instanceof Error ? e.message : "Unknown error"}`)
      } finally {
        setLoading(false)
      }
    }

    fetchTransaction()
  }, [hash])

  const handleReversal = async () => {
    if (!reversalReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for this reversal",
        variant: "destructive",
      })
      return
    }

    if (confirmationCode !== "CONFIRM") {
      toast({
        title: "Invalid Confirmation",
        description: "Please type 'CONFIRM' to proceed with reversal",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(API_ENDPOINTS.REVERSAL.REVERSE(hash), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: reversalReason }),
      })

      if (res.ok) {
        toast({
          title: "Reversal Successful",
          description: `Transaction ${hash} has been successfully reversed`,
        })
        router.push("/admin/reversal/history")
      } else {
        const data = await res.json()
        throw new Error(data.error || "Reversal failed")
      }
    } catch (e) {
      toast({
        title: "Reversal Failed",
        description: e instanceof Error ? e.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar userRole="ADMIN" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading transaction details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar userRole="ADMIN" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Transaction</h2>
            <p className="text-muted-foreground mb-4">{error || "Transaction not found"}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
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
          <div className="flex items-center space-x-4 mb-8">
            <Button variant="outline" size="icon" onClick={() => router.back()} className="bg-transparent">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center space-x-3">
                <RotateCcw className="h-8 w-8 text-red-600" />
                <span>Detailed Transaction Reversal</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400">Review and reverse transaction with full audit trail</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction Details */}
            <Card className="neumorphic border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>Transaction Details</span>
                  {transaction.canReverse ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Reversible
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Not Reversible</Badge>
                  )}
                </CardTitle>
                <CardDescription>Original transaction information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Transaction ID</Label>
                  <p className="font-mono text-sm">{transaction.id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="font-medium">{transaction.description}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Amount</Label>
                  <p className="text-2xl font-bold text-red-600">
                    {transaction.amount > 0 ? "+" : ""}${transaction.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Category</Label>
                  <Badge>{transaction.category}</Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                    {transaction.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <p>{new Date(transaction.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">User</Label>
                  <p>
                    {transaction.user?.name} ({transaction.user?.email})
                  </p>
                </div>
                {transaction.riskScore !== undefined && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Risk Score</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            transaction.riskScore >= 70
                              ? "bg-red-600"
                              : transaction.riskScore >= 40
                                ? "bg-yellow-600"
                                : "bg-green-600"
                          }`}
                          style={{ width: `${transaction.riskScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{transaction.riskScore}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reversal Form */}
            <Card className="neumorphic border-0">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Reversal Action</span>
                </CardTitle>
                <CardDescription>This action cannot be undone. Please proceed with caution.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Warning Notice */}
                <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">Warning</h3>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Reversing this transaction will create a counter-entry that nullifies the original transaction.
                        This action is permanent and will be recorded in the audit log.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reversal Form Fields */}
                {transaction.canReverse ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="reasonTextarea">Reason for Reversal *</Label>
                      <Textarea
                        id="reasonTextarea"
                        placeholder="Enter detailed reason for this reversal..."
                        value={reversalReason}
                        onChange={(e) => setReversalReason(e.target.value)}
                        rows={4}
                        className="resize-none"
                        autoComplete="off"
                      />
                      <p className="text-xs text-muted-foreground">
                        This will be recorded in the audit log ({reversalReason.length} characters)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmInput">Type "CONFIRM" to proceed *</Label>
                      <Input
                        id="confirmInput"
                        placeholder="Type CONFIRM here..."
                        value={confirmationCode}
                        onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
                        className="font-mono uppercase"
                        autoComplete="off"
                        spellCheck={false}
                      />
                      {confirmationCode && confirmationCode !== "CONFIRM" && (
                        <p className="text-xs text-red-500">Must type exactly "CONFIRM"</p>
                      )}
                      {confirmationCode === "CONFIRM" && (
                        <p className="text-xs text-green-600">✓ Confirmation code correct</p>
                      )}
                    </div>

                    {/* Reversal Preview */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Reversal Preview</h4>
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-blue-700 dark:text-blue-300">Original Amount:</p>
                          <p className="font-mono font-bold">${transaction.amount.toFixed(2)}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-blue-700 dark:text-blue-300">After Reversal:</p>
                          <p className="font-mono font-bold text-green-600">$0.00</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.back()}
                        disabled={isProcessing}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={handleReversal}
                        disabled={isProcessing || !reversalReason.trim() || confirmationCode !== "CONFIRM"}
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Execute Reversal
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Transaction Cannot Be Reversed</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This transaction does not meet the criteria for reversal. Possible reasons:
                    </p>
                    <ul className="text-sm text-muted-foreground text-left max-w-md mx-auto space-y-1">
                      <li>• Transaction has already been reversed</li>
                      <li>• Transaction is older than 30 days</li>
                      <li>• Transaction status is not "completed"</li>
                      <li>• Transaction is a system transaction</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

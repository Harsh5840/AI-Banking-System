'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Edit3, Trash2, Wallet, Building, PiggyBank, BarChart3, Shield, Zap, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

type AccountType = 'SAVINGS' | 'WALLET' | 'BUSINESS';

interface Account {
  id: string;
  name: string;
  type: AccountType;
  createdAt: string;
  userId: string;
}

interface CreateAccountData {
  name: string;
  type: AccountType;
}

const AccountsPage = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const [newAccount, setNewAccount] = useState<CreateAccountData>({
    name: '',
    type: 'WALLET'
  });

  const [editName, setEditName] = useState('');

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || '';
    }
    return '';
  };

  const getAxiosConfig = () => {
    const token = getAuthToken();
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  };

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(API_ENDPOINTS.ACCOUNTS.ME, getAxiosConfig());
      setAccounts(Array.isArray(response.data) ? response.data : response.data.accounts || []);
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.message || err.message 
        : 'Failed to fetch accounts';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: 'Failed to load accounts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!newAccount.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an account name.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreateLoading(true);
      const response = await axios.post(API_ENDPOINTS.ACCOUNTS.CREATE, newAccount, getAxiosConfig());

      setAccounts(prev => [...prev, response.data.account]);
      setNewAccount({ name: '', type: 'WALLET' });
      setCreateModalOpen(false);
      
      toast({
        title: 'Success',
        description: 'Account created successfully!',
      });
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.message || err.message 
        : 'Failed to create account';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateAccount = async () => {
    if (!editingAccount || !editName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid account name.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUpdateLoading(true);
      await axios.put(API_ENDPOINTS.ACCOUNTS.UPDATE(editingAccount.id), { name: editName }, getAxiosConfig());

      setAccounts(prev => 
        prev.map(account => 
          account.id === editingAccount.id 
            ? { ...account, name: editName }
            : account
        )
      );
      
      setEditingAccount(null);
      setEditName('');
      
      toast({
        title: 'Success',
        description: 'Account updated successfully!',
      });
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.message || err.message 
        : 'Failed to update account';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      setDeleteLoading(accountId);
      await axios.delete(API_ENDPOINTS.ACCOUNTS.DELETE(accountId), getAxiosConfig());

      setAccounts(prev => prev.filter(account => account.id !== accountId));
      
      toast({
        title: 'Success',
        description: 'Account deleted successfully!',
      });
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.message || err.message 
        : 'Failed to delete account';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const getAccountTypeConfig = (type: AccountType) => {
    switch (type) {
      case 'SAVINGS':
        return {
          icon: <PiggyBank className="h-5 w-5" />,
          color: 'bg-emerald-500',
          lightColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          darkColor: 'dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
        };
      case 'BUSINESS':
        return {
          icon: <Building className="h-5 w-5" />,
          color: 'bg-blue-500',
          lightColor: 'bg-blue-50 text-blue-700 border-blue-200',
          darkColor: 'dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
        };
      case 'WALLET':
      default:
        return {
          icon: <Wallet className="h-5 w-5" />,
          color: 'bg-purple-500',
          lightColor: 'bg-purple-50 text-purple-700 border-purple-200',
          darkColor: 'dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar userRole="USER" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar userRole="USER" userName="User" />
          <main className="flex-1 overflow-y-auto p-6">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  Financial Accounts
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Manage your financial accounts
                </p>
              </div>
              
              <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-slate-900">
                  <DialogHeader>
                    <DialogTitle>Create New Account</DialogTitle>
                    <DialogDescription>
                      Add a new financial account to track your transactions.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Account Name</Label>
                      <Input
                        id="name"
                        value={newAccount.name}
                        onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter account name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Account Type</Label>
                      <Select
                        value={newAccount.type}
                        onValueChange={(value: AccountType) => setNewAccount(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WALLET">
                            <div className="flex items-center gap-2">
                              <Wallet className="h-4 w-4 text-purple-500" />
                              Wallet
                            </div>
                          </SelectItem>
                          <SelectItem value="SAVINGS">
                            <div className="flex items-center gap-2">
                              <PiggyBank className="h-4 w-4 text-emerald-500" />
                              Savings
                            </div>
                          </SelectItem>
                          <SelectItem value="BUSINESS">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-blue-500" />
                              Business
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setCreateModalOpen(false)}
                      disabled={createLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateAccount} 
                      disabled={createLoading}
                    >
                      {createLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-6">
                  <p className="text-red-600">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!loading && !error && accounts.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Wallet className="h-16 w-16 text-slate-400" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">No Accounts Yet</h3>
                      <p className="text-slate-600 mb-6">
                        Create your first account to start managing your finances
                      </p>
                      <Button onClick={() => setCreateModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Accounts List */}
            {!loading && !error && accounts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((account) => {
                  const typeConfig = getAccountTypeConfig(account.type);
                  return (
                    <Card key={account.id} className="hover:shadow-lg transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 ${typeConfig.color} rounded-xl text-white`}>
                              {typeConfig.icon}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{account.name}</CardTitle>
                              <Badge variant="outline" className="mt-1">
                                {account.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Created</span>
                          <span className="font-medium">{formatDate(account.createdAt)}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Account ID</span>
                          <span className="font-mono text-xs">{account.id.slice(-8)}</span>
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setEditingAccount(account);
                              setEditName(account.name);
                            }}
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 text-red-600 border-red-200"
                                disabled={deleteLoading === account.id}
                              >
                                {deleteLoading === account.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete
                                  </>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{account.name}" and all associated transactions.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAccount(account.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Account
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingAccount} onOpenChange={() => setEditingAccount(null)}>
        <DialogContent className="bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>
              Update the name of your account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Account Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter account name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingAccount(null)}
              disabled={updateLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateAccount} 
              disabled={updateLoading}
            >
              {updateLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccountsPage;


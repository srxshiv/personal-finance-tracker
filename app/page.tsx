"use client";

import { useState, useEffect } from 'react';
import { Transaction } from '@/types/transaction';
import { Budget } from '@/types/budget';
import { transactionAPI } from '@/lib/transactions';
import { budgetAPI, getBudgetComparison, generateSpendingInsights, getCurrentMonth, getMonthName } from '@/lib/budgets';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import ExpenseChart from '@/components/ExpenseChart';
import SummaryCards from '@/components/SummaryCards';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import RecentTransactions from '@/components/RecentTransactions';
import BudgetForm from '@/components/BudgetForm';
import BudgetVsActualChart from '@/components/BudgetVsActualChart';
import BudgetList from '@/components/BudgetList';
import SpendingInsights from '@/components/SpendingInsights';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Wallet, RefreshCw, Target, TrendingUp, Calendar } from 'lucide-react';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [transactionData, budgetData] = await Promise.all([
        transactionAPI.getAll(),
        budgetAPI.getAll(selectedMonth)
      ]);
      setTransactions(transactionData);
      setBudgets(budgetData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const budgetComparisons = getBudgetComparison(budgets, transactions, selectedMonth);
  const spendingInsights = generateSpendingInsights(transactions, budgetComparisons);

  const handleSaveTransaction = async (transaction: Transaction) => {
    await loadData();
    setIsTransactionFormOpen(false);
    setEditingTransaction(null);
  };

  const handleSaveBudget = async (budget: Budget) => {
    await loadData();
    setIsBudgetFormOpen(false);
    setEditingBudget(null);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionFormOpen(true);
  };

  const handleEditBudget = (category: string) => {
    const budget = budgets.find(b => b.category === category);
    if (budget) {
      setEditingBudget(budget);
      setIsBudgetFormOpen(true);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await transactionAPI.delete(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleDeleteBudget = async (category: string) => {
    try {
      const budget = budgets.find(b => b.category === category);
      if (budget) {
        await budgetAPI.delete(budget._id);
        await loadData();
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const handleCancelForms = () => {
    setIsTransactionFormOpen(false);
    setIsBudgetFormOpen(false);
    setEditingTransaction(null);
    setEditingBudget(null);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
  };

  const existingBudgetCategories = budgets
    .filter(b => b.month === selectedMonth)
    .map(b => b.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-xl">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Personal Finance Dashboard</h1>
                <p className="text-gray-600">Track your income, expenses, and budgets with detailed insights</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                disabled={isRefreshing}
                className="flex items-center gap-2 hover:bg-gray-50"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={() => setIsBudgetFormOpen(true)}
                variant="outline"
                className="bg-green-600 text-white hover:bg-green-700 border-green-600"
              >
                <Target className="h-4 w-4 mr-2" />
                Set Budget
              </Button>
              <Button
                onClick={() => setIsTransactionFormOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 shadow-lg"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          </div>


          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <label htmlFor="month" className="text-sm font-medium text-gray-700">
                Viewing:
              </label>
            </div>
            <Input
              id="month"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-48"
            />
            <span className="text-sm text-gray-600 font-medium">
              {getMonthName(selectedMonth)}
            </span>
          </div>


          <SummaryCards transactions={transactions} />
        </div>


        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-12">

              {(isTransactionFormOpen || isBudgetFormOpen) && (
                <div className="lg:col-span-4">
                  {isTransactionFormOpen && (
                    <TransactionForm
                      transaction={editingTransaction}
                      onSave={handleSaveTransaction}
                      onCancel={handleCancelForms}
                    />
                  )}
                  {isBudgetFormOpen && (
                    <BudgetForm
                      budget={editingBudget}
                      onSave={handleSaveBudget}
                      onCancel={handleCancelForms}
                      existingCategories={existingBudgetCategories}
                    />
                  )}
                </div>
              )}


              <div className={`${(isTransactionFormOpen || isBudgetFormOpen) ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
                <div className="grid gap-8">

                  <div className="grid gap-8 lg:grid-cols-2">
                    <ExpenseChart transactions={transactions} />
                    <CategoryBreakdown transactions={transactions} />
                  </div>


                  <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                      <RecentTransactions transactions={transactions} limit={6} />
                    </div>
                    <div className="lg:col-span-2">
                      <TransactionList
                        transactions={transactions}
                        onEdit={handleEditTransaction}
                        onDelete={handleDeleteTransaction}
                        isLoading={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-12">
              {isBudgetFormOpen && (
                <div className="lg:col-span-4">
                  <BudgetForm
                    budget={editingBudget}
                    onSave={handleSaveBudget}
                    onCancel={handleCancelForms}
                    existingCategories={existingBudgetCategories}
                  />
                </div>
              )}

              <div className={`${isBudgetFormOpen ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
                <div className="grid gap-8">
                  <BudgetVsActualChart budgetComparisons={budgetComparisons} />
                  <BudgetList
                    budgetComparisons={budgetComparisons}
                    onEdit={handleEditBudget}
                    onDelete={handleDeleteBudget}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <SpendingInsights insights={spendingInsights} />
              <BudgetVsActualChart budgetComparisons={budgetComparisons} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
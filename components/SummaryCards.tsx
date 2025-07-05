"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/transaction';
import { formatCurrency, getCategoryBreakdown } from '@/lib/transactions';
import { TrendingUp, TrendingDown, DollarSign, Calendar, PieChart } from 'lucide-react';

interface SummaryCardsProps {
  transactions: Transaction[];
}

export default function SummaryCards({ transactions }: SummaryCardsProps) {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthTransactions = transactions.filter(t => 
    t.date.startsWith(currentMonth)
  );

  const thisMonthExpenses = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const categoryBreakdown = getCategoryBreakdown(transactions);
  const topCategory = categoryBreakdown[0];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Income</CardTitle>
          <div className="p-2 bg-green-100 rounded-full">
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            From {transactions.filter(t => t.type === 'income').length} transactions
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
          <div className="p-2 bg-red-100 rounded-full">
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalExpenses)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            From {transactions.filter(t => t.type === 'expense').length} transactions
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Net Balance</CardTitle>
          <div className="p-2 bg-blue-100 rounded-full">
            <DollarSign className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(netBalance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Income - Expenses
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Top Category</CardTitle>
          <div className="p-2 bg-purple-100 rounded-full">
            <PieChart className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {topCategory ? formatCurrency(topCategory.amount) : '$0.00'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {topCategory ? `${topCategory.category} (${topCategory.percentage.toFixed(1)}%)` : 'No expenses yet'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types/transaction';
import { getRecentTransactions, formatCurrency, CATEGORY_COLORS } from '@/lib/transactions';
import { Clock, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
  limit?: number;
}

export default function RecentTransactions({ transactions, limit = 5 }: RecentTransactionsProps) {
  const recentTransactions = getRecentTransactions(transactions, limit);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      if (diffInHours < 1) return 'Just now';
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays}d ago`;
      return formatDate(dateString);
    }
  };

  if (recentTransactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-medium">No transactions yet</p>
            <p className="text-sm">Add your first transaction to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTransactions.map((transaction, index) => (
            <div
              key={transaction._id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-sm">
                    {transaction.description}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {transaction.type === 'expense' && (
                      <Badge 
                        variant="secondary"
                        className="text-xs"
                        style={{ 
                          backgroundColor: `${CATEGORY_COLORS[transaction.category as keyof typeof CATEGORY_COLORS] || '#6b7280'}20`,
                          color: CATEGORY_COLORS[transaction.category as keyof typeof CATEGORY_COLORS] || '#6b7280',
                          border: `1px solid ${CATEGORY_COLORS[transaction.category as keyof typeof CATEGORY_COLORS] || '#6b7280'}40`
                        }}
                      >
                        {transaction.category}
                      </Badge>
                    )}
                    {transaction.type === 'income' && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                        Income
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatTime(transaction.createdAt || transaction.date)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
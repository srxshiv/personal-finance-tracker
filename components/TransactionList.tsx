"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types/transaction';
import { formatCurrency, CATEGORY_COLORS } from '@/lib/transactions';
import { Edit3, Trash2, Search, Calendar, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export default function TransactionList({ transactions, onEdit, onDelete, isLoading }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredTransactions = transactions
    .filter(transaction =>
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return b.amount - a.amount;
      }
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setDeletingId(id);
      try {
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-muted-foreground mb-4">
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
          <Calendar className="h-5 w-5" />
          Transaction History
        </CardTitle>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy(sortBy === 'date' ? 'amount' : 'date')}
          >
            Sort by {sortBy === 'date' ? 'Amount' : 'Date'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction._id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {transaction.type === 'income' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium">{transaction.description}</span>
                  </div>
                  {transaction.type === 'expense' ? (
                    <Badge 
                      variant="secondary"
                      style={{ 
                        backgroundColor: `${CATEGORY_COLORS[transaction.category as keyof typeof CATEGORY_COLORS] || '#6b7280'}20`,
                        color: CATEGORY_COLORS[transaction.category as keyof typeof CATEGORY_COLORS] || '#6b7280',
                        border: `1px solid ${CATEGORY_COLORS[transaction.category as keyof typeof CATEGORY_COLORS] || '#6b7280'}40`
                      }}
                    >
                      {transaction.category}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      Income
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{formatDate(transaction.date)}</span>
                  <span
                    className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(transaction)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(transaction._id)}
                  className="text-red-600 hover:text-red-800"
                  disabled={deletingId === transaction._id}
                >
                  {deletingId === transaction._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
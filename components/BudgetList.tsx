"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BudgetComparison } from '@/types/budget';
import { formatCurrency } from '@/lib/transactions';
import { Edit3, Trash2, Target, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface BudgetListProps {
  budgetComparisons: BudgetComparison[];
  onEdit: (category: string) => void;
  onDelete: (category: string) => void;
  isLoading?: boolean;
}

export default function BudgetList({ budgetComparisons, onEdit, onDelete, isLoading }: BudgetListProps) {
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);

  const handleDelete = async (category: string) => {
    if (window.confirm(`Are you sure you want to delete the budget for ${category}?`)) {
      setDeletingCategory(category);
      try {
        await onDelete(category);
      } finally {
        setDeletingCategory(null);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'on-track':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'on-track':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading budgets...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (budgetComparisons.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-muted-foreground mb-4">
            <Target className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-medium">No budgets set</p>
            <p className="text-sm">Set your first budget to start tracking your spending</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Budget Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {budgetComparisons.map((comparison) => (
            <div
              key={comparison.category}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(comparison.status)}
                  <div>
                    <h3 className="font-medium">{comparison.category}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(comparison.actual)} of {formatCurrency(comparison.budgeted)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(comparison.status)}>
                    {comparison.percentage.toFixed(0)}%
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(comparison.category)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(comparison.category)}
                    className="text-red-600 hover:text-red-800"
                    disabled={deletingCategory === comparison.category}
                  >
                    {deletingCategory === comparison.category ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className={comparison.remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {comparison.remaining >= 0 ? 'Remaining: ' : 'Over by: '}
                    {formatCurrency(Math.abs(comparison.remaining))}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(comparison.percentage)}`}
                    style={{
                      width: `${Math.min(comparison.percentage, 100)}%`,
                    }}
                  />
                  {comparison.percentage > 100 && (
                    <div
                      className="h-2 bg-red-500 rounded-full mt-1"
                      style={{
                        width: `${Math.min(comparison.percentage - 100, 100)}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
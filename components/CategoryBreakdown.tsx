"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types/transaction';
import { getCategoryBreakdown, formatCurrency, CATEGORY_COLORS } from '@/lib/transactions';
import { BarChart3, TrendingDown } from 'lucide-react';

interface CategoryBreakdownProps {
  transactions: Transaction[];
}

export default function CategoryBreakdown({ transactions }: CategoryBreakdownProps) {
  const categoryBreakdown = getCategoryBreakdown(transactions);

  if (categoryBreakdown.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <TrendingDown className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-medium">No expense data</p>
            <p className="text-sm">Add some expense transactions to see the breakdown</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Category Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categoryBreakdown.map((category, index) => (
            <div key={category.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary"
                    style={{ 
                      backgroundColor: `${CATEGORY_COLORS[category.category as keyof typeof CATEGORY_COLORS] || '#6b7280'}20`,
                      color: CATEGORY_COLORS[category.category as keyof typeof CATEGORY_COLORS] || '#6b7280',
                      border: `1px solid ${CATEGORY_COLORS[category.category as keyof typeof CATEGORY_COLORS] || '#6b7280'}40`
                    }}
                  >
                    {category.category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {category.count} transaction{category.count !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-red-600">
                    {formatCurrency(category.amount)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {category.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${category.percentage}%`,
                    backgroundColor: CATEGORY_COLORS[category.category as keyof typeof CATEGORY_COLORS] || '#6b7280'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
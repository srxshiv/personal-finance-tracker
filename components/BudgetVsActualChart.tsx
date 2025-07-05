"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import React from 'react';
import { BudgetComparison } from '@/types/budget';
import { formatCurrency } from '@/lib/transactions';
import { BarChart3 } from 'lucide-react';

interface BudgetVsActualChartProps {
  budgetComparisons: BudgetComparison[];
}

export default function BudgetVsActualChart({ budgetComparisons }: BudgetVsActualChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const budgeted = payload.find((p: any) => p.dataKey === 'budgeted')?.value || 0;
      const actual = payload.find((p: any) => p.dataKey === 'actual')?.value || 0;
      const percentage = budgeted > 0 ? (actual / budgeted) * 100 : 0;
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">
            Budgeted: {formatCurrency(budgeted)}
          </p>
          <p className="text-red-600">
            Actual: {formatCurrency(actual)}
          </p>
          <p className="text-sm text-muted-foreground">
            {percentage.toFixed(1)}% of budget used
          </p>
        </div>
      );
    }
    return null;
  };

  if (budgetComparisons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Budget vs Actual
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-medium">No budget data</p>
            <p className="text-sm">Set some budgets to see the comparison</p>
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
          Budget vs Actual
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {/* @ts-ignore */}
          <ResponsiveContainer width="100%" height="100%">
            {/* @ts-ignore */}
            <BarChart
              data={budgetComparisons}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              {/* @ts-ignore */}
              <CartesianGrid strokeDasharray="3 3" />
              {/* @ts-ignore */}
              <XAxis 
                dataKey="category" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              {/* @ts-ignore */}
              <YAxis 
                tickFormatter={(value) => `$${value}`}
                fontSize={12}
              />
              {/* @ts-ignore */}
              <Tooltip content={<CustomTooltip />} />
              {/* @ts-ignore */}
              <Legend />
              {/* @ts-ignore */}
              <Bar 
                dataKey="budgeted" 
                fill="#3b82f6" 
                name="Budgeted"
                radius={[2, 2, 0, 0]}
              />
              {/* @ts-ignore */}
              <Bar 
                dataKey="actual" 
                fill="#ef4444" 
                name="Actual"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
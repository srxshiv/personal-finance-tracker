import { Budget, BudgetComparison, SpendingInsight } from '@/types/budget';
import { Transaction } from '@/types/transaction';
import { formatCurrency } from '@/lib/transactions';

export const budgetAPI = {
  getAll: async (month?: string): Promise<Budget[]> => {
    try {
      const url = month ? `/api/budgets?month=${month}` : '/api/budgets';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch budgets');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching budgets:', error);
      return [];
    }
  },

  add: async (budget: Omit<Budget, '_id' | 'createdAt' | 'updatedAt'>): Promise<Budget> => {
    const response = await fetch('/api/budgets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(budget),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create budget');
    }

    return await response.json();
  },

  update: async (id: string, updates: Partial<Budget>): Promise<Budget> => {
    const response = await fetch(`/api/budgets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update budget');
    }

    return await response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/budgets/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete budget');
    }
  },
};

export const getBudgetComparison = (
  budgets: Budget[],
  transactions: Transaction[],
  month: string
): BudgetComparison[] => {
  const monthTransactions = transactions.filter(
    t => t.type === 'expense' && t.date.startsWith(month)
  );

  const actualSpending: { [category: string]: number } = {};
  monthTransactions.forEach(transaction => {
    actualSpending[transaction.category] = (actualSpending[transaction.category] || 0) + transaction.amount;
  });

  return budgets.map(budget => {
    const actual = actualSpending[budget.category] || 0;
    const remaining = budget.amount - actual;
    const percentage = budget.amount > 0 ? (actual / budget.amount) * 100 : 0;
    
    let status: 'under' | 'over' | 'on-track' = 'under';
    if (percentage > 100) status = 'over';
    else if (percentage >= 80) status = 'on-track';

    return {
      category: budget.category,
      budgeted: budget.amount,
      actual,
      remaining,
      percentage,
      status
    };
  });
};

export const generateSpendingInsights = (
  transactions: Transaction[],
  budgetComparisons: BudgetComparison[]
): SpendingInsight[] => {
  const insights: SpendingInsight[] = [];
  const currentMonth = new Date().toISOString().slice(0, 7);
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
  
  const currentMonthExpenses = transactions.filter(t => 
    t.type === 'expense' && t.date.startsWith(currentMonth)
  );
  const lastMonthExpenses = transactions.filter(t => 
    t.type === 'expense' && t.date.startsWith(lastMonth)
  );


  const currentTotal = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
  const lastTotal = lastMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
  
  if (lastTotal > 0) {
    const change = ((currentTotal - lastTotal) / lastTotal) * 100;
    if (change > 20) {
      insights.push({
        type: 'warning',
        title: 'Spending Increased',
        description: `Your spending is ${change.toFixed(1)}% higher than last month`,
        value: formatCurrency(currentTotal - lastTotal)
      });
    } else if (change < -10) {
      insights.push({
        type: 'achievement',
        title: 'Great Savings!',
        description: `You've reduced spending by ${Math.abs(change).toFixed(1)}% compared to last month`,
        value: formatCurrency(lastTotal - currentTotal)
      });
    }
  }

  budgetComparisons.forEach(comparison => {
    if (comparison.status === 'over') {
      insights.push({
        type: 'warning',
        title: 'Budget Exceeded',
        description: `You've exceeded your ${comparison.category} budget by ${(comparison.percentage - 100).toFixed(1)}%`,
        category: comparison.category,
        value: formatCurrency(comparison.actual - comparison.budgeted)
      });
    } else if (comparison.status === 'on-track' && comparison.percentage >= 90) {
      insights.push({
        type: 'warning',
        title: 'Budget Alert',
        description: `You're close to your ${comparison.category} budget limit`,
        category: comparison.category,
        value: formatCurrency(comparison.remaining)
      });
    }
  });


  const categorySpending: { [category: string]: { current: number; last: number } } = {};
  
  currentMonthExpenses.forEach(t => {
    if (!categorySpending[t.category]) categorySpending[t.category] = { current: 0, last: 0 };
    categorySpending[t.category].current += t.amount;
  });
  
  lastMonthExpenses.forEach(t => {
    if (!categorySpending[t.category]) categorySpending[t.category] = { current: 0, last: 0 };
    categorySpending[t.category].last += t.amount;
  });

  Object.entries(categorySpending).forEach(([category, amounts]) => {
    if (amounts.last > 0) {
      const change = ((amounts.current - amounts.last) / amounts.last) * 100;
      if (change > 50 && amounts.current > 100) {
        insights.push({
          type: 'trend',
          title: 'Category Spike',
          description: `${category} spending increased by ${change.toFixed(1)}% this month`,
          category,
          value: formatCurrency(amounts.current - amounts.last)
        });
      }
    }
  });

 
  if (insights.filter(i => i.type === 'warning').length === 0) {
    insights.push({
      type: 'tip',
      title: 'Staying on Track',
      description: 'You\'re managing your budget well! Consider setting aside extra savings for future goals.'
    });
  }

  return insights.slice(0, 5); 
};

export const getCurrentMonth = (): string => {
  return new Date().toISOString().slice(0, 7);
};

export const getMonthName = (monthString: string): string => {
  const date = new Date(monthString + '-01');
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};
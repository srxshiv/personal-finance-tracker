import { Transaction } from '@/types/transaction';

export const transactionAPI = {
  getAll: async (): Promise<Transaction[]> => {
    try {
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  },

  add: async (transaction: Omit<Transaction, '_id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> => {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      throw new Error('Failed to create transaction');
    }

    return await response.json();
  },

  update: async (id: string, updates: Partial<Transaction>): Promise<Transaction> => {
    const response = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update transaction');
    }

    return await response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete transaction');
    }
  },
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const getCategoryExpenses = (transactions: Transaction[]) => {
  const categoryData: { [key: string]: number } = {};
  
  transactions
    .filter(t => t.type === 'expense')
    .forEach(transaction => {
      categoryData[transaction.category] = (categoryData[transaction.category] || 0) + transaction.amount;
    });

  return Object.entries(categoryData)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
};

export const getCategoryBreakdown = (transactions: Transaction[]) => {
  const expenses = transactions.filter(t => t.type === 'expense');
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  
  const categoryData: { [key: string]: { amount: number; count: number; percentage: number } } = {};
  
  expenses.forEach(transaction => {
    if (!categoryData[transaction.category]) {
      categoryData[transaction.category] = { amount: 0, count: 0, percentage: 0 };
    }
    categoryData[transaction.category].amount += transaction.amount;
    categoryData[transaction.category].count += 1;
  });

  Object.keys(categoryData).forEach(category => {
    categoryData[category].percentage = totalExpenses > 0 
      ? (categoryData[category].amount / totalExpenses) * 100 
      : 0;
  });

  return Object.entries(categoryData)
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.amount - a.amount);
};

export const getRecentTransactions = (transactions: Transaction[], limit: number = 5) => {
  return transactions
    .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
    .slice(0, limit);
};

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Bills & Utilities',
  'Healthcare',
  'Entertainment',
  'Education',
  'Travel',
  'Other'
];

export const CATEGORY_COLORS = {
  'Food & Dining': '#ef4444',
  'Transportation': '#f97316',
  'Shopping': '#eab308',
  'Bills & Utilities': '#22c55e',
  'Healthcare': '#06b6d4',
  'Entertainment': '#8b5cf6',
  'Education': '#ec4899',
  'Travel': '#10b981',
  'Other': '#6b7280'
};
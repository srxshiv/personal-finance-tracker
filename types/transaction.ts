export interface Transaction {
  _id: string;
  amount: number;
  date: string;
  description: string;
  type: 'income' | 'expense';
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFormData {
  amount: string;
  date: string;
  description: string;
  type: 'income' | 'expense';
  category: string;
}
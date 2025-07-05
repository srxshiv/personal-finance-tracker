import mongoose from 'mongoose';

export interface ITransaction {
  _id?: string;
  amount: number;
  date: string;
  description: string;
  type: 'income' | 'expense';
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TransactionSchema = new mongoose.Schema<ITransaction>({
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  date: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense']
  },
  category: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
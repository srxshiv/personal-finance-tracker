import mongoose from 'mongoose';

export interface IBudget {
  _id?: string;
  category: string;
  amount: number;
  month: string; 
  createdAt?: Date;
  updatedAt?: Date;
}

const BudgetSchema = new mongoose.Schema<IBudget>({
  category: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  month: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}$/
  }
}, {
  timestamps: true
});


BudgetSchema.index({ category: 1, month: 1 }, { unique: true });

export default mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);
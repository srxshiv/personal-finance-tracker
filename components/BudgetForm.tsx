"use client";

import { useState, useEffect } from 'react';
import { z } from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Budget, BudgetFormData } from '@/types/budget';
import { budgetAPI, getCurrentMonth } from '@/lib/budgets';
import { EXPENSE_CATEGORIES } from '@/lib/transactions';
import { Edit3, Loader2, Target } from 'lucide-react';

interface BudgetFormProps {
  budget?: Budget;
  onSave: (budget: Budget) => void;
  onCancel: () => void;
  existingCategories?: string[];
}

const budgetSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  month: z.string().min(1, "Month is required"),
});

export default function BudgetForm({ budget, onSave, onCancel, existingCategories = [] }: BudgetFormProps) {
  const [formData, setFormData] = useState<BudgetFormData>({
    category: '',
    amount: '',
    month: getCurrentMonth(),
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BudgetFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category,
        amount: budget.amount.toString(),
        month: budget.month,
      });
    }
  }, [budget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = budgetSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof BudgetFormData, string>> = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as keyof BudgetFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const budgetData = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        month: formData.month,
      };

      const savedBudget = budget
        ? await budgetAPI.update(budget._id, budgetData)
        : await budgetAPI.add(budgetData);

      onSave(savedBudget);

      if (!budget) {
        setFormData({
          category: '',
          amount: '',
          month: getCurrentMonth(),
        });
      }
    } catch (error: any) {
      console.error('Error saving budget:', error);
      if (error.message?.includes('already exists')) {
        setErrors({ category: 'Budget already exists for this category and month' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof BudgetFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const availableCategories = EXPENSE_CATEGORIES.filter(
    category => !existingCategories.includes(category) || category === formData.category
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          {budget ? (
            <>
              <Edit3 className="h-5 w-5" />
              Edit Budget
            </>
          ) : (
            <>
              <Target className="h-5 w-5" />
              Set Budget
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Input
              id="month"
              type="month"
              value={formData.month}
              onChange={(e) => handleInputChange('month', e.target.value)}
              className={errors.month ? 'border-red-500' : ''}
            />
            {errors.month && <p className="text-sm text-red-500">{errors.month}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                budget ? 'Update Budget' : 'Set Budget'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

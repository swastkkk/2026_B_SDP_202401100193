import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Category, Budget } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialData?: Budget | null;
  selectedMonth: number;
  selectedYear: number;
  onSave: (data: any) => Promise<void>;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  categories,
  initialData,
  selectedMonth,
  selectedYear,
  onSave,
}) => {
  const { user } = useAuth();
  const currency = user?.currency || '₹';
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [categoryId, setCategoryId] = useState<string>('overall');
  const [alertThreshold, setAlertThreshold] = useState<number>(80);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE' && !c.parentId);

  useEffect(() => {
    if (initialData) {
      setMonthlyLimit(initialData.monthlyLimit.toString());
      setCategoryId(initialData.categoryId ? initialData.categoryId.toString() : 'overall');
      setAlertThreshold(initialData.alertThreshold || 80);
    } else {
      setMonthlyLimit('');
      setCategoryId('overall');
      setAlertThreshold(80);
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const limit = parseFloat(monthlyLimit);
    if (isNaN(limit) || limit <= 0) {
      setError('Please enter a valid budget limit.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        monthlyLimit: limit,
        month: selectedMonth,
        year: selectedYear,
        alertThreshold,
        categoryId: categoryId === 'overall' ? null : Number(categoryId),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Update Budget Target' : 'Set New Monthly Budget'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-200">
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Target Category or Overall */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Budget Scope / Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={!!initialData}
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
          >
            <option value="overall">🌐 Overall Total Monthly Budget</option>
            <optgroup label="Specific Expense Categories">
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Monthly Limit */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Monthly Spending Cap ({currency})
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
              {currency}
            </span>
            <input
              type="number"
              step="100"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              placeholder="e.g. 5000"
              required
              className="w-full pl-8 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-semibold focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* Alert Threshold Slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-400">
              Warning Alert Trigger Threshold
            </label>
            <span className="text-xs font-bold text-amber-400">{alertThreshold}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="95"
            step="5"
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            System triggers an in-app warning notification when spending reaches {alertThreshold}%
            of your limit.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Budget Cap'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

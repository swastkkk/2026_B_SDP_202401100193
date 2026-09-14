import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Category, Transaction } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialData?: Transaction | null;
  onSave: (data: any) => Promise<void>;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  categories,
  initialData,
  onSave,
}) => {
  const { user } = useAuth();
  const currency = user?.currency || '₹';
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH' | 'CARD' | 'NET_BANKING'>('UPI');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset or populate fields when modal opens/changes
  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setCategoryId(initialData.categoryId);
      setPaymentMethod(initialData.paymentMethod);
      setDate(new Date(initialData.date).toISOString().split('T')[0]);
      setNotes(initialData.notes || '');
    } else {
      setType('EXPENSE');
      setAmount('');
      const defaultCat = categories.find((c) => c.type === 'EXPENSE');
      setCategoryId(defaultCat ? defaultCat.id : '');
      setPaymentMethod('UPI');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setError('');
  }, [initialData, isOpen, categories]);

  // Filter categories by type
  const availableCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        amount: parsedAmount,
        type,
        categoryId: Number(categoryId),
        paymentMethod,
        date: new Date(date).toISOString(),
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : 'Record New Transaction'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-200">
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Transaction Type Segmented Switch */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setType('EXPENSE');
              const firstExp = categories.find((c) => c.type === 'EXPENSE');
              if (firstExp) setCategoryId(firstExp.id);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              type === 'EXPENSE'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            💸 Expense
          </button>
          <button
            type="button"
            onClick={() => {
              setType('INCOME');
              const firstInc = categories.find((c) => c.type === 'INCOME');
              if (firstInc) setCategoryId(firstInc.id);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              type === 'INCOME'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            💰 Income / Allowance
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Amount ({currency})
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
              {currency}
            </span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="w-full pl-8 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-semibold focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* Category Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
            required
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="">-- Select Category --</option>
            {availableCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parent ? `└ ${c.name} (${c.parent.name})` : c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Payment Method
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'UPI', label: 'UPI / GPay' },
              { id: 'CASH', label: 'Cash' },
              { id: 'CARD', label: 'Card' },
              { id: 'NET_BANKING', label: 'Net Bank' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPaymentMethod(m.id as any)}
                className={`py-2 text-[11px] font-semibold rounded-lg border transition-all ${
                  paymentMethod === m.id
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Notes / Description (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Canteen lunch with friends, Xerox notes"
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Action Buttons */}
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
            {isSubmitting ? 'Saving...' : initialData ? 'Update Transaction' : 'Save Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

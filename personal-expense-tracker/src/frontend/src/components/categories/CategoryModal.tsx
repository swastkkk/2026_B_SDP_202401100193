import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Category } from '../../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSave: (data: any) => Promise<void>;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [parentId, setParentId] = useState<string>('none');
  const [color, setColor] = useState('#6366F1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const colorPresets = [
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#6366F1', // Indigo
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
  ];

  // Only top-level categories of the same type can be parents
  const eligibleParents = categories.filter((c) => !c.parentId && c.type === type);

  useEffect(() => {
    setName('');
    setType('EXPENSE');
    setParentId('none');
    setColor('#6366F1');
    setError('');
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a category name.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        name: name.trim(),
        type,
        color,
        parentId: parentId === 'none' ? null : Number(parentId),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Category">
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-200">
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Category Type */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setType('EXPENSE');
              setParentId('none');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              type === 'EXPENSE'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => {
              setType('INCOME');
              setParentId('none');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              type === 'INCOME'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Income
          </button>
        </div>

        {/* Category Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Category Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Chai & Samosa, Lab Equipment"
            required
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>

        {/* Parent Category (Hierarchy) */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Parent Category (Optional - For Subcategories)
          </label>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="none">🌟 None (Create as Top-Level Category)</option>
            {eligibleParents.map((p) => (
              <option key={p.id} value={p.id}>
                Under {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Color Palette Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">
            Badge Accent Color
          </label>
          <div className="flex items-center gap-2.5 flex-wrap">
            {colorPresets.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                  color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : ''
                }`}
              />
            ))}
          </div>
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
            {isSubmitting ? 'Creating...' : 'Create Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

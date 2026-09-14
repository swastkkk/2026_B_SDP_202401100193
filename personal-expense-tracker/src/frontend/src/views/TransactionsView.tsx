import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { Transaction, Category } from '../types';
import { useAuth } from '../context/AuthContext';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: Category[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onTypeFilterChange: (type: string) => void;
  onCategoryFilterChange: (categoryId: string) => void;
  onPaymentMethodFilterChange: (method: string) => void;
  onOpenAddModal: () => void;
  onEditTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: number) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  categories,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onSearchChange,
  onTypeFilterChange,
  onCategoryFilterChange,
  onPaymentMethodFilterChange,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const { user } = useAuth();
  const currency = user?.currency || '₹';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Transaction Ledger</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {totalCount} entries for <strong className="text-slate-200">{user?.name}</strong>
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Transaction
        </button>
      </div>

      {/* Search & Filters */}
      <div className="pockit-card rounded-2xl border border-slate-800 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by notes, category..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                onSearchChange(e.target.value);
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
              showFilters
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); onTypeFilterChange(e.target.value); }}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Types</option>
              <option value="EXPENSE">Expenses Only</option>
              <option value="INCOME">Income Only</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); onCategoryFilterChange(e.target.value); }}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.parent ? `└ ${c.name}` : c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedMethod}
              onChange={(e) => { setSelectedMethod(e.target.value); onPaymentMethodFilterChange(e.target.value); }}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Methods</option>
              <option value="UPI">UPI / GPay</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="NET_BANKING">Net Banking</option>
              <option value="WALLET">Wallet</option>
            </select>
          </div>
        )}
      </div>

      {/* Transaction Table */}
      <div className="pockit-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="px-5 py-3.5 text-slate-400 font-semibold uppercase tracking-wider">Date</th>
                <th className="px-5 py-3.5 text-slate-400 font-semibold uppercase tracking-wider">Type</th>
                <th className="px-5 py-3.5 text-slate-400 font-semibold uppercase tracking-wider">Category</th>
                <th className="px-5 py-3.5 text-slate-400 font-semibold uppercase tracking-wider">Notes</th>
                <th className="px-5 py-3.5 text-slate-400 font-semibold uppercase tracking-wider">Method</th>
                <th className="px-5 py-3.5 text-slate-400 font-semibold uppercase tracking-wider text-right">Amount</th>
                <th className="px-5 py-3.5 text-slate-400 font-semibold uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm">
                    No transactions found.{' '}
                    <button onClick={onOpenAddModal} className="text-indigo-400 font-semibold hover:text-indigo-300">
                      Add one now
                    </button>
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 text-slate-300 whitespace-nowrap">
                      {new Date(txn.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          txn.type === 'EXPENSE'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        }`}
                      >
                        {txn.type === 'EXPENSE' ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownLeft className="w-3 h-3" />
                        )}
                        {txn.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {txn.category?.color && (
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: txn.category.color }}
                          />
                        )}
                        <span className="text-slate-300 font-medium truncate max-w-[110px]">
                          {txn.category?.name || '—'}
                        </span>
                        {txn.category?.parent && (
                          <span className="text-[10px] text-slate-500 truncate">
                            ({txn.category.parent.name})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 max-w-[160px] truncate">
                      {txn.notes || <span className="italic text-slate-600">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-medium">
                        {txn.paymentMethod?.replace('_', ' ') || '—'}
                      </span>
                    </td>
                    <td
                      className={`px-5 py-3.5 text-right font-extrabold whitespace-nowrap ${
                        txn.type === 'EXPENSE' ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {txn.type === 'EXPENSE' ? '-' : '+'}{currency}{txn.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEditTransaction(txn)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete this ${txn.type.toLowerCase()} of ${currency}${txn.amount}?`))
                              onDeleteTransaction(txn.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800">
            <p className="text-xs text-slate-400">
              Page {currentPage} of {totalPages} · {totalCount} transactions
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

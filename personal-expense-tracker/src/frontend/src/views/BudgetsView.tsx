import React from 'react';
import {
  PiggyBank,
  Plus,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Trash2,
  Edit2,
  ShieldAlert,
} from 'lucide-react';
import { Budget } from '../types';

interface BudgetsViewProps {
  budgets: Budget[];
  selectedMonth: number;
  selectedYear: number;
  onOpenAddBudgetModal: () => void;
  onEditBudget: (b: Budget) => void;
  onDeleteBudget: (id: number) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  selectedMonth,
  selectedYear,
  onOpenAddBudgetModal,
  onEditBudget,
  onDeleteBudget,
}) => {
  const overallBudget = budgets.find((b) => b.categoryId === null);
  const categoryBudgets = budgets.filter((b) => b.categoryId !== null);
  const activeAlerts = budgets.filter((b) => b.status === 'WARNING' || b.status === 'BREACHED');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white">Budget & Alert Center</h2>
            <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold">
              {monthNames[selectedMonth - 1]} {selectedYear}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure spending caps and monitor automated threshold breach warnings (Student 2 Engine)
          </p>
        </div>

        <button
          onClick={onOpenAddBudgetModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Set Budget Limit
        </button>
      </div>

      {/* Real-time Alert Notification Banner */}
      {activeAlerts.length > 0 && (
        <div className="glass-panel rounded-2xl p-4 border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Automated Threshold Warnings ({activeAlerts.length})
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {activeAlerts.map((a) => (
                  <span
                    key={a.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                      a.status === 'BREACHED'
                        ? 'bg-rose-950/80 border border-rose-700 text-rose-300'
                        : 'bg-amber-950/80 border border-amber-700 text-amber-300'
                    }`}
                  >
                    {a.status === 'BREACHED' ? (
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <strong>{a.category ? a.category.name : 'Overall'}</strong>: {a.percentage}% spent
                    (₹{a.spent.toLocaleString()} / ₹{a.monthlyLimit.toLocaleString()})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overall Monthly Budget Card (Featured) */}
      {overallBudget ? (
        <div className="relative overflow-hidden glass-panel rounded-2xl p-6 border border-slate-700 bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <PiggyBank className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                  Global Target
                </span>
                <h3 className="text-lg font-bold text-white">Overall Monthly Spending Limit</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  overallBudget.status === 'BREACHED'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : overallBudget.status === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {overallBudget.status === 'SAFE' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {overallBudget.status === 'WARNING' && <AlertTriangle className="w-3.5 h-3.5" />}
                {overallBudget.status === 'BREACHED' && <AlertOctagon className="w-3.5 h-3.5" />}
                {overallBudget.status}
              </span>

              <button
                onClick={() => onEditBudget(overallBudget)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Edit Limit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-slate-400">
                Spent:{' '}
                <strong className="text-white text-base">
                  ₹{overallBudget.spent.toLocaleString()}
                </strong>{' '}
                of ₹{overallBudget.monthlyLimit.toLocaleString()}
              </span>
              <span className="font-bold text-white text-sm">{overallBudget.percentage}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallBudget.percentage >= 100
                    ? 'bg-rose-500'
                    : overallBudget.percentage >= overallBudget.alertThreshold
                    ? 'bg-amber-500'
                    : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.min(100, overallBudget.percentage)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>
                {overallBudget.remaining >= 0 ? (
                  <>
                    Remaining Surplus: <strong className="text-emerald-400">₹{overallBudget.remaining.toLocaleString()}</strong>
                  </>
                ) : (
                  <>
                    Overspent by: <strong className="text-rose-400">₹{Math.abs(overallBudget.remaining).toLocaleString()}</strong>
                  </>
                )}
              </span>
              <span>Warning trigger: {overallBudget.alertThreshold}%</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-6 border border-dashed border-slate-800 text-center">
          <PiggyBank className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-300">No Overall Monthly Budget Defined</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Setting an overall budget allows the system to compute your student safe-to-spend daily allowance.
          </p>
          <button
            onClick={onOpenAddBudgetModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
          >
            Set Global Limit
          </button>
        </div>
      )}

      {/* Category Specific Budgets Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
          Category Spending Caps ({categoryBudgets.length})
        </h3>

        {categoryBudgets.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center glass-panel rounded-2xl border border-slate-800">
            No category-specific limits configured. Click "Set Budget Limit" above to add one.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryBudgets.map((b) => {
              const isBreached = b.status === 'BREACHED';
              const isWarning = b.status === 'WARNING';

              return (
                <div
                  key={b.id}
                  className={`glass-panel rounded-2xl p-4 border transition-all ${
                    isBreached
                      ? 'border-rose-800/80 bg-rose-950/20'
                      : isWarning
                      ? 'border-amber-800/80 bg-amber-950/20'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: b.category?.color || '#6366F1' }}
                      />
                      <h4 className="font-bold text-sm text-white">{b.category?.name}</h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditBudget(b)}
                        className="p-1 rounded text-slate-400 hover:text-white"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove budget limit for ${b.category?.name}?`)) {
                            onDeleteBudget(b.id);
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-baseline justify-between">
                      <span className="text-slate-400">
                        ₹{b.spent.toLocaleString()} / ₹{b.monthlyLimit.toLocaleString()}
                      </span>
                      <span
                        className={`font-bold ${
                          isBreached
                            ? 'text-rose-400'
                            : isWarning
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {b.percentage}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isBreached
                            ? 'bg-rose-500'
                            : isWarning
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, b.percentage)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>
                        {b.remaining >= 0
                          ? `₹${b.remaining.toLocaleString()} left`
                          : `Exceeded by ₹${Math.abs(b.remaining).toLocaleString()}`}
                      </span>
                      <span className="capitalize px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                        Warns at {b.alertThreshold}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

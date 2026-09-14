import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  CreditCard,
  PieChart,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { AnalyticsSummary, CategoryBreakdownItem } from '../types';
import { api } from '../services/api';

interface ReportsViewProps {
  summary: AnalyticsSummary | null;
  categoryBreakdown: CategoryBreakdownItem[];
  selectedMonth: number;
  selectedYear: number;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  summary,
  categoryBreakdown,
  selectedMonth,
  selectedYear,
}) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const currentMonthName = monthNames[selectedMonth - 1];
  const downloadUrl = api.getExportCsvUrl(selectedMonth, selectedYear);
  const downloadAllUrl = api.getExportCsvUrl();

  const highestCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Financial Spending Reports</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit monthly college cashflow and export formal reports for records (Student 3 Reporting)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={downloadUrl}
            download
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            Export {currentMonthName} CSV
          </a>
          <a
            href={downloadAllUrl}
            download
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            All-Time CSV
          </a>
        </div>
      </div>

      {/* Monthly Report Statement Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
              Personal Financial Statement
            </span>
            <h3 className="text-lg font-bold text-white">
              Period: {currentMonthName} {selectedYear}
            </h3>
          </div>
          <div className="text-xs text-slate-400">
            Status: <span className="text-emerald-400 font-semibold">Audited & Balanced</span>
          </div>
        </div>

        {/* Key Metrics Table */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <p className="text-xs text-slate-400 mb-1">Total Credits (Income & Allowance)</p>
            <p className="text-xl font-extrabold text-emerald-400">
              ₹{(summary?.totalIncome || 0).toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <p className="text-xs text-slate-400 mb-1">Total Debits (All Expenses)</p>
            <p className="text-xl font-extrabold text-rose-400">
              ₹{(summary?.totalExpense || 0).toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <p className="text-xs text-slate-400 mb-1">Closing Net Savings</p>
            <p className="text-xl font-extrabold text-indigo-400">
              ₹{(summary?.netSavings || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Highlight Insights */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2 text-xs">
          <h4 className="font-bold text-slate-200">Spending Insights & Analytics</h4>
          <ul className="space-y-1.5 text-slate-400">
            {highestCategory && (
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                Highest expenditure category was{' '}
                <strong className="text-white">{highestCategory.name}</strong>, accounting for{' '}
                <strong className="text-rose-400">
                  ₹{highestCategory.amount.toLocaleString()} ({highestCategory.percentage}%)
                </strong>{' '}
                of all debits.
              </li>
            )}
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              Total transaction events logged: <strong className="text-white">{summary?.transactionCount || 0}</strong>.
            </li>
            {summary?.budget.totalLimit ? (
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                Budget cap consumption is currently at{' '}
                <strong className="text-white">{summary.budget.percentageUsed}%</strong>.
              </li>
            ) : null}
          </ul>
        </div>

        {/* Category Breakdown Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Category-wise Distribution
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5">Transactions</th>
                  <th className="py-2.5 text-right">Amount (INR)</th>
                  <th className="py-2.5 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {categoryBreakdown.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 font-medium text-slate-200 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      {c.name}
                    </td>
                    <td className="py-2.5 text-slate-400">{c.count} items</td>
                    <td className="py-2.5 text-right font-semibold text-slate-200">
                      ₹{c.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right font-bold text-indigo-400">
                      {c.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

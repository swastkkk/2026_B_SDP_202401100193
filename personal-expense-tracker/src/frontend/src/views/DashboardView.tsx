import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
  Zap,
  Coffee,
  Utensils,
  Train,
  Car,
  ShoppingBag,
  Printer,
  BookOpen,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  AnalyticsSummary,
  CategoryBreakdownItem,
  MonthlyTrendItem,
  Transaction,
  Budget,
} from '../types';
import { useAuth } from '../context/AuthContext';

interface DashboardViewProps {
  summary: AnalyticsSummary | null;
  categoryBreakdown: CategoryBreakdownItem[];
  monthlyTrend: MonthlyTrendItem[];
  recentTransactions: Transaction[];
  alerts: Budget[];
  onOpenAddTransaction: () => void;
  onQuickAdd: (name: string, amount: number, categoryKeyword: string) => void;
  onViewAllTransactions: () => void;
  onViewBudgets: () => void;
}

const QUICK_SPENDS = [
  { label: 'Canteen', amount: 80, keyword: 'canteen', icon: <Utensils className="w-3.5 h-3.5" />, color: 'from-orange-500/10 to-orange-600/5 border-orange-500/20 text-orange-300' },
  { label: 'Chai Tapri', amount: 15, keyword: 'chai', icon: <Coffee className="w-3.5 h-3.5" />, color: 'from-amber-500/10 to-amber-600/5 border-amber-500/20 text-amber-300' },
  { label: 'Metro', amount: 40, keyword: 'metro', icon: <Train className="w-3.5 h-3.5" />, color: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-300' },
  { label: 'Auto', amount: 60, keyword: 'auto', icon: <Car className="w-3.5 h-3.5" />, color: 'from-yellow-500/10 to-yellow-600/5 border-yellow-500/20 text-yellow-300' },
  { label: 'Xerox', amount: 25, keyword: 'printing', icon: <Printer className="w-3.5 h-3.5" />, color: 'from-purple-500/10 to-purple-600/5 border-purple-500/20 text-purple-300' },
  { label: 'Stationery', amount: 50, keyword: 'stationery', icon: <BookOpen className="w-3.5 h-3.5" />, color: 'from-pink-500/10 to-pink-600/5 border-pink-500/20 text-pink-300' },
];

const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel-luminous border border-white/15 rounded-xl p-3 text-xs shadow-2xl">
        <p className="text-slate-400 mb-1.5 font-semibold font-display">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} className={`font-medium ${p.dataKey === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {p.dataKey === 'income' ? '↑ Income: ' : '↓ Expense: '}
            <span className="font-bold font-mono tabular-nums">{currency}{Number(p.value).toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  categoryBreakdown,
  monthlyTrend,
  recentTransactions,
  alerts,
  onOpenAddTransaction,
  onQuickAdd,
  onViewAllTransactions,
  onViewBudgets,
}) => {
  const { user } = useAuth();
  const currency = summary?.currency || user?.currency || '₹';
  const advisor = summary?.studentAdvisor;
  const budget = summary?.budget;

  const getPaceColor = () => {
    if (!advisor) return 'text-slate-400';
    switch (advisor.paceStatus) {
      case 'SAFE': return 'text-emerald-400';
      case 'WARNING': return 'text-amber-400';
      case 'SURVIVAL': return 'text-rose-400';
      default: return 'text-slate-400';
    }
  };

  const getBudgetBarColor = () => {
    if (!budget) return 'bg-indigo-500';
    if (budget.percentageUsed >= 100) return 'bg-rose-500';
    if (budget.percentageUsed >= 80) return 'bg-amber-500';
    return 'bg-indigo-500';
  };

  return (
    <div className="space-y-6">
      {/* Active Alerts Banner */}
      {alerts.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={onViewBudgets}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl glass-panel border text-xs font-semibold cursor-pointer transition-all hover:scale-[1.006] ${
                alert.status === 'BREACHED'
                  ? 'border-rose-500/40 text-rose-200 bg-rose-950/30 glass-glow-rose'
                  : 'border-amber-500/40 text-amber-200 bg-amber-950/30 glass-glow-amber'
              }`}
            >
              <div className="p-1 rounded-lg bg-white/10 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="font-display">
                <strong className="text-white font-bold">{alert.category ? alert.category.name : 'Overall Budget'}</strong>{' '}
                {alert.status === 'BREACHED' ? 'exceeded' : 'at warning threshold'} —{' '}
                <span className="font-mono">{currency}{alert.spent.toLocaleString()}</span> of <span className="font-mono">{currency}{alert.monthlyLimit.toLocaleString()}</span> ({alert.percentage}%)
              </span>
              <span className="ml-auto underline opacity-80 font-display text-[11px]">View Budgets →</span>
            </div>
          ))}
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {[
          {
            label: 'Total Income',
            value: `+${currency}${(summary?.totalIncome || 0).toLocaleString()}`,
            icon: <ArrowDownLeft className="w-4 h-4" />,
            color: 'text-emerald-400',
            bg: 'from-emerald-500/10 to-transparent border-emerald-500/20',
          },
          {
            label: 'Total Spent',
            value: `-${currency}${(summary?.totalExpense || 0).toLocaleString()}`,
            icon: <ArrowUpRight className="w-4 h-4" />,
            color: 'text-rose-400',
            bg: 'from-rose-500/10 to-transparent border-rose-500/20',
          },
          {
            label: 'Net Savings',
            value: `${currency}${(summary?.netSavings || 0).toLocaleString()}`,
            icon: <Wallet className="w-4 h-4" />,
            color: (summary?.netSavings || 0) >= 0 ? 'text-indigo-400' : 'text-rose-400',
            bg: 'from-indigo-500/10 to-transparent border-indigo-500/20',
          },
          {
            label: 'Transactions',
            value: summary?.transactionCount || 0,
            icon: <Zap className="w-4 h-4" />,
            color: 'text-cyan-400',
            bg: 'from-cyan-500/10 to-transparent border-cyan-500/20',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-2xl glass-panel glass-interactive glass-specular p-4 sm:p-5 bg-gradient-to-br ${kpi.bg} group relative overflow-hidden`}
          >
            <div className={`flex items-center gap-2 text-xs font-semibold mb-2.5 ${kpi.color}`}>
              <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                {kpi.icon}
              </div>
              <span className="text-slate-400 font-display uppercase tracking-wider text-[11px]">{kpi.label}</span>
            </div>
            <p className={`text-xl sm:text-2xl lg:text-3xl font-extrabold font-display font-mono tabular-nums tracking-tight ${kpi.color}`}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Monthly Budget Progress */}
      {budget && budget.totalLimit > 0 && (
        <div className="glass-panel glass-specular rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h3 className="text-sm font-bold font-display text-white">Monthly Budget Gauge</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                <span className="font-mono font-semibold text-slate-200">{currency}{budget.totalSpent?.toLocaleString() || budget.remaining.toLocaleString()}</span> spent of <span className="font-mono font-semibold text-slate-200">{currency}{budget.totalLimit.toLocaleString()}</span>
              </p>
            </div>
            <span
              className={`text-lg font-extrabold font-display font-mono ${
                budget.percentageUsed >= 100
                  ? 'text-rose-400'
                  : budget.percentageUsed >= 80
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {budget.percentageUsed}%
            </span>
          </div>
          <div className="w-full bg-slate-900/90 border border-white/5 rounded-full h-3 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 shadow-sm ${getBudgetBarColor()}`}
              style={{ width: `${Math.min(100, budget.percentageUsed)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2.5 text-[11px] text-slate-400 font-medium">
            <span className="font-mono">0%</span>
            <span className={budget.remaining < 0 ? 'text-rose-400 font-mono font-bold' : 'text-slate-300 font-mono font-bold'}>
              {budget.remaining >= 0
                ? `${currency}${budget.remaining.toLocaleString()} left`
                : `Exceeded by ${currency}${Math.abs(budget.remaining).toLocaleString()}`}
            </span>
            <span className="font-mono">100%</span>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Quick Spend + Recent Transactions */}
        <div className="lg:col-span-2 space-y-5">
          {/* Quick Spend Tiles */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold font-display text-white">Quick Spend Log</h3>
              <span className="text-[10px] text-slate-400 font-medium glass-pill px-2 py-0.5 rounded-full">One-tap student shortcuts</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {QUICK_SPENDS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => onQuickAdd(item.label, item.amount, item.keyword)}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl glass-panel glass-interactive font-semibold text-[11px] transition-all hover:scale-105 active:scale-95 border ${item.color}`}
                >
                  <div className="p-1 rounded-lg bg-white/5">{item.icon}</div>
                  <span className="font-display">{item.label}</span>
                  <span className="opacity-70 font-mono text-[10px]">₹{item.amount}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="glass-panel glass-specular rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <h3 className="text-sm font-bold font-display text-white">Recent Activity</h3>
              <button
                onClick={onViewAllTransactions}
                className="text-xs text-indigo-400 font-semibold font-display hover:text-indigo-300 transition-colors"
              >
                View All →
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-slate-400 mb-3">No transactions recorded yet.</p>
                <button
                  onClick={onOpenAddTransaction}
                  className="text-xs text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
                >
                  + Log your first transaction
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {recentTransactions.slice(0, 8).map((txn) => (
                  <div key={txn.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 border ${
                        txn.type === 'EXPENSE'
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {txn.type === 'EXPENSE' ? '↑' : '↓'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold font-display text-slate-200 truncate">
                        {txn.notes || txn.category?.name || 'Transaction'}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {txn.category?.name} · {txn.paymentMethod?.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-xs font-bold font-mono tabular-nums ${txn.type === 'EXPENSE' ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {txn.type === 'EXPENSE' ? '-' : '+'}{currency}{txn.amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Safe-to-Spend + Category Pie */}
        <div className="space-y-5">
          {/* Safe-to-Spend Advisor */}
          {advisor && (
            <div className="glass-panel-luminous glass-specular rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-indigo-500/15 text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold font-display text-white">Daily Budget Advisor</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border glass-pill ${
                  advisor.paceStatus === 'SAFE'
                    ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10'
                    : advisor.paceStatus === 'WARNING'
                    ? 'border-amber-500/30 text-amber-300 bg-amber-500/10'
                    : 'border-rose-500/30 text-rose-300 bg-rose-500/10'
                }`}>
                  {advisor.paceStatus}
                </span>
              </div>
              <div className={`text-3xl sm:text-4xl font-extrabold font-display font-mono tracking-tight mb-1 ${getPaceColor()}`}>
                {advisor.safeDailyAllowance > 0
                  ? `${currency}${advisor.safeDailyAllowance.toLocaleString()}`
                  : 'Budget Exhausted'}
              </div>
              <p className="text-xs text-slate-400 mb-3 font-medium">Safe to spend today</p>

              <div className="space-y-1.5 text-xs pt-3 border-t border-white/5">
                <div className="flex justify-between text-slate-400">
                  <span className="font-display">Days Remaining</span>
                  <span className="font-semibold text-slate-200 font-mono">{advisor.daysRemaining} days</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="font-display">Pace Strategy</span>
                  <span className={`font-bold font-display ${getPaceColor()}`}>
                    {advisor.paceStatus === 'SAFE' ? 'Comfortable' : advisor.paceStatus === 'WARNING' ? 'Conserve Cash' : 'Emergency'}
                  </span>
                </div>
              </div>

              {advisor.headline && (
                <div className={`mt-3.5 p-3 rounded-xl text-[11px] font-medium border glass-panel ${
                  advisor.paceStatus === 'SAFE'
                    ? 'border-emerald-500/30 text-emerald-300 bg-emerald-950/20'
                    : advisor.paceStatus === 'WARNING'
                    ? 'border-amber-500/30 text-amber-300 bg-amber-950/20'
                    : 'border-rose-500/30 text-rose-300 bg-rose-950/20'
                }`}>
                  {advisor.headline}
                </div>
              )}
            </div>
          )}

          {/* Category Spending Breakdown */}
          {categoryBreakdown.length > 0 && (
            <div className="glass-panel glass-specular rounded-2xl p-5">
              <h3 className="text-sm font-bold font-display text-white mb-4">Top Spend Categories</h3>
              <div className="space-y-3">
                {categoryBreakdown.slice(0, 5).map((cat) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-xs font-medium font-display text-slate-300 truncate max-w-[110px]">
                          {cat.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono tabular-nums text-slate-200">
                          {currency}{cat.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1 font-mono">({cat.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-900/80 rounded-full h-1.5 overflow-hidden border border-white/5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6-Month Trend Chart */}
      {monthlyTrend.length > 0 && (
        <div className="glass-panel glass-specular rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold font-display text-white">6-Month Financial Trend</h3>
            <div className="ml-auto flex items-center gap-4 text-[11px] text-slate-400 font-display">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shadow-sm inline-block" />
                Income
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shadow-sm inline-block" />
                Expenses
              </span>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend} barGap={6} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Plus Jakarta Sans' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${currency}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} opacity={0.9} />
                <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={32} opacity={0.9} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

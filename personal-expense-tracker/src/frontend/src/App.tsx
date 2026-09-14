import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/layout/Navbar';
import { DashboardView } from './views/DashboardView';
import { TransactionsView } from './views/TransactionsView';
import { BudgetsView } from './views/BudgetsView';
import { CategoriesView } from './views/CategoriesView';
import { ReportsView } from './views/ReportsView';
import { TransactionModal } from './components/transactions/TransactionModal';
import { BudgetModal } from './components/budgets/BudgetModal';
import { CategoryModal } from './components/categories/CategoryModal';
import { AuthModal } from './components/auth/AuthModal';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import {
  Category,
  Transaction,
  Budget,
  AnalyticsSummary,
  CategoryBreakdownItem,
  MonthlyTrendItem,
} from './types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters for transactions view
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');

  // Budgets & Alerts
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [alerts, setAlerts] = useState<Budget[]>([]);

  // Analytics
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdownItem[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrendItem[]>([]);

  // Modals state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'switch' | 'register' | 'login'>('login');

  const { user } = useAuth();

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Categories
  const loadCategories = useCallback(async () => {
    try {
      const [flat, tree] = await Promise.all([
        api.getCategories(false),
        api.getCategories(true),
      ]);
      setCategories(flat);
      setCategoryTree(tree);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  // Fetch Transactions
  const loadTransactions = useCallback(async () => {
    try {
      const res = await api.getTransactions({
        month: selectedMonth,
        year: selectedYear,
        page: currentPage,
        limit: 15,
        search: searchQuery || undefined,
        type: typeFilter || undefined,
        categoryId: categoryFilter ? Number(categoryFilter) : undefined,
        paymentMethod: paymentMethodFilter || undefined,
      });
      setTransactions(res.data);
      setTotalTransactions(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  }, [selectedMonth, selectedYear, currentPage, searchQuery, typeFilter, categoryFilter, paymentMethodFilter]);

  // Fetch Budgets and Alerts
  const loadBudgets = useCallback(async () => {
    try {
      const [budgetList, alertData] = await Promise.all([
        api.getBudgets(selectedMonth, selectedYear),
        api.getBudgetAlerts(selectedMonth, selectedYear),
      ]);
      setBudgets(budgetList);
      setAlerts(alertData.alerts);
    } catch (err) {
      console.error('Failed to load budgets:', err);
    }
  }, [selectedMonth, selectedYear]);

  // Fetch Analytics
  const loadAnalytics = useCallback(async () => {
    try {
      const [sum, breakdown, trend] = await Promise.all([
        api.getSummary(selectedMonth, selectedYear),
        api.getCategoryBreakdown(selectedMonth, selectedYear),
        api.getMonthlyTrend(),
      ]);
      setSummary(sum);
      setCategoryBreakdown(breakdown.breakdown);
      setMonthlyTrend(trend);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  }, [selectedMonth, selectedYear]);

  // Initial and reactive load
  useEffect(() => {
    loadCategories();
  }, [user?.id, loadCategories]);

  useEffect(() => {
    loadTransactions();
    loadBudgets();
    loadAnalytics();
  }, [user?.id, selectedMonth, selectedYear, loadTransactions, loadBudgets, loadAnalytics]);

  // Quick Add handler for student shortcuts
  const handleQuickAdd = async (name: string, amount: number, keyword: string) => {
    try {
      // Find matching category
      const match = categories.find(
        (c) =>
          c.type === 'EXPENSE' &&
          (c.name.toLowerCase().includes(keyword.toLowerCase()) ||
            (c.parent && c.parent.name.toLowerCase().includes(keyword.toLowerCase())))
      ) || categories.find((c) => c.type === 'EXPENSE');

      if (!match) {
        showToast('No suitable expense category found', 'error');
        return;
      }

      await api.createTransaction({
        amount,
        type: 'EXPENSE',
        categoryId: match.id,
        paymentMethod: 'UPI',
        date: new Date().toISOString(),
        notes: `Quick student log: ${name}`,
      });

      showToast(`Logged ₹${amount} for ${name} via UPI!`);
      loadTransactions();
      loadBudgets();
      loadAnalytics();
    } catch (err: any) {
      showToast(err.message || 'Failed to log quick expense', 'error');
    }
  };

  // Transaction Save
  const handleSaveTransaction = async (data: any) => {
    if (editingTransaction) {
      await api.updateTransaction(editingTransaction.id, data);
      showToast('Transaction updated successfully!');
    } else {
      await api.createTransaction(data);
      showToast('Transaction recorded successfully!');
    }
    setEditingTransaction(null);
    loadTransactions();
    loadBudgets();
    loadAnalytics();
  };

  // Transaction Delete
  const handleDeleteTransaction = async (id: number) => {
    try {
      await api.deleteTransaction(id);
      showToast('Transaction deleted');
      loadTransactions();
      loadBudgets();
      loadAnalytics();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete transaction', 'error');
    }
  };

  // Budget Save
  const handleSaveBudget = async (data: any) => {
    await api.setBudget(data);
    showToast('Budget target saved!');
    setEditingBudget(null);
    loadBudgets();
    loadAnalytics();
  };

  // Budget Delete
  const handleDeleteBudget = async (id: number) => {
    try {
      await api.deleteBudget(id);
      showToast('Budget limit removed');
      loadBudgets();
      loadAnalytics();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove budget', 'error');
    }
  };

  // Category Save
  const handleSaveCategory = async (data: any) => {
    await api.createCategory(data);
    showToast('Category created!');
    loadCategories();
  };

  // Category Delete
  const handleDeleteCategory = async (id: number) => {
    try {
      await api.deleteCategory(id);
      showToast('Category removed');
      loadCategories();
      loadTransactions();
      loadBudgets();
      loadAnalytics();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete category', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-aurora-glow text-slate-100 flex flex-col font-sans relative selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background ambient aurora light orbs */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/4 -right-40 w-[28rem] h-[28rem] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed -bottom-40 left-1/3 w-[30rem] h-[30rem] bg-violet-600/12 rounded-full blur-[160px] pointer-events-none -z-10" />
      {/* Toast Notification popup */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'success'
              ? 'bg-slate-900 border-emerald-500/50 text-emerald-300'
              : 'bg-slate-900 border-rose-500/50 text-rose-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        alerts={alerts}
        onOpenAddTransaction={() => {
          setEditingTransaction(null);
          setIsTransactionModalOpen(true);
        }}
        onOpenAuthModal={(tab) => {
          setAuthModalTab(tab || 'login');
          setIsAuthModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'dashboard' && (
          <DashboardView
            summary={summary}
            categoryBreakdown={categoryBreakdown}
            monthlyTrend={monthlyTrend}
            recentTransactions={transactions}
            alerts={alerts}
            onOpenAddTransaction={() => {
              setEditingTransaction(null);
              setIsTransactionModalOpen(true);
            }}
            onQuickAdd={handleQuickAdd}
            onViewAllTransactions={() => setCurrentView('transactions')}
            onViewBudgets={() => setCurrentView('budgets')}
          />
        )}

        {currentView === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            categories={categories}
            totalCount={totalTransactions}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onSearchChange={(s) => {
              setSearchQuery(s);
              setCurrentPage(1);
            }}
            onTypeFilterChange={(t) => {
              setTypeFilter(t);
              setCurrentPage(1);
            }}
            onCategoryFilterChange={(c) => {
              setCategoryFilter(c);
              setCurrentPage(1);
            }}
            onPaymentMethodFilterChange={(m) => {
              setPaymentMethodFilter(m);
              setCurrentPage(1);
            }}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsTransactionModalOpen(true);
            }}
            onEditTransaction={(t) => {
              setEditingTransaction(t);
              setIsTransactionModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {currentView === 'budgets' && (
          <BudgetsView
            budgets={budgets}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onOpenAddBudgetModal={() => {
              setEditingBudget(null);
              setIsBudgetModalOpen(true);
            }}
            onEditBudget={(b) => {
              setEditingBudget(b);
              setIsBudgetModalOpen(true);
            }}
            onDeleteBudget={handleDeleteBudget}
          />
        )}

        {currentView === 'categories' && (
          <CategoriesView
            categoryTree={categoryTree}
            onOpenAddModal={() => setIsCategoryModalOpen(true)}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {currentView === 'reports' && (
          <ReportsView
            summary={summary}
            categoryBreakdown={categoryBreakdown}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        )}
      </main>

      {/* Footer with Team and SDP Project Attribution */}
      <footer className="w-full border-t border-white/5 bg-[#07090e]/60 backdrop-blur-xl py-5 mt-14 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-display tracking-tight text-slate-400">
            <strong className="text-white font-bold">PockIT</strong> • Personal Expense & Budget Tracker (2026_B_SDP_202401100193)
          </p>
          <p className="text-[11px] text-slate-500">
            Student 1 (Architecture) • Student 2 (Budget Engine) • Student 3 (UI & Analytics)
          </p>
        </div>
      </footer>

      {/* Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        categories={categories}
        initialData={editingTransaction}
        onSave={handleSaveTransaction}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        categories={categories}
        initialData={editingBudget}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onSave={handleSaveBudget}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onSave={handleSaveCategory}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </div>
  );
};

export default App;

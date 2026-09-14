export type TransactionType = 'EXPENSE' | 'INCOME';
export type PaymentMethod = 'UPI' | 'CASH' | 'CARD' | 'NET_BANKING';
export type BudgetStatus = 'SAFE' | 'WARNING' | 'BREACHED';

export interface User {
  id: number;
  name: string;
  email: string;
  currency: string;
  avatar?: string | null;
  _count?: {
    transactions: number;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Category {
  id: number;
  userId?: number;
  name: string;
  icon?: string | null;
  color?: string | null;
  type: TransactionType;
  parentId?: number | null;
  parent?: { id: number; name: string; color?: string | null } | null;
  children?: Category[];
  _count?: {
    transactions: number;
  };
}

export interface Transaction {
  id: number;
  userId?: number;
  amount: number;
  type: TransactionType;
  date: string;
  paymentMethod: PaymentMethod;
  notes?: string | null;
  categoryId: number;
  category: Category;
  createdAt: string;
}

export interface Budget {
  id: number;
  userId?: number;
  monthlyLimit: number;
  month: number;
  year: number;
  alertThreshold: number;
  categoryId?: number | null;
  category?: Category | null;
  spent: number;
  percentage: number;
  remaining: number;
  status: BudgetStatus;
  isBreached: boolean;
  isWarning: boolean;
}

export interface BudgetAlertsResponse {
  count: number;
  alerts: Budget[];
}

export interface AnalyticsSummary {
  period: { month: number; year: number };
  currency: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  transactionCount: number;
  budget: {
    totalLimit: number;
    totalSpent: number;
    remaining: number;
    percentageUsed: number;
  };
  studentAdvisor: {
    daysInMonth: number;
    currentDay: number;
    daysRemaining: number;
    safeDailyAllowance: number;
    currency: string;
    paceStatus: 'SAFE' | 'WARNING' | 'SURVIVAL';
    headline: string;
  };
}

export interface CategoryBreakdownItem {
  id: number;
  name: string;
  color: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface MonthlyTrendItem {
  month: string;
  monthNum: number;
  year: number;
  income: number;
  expense: number;
  savings: number;
}

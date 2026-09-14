import {
  User,
  AuthResponse,
  Category,
  Transaction,
  Budget,
  BudgetAlertsResponse,
  AnalyticsSummary,
  CategoryBreakdownItem,
  MonthlyTrendItem,
} from '../types';

const API_BASE = '/api';

// Helper for managing auth state in localStorage
let currentToken = localStorage.getItem('pockit_token') || '';
let currentUserId = localStorage.getItem('pockit_user_id') || '';

export const api = {
  setAuth(token: string, userId: number | string) {
    currentToken = token;
    currentUserId = userId.toString();
    localStorage.setItem('pockit_token', token);
    localStorage.setItem('pockit_user_id', currentUserId);
  },

  clearAuth() {
    currentToken = '';
    currentUserId = '';
    localStorage.removeItem('pockit_token');
    localStorage.removeItem('pockit_user_id');
  },

  getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }
    if (currentUserId) {
      headers['x-user-id'] = currentUserId;
    }
    return headers;
  },

  // Auth & Profile
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to log in');
    }
    const data: AuthResponse = await res.json();
    this.setAuth(data.token, data.user.id);
    return data;
  },

  async register(payload: {
    name: string;
    email: string;
    password: string;
    currency?: string;
  }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to register');
    }
    const data: AuthResponse = await res.json();
    this.setAuth(data.token, data.user.id);
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/auth/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async switchUser(userId: number): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to switch user');
    const data: AuthResponse = await res.json();
    this.setAuth(data.token, data.user.id);
    return data;
  },

  // Categories
  async getCategories(tree = false, type?: string): Promise<Category[]> {
    const params = new URLSearchParams();
    if (tree) params.append('tree', 'true');
    if (type) params.append('type', type);
    const res = await fetch(`${API_BASE}/categories?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
  },

  async deleteCategory(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete category');
    return res.json();
  },

  // Transactions
  async getTransactions(params: {
    type?: string;
    categoryId?: number;
    paymentMethod?: string;
    search?: string;
    month?: number;
    year?: number;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Transaction[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    if (params.type) query.append('type', params.type);
    if (params.categoryId) query.append('categoryId', params.categoryId.toString());
    if (params.paymentMethod) query.append('paymentMethod', params.paymentMethod);
    if (params.search) query.append('search', params.search);
    if (params.month) query.append('month', params.month.toString());
    if (params.year) query.append('year', params.year.toString());
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/transactions?${query.toString()}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  async createTransaction(data: {
    amount: number;
    type: string;
    date: string;
    paymentMethod: string;
    notes?: string;
    categoryId: number;
  }): Promise<Transaction> {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create transaction');
    return res.json();
  },

  async updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction> {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update transaction');
    return res.json();
  },

  async deleteTransaction(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete transaction');
    return res.json();
  },

  // Budgets & Alerts
  async getBudgets(month: number, year: number): Promise<Budget[]> {
    const res = await fetch(`${API_BASE}/budgets?month=${month}&year=${year}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch budgets');
    return res.json();
  },

  async getBudgetAlerts(month: number, year: number): Promise<BudgetAlertsResponse> {
    const res = await fetch(`${API_BASE}/budgets/alerts?month=${month}&year=${year}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch budget alerts');
    return res.json();
  },

  async setBudget(data: {
    monthlyLimit: number;
    month: number;
    year: number;
    alertThreshold: number;
    categoryId?: number | null;
  }): Promise<Budget> {
    const res = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save budget limit');
    return res.json();
  },

  async deleteBudget(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/budgets/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete budget');
    return res.json();
  },

  // Analytics
  async getSummary(month: number, year: number): Promise<AnalyticsSummary> {
    const res = await fetch(`${API_BASE}/analytics/summary?month=${month}&year=${year}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch summary');
    return res.json();
  },

  async getCategoryBreakdown(month: number, year: number): Promise<{ totalSpent: number; breakdown: CategoryBreakdownItem[] }> {
    const res = await fetch(`${API_BASE}/analytics/category-breakdown?month=${month}&year=${year}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch breakdown');
    return res.json();
  },

  async getMonthlyTrend(): Promise<MonthlyTrendItem[]> {
    const res = await fetch(`${API_BASE}/analytics/monthly-trend`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch trend');
    return res.json();
  },

  // Export CSV
  getExportCsvUrl(month?: number, year?: number, type?: string): string {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    if (type) params.append('type', type);
    return `${API_BASE}/export/csv?${params.toString()}`;
  },
};

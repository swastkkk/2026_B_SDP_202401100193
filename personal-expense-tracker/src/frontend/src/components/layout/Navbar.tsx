import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  FolderTree,
  FileSpreadsheet,
  Bell,
  Plus,
  AlertTriangle,
  ChevronDown,
  Calendar,
  UserCheck,
  UserPlus,
  Sparkles,
  Users,
} from 'lucide-react';
import { Budget } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  alerts: Budget[];
  onOpenAddTransaction: () => void;
  onOpenAuthModal: (tab?: 'switch' | 'register' | 'login') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  alerts,
  onOpenAddTransaction,
  onOpenAuthModal,
}) => {
  const { user, usersList, switchUser } = useAuth();
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const alertRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (alertRef.current && !alertRef.current.contains(e.target as Node)) {
        setShowAlertsDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'transactions', label: 'Transactions', icon: <Receipt className="w-4 h-4" /> },
    { id: 'budgets', label: 'Budgets & Radar', icon: <PiggyBank className="w-4 h-4" /> },
    { id: 'categories', label: 'Categories', icon: <FolderTree className="w-4 h-4" /> },
    { id: 'reports', label: 'Audit & Reports', icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-nav glass-specular">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Wordmark */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setCurrentView('dashboard')}>
              <div className="relative w-10 h-10 rounded-2xl overflow-hidden glass-panel glass-specular p-1 border border-white/20 group-hover:scale-105 group-hover:border-indigo-500/50 transition-all shadow-md shadow-indigo-500/10">
                <img
                  src="/logo.png"
                  alt="PockIT Zen Balance Logo"
                  className="w-full h-full object-contain rounded-xl drop-shadow"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl text-white tracking-tight font-display">
                    Pock<span className="text-indigo-400 font-black">IT</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded glass-pill text-indigo-300 border border-indigo-500/30">
                    v2.0
                  </span>
                </div>
              </div>
            </div>

            {/* User Profile Pill & Quick Switcher */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-pill hover:border-indigo-500/40 hover:bg-white/5 transition-all text-xs font-semibold text-slate-200 shadow-sm"
              >
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'User'}`}
                  alt={user?.name}
                  className="w-5 h-5 rounded-md bg-slate-800 border border-white/10"
                />
                <span className="max-w-[110px] sm:max-w-[150px] truncate font-display">{user?.name || 'Select User'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl glass-panel-luminous border border-white/10 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="pb-2.5 mb-2 border-b border-white/10">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-display">Active Profile</p>
                    <p className="text-xs font-bold text-white truncate font-display">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  </div>

                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                    Switch Student Persona
                  </p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {usersList.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowProfileDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                          user?.id === u.id
                            ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`}
                            alt={u.name}
                            className="w-5 h-5 rounded"
                          />
                          <span className="truncate">{u.name}</span>
                        </div>
                        {user?.id === u.id && <UserCheck className="w-3.5 h-3.5 text-indigo-400" />}
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800 flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        onOpenAuthModal('register');
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> + New User Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Month/Year Filter Pill */}
          <div className="hidden lg:flex items-center gap-2 glass-pill rounded-xl px-3 py-1.5 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer font-display"
            >
              {months.map((m, idx) => (
                <option key={m} value={idx + 1} className="bg-slate-900 text-slate-200">
                  {m}
                </option>
              ))}
            </select>
            <span className="text-slate-600">/</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer font-mono"
            >
              {[2024, 2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr} className="bg-slate-900 text-slate-200">
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Right Action: Alerts & Add Button */}
          <div className="flex items-center gap-2.5">
            {/* Notification Bell */}
            <div className="relative" ref={alertRef}>
              <button
                onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                className="relative p-2.5 rounded-xl glass-pill text-slate-300 hover:text-white hover:border-indigo-500/40 transition-colors"
                title="Budget Alert Notifications"
              >
                <Bell className="w-4 h-4" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white shadow-lg shadow-rose-500/50 animate-pulse font-mono">
                    {alerts.length}
                  </span>
                )}
              </button>

              {/* Alert Dropdown */}
              {showAlertsDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel-luminous border border-white/10 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">Threshold Alerts</h4>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {alerts.length} Notice{alerts.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                    {alerts.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">
                        🎉 All expenditures are safely within limits!
                      </p>
                    ) : (
                      alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-3 rounded-xl border text-xs ${
                            alert.status === 'BREACHED'
                              ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                              : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold mb-1">
                            <span>
                              {alert.category ? alert.category.name : 'Overall Monthly Budget'}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                                alert.status === 'BREACHED'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {alert.status}
                            </span>
                          </div>
                          <p className="text-[11px] opacity-90">
                            Spent {user?.currency || '₹'}{alert.spent.toLocaleString()} of {user?.currency || '₹'}
                            {alert.monthlyLimit.toLocaleString()} ({alert.percentage}%)
                          </p>
                          {alert.status === 'BREACHED' && (
                            <p className="mt-1 text-[11px] font-semibold text-rose-400">
                              Exceeded by {user?.currency || '₹'}{Math.abs(alert.remaining).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Add Button */}
            <button
              onClick={onOpenAddTransaction}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold font-display text-xs shadow-lg shadow-indigo-500/25 border border-white/10 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Transaction</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-2.5 border-t border-white/5 no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all font-display ${
                  isActive
                    ? 'glass-panel text-white border-indigo-500/50 shadow-sm shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { Users, UserPlus, LogIn, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'switch' | 'register' | 'login';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'switch',
}) => {
  const { user, usersList, switchUser, login, register } = useAuth();
  const [tab, setTab] = useState<'switch' | 'register' | 'login'>(defaultTab);

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCurrency, setRegCurrency] = useState('₹');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSwitch = async (userId: number) => {
    try {
      setLoading(true);
      setError('');
      await switchUser(userId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to switch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        currency: regCurrency,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="PockIT Account & Profiles" maxWidth="max-w-md">
      <div className="space-y-4 text-slate-200">
        {/* Tab switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab('switch');
              setError('');
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              tab === 'switch' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Switch
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError('');
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              tab === 'register' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError('');
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              tab === 'login' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Tab 1: Instant Profile Switcher */}
        {tab === 'switch' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Select an existing user persona to immediately test multi-user isolation with independent transactions and budgets:
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {usersList.map((u) => {
                const isActive = user?.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => !isActive && handleSwitch(u.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md shadow-indigo-950'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`}
                        alt={u.name}
                        className="w-10 h-10 rounded-xl bg-slate-800 p-1 border border-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-white">{u.name}</h4>
                          {isActive && (
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {u.email} • {u._count?.transactions || 0} Txns • {u.currency}
                        </p>
                      </div>
                    </div>

                    {!isActive && (
                      <button
                        type="button"
                        disabled={loading}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        Switch <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => setTab('register')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center justify-center gap-1.5 mx-auto"
              >
                <Sparkles className="w-3.5 h-3.5" /> + Create New Personalized Student Account
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Register */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Arjun Sharma"
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">College Email</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="e.g. arjun@college.edu"
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Currency Symbol</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { code: '₹', label: '₹ INR' },
                  { code: '$', label: '$ USD' },
                  { code: '€', label: '€ EUR' },
                  { code: '£', label: '£ GBP' },
                ].map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setRegCurrency(c.code)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      regCurrency === c.code
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-900/50 text-[11px] text-indigo-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-indigo-400" />
              <span>
                Your account will automatically be initialized with student expense categories and a starter budget limit.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Profile...' : 'Register & Start Tracking'}
            </button>
          </form>
        )}

        {/* Tab 3: Sign In */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="swastik@college.edu"
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="password123"
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  usersList: User[];
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; currency?: string }) => Promise<void>;
  switchUser: (userId: number) => Promise<void>;
  logout: () => void;
  refreshUsers: () => Promise<User[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUsers = useCallback(async () => {
    try {
      const list = await api.getUsers();
      setUsersList(list);
      return list;
    } catch (err) {
      console.error('Failed to load users list:', err);
      return [];
    }
  }, []);

  const switchUser = async (userId: number) => {
    try {
      setIsLoading(true);
      const res = await api.switchUser(userId);
      setUser(res.user);
      await refreshUsers();
    } catch (err) {
      console.error('Failed to switch user:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.login(credentials);
      setUser(res.user);
      await refreshUsers();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: { name: string; email: string; password: string; currency?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.register(payload);
      setUser(res.user);
      await refreshUsers();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.clearAuth();
    if (usersList.length > 0) {
      switchUser(usersList[0].id);
    } else {
      setUser(null);
    }
  };

  // Initial load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const list = await refreshUsers();
        const savedUserId = localStorage.getItem('pockit_user_id');
        
        if (savedUserId && list.some((u) => u.id === Number(savedUserId))) {
          const res = await api.switchUser(Number(savedUserId));
          setUser(res.user);
        } else if (list.length > 0) {
          const res = await api.switchUser(list[0].id);
          setUser(res.user);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [refreshUsers]);

  return (
    <AuthContext.Provider
      value={{
        user,
        usersList,
        isLoading,
        login,
        register,
        switchUser,
        logout,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

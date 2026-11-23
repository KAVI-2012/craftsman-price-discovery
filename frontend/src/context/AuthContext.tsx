import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { apiClient } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('craftsman_token');
    const savedUser = localStorage.getItem('craftsman_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('craftsman_token');
        localStorage.removeItem('craftsman_user');
      }
    } else {
      // Auto-login with default procurement demo account if first visit
      const defaultUser: User = {
        id: 2,
        email: 'procurement@craftsman.com',
        full_name: 'Rajesh Kumar (Senior Buyer)',
        role: 'procurement',
        department: 'Direct Material Sourcing',
        is_active: true,
        created_at: new Date().toISOString()
      };
      // For seamless demo access
      setUser(defaultUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiClient.login(email, password);
      const loggedUser: User = {
        id: data.user_id,
        email: data.email,
        full_name: data.full_name,
        role: data.role as 'admin' | 'procurement',
        department: data.department,
        is_active: true,
        created_at: new Date().toISOString()
      };
      setToken(data.access_token);
      setUser(loggedUser);
      localStorage.setItem('craftsman_token', data.access_token);
      localStorage.setItem('craftsman_user', JSON.stringify(loggedUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('craftsman_token');
    localStorage.removeItem('craftsman_user');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};


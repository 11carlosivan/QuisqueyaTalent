'use client';

import { API_URL } from '@/lib/api';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  role: 'JOB_SEEKER' | 'COMPANY_OWNER' | 'COMPANY_RECRUITER' | 'ADMIN' | 'SUPER_ADMIN';
  profile?: {
    firstName?: string;
    lastName?: string;
    headline?: string;
    avatarUrl?: string;
    province?: string;
  };
  company?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loginAsDemo: (role: 'candidato' | 'empresa' | 'admin') => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  loginAsDemo: async () => {},
  isLoading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('qt_token');
      const storedUser = localStorage.getItem('qt_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Error al cargar auth del storage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('qt_token', newToken);
    localStorage.setItem('qt_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('qt_token');
    localStorage.removeItem('qt_user');
  };

  const loginAsDemo = async (role: 'candidato' | 'empresa' | 'admin') => {
    let email = 'candidato@quisqueyatalent.com';
    if (role === 'empresa') email = 'reclutador@altice.com.do';
    if (role === 'admin') email = 'admin@quisqueyatalent.com';

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        login(data.token, data.user);
      } else {
        alert(data.error || 'Error al iniciar sesión demo');
      }
    } catch (err) {
      console.error('Error conectando con API:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loginAsDemo, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

'use client';

import { API_URL } from '@/lib/api';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '../components/Toast';

export interface User {
  id: string;
  email: string;
  role: 'JOB_SEEKER' | 'COMPANY_OWNER' | 'COMPANY_RECRUITER' | 'ADMIN' | 'SUPER_ADMIN';
  isEmailVerified?: boolean;
  isGoogleLinked?: boolean;
  googleEmail?: string;
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
  refreshUser: () => Promise<void>;
  loginAsDemo: (role: 'candidato' | 'empresa' | 'admin') => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
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

  const refreshUser = async () => {
    const currentToken = token || localStorage.getItem('qt_token');
    if (!currentToken) return;

    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        localStorage.setItem('qt_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Error refrescando usuario:', err);
    }
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
        toast.success(`Has iniciado sesión con el rol de ${role.toUpperCase()}.`, 'Modo Demo Activo');
      } else {
        toast.error(data.error || 'Error al iniciar sesión demo', 'Acceso denegado');
      }
    } catch (err) {
      console.error('Error conectando con API:', err);
      toast.error('No se pudo conectar con el servidor de autenticación.', 'Error de Red');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, loginAsDemo, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

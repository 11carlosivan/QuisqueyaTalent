'use client';

import { API_URL } from '@/lib/api';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import Logo from '../../../components/Logo';
import SocialAuthButtons from '../../../components/SocialAuthButtons';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'Google_Auth_Cancelled' || errorParam === 'LinkedIn_Auth_Cancelled') {
        setError('Inicio de sesión cancelado.');
      } else {
        setError(decodeURIComponent(errorParam));
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        login(data.token, data.user);
        if (data.user.role === 'JOB_SEEKER') {
          router.push('/dashboard/candidato');
        } else if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard/empresa');
        }
      } else {
        setError(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error conectando con el servidor backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-3 sm:py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 bg-white p-5 sm:p-10 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl">
        <div className="text-center space-y-2">
          <Logo className="justify-center mx-auto" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#001428] font-['Plus_Jakarta_Sans'] pt-1">
            Iniciar Sesión
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Accede a tu panel de candidato, gestión de CV o cuenta empresarial.
          </p>
        </div>

        {/* Botones Sociales Google y LinkedIn con diseño Mobile First */}
        <SocialAuthButtons mode="login" role="candidato" />

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Contraseña</label>
              <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">
                ¿Olvidaste tu contraseña?
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[46px] bg-[#0051d5] hover:bg-[#0041ab] active:bg-[#003893] text-white font-extrabold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Entrar a la Plataforma <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-1">
          <p className="text-xs text-slate-500">
            ¿Aún no tienes cuenta?{' '}
            <Link href="/auth/register" className="font-bold text-blue-600 hover:underline">
              Regístrate gratis aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

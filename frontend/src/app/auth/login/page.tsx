'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import Logo from '../../../components/Logo';
import { Mail, Lock, ArrowRight, Sparkles, Building2, UserCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
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
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        <div className="text-center space-y-2">
          <Logo className="justify-center" />
          <h2 className="text-2xl font-extrabold text-[#001428] font-['Plus_Jakarta_Sans'] pt-2">
            Iniciar Sesión
          </h2>
          <p className="text-xs text-slate-500">
            Accede a tu panel de candidato, gestión de CV o cuenta empresarial.
          </p>
        </div>

        {/* Botones de Demo Rápido */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2 text-center">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            ⚡ Acceso rápido sin escribir
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={async () => {
                await loginAsDemo('candidato');
                router.push('/dashboard/candidato');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserCircle className="w-4 h-4" /> Candidato
            </button>
            <button
              type="button"
              onClick={async () => {
                await loginAsDemo('empresa');
                router.push('/dashboard/empresa');
              }}
              className="bg-[#0F2942] hover:bg-[#1A3D5F] text-white text-xs font-semibold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Building2 className="w-4 h-4" /> Empresa
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full text-sm pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0051d5] hover:bg-[#0041ab] text-white font-extrabold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
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

        <div className="text-center pt-2">
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

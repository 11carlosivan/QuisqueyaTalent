'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { API_URL } from '@/lib/api';
import Logo from '@/components/Logo';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const target = searchParams.get('target');
    const linked = searchParams.get('linked');

    if (error) {
      setStatus('error');
      setErrorMessage(
        error === 'Google_Auth_Cancelled' || error === 'LinkedIn_Auth_Cancelled'
          ? 'Has cancelado el proceso de autorización.'
          : decodeURIComponent(error)
      );
      return;
    }

    if (!token) {
      setStatus('error');
      setErrorMessage('No se recibió el token de autenticación del servidor.');
      return;
    }

    const processAuth = async () => {
      try {
        // Consultar el perfil actualizado del usuario con el token recibido
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Error validando sesión con el servidor');
        }

        const userData = await res.json();
        login(token, userData);
        setStatus('success');

        // Redirigir al destino adecuado tras una breve pausa para animar la transición
        setTimeout(() => {
          if (target && target.startsWith('/')) {
            const separator = target.includes('?') ? '&' : '?';
            const dest = linked ? `${target}${separator}linked=${linked}` : target;
            router.push(dest);
          } else if (userData.role === 'JOB_SEEKER') {
            router.push(linked ? `/dashboard/candidato/perfil?linked=${linked}` : '/dashboard/candidato');
          } else if (userData.role === 'ADMIN' || userData.role === 'SUPER_ADMIN') {
            router.push('/admin');
          } else {
            router.push(linked ? `/dashboard/empresa/perfil?linked=${linked}` : '/dashboard/empresa');
          }
        }, 800);
      } catch (err: any) {
        console.error('Error en callback de autenticación:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Error completando el inicio de sesión social.');
      }
    };

    processAuth();
  }, [searchParams, login, router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-10 text-center space-y-6">
        <Logo className="justify-center mx-auto" />

        {status === 'loading' && (
          <div className="py-8 space-y-4">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-blue-600 animate-pulse" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
                Conectando tu cuenta...
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Estamos sincronizando tu perfil de forma segura. En unos segundos entrarás a la plataforma.
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
                ¡Autenticación exitosa!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Te damos la bienvenida a Quisqueya Talent. Redirigiendo a tu panel...
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="py-6 space-y-5">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <AlertCircle className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
                No pudimos completar el acceso
              </h3>
              <p className="text-xs sm:text-sm text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100 font-medium">
                {errorMessage}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/auth/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition active:scale-[0.98]"
              >
                Volver a Iniciar Sesión <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}

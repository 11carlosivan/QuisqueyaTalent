'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { API_URL } from '@/lib/api';
import { toast } from '@/components/Toast';
import { CheckCircle2, ShieldCheck, Loader2, Unlink, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function GoogleLinkCard({ className = '' }: { className?: string }) {
  const { user, token, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const [unlinking, setUnlinking] = useState(false);

  // Escuchar si la URL trae confirmación de vinculación recién completada
  useEffect(() => {
    const linkedParam = searchParams?.get('linked');
    const errorParam = searchParams?.get('error');

    if (linkedParam === 'google') {
      toast.success(
        '¡Tu cuenta de Google se ha vinculado exitosamente! Ahora puedes iniciar sesión con 1 clic usando Google.',
        'Cuenta Vinculada'
      );
      refreshUser();
      // Limpiar el parámetro de la URL sin recargar la página
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('linked');
        window.history.replaceState({}, document.title, url.pathname + (url.search ? '?' + url.searchParams.toString() : ''));
      }
    } else if (errorParam) {
      toast.error(decodeURIComponent(errorParam), 'Error de Vinculación');
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('error');
        window.history.replaceState({}, document.title, url.pathname + (url.search ? '?' + url.searchParams.toString() : ''));
      }
    }
  }, [searchParams, refreshUser]);

  const isLinked = Boolean(
    user?.isGoogleLinked ||
    (user?.profile?.avatarUrl && user.profile.avatarUrl.includes('googleusercontent.com'))
  );

  const googleEmail = user?.googleEmail || user?.email;

  const handleUnlink = async () => {
    const confirmed = window.confirm(
      '¿Deseas desvincular tu cuenta de Google?\n\nPodrás seguir iniciando sesión con tu correo electrónico y tu contraseña registrada.'
    );
    if (!confirmed || !token) return;

    try {
      setUnlinking(true);
      const res = await fetch(`${API_URL}/api/auth/unlink/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success('Cuenta de Google desvinculada correctamente.', 'Desvinculado');
        await refreshUser();
      } else {
        const data = await res.json();
        toast.error(data.error || 'No se pudo desvincular la cuenta.', 'Error');
      }
    } catch (err: any) {
      toast.error('Error al comunicarse con el servidor.', 'Error de Red');
    } finally {
      setUnlinking(false);
    }
  };

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/dashboard/candidato/perfil';
  const roleParam = user?.role === 'COMPANY_OWNER' || user?.role === 'COMPANY_RECRUITER' ? 'empresa' : 'candidato';
  const linkGoogleUrl = `${API_URL}/api/auth/google?linkUserId=${user?.id}&role=${roleParam}&redirectBack=${encodeURIComponent(currentPath)}`;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs">
            {/* SVG Oficial de Google con sus 4 colores */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                Google Workspace & Acceso Rápido
              </h3>
              {isLinked ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Vinculada
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  No vinculada
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Inicia sesión con 1 solo clic y sincroniza tu foto oficial de Google
            </p>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="shrink-0 flex items-center gap-2">
          {isLinked ? (
            <button
              type="button"
              onClick={handleUnlink}
              disabled={unlinking}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              {unlinking ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Unlink className="w-3.5 h-3.5" />
              )}
              <span>Desvincular</span>
            </button>
          ) : (
            <a
              href={linkGoogleUrl}
              id="btn-link-google"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-2xs hover:shadow-xs transition active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Vincular Cuenta de Google</span>
            </a>
          )}
        </div>
      </div>

      {/* Detalle o Explicación */}
      {isLinked ? (
        <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">
              Tu cuenta de Quisqueya Talent está asociada con Google (
              <span className="font-mono text-emerald-800 font-bold">{googleEmail}</span>)
            </p>
            <p className="text-emerald-700 text-[11px] leading-relaxed">
              Puedes entrar en cualquier momento usando el botón &quot;Continuar con Google&quot; en la pantalla de inicio de sesión o seguir usando tu contraseña habitual.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            ¿Te registraste con correo y contraseña? Vincula tu cuenta de Google para habilitar el acceso seguro en un solo clic sin necesidad de recordar contraseñas y verificar tu dirección de correo automáticamente.
          </p>
        </div>
      )}
    </div>
  );
}

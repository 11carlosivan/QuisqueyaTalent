'use client';

import React, { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';

interface SocialAuthButtonsProps {
  mode: 'login' | 'register';
  role?: 'candidato' | 'empresa';
  className?: string;
}

export default function SocialAuthButtons({
  mode,
  role = 'candidato',
  className = '',
}: SocialAuthButtonsProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const roleParam = encodeURIComponent(role);
  const googleHref = `${API_URL}/api/auth/google?role=${roleParam}`;

  // Pre-calentar el backend silenciosamente en segundo plano
  useEffect(() => {
    try {
      fetch(`${API_URL}/api/health`, { method: 'GET', keepalive: true }).catch(() => {});
    } catch {
      // Ignorar cualquier fallo de red silencioso
    }
  }, []);

  const handleGoogleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    // Redirigir a Google tras iniciar la animación de carga
    window.location.href = googleHref;
  };

  const actionText = mode === 'register' ? 'Registrarse' : 'Continuar';

  return (
    <div className={`space-y-2.5 sm:space-y-3 w-full ${className}`}>
      {/* Botón Google */}
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={isConnecting}
        id="btn-social-google"
        className={`group relative flex items-center justify-center gap-3 w-full min-h-[46px] sm:min-h-[48px] px-4 py-3 bg-white hover:bg-slate-50/90 active:bg-slate-100 border border-slate-200/90 hover:border-slate-300 rounded-2xl text-slate-700 font-bold text-xs sm:text-sm shadow-2xs hover:shadow-xs transition-all duration-150 active:scale-[0.98] cursor-pointer ${
          isConnecting ? 'opacity-80 pointer-events-none' : ''
        }`}
      >
        {isConnecting ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Conectando de forma segura con Google...</span>
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-transform group-hover:scale-105"
              viewBox="0 0 24 24"
            >
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
            <span className="truncate">
              {actionText} con <strong className="font-extrabold text-slate-800">Google</strong>
            </span>
          </>
        )}
      </button>

      {/* Separador Visual con texto */}
      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink-0 mx-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-white px-2">
          o continúa con tu correo
        </span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>
    </div>
  );
}

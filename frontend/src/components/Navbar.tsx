'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Logo from './Logo';
import { useAuth } from '../lib/auth-context';
import { Sparkles, Briefcase, FileText, Building2, UserCircle, LogOut, ShieldCheck, Menu, X, Plus, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loginAsDemo } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardHref = () => {
    if (!user) return '/auth/login';
    if (user.role === 'JOB_SEEKER') return '/dashboard/candidato';
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return '/admin';
    return '/dashboard/empresa';
  };

  const handleDemoClick = async (role: 'candidato' | 'empresa' | 'admin') => {
    await loginAsDemo(role);
    if (role === 'candidato') {
      router.push('/dashboard/candidato');
    } else if (role === 'empresa') {
      router.push('/dashboard/empresa');
    } else if (role === 'admin') {
      router.push('/admin');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Demo Banner Superior */}
      <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-950 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-sky-400/20 text-sky-300 font-semibold px-2 py-0.5 rounded text-[11px] border border-sky-400/30">
              Demo Rápido
            </span>
            <span className="hidden sm:inline text-blue-100">
              Prueba la plataforma cambiando de rol al instante:
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDemoClick('candidato')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-0.5 rounded text-[11px] font-medium transition cursor-pointer"
            >
              👤 Candidato (Carlos)
            </button>
            <button
              onClick={() => handleDemoClick('empresa')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-0.5 rounded text-[11px] font-medium transition cursor-pointer"
            >
              🏢 Empresa (Altice)
            </button>
            <button
              onClick={() => handleDemoClick('admin')}
              className="bg-amber-600 hover:bg-amber-500 text-white px-2.5 py-0.5 rounded text-[11px] font-medium transition cursor-pointer"
            >
              🛡️ Super Admin
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Logo Oficial usando logo.svg / icono.svg */}
        <Logo />

        {/* Enlaces Principales */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-semibold transition flex items-center gap-1.5 ${
              pathname === '/' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Bolsa de Empleos
          </Link>

          <Link
            href="/dashboard/candidato/cv"
            className={`text-sm font-semibold transition flex items-center gap-1.5 ${
              pathname.includes('/cv') ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            Crear CV con IA
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
              Gratis
            </span>
          </Link>

          {user?.role === 'JOB_SEEKER' && (
            <Link
              href="/dashboard/candidato/perfil"
              className={`text-sm font-semibold transition flex items-center gap-1.5 ${
                pathname.includes('/perfil') ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 text-blue-600" />
              Mi Perfil
            </Link>
          )}

          <Link
            href="/empresas"
            className={`text-sm font-semibold transition flex items-center gap-1.5 ${
              pathname.includes('/empresas') ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Empresas
          </Link>

          <Link
            href="/dashboard/empresa/vacantes/nueva"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            Publicar Vacante
          </Link>

          {/* Enlace destacado de Admin si está autenticado como administrador */}
          {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
            <Link
              href="/admin"
              className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Panel Administrativo
            </Link>
          )}
        </nav>

        {/* CTAs / Perfil */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href={getDashboardHref()}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
                    ? 'bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs ${
                    user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
                      ? 'bg-amber-600'
                      : user.role === 'JOB_SEEKER'
                      ? 'bg-blue-600'
                      : 'bg-indigo-900'
                  }`}
                >
                  {user.profile?.firstName?.[0] || (user.role === 'ADMIN' ? 'A' : 'E')}
                </div>
                <div className="text-left hidden lg:block leading-tight">
                  <span className="block text-xs font-bold text-slate-900">
                    {user.profile?.firstName || user.company?.name || user.email.split('@')[0]}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">
                    {user.role === 'JOB_SEEKER'
                      ? 'Candidato'
                      : user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
                      ? 'Super Admin'
                      : 'Empresa'}
                  </span>
                </div>
              </Link>
              <button
                onClick={logout}
                title="Cerrar sesión"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl text-sm font-semibold transition"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition flex items-center gap-1.5"
              >
                Registrarme
              </Link>
            </div>
          )}

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-800 font-semibold py-2 px-3 rounded-lg hover:bg-slate-50"
          >
            Bolsa de Empleos
          </Link>
          <Link
            href="/dashboard/candidato/cv"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-800 font-semibold py-2 px-3 rounded-lg hover:bg-slate-50"
          >
            Crear CV con IA (Gratis)
          </Link>
          {user?.role === 'JOB_SEEKER' && (
            <Link
              href="/dashboard/candidato/perfil"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-blue-600 font-bold py-2 px-3 rounded-lg bg-blue-50"
            >
              Mi Perfil Profesional (LinkedIn)
            </Link>
          )}
          <Link
            href="/empresas"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-800 font-semibold py-2 px-3 rounded-lg hover:bg-slate-50"
          >
            Empresas Dominicanas
          </Link>
          <Link
            href="/dashboard/empresa/vacantes/nueva"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-800 font-semibold py-2 px-3 rounded-lg hover:bg-slate-50"
          >
            Publicar Vacante
          </Link>
          {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-amber-800 font-bold py-2 px-3 rounded-lg bg-amber-50"
            >
              Panel Administrativo (Super Admin)
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

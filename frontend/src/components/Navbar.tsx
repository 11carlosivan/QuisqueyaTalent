'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Logo from './Logo';
import { useAuth } from '../lib/auth-context';
import { API_URL } from '../lib/api';
import {
  Sparkles, Briefcase, FileText, Building2, UserCircle,
  LogOut, ShieldCheck, Menu, X, Plus, User, Users, Bot, ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mantener despierto el backend en segundo plano silenciosamente
  useEffect(() => {
    try {
      fetch(`${API_URL}/api/health`, { keepalive: true }).catch(() => {});
    } catch {}
  }, []);

  const getDashboardHref = () => {
    if (!user) return '/auth/login';
    if (user.role === 'JOB_SEEKER') return '/dashboard/candidato';
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return '/admin';
    return '/dashboard/empresa';
  };

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  const navLinkClass = (path: string) =>
    `relative text-sm font-medium transition-colors duration-150 pb-0.5 ${
      isActive(path)
        ? 'text-blue-600 after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-blue-600 after:rounded-full'
        : 'text-slate-600 hover:text-slate-900'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main bar */}
        <div className="flex items-center justify-between h-16 gap-6">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Nav links — desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className={`${navLinkClass('/')} px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-1.5`}>
              <Briefcase className="w-4 h-4 opacity-70" />
              Bolsa de Empleos
            </Link>

            <Link
              href="/dashboard/candidato/cv"
              className={`${navLinkClass('/dashboard/candidato/cv')} px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-1.5`}
            >
              <FileText className="w-4 h-4 opacity-70" />
              Crear CV con IA
              <span className="ml-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                Gratis
              </span>
            </Link>

            {user?.role === 'JOB_SEEKER' && (
              <Link
                href="/dashboard/candidato/perfil"
                className={`${navLinkClass('/dashboard/candidato/perfil')} px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-1.5`}
              >
                <User className="w-4 h-4 opacity-70" />
                Mi Perfil
              </Link>
            )}

            {(user?.role === 'COMPANY_OWNER' || user?.role === 'COMPANY_RECRUITER') && (
              <Link
                href="/dashboard/empresa/perfil"
                className={`${navLinkClass('/dashboard/empresa/perfil')} px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-1.5`}
              >
                <Building2 className="w-4 h-4 opacity-70" />
                Perfil Corporativo
              </Link>
            )}

            <Link
              href="/candidatos"
              className={`${navLinkClass('/candidatos')} px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-1.5`}
            >
              <Users className="w-4 h-4 opacity-70" />
              Talento
            </Link>

            <Link
              href="/empresas"
              className={`${navLinkClass('/empresas')} px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-1.5`}
            >
              <Building2 className="w-4 h-4 opacity-70" />
              Empresas
            </Link>
          </nav>

          {/* Right-side actions */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Publicar Vacante CTA */}
            <Link
              href="/dashboard/empresa/vacantes/nueva"
              className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 hover:bg-blue-50 px-3.5 py-2 rounded-xl transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
              Publicar Vacante
            </Link>

            {/* Admin badges */}
            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-xs font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-3 py-2 rounded-xl transition-all shadow-md shadow-blue-500/25"
                >
                  <Bot className="w-3.5 h-3.5 text-amber-300" />
                  Publicador IA
                  <span className="bg-amber-400 text-slate-900 text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none">
                    AUTO
                  </span>
                </Link>
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-2 rounded-xl transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Centro de Mando
                </Link>
              </div>
            )}

            {/* Divider */}
            {user && (
              <div className="hidden md:block h-7 w-px bg-slate-200 mx-1" />
            )}

            {/* User section */}
            {user ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href={getDashboardHref()}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
                      ? 'bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
                        ? 'bg-amber-500'
                        : user.role === 'JOB_SEEKER'
                        ? 'bg-blue-600'
                        : 'bg-indigo-900'
                    }`}
                  >
                    {user.profile?.firstName?.[0] || (user.role === 'ADMIN' ? 'A' : 'E')}
                  </div>
                  <div className="text-left hidden lg:block leading-tight">
                    <span className="block text-xs font-bold">
                      {user.profile?.firstName || user.company?.name || user.email.split('@')[0]}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wide">
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
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all duration-150 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-all duration-150"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-150"
                >
                  Registrarme
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pt-3 pb-6 space-y-1">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-slate-700 font-medium py-2.5 px-3 rounded-xl hover:bg-slate-50"
          >
            <Briefcase className="w-4 h-4 text-slate-400" />
            Bolsa de Empleos
          </Link>
          <Link
            href="/dashboard/candidato/cv"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-slate-700 font-medium py-2.5 px-3 rounded-xl hover:bg-slate-50"
          >
            <FileText className="w-4 h-4 text-blue-500" />
            Crear CV con IA
            <span className="ml-auto bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">Gratis</span>
          </Link>
          {user?.role === 'JOB_SEEKER' && (
            <Link
              href="/dashboard/candidato/perfil"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-blue-600 font-semibold py-2.5 px-3 rounded-xl bg-blue-50"
            >
              <User className="w-4 h-4" />
              Mi Perfil Profesional
            </Link>
          )}
          {(user?.role === 'COMPANY_OWNER' || user?.role === 'COMPANY_RECRUITER') && (
            <Link
              href="/dashboard/empresa/perfil"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-blue-600 font-semibold py-2.5 px-3 rounded-xl bg-blue-50"
            >
              <Building2 className="w-4 h-4" />
              Perfil Corporativo
            </Link>
          )}
          <Link
            href="/candidatos"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-slate-700 font-medium py-2.5 px-3 rounded-xl hover:bg-slate-50"
          >
            <Users className="w-4 h-4 text-slate-400" />
            Directorio de Talento
          </Link>
          <Link
            href="/empresas"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-slate-700 font-medium py-2.5 px-3 rounded-xl hover:bg-slate-50"
          >
            <Building2 className="w-4 h-4 text-slate-400" />
            Empresas
          </Link>

          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/dashboard/empresa/vacantes/nueva"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-blue-600 font-semibold py-2.5 px-3 rounded-xl hover:bg-blue-50 border border-blue-200"
            >
              <Plus className="w-4 h-4" />
              Publicar Vacante
            </Link>
          </div>

          {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
            <div className="pt-2 space-y-1">
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-white font-black py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                <Bot className="w-4 h-4 text-amber-300" />
                Publicador IA (Instagram)
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-amber-800 font-bold py-2.5 px-3 rounded-xl bg-amber-50"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Centro de Mando Administrativo
              </Link>
            </div>
          )}

          {!user && (
            <div className="pt-2 space-y-2 border-t border-slate-100">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-slate-700 font-semibold py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-white font-semibold py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                Registrarme
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

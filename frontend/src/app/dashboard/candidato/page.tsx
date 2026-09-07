'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import {
  Sparkles,
  FileText,
  Briefcase,
  TrendingUp,
  MapPin,
  Clock,
  ArrowRight,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  Loader2,
} from 'lucide-react';

export default function CandidateDashboardPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<any[]>([]);
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (token) {
      Promise.all([
        fetch('http://localhost:5000/api/applications/my', {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
        fetch('http://localhost:5000/api/resumes/my', {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
      ])
        .then(([appsData, resData]) => {
          if (Array.isArray(appsData)) setApplications(appsData);
          if (resData && resData.resume) setResume(resData.resume);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, token, isLoading]);

  if (isLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">Cargando tu panel de candidato...</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">Enviada</span>;
      case 'REVIEWING':
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">En Revisión</span>;
      case 'SHORTLISTED':
        return <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded-full">Preseleccionado</span>;
      case 'INTERVIEWING':
        return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">Entrevista Agendada</span>;
      case 'OFFER':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">¡Oferta Laboral!</span>;
      case 'REJECTED':
        return <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full">No seleccionado</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Banner de Bienvenida */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              {user?.profile?.firstName?.[0] || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#001428] font-['Plus_Jakarta_Sans']">
                  ¡Hola, {user?.profile?.firstName || 'Candidato'}!
                </h1>
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200/60">
                  Candidato Activo
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {user?.profile?.headline || 'Gestiona tu currículum y da seguimiento a tus postulaciones'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/candidato/cv"
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-emerald-500/20"
            >
              <Sparkles className="w-4 h-4" />
              Editar CV con IA
            </Link>
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Briefcase className="w-4 h-4" />
              Buscar Nuevos Empleos
            </Link>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Puntuación ATS
              </span>
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
              {resume?.atsScore || 94}%
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Alta compatibilidad con reclutadores
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Postulaciones
              </span>
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Send className="w-4 h-4" />
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
              {applications.length}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              Candidaturas enviadas
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Visualizaciones CV
              </span>
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Eye className="w-4 h-4" />
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
              48
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              Empresas vieron tu perfil
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Alertas Activas
              </span>
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
              Santo Domingo
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              Notificaciones por correo
            </div>
          </div>
        </div>

        {/* Sección de Postulaciones y CV */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Postulaciones Recientes (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-[#001428] font-['Plus_Jakarta_Sans']">
                  Mis Postulaciones Recientes
                </h2>
                <p className="text-xs text-slate-500">
                  Rastrea el progreso en tiempo real de los procesos donde has aplicado
                </p>
              </div>
              <Link
                href="/dashboard/candidato/postulaciones"
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                Ver todas <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Briefcase className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">Aún no te has postulado a ninguna vacante.</p>
                <Link
                  href="/"
                  className="inline-block mt-3 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-700"
                >
                  Explorar Empleos Disponibles
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0">
                        {app.job?.company?.name?.slice(0, 2) || 'RD'}
                      </div>
                      <div>
                        <Link
                          href={`/empleos/${app.job?.slug}`}
                          className="font-bold text-sm text-slate-900 hover:text-blue-600 line-clamp-1"
                        >
                          {app.job?.title}
                        </Link>
                        <div className="text-xs text-slate-500">
                          {app.job?.company?.name} • {app.job?.company?.province}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      {getStatusBadge(app.status)}
                      <Link
                        href="/dashboard/candidato/postulaciones"
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Detalles
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tarjeta de CV (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-[#0F2942] to-[#001428] text-white rounded-3xl p-6 shadow-md border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
                  Tu CV Profesional
                </span>
                <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-400/30">
                  Listo para descargar
                </span>
              </div>

              <h3 className="text-lg font-bold font-['Plus_Jakarta_Sans']">
                {resume?.title || 'Mi Currículum Quisqueya Talent'}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                Tu currículum incluye {resume?.experiences?.length || 2} experiencias y{' '}
                {resume?.skills?.length || 6} habilidades con optimización semántica ATS.
              </p>

              <div className="pt-2 space-y-2">
                <Link
                  href="/dashboard/candidato/cv"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <Sparkles className="w-4 h-4" /> Editar y Mejorar con IA
                </Link>
                <Link
                  href="/dashboard/candidato/cv"
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Download className="w-4 h-4" /> Descargar en PDF
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

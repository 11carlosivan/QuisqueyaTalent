'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth-context';
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function CandidateApplicationsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (token) {
      fetch('http://localhost:5000/api/applications/my', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setApplications(data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, token, isLoading]);

  const stages = [
    { key: 'APPLIED', label: 'Enviada' },
    { key: 'REVIEWING', label: 'En Revisión' },
    { key: 'SHORTLISTED', label: 'Preseleccionado' },
    { key: 'INTERVIEWING', label: 'Entrevista' },
    { key: 'OFFER', label: 'Oferta Final' },
  ];

  const getStageIndex = (status: string) => {
    const idx = stages.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  const filteredApps = applications.filter((app) => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return app.status !== 'REJECTED' && app.status !== 'HIRED';
    if (filter === 'INTERVIEW') return app.status === 'INTERVIEWING';
    if (filter === 'CLOSED') return app.status === 'REJECTED' || app.status === 'HIRED';
    return true;
  });

  if (isLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">Cargando tus postulaciones...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header con navegación de vuelta */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard/candidato"
              className="text-xs font-bold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 mb-2 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al Panel
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001428] font-['Plus_Jakarta_Sans']">
              Seguimiento de Mis Postulaciones
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Conoce el estado exacto en el que se encuentra cada proceso de selección
            </p>
          </div>

          {/* Filtros */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({applications.length})
            </button>
            <button
              onClick={() => setFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === 'ACTIVE' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              En Curso
            </button>
            <button
              onClick={() => setFilter('INTERVIEW')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === 'INTERVIEW' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Entrevistas
            </button>
          </div>
        </div>

        {/* Listado de Postulaciones con Timeline */}
        {filteredApps.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base mb-1">No hay postulaciones en este filtro</h3>
            <p className="text-xs text-slate-500 mb-4">
              Explora nuestra bolsa de empleos gratuita y postúlate a las vacantes de tu interés.
            </p>
            <Link
              href="/"
              className="bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-blue-700 transition"
            >
              Explorar Empleos
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredApps.map((app) => {
              const currentStageIdx = getStageIndex(app.status);
              const isRejected = app.status === 'REJECTED';

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6"
                >
                  {/* Info Superior */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0">
                        {app.job?.company?.name?.slice(0, 2)}
                      </div>
                      <div>
                        <Link
                          href={`/empleos/${app.job?.slug}`}
                          className="font-extrabold text-base sm:text-lg text-slate-900 hover:text-blue-600 transition"
                        >
                          {app.job?.title}
                        </Link>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-slate-700">{app.job?.company?.name}</span>
                          <span>•</span>
                          <span>📍 {app.job?.company?.province || 'República Dominicana'}</span>
                          <span>•</span>
                          <span>📅 {new Date(app.appliedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/empleos/${app.job?.slug}`}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 self-end sm:self-center"
                    >
                      Ver vacante <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* TIMELINE DE PROCESO */}
                  {isRejected ? (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs space-y-1">
                      <div className="font-bold">Proceso concluido: No seleccionado</div>
                      <p className="text-rose-600">
                        La empresa ha cubierto la vacante o ha decidido continuar con otros perfiles. ¡Sigue postulándote a nuevas oportunidades!
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
                        Etapa Actual del Proceso
                      </div>

                      {/* Timeline Bar */}
                      <div className="grid grid-cols-5 gap-2 sm:gap-4 relative">
                        {stages.map((stage, idx) => {
                          const isDone = idx <= currentStageIdx;
                          const isCurrent = idx === currentStageIdx;

                          return (
                            <div key={stage.key} className="flex flex-col items-center text-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all mb-2 ${
                                  isCurrent
                                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                                    : isDone
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                                }`}
                              >
                                {isDone && !isCurrent ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  idx + 1
                                )}
                              </div>
                              <span
                                className={`text-[11px] font-bold ${
                                  isCurrent
                                    ? 'text-blue-600'
                                    : isDone
                                    ? 'text-slate-800'
                                    : 'text-slate-400'
                                }`}
                              >
                                {stage.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Historial y notas */}
                  {app.statusHistory && app.statusHistory.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 text-xs space-y-2">
                      <div className="font-bold text-slate-600">Última actualización:</div>
                      <div className="bg-slate-50 p-3 rounded-xl text-slate-700 border border-slate-100 flex items-start gap-2">
                        <Clock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-900">
                            {app.statusHistory[0]?.notes || 'Postulación registrada en Quisqueya Talent'}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {new Date(app.statusHistory[0]?.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

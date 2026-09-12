'use client';

import { API_URL } from '@/lib/api';
import { toast } from '@/components/Toast';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import {
  Building2,
  Briefcase,
  Users,
  Plus,
  Sparkles,
  Share2,
  TrendingUp,
  Clock,
  Eye,
  CheckCircle2,
  ChevronRight,
  Loader2,
  PowerOff,
  AlertTriangle,
} from 'lucide-react';

export default function CompanyDashboardPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (token) {
      fetch(`${API_URL}/api/jobs/company/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setJobs(data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, token, isLoading]);

  const handleToggleJobStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'CLOSED' : 'PUBLISHED';
    toast.confirm({
      title: currentStatus === 'PUBLISHED' ? '¿Marcar como No Disponible?' : '¿Reactivar Vacante?',
      message:
        currentStatus === 'PUBLISHED'
          ? 'La vacante dejará de recibir postulaciones de candidatos, pero su página permanecerá activa para mantener el posicionamiento SEO y AdSense.'
          : 'La vacante volverá a admitir postulaciones de candidatos inmediatamente.',
      confirmText: currentStatus === 'PUBLISHED' ? 'Marcar No Disponible' : 'Reactivar Vacante',
      type: currentStatus === 'PUBLISHED' ? 'warning' : 'info',
      onConfirm: async () => {
        setUpdatingJobId(jobId);
        try {
          const res = await fetch(`${API_URL}/api/jobs/${jobId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: newStatus }),
          });

          const data = await res.json();
          if (!res.ok) {
            toast.error(data.error || 'No se pudo actualizar el estado de la vacante', 'Error');
            return;
          }

          setJobs((prev) =>
            prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
          );
          toast.success(
            newStatus === 'CLOSED'
              ? 'La vacante se ha marcado como no disponible.'
              : 'La vacante se ha reactivado con éxito.',
            'Estado Actualizado'
          );
        } catch (err) {
          console.error(err);
          toast.error('Error al modificar el estado de la vacante', 'Error de Red');
        } finally {
          setUpdatingJobId(null);
        }
      },
    });
  };

  if (isLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">Cargando panel de empresa...</p>
      </div>
    );
  }

  const totalApplications = jobs.reduce((sum, j) => sum + (j._count?.applications || 0), 0);
  const totalViews = jobs.reduce((sum, j) => sum + (j.viewsCount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Banner Empresa */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#0F2942] text-white font-black text-2xl flex items-center justify-center shadow-md">
              {user?.company?.name?.slice(0, 2) || 'RD'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#001428] font-['Plus_Jakarta_Sans']">
                  {user?.company?.name || 'Panel de Empresa'}
                </h1>
                <span className="bg-blue-50 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                  Empresa Verificada
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Portal de reclutamiento, publicaciones y pipeline ATS de candidatos
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/empresa/vacantes/nueva"
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition flex items-center gap-2 shadow-md shadow-blue-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Publicar Nueva Vacante Gratis
            </Link>
          </div>
        </div>

        {/* Métricas de Reclutamiento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Vacantes Publicadas
              </span>
              <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <Briefcase className="w-4 h-4" />
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
              {jobs.length}
            </div>
            <div className="text-[11px] text-blue-600 font-semibold mt-1">
              Todas activas en el buscador
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Candidatos Recibidos
              </span>
              <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <Users className="w-4 h-4" />
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
              {totalApplications}
            </div>
            <div className="text-[11px] text-slate-500 font-semibold mt-1">
              Listos en tu tablero ATS
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Vistas de Vacantes
              </span>
              <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <Eye className="w-4 h-4" />
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
              {totalViews}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              Tráfico orgánico RD
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Asistente de IA
              </span>
              <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
              Activo
            </div>
            <div className="text-[11px] text-slate-600 font-semibold mt-1">
              Redacción y Creativos Redes
            </div>
          </div>
        </div>

        {/* Listado de Vacantes de la Empresa */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-[#001428] font-['Plus_Jakarta_Sans']">
                Vacantes de tu Empresa
              </h2>
              <p className="text-xs text-slate-500">
                Administra tus puestos, evalúa candidatos en el ATS o genera creativos para redes sociales
              </p>
            </div>
          </div>

          {/* Aviso Educativo SEO */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 text-xs text-blue-950 flex items-start gap-3 shadow-xs">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Estrategia SEO y Tráfico Permanente: </span>
              Para proteger el posicionamiento en Google y evitar penalizaciones de Google AdSense, las vacantes no se eliminan. Cuando finalice tu proceso de selección, márcala como <span className="font-bold">"No disponible"</span>. De este modo se cerrarán las solicitudes de candidatos pero mantendrás las visitas hacia tu marca.
            </div>
          </div>

          {jobs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base mb-1">No tienes vacantes publicadas</h3>
              <p className="text-xs text-slate-500 mb-4">
                Publica tu primera oportunidad laboral sin costo y comienza a recibir candidatos dominicanos hoy mismo.
              </p>
              <Link
                href="/dashboard/empresa/vacantes/nueva"
                className="bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-700 transition"
              >
                Publicar Vacante Gratis
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const isJobAvailable = job.status === 'PUBLISHED';
                return (
                  <div
                    key={job.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      isJobAvailable
                        ? 'border-slate-200 hover:border-blue-300 bg-white'
                        : 'border-slate-200/70 bg-slate-50/50 opacity-90'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/empleos/${job.slug}`}
                          className="font-extrabold text-base text-slate-900 hover:text-blue-600 transition"
                        >
                          {job.title}
                        </Link>
                        {isJobAvailable ? (
                          <span className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Disponible
                          </span>
                        ) : (
                          <span className="bg-slate-200/80 text-slate-600 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-slate-300 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            No disponible
                          </span>
                        )}
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-200">
                          {job.applyMethod === 'EMAIL' ? '✉️ Correo Directo' : '⚡ ATS Plataforma'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                        <span>📍 {job.province}</span>
                        <span>•</span>
                        <span>💼 {job.category}</span>
                        <span>•</span>
                        <span>👥 {job._count?.applications || 0} candidatos postulados</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                      {/* Botón Cambiar Estado Disponible / No Disponible */}
                      {isJobAvailable ? (
                        <button
                          type="button"
                          onClick={() => handleToggleJobStatus(job.id, job.status)}
                          disabled={updatingJobId === job.id}
                          className="bg-slate-100 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 text-slate-600 font-bold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-200 cursor-pointer disabled:opacity-50"
                          title="Marcar como no disponible (conserva la URL pública para SEO)"
                        >
                          {updatingJobId === job.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <PowerOff className="w-3.5 h-3.5" />
                          )}
                          Marcar No Disponible
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleJobStatus(job.id, job.status)}
                          disabled={updatingJobId === job.id}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-emerald-200 cursor-pointer disabled:opacity-50"
                          title="Reactivar recepción de postulaciones"
                        >
                          {updatingJobId === job.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          Reactivar Vacante
                        </button>
                      )}

                      {/* Botón ATS Pipeline */}
                      <Link
                        href={`/dashboard/empresa/vacantes/${job.id}/ats`}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 border border-blue-200/80"
                      >
                        <Users className="w-4 h-4 text-blue-600" />
                        Ver ATS ({job._count?.applications || 0})
                      </Link>

                      {/* Botón Redes Sociales con IA */}
                      <Link
                        href={`/dashboard/empresa/vacantes/${job.id}/social`}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-200"
                      >
                        <Share2 className="w-4 h-4 text-slate-600" />
                        Creativo Social IA
                      </Link>

                      {/* Ver puesto */}
                      <Link
                        href={`/empleos/${job.slug}`}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        title="Ver vacante pública"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { API_URL } from '@/lib/api';

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
  Star,
  Plus,
  Trash2,
  Edit3,
  X,
  ShieldCheck,
  Check,
  User,
} from 'lucide-react';

export default function CandidateDashboardPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<any[]>([]);
  const [resume, setResume] = useState<any>(null);
  const [allResumes, setAllResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [newCvModalOpen, setNewCvModalOpen] = useState(false);
  const [newCvTitle, setNewCvTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchDashboardData = async (authToken: string) => {
    try {
      const [appsData, resData] = await Promise.all([
        fetch(`${API_URL}/api/applications/my`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }).then((r) => r.json()),
        fetch(`${API_URL}/api/resumes/my`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }).then((r) => r.json()),
      ]);

      if (Array.isArray(appsData)) setApplications(appsData);
      if (resData) {
        if (resData.resume) setResume(resData.resume);
        if (Array.isArray(resData.allResumes)) setAllResumes(resData.allResumes);
      }
    } catch (err) {
      console.error('Error cargando datos del candidato:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (token) {
      fetchDashboardData(token);
    }
  }, [user, token, isLoading]);

  // Cambiar Curriculum Principal
  const handleSetPrimary = async (cvId: string) => {
    if (!token) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/resumes/${cvId}/set-primary`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMessage({
          text: '⭐ ¡Currículum Principal actualizado con éxito! Este es el que verán todas las empresas.',
          type: 'success',
        });
        await fetchDashboardData(token);
      } else {
        setFeedbackMessage({
          text: data.error || 'No se pudo actualizar el currículum principal',
          type: 'error',
        });
      }
    } catch (err) {
      setFeedbackMessage({ text: 'Error de conexión con el servidor', type: 'error' });
    } finally {
      setIsActionLoading(false);
      setTimeout(() => setFeedbackMessage(null), 4500);
    }
  };

  // Crear nueva versión de CV
  const handleCreateNewCv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newCvTitle.trim()) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/resumes/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newCvTitle.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewCvModalOpen(false);
        setNewCvTitle('');
        setFeedbackMessage({
          text: '✨ ¡Nueva versión de currículum creada! Puedes editarla cuando gustes.',
          type: 'success',
        });
        await fetchDashboardData(token);
      } else {
        setFeedbackMessage({
          text: data.error || 'Error al crear la versión de currículum',
          type: 'error',
        });
      }
    } catch (err) {
      setFeedbackMessage({ text: 'Error de conexión al crear versión de CV', type: 'error' });
    } finally {
      setIsActionLoading(false);
      setTimeout(() => setFeedbackMessage(null), 4500);
    }
  };

  // Eliminar versión secundaria de CV
  const handleDeleteCv = async (cvId: string, title: string) => {
    if (!token) return;
    if (!confirm(`¿Seguro que deseas eliminar la versión "${title}"? Esta acción no se puede deshacer.`)) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/resumes/${cvId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMessage({
          text: 'Versión de currículum eliminada correctamente.',
          type: 'success',
        });
        await fetchDashboardData(token);
      } else {
        setFeedbackMessage({
          text: data.error || 'No se pudo eliminar el currículum',
          type: 'error',
        });
      }
    } catch (err) {
      setFeedbackMessage({ text: 'Error de conexión al eliminar CV', type: 'error' });
    } finally {
      setIsActionLoading(false);
      setTimeout(() => setFeedbackMessage(null), 4500);
    }
  };

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
        return <span className="bg-blue-50 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-200">¡Oferta Laboral!</span>;
      case 'REJECTED':
        return <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full">No seleccionado</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Notificación flotante de feedback */}
        {feedbackMessage && (
          <div
            className={`p-4 rounded-2xl border text-sm font-semibold flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top duration-300 ${
              feedbackMessage.type === 'success'
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Banner de Bienvenida */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#001428] text-white font-extrabold text-2xl flex items-center justify-center shadow-sm">
              {user?.profile?.firstName?.[0] || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#001428] font-['Plus_Jakarta_Sans']">
                  ¡Hola, {user?.profile?.firstName || 'Candidato'}!
                </h1>
                <span className="bg-blue-50 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200/60">
                  Candidato Activo
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {user?.profile?.headline || 'Gestiona tus versiones de currículum y da seguimiento a tus postulaciones'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/candidato/perfil"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <User className="w-4 h-4" />
              Mi Perfil Profesional (LinkedIn)
            </Link>
            <Link
              href="/dashboard/candidato/cv"
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 border border-slate-200"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              Mis Versiones de CV
            </Link>
            <Link
              href="/"
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
            >
              <Briefcase className="w-4 h-4 text-slate-500" />
              Buscar Empleos
            </Link>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Puntuación ATS Principal
              </span>
              <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <Sparkles className="w-4 h-4 text-slate-600" />
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
              {resume?.atsScore || 94}%
            </div>
            <div className="text-[11px] text-slate-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Alta compatibilidad con reclutadores
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Postulaciones
              </span>
              <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <Send className="w-4 h-4 text-slate-600" />
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
                Versiones de CV
              </span>
              <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <FileText className="w-4 h-4 text-slate-600" />
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
              {allResumes.length || 1}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              Currículums en tu perfil
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Ubicación Preferida
              </span>
              <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <MapPin className="w-4 h-4 text-slate-600" />
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 font-['Plus_Jakarta_Sans'] truncate">
              {user?.profile?.province || 'Santo Domingo'}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              República Dominicana
            </div>
          </div>
        </div>

        {/* SECCIÓN PRINCIPAL: POSTULACIONES Y GESTIÓN DE CURRÍCULUMS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Postulaciones Recientes (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
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
                {applications.slice(0, 5).map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-700 shrink-0">
                        {app.job?.company?.logoUrl ? (
                          <img
                            src={app.job.company.logoUrl}
                            alt={app.job.company.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src="/icono.svg"
                            alt="Quisqueya Talent"
                            className="w-8 h-8 object-contain"
                          />
                        )}
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

          {/* GESTIÓN DE MÚLTIPLES CVs (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Mis Versiones de Currículum
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Elige cuál es tu CV Principal (el que verán todas las empresas)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewCvModalOpen(true)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Nueva Versión
                </button>
              </div>

              {/* Lista de Versiones de CV */}
              <div className="space-y-3">
                {allResumes.map((cvItem) => {
                  const isPrimary = cvItem.isDefault;

                  return (
                    <div
                      key={cvItem.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isPrimary
                          ? 'border-blue-300 bg-blue-50/40 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900">
                              {cvItem.title}
                            </span>
                            {isPrimary ? (
                              <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                                <Star className="w-3 h-3 fill-white" /> CV Principal
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                Versión Secundaria
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Puntuación ATS: <span className="font-bold text-blue-700">{cvItem.atsScore}%</span> • {cvItem.experiences?.length || 0} exp. • {cvItem.skills?.length || 0} hab.
                          </p>
                        </div>
                      </div>

                      {/* Barra de Acciones del CV */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div>
                          {isPrimary ? (
                            <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Visible para reclutadores
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleSetPrimary(cvItem.id)}
                              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-white border border-blue-200 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <Star className="w-3 h-3 text-amber-500" />
                              Establecer como Principal
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/dashboard/candidato/cv?resumeId=${cvItem.id}`}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                            title="Editar esta versión"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>

                          {!isPrimary && allResumes.length > 1 && (
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleDeleteCv(cvItem.id, cvItem.title)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer disabled:opacity-50"
                              title="Eliminar versión"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botón Acceso Rápido al Constructor */}
              <div className="pt-2">
                <Link
                  href="/dashboard/candidato/cv"
                  className="w-full bg-[#0051d5] hover:bg-[#0041ab] text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  Abrir Editor de CV con Inteligencia Artificial
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CREAR NUEVA VERSIÓN DE CV */}
      {newCvModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setNewCvModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Nueva Versión de Currículum
                </h3>
                <p className="text-xs text-slate-500">
                  Crea una variante adaptada a otro sector laboral
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateNewCv} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre o Título de la Versión:
                </label>
                <input
                  type="text"
                  required
                  value={newCvTitle}
                  onChange={(e) => setNewCvTitle(e.target.value)}
                  placeholder="Ej. CV - Desarrollo Web / CV - Gerencia Comercial"
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Se duplicarán tus datos base para que puedas personalizar la experiencia y palabras clave para esta área.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewCvModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading || !newCvTitle.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition disabled:opacity-50"
                >
                  {isActionLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Crear Versión
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

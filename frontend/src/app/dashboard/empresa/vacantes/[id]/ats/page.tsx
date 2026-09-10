'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../../../lib/auth-context';
import {
  Users,
  Briefcase,
  Star,
  Sparkles,
  ArrowLeft,
  Share2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  FileText,
  Mail,
  Phone,
  MapPin,
  Clock,
  Loader2,
  X,
  Send,
  ExternalLink,
  Eye,
} from 'lucide-react';

export default function JobATSPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const jobId = params.id as string;

  const [jobTitle, setJobTitle] = useState('');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [recruiterNotes, setRecruiterNotes] = useState('');
  const [rating, setRating] = useState(5);

  const columns = [
    { key: 'APPLIED', label: 'Nuevos Postulados', color: 'border-slate-300' },
    { key: 'REVIEWING', label: 'En Revisión', color: 'border-blue-400' },
    { key: 'SHORTLISTED', label: 'Preseleccionados', color: 'border-indigo-400' },
    { key: 'INTERVIEWING', label: 'Entrevista', color: 'border-amber-400' },
    { key: 'OFFER', label: 'Oferta / Contratado', color: 'border-blue-500' },
  ];

  const fetchCandidates = async () => {
    if (!token || !jobId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/applications/job/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data && data.applications) {
        setApplications(data.applications);
        setJobTitle(data.jobTitle || 'Vacante');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }
    fetchCandidates();
  }, [user, token, isLoading, jobId]);

  // Cambiar estado en el pipeline
  const handleMoveStage = async (appId: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
        );
        if (selectedApp && selectedApp.id === appId) {
          setSelectedApp((prev: any) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (e) {
      console.error('Error moviendo candidato:', e);
    }
  };

  // Guardar evaluación y notas
  const handleSaveFeedback = async () => {
    if (!selectedApp) return;
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${selectedApp.id}/feedback`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, recruiterNotes }),
      });
      if (res.ok) {
        alert('Evaluación y notas guardadas');
        fetchCandidates();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">Cargando tablero ATS...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 pb-20 pt-6">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div>
            <Link
              href="/dashboard/empresa"
              className="text-xs font-bold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 mb-1 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al panel de empresa
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-[#001428] font-['Plus_Jakarta_Sans']">
                Pipeline ATS: {jobTitle}
              </h1>
              <span className="bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
                {applications.length} Candidatos
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/empresa/vacantes/${jobId}/social`}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <Share2 className="w-4 h-4 text-slate-600" />
              Generar Creativo Social con IA
            </Link>
          </div>
        </div>

        {/* TABLERO KANBAN */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
          {columns.map((col, colIdx) => {
            const colApps = applications.filter((a) => {
              if (col.key === 'OFFER') return a.status === 'OFFER' || a.status === 'HIRED';
              return a.status === col.key;
            });

            return (
              <div
                key={col.key}
                className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/90 flex flex-col min-h-[500px]"
              >
                {/* Header Columna */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                      {col.label}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                      {colApps.length}
                    </span>
                  </div>
                </div>

                {/* Tarjetas de Candidatos */}
                <div className="space-y-3 flex-1">
                  {colApps.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs italic">
                      Sin candidatos en esta fase
                    </div>
                  ) : (
                    colApps.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => {
                          setSelectedApp(app);
                          setRecruiterNotes(app.recruiterNotes || '');
                          setRating(app.rating || 5);
                        }}
                        className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer space-y-3 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {app.user?.profile?.firstName?.[0] || 'C'}
                            </div>
                            <div>
                              <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition">
                                {app.user?.profile?.firstName} {app.user?.profile?.lastName}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                📍 {app.user?.profile?.province || 'RD'}
                              </div>
                            </div>
                          </div>

                          <div className="bg-blue-50 text-blue-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-200">
                            ATS: {app.resume?.atsScore || 94}%
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-600 line-clamp-1 font-medium">
                          {app.user?.profile?.headline || 'Ingeniero de Software'}
                        </div>

                        {/* Botones rápidos para avanzar en pipeline */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          {colIdx > 0 ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveStage(app.id, columns[colIdx - 1].key);
                              }}
                              className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded transition"
                              title="Regresar a etapa anterior"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                          ) : (
                            <div />
                          )}

                          <span className="text-[10px] text-slate-400 font-semibold">
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </span>

                          {colIdx < columns.length - 1 ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveStage(app.id, columns[colIdx + 1].key);
                              }}
                              className="p-1 hover:bg-blue-50 text-blue-600 rounded transition font-bold"
                              title="Avanzar a siguiente etapa"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          ) : (
                            <div />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL DETALLE DE CANDIDATO Y CV */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200 space-y-6">
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Candidato */}
            <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center">
                {selectedApp.user?.profile?.firstName?.[0] || 'C'}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
                  {selectedApp.user?.profile?.firstName} {selectedApp.user?.profile?.lastName}
                </h2>
                <div className="text-xs font-bold text-blue-700">
                  {selectedApp.user?.profile?.headline}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-1">
                  <span>✉️ {selectedApp.user?.email}</span>
                  <span>📱 {selectedApp.user?.profile?.phone || 'No especificado'}</span>
                  <span>📍 {selectedApp.user?.profile?.province}</span>
                </div>

                {selectedApp.user?.id && (
                  <div className="mt-3">
                    <Link
                      href={`/candidatos/${selectedApp.user?.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Ver Perfil Profesional Completo (Estilo LinkedIn & Certificados)
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Carta de presentación */}
            {selectedApp.coverLetter && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-700">Carta de Presentación del Candidato:</div>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {selectedApp.coverLetter}
                </p>
              </div>
            )}

            {/* Resumen del CV */}
            {selectedApp.resume && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900">Currículum Vitae</h3>
                  <span className="bg-blue-50 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                    Puntuación ATS: {selectedApp.resume?.atsScore}%
                  </span>
                </div>

                {selectedApp.resume.summary && (
                  <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                    {selectedApp.resume.summary}
                  </div>
                )}

                {/* Experiencias */}
                {selectedApp.resume.experiences && selectedApp.resume.experiences.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Experiencias Laborales
                    </div>
                    {selectedApp.resume.experiences.map((exp: any, i: number) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{exp.position}</span>
                          <span className="text-slate-400 font-normal">{exp.startDate} - {exp.endDate || 'Actual'}</span>
                        </div>
                        <div className="text-blue-700 font-semibold">{exp.company}</div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Evaluación y notas internas del reclutador */}
            <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 space-y-3">
              <div className="font-bold text-xs text-blue-950">
                Evaluación Interna & Notas de Selección
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-700 font-semibold">Calificación:</span>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="p-1 text-amber-500 hover:scale-125 transition cursor-pointer"
                  >
                    <Star className={`w-4 h-4 ${s <= rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                value={recruiterNotes}
                onChange={(e) => setRecruiterNotes(e.target.value)}
                placeholder="Escribe notas internas sobre la entrevista o perfil del candidato..."
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleSaveFeedback}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Guardar Notas y Calificación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import AdSlot from '../../../components/AdSlot';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Briefcase,
  Building2,
  CheckCircle2,
  Calendar,
  Share2,
  Heart,
  Sparkles,
  ArrowLeft,
  DollarSign,
  Clock,
  ShieldCheck,
  Check,
  Send,
  Loader2,
} from 'lucide-react';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = params.slug as string;

  const [jobData, setJobData] = useState<any>(null);
  const [relatedJobs, setRelatedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/jobs/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.job) {
          setJobData(data.job);
          setRelatedJobs(data.relatedJobs || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  // Generar carta de presentación con IA para este empleo
  const handleGenerateCoverLetter = async () => {
    if (!jobData) return;
    setIsGeneratingAI(true);
    try {
      const res = await fetch('http://localhost:5000/api/ai/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('qt_token') || ''}`,
        },
        body: JSON.stringify({
          jobTitle: jobData.title,
          companyName: jobData.company?.name,
        }),
      });
      const data = await res.json();
      if (data.coverLetter) {
        setCoverLetter(data.coverLetter);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Enviar postulación
  const handleApply = async () => {
    if (!user) {
      alert('Debes iniciar sesión como candidato para postularte');
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'JOB_SEEKER') {
      alert('Debes iniciar sesión con una cuenta de Candidato para postularte');
      return;
    }

    setIsApplying(true);
    try {
      const res = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('qt_token') || ''}`,
        },
        body: JSON.stringify({
          jobId: jobData.id,
          coverLetter,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setHasApplied(true);
        setApplyModalOpen(false);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        alert(data.error || 'No se pudo enviar la postulación');
      }
    } catch (e) {
      alert('Error de conexión con el servidor');
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-slate-500 font-medium">Cargando detalles de la vacante...</p>
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Vacante no encontrada</h2>
        <p className="text-slate-500 mb-6">Esta vacante ha expirado o no se encuentra disponible.</p>
        <Link href="/" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold">
          Ver todas las vacantes
        </Link>
      </div>
    );
  }

  // Estructura JSON-LD para Google Jobs (SEO nativo del documento maestro)
  const jobSchema = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: jobData.title,
    description: jobData.description,
    datePosted: jobData.publishedAt,
    employmentType: jobData.jobType,
    hiringOrganization: {
      '@type': 'Organization',
      name: jobData.company?.name,
      sameAs: jobData.company?.websiteUrl,
      logo: jobData.company?.logoUrl,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: jobData.city || jobData.province,
        addressRegion: jobData.province,
        addressCountry: 'DO',
      },
    },
    ...(jobData.salaryMin && {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: jobData.salaryCurrency,
        value: {
          '@type': 'QuantitativeValue',
          minValue: Number(jobData.salaryMin),
          maxValue: Number(jobData.salaryMax),
          unitText: 'MONTH',
        },
      },
    }),
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Inyección JSON-LD para Google Jobs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobSchema) }}
      />

      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-bold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a todas las vacantes
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Compartir:</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Enlace copiado al portapapeles');
              }}
              className="p-1.5 text-slate-500 hover:text-blue-600 bg-slate-100 rounded-lg transition"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* COLUMNA PRINCIPAL (8 COLS) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tarjeta de Encabezado */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-xl text-slate-700 shrink-0">
                    {jobData.company?.logoUrl ? (
                      <img
                        src={jobData.company.logoUrl}
                        alt={jobData.company.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      jobData.company?.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001428] font-['Plus_Jakarta_Sans'] leading-tight mb-2">
                      {jobData.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                      <Link
                        href={`/empresas/${jobData.company?.slug}`}
                        className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {jobData.company?.name}
                        {jobData.company?.isVerified && (
                          <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-50" />
                        )}
                      </Link>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {jobData.province}, RD
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                  {jobData.salaryMin && jobData.salaryMax && (
                    <div className="text-lg sm:text-xl font-extrabold text-emerald-700">
                      RD$ {Number(jobData.salaryMin).toLocaleString()} - RD${' '}
                      {Number(jobData.salaryMax).toLocaleString()}
                      <span className="text-xs font-semibold text-slate-400 block sm:text-right">
                        / mes (Bruto)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags de modalidad y tipo */}
              <div className="flex flex-wrap gap-2 pt-6">
                <span className="bg-blue-50 text-blue-800 font-bold text-xs px-3 py-1.5 rounded-xl border border-blue-100">
                  Modalidad:{' '}
                  {jobData.workplaceType === 'REMOTE'
                    ? '100% Remoto'
                    : jobData.workplaceType === 'HYBRID'
                    ? 'Híbrido'
                    : 'Presencial'}
                </span>
                <span className="bg-slate-100 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-xl">
                  {jobData.jobType === 'FULL_TIME' ? 'Tiempo Completo' : 'Medio Tiempo'}
                </span>
                <span className="bg-slate-100 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-xl">
                  Categoría: {jobData.category}
                </span>
                <span className="bg-slate-100 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-xl">
                  Nivel: {jobData.experienceLevel}
                </span>
              </div>
            </div>

            {/* Descripción del Puesto */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#001428] font-['Plus_Jakarta_Sans'] mb-3">
                  Descripción de la Vacante
                </h2>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {jobData.description}
                </div>
              </div>

              {jobData.responsibilities && (
                <div>
                  <h2 className="text-lg font-bold text-[#001428] font-['Plus_Jakarta_Sans'] mb-3">
                    Responsabilidades Principales
                  </h2>
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {jobData.responsibilities}
                  </div>
                </div>
              )}

              {jobData.requirements && (
                <div>
                  <h2 className="text-lg font-bold text-[#001428] font-['Plus_Jakarta_Sans'] mb-3">
                    Requisitos y Perfil Deseado
                  </h2>
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {jobData.requirements}
                  </div>
                </div>
              )}

              {jobData.benefits && (
                <div>
                  <h2 className="text-lg font-bold text-[#001428] font-['Plus_Jakarta_Sans'] mb-3">
                    Beneficios y Compensación
                  </h2>
                  <div className="text-sm text-emerald-950 leading-relaxed whitespace-pre-line bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
                    {jobData.benefits}
                  </div>
                </div>
              )}

              {/* Habilidades requeridas */}
              {jobData.skills && jobData.skills.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-[#001428] font-['Plus_Jakarta_Sans'] mb-3">
                    Habilidades Clave
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {jobData.skills.map((s: any) => (
                      <span
                        key={s.skillName}
                        className="bg-blue-50 text-blue-700 font-semibold text-xs px-3 py-1.5 rounded-xl border border-blue-200/60"
                      >
                        {s.skillName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR DERECHO (4 COLS) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Caja de Postulación */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md sticky top-24">
              <h3 className="text-lg font-extrabold text-[#001428] font-['Plus_Jakarta_Sans'] mb-2">
                ¿Te interesa este puesto?
              </h3>

              {jobData.applyMethod === 'EMAIL' ? (
                /* MÉTODO POR CORREO ELECTRÓNICO */
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl space-y-2.5">
                    <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs">
                      <span className="p-1 bg-indigo-600 text-white rounded-md">
                        <Send className="w-3.5 h-3.5" />
                      </span>
                      Recepción Directa por Correo
                    </div>
                    <p className="text-xs text-indigo-900 leading-relaxed">
                      Esta empresa prefiere recibir las hojas de vida y solicitudes directamente en su correo corporativo.
                    </p>
                    <div className="p-2.5 bg-white rounded-xl border border-indigo-200 text-xs font-mono font-bold text-indigo-900 break-all select-all">
                      {jobData.applyEmail || jobData.company?.email || 'rrhh@empresa.com.do'}
                    </div>
                  </div>

                  <a
                    href={`mailto:${jobData.applyEmail || jobData.company?.email || 'rrhh@empresa.com.do'}?subject=${encodeURIComponent(`Postulación a vacante: ${jobData.title} - Quisqueya Talent`)}&body=${encodeURIComponent(`Estimado equipo de Selección:\n\nMe pongo en contacto para postularme a la vacante de ${jobData.title} publicada en Quisqueya Talent.\n\nAdjunto a este correo encontrarán mi currículum vitae en formato PDF.\n\nQuedo a su disposición para cualquier consulta.\n\nSaludos cordiales.`)}`}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 text-center"
                  >
                    <Send className="w-4 h-4" />
                    Enviar mi CV por Correo ✉️
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(jobData.applyEmail || jobData.company?.email || '');
                      alert('Correo copiado al portapapeles');
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-3 rounded-xl text-xs transition text-center cursor-pointer"
                  >
                    Copiar dirección de correo
                  </button>
                </div>
              ) : (
                /* MÉTODO POR LA PLATAFORMA (ATS) */
                <>
                  <p className="text-xs text-slate-500 mb-6">
                    Postúlate gratis en menos de 1 minuto. Tu currículum será enviado directamente al equipo de selección.
                  </p>

                  {hasApplied ? (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-center space-y-2">
                      <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                      <div className="font-bold text-sm">¡Ya te has postulado a este empleo!</div>
                      <p className="text-xs text-emerald-700">
                        Puedes dar seguimiento a tu candidatura en tu panel de postulaciones.
                      </p>
                      <Link
                        href="/dashboard/candidato/postulaciones"
                        className="inline-block mt-2 text-xs font-bold text-emerald-900 underline"
                      >
                        Ver mis postulaciones
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={() => setApplyModalOpen(true)}
                        className="w-full bg-[#0051d5] hover:bg-[#0041ab] text-white font-extrabold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        Postularme en la Plataforma
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* AdSlot en Sidebar */}
              <div className="pt-4">
                <AdSlot slotCode="JOB_SIDEBAR" name="Anuncio Lateral Empleo" />
              </div>

              {/* Datos de la empresa */}
              <div className="pt-6 border-t border-slate-100 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Sobre la empresa
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                    {jobData.company?.name.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-800">{jobData.company?.name}</div>
                    <div className="text-xs text-slate-500">{jobData.company?.industry}</div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {jobData.company?.description}
                </p>
                {jobData.company?.websiteUrl && (
                  <a
                    href={jobData.company.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-blue-600 hover:underline block pt-1"
                  >
                    Visitar sitio web oficial ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE POSTULACIÓN POR PLATAFORMA */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans'] mb-2">
              Postularme a: {jobData.title}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Tu currículum principal de Quisqueya Talent se adjuntará automáticamente a tu postulación.
            </p>

            {/* Carta de Presentación */}
            <div className="space-y-3 mb-6">
              <label className="text-xs font-bold text-slate-700 block">
                Mensaje o Carta de Presentación (Opcional):
              </label>
              <textarea
                rows={5}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Escribe un mensaje breve destacando por qué eres el candidato idóneo para esta vacante..."
                className="w-full text-xs p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApplyModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={isApplying}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
              >
                {isApplying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Confirmar y Enviar Postulación
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

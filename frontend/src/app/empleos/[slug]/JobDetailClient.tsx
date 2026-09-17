'use client';

import { API_URL } from '@/lib/api';

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
  FileText,
  AlertTriangle,
  UserCheck,
  X,
  LogIn,
  Edit3,
  Users,
} from 'lucide-react';

interface JobDetailClientProps {
  initialJob?: any;
  initialRelatedJobs?: any[];
  slug: string;
}

export default function JobDetailClient({
  initialJob,
  initialRelatedJobs = [],
  slug: propSlug,
}: JobDetailClientProps) {
  const params = useParams();
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const slug = propSlug || (params?.slug as string);

  const [jobData, setJobData] = useState<any>(initialJob || null);
  const [relatedJobs, setRelatedJobs] = useState<any[]>(initialRelatedJobs || []);
  const [loading, setLoading] = useState(!initialJob);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [candidateResume, setCandidateResume] = useState<any>(null);
  const [checkingResume, setCheckingResume] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    if (!slug) return;
    if (initialJob && jobData?.id) return;
    setLoading(true);
    fetch(`${API_URL}/api/jobs/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.job) {
          setJobData(data.job);
          setRelatedJobs(data.relatedJobs || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug, initialJob]);

  // Consultar CV del candidato y si ya postuló cuando abre el modal o cambia el usuario
  useEffect(() => {
    if (token && user?.role === 'JOB_SEEKER') {
      setCheckingResume(true);
      Promise.all([
        fetch(`${API_URL}/api/resumes/my`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
        fetch(`${API_URL}/api/applications/my`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
      ])
        .then(([resData, appsData]) => {
          if (resData && resData.resume) {
            setCandidateResume(resData.resume);
          } else {
            setCandidateResume(null);
          }
          if (Array.isArray(appsData) && jobData?.id) {
            const already = appsData.some((app: any) => app.jobId === jobData.id);
            if (already) setHasApplied(true);
          }
        })
        .catch((err) => console.error('Error verificando CV:', err))
        .finally(() => setCheckingResume(false));
    } else {
      setCandidateResume(null);
    }
  }, [token, user, jobData?.id, applyModalOpen]);

  // Generar carta de presentación con IA para este empleo
  const handleGenerateCoverLetter = async () => {
    if (!jobData) return;
    setIsGeneratingAI(true);
    setApplyError(null);
    try {
      const res = await fetch(`${API_URL}/api/ai/generate-cover-letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('qt_token') || ''}`,
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
    setApplyError(null);

    if (!user) {
      setApplyError('Debes iniciar sesión con una cuenta de Candidato para postularte.');
      return;
    }

    if (user.role !== 'JOB_SEEKER') {
      setApplyError('Solo los candidatos pueden postularse. Tu cuenta actual es de Empresa o Administrador.');
      return;
    }

    if (!candidateResume) {
      setApplyError('Debes crear o subir tu currículum en tu perfil antes de poder postularte.');
      return;
    }

    setIsApplying(true);
    try {
      const res = await fetch(`${API_URL}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('qt_token') || ''}`,
        },
        body: JSON.stringify({
          jobId: jobData.id,
          resumeId: candidateResume.id,
          coverLetter,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setHasApplied(true);
        setApplySuccess(true);
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        setApplyError(data.error || 'No se pudo procesar la postulación.');
      }
    } catch (e) {
      setApplyError('Error de conexión con el servidor. Inténtalo nuevamente.');
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

  const isAvailable = jobData.status === 'PUBLISHED';

  // Estructura JSON-LD para Google Jobs (SEO nativo del documento maestro)
  const jobSchema = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: jobData.title,
    description: jobData.description,
    datePosted: jobData.publishedAt,
    ...(!isAvailable && { validThrough: jobData.updatedAt || new Date().toISOString() }),
    employmentType: jobData.jobType,
    hiringOrganization: {
      '@type': 'Organization',
      name: jobData.company?.name,
      sameAs: jobData.company?.websiteUrl,
      logo: jobData.company?.logoUrl || 'https://www.quisqueyatalent.com.do/logo-quisqueya-talent.png',
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

  // OG Image: company logo or QT logo fallback
  const ogImage = jobData.company?.logoUrl || 'https://www.quisqueyatalent.com.do/og-image.png';
  const ogTitle = `${jobData.title} — ${jobData.company?.name} | Quisqueya Talent`;
  const ogDescription = `Vacante en ${jobData.province}, República Dominicana. ${jobData.jobType} · ${jobData.category}. Postúlate en Quisqueya Talent.`;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Dynamic meta tags for sharing */}
      <title>{ogTitle}</title>
      <meta name="description" content={ogDescription} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Quisqueya Talent" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={ogImage} />

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
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `*Vacante en Quisqueya Talent:*\n${jobData.title} — ${jobData.company?.name} (${jobData.province})\n\nVer detalles y postularte aquí:\nhttps://www.quisqueyatalent.com.do/empleos/${jobData.slug}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-xs"
              title="Compartir por WhatsApp"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              WhatsApp
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Enlace copiado al portapapeles');
              }}
              className="p-1.5 text-slate-500 hover:text-blue-600 bg-slate-100 rounded-lg transition"
              title="Copiar enlace"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Banner para la empresa autora o administrador */}
        {user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || (user.company?.id && user.company.id === jobData.companyId)) && (
          <div className="mb-6 bg-slate-900 text-white rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg border border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-white flex items-center gap-2">
                  Gestión de esta vacante
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    Autor
                  </span>
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Estado: <strong className={isAvailable ? 'text-emerald-400' : 'text-amber-400'}>{isAvailable ? '🟢 Disponible' : '⚪ No disponible (Cerrada)'}</strong> • {jobData.viewsCount || 0} visitas • {jobData.applicationsCount || 0} postulaciones
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href={`/dashboard/empresa/vacantes/${jobData.id}/editar`}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" /> Editar Vacante
              </Link>
              <Link
                href={`/dashboard/empresa/vacantes/${jobData.id}/ats`}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" /> Postulantes
              </Link>
            </div>
          </div>
        )}

        {/* Banner destacado si la vacante ya no está disponible */}
        {!isAvailable && (
          <div className="mb-6 bg-amber-50 border border-amber-300/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                Esta vacante ya no se encuentra disponible
              </h4>
              <p className="text-xs text-amber-900/85 mt-0.5 leading-relaxed">
                El proceso de selección para esta posición ha finalizado o la plaza ha sido cubierta. Conservamos esta publicación con fines informativos y de referencia.
              </p>
            </div>
          </div>
        )}

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
                        src={
                          jobData.company.logoUrl.includes('logo-quisqueya-talent.png')
                            ? '/logo-quisqueya-talent.png'
                            : jobData.company.logoUrl
                        }
                        alt={jobData.company.name}
                        className="w-full h-full object-cover"
                        onError={(e: any) => {
                          e.currentTarget.src = '/icono.svg';
                        }}
                      />
                    ) : (
                      <img
                        src="/icono.svg"
                        alt="Quisqueya Talent"
                        className="w-10 h-10 object-contain"
                      />
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
                    <div className="text-lg sm:text-xl font-extrabold text-[#0051d5]">
                      RD$ {Number(jobData.salaryMin).toLocaleString()} - RD${' '}
                      {Number(jobData.salaryMax).toLocaleString()}
                      <span className="text-xs font-semibold text-slate-400 block sm:text-right">
                        / mes (Bruto)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags de modalidad, disponibilidad y tipo */}
              <div className="flex flex-wrap gap-2 pt-6">
                {!isAvailable ? (
                  <span className="bg-slate-100 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400 inline-block"></span>
                    Vacante no disponible
                  </span>
                ) : (
                  <span className="bg-emerald-50 text-emerald-800 font-bold text-xs px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    Vacante disponible
                  </span>
                )}
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
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
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
                {isAvailable ? '¿Te interesa este puesto?' : 'Estado de la Vacante'}
              </h3>

              {!isAvailable ? (
                /* VACANTE NO DISPONIBLE (CONSERVA LA PÁGINA PARA SEO Y ADSENSE) */
                <div className="space-y-4">
                  {jobData.applyMethod === 'EMAIL' ? (
                    /* Caso Correo Electrónico: No mostrar el correo y mostrar aviso neutro */
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                        <span className="p-1 bg-slate-400 text-white rounded-md">
                          <Briefcase className="w-3.5 h-3.5" />
                        </span>
                        Recepción por correo cerrada
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        La empresa ya no está recibiendo currículums por correo electrónico para esta vacante porque el plazo de contratación ha concluido.
                      </p>
                    </div>
                  ) : (
                    /* Caso Plataforma (ATS): Aviso de cierre de postulaciones */
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                        <span className="p-1 bg-slate-400 text-white rounded-md">
                          <Briefcase className="w-3.5 h-3.5" />
                        </span>
                        Convocatoria finalizada
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Esta vacante ha sido cerrada en la plataforma y no admite nuevas postulaciones.
                      </p>
                    </div>
                  )}

                  {/* Botón en gris diciendo 'Vacante no disponible' */}
                  <button
                    type="button"
                    disabled
                    className="w-full bg-slate-200 text-slate-500 font-extrabold py-3.5 px-4 rounded-xl text-sm border border-slate-300 cursor-not-allowed flex items-center justify-center gap-2 select-none shadow-none"
                  >
                    Vacante no disponible
                  </button>
                </div>
              ) : jobData.applyMethod === 'EMAIL' ? (
                /* MÉTODO POR CORREO ELECTRÓNICO (ACTIVO) */
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
                /* MÉTODO POR LA PLATAFORMA (ATS ACTIVO) */
                <>
                  <p className="text-xs text-slate-500 mb-6">
                    Postúlate gratis en menos de 1 minuto. Tu currículum será enviado directamente al equipo de selección.
                  </p>

                  {/* Notificación si ya se postuló */}
                  {hasApplied && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-2xl text-center space-y-2 mb-6">
                      <Check className="w-8 h-8 text-blue-600 mx-auto" />
                      <div className="font-bold text-sm">Ya te has postulado a esta vacante</div>
                      <p className="text-xs text-blue-700">
                        Tu currículum y datos fueron enviados al equipo de reclutamiento de {jobData.company?.name}.
                      </p>
                      <Link
                        href="/dashboard/candidato/postulaciones"
                        className="inline-block mt-2 text-xs font-bold text-blue-900 underline"
                      >
                        Ver estado en Mis Postulaciones →
                      </Link>
                    </div>
                  )}

                  {!hasApplied && (
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

              {/* Botón de Compartir en WhatsApp */}
              <div className="pt-4">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `*Vacante de Empleo en República Dominicana 🇩🇴*\n\n📌 *Puesto:* ${jobData.title}\n🏢 *Empresa:* ${jobData.company?.name}\n📍 *Ubicación:* ${jobData.province}\n💼 *Modalidad:* ${jobData.workplaceType === 'REMOTE' ? 'Remoto' : 'Presencial'}\n\n👉 *Postúlate o mira los detalles aquí:*\nhttps://www.quisqueyatalent.com.do/empleos/${jobData.slug}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  Compartir vacante en WhatsApp
                </a>
              </div>

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
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-700 shrink-0">
                    {jobData.company?.logoUrl ? (
                      <img
                        src={
                          jobData.company.logoUrl.includes('logo-quisqueya-talent.png')
                            ? '/logo-quisqueya-talent.png'
                            : jobData.company.logoUrl
                        }
                        alt={jobData.company.name}
                        className="w-full h-full object-cover"
                        onError={(e: any) => {
                          e.currentTarget.src = '/icono.svg';
                        }}
                      />
                    ) : (
                      <img
                        src="/icono.svg"
                        alt="Quisqueya Talent"
                        className="w-7 h-7 object-contain"
                      />
                    )}
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
      {applyModalOpen && isAvailable && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200">
            {/* Botón Cerrar */}
            <button
              onClick={() => {
                setApplyModalOpen(false);
                setApplyError(null);
                setApplySuccess(false);
              }}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* CASO 1: ÉXITO DE POSTULACIÓN */}
            {applySuccess ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
                  ¡Postulación Enviada con Éxito!
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Tu currículum principal <span className="font-bold text-slate-800">"{candidateResume?.title || 'Mi Currículum'}"</span> y tu carta de presentación han sido entregados al equipo de atracción de talento de{' '}
                  <span className="font-bold text-slate-800">{jobData.company?.name}</span>.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                  <Link
                    href="/dashboard/candidato/postulaciones"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition text-center"
                  >
                    Ver mis postulaciones
                  </Link>
                  <button
                    onClick={() => {
                      setApplyModalOpen(false);
                      setApplySuccess(false);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition"
                  >
                    Cerrar ventana
                  </button>
                </div>
              </div>
            ) : !user ? (
              /* CASO 2: SESIÓN NO INICIADA */
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
                      Inicia Sesión para Postularte
                    </h3>
                    <p className="text-xs text-slate-500">
                      Debes ingresar a tu cuenta de Candidato para enviar tu CV
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-800">
                    Vacante: {jobData.title}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Las empresas en Quisqueya Talent reciben únicamente solicitudes de usuarios registrados con perfil verificado de postulante.
                  </p>
                </div>

                <div className="space-y-2">
                  <Link
                    href={`/auth/login?redirect=/empleos/${slug}`}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-blue-600/20"
                  >
                    <LogIn className="w-4 h-4" />
                    Iniciar Sesión con mi cuenta
                  </Link>
                  <Link
                    href="/auth/register?role=candidato"
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition text-center"
                  >
                    Crear cuenta gratis de Candidato
                  </Link>
                </div>
              </div>
            ) : user.role !== 'JOB_SEEKER' ? (
              /* CASO 3: ROL NO VÁLIDO (EMPRESA O ADMINISTRADOR) */
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
                      Acceso Exclusivo para Candidatos
                    </h3>
                    <p className="text-xs text-slate-500">
                      Solo las cuentas de postulantes pueden aplicar a vacantes
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    Sesión activa como:{' '}
                    {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
                      ? 'Administrador'
                      : 'Empresa / Reclutador'}
                  </div>
                  <p className="leading-relaxed">
                    Actualmente estás autenticado con una cuenta empresarial o administrativa. Para enviar tu currículum a <span className="font-bold">{jobData.company?.name}</span>, debes utilizar una cuenta con rol de <span className="font-bold">Postulante (Candidato)</span>.
                  </p>
                </div>

                <div className="space-y-2 pt-2">

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      router.push(`/auth/login?redirect=/empleos/${slug}`);
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
                  >
                    Cerrar sesión e iniciar como otro usuario
                  </button>
                </div>
              </div>
            ) : checkingResume ? (
              /* CARGANDO ESTADO DE CV */
              <div className="py-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                <div className="text-xs font-semibold text-slate-600">
                  Verificando tu currículum principal en Quisqueya Talent...
                </div>
              </div>
            ) : !candidateResume ? (
              /* CASO 4: CANDIDATO SIN CURRÍCULUM CREADO O GUARDADO */
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
                      Currículum Requerido
                    </h3>
                    <p className="text-xs text-slate-500">
                      Debes tener un CV en tu perfil para postularte
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Para que el equipo de <span className="font-bold">{jobData.company?.name}</span> pueda evaluar tu perfil laboral, necesitas crear o completar tu currículum en tu perfil de postulante.
                  </p>
                  <p className="text-xs text-slate-500">
                    Nuestro asistente con Inteligencia Artificial te ayudará a redactarlo en menos de 2 minutos.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <Link
                    href="/dashboard/candidato/cv"
                    className="w-full bg-[#0051d5] hover:bg-[#0041ab] text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-blue-950/20"
                  >
                    <Sparkles className="w-4 h-4 text-blue-200" />
                    🚀 Crear mi CV con IA ahora en Mi Perfil
                  </Link>

                  <button
                    type="button"
                    onClick={() => setApplyModalOpen(false)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition"
                  >
                    Completar más tarde
                  </button>
                </div>
              </div>
            ) : (
              /* CASO 5: CANDIDATO CON CV PRINCIPAL LISTO PARA ENVIAR */
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans'] mb-1">
                  Postularme a: {jobData.title}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Revisa tu currículum principal adjunto y redacta un mensaje para el reclutador.
                </p>

                {/* Tarjeta de CV Principal que se adjunta */}
                <div className="mb-5 p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-blue-950">
                          {candidateResume.title || 'Mi Currículum Principal'}
                        </span>
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                          ⭐ Principal
                        </span>
                      </div>
                      <div className="text-[11px] text-blue-700 mt-0.5">
                        ATS: {candidateResume.atsScore || 85}% • {candidateResume.experiences?.length || 2} experiencias • {candidateResume.skills?.length || 6} habilidades
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/candidato/cv"
                    className="text-[11px] font-bold text-blue-700 hover:underline shrink-0"
                  >
                    Editar CV
                  </Link>
                </div>

                {/* Carta de Presentación */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 block">
                      Mensaje o Carta de Presentación (Opcional):
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateCoverLetter}
                      disabled={isGeneratingAI}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingAI ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                          Redactando con IA...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          Redactar con IA
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Escribe un mensaje breve destacando por qué eres el candidato idóneo para esta vacante..."
                    className="w-full text-xs p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Mensaje de Error en línea si ocurre */}
                {applyError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{applyError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setApplyModalOpen(false);
                      setApplyError(null);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={isApplying}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
                  >
                    {isApplying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando postulación...
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}

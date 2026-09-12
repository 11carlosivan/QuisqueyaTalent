'use client';

import { API_URL } from '@/lib/api';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar,
  ExternalLink,
  CheckCircle2,
  FileText,
  Download,
  Share2,
  Sparkles,
  ArrowLeft,
  Loader2,
  Building2,
  Copy,
  Check,
  Lock,
  Edit3,
  Eye,
  Languages,
} from 'lucide-react';

const LinkedInIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const GithubIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const WhatsAppIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.18-.553-1.614-.666-2.613-2.327-2.694-2.435-.08-.108-.655-.87-.655-1.659 0-.79.414-1.177.559-1.337.145-.16.319-.2.424-.2.106 0 .213.001.306.006.098.005.23-.037.36.275.145.348.494 1.205.536 1.292.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.276.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086.159.058 1.011.477 1.184.564.173.087.289.129.332.202.043.073.043.423-.101.828z"/>
  </svg>
);

// Función para calcular duración de fechas
function formatPeriod(startStr?: string, endStr?: string, isCurrent?: boolean) {
  if (!startStr) return '';
  const start = new Date(startStr);
  const end = isCurrent || !endStr ? new Date() : new Date(endStr);

  const startFormatted = start.toLocaleDateString('es-DO', { month: 'short', year: 'numeric' });
  const endFormatted = isCurrent ? 'Presente' : end.toLocaleDateString('es-DO', { month: 'short', year: 'numeric' });

  // Calcular diferencia en meses
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (months < 1) months = 1;

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  let durationStr = '';
  if (years > 0) {
    durationStr += `${years} ${years === 1 ? 'año' : 'años'}`;
  }
  if (remainingMonths > 0) {
    if (durationStr) durationStr += ' ';
    durationStr += `${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`;
  }

  return `${startFormatted} - ${endFormatted} · ${durationStr}`;
}

export default function PublicCandidateProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const id = params?.id as string;

  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchCandidate = async () => {
      try {
        setLoading(true);
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`${API_URL}/api/candidates/${id}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setCandidate(data);
        } else {
          setCandidate(null);
        }
      } catch (err) {
        console.error('Error al cargar perfil de candidato:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id, token]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isOwner = candidate?.isOwner || (user && user.id === id);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Consultando expediente profesional del candidato...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <User className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Perfil no disponible</h1>
          <p className="text-sm text-slate-600">
            El perfil de este profesional no está disponible o el enlace ha expirado.
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Regresar
          </button>
        </div>
      </div>
    );
  }

  // Si el perfil está en modo PRIVADO y el visitante no es el dueño
  if (candidate.isPrivate && !isOwner) {
    const pubProfile = candidate.profile;
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-500 shadow-inner">
            <Lock className="w-9 h-9 text-slate-600" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Lock className="w-3.5 h-3.5" /> Perfil Privado
            </span>
            <h1 className="text-2xl font-black text-slate-900">
              {pubProfile?.firstName} {pubProfile?.lastName || ''}
            </h1>
            <p className="text-sm text-slate-600 font-medium">{pubProfile?.headline || 'Talento Dominicano'}</p>
            {pubProfile?.province && (
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {pubProfile.province}, República Dominicana
              </p>
            )}
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-600 leading-relaxed text-left space-y-2">
            <p className="font-semibold text-slate-800">🔒 Información confidencial protegida</p>
            <p>
              Este candidato mantiene su perfil en modo privado. Su historial de experiencias, estudios y datos de contacto
              se comparten exclusivamente con las empresas a cuyas vacantes aplique de forma directa en Quisqueya Talent.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
            >
              Explorar Bolsa de Empleos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { profile, resume, email } = candidate;
  const experiences = resume?.experiences || [];
  const education = resume?.education || [];
  const certifications = resume?.certifications || [];
  const skills = resume?.skills || [];
  const languages = resume?.languages || [];

  const candidateName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Candidato Profesional';
  const candidateUrl = typeof window !== 'undefined' ? window.location.href : `https://quisqueyatalent.com/candidatos/${id}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Mira el perfil profesional de ${candidateName} en Quisqueya Talent 🇩🇴: ${candidateUrl}`
  )}`;

  return (
    <div className="min-h-screen bg-[#f3f4f6] pb-20">
      {/* BANNER FLOTANTE SUPERIOR SI ES EL DUEÑO */}
      {isOwner && (
        <div className="bg-blue-950 text-white text-xs px-4 py-3 border-b border-blue-800 sticky top-0 z-40 shadow-sm">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Vista Pública de tu Perfil:</strong> Así es exactamente como las empresas y reclutadores en República Dominicana ven tu información profesional.
              </span>
            </div>
            <Link
              href="/dashboard/candidato/perfil"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Ir a Editar mi Perfil Privado
            </Link>
          </div>
        </div>
      )}

      {/* Barra de Acciones de Cabecera */}
      <div className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          <div className="flex items-center gap-2.5">
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
              Compartir en WhatsApp
            </a>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition border border-slate-200"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '¡Enlace copiado!' : 'Copiar Perfil'}
            </button>

            {isOwner && (
              <Link
                href="/dashboard/candidato/perfil"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Editar Mi Perfil
              </Link>
            )}

            {email && !isOwner && (
              <a
                href={`mailto:${email}?subject=Oportunidad Laboral vía Quisqueya Talent para ${candidateName}`}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                Contactar Candidato
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* 1. TARJETA PRINCIPAL DE CABECERA (ESTILO LINKEDIN) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
          {/* Portada Ejecutiva */}
          <div
            className="h-44 md:h-56 relative bg-gradient-to-r from-[#001f3f] via-[#003366] to-[#0051d5]"
            style={
              profile?.coverUrl
                ? { backgroundImage: `url(${profile.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : {}
            }
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium flex items-center gap-1.5 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Talento Quisqueya Verificado 🇩🇴
            </div>
          </div>

          <div className="px-6 md:px-8 pb-8 pt-0 relative">
            {/* Avatar Flotante y Acciones Rápidas */}
            <div className="flex flex-col md:flex-row md:items-end justify-between -mt-16 md:-mt-20 mb-4 gap-4">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full ring-4 ring-white shadow-lg bg-white overflow-hidden flex items-center justify-center shrink-0">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={candidateName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center text-3xl font-black">
                    {profile?.firstName?.[0] || 'C'}
                    {profile?.lastName?.[0] || 'T'}
                  </div>
                )}
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-wrap items-center gap-2.5">
                {email && !isOwner && (
                  <a
                    href={`mailto:${email}?subject=Propuesta Laboral en Quisqueya Talent`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
                  >
                    <Mail className="w-4 h-4" />
                    Enviar Oferta / Correo
                  </a>
                )}
                {profile?.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition"
                  >
                    <Phone className="w-4 h-4 text-slate-600" />
                    {profile.phone}
                  </a>
                )}
                {isOwner && (
                  <Link
                    href="/dashboard/candidato/perfil"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    Editar Mi Perfil
                  </Link>
                )}
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition"
                >
                  <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                  Compartir
                </a>
              </div>
            </div>

            {/* Identidad del Candidato */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900">
                  {candidateName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  Perfil Activo
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Buscando empleo activamente (Open to Work)
                </span>
              </div>

              <p className="text-base md:text-lg text-slate-700 font-medium leading-snug">
                {profile?.headline || 'Profesional multidisciplinario en busca de oportunidades'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>
                    {profile?.city ? `${profile.city}, ` : ''}
                    {profile?.province || 'Santo Domingo'}, República Dominicana 🇩🇴
                  </span>
                </div>
                {email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{email}</span>
                  </div>
                )}
              </div>

              {/* Enlaces Sociales / Portafolios */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {profile?.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 transition text-xs font-semibold border border-blue-200"
                  >
                    <LinkedInIcon className="w-3.5 h-3.5 text-blue-700" />
                    LinkedIn
                  </a>
                )}
                {profile?.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition text-xs font-semibold border border-slate-200"
                  >
                    <GithubIcon className="w-3.5 h-3.5 text-slate-700" />
                    GitHub
                  </a>
                )}
                {profile?.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 hover:bg-indigo-100 transition text-xs font-semibold border border-indigo-200"
                  >
                    <Globe className="w-3.5 h-3.5 text-indigo-600" />
                    Portafolio Web
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. ACERCA DE MÍ / EXTRACTO */}
        {(profile?.bio || resume?.summary) && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Acerca de mí
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {profile?.bio || resume?.summary}
            </p>
          </div>
        )}

        {/* 3. CRONOLOGÍA DE EXPERIENCIA LABORAL */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Experiencia Laboral
            </h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {experiences.length} {experiences.length === 1 ? 'experiencia' : 'experiencias'}
            </span>
          </div>

          {experiences.length > 0 ? (
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pl-6">
              {experiences.map((exp: any, idx: number) => (
                <div key={exp.id || idx} className="relative group">
                  {/* Punto temporal */}
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white bg-blue-600 shadow-xs" />

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {exp.position}
                    </h3>
                    <div className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span>{exp.company}</span>
                      {exp.city && <span className="text-xs text-slate-400 font-normal">· {exp.city}</span>}
                    </div>
                    <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatPeriod(exp.startDate, exp.endDate, exp.isCurrent)}</span>
                    </div>

                    {exp.description && (
                      <p className="text-xs text-slate-600 leading-relaxed pt-2 whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl">
              El candidato aún no ha registrado experiencias previas.
            </div>
          )}
        </div>

        {/* 4. EDUCACIÓN Y FORMACIÓN */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              Educación y Formación
            </h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {education.length} {education.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          {education.length > 0 ? (
            <div className="space-y-4">
              {education.map((edu: any, idx: number) => (
                <div key={edu.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    {edu.degree} {edu.fieldOfStudy ? `en ${edu.fieldOfStudy}` : ''}
                  </h3>
                  <div className="text-xs font-semibold text-slate-700">{edu.institution}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatPeriod(edu.startDate, edu.endDate, edu.isCurrent)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl">
              No se han registrado estudios académicos.
            </div>
          )}
        </div>

        {/* 5. HABILIDADES Y COMPETENCIAS */}
        {skills.length > 0 && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Habilidades y Competencias
            </h2>
            <div className="flex flex-wrap gap-2 pt-1">
              {skills.map((skill: any, idx: number) => (
                <span
                  key={skill.id || idx}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition shadow-2xs"
                >
                  {skill.name} {skill.level ? `(${skill.level})` : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 6. CERTIFICACIONES E IDIOMAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certifications.length > 0 && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Certificaciones y Cursos
              </h2>
              <div className="space-y-3">
                {certifications.map((cert: any, idx: number) => (
                  <div key={cert.id || idx} className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1">
                    <h3 className="text-xs font-bold text-slate-900">{cert.name}</h3>
                    <div className="text-[11px] text-slate-600">{cert.issuingOrganization}</div>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline pt-0.5"
                      >
                        Ver Credencial <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {languages.length > 0 && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Languages className="w-5 h-5 text-emerald-600" />
                Idiomas
              </h2>
              <div className="space-y-2.5">
                {languages.map((lang: any, idx: number) => (
                  <div key={lang.id || idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-xs font-bold text-slate-800">{lang.name}</span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      {lang.proficiency || 'Intermedio'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

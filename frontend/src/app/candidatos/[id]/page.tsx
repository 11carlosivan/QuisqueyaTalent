'use client';

import { API_URL } from '@/lib/api';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
  FileCheck,
  Download,
  Share2,
  Sparkles,
  ArrowLeft,
  Loader2,
  Building2,
  Copy,
  Check,
} from 'lucide-react';

const LinkedInIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const GithubIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

export default function PublicCandidateProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchCandidate = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/candidates/${id}`);
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
  }, [id]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
          <h1 className="text-xl font-bold text-slate-900">Perfil no encontrado</h1>
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

  const { profile, resume, email } = candidate;
  const experiences = resume?.experiences || [];
  const education = resume?.education || [];
  const certifications = resume?.certifications || [];
  const skills = resume?.skills || [];
  const languages = resume?.languages || [];

  return (
    <div className="min-h-screen bg-[#f3f4f6] pb-16">
      {/* Barra Superior con Navegación para la Empresa */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la vista previa
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition border border-slate-200"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '¡Enlace copiado!' : 'Compartir Perfil'}
            </button>

            {email && (
              <a
                href={`mailto:${email}?subject=Oportunidad Laboral en Quisqueya Talent`}
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
          {/* Portada Ejecutiva */}
          <div className="h-44 md:h-52 bg-gradient-to-r from-[#001f3f] via-[#003366] to-[#0051d5] relative">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium flex items-center gap-1.5 border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              Expediente Profesional Verificado
            </div>
          </div>

          <div className="px-6 md:px-8 pb-6 pt-0 relative">
            {/* Avatar Flotante */}
            <div className="flex flex-col md:flex-row md:items-end justify-between -mt-16 md:-mt-20 mb-4 gap-4">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full ring-4 ring-white shadow-md bg-white overflow-hidden flex items-center justify-center">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center text-3xl font-black">
                    {profile?.firstName?.[0] || 'C'}
                    {profile?.lastName?.[0] || 'T'}
                  </div>
                )}
              </div>

              {/* Botones de Acción de la Empresa */}
              <div className="flex flex-wrap items-center gap-2.5">
                {email && (
                  <a
                    href={`mailto:${email}?subject=Propuesta Laboral vía Quisqueya Talent`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
                  >
                    <Mail className="w-4 h-4" />
                    Enviar Correo / Oferta
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
              </div>
            </div>

            {/* Identidad del Candidato */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900">
                  {profile?.firstName} {profile?.lastName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Perfil Verificado
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Disponible para contratación
                </span>
              </div>

              <p className="text-base md:text-lg text-slate-700 font-medium">
                {profile?.headline || 'Profesional de Quisqueya Talent'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>
                    {profile?.city ? `${profile.city}, ` : ''}
                    {profile?.province || 'Santo Domingo'}, República Dominicana
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
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition"
                  >
                    <LinkedInIcon className="w-3.5 h-3.5" />
                    Perfil de LinkedIn
                  </a>
                )}
                {profile?.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1.5 rounded-lg transition"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    GitHub
                  </a>
                )}
                {profile?.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Portafolio Web
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. RESUMEN / ACERCA DE */}
        {(profile?.bio || resume?.summary) && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-blue-600" />
              Acerca de este profesional
            </h2>
            <p className="text-slate-700 text-sm md:text-base leading-relaxed whitespace-pre-line">
              {profile?.bio || resume?.summary}
            </p>
          </div>
        )}

        {/* 3. CRONOGRAMA DE EXPERIENCIAS LABORALES */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Cronograma de Trayectoria Laboral
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Historial de puestos y responsabilidades desempeñadas</p>
          </div>

          {experiences.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No ha detallado experiencias laborales en su perfil.</p>
          ) : (
            <div className="relative pl-6 md:pl-8 space-y-8 before:absolute before:left-3 md:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200">
              {experiences.map((exp: any, index: number) => (
                <div key={exp.id || index} className="relative group">
                  <div className="absolute -left-[27px] md:-left-[29px] top-1.5 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white border-2 border-blue-200" />
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="text-base font-bold text-slate-900">{exp.position}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700 font-semibold mt-0.5">
                      <span className="text-blue-700">{exp.company}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500 font-normal">{exp.city || 'Santo Domingo'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {exp.startDate} - {exp.isCurrent ? 'Actualidad' : exp.endDate || 'Presente'}
                      </span>
                      {exp.isCurrent && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Posición actual
                        </span>
                      )}
                    </div>

                    {exp.description && (
                      <p className="text-xs md:text-sm text-slate-600 mt-3 leading-relaxed whitespace-pre-line border-t border-slate-200/60 pt-2">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. EDUCACIÓN & FORMACIÓN */}
        {education.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            <div className="mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Educación y Grados Académicos
              </h2>
            </div>
            <div className="relative pl-6 md:pl-8 space-y-6 before:absolute before:left-3 md:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200">
              {education.map((edu: any, index: number) => (
                <div key={edu.id || index} className="relative">
                  <div className="absolute -left-[27px] md:-left-[29px] top-1.5 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white border-2 border-blue-200" />
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="text-base font-bold text-slate-900">{edu.degree}</h3>
                    <p className="text-sm font-semibold text-blue-700">{edu.institution}</p>
                    {edu.fieldOfStudy && (
                      <p className="text-xs text-slate-600 mt-0.5">Área: {edu.fieldOfStudy}</p>
                    )}
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {edu.startDate} - {edu.isCurrent ? 'En curso' : edu.endDate || 'Completado'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. CURSOS, CERTIFICACIONES & DOCUMENTOS ADJUNTOS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Cursos y Certificaciones Profesionales
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Certificados y títulos avalados disponibles para consulta y descarga
            </p>
          </div>

          {certifications.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No hay certificaciones registradas.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifications.map((cert: any, index: number) => (
                <div
                  key={cert.id || index}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">{cert.name}</h4>
                        <p className="text-xs font-semibold text-blue-700">{cert.issuingOrganization}</p>
                      </div>
                    </div>

                    {cert.issueDate && (
                      <p className="text-[11px] text-slate-500 font-medium pl-10.5">Fecha: {cert.issueDate}</p>
                    )}
                  </div>

                  {/* Acciones para la Empresa: Ver Certificado y Validar */}
                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                    {cert.fileUrl ? (
                      <a
                        href={cert.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition"
                      >
                        <FileCheck className="w-4 h-4 text-blue-600" />
                        Ver Certificado Adjunto
                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Comprobante físico no subido</span>
                    )}

                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Validar en web
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. HABILIDADES */}
        {skills.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Competencias y Habilidades
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((s: any, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200"
                >
                  {typeof s === 'string' ? s : s.name}
                  {s.level && <span className="text-slate-400 font-normal ml-1">({s.level})</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 7. IDIOMAS */}
        {languages.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-blue-600" />
              Idiomas
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {languages.map((lang: any, idx: number) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <p className="text-sm font-bold text-slate-900">{lang.name}</p>
                  <p className="text-xs text-slate-500">{lang.proficiency || 'Intermedio'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

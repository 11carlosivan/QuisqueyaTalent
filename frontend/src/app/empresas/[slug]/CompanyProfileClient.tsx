'use client';

import { API_URL } from '@/lib/api';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  Building2,
  CheckCircle2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Share2,
  Sparkles,
  ExternalLink,
  Edit3,
  Copy,
  Check,
} from 'lucide-react';

const WhatsAppIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.18-.553-1.614-.666-2.613-2.327-2.694-2.435-.08-.108-.655-.87-.655-1.659 0-.79.414-1.177.559-1.337.145-.16.319-.2.424-.2.106 0 .213.001.306.006.098.005.23-.037.36.275.145.348.494 1.205.536 1.292.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.276.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086.159.058 1.011.477 1.184.564.173.087.289.129.332.202.043.073.043.423-.101.828z"/>
  </svg>
);

interface CompanyProfileClientProps {
  initialCompany?: any;
  slug: string;
}

export default function CompanyProfileClient({
  initialCompany,
  slug: propSlug,
}: CompanyProfileClientProps) {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = propSlug || (params?.slug as string);

  const [company, setCompany] = useState<any>(initialCompany || null);
  const [loading, setLoading] = useState(!initialCompany);
  const [filterModality, setFilterModality] = useState<'ALL' | 'ON_SITE' | 'REMOTE' | 'HYBRID'>('ALL');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug || initialCompany) return;
    fetch(`${API_URL}/api/companies/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setCompany(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug, initialCompany]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-slate-500 font-medium text-sm">Cargando perfil corporativo de la empresa...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Empresa no encontrada</h2>
        <p className="text-sm text-slate-500">
          No se encontró ninguna organización registrada con este identificador.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a empleos
        </Link>
      </div>
    );
  }

  const isCompanyOwner = user && (user.company?.id === company.id || user.company?.slug === slug);
  const companyUrl = typeof window !== 'undefined' ? window.location.href : `https://quisqueyatalent.com/empresas/${slug}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Mira las vacantes de empleo disponibles en ${company.name} en Quisqueya Talent 🇩🇴: ${companyUrl}`
  )}`;

  // Filtrado de vacantes por modalidad
  const allJobs = company.jobs || [];
  const filteredJobs = allJobs.filter((job: any) => {
    if (filterModality === 'ALL') return true;
    return job.workplaceType === filterModality;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* AVISO ADMINISTRATIVO PARA EL DUEÑO DE LA EMPRESA */}
      {isCompanyOwner && (
        <div className="bg-slate-900 text-white text-xs px-4 py-3 border-b border-slate-800 sticky top-0 z-40 shadow-sm">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                <strong>Vista Pública Corporativa:</strong> Así es como los candidatos y postulantes ven la página de tu empresa.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/empresa/perfil"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Gestionar Perfil Privado
              </Link>
              <Link
                href="/dashboard/empresa/vacantes/nueva"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition border border-white/20"
              >
                + Publicar Vacante
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Barra de Acciones */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-xs font-bold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a empleos
          </Link>

          <div className="flex items-center gap-2.5">
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
              Compartir en WhatsApp
            </a>

            {isCompanyOwner && (
              <Link
                href="/dashboard/empresa/perfil"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Editar Perfil de Empresa
              </Link>
            )}

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '¡Copiado!' : 'Copiar Enlace'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* TARJETA PRINCIPAL DE CABECERA CORPORATIVA */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Portada Corporativa */}
          <div
            className="h-44 md:h-56 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 relative"
            style={
              company.coverUrl
                ? { backgroundImage: `url(${company.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : {}
            }
          >
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium flex items-center gap-1.5 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              Empleador Destacado en RD 🇩🇴
            </div>
          </div>

          <div className="px-6 md:px-8 pb-8 pt-0 relative">
            {/* Logo Oficial Flotante */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-16 md:-mt-20 mb-4 gap-4">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden flex items-center justify-center shrink-0">
                {company.logoUrl ? (
                  <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                ) : (
                  <img src="/icono.svg" alt="Quisqueya Talent" className="w-16 h-16 object-contain" />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {isCompanyOwner && (
                  <Link
                    href="/dashboard/empresa/perfil"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    Editar Perfil de Empresa
                  </Link>
                )}
                {company.websiteUrl && (
                  <a
                    href={company.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition"
                  >
                    <Globe className="w-4 h-4 text-slate-500" />
                    Sitio Web Oficial
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}
                {company.phone && (
                  <a
                    href={`tel:${company.phone}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition"
                  >
                    <Phone className="w-4 h-4 text-slate-500" />
                    {company.phone}
                  </a>
                )}
              </div>
            </div>

            {/* Identidad de la Empresa */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {company.name}
                </h1>
                {company.isVerified && (
                  <span className="bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-blue-200">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-50" />
                    Empresa Verificada 🇩🇴
                  </span>
                )}
              </div>

              <div className="text-sm font-semibold text-blue-700">
                {company.industry || 'Empresa Empleadora'}
              </div>

              <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {company.address || `${company.province || 'Santo Domingo'}, República Dominicana`}
                </span>
                {company.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {company.email}
                  </span>
                )}
                <span className="flex items-center gap-1.5 font-bold text-slate-700">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  {allJobs.length} {allJobs.length === 1 ? 'vacante publicada' : 'vacantes publicadas'}
                </span>
              </div>
            </div>

            {/* Sección: Sobre la Empresa */}
            <div className="pt-6 mt-6 border-t border-slate-100 space-y-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-500">
                Sobre la Empresa
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-4xl whitespace-pre-line">
                {company.description ||
                  'Empresa comprometida con el desarrollo y la atracción del mejor talento profesional en la República Dominicana.'}
              </p>
            </div>
          </div>
        </div>

        {/* CATÁLOGO DE VACANTES PUBLICADAS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Vacantes Disponibles en {company.name}
              </h2>
              <p className="text-xs text-slate-500">
                Aplica directamente a las ofertas vigentes publicadas por el equipo de selección
              </p>
            </div>

            {/* Filtro rápido por modalidad */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setFilterModality('ALL')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterModality === 'ALL'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todas ({allJobs.length})
              </button>
              <button
                onClick={() => setFilterModality('ON_SITE')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterModality === 'ON_SITE'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Presencial
              </button>
              <button
                onClick={() => setFilterModality('REMOTE')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterModality === 'REMOTE'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Remoto
              </button>
              <button
                onClick={() => setFilterModality('HYBRID')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterModality === 'HYBRID'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Híbrido
              </button>
            </div>
          </div>

          {filteredJobs.length > 0 ? (
            <div className="space-y-3.5">
              {filteredJobs.map((job: any) => {
                const modalityLabel =
                  job.workplaceType === 'REMOTE'
                    ? 'Remoto'
                    : job.workplaceType === 'HYBRID'
                    ? 'Híbrido'
                    : 'Presencial';

                return (
                  <div
                    key={job.id}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1.5">
                      <Link
                        href={`/empleos/${job.slug}`}
                        className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition"
                      >
                        {job.title}
                      </Link>

                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.province || 'Distrito Nacional'}
                        </span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                          {modalityLabel}
                        </span>
                        <span>•</span>
                        <span className="text-slate-600">
                          {job.jobType === 'FULL_TIME' ? 'Tiempo Completo' : 'Medio Tiempo'}
                        </span>
                        {job.isSalaryPublic && job.salaryMin && (
                          <>
                            <span>•</span>
                            <span className="text-slate-900 font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                              {job.salaryCurrency || 'DOP'} {Number(job.salaryMin).toLocaleString()}{' '}
                              {job.salaryMax ? `- ${Number(job.salaryMax).toLocaleString()}` : ''}
                            </span>
                          </>
                        )}
                      </div>

                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {job.skills.slice(0, 4).map((s: any) => (
                            <span
                              key={s.id || s.skillName}
                              className="text-[11px] font-medium bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200"
                            >
                              {s.skillName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/empleos/${job.slug}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shrink-0 self-end sm:self-auto shadow-sm"
                    >
                      Postularme <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              {filterModality === 'ALL'
                ? 'Actualmente no hay vacantes abiertas publicadas por esta empresa.'
                : 'No hay vacantes publicadas que coincidan con la modalidad seleccionada.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { API_URL } from '@/lib/api';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
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
} from 'lucide-react';

export default function CompanyProfilePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API_URL}/api/companies/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setCompany(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">Cargando perfil corporativo...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Empresa no encontrada</h2>
        <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold">
          Volver a la portada
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Link
          href="/"
          className="text-xs font-bold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a empleos
        </Link>

        {/* Encabezado Perfil */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-2xl text-slate-700 shrink-0">
                {company.logoUrl ? (
                  <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                ) : (
                  <img src="/icono.svg" alt="Quisqueya Talent" className="w-12 h-12 object-contain" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#001428] font-['Plus_Jakarta_Sans']">
                    {company.name}
                  </h1>
                  {company.isVerified && (
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-blue-200/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 fill-blue-50" />
                      Verificada
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-1">{company.industry}</div>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {company.address || company.province}, RD
                  </span>
                  {company.websiteUrl && (
                    <a
                      href={company.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" /> Sitio Web Oficial
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Acerca de la Empresa</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              {company.description || 'Empresa comprometida con el desarrollo del talento en República Dominicana.'}
            </p>
          </div>
        </div>

        {/* Vacantes Abiertas de la Empresa */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#001428] font-['Plus_Jakarta_Sans']">
                Vacantes Abiertas en {company.name}
              </h2>
              <p className="text-xs text-slate-500">
                Oportunidades de empleo vigentes en las que puedes postularte hoy mismo
              </p>
            </div>
            <span className="bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
              {company.jobs?.length || 0} Vacantes
            </span>
          </div>

          {company.jobs && company.jobs.length > 0 ? (
            <div className="space-y-4">
              {company.jobs.map((job: any) => (
                <div
                  key={job.id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-blue-300 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <Link
                      href={`/empleos/${job.slug}`}
                      className="font-bold text-base text-slate-900 hover:text-blue-600 transition"
                    >
                      {job.title}
                    </Link>
                    <div className="text-xs text-slate-500 flex flex-wrap gap-2">
                      <span>📍 {job.province}</span>
                      <span>•</span>
                      <span>💼 {job.jobType === 'FULL_TIME' ? 'Tiempo Completo' : 'Medio Tiempo'}</span>
                      {job.salaryMin && (
                        <>
                          <span>•</span>
                          <span className="text-slate-900 font-bold">
                            RD$ {Number(job.salaryMin).toLocaleString()} - RD$ {Number(job.salaryMax).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/empleos/${job.slug}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer self-end sm:self-auto"
                  >
                    Ver Vacante <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs italic">
              Actualmente no hay vacantes abiertas publicadas por esta empresa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

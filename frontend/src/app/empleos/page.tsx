'use client';

import { API_URL } from '@/lib/api';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AdSlot from '../../components/AdSlot';
import JobAlertBanner from '../../components/JobAlertBanner';
import {
  Search,
  MapPin,
  Briefcase,
  Sparkles,
  Building2,
  CheckCircle2,
  ArrowRight,
  Clock,
  Filter,
  Loader2,
  RotateCcw,
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  slug: string;
  category: string;
  province: string;
  city?: string;
  workplaceType: string;
  jobType: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  featured: boolean;
  urgent: boolean;
  publishedAt: string;
  company: {
    name: string;
    logoUrl?: string;
    isVerified: boolean;
  };
  skills: { skillName: string }[];
}

function EmpleosContent() {
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedProvince, setSelectedProvince] = useState(searchParams.get('province') || 'all');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedWorkplace, setSelectedWorkplace] = useState(searchParams.get('workplaceType') || 'all');

  const provincesRD = [
    'Distrito Nacional',
    'Santo Domingo',
    'Santiago',
    'La Altagracia (Punta Cana)',
    'San Cristóbal',
    'La Romana',
    'Puerto Plata',
    'La Vega',
    'Duarte (San Fco. de Macorís)',
  ];

  const categories = [
    'Tecnología e Informática',
    'Call Center y BPO',
    'Ventas y Comercio B2B',
    'Banca y Finanzas',
    'Turismo y Hotelería',
    'Zonas Francas & Logística',
  ];

  useEffect(() => {
    const paramCategory = searchParams.get('category');
    const paramProvince = searchParams.get('province');
    const paramWorkplace = searchParams.get('workplaceType');
    const paramQ = searchParams.get('q');

    if (paramCategory) setSelectedCategory(paramCategory);
    if (paramProvince) setSelectedProvince(paramProvince);
    if (paramWorkplace) setSelectedWorkplace(paramWorkplace);
    if (paramQ) setSearchQuery(paramQ);
  }, [searchParams]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (selectedProvince !== 'all') params.set('province', selectedProvince);
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedWorkplace !== 'all') params.set('workplaceType', selectedWorkplace);

      const res = await fetch(`${API_URL}/api/jobs?${params.toString()}`);
      const data = await res.json();
      if (data && data.data) {
        setJobs(data.data);
      }
    } catch (e) {
      console.error('Error cargando vacantes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedProvince, selectedCategory, selectedWorkplace]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedProvince('all');
    setSelectedCategory('all');
    setSelectedWorkplace('all');
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header con Buscador */}
        <div className="bg-gradient-to-r from-[#001428] via-[#0F2942] to-[#0A192F] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              Directorio de Empleos Oficial en República Dominicana
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight">
              Bolsa de Empleos y Oportunidades Laborales
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm">
              Encuentra vacantes activas y verificadas en Santo Domingo, Santiago, Punta Cana y todo el país.
            </p>
          </div>

          {/* Formulario de filtros */}
          <div className="mt-6 bg-white p-3 rounded-2xl shadow-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-slate-800 relative z-10">
            {/* Input Buscar */}
            <div className="flex items-center px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Puesto o habilidad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs focus:outline-none placeholder-slate-400 font-medium"
              />
            </div>

            {/* Categoría */}
            <div className="flex items-center px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
              <Briefcase className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-transparent text-xs focus:outline-none text-slate-700 font-medium cursor-pointer"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Provincia */}
            <div className="flex items-center px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
              <MapPin className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full bg-transparent text-xs focus:outline-none text-slate-700 font-medium cursor-pointer"
              >
                <option value="all">📍 Todo el país</option>
                {provincesRD.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Modalidad */}
            <div className="flex items-center px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
              <Filter className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <select
                value={selectedWorkplace}
                onChange={(e) => setSelectedWorkplace(e.target.value)}
                className="w-full bg-transparent text-xs focus:outline-none text-slate-700 font-medium cursor-pointer"
              >
                <option value="all">Cualquier modalidad</option>
                <option value="REMOTE">100% Remoto</option>
                <option value="HYBRID">Híbrido</option>
                <option value="ON_SITE">Presencial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Barra de estado y restablecer */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Mostrando <span className="font-bold text-slate-900">{jobs.length}</span> empleos disponibles
          </div>

          {(searchQuery || selectedCategory !== 'all' || selectedProvince !== 'all' || selectedWorkplace !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Limpiar filtros
            </button>
          )}
        </div>

        {/* AdSlot en catálogo */}
        <AdSlot slotCode="JOBS_CATALOG" name="Banner Directorio de Empleos" />

        {/* Lista de Empleos */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Buscando vacantes coincidentes...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-dashed border-slate-300">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No hay vacantes con estos criterios</h3>
            <p className="text-xs text-slate-500 mb-4">
              Prueba cambiando la provincia, categoría o restableciendo los filtros de búsqueda.
            </p>
            <button
              onClick={handleResetFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Ver todas las vacantes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-700 shrink-0">
                        {job.company.logoUrl ? (
                          <img
                            src={job.company.logoUrl}
                            alt={job.company.name}
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
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-700">{job.company.name}</span>
                          {job.company.isVerified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {job.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {job.urgent && (
                        <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Urgente
                        </span>
                      )}
                      {job.featured && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Destacado
                        </span>
                      )}
                    </div>
                  </div>

                  <Link href={`/empleos/${job.slug}`}>
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition line-clamp-2 leading-snug mb-3">
                      {job.title}
                    </h3>
                  </Link>

                  <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.province}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-semibold">
                      {job.workplaceType === 'REMOTE'
                        ? 'Remoto'
                        : job.workplaceType === 'HYBRID'
                        ? 'Híbrido'
                        : 'Presencial'}
                    </span>
                  </div>

                  {job.salaryMin && job.salaryMax && (
                    <div className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl mb-4 inline-flex items-center gap-1.5">
                      <span>💰</span>
                      <span>
                        RD$ {Number(job.salaryMin).toLocaleString()} - RD${' '}
                        {Number(job.salaryMax).toLocaleString()} / mes
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {job.skills.slice(0, 3).map((s) => (
                      <span
                        key={s.skillName}
                        className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                      >
                        {s.skillName}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="text-[11px] font-medium text-slate-400 py-0.5">
                        +{job.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Publicado recientemente
                  </span>
                  <Link
                    href={`/empleos/${job.slug}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    Postularme <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Captador de Alertas de Empleo */}
        <JobAlertBanner />
      </div>
    </div>
  );
}

export default function EmpleosPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-24 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Cargando directorio de empleos...</p>
        </div>
      }
    >
      <EmpleosContent />
    </Suspense>
  );
}

'use client';

import { API_URL } from '@/lib/api';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import AdSlot from '../components/AdSlot';
import {
  Search,
  MapPin,
  Briefcase,
  Sparkles,
  Building2,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  Clock,
  Filter,
  Users,
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

function HomePageContent() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedProvince, setSelectedProvince] = useState(searchParams.get('province') || 'all');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const resultsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const pCat = searchParams.get('category');
    const pProv = searchParams.get('province');
    const pQ = searchParams.get('q');
    if (pCat) setSelectedCategory(pCat);
    if (pProv) setSelectedProvince(pProv);
    if (pQ) setSearchQuery(pQ);
  }, [searchParams]);

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
    { name: 'Tecnología e Informática', icon: '💻', count: '142 vacantes' },
    { name: 'Call Center y BPO', icon: '🎧', count: '98 vacantes' },
    { name: 'Ventas y Comercio B2B', icon: '📈', count: '115 vacantes' },
    { name: 'Banca y Finanzas', icon: '🏦', count: '64 vacantes' },
    { name: 'Turismo y Hotelería', icon: '🌴', count: '89 vacantes' },
    { name: 'Zonas Francas & Logística', icon: '🏭', count: '76 vacantes' },
  ];

  const fetchJobs = useCallback(async (triggerScroll = false) => {
    setLoading(true);
    if (triggerScroll) setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (selectedProvince !== 'all') params.set('province', selectedProvince);
      if (selectedCategory !== 'all') params.set('category', selectedCategory);

      const res = await fetch(`${API_URL}/api/jobs?${params.toString()}`);
      const data = await res.json();
      if (data && data.data) {
        setJobs(data.data);
      }
    } catch (e) {
      console.error('Error cargando vacantes:', e);
    } finally {
      setLoading(false);
      if (triggerScroll) {
        setIsSearching(false);
        setHasSearched(true);
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedProvince, selectedCategory]);

  useEffect(() => {
    fetchJobs(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedProvince, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(true);
  };

  return (
    <div className="min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0F2942] via-[#001428] to-[#0B1C30] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-sky-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-semibold backdrop-blur-sm animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            La bolsa de empleo gratuita con IA #1 en República Dominicana 🇩🇴
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans'] leading-tight">
            Conectamos el mejor talento con las <br className="hidden sm:inline" />
            <span className="text-sky-300">
              mejores oportunidades de RD
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Postúlate sin costo a cientos de vacantes verificadas, crea tu currículum optimizado para filtros ATS y recibe ofertas laborales directamente.
          </p>

          {/* SEARCH BOX HERO */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-4xl mx-auto bg-white p-2.5 rounded-2xl shadow-2xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-12 gap-2 text-slate-800"
          >
            {/* Input Keyword */}
            <div className="md:col-span-5 flex items-center px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200/60 focus-within:border-blue-500 transition">
              <Search className="w-5 h-5 text-slate-400 mr-2.5 shrink-0" />
              <input
                type="text"
                placeholder="Puesto, habilidades o empresa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none placeholder-slate-400 font-medium"
              />
            </div>

            {/* Select Provincia */}
            <div className="md:col-span-4 flex items-center px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200/60 focus-within:border-blue-500 transition">
              <MapPin className="w-5 h-5 text-slate-400 mr-2.5 shrink-0" />
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none text-slate-700 font-medium cursor-pointer"
              >
                <option value="all">📍 Toda República Dominicana</option>
                {provincesRD.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={isSearching}
                className="w-full h-full min-h-[46px] bg-[#0051d5] hover:bg-[#0041ab] disabled:bg-[#0041ab] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-wait"
              >
                {isSearching ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Buscar Empleo
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-300">
            <span className="font-semibold text-slate-400">Tendencias en RD:</span>
            {['Call Center Bilingüe', 'Desarrollador React', 'Ventas B2B', 'Ciberseguridad', 'Remoto'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1 rounded-full transition cursor-pointer text-slate-200"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. ADSLOT SUPERIOR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <AdSlot slotCode="HOME_TOP" name="Banner Superior Home" />
      </div>

      {/* 3. CATEGORÍAS POPULARES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold text-[#0051d5] uppercase tracking-wider mb-1">
              Sectores Laborales
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#001428] font-['Plus_Jakarta_Sans']">
              Explora empleos por categoría en RD
            </h2>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedProvince('all');
              setSearchQuery('');
            }}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            Ver todas las categorías <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat.name)}
                className={`p-4 rounded-2xl border text-left transition-all group cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="text-2xl mb-2.5 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 line-clamp-1">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">{cat.count}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. VACANTES DESTACADAS */}
      <section ref={resultsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-mt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full mb-2">
              <Zap className="w-3 h-3 text-blue-600" /> Vacantes Verificadas
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#001428] font-['Plus_Jakarta_Sans']">
              Oportunidades laborales activas
            </h2>
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Mostrando <span className="font-bold text-slate-900">{jobs.length}</span> empleos disponibles
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No se encontraron vacantes</h3>
            <p className="text-sm text-slate-500 mb-6">
              Intenta buscar con otros términos o cambiar la provincia seleccionada.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedProvince('all');
                setSelectedCategory('all');
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${hasSearched ? 'animate-fade-in' : ''}`}>
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group"
              >
                <div>
                  {/* Company Header & Badges */}
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

                  {/* Title */}
                  <Link href={`/empleos/${job.slug}`}>
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition line-clamp-2 leading-snug mb-3">
                      {job.title}
                    </h3>
                  </Link>

                  {/* Location & Modality */}
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

                  {/* Salary Badge */}
                  {job.salaryMin && job.salaryMax && (
                    <div className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl mb-4 inline-flex items-center gap-1.5">
                      <span>💰</span>
                      <span>
                        RD$ {Number(job.salaryMin).toLocaleString()} - RD${' '}
                        {Number(job.salaryMax).toLocaleString()} / mes
                      </span>
                    </div>
                  )}

                  {/* Skills Tags */}
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

                {/* Footer Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Hace pocos días
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
      </section>

      {/* 5. CREADOR DE CV BANNER (HERRAMIENTA CLAVE DE QUISQUEYA TALENT) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-[#0F2942] to-[#001428] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden border border-sky-950/40 shadow-2xl">
          {/* Background decoration */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/20 blur-3xl rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" /> 100% Gratuito para siempre
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans'] leading-tight">
                Crea un currículum profesional <br />
                <span className="text-sky-300">optimizado para filtros ATS con IA</span>
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                Nuestro asistente inteligente audita tu CV en tiempo real, redacta logros de alto impacto, sugiere palabras clave del mercado dominicano y te permite descargarlo en PDF listo para enviar a reclutadores.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/10">
                  <div className="text-2xl font-black text-sky-300">94%</div>
                  <div className="text-xs text-slate-300 font-medium">Mayor tasa de entrevistas</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/10">
                  <div className="text-2xl font-black text-sky-400">0 RD$</div>
                  <div className="text-xs text-slate-300 font-medium">Sin cobros ni suscripciones</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
                  <div className="text-2xl font-black text-blue-300">PDF ATS</div>
                  <div className="text-xs text-slate-300 font-medium">Formato estándar de reclutamiento</div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  href="/dashboard/candidato/cv"
                  className="bg-[#0051d5] hover:bg-[#0041ab] text-white font-extrabold px-6 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-950/40 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  Crear Mi Currículum con IA Gratis
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-white/15 hover:bg-white/25 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition"
                >
                  Registrarme como Candidato
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm">
                <div className="bg-white rounded-2xl p-4 shadow-2xl text-slate-900 border border-slate-100 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                        CR
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Carlos Rosario</div>
                        <div className="text-[10px] text-slate-500">Software Engineer • RD</div>
                      </div>
                    </div>
                    <div className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                      Puntuación ATS: 94/100
                    </div>
                  </div>
                  <div className="space-y-2.5 pt-3 text-[11px] text-slate-600">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <div className="font-bold text-slate-800">Experiencia Laboral</div>
                      <div className="text-[10px] text-slate-500">Tech Caribe Solutions • 2022 - Presente</div>
                      <div className="text-[10px] text-blue-700 font-medium mt-0.5">
                        ✓ Verbos de acción cuantificados por IA
                      </div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <div className="font-bold text-slate-800">Educación</div>
                      <div className="text-[10px] text-slate-500">INTEC • Ingeniería de Software</div>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[9px] font-semibold">
                        TypeScript
                      </span>
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[9px] font-semibold">
                        React
                      </span>
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[9px] font-semibold">
                        Node.js
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ADSLOT INFERIOR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <AdSlot slotCode="HOME_BOTTOM" name="Banner Inferior Home" />
      </div>

      {/* 7. STATS & CONFIANZA */}
      <section className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-[#001428] font-['Plus_Jakarta_Sans']">
                +4,500
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500">
                Candidatos Dominicanos
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-[#0051d5] font-['Plus_Jakarta_Sans']">
                100%
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500">
                Gratuito para Todos
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-blue-600 font-['Plus_Jakarta_Sans']">
                32
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500">
                Provincias de Cobertura
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-amber-500 font-['Plus_Jakarta_Sans']">
                +350
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-500">
                Empresas Contratando
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-24 text-center bg-slate-900 text-white flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-slate-400 font-medium">Cargando Quisqueya Talent...</p>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}

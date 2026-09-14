'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import {
  Search,
  MapPin,
  Briefcase,
  Users,
  Sparkles,
  ArrowRight,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Award,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';

const PROVINCES_RD = [
  'Todas las provincias',
  'Distrito Nacional',
  'Santo Domingo',
  'Santiago',
  'La Altagracia (Punta Cana / Bávaro)',
  'San Cristóbal',
  'La Romana',
  'Puerto Plata',
  'Duarte (San Francisco de Macorís)',
  'La Vega',
];

const POPULAR_SKILLS = [
  'React',
  'Python',
  'JavaScript',
  'Servicio al Cliente',
  'Ventas',
  'Contabilidad',
  'Excel Avanzado',
  'Inglés B2/C1',
  'Diseño UI/UX',
  'Marketing Digital',
];

interface CandidateItem {
  id: string;
  name: string;
  headline: string;
  bio?: string | null;
  province: string;
  city?: string | null;
  avatarUrl?: string | null;
  skills: { name: string; level: string }[];
  memberSince: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function CandidatesDirectoryPage() {
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('Todas las provincias');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set('q', searchTerm.trim());
      if (selectedProvince && selectedProvince !== 'Todas las provincias') {
        params.set('province', selectedProvince);
      }
      if (selectedSkill.trim()) params.set('skill', selectedSkill.trim());
      params.set('page', page.toString());
      params.set('limit', '12');

      const res = await fetch(`${API_URL}/api/candidates?${params.toString()}`);
      if (!res.ok) throw new Error('Error al cargar candidatos');
      const data = await res.json();
      setCandidates(data.candidates || []);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      console.error(err);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedProvince, selectedSkill, page]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCandidates();
  };

  const handleSelectSkill = (skill: string) => {
    if (selectedSkill === skill) {
      setSelectedSkill('');
    } else {
      setSelectedSkill(skill);
      setPage(1);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedProvince('Todas las provincias');
    setSelectedSkill('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#001428] via-[#0F2942] to-[#001428] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-xs font-bold px-3.5 py-1.5 rounded-full border border-blue-400/30 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Talent Pool Dominicano • República Dominicana
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-['Plus_Jakarta_Sans'] tracking-tight text-white">
            Directorio de Talento Calificado
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Conecta con los mejores profesionales, técnicos y especialistas dominicanos. Explora sus habilidades, currículums y contáctalos directamente para tus vacantes.
          </p>

          {/* Formulario de Búsqueda */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 bg-white p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl mx-auto flex flex-col md:flex-row gap-2 border border-white/20 text-slate-900"
          >
            <div className="flex-1 flex items-center gap-2.5 px-3 py-2 bg-slate-50 md:bg-transparent rounded-xl">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre, profesión, cargo o tecnología (ej. Desarrollador, Ventas)..."
                className="w-full bg-transparent text-sm focus:outline-none placeholder:text-slate-400 font-medium"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="h-px md:h-auto md:w-px bg-slate-200" />

            <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 md:bg-transparent rounded-xl md:w-64">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
              <select
                value={selectedProvince}
                onChange={(e) => {
                  setSelectedProvince(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-transparent text-sm focus:outline-none text-slate-700 font-medium cursor-pointer"
              >
                {PROVINCES_RD.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm px-7 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 cursor-pointer shrink-0"
            >
              <Search className="w-4 h-4" />
              Buscar Talento
            </button>
          </form>

          {/* Habilidades Rápidas */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-4 text-xs">
            <span className="text-slate-400 font-semibold mr-1">Filtro rápido:</span>
            {POPULAR_SKILLS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => handleSelectSkill(skill)}
                className={`px-3 py-1 rounded-full font-medium transition cursor-pointer ${
                  selectedSkill === skill
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
                }`}
              >
                {skill}
              </button>
            ))}
            {selectedSkill && (
              <button
                type="button"
                onClick={() => setSelectedSkill('')}
                className="text-xs text-rose-300 hover:text-rose-200 underline ml-2 cursor-pointer"
              >
                Limpiar habilidad
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Barra superior de resultados */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div>
            <h2 className="text-xl font-black text-[#001428] font-['Plus_Jakarta_Sans'] flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Candidatos Registrados
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {pagination.total > 0
                ? `Mostrando ${candidates.length} de ${pagination.total} profesionales disponibles`
                : 'Directorio de talentos en República Dominicana'}
            </p>
          </div>

          {(searchTerm || selectedProvince !== 'Todas las provincias' || selectedSkill) && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Restablecer filtros
            </button>
          )}
        </div>

        {/* Listado o Estados */}
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-slate-500 font-medium text-sm">Cargando directorio de profesionales...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 mt-8 max-w-lg mx-auto shadow-xs">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">
              No se encontraron candidatos
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              No hay candidatos públicos que coincidan con los criterios seleccionados. Prueba buscando con otros términos o removiendo los filtros.
            </p>
            <button
              onClick={handleResetFilters}
              className="bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-700 transition cursor-pointer"
            >
              Ver todos los candidatos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {candidates.map((candidate) => {
              const initials = candidate.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'QT';

              return (
                <div
                  key={candidate.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-blue-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header Card */}
                    <div className="flex items-start gap-3.5 mb-4">
                      {candidate.avatarUrl ? (
                        <img
                          src={candidate.avatarUrl}
                          alt={candidate.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0">
                          {initials}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-extrabold text-slate-900 truncate group-hover:text-blue-600 transition">
                            {candidate.name}
                          </h3>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        </div>
                        <p className="text-xs font-semibold text-slate-600 line-clamp-1 mt-0.5">
                          {candidate.headline}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {candidate.city ? `${candidate.city}, ` : ''}
                            {candidate.province}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bio extracto */}
                    {candidate.bio && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                        {candidate.bio}
                      </p>
                    )}

                    {/* Habilidades destacadas */}
                    <div className="space-y-1.5 mb-6">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Habilidades destacadas:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.skills.length > 0 ? (
                          candidate.skills.slice(0, 5).map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                            >
                              {skill.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Perfil en actualización
                          </span>
                        )}
                        {candidate.skills.length > 5 && (
                          <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                            +{candidate.skills.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botón ver perfil */}
                  <Link
                    href={`/candidatos/${candidate.id}`}
                    className="w-full bg-slate-50 group-hover:bg-blue-600 text-slate-700 group-hover:text-white font-extrabold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-200/80 group-hover:border-blue-600 shadow-xs cursor-pointer"
                  >
                    Ver Perfil Profesional
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-600 px-2">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

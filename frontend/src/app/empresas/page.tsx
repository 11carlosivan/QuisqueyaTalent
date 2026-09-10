'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, CheckCircle2, MapPin, ArrowRight, Briefcase, Loader2 } from 'lucide-react';

export default function CompaniesDirectoryPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/companies')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCompanies(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-[#001428] font-['Plus_Jakarta_Sans']">
            Empresas Contratando en República Dominicana
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Descubre las organizaciones líderes que confían en Quisqueya Talent para atraer el mejor talento del país.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-slate-500 text-xs">Cargando directorio de empresas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-lg text-slate-700 shrink-0">
                      {c.logoUrl ? (
                        <img src={c.logoUrl} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        c.name.slice(0, 2)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition">
                          {c.name}
                        </h3>
                        {c.isVerified && (
                          <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-50" />
                        )}
                      </div>
                      <span className="text-xs text-slate-500">{c.industry}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {c.description || 'Empresa verificada en Quisqueya Talent.'}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.province || 'República Dominicana'}</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {c._count?.jobs || 0} Vacantes activas
                  </span>
                  <Link
                    href={`/empresas/${c.slug}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    Ver Perfil <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

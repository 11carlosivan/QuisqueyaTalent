'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../../../lib/auth-context';
import Logo from '../../../../../../components/Logo';
import {
  Sparkles,
  Share2,
  Copy,
  Check,
  Download,
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Loader2,
} from 'lucide-react';


export default function SocialMediaAIPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const jobId = params.id as string;

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'linkedin' | 'instagram' | 'twitter'>('linkedin');
  const [copied, setCopied] = useState(false);

  const [socialTexts, setSocialTexts] = useState({
    linkedin: '',
    instagram: '',
    twitter: '',
    hashtags: [] as string[],
  });

  useEffect(() => {
    if (!jobId) return;

    // Buscar empleos de la empresa
    fetch('http://localhost:5000/api/jobs/company/mine', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((jobs) => {
        if (Array.isArray(jobs)) {
          const found = jobs.find((j) => j.id === jobId);
          if (found) {
            setJob(found);
            generateSocialCopy(found);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [jobId, token]);

  const generateSocialCopy = async (jobItem: any) => {
    setGenerating(true);
    try {
      const res = await fetch('http://localhost:5000/api/ai/generate-social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: jobItem.title,
          company: user?.company?.name || 'Altice Dominicana',
          province: jobItem.province,
          salary: jobItem.salaryMin ? `RD$ ${Number(jobItem.salaryMin).toLocaleString()} - RD$ ${Number(jobItem.salaryMax).toLocaleString()} / mes` : undefined,
          type: jobItem.jobType,
        }),
      });

      const data = await res.json();
      if (data && data.linkedin) {
        setSocialTexts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">Cargando asistente de redes sociales...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <Link
            href={`/dashboard/empresa/vacantes/${jobId}/ats`}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 mb-2 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al ATS de la vacante
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001428] font-['Plus_Jakarta_Sans']">
              Generador de Creativos & Redes Sociales con IA
            </h1>
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
              Social Media AI
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Vacante: <span className="font-bold text-slate-800">{job?.title}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* COLUMNA IZQUIERDA: COPY GENERADO (6 COLS) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    onClick={() => setActivePlatform('linkedin')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activePlatform === 'linkedin'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-600" /> LinkedIn
                  </button>
                  <button
                    onClick={() => setActivePlatform('instagram')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activePlatform === 'instagram'
                        ? 'bg-white text-pink-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-pink-500" /> Instagram
                  </button>
                  <button
                    onClick={() => setActivePlatform('twitter')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activePlatform === 'twitter'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-slate-900" /> X / Twitter
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => generateSocialCopy(job)}
                  disabled={generating}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {generating ? 'Regenerando...' : 'Regenerar'}
                </button>
              </div>

              {/* Texto del Copy */}
              <div className="relative">
                <textarea
                  rows={10}
                  readOnly
                  value={socialTexts[activePlatform]}
                  className="w-full text-xs p-4 bg-slate-50 border border-slate-200 rounded-2xl leading-relaxed text-slate-800 font-mono resize-none focus:outline-none"
                />

                <button
                  onClick={() => handleCopy(socialTexts[activePlatform])}
                  className="absolute right-3 top-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar Texto
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-purple-50/70 border border-purple-200/70 rounded-2xl text-xs text-purple-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" /> Consejos de Difusión en RD
                </div>
                <p className="text-purple-800 leading-normal">
                  Publicar los martes y jueves entre 11:00 AM y 2:00 PM maximiza el alcance en LinkedIn e Instagram en República Dominicana.
                </p>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: PREVIEW DEL CREATIVO GRÁFICO (6 COLS) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Arte Gráfico Automatizado (1080 × 1080)
                </h3>
                <button
                  onClick={() => alert('¡Arte gráfico descargado listo para Instagram!')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar Imagen
                </button>
              </div>

              {/* CREATIVO VISUAL SQUARE 1:1 */}
              <div
                id="social-creative"
                className="aspect-square w-full max-w-[420px] mx-auto rounded-3xl p-8 bg-gradient-to-br from-[#001428] via-[#0F2942] to-[#002E1D] text-white flex flex-col justify-between relative overflow-hidden shadow-2xl border border-sky-950"
              >
                {/* Glow decorativo */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-500/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl" />

                {/* Top Header */}
                <div className="flex items-center justify-between relative z-10">
                  <Logo isLight={true} />
                  <span className="bg-emerald-400/20 text-emerald-300 font-extrabold text-[10px] px-2.5 py-1 rounded-full border border-emerald-400/30 uppercase tracking-wider">
                    ¡Estamos Contratando!
                  </span>
                </div>

                {/* Centro: Título y Empresa */}
                <div className="space-y-3 relative z-10 my-auto">
                  <div className="text-xs font-bold uppercase tracking-widest text-sky-300">
                    {user?.company?.name || 'Empresa Líder'}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black font-['Plus_Jakarta_Sans'] leading-tight tracking-tight text-white">
                    {job?.title}
                  </h2>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="bg-white/10 text-slate-200 text-xs font-bold px-3 py-1 rounded-lg">
                      📍 {job?.province || 'Santo Domingo'}, RD
                    </span>
                    <span className="bg-blue-500/20 text-sky-200 text-xs font-bold px-3 py-1 rounded-lg border border-sky-400/30">
                      {job?.workplaceType === 'REMOTE' ? 'Remoto' : 'Híbrido / Presencial'}
                    </span>
                  </div>

                  {job?.salaryMin && (
                    <div className="pt-2 text-emerald-400 font-extrabold text-sm sm:text-base">
                      💰 Salario: RD$ {Number(job.salaryMin).toLocaleString()} - RD${' '}
                      {Number(job.salaryMax).toLocaleString()} / mes
                    </div>
                  )}
                </div>

                {/* Footer del creativo */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] relative z-10 text-slate-300">
                  <span>Aplica gratis sin intermediarios</span>
                  <span className="font-extrabold text-white">quisqueyatalent.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

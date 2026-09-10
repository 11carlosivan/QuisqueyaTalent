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
  Briefcase,
  CheckCircle2,
} from 'lucide-react';

export default function SocialMediaAIPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const jobId = params.id as string;

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'linkedin' | 'instagram' | 'twitter'>('linkedin');
  const [flyerTheme, setFlyerTheme] = useState<'corporate' | 'executive' | 'warm'>('corporate');
  const [copied, setCopied] = useState(false);

  const [socialTexts, setSocialTexts] = useState({
    linkedin: '',
    instagram: '',
    twitter: '',
    hashtags: [] as string[],
  });

  const handleDownloadCreative = async () => {
    const el = document.getElementById('social-creative');
    if (!el) return;
    setDownloadingImage(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const bgColors = {
        corporate: '#ffffff',
        executive: '#0A192F',
        warm: '#FAF7F2',
      };
      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        backgroundColor: bgColors[flyerTheme],
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Flyer_${job?.slug || 'vacante'}_${flyerTheme}_QuisqueyaTalent.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Error generando flyer:', e);
      alert('Hubo un error al exportar la imagen.');
    } finally {
      setDownloadingImage(false);
    }
  };

  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      try {
        const storedToken = token || localStorage.getItem('qt_token');
        if (storedToken) {
          const res = await fetch('http://localhost:5000/api/jobs/company/mine', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          const jobs = await res.json();
          if (Array.isArray(jobs)) {
            const found = jobs.find((j) => j.id === jobId);
            if (found) {
              setJob(found);
              generateSocialCopy(found);
              return;
            }
          }
        }
        // Búsqueda directa alternativa
        const resAll = await fetch('http://localhost:5000/api/jobs?limit=50');
        const dataAll = await resAll.json();
        if (dataAll && Array.isArray(dataAll.data)) {
          const found = dataAll.data.find((j: any) => j.id === jobId);
          if (found) {
            setJob(found);
            generateSocialCopy(found);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
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
            <span className="bg-blue-50 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
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
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
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
                      <Check className="w-3.5 h-3.5 text-blue-600" /> ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copiar Texto
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-slate-900">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Consejos de Difusión en RD
                </div>
                <p className="text-slate-600 leading-normal">
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
                  onClick={handleDownloadCreative}
                  disabled={downloadingImage}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer disabled:cursor-wait shadow-sm"
                >
                  {downloadingImage ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generando imagen...
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" /> Descargar Imagen
                    </>
                  )}
                </button>
              </div>

              {/* SELECTOR DE ESTILOS DE RRHH */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-600">Estilo del arte:</span>
                <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFlyerTheme('corporate')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      flyerTheme === 'corporate'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🏢 Corporativo Blanco
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlyerTheme('executive')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      flyerTheme === 'executive'
                        ? 'bg-white text-indigo-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    👔 Azul Ejecutivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlyerTheme('warm')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      flyerTheme === 'warm'
                        ? 'bg-white text-amber-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📄 Editorial Humano
                  </button>
                </div>
              </div>

              {/* CREATIVO VISUAL SQUARE 1:1 - ESTILO RRHH & EMPLEO */}
              {flyerTheme === 'corporate' && (
                <div
                  id="social-creative"
                  className="aspect-square w-full max-w-[420px] mx-auto rounded-3xl bg-white text-slate-900 flex flex-col justify-between relative overflow-hidden shadow-xl border border-slate-200/90 p-7"
                >
                  {/* Cabecera */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <Logo />
                    <span className="bg-blue-50 text-blue-800 text-[10px] font-extrabold px-3 py-1 rounded-full border border-blue-200/80 uppercase tracking-wider flex items-center gap-1">
                      💼 Oportunidad Laboral
                    </span>
                  </div>

                  {/* Bloque central */}
                  <div className="space-y-3.5 my-auto py-2">
                    <div className="inline-flex items-center gap-1.5 bg-slate-100/90 border border-slate-200 px-3 py-1 rounded-lg text-xs font-bold text-slate-800">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      {user?.company?.name || 'Empresa Líder'}
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
                    </div>

                    <h2 className="text-2xl sm:text-[26px] font-black text-[#001428] font-['Plus_Jakarta_Sans'] leading-tight tracking-tight">
                      {job?.title}
                    </h2>

                    <div className="flex flex-wrap gap-2 pt-0.5 text-xs font-semibold">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {job?.province || 'Santo Domingo'}, RD
                      </span>
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100">
                        {job?.workplaceType === 'REMOTE' ? '100% Remoto' : job?.workplaceType === 'HYBRID' ? 'Híbrido' : 'Presencial'}
                      </span>
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">
                        {job?.jobType === 'FULL_TIME' ? 'Tiempo Completo' : 'Medio Tiempo'}
                      </span>
                    </div>

                    {job?.salaryMin && (
                      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5 space-y-0.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1">
                          <span>💰</span> Salario Bruto Ofrecido
                        </div>
                        <div className="text-base sm:text-lg font-black text-blue-950">
                          RD$ {Number(job.salaryMin).toLocaleString()} – RD$ {Number(job.salaryMax).toLocaleString()}
                          <span className="text-xs font-normal text-blue-800 ml-1">/ mes</span>
                        </div>
                        <p className="text-[10px] text-blue-700 font-medium">
                          Beneficios de ley dominicana + Seguro médico
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pie del flyer */}
                  <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="text-slate-500 text-[11px]">
                      Postúlate gratis en: <span className="font-extrabold text-blue-700 block text-xs">quisqueyatalent.com</span>
                    </div>
                    <div className="bg-slate-900 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl shadow-xs">
                      Vacante Abierta 🇩🇴
                    </div>
                  </div>
                </div>
              )}

              {flyerTheme === 'executive' && (
                <div
                  id="social-creative"
                  className="aspect-square w-full max-w-[420px] mx-auto rounded-3xl bg-gradient-to-b from-[#0A192F] to-[#071324] text-white flex flex-col justify-between relative overflow-hidden shadow-xl border border-slate-800 p-7"
                >
                  {/* Cabecera */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                    <Logo isLight={true} />
                    <span className="bg-amber-400/15 text-amber-300 text-[10px] font-extrabold px-3 py-1 rounded-full border border-amber-400/30 uppercase tracking-wider">
                      CONTRATACIÓN OFICIAL
                    </span>
                  </div>

                  {/* Cuerpo */}
                  <div className="space-y-3.5 my-auto py-2">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-400" />
                      {user?.company?.name || 'Empresa Dominicana'}
                    </div>

                    <h2 className="text-2xl sm:text-[26px] font-black text-white font-['Plus_Jakarta_Sans'] leading-tight tracking-tight">
                      {job?.title}
                    </h2>

                    <div className="flex flex-wrap gap-2 pt-0.5 text-xs font-semibold">
                      <span className="bg-slate-800/80 text-slate-200 px-3 py-1 rounded-lg border border-slate-700">
                        📍 {job?.province || 'Santo Domingo'}, RD
                      </span>
                      <span className="bg-blue-900/40 text-blue-200 px-3 py-1 rounded-lg border border-blue-500/30">
                        {job?.workplaceType === 'REMOTE' ? '100% Remoto' : job?.workplaceType === 'HYBRID' ? 'Híbrido' : 'Presencial'}
                      </span>
                    </div>

                    {job?.salaryMin && (
                      <div className="bg-slate-800/60 border border-amber-500/30 rounded-2xl p-3.5 space-y-0.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                          Compensación Mensual
                        </div>
                        <div className="text-base sm:text-lg font-black text-white">
                          RD$ {Number(job.salaryMin).toLocaleString()} – RD$ {Number(job.salaryMax).toLocaleString()}
                          <span className="text-xs font-normal text-slate-300 ml-1">/ mes</span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Contrato indefinido con beneficios institucionales
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="pt-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-[11px]">Envía tu currículum en: <strong className="text-white block text-xs">quisqueyatalent.com</strong></span>
                    <span className="text-[10px] font-bold bg-white/10 text-slate-200 px-3 py-1 rounded-lg">100% Gratuito</span>
                  </div>
                </div>
              )}

              {flyerTheme === 'warm' && (
                <div
                  id="social-creative"
                  className="aspect-square w-full max-w-[420px] mx-auto rounded-3xl bg-[#FAF7F2] text-[#1E293B] flex flex-col justify-between relative overflow-hidden shadow-xl border border-[#E7DFD5] p-7"
                >
                  {/* Cabecera */}
                  <div className="flex items-center justify-between border-b border-[#E7DFD5] pb-4">
                    <Logo />
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-3 py-1 rounded-full border border-amber-200 uppercase tracking-wider">
                      CONVOCATORIA LABORAL
                    </span>
                  </div>

                  {/* Cuerpo */}
                  <div className="space-y-3.5 my-auto py-2">
                    <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-700" />
                      {user?.company?.name || 'Empresa Dominicana'}
                    </div>

                    <h2 className="text-2xl sm:text-[26px] font-extrabold text-[#111827] font-['Plus_Jakarta_Sans'] leading-tight tracking-tight">
                      {job?.title}
                    </h2>

                    <div className="flex flex-wrap gap-2 pt-0.5 text-xs font-semibold">
                      <span className="bg-white border border-[#E7DFD5] text-[#334155] px-3 py-1 rounded-lg">
                        📍 {job?.province || 'Santo Domingo'}, RD
                      </span>
                      <span className="bg-amber-50 text-amber-900 border border-amber-200/60 px-3 py-1 rounded-lg">
                        {job?.workplaceType === 'REMOTE' ? 'Remoto' : 'Presencial / Híbrido'}
                      </span>
                    </div>

                    {job?.salaryMin && (
                      <div className="bg-white border border-[#E7DFD5] shadow-xs rounded-2xl p-3.5 space-y-0.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                          Rango Salarial
                        </div>
                        <div className="text-base sm:text-lg font-black text-[#111827]">
                          RD$ {Number(job.salaryMin).toLocaleString()} – RD$ {Number(job.salaryMax).toLocaleString()}
                          <span className="text-xs font-normal text-slate-500 ml-1">/ mes</span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Vacante verificada por Quisqueya Talent
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="pt-3.5 border-t border-[#E7DFD5] flex items-center justify-between text-xs text-slate-600">
                    <span className="text-[11px]">Aplica directamente en: <strong className="text-amber-900 block text-xs">quisqueyatalent.com</strong></span>
                    <span className="text-[10px] font-bold bg-amber-900 text-white px-3 py-1 rounded-lg">Postulación Abierta</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

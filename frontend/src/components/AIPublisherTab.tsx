'use client';

import React, { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { toast } from '@/components/Toast';
import {
  Bot,
  Play,
  Pause,
  Zap,
  RefreshCw,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Building2,
  UploadCloud,
  ChevronRight,
  Sparkles,
  MapPin,
  Mail,
  DollarSign,
  Filter,
  Globe,
  Link as LinkIcon,
} from 'lucide-react';
import Image from 'next/image';

const InstagramIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface AIPublisherTabProps {
  token: string;
}

export default function AIPublisherTab({ token }: AIPublisherTabProps) {
  const [settings, setSettings] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>({ pending: 0, draft: 0, published: 0, discarded: 0, total: 0 });
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [profileInput, setProfileInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [runningNow, setRunningNow] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [queueFilter, setQueueFilter] = useState<string>('ALL');

  // Manual upload state
  const [manualCaption, setManualCaption] = useState('');
  const [manualFiles, setManualFiles] = useState<File[]>([]);
  const [uploadingManual, setUploadingManual] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  // Cargar datos del publicador
  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [settingsRes, sourcesRes, queueRes] = await Promise.all([
        fetch(`${API_URL}/api/ai/publisher/settings`, { headers: { Authorization: `Bearer ${token}` } }).then((r) =>
          r.json()
        ),
        fetch(`${API_URL}/api/ai/publisher/sources`, { headers: { Authorization: `Bearer ${token}` } }).then((r) =>
          r.json()
        ),
        fetch(`${API_URL}/api/ai/publisher/queue?status=${queueFilter}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
      ]);

      if (!settingsRes.error) setSettings(settingsRes);
      if (Array.isArray(sourcesRes)) setSources(sourcesRes);
      if (queueRes && queueRes.items) {
        setQueue(queueRes.items);
        if (queueRes.counts) setCounts(queueRes.counts);
      }
    } catch (err) {
      console.error('Error cargando publicador IA:', err);
      toast.error('No se pudieron cargar los datos del Publicador IA', 'Error de Conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, queueFilter]);

  // Alternar pausa / reanudación
  const handleToggleActive = async () => {
    if (!settings) return;
    try {
      setSavingSettings(true);
      const nextActive = !settings.isActive;
      const res = await fetch(`${API_URL}/api/ai/publisher/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: nextActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        toast.success(
          nextActive ? 'Publicador IA Reanudado: Se publicarán vacantes de forma programada' : 'Publicador IA Pausado: No se emitirán nuevas publicaciones automáticas',
          nextActive ? '▶️ Motor Activo' : '⏸️ Motor en Pausa'
        );
      } else {
        toast.error(data.error || 'Error al modificar estado', 'Error');
      }
    } catch (e) {
      toast.error('Error de red al actualizar estado', 'Error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Guardar configuración (frecuencia y modo)
  const handleSaveConfig = async (newJobsPerHour: number, newPublishMode: string) => {
    try {
      setSavingSettings(true);
      const res = await fetch(`${API_URL}/api/ai/publisher/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobsPerHour: newJobsPerHour,
          publishMode: newPublishMode,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        toast.success('Configuración guardada exitosamente', 'Ajustes Actualizados');
      } else {
        toast.error(data.error || 'Error al guardar ajustes', 'Error');
      }
    } catch (e) {
      toast.error('Error de red al guardar ajustes', 'Error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Escanear enlace web de portal de empleos o perfil de Instagram
  const handleScanProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileInput.trim()) {
      toast.warning('Ingresa el enlace web de la página de empleos o perfil', 'Campo requerido');
      return;
    }

    try {
      setScanning(true);
      const res = await fetch(`${API_URL}/api/ai/publisher/scan-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profileUrl: profileInput.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.result.newEnqueued > 0) {
          toast.success(
            data.message || `¡${data.result.newEnqueued} vacantes nuevas detectadas y encoladas!`,
            'Escaneo Exitoso'
          );
        } else if (data.result.skippedDuplicates > 0) {
          toast.info(
            `Las ${data.result.skippedDuplicates} vacantes detectadas en ${data.result.username} ya estaban registradas en la cola. Se omitieron duplicados.`,
            'Vacantes ya en cola'
          );
        } else if (data.result.sourceType === 'INSTAGRAM_PROFILE') {
          toast.info(
            `Meta/Instagram bloqueó el acceso público automatizado al perfil @${data.result.username}. Puedes pegar el enlace directo a la página web del empleo o subir capturas/screenshots en la zona superior.`,
            'Aviso de Instagram'
          );
        } else {
          toast.warning(
            data.message || 'No se detectaron publicaciones de empleo en la página indicada. Asegúrate de que el enlace contenga vacantes.',
            'Sin vacantes detectadas'
          );
        }
        setProfileInput('');
        await fetchData();
      } else {
        toast.error(data.error || 'No se pudo escanear la página o perfil', 'Error de Escaneo');
      }
    } catch (e) {
      toast.error('Error de comunicación con el servidor al escanear', 'Error de Conexión');
    } finally {
      setScanning(false);
    }
  };

  // Procesar y publicar 1 vacante ahora
  const handleRunNow = async () => {
    try {
      setRunningNow(true);
      const res = await fetch(`${API_URL}/api/ai/publisher/run-now`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(
          `Vacante generada con IA: "${data.result?.job?.title || 'Vacante'}"`,
          data.result?.job?.status === 'PUBLISHED' ? '🚀 Publicada en Vivo' : '📝 Guardada como Borrador'
        );
        await fetchData();
      } else {
        toast.info(data.error || 'No hay vacantes pendientes en la cola', 'Aviso');
      }
    } catch (e) {
      toast.error('Error procesando vacante inmediata', 'Error');
    } finally {
      setRunningNow(false);
    }
  };

  // Publicar borrador
  const handlePublishDraft = async (queueId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/ai/publisher/publish-draft/${queueId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('La vacante ahora está activa y visible en el portal de empleos', 'Vacante Publicada');
        await fetchData();
      } else {
        toast.error(data.error || 'Error al publicar borrador', 'Error');
      }
    } catch (e) {
      toast.error('Error al comunicarse con el servidor', 'Error');
    }
  };

  // Eliminar de la cola
  const handleDeleteQueue = async (queueId: string) => {
    if (!confirm('¿Deseas eliminar este elemento de la cola?')) return;
    try {
      const res = await fetch(`${API_URL}/api/ai/publisher/queue/${queueId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Elemento eliminado de la cola', 'Eliminado');
        setQueue((prev) => prev.filter((item) => item.id !== queueId));
      }
    } catch (e) {
      toast.error('Error al eliminar', 'Error');
    }
  };

  // Subida por lote de múltiples capturas / screenshots de Instagram
  const handleUploadBatch = async () => {
    if (manualFiles.length === 0) {
      toast.warning('Selecciona al menos una imagen de vacante', 'Archivos requeridos');
      return;
    }

    try {
      setUploadingManual(true);
      const formData = new FormData();
      manualFiles.forEach((file) => {
        formData.append('flyers', file);
      });

      const res = await fetch(`${API_URL}/api/ai/publisher/manual-enqueue`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(
          `${manualFiles.length} vacante(s) agregada(s) a la cola para redacción con IA`,
          'Encoladas con Éxito'
        );
        setManualFiles([]);
        await fetchData();
      } else {
        toast.error(data.error || 'Error al encolar vacantes', 'Error');
      }
    } catch (e) {
      toast.error('Error al subir capturas', 'Error');
    } finally {
      setUploadingManual(false);
    }
  };

  if (loading && !settings) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        <p className="text-sm font-bold text-slate-600">Cargando motor del Publicador con IA...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. CABECERA & CONTROL MAESTRO DE LA EMPRESA OFICIAL */}
      <div className="bg-gradient-to-br from-slate-900 via-[#001938] to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Bot className="w-3.5 h-3.5" /> Automatización con IA
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Exclusivo Administrador
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-['Plus_Jakarta_Sans'] tracking-tight">
              Publicador Inteligente de Vacantes desde Instagram
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Monitorea perfiles de empleo en Instagram, filtra automáticamente publicaciones de menos de 1 mes,
              descarta vacantes repetidas y redacta las ofertas con IA bajo la cuenta oficial de{' '}
              <strong className="text-white font-bold">Quisqueya Talent</strong>.
            </p>
          </div>

          {/* Tarjeta de Cuenta Oficial Quisqueya Talent */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-xs">
              <img
                src="/logo-quisqueya-talent.png"
                alt="Quisqueya Talent"
                className="w-full h-full object-contain"
                onError={(e: any) => {
                  e.target.src = '/logo.png';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-white">Quisqueya Talent</span>
                <span className="bg-blue-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">✓ Oficial</span>
              </div>
              <p className="text-[11px] text-sky-200">Vinculada a tu perfil Super Admin</p>
              <p className="text-[10px] text-slate-400">Publicador automático activo</p>
            </div>
          </div>
        </div>

        {/* Barra de Control de Estado y Acciones */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Indicador de Estado */}
            <div
              className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl font-bold text-xs border ${
                settings?.isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  settings?.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              ></span>
              <span>
                {settings?.isActive
                  ? `🟢 Motor Activo: ${settings?.jobsPerHour} vacantes/hora (${settings?.publishMode === 'PUBLISHED' ? 'Automático' : 'Borrador'})`
                  : '⏸️ Publicaciones Pausadas'}
              </span>
            </div>

            {/* Botón de Pausar / Reanudar */}
            <button
              onClick={handleToggleActive}
              disabled={savingSettings}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 ${
                settings?.isActive
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {settings?.isActive ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" /> Pausar Publicador
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" /> Reanudar Publicador
                </>
              )}
            </button>
          </div>

          {/* Botón Acción Inmediata: Publicar 1 Ahora */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRunNow}
              disabled={runningNow || counts.pending === 0}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 text-white px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-lg cursor-pointer disabled:cursor-not-allowed"
            >
              {runningNow ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Procesando con IA...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Procesar y Publicar 1 Ahora
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. PANEL DE CONFIGURACIÓN DE CADENCIA Y MODO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta: Frecuencia de Publicación */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">Frecuencia de Publicación</h3>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {settings?.jobsPerHour || 2} vacantes por hora
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Define cuántas vacantes procesadas se publicarán automáticamente en cada intervalo de 1 hora mientras el motor esté activo.
          </p>

          <div className="grid grid-cols-5 gap-2 pt-2">
            {[1, 2, 3, 5, 10].map((rate) => (
              <button
                key={rate}
                onClick={() => handleSaveConfig(rate, settings?.publishMode || 'DRAFT')}
                disabled={savingSettings}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition text-center cursor-pointer ${
                  settings?.jobsPerHour === rate
                    ? 'bg-blue-600 text-white shadow-xs font-black'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {rate}/h
                <span className="block text-[10px] font-normal opacity-80">
                  {rate === 1 ? 'cada 60m' : rate === 2 ? 'cada 30m' : rate === 3 ? 'cada 20m' : rate === 5 ? 'cada 12m' : 'cada 6m'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tarjeta: Modo de Publicación */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">Modo de Publicación</h3>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                settings?.publishMode === 'PUBLISHED'
                  ? 'bg-emerald-100 text-emerald-800 font-black'
                  : 'bg-amber-100 text-amber-800 font-black'
              }`}
            >
              {settings?.publishMode === 'PUBLISHED' ? '🚀 Automático en Vivo' : '📝 Borrador Primero'}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Elige si las vacantes se publican de inmediato o si prefieres revisarlas y aprobarlas antes de salir al público.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleSaveConfig(settings?.jobsPerHour || 2, 'PUBLISHED')}
              disabled={savingSettings}
              className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
                settings?.publishMode === 'PUBLISHED'
                  ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-700 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Publicación Automática
              </div>
              <p className="text-[11px] text-slate-500">
                Pasan directo a estado <strong className="text-emerald-700">ACTIVA</strong>. Visibles de inmediato en el portal.
              </p>
            </button>

            <button
              onClick={() => handleSaveConfig(settings?.jobsPerHour || 2, 'DRAFT')}
              disabled={savingSettings}
              className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
                settings?.publishMode === 'DRAFT'
                  ? 'border-amber-500 bg-amber-50/50 text-amber-950 ring-2 ring-amber-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs text-amber-700 mb-1">
                <FileText className="w-4 h-4 text-amber-600" /> Guardar como Borrador
              </div>
              <p className="text-[11px] text-slate-500">
                Quedan en <strong className="text-amber-700">BORRADOR</strong>. Podrás revisarlas y publicarlas con 1 clic.
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* 3. MONITOREO DE PERFILES DE INSTAGRAM & ESCANEO INTELIGENTE */}
      {/* 3. INGESTA INTELIGENTE: CAPTURAS DE INSTAGRAM & ESCANEO DE PERFILES */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-black text-slate-900 font-['Plus_Jakarta_Sans']">
                Ingesta de Vacantes para Redactar con IA
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Sube capturas de pantalla de posts de Instagram (las imágenes que guardes o descargues) o escanea el perfil directamente.
            </p>
          </div>
        </div>

        {/* Zona 1: Subida Múltiple de Capturas / Screenshots de Instagram (Infalible) */}
        <div className="bg-gradient-to-br from-blue-50/50 via-slate-50 to-indigo-50/30 border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-3xl p-6 sm:p-8 text-center transition space-y-4">
          <div className="max-w-md mx-auto space-y-2">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-xs border border-blue-100 flex items-center justify-center mx-auto text-blue-600">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h4 className="font-black text-slate-900 text-base">
              Arrastra aquí tus capturas o flyers de Instagram
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Selecciona una o varias imágenes a la vez (hasta 20 capturas). La IA analizará cada imagen, extraerá los requisitos, responsabilidades, salarios y correos de RRHH automáticamente.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <label className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-md shadow-blue-600/20 transition cursor-pointer flex items-center gap-2">
              <UploadCloud className="w-4 h-4" />
              Seleccionar Imágenes ({manualFiles.length > 0 ? `${manualFiles.length} seleccionadas` : 'Subir Capturas'})
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    const newFiles = Array.from(e.target.files);
                    setManualFiles((prev) => [...prev, ...newFiles]);
                  }
                }}
              />
            </label>

            {manualFiles.length > 0 && (
              <button
                type="button"
                onClick={handleUploadBatch}
                disabled={uploadingManual}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-md shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {uploadingManual ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Encolando Vacantes...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" /> Encolar {manualFiles.length} Vacantes con IA
                  </>
                )}
              </button>
            )}
          </div>

          {/* Miniaturas de Archivos Seleccionados */}
          {manualFiles.length > 0 && (
            <div className="pt-4 border-t border-slate-200/60 flex flex-wrap gap-2 justify-center">
              {manualFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-slate-700 shadow-2xs"
                >
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setManualFiles((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-rose-600 font-black ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setManualFiles([])}
                className="text-xs text-rose-600 font-bold hover:underline px-2 py-1"
              >
                Limpiar selección
              </button>
            </div>
          )}
        </div>

        {/* Zona 2: Escaneo Web Universal (Páginas Web de Empleo, Portales o Instagram) */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-600" /> Escanear Página Web de Empleos o Redes Sociales:
            </span>
            <span className="text-[11px] text-slate-400">Portales web (Tu Empleo RD, Aldaba, etc.) o Instagram</span>
          </div>

          <form onSubmit={handleScanProfile} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={profileInput}
                onChange={(e) => setProfileInput(e.target.value)}
                placeholder="Pega el enlace web (ej. https://tuempleord.do/... o cualquier portal/vacante) o @perfil"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={scanning || !profileInput.trim()}
              className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-6 py-3 rounded-2xl transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer shrink-0"
            >
              {scanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Analizando Página...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Escanear Página / Perfil
                </>
              )}
            </button>
          </form>
        </div>

        {/* Fuentes y Portales Monitoreados */}
        {sources.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Fuentes y Portales Registrados ({sources.length})
            </span>
            <div className="flex flex-wrap gap-2">
              {sources.map((s) => {
                const isWeb = s.username.includes('.') || !s.profileUrl.includes('instagram.com');
                return (
                  <div
                    key={s.id}
                    className="bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs font-medium text-slate-700"
                  >
                    {isWeb ? (
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
                    )}
                    <span className="font-bold">{isWeb ? s.username : `@${s.username}`}</span>
                    <span className="text-[10px] text-slate-400">({s._count?.queueItems || 0} vacantes en cola)</span>
                    <a
                      href={s.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-blue-600"
                      title="Abrir enlace"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. TABLERO DE COLA DE VACANTES & BORRADORES */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 font-['Plus_Jakarta_Sans']">
              Cola de Publicaciones ({counts.total})
            </h3>
            <p className="text-xs text-slate-500">
              Vacantes extraídas de Instagram listas para ser procesadas y publicadas
            </p>
          </div>

          {/* Filtros de Estado */}
          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
            {[
              { id: 'ALL', label: `Todas (${counts.total})` },
              { id: 'PENDING', label: `⏳ En Cola (${counts.pending})` },
              { id: 'DRAFT', label: `📝 Borradores (${counts.draft})` },
              { id: 'PUBLISHED', label: `✅ Publicadas (${counts.published})` },
              { id: 'DISCARDED', label: `❌ No Empleo (${counts.discarded})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setQueueFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  queueFilter === f.id ? 'bg-white text-slate-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Vacantes en Cola */}
        {queue.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl p-12 text-center space-y-3 border border-slate-200/60">
            <Bot className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No hay vacantes en esta vista</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Ingresa un perfil de Instagram en el campo superior para escanear y encolar vacantes de menos de 1 mes de antigüedad.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {queue.map((item) => {
              let extracted: any = null;
              try {
                if (item.extractedData) extracted = JSON.parse(item.extractedData);
              } catch (e) {}

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Fila superior: Badge de Estado y Origen */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {item.status === 'PENDING' && (
                          <span className="bg-blue-100 text-blue-800 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" /> En Cola
                          </span>
                        )}
                        {item.status === 'DRAFT' && (
                          <span className="bg-amber-100 text-amber-800 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Borrador Listo
                          </span>
                        )}
                        {item.status === 'PUBLISHED' && (
                          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Publicada en Vivo
                          </span>
                        )}
                        {item.status === 'DISCARDED' && (
                          <span className="bg-slate-100 text-slate-600 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> No es Empleo
                          </span>
                        )}

                        {item.source?.username && (
                          <span className="text-[11px] text-slate-400 font-bold">@{item.source.username}</span>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteQueue(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition p-1"
                        title="Eliminar de la cola"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Contenido / Datos Extraídos */}
                    <div className="flex gap-3 items-start">
                      {item.imageUrl && (
                        <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0 overflow-hidden border border-slate-200">
                          <img
                            src={item.imageUrl.startsWith('/') ? `${API_URL}${item.imageUrl}` : item.imageUrl}
                            alt="Post Instagram"
                            className="w-full h-full object-cover"
                            onError={(e: any) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      <div className="space-y-1 flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                          {extracted?.title || (item.captionText ? item.captionText.substring(0, 70) + '...' : 'Vacante en cola')}
                        </h4>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                          {extracted?.companyName && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" /> {extracted.companyName}
                            </span>
                          )}
                          {extracted?.province && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" /> {extracted.province}
                            </span>
                          )}
                          {extracted?.applyEmail && (
                            <span className="flex items-center gap-1 text-blue-600 font-medium">
                              <Mail className="w-3 h-3" /> {extracted.applyEmail}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Resumen del post */}
                    <p className="text-[11px] text-slate-500 line-clamp-2 italic bg-slate-50 p-2 rounded-xl">
                      "{item.captionText?.substring(0, 140) || 'Sin texto'}"
                    </p>
                  </div>

                  {/* Acciones del ítem */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {item.postUrl ? (
                      <a
                        href={item.postUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1"
                      >
                        Ver en Instagram <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400">Ingreso Manual</span>
                    )}

                    <div className="flex items-center gap-2">
                      {item.status === 'DRAFT' && (
                        <button
                          onClick={() => handlePublishDraft(item.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Publicar en Vivo
                        </button>
                      )}

                      {item.jobId && (
                        <a
                          href={`/empleos/${item.jobId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                        >
                          Ver Vacante
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

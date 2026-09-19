'use client';

import React, { useState, useEffect } from 'react';
import { API_URL } from '../lib/api';
import {
  Share2,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  Send,
  Save,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  HelpCircle,
  Play,
  RotateCcw,
  Radio,
  Sliders,
  History,
  Smartphone,
} from 'lucide-react';

const TwitterIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface SocialMediaTabProps {
  token: string;
}

export default function SocialMediaTab({ token }: SocialMediaTabProps) {
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'twitter' | 'facebook' | 'instagram' | 'broadcast'>('whatsapp');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ channel: string; success: boolean; message: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Configuración de redes
  const [settings, setSettings] = useState({
    autoShareOnPublish: true,
    // WhatsApp
    whatsappActive: true,
    whatsappWebhookUrl: 'https://7107.api.greenapi.com/waInstance710722741020/sendMessage/8855ab5f803e4527b7d9580c95151dd142f950a3165647849b',
    whatsappChannelId: '120363429972361642@g.us',
    whatsappApiKey: '8855ab5f803e4527b7d9580c95151dd142f950a3165647849b',
    whatsappTemplate: '',
    // Twitter / X
    twitterActive: false,
    twitterApiKey: '',
    twitterApiSecret: '',
    twitterAccessToken: '',
    twitterAccessSecret: '',
    twitterTemplate: '',
    // Facebook
    facebookActive: false,
    facebookPageId: '',
    facebookAccessToken: '',
    // Instagram
    instagramActive: false,
    instagramAccountId: '',
    instagramAccessToken: '',
  });

  // Mostrar u ocultar tokens
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});

  // Vacantes para difusión manual
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [previewData, setPreviewData] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<any>(null);

  // Historial de difusiones
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Copiado al portapapeles
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleTokenVisibility = (key: string) => {
    setShowTokens((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Cargar configuración inicial
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/social/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings((prev) => ({
          ...prev,
          ...data,
        }));
      }
    } catch (e) {
      console.error('Error cargando configuración social:', e);
    } finally {
      setLoading(false);
    }
  };

  // Cargar vacantes activas para difusión manual
  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/jobs?limit=25`);
      const data = await res.json();
      if (data && data.data && data.data.length > 0) {
        setJobs(data.data);
        setSelectedJobId(data.data[0].id);
      }
    } catch (e) {}
  };

  // Cargar logs
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`${API_URL}/api/social/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchJobs();
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Cargar previsualización cuando cambie la vacante seleccionada
  useEffect(() => {
    if (!selectedJobId) return;
    const loadPreview = async () => {
      setLoadingPreview(true);
      try {
        const res = await fetch(`${API_URL}/api/social/preview/${selectedJobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPreviewData(data);
        }
      } catch (e) {
      } finally {
        setLoadingPreview(false);
      }
    };
    loadPreview();
  }, [selectedJobId, token]);

  // Guardar configuración
  const handleSaveSettings = async () => {
    setSaving(true);
    setErrorMessage('');
    setSaveSuccess(false);
    try {
      const res = await fetch(`${API_URL}/api/social/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const errData = await res.json();
        setErrorMessage(errData.error || 'Error al guardar la configuración');
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Error al conectar con el servidor');
    } finally {
      setSaving(false);
    }
  };

  // Probar canal
  const handleTestChannel = async (channelName: 'WHATSAPP' | 'TWITTER' | 'FACEBOOK' | 'INSTAGRAM') => {
    setTestingChannel(channelName);
    setTestResult(null);
    try {
      const res = await fetch(`${API_URL}/api/social/test/${channelName.toLowerCase()}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          channel: channelName,
          success: true,
          message: `¡Conexión y envío exitoso! ID: ${data.id || 'OK'}`,
        });
      } else {
        setTestResult({
          channel: channelName,
          success: false,
          message: data.error || 'Fallo durante la prueba. Revisa credenciales.',
        });
      }
      fetchLogs();
    } catch (e: any) {
      setTestResult({
        channel: channelName,
        success: false,
        message: e.message || 'Error de conexión',
      });
    } finally {
      setTestingChannel(null);
    }
  };

  // Difundir vacante manual
  const handleBroadcastJob = async (channel?: string) => {
    if (!selectedJobId) return;
    setBroadcasting(true);
    setBroadcastResult(null);
    try {
      const body = channel ? { channels: [channel] } : {};
      const res = await fetch(`${API_URL}/api/social/broadcast/${selectedJobId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setBroadcastResult(data);
      fetchLogs();
    } catch (e: any) {
      alert(`Error difundiendo: ${e.message}`);
    } finally {
      setBroadcasting(false);
    }
  };

  // Insertar variable en plantilla
  const insertVariable = (field: 'whatsappTemplate' | 'twitterTemplate', tag: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: (prev[field] || '') + ` {${tag}}`,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#0F2942] via-[#001428] to-[#0B1C30] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-sky-950/40 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/15 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              Ecosistema de Difusión Multicanal Quisqueya Talent
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-['Plus_Jakarta_Sans'] tracking-tight">
              Difusión Automatizada en Redes Sociales
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Configura y automatiza la publicación de ofertas de empleo en los canales de mayor impacto en República Dominicana: 
              <strong> Canales & Grupos de WhatsApp</strong>, <strong>X (Twitter)</strong>, <strong>Páginas de Facebook</strong> e <strong>Instagram Feed</strong>.
            </p>
          </div>

          {/* Master Switch: Autocompartir al publicar */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 shrink-0 max-w-xs space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                Autodifusión Global
              </span>
              <button
                type="button"
                onClick={() => setSettings((s) => ({ ...s, autoShareOnPublish: !s.autoShareOnPublish }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  settings.autoShareOnPublish ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoShareOnPublish ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-slate-300">
              {settings.autoShareOnPublish
                ? '✅ Activa: Cada vacante nueva publicada por IA o Reclutador se difundirá automáticamente a las redes encendidas.'
                : '⏸️ Pausada: Las vacantes solo se compartirán cuando tú lo ordenes manualmente.'}
            </p>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas de Canales */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveChannel('whatsapp')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeChannel === 'whatsapp'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          WhatsApp (Canales & Grupos)
          {settings.whatsappActive && <span className="w-2 h-2 rounded-full bg-emerald-300"></span>}
        </button>

        <button
          onClick={() => setActiveChannel('twitter')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeChannel === 'twitter'
              ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <TwitterIcon className="w-4 h-4 text-sky-400" />
          X / Twitter Bot
          {settings.twitterActive && <span className="w-2 h-2 rounded-full bg-sky-400"></span>}
        </button>

        <button
          onClick={() => setActiveChannel('facebook')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeChannel === 'facebook'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FacebookIcon className="w-4 h-4" />
          Facebook Pages (Meta)
          {settings.facebookActive && <span className="w-2 h-2 rounded-full bg-blue-300"></span>}
        </button>

        <button
          onClick={() => setActiveChannel('instagram')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeChannel === 'instagram'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <InstagramIcon className="w-4 h-4" />
          Instagram Feed (Meta)
          {settings.instagramActive && <span className="w-2 h-2 rounded-full bg-pink-300"></span>}
        </button>

        <button
          onClick={() => setActiveChannel('broadcast')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ml-auto ${
            activeChannel === 'broadcast'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Send className="w-4 h-4 text-amber-300" />
          Difusión Manual & Historial ({logs.length})
        </button>
      </div>

      {/* Banner de feedback de Guardado / Test */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ¡Configuración guardada exitosamente en el servidor!
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          {errorMessage}
        </div>
      )}

      {testResult && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-2.5 text-xs font-semibold animate-fade-in ${
            testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <div className="font-bold">Resultado de Prueba ({testResult.channel}):</div>
            <div>{testResult.message}</div>
          </div>
        </div>
      )}

      {/* CONTENIDO DE CADA CANAL */}

      {/* 1. WHATSAPP */}
      {activeChannel === 'whatsapp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Canales & Grupos de WhatsApp</h2>
                  <p className="text-xs text-slate-500">Envío masivo directo a comunidades de empleo en RD</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">
                  {settings.whatsappActive ? 'Activo' : 'Inactivo'}
                </span>
                <button
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, whatsappActive: !s.whatsappActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    settings.whatsappActive ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.whatsappActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL de Webhook o API de WhatsApp (Baileys / Evolution API / WhatsApp Cloud / n8n)
                </label>
                <input
                  type="text"
                  placeholder="https://tu-servidor-whatsapp.com/api/send-message o webhook URL"
                  value={settings.whatsappWebhookUrl || ''}
                  onChange={(e) => setSettings({ ...settings, whatsappWebhookUrl: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 bg-slate-50 focus:bg-white transition"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  El endpoint HTTP POST que recibirá el mensaje formateado con título, detalles y enlace de Quisqueya Talent.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ID de Canal o Grupo de WhatsApp (JID)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 120363048593@g.us o channel_id"
                    value={settings.whatsappChannelId || ''}
                    onChange={(e) => setSettings({ ...settings, whatsappChannelId: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 bg-slate-50 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    API Key o Token Secreto (Opcional)
                  </label>
                  <div className="relative">
                    <input
                      type={showTokens['wa_key'] ? 'text' : 'password'}
                      placeholder="Bearer token o secret x-api-key"
                      value={settings.whatsappApiKey || ''}
                      onChange={(e) => setSettings({ ...settings, whatsappApiKey: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 bg-slate-50 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => toggleTokenVisibility('wa_key')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showTokens['wa_key'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Plantilla del Mensaje (WhatsApp)
                  </label>
                  <span className="text-[11px] text-slate-400">Variables dinámicas disponibles:</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['titulo', 'empresa', 'ubicacion', 'modalidad', 'salario', 'enlace'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertVariable('whatsappTemplate', tag)}
                      className="text-[10px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold px-2 py-0.5 rounded-md border border-slate-200 transition cursor-pointer"
                    >
                      +{`{${tag}}`}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={6}
                  placeholder={`💼 *NUEVA VACANTE EN REPÚBLICA DOMINICANA* 🇩🇴\n\n📌 *Puesto:* {titulo}\n🏢 *Empresa:* {empresa}\n📍 *Ubicación:* {ubicacion}\n🤝 *Modalidad:* {modalidad}\n💰 *Salario:* {salario}\n\n👉 *Ver detalles y postularte gratis:*\n{enlace}`}
                  value={settings.whatsappTemplate || ''}
                  onChange={(e) => setSettings({ ...settings, whatsappTemplate: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 bg-slate-50 focus:bg-white transition font-mono leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleTestChannel('WHATSAPP')}
                  disabled={testingChannel === 'WHATSAPP' || !settings.whatsappWebhookUrl}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-40 transition cursor-pointer"
                >
                  <Send className={`w-3.5 h-3.5 ${testingChannel === 'WHATSAPP' ? 'animate-spin' : ''}`} />
                  {testingChannel === 'WHATSAPP' ? 'Enviando prueba...' : 'Enviar Mensaje de Prueba'}
                </button>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>

          {/* Previsualización en Mockup de WhatsApp */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 rounded-3xl p-4 shadow-xl border border-slate-800 text-white">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Smartphone className="w-4 h-4" /> Previsualización en WhatsApp
                </span>
                <span className="text-[10px] text-slate-400">Canal / Grupo RD</span>
              </div>

              <div className="p-3 my-3 bg-[#0c1317] rounded-2xl space-y-2 border border-slate-800/80">
                <div className="bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-xs text-xs space-y-2 max-w-sm shadow-md">
                  <div className="font-bold text-emerald-200">
                    💼 NUEVA VACANTE EN REPÚBLICA DOMINICANA 🇩🇴
                  </div>
                  <div className="space-y-1 text-slate-100 text-[11px] leading-relaxed">
                    <p>📌 <strong>Puesto:</strong> {jobs[0]?.title || 'Gerente de Operaciones'}</p>
                    <p>🏢 <strong>Empresa:</strong> {jobs[0]?.company?.name || 'Quisqueya Talent'}</p>
                    <p>📍 <strong>Ubicación:</strong> {jobs[0]?.province || 'Santo Domingo'} (Presencial)</p>
                    <p>💰 <strong>Salario:</strong> RD$ 45,000 - RD$ 55,000</p>
                  </div>
                  <div className="pt-2 border-t border-emerald-700/50 text-[11px]">
                    <p className="text-emerald-100">👉 <strong>Ver detalles y postularte gratis:</strong></p>
                    <span className="text-sky-300 underline break-all font-mono text-[10px]">
                      https://www.quisqueyatalent.com.do/empleos/vacante-ejemplo
                    </span>
                  </div>
                  <div className="text-[9px] text-emerald-300/80 text-right pt-1">
                    11:30 AM ✓✓
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl space-y-1.5 text-xs">
                  <div className="font-bold text-emerald-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      📢 Canal Oficial Vinculado:
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                      Ilimitado
                    </span>
                  </div>
                  <a
                    href="https://whatsapp.com/channel/0029Vb8cLMwElagrpADWIk0T"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-emerald-400 underline break-all font-mono block hover:text-emerald-300"
                  >
                    https://whatsapp.com/channel/0029Vb8cLMwElagrpADWIk0T
                  </a>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-2xl space-y-1.5 text-xs">
                  <div className="font-bold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-slate-400" />
                      💬 Grupo Oficial Vinculado:
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                      Comunidad
                    </span>
                  </div>
                  <a
                    href="https://chat.whatsapp.com/F3LjBjLYwSl3TzLQUoe70b"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-sky-400 underline break-all font-mono block hover:text-sky-300"
                  >
                    https://chat.whatsapp.com/F3LjBjLYwSl3TzLQUoe70b
                  </a>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 p-2.5 bg-slate-800/40 rounded-xl leading-relaxed">
                💡 <strong>Tip para República Dominicana:</strong> El <strong>Canal Oficial</strong> permite que miles de personas reciban las alertas sin límite y con privacidad absoluta de su número telefónico. El <strong>Grupo</strong> permite interacción comunitaria.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. X / TWITTER */}
      {activeChannel === 'twitter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 font-bold">
                  <TwitterIcon className="w-5 h-5 text-sky-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Bot Oficial para X (Twitter)</h2>
                  <p className="text-xs text-slate-500">Publica alertas inmediatas de empleo con hashtags dominicanos</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">
                  {settings.twitterActive ? 'Activo' : 'Inactivo'}
                </span>
                <button
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, twitterActive: !s.twitterActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    settings.twitterActive ? 'bg-slate-900' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.twitterActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    API Key (Consumer Key)
                  </label>
                  <input
                    type="text"
                    placeholder="x-api-key"
                    value={settings.twitterApiKey || ''}
                    onChange={(e) => setSettings({ ...settings, twitterApiKey: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 text-slate-800 bg-slate-50 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    API Key Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showTokens['tw_secret'] ? 'text' : 'password'}
                      placeholder="x-api-secret"
                      value={settings.twitterApiSecret || ''}
                      onChange={(e) => setSettings({ ...settings, twitterApiSecret: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 text-slate-800 bg-slate-50 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => toggleTokenVisibility('tw_secret')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showTokens['tw_secret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Access Token
                  </label>
                  <input
                    type="text"
                    placeholder="user-access-token"
                    value={settings.twitterAccessToken || ''}
                    onChange={(e) => setSettings({ ...settings, twitterAccessToken: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 text-slate-800 bg-slate-50 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Access Token Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showTokens['tw_access_secret'] ? 'text' : 'password'}
                      placeholder="user-access-token-secret"
                      value={settings.twitterAccessSecret || ''}
                      onChange={(e) => setSettings({ ...settings, twitterAccessSecret: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 text-slate-800 bg-slate-50 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => toggleTokenVisibility('tw_access_secret')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showTokens['tw_access_secret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Plantilla de Tweet (Límite 280 caracteres)
                  </label>
                  <span className="text-[11px] text-slate-400">Variables:</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['titulo', 'empresa', 'ubicacion', 'modalidad', 'enlace'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertVariable('twitterTemplate', tag)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-2 py-0.5 rounded-md border border-slate-200 transition cursor-pointer"
                    >
                      +{`{${tag}}`}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={4}
                  placeholder={`🚨 NUEVA VACANTE EN RD 🇩🇴\n\n💼 {titulo}\n🏢 {empresa}\n📍 {ubicacion} ({modalidad})\n\n👉 Postúlate aquí: {enlace}\n\n#EmpleosRD #TrabajoRD #QuisqueyaTalent`}
                  value={settings.twitterTemplate || ''}
                  onChange={(e) => setSettings({ ...settings, twitterTemplate: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 text-slate-800 bg-slate-50 focus:bg-white transition font-mono leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleTestChannel('TWITTER')}
                  disabled={testingChannel === 'TWITTER' || !settings.twitterApiKey || !settings.twitterAccessToken}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-800 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
                >
                  <TwitterIcon className={`w-3.5 h-3.5 text-sky-500 ${testingChannel === 'TWITTER' ? 'animate-spin' : ''}`} />
                  {testingChannel === 'TWITTER' ? 'Publicando tweet...' : 'Publicar Tweet de Prueba'}
                </button>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>

          {/* Previsualización en Mockup de X */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-black rounded-3xl p-5 shadow-xl border border-slate-800 text-white space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-white">
                  <TwitterIcon className="w-4 h-4 text-sky-400" /> Previsualización en X
                </span>
                <span className="text-[10px] text-slate-400">@QuisqueyaTalent</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-black text-xs">
                    QT
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs font-bold">
                      Quisqueya Talent <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
                    </div>
                    <div className="text-[10px] text-slate-400">@QuisqueyaTalent • Ahora</div>
                  </div>
                </div>

                <div className="text-xs text-slate-200 space-y-2 leading-relaxed">
                  <p>🚨 NUEVA VACANTE EN RD 🇩🇴</p>
                  <p>💼 {jobs[0]?.title || 'Especialista en Ciberseguridad'}</p>
                  <p>🏢 {jobs[0]?.company?.name || 'Quisqueya Talent'}</p>
                  <p>📍 {jobs[0]?.province || 'Distrito Nacional'} (Híbrido)</p>
                  <p className="text-sky-400 font-mono text-[11px]">👉 Postúlate aquí: https://quisqueyatalent.com.do/empleos/...</p>
                  <p className="text-sky-400 text-[11px]">#EmpleosRD #TrabajoRD #QuisqueyaTalent</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 p-2.5 bg-slate-900 rounded-xl">
                ℹ️ <strong>Credenciales requeridas:</strong> Crear una App gratuita en el <em>Twitter Developer Portal</em> con permisos de escritura (Read and Write).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. FACEBOOK */}
      {activeChannel === 'facebook' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  <FacebookIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Páginas de Facebook (Meta Graph API)</h2>
                  <p className="text-xs text-slate-500">Publica automáticamente en la FanPage de Quisqueya Talent</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">
                  {settings.facebookActive ? 'Activo' : 'Inactivo'}
                </span>
                <button
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, facebookActive: !s.facebookActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    settings.facebookActive ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.facebookActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Facebook Page ID (ID de la Página)
                </label>
                <input
                  type="text"
                  placeholder="Ej. 102938475610293"
                  value={settings.facebookPageId || ''}
                  onChange={(e) => setSettings({ ...settings, facebookPageId: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800 bg-slate-50 focus:bg-white transition"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Lo encuentras en la sección &quot;Información&quot; o configuración de tu página de Facebook.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Page Access Token (Token de Acceso de Página Permanente)
                </label>
                <div className="relative">
                  <input
                    type={showTokens['fb_token'] ? 'text' : 'password'}
                    placeholder="EAA..."
                    value={settings.facebookAccessToken || ''}
                    onChange={(e) => setSettings({ ...settings, facebookAccessToken: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800 bg-slate-50 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => toggleTokenVisibility('fb_token')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showTokens['fb_token'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Generado desde <em>Meta for Developers</em> (Graph API Explorer) con permisos <code>pages_manage_posts</code> y <code>pages_read_engagement</code>.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleTestChannel('FACEBOOK')}
                  disabled={testingChannel === 'FACEBOOK' || !settings.facebookPageId || !settings.facebookAccessToken}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-40 transition cursor-pointer"
                >
                  <FacebookIcon className={`w-3.5 h-3.5 ${testingChannel === 'FACEBOOK' ? 'animate-spin' : ''}`} />
                  {testingChannel === 'FACEBOOK' ? 'Publicando en Facebook...' : 'Publicar Post de Prueba'}
                </button>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>

          {/* Guía y Mockup de Facebook */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200 text-slate-900 space-y-3">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  QT
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    Quisqueya Talent <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                  </div>
                  <div className="text-[10px] text-slate-400">Publicado por Quisqueya Bot • Hace 5 min • 🌐</div>
                </div>
              </div>

              <div className="text-xs text-slate-700 space-y-2">
                <p>📢 ¡Nueva oportunidad laboral activa en Quisqueya Talent! 🇩🇴</p>
                <p>💼 <strong>Puesto:</strong> {jobs[0]?.title || 'Ejecutivo de Ventas Corporativas'}</p>
                <p>📍 <strong>Ubicación:</strong> {jobs[0]?.province || 'Santiago'} | Modalidad: Presencial</p>
                <p className="text-blue-600 text-[11px]">👉 Postúlate gratis aquí: https://quisqueyatalent.com.do/empleos/...</p>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black shrink-0">
                  QT
                </div>
                <div className="text-[11px] overflow-hidden">
                  <div className="text-slate-400 uppercase text-[9px] font-bold">quisqueyatalent.com.do</div>
                  <div className="font-bold text-slate-900 line-clamp-1">{jobs[0]?.title || 'Ver vacante en Quisqueya Talent'}</div>
                  <div className="text-slate-500 text-[10px]">Postúlate con tu CV optimizado por IA gratis</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. INSTAGRAM */}
      {activeChannel === 'instagram' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  <InstagramIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Instagram Feed (Meta Graph API)</h2>
                  <p className="text-xs text-slate-500">Publicación automática en el perfil oficial de Instagram</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">
                  {settings.instagramActive ? 'Activo' : 'Inactivo'}
                </span>
                <button
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, instagramActive: !s.instagramActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    settings.instagramActive ? 'bg-pink-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.instagramActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instagram Business Account ID
                </label>
                <input
                  type="text"
                  placeholder="Ej. 178414000000000"
                  value={settings.instagramAccountId || ''}
                  onChange={(e) => setSettings({ ...settings, instagramAccountId: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-pink-500 text-slate-800 bg-slate-50 focus:bg-white transition"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Es el ID de la cuenta comercial de Instagram vinculada a tu página de Facebook (obtenido mediante <code>GET /page-id?fields=instagram_business_account</code>).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Meta User / Page Access Token
                </label>
                <div className="relative">
                  <input
                    type={showTokens['ig_token'] ? 'text' : 'password'}
                    placeholder="Token con permisos instagram_basic e instagram_content_publish"
                    value={settings.instagramAccessToken || ''}
                    onChange={(e) => setSettings({ ...settings, instagramAccessToken: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:border-pink-500 text-slate-800 bg-slate-50 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => toggleTokenVisibility('ig_token')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showTokens['ig_token'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleTestChannel('INSTAGRAM')}
                  disabled={testingChannel === 'INSTAGRAM' || !settings.instagramAccountId || !settings.instagramAccessToken}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-pink-200 text-pink-700 bg-pink-50 hover:bg-pink-100 disabled:opacity-40 transition cursor-pointer"
                >
                  <InstagramIcon className={`w-3.5 h-3.5 ${testingChannel === 'INSTAGRAM' ? 'animate-spin' : ''}`} />
                  {testingChannel === 'INSTAGRAM' ? 'Publicando en Instagram...' : 'Publicar Post de Prueba'}
                </button>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 text-white shadow-md shadow-pink-600/20 transition cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>

          {/* Guía Instagram */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-500" /> Requisitos de Meta para Instagram
              </h3>
              <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  La cuenta de Instagram de Quisqueya Talent debe ser <strong>Profesional / Empresa</strong>.
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  Debe estar vinculada a la FanPage oficial de Facebook en Meta Business Suite.
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  La vacante debe incluir una imagen pública (el afiche generado o el logo corporativo).
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 5. DIFUSIÓN MANUAL & HISTORIAL */}
      {activeChannel === 'broadcast' && (
        <div className="space-y-6">
          {/* Difusor Inmediato */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-indigo-600" />
                  Difusión Inmediata de Vacantes Activas
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Elige una vacante y compártela de forma instantánea a todas tus redes o genera el enlace directo de WhatsApp.
                </p>
              </div>

              {/* Selector de Vacante */}
              <div className="w-full sm:w-80">
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-800 cursor-pointer"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} — {j.province}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Acciones de Difusión Inmediata */}
            {previewData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Botón WhatsApp Web Directo */}
                <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    Difundir por WhatsApp
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Abre WhatsApp Web o la App con el copy maquetado listo para enviar a tus grupos o contactos.
                  </p>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(previewData.whatsapp)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Abrir WhatsApp Web
                  </a>
                </div>

                {/* Botón X / Twitter Directo */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <TwitterIcon className="w-4 h-4 text-sky-500" />
                    Tuitear en X
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Dispara el bot o abre la ventana oficial de publicación en X con hashtags optimizados.
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleBroadcastJob('TWITTER')}
                      disabled={broadcasting || !settings.twitterActive}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white transition cursor-pointer disabled:opacity-40"
                    >
                      Bot Auto
                    </button>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(previewData.twitter)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 hover:bg-white text-slate-700 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Botón Facebook */}
                <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-800">
                    <FacebookIcon className="w-4 h-4 text-blue-600" />
                    Publicar en Facebook
                  </div>
                  <p className="text-[11px] text-blue-700">
                    Publica en la FanPage de Quisqueya Talent usando el token de Meta configurado.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleBroadcastJob('FACEBOOK')}
                    disabled={broadcasting || !settings.facebookActive}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs cursor-pointer disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" /> Publicar en FanPage
                  </button>
                </div>

                {/* Botón Difusión Masiva a Todo */}
                <div className="p-4 rounded-2xl border border-indigo-300 bg-gradient-to-br from-indigo-50 to-blue-50 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Multidifusión Total
                  </div>
                  <p className="text-[11px] text-indigo-700">
                    Despacha en simultáneo a todos los canales activos con un solo clic.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleBroadcastJob()}
                    disabled={broadcasting}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${broadcasting ? 'animate-spin' : ''}`} />
                    {broadcasting ? 'Difundiendo...' : 'Difundir a Todas'}
                  </button>
                </div>
              </div>
            )}

            {/* Resultado de la difusión manual */}
            {broadcastResult && (
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                <div className="font-bold text-slate-900">Resultado del Despacho:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(broadcastResult.results || {}).map(([chan, res]: [string, any]) => (
                    <div
                      key={chan}
                      className={`p-2 rounded-xl border text-[11px] font-bold ${
                        res.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}
                    >
                      <div>{chan}: {res.success ? '✅ Enviado' : '❌ Falló'}</div>
                      {res.error && <div className="text-[9px] font-normal text-rose-600 mt-0.5">{res.error}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Historial de Logs */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                Historial de Difusiones Realizadas
              </h3>
              <button
                type="button"
                onClick={fetchLogs}
                disabled={loadingLogs}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                Refrescar
              </button>
            </div>

            {logs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                Aún no se han registrado difusiones en redes sociales.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-3.5 py-2.5">Fecha</th>
                      <th className="px-3.5 py-2.5">Canal</th>
                      <th className="px-3.5 py-2.5">Estado</th>
                      <th className="px-3.5 py-2.5">Detalle / ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-3.5 py-2.5 whitespace-nowrap text-[11px] text-slate-400">
                          {new Date(l.createdAt).toLocaleString('es-DO')}
                        </td>
                        <td className="px-3.5 py-2.5 font-bold text-slate-800">
                          {l.channel === 'WHATSAPP' && '🟢 WhatsApp'}
                          {l.channel === 'TWITTER' && '🐦 X (Twitter)'}
                          {l.channel === 'FACEBOOK' && '📘 Facebook'}
                          {l.channel === 'INSTAGRAM' && '📸 Instagram'}
                        </td>
                        <td className="px-3.5 py-2.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              l.status === 'SUCCESS'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {l.status === 'SUCCESS' ? 'Exitoso' : 'Error'}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-[11px] text-slate-600 max-w-xs truncate">
                          {l.status === 'SUCCESS' ? (
                            <span className="font-mono text-emerald-700">ID: {l.externalPostId || 'OK'}</span>
                          ) : (
                            <span className="text-rose-600">{l.errorMessage || 'Error en envío'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

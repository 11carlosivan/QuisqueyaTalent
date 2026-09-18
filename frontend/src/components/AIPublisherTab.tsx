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
  Save,
  Activity,
  Edit3,
  X,
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
  const [instagramSessionId, setInstagramSessionId] = useState('');
  const [showSessionConfig, setShowSessionConfig] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState(false);
  const [sessionVerificationResult, setSessionVerificationResult] = useState<{
    valid?: boolean;
    message?: string;
    postsDetected?: number;
  } | null>(null);
  const [workerStatus, setWorkerStatus] = useState<any>(null);
  const [scanningAll, setScanningAll] = useState(false);
  const [scanningSourceId, setScanningSourceId] = useState<string | null>(null);

  // Manual upload state
  const [manualCaption, setManualCaption] = useState('');
  const [manualFiles, setManualFiles] = useState<File[]>([]);
  const [uploadingManual, setUploadingManual] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [publishingAll, setPublishingAll] = useState(false);

  // Queue item edit & re-extraction state
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    companyName: '',
    category: '',
    province: '',
    applyEmail: '',
    salaryMin: '',
    salaryMax: '',
    description: '',
    responsibilities: '',
    requirements: '',
    benefits: '',
    status: 'PENDING',
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [reExtractingId, setReExtractingId] = useState<string | null>(null);
  const [reExtractingAll, setReExtractingAll] = useState(false);

  // Cargar datos del publicador
  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [settingsRes, sourcesRes, queueRes, workerRes] = await Promise.all([
        fetch(`${API_URL}/api/ai/publisher/settings`, { headers: { Authorization: `Bearer ${token}` } }).then((r) =>
          r.json()
        ),
        fetch(`${API_URL}/api/ai/publisher/sources`, { headers: { Authorization: `Bearer ${token}` } }).then((r) =>
          r.json()
        ),
        fetch(`${API_URL}/api/ai/publisher/queue?status=${queueFilter}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
        fetch(`${API_URL}/api/ai/publisher/worker-status`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .catch(() => null),
      ]);

      if (!settingsRes.error) setSettings(settingsRes);
      if (Array.isArray(sourcesRes)) setSources(sourcesRes);
      if (queueRes && queueRes.items) {
        setQueue(queueRes.items);
        if (queueRes.counts) setCounts(queueRes.counts);
      }
      if (workerRes && !workerRes.error) setWorkerStatus(workerRes);
    } catch (err) {
      console.error('Error cargando publicador IA:', err);
      toast.error('No se pudieron cargar los datos del Publicador IA', 'Error de Conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('qt_ig_session_id');
      if (saved) setInstagramSessionId(saved);
    }
  }, [token, queueFilter]);

  // Si hay un escaneo en curso en el worker, consultar periódicamente hasta que termine
  useEffect(() => {
    if (!workerStatus?.isScanningSources) return;
    const interval = setInterval(() => {
      fetchData();
    }, 4000);
    return () => clearInterval(interval);
  }, [workerStatus?.isScanningSources]);

  // Evitar bloqueos CORP (ERR_BLOCKED_BY_RESPONSE.NotSameOrigin) canalizando imágenes externas de Instagram por el proxy
  const getSafeImageUrl = (url: string | null | undefined) => {
    if (!url) return '';
    const cleanUrl = url.includes(',') ? url.split(',')[0].trim() : url.trim();
    if (!cleanUrl) return '';
    if (cleanUrl.startsWith('/api/ai/publisher/proxy-image')) {
      return `${API_URL}${cleanUrl}`;
    }
    if (cleanUrl.startsWith('/')) return `${API_URL}${cleanUrl}`;
    if (cleanUrl.includes('fbcdn.net') || cleanUrl.includes('cdninstagram.com')) {
      return `${API_URL}/api/ai/publisher/proxy-image?url=${encodeURIComponent(cleanUrl)}`;
    }
    return cleanUrl;
  };

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
        body: JSON.stringify({
          profileUrl: profileInput.trim(),
          instagramSessionId: instagramSessionId.trim() || undefined,
        }),
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
          toast.warning(
            data.message || `Meta/Instagram bloqueó el acceso automatizado al perfil @${data.result.username} (error 429). Puedes pegar el enlace del post directamente (ej: https://www.instagram.com/p/...) o conectar la cookie sessionid abajo para el monitoreo automático.`,
            'Aviso de Instagram'
          );
        } else {
          toast.warning(
            data.message || 'No se detectaron publicaciones de empleo en el enlace indicado.',
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

  // Escanear todas las cuentas registradas
  const handleScanAllSources = async () => {
    try {
      setScanningAll(true);
      const res = await fetch(`${API_URL}/api/ai/publisher/scan-all-sources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          instagramSessionId: instagramSessionId.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.result?.newJobsEnqueued > 0) {
          toast.success(
            data.message || `¡Éxito! ${data.result.newJobsEnqueued} nuevas vacantes detectadas.`,
            '¡Nuevas Vacantes en Cola!'
          );
        } else if (data.result?.scanned === 0) {
          toast.warning(
            data.message || 'No hay cuentas registradas aún. Agrega un perfil arriba para comenzar.',
            'Sin Cuentas'
          );
        } else if (data.result?.blockedByInstagram > 0 && !settings?.hasInstagramSession) {
          toast.warning(
            data.message || 'Instagram bloqueó la lectura de las cuentas (error 429). Configura la cookie sessionid en la sección de autenticación para que el servidor pueda leer las publicaciones.',
            'Autenticación Requerida'
          );
          setShowSessionConfig(true);
        } else {
          toast.info(
            data.message || 'Escaneo completado. No se detectaron vacantes nuevas en este momento.',
            'Escaneo Finalizado'
          );
        }
        await fetchData();
      } else {
        toast.warning(data.error || 'No se pudo completar el escaneo', 'Aviso');
      }
    } catch (e) {
      toast.error('Error de comunicación con el servidor', 'Error de Red');
    } finally {
      setScanningAll(false);
    }
  };

  // Alternar estado activo / pausado de una cuenta individual
  const handleToggleSource = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/ai/publisher/sources/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message, 'Monitoreo Actualizado');
        await fetchData();
      } else {
        toast.error(data.error || 'Error al actualizar cuenta', 'Error');
      }
    } catch (e) {
      toast.error('Error de comunicación con el servidor', 'Error');
    }
  };

  // Escanear una cuenta específica de inmediato
  const handleScanSingleSource = async (source: any) => {
    try {
      setScanningSourceId(source.id);
      const targetUrl = source.profileUrl || source.username;
      const res = await fetch(`${API_URL}/api/ai/publisher/scan-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          profileUrl: targetUrl,
          instagramSessionId: instagramSessionId.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          data.message || `Escaneo completado para @${source.username}`,
          'Escaneo Exitoso'
        );
        await fetchData();
      } else {
        toast.error(data.error || 'Error al escanear la cuenta', 'Error');
      }
    } catch (e) {
      toast.error('Error de red al escanear cuenta', 'Error');
    } finally {
      setScanningSourceId(null);
    }
  };

  // Eliminar cuenta del monitoreo diario
  const handleDeleteSource = async (id: string, username: string) => {
    if (!confirm(`¿Deseas remover a @${username} de la lista de monitoreo diario?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/ai/publisher/sources/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success(`Cuenta @${username} removida del monitoreo diario`, 'Cuenta Eliminada');
        await fetchData();
      } else {
        toast.error('No se pudo eliminar la cuenta', 'Error');
      }
    } catch (e) {
      toast.error('Error de conexión', 'Error');
    }
  };

  // Guardar sessionid permanentemente en el servidor
  const handleSaveSessionIdToServer = async () => {
    try {
      setSavingSettings(true);
      const res = await fetch(`${API_URL}/api/ai/publisher/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ instagramSessionId: instagramSessionId.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('qt_ig_session_id', instagramSessionId.trim());
        }
        toast.success(
          'Cookie de sesión guardada permanentemente en el servidor. El worker funcionará de forma autónoma 24/7.',
          'Sesión Guardada'
        );
        await fetchData();
        // Probar automáticamente la conexión después de guardar
        handleVerifySession();
      } else {
        toast.error(data.error || 'Error al guardar cookie', 'Error');
      }
    } catch (e) {
      toast.error('Error de red al guardar sesión', 'Error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Verificar activamente la sesión de Instagram contra el servidor y Meta
  const handleVerifySession = async () => {
    try {
      setVerifyingSession(true);
      setSessionVerificationResult(null);
      const res = await fetch(`${API_URL}/api/ai/publisher/verify-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ instagramSessionId: instagramSessionId.trim() || undefined }),
      });
      const data = await res.json();
      setSessionVerificationResult(data);
      if (data.valid) {
        toast.success(data.message || 'Sesión de Instagram 100% válida y activa.', '¡Conexión Exitosa!');
      } else {
        toast.warning(data.message || 'Instagram no aceptó la sesión.', 'Sesión Inválida o Expirada');
      }
    } catch (e: any) {
      setSessionVerificationResult({ valid: false, message: 'Error de red al verificar conexión con Instagram.' });
      toast.error('Error de red al verificar sesión', 'Error');
    } finally {
      setVerifyingSession(false);
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

  // Procesar y publicar TODAS las vacantes en cola de inmediato
  const handlePublishAllPending = async () => {
    const totalToPublish = counts.pending + counts.draft;
    if (totalToPublish === 0) {
      toast.info('No hay vacantes pendientes en la cola para procesar', 'Cola Vacía');
      return;
    }
    if (
      !confirm(
        `¿Deseas procesar con IA y publicar las ${totalToPublish} vacantes en cola directamente en la bolsa de empleo ahora mismo?`
      )
    ) {
      return;
    }

    try {
      setPublishingAll(true);
      const res = await fetch(`${API_URL}/api/ai/publisher/publish-all-pending`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          data.message || 'Todas las vacantes fueron procesadas y publicadas exitosamente.',
          '🚀 Publicación en Lote Completada'
        );
        await fetchData();
      } else {
        toast.error(data.error || 'Error al procesar lote de vacantes', 'Error');
      }
    } catch (e) {
      toast.error('Error de comunicación con el servidor', 'Error de Red');
    } finally {
      setPublishingAll(false);
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

  // Abrir modal de edición de vacante en cola
  const handleOpenEdit = (item: any) => {
    let extracted: any = {};
    try {
      if (item.extractedData) extracted = JSON.parse(item.extractedData);
    } catch (e) {}

    setEditForm({
      title: extracted.title || '',
      companyName: extracted.companyName || 'Quisqueya Talent',
      category: extracted.category || 'Otros',
      province: extracted.province || 'Santo Domingo',
      applyEmail: extracted.applyEmail || '',
      salaryMin: extracted.salaryMin ? String(extracted.salaryMin) : '',
      salaryMax: extracted.salaryMax ? String(extracted.salaryMax) : '',
      description: extracted.description || item.captionText || '',
      responsibilities: extracted.responsibilities || '',
      requirements: extracted.requirements || '',
      benefits: extracted.benefits || '',
      status: item.status || 'PENDING',
    });
    setEditingItem(item);
  };

  // Guardar corrección manual de una vacante en cola
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editForm.title.trim()) {
      toast.warning('El título de la vacante es obligatorio', 'Campo Requerido');
      return;
    }

    try {
      setSavingEdit(true);
      const res = await fetch(`${API_URL}/api/ai/publisher/queue/${editingItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editForm.title.trim(),
          companyName: editForm.companyName.trim(),
          category: editForm.category.trim(),
          province: editForm.province.trim(),
          applyEmail: editForm.applyEmail.trim() || undefined,
          salaryMin: editForm.salaryMin ? Number(editForm.salaryMin) : null,
          salaryMax: editForm.salaryMax ? Number(editForm.salaryMax) : null,
          description: editForm.description.trim(),
          responsibilities: editForm.responsibilities.trim(),
          requirements: editForm.requirements.trim(),
          benefits: editForm.benefits.trim(),
          status: editForm.status,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Vacante corregida: "${editForm.title}"`, 'Cambios Guardados');
        setEditingItem(null);
        await fetchData();
      } else {
        toast.error(data.error || 'Error al guardar cambios', 'Error');
      }
    } catch (err) {
      toast.error('Error de conexión al guardar cambios', 'Error');
    } finally {
      setSavingEdit(false);
    }
  };

  // Re-analizar una vacante individual con el motor IA mejorado
  const handleReExtractSingle = async (queueId: string) => {
    try {
      setReExtractingId(queueId);
      const res = await fetch(`${API_URL}/api/ai/publisher/queue/${queueId}/re-extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        const title = data.result?.extractedData?.title || 'Vacante';
        toast.success(`Título y detalles re-analizados: "${title}"`, 'Re-análisis Exitoso');
        await fetchData();
      } else {
        toast.error(data.error || 'Error al re-analizar vacante', 'Error');
      }
    } catch (err) {
      toast.error('Error de conexión', 'Error');
    } finally {
      setReExtractingId(null);
    }
  };

  // Re-analizar en lote toda la cola para corregir títulos erróneos
  const handleReExtractAll = async () => {
    if (!confirm('¿Deseas re-analizar con IA todas las vacantes en cola para corregir automáticamente los títulos y categorías?')) {
      return;
    }
    try {
      setReExtractingAll(true);
      const res = await fetch(`${API_URL}/api/ai/publisher/queue/re-extract-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          data.message || 'Vacantes en cola actualizadas con sus títulos correctos.',
          'Re-análisis en Lote Exitoso'
        );
        await fetchData();
      } else {
        toast.error(data.error || 'Error al re-analizar lote', 'Error');
      }
    } catch (err) {
      toast.error('Error de red', 'Error');
    } finally {
      setReExtractingAll(false);
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
                src="/icono.svg"
                alt="Quisqueya Talent"
                className="w-full h-full object-contain"
                onError={(e: any) => {
                  e.target.src = '/icono.svg';
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

          {/* Botones de Acción Inmediata */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunNow}
              disabled={runningNow || publishingAll || counts.pending === 0}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 text-white px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-lg cursor-pointer disabled:cursor-not-allowed"
              title="Procesa 1 vacante de la cola y la publica"
            >
              {runningNow ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Procesando 1...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Procesar 1 Ahora
                </>
              )}
            </button>

            <button
              onClick={handleReExtractAll}
              disabled={reExtractingAll || runningNow || publishingAll || (counts.pending === 0 && counts.draft === 0)}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400 text-white px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-lg cursor-pointer disabled:cursor-not-allowed"
              title="Re-analiza todas las vacantes en cola para corregir automáticamente los títulos asignados"
            >
              {reExtractingAll ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Corrigiendo Títulos...
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5 text-indigo-200" /> Corregir Títulos con IA ({counts.pending + counts.draft})
                </>
              )}
            </button>

            <button
              onClick={handlePublishAllPending}
              disabled={publishingAll || runningNow || reExtractingAll || (counts.pending === 0 && counts.draft === 0)}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-400 text-white px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-lg cursor-pointer disabled:cursor-not-allowed"
              title="Procesa todas las vacantes en cola y las publica de inmediato en la bolsa de empleo"
            >
              {publishingAll ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Publicando Lote ({counts.pending + counts.draft})...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Publicar Todo en la Bolsa ({counts.pending + counts.draft})
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

      {/* 3. MONITOREO DIARIO 100% AUTÓNOMO DE INSTAGRAM Y PÁGINAS WEB */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
                <InstagramIcon className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-black text-slate-900 font-['Plus_Jakarta_Sans']">
                Cuentas Monitoreadas (Búsqueda Diaria 100% Automática)
              </h3>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Pega el enlace o nombre de cualquier perfil de Instagram una sola vez. Nuestro motor en segundo plano se encargará de todo: 
              buscará publicaciones diariamente, analizará los afiches con IA visual (Gemini Visión) y publicará las vacantes automáticamente.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleScanAllSources}
              disabled={scanningAll || workerStatus?.isScanningSources || sources.length === 0}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Disparar escaneo de todos los perfiles de inmediato"
            >
              {scanningAll || workerStatus?.isScanningSources ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  <span>Escaneando Cuentas...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Escanear Todas las Cuentas Ahora</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Estado Operativo del Motor en Segundo Plano */}
        <div className="bg-gradient-to-r from-slate-50 via-blue-50/40 to-indigo-50/30 border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              {settings?.isActive ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-400"></span>
              )}
            </span>
            <span className="font-bold text-slate-800">
              {settings?.isActive
                ? 'Motor Autónomo Activo: Monitoreando y publicando 24/7'
                : 'Motor en Pausa: Reanuda el publicador arriba para activar el escaneo diario'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 font-medium text-[11px]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>
                Frecuencia: <strong>Cada 12 horas</strong> (Automático)
              </span>
            </span>
            {workerStatus?.nextScanInHours !== undefined && settings?.isActive && (
              <span className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-bold">
                Próximo escaneo: ~{workerStatus.nextScanInHours}h
              </span>
            )}
          </div>
        </div>

        {/* Alerta si falta configurar la sesión de Instagram en el servidor */}
        {!settings?.hasInstagramSession ? (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h5 className="text-xs font-black text-amber-900">
                  ¿Tus cuentas muestran 0 vacantes? Falta conectar la sesión de Instagram
                </h5>
                <p className="text-[11px] text-amber-700 leading-relaxed max-w-2xl">
                  Instagram bloquea el acceso público a perfiles sin sesión (error 429), provocando que las cuentas arrojen 0 posts. Guarda tu cookie <code>sessionid</code> una sola vez en el servidor para que el motor extraiga las publicaciones diarias automáticamente.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowSessionConfig(true);
                const el = document.getElementById('instagram-session-config');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-black px-4 py-2 rounded-xl transition shadow-xs cursor-pointer shrink-0"
            >
              Configurar Cookie (sessionid)
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Sesión de Instagram autenticada en el servidor: El motor puede escanear publicaciones 24/7 sin bloqueos.</span>
            </div>
            <button
              type="button"
              onClick={() => setShowSessionConfig(!showSessionConfig)}
              className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer shrink-0"
            >
              Gestionar
            </button>
          </div>
        )}

        {/* Formulario: Extraer Vacante desde Post de Instagram, Enlaces Múltiples o Perfil */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-pink-600" /> Extraer Vacante(s) desde Instagram o Web (Post Directo, Múltiples o Perfil):
          </label>

          <form onSubmit={handleScanProfile} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={profileInput}
                onChange={(e) => setProfileInput(e.target.value)}
                placeholder="Pega link de post (ej: https://www.instagram.com/p/DdXQmpeRqtQ/), enlaces múltiples o perfil (@empleos_parati_rd)"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition shadow-2xs"
              />
            </div>

            <button
              type="submit"
              disabled={scanning || !profileInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 py-3 rounded-2xl transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer shrink-0"
            >
              {scanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Extrayendo con IA...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" /> Extraer y Encolar con IA
                </>
              )}
            </button>
          </form>
          <p className="text-[11px] text-slate-400 pl-1">
            💡 <strong>Universal:</strong> Puedes pegar enlaces directos de publicaciones de Instagram (ej: <code>https://www.instagram.com/p/...</code>), varios enlaces a la vez, o perfiles completos. La IA extraerá los datos, el afiche en alta resolución y asociará la vacante a la cuenta correspondiente.
          </p>
        </div>

        {/* Lista de Cuentas en Monitoreo Diario */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Cuentas Registradas en Monitoreo ({sources.length}):</span>
            </h4>
            <span className="text-[11px] text-slate-400">
              {sources.filter((s) => s.isActive).length} activas de {sources.length} totales
            </span>
          </div>

          {sources.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center mx-auto text-slate-500">
                <InstagramIcon className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">Aún no has registrado cuentas para monitoreo</p>
              <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                Pega el link de cualquier cuenta de Instagram o portal de empleo en el campo de arriba para que el backend empiece a buscar publicaciones diariamente de forma 100% automática.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sources.map((s) => {
                const isWeb = s.username.includes('.') || !s.profileUrl.includes('instagram.com');
                const lastDate = s.lastScannedAt ? new Date(s.lastScannedAt).toLocaleString() : 'Pendiente';
                const isThisScanning = scanningSourceId === s.id;

                return (
                  <div
                    key={s.id}
                    className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                      s.isActive
                        ? 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                        : 'bg-slate-50/80 border-slate-200/60 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isWeb
                              ? 'bg-blue-50 text-blue-600 border border-blue-100'
                              : 'bg-pink-50 text-pink-600 border border-pink-100'
                          }`}
                        >
                          {isWeb ? <Globe className="w-4 h-4" /> : <InstagramIcon className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-xs text-slate-900 truncate">
                              {isWeb ? s.username : `@${s.username}`}
                            </span>
                            <a
                              href={s.profileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-blue-600 transition shrink-0"
                              title="Ver perfil original"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                            {s.profileUrl}
                          </p>
                        </div>
                      </div>

                      {/* Botón de alternar activo/pausado */}
                      <button
                        type="button"
                        onClick={() => handleToggleSource(s.id)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition cursor-pointer shrink-0 ${
                          s.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                        title={s.isActive ? 'Pausar monitoreo diario' : 'Reanudar monitoreo diario'}
                      >
                        {s.isActive ? '🟢 Activo' : '⏸️ Pausado'}
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>Último escaneo: {lastDate}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>{s._count?.queueItems || 0} vacantes en cola</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleScanSingleSource(s)}
                          disabled={isThisScanning}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title="Volver a escanear esta cuenta ahora"
                        >
                          {isThisScanning ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                          <span>Re-escanear</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSource(s.id, s.username)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-rose-50 cursor-pointer"
                          title="Remover de monitoreo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Configuración de Sesión de Instagram (sessionid) para evitar bloqueos 24/7 */}
        <div id="instagram-session-config" className="pt-4 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <InstagramIcon className="w-4 h-4 text-pink-600" />
                <h5 className="text-xs font-bold text-slate-800">
                  Autenticación de Instagram en el Servidor (sessionid)
                </h5>
                {settings?.hasInstagramSession ? (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Guardada en Servidor
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-600" /> No configurada
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowSessionConfig(!showSessionConfig)}
                className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                {showSessionConfig ? 'Ocultar ajustes de sesión' : 'Configurar / Actualizar cookie'}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Instagram limita el acceso público anónimo con <code>429 Too Many Requests</code>. Para que el servidor pueda conectarse 24/7 de forma autónoma sin depender de tu navegador, puedes guardar la cookie <code>sessionid</code> de cualquier cuenta de Instagram en el backend.
            </p>

            {showSessionConfig && (
              <div className="space-y-3 pt-2 border-t border-slate-200/60">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="password"
                    value={instagramSessionId}
                    onChange={(e) => {
                      setInstagramSessionId(e.target.value);
                      setSessionVerificationResult(null);
                    }}
                    placeholder="Pega aquí el valor de la cookie sessionid (ej: 68429184%3AKu28...)"
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={handleSaveSessionIdToServer}
                    disabled={savingSettings || !instagramSessionId.trim()}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{savingSettings ? 'Guardando...' : 'Guardar en Servidor'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleVerifySession}
                    disabled={verifyingSession || (!instagramSessionId.trim() && !settings?.hasInstagramSession)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {verifyingSession ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Probando...</span>
                      </>
                    ) : (
                      <>
                        <Activity className="w-3.5 h-3.5 text-amber-300" />
                        <span>Probar Conexión</span>
                      </>
                    )}
                  </button>

                  {instagramSessionId && (
                    <button
                      type="button"
                      onClick={() => {
                        setInstagramSessionId('');
                        setSessionVerificationResult(null);
                        if (typeof window !== 'undefined') {
                          localStorage.removeItem('qt_ig_session_id');
                        }
                        handleSaveSessionIdToServer();
                      }}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Banner de Diagnóstico en Tiempo Real */}
                {sessionVerificationResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                      sessionVerificationResult.valid
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        : 'bg-rose-50 text-rose-900 border-rose-300'
                    }`}
                  >
                    {sessionVerificationResult.valid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <p className="font-bold">
                        {sessionVerificationResult.valid
                          ? '✅ Verificación Exitosa con Instagram'
                          : '⚠️ Fallo de Autenticación con Instagram'}
                      </p>
                      <p className="text-[11px] leading-relaxed opacity-90">
                        {sessionVerificationResult.message}
                      </p>
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-slate-400">
                  💡 <strong>¿Cómo obtenerla?</strong> Abre <code>instagram.com</code> en tu navegador, pulsa <code>F12</code> &gt; pestaña <strong>Application</strong> (o Almacenamiento) &gt; <strong>Cookies</strong> &gt; copia el valor de <strong>sessionid</strong>.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Zona Opcional: Subida Manual de Capturas / Screenshots (Alternativa si ya tienes las fotos) */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-blue-600" /> ¿Tienes capturas o imágenes guardadas en tu computadora? (Opcional)
            </span>
            <button
              type="button"
              onClick={() => setShowManualForm(!showManualForm)}
              className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
            >
              {showManualForm ? 'Ocultar subida manual' : 'Subir imágenes locales'}
            </button>
          </div>

          {showManualForm && (
            <div className="bg-gradient-to-br from-blue-50/50 via-slate-50 to-indigo-50/30 border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-3xl p-6 sm:p-8 text-center transition space-y-4">
              <div className="max-w-md mx-auto space-y-2">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-xs border border-blue-100 flex items-center justify-center mx-auto text-blue-600">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className="font-black text-slate-900 text-sm">
                  Arrastra aquí tus capturas o flyers de empleo
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Selecciona una o varias imágenes locales. La IA analizará cada afiche y extraerá todos los datos.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <label className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 py-2.5 rounded-2xl shadow-md shadow-blue-600/20 transition cursor-pointer flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" />
                  Seleccionar Imágenes ({manualFiles.length > 0 ? `${manualFiles.length} seleccionadas` : 'Buscar en mi equipo'})
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
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-6 py-2.5 rounded-2xl shadow-md shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
          )}
        </div>
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

        {/* Banner Explicativo: Por qué están en cola y cómo publicarlas */}
        <div className="bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/50 border border-blue-200/70 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 text-blue-700 mt-0.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div className="space-y-1 text-xs">
            <h5 className="font-black text-slate-900 flex items-center gap-2">
              <span>¿Cómo funciona el flujo de vacantes extraídas?</span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                {counts.pending} vacantes listas para publicar
              </span>
            </h5>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Al escanear tus perfiles de Instagram, los posts se guardan de forma segura aquí en la <strong>Cola de Espera</strong>. Para que aparezcan en la bolsa de empleo pública de Quisqueya Talent, pulsa el botón verde superior <strong>"⚡ Publicar Todo en la Bolsa ({counts.pending})"</strong> para publicarlas todas de golpe, o pulsa <strong>"Procesar 1 Ahora"</strong> para publicarlas una a una.
            </p>
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
                      {item.imageUrl ? (
                        <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0 overflow-hidden border border-slate-200 relative group">
                          <img
                            src={getSafeImageUrl(item.imageUrl)}
                            alt="Post Instagram"
                            className="w-full h-full object-cover"
                            onError={(e: any) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          {item.imageUrl.includes(',') && (
                            <span className="absolute bottom-1 right-1 bg-black/75 backdrop-blur-xs text-white text-[9px] font-black px-1.5 py-0.2 rounded-md shadow-xs flex items-center gap-0.5">
                              📸 {item.imageUrl.split(',').filter(Boolean).length}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-200/80 shrink-0 flex items-center justify-center p-2">
                          <img src="/icono.svg" alt="Quisqueya Talent" className="w-full h-full object-contain" />
                        </div>
                      )}

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200/80 px-2 py-0.5 rounded-md text-[10px] font-black">
                            <img src="/icono.svg" alt="QT" className="w-3 h-3 object-contain" />
                            Quisqueya Talent
                          </span>
                          {extracted?.category && (
                            <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                              {extracted.category}
                            </span>
                          )}
                        </div>

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

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-bold text-xs px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                        title="Corregir título, empresa o detalles manualmente"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReExtractSingle(item.id)}
                        disabled={reExtractingId === item.id}
                        className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-bold text-xs px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Re-analizar texto con IA para corregir el título automáticamente"
                      >
                        {reExtractingId === item.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Bot className="w-3.5 h-3.5" />
                        )}
                        <span>Re-analizar</span>
                      </button>

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

      {/* 5. MODAL DE EDICIÓN / CORRECCIÓN MANUAL DE VACANTE EN COLA */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header del modal */}
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-base">Corregir Datos de la Vacante</h4>
                  <p className="text-xs text-slate-400">Ajusta el título, empresa o detalles antes de publicar</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Badge oficial Quisqueya Talent */}
              <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-200/80 rounded-2xl p-3">
                <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center border border-blue-100 shrink-0 shadow-2xs">
                  <img src="/icono.svg" alt="Quisqueya Talent" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="text-xs font-black text-blue-950 flex items-center gap-1">
                    Publicación Oficial Quisqueya Talent <span className="text-blue-600 text-[11px]">✓</span>
                  </span>
                  <p className="text-[11px] text-blue-700">
                    Esta vacante se publicará con el ícono y la verificación oficial de Quisqueya Talent
                  </p>
                </div>
              </div>

              {/* Vista previa del afiche/imágenes del post (carrusel de múltiples fotos) */}
              {editingItem.imageUrl && (() => {
                const images = editingItem.imageUrl.split(',').map((u: string) => u.trim()).filter(Boolean);
                return (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        Afiches de la Vacante {images.length > 1 ? `(${images.length} fotos en carrusel)` : '(Fuente Principal)'}
                      </span>
                      <span className="text-[10px] text-slate-400">Clic en cualquier foto para ampliar</span>
                    </div>
                    <div className="flex gap-2.5 overflow-x-auto pb-1">
                      {images.map((imgUrl: string, idx: number) => (
                        <div
                          key={idx}
                          className="w-18 h-18 rounded-xl bg-white border border-slate-300 overflow-hidden shrink-0 relative group shadow-2xs"
                        >
                          <img
                            src={getSafeImageUrl(imgUrl)}
                            alt={`Diapositiva ${idx + 1}`}
                            className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition"
                            onClick={() => window.open(getSafeImageUrl(imgUrl), '_blank')}
                            title={`Clic para ver foto ${idx + 1} en tamaño completo`}
                          />
                          {images.length > 1 && (
                            <span className="absolute bottom-1 right-1 bg-black/75 backdrop-blur-xs text-white text-[9px] font-black px-1.5 py-0.2 rounded-md">
                              #{idx + 1}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      La IA consolida requisitos, horario, beneficios y forma de postulación leyendo todas las fotos del carrusel.
                    </p>
                  </div>
                );
              })()}

              {/* Texto original de Instagram */}
              {editingItem.captionText && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Texto original capturado de Instagram:
                  </span>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed italic">
                    "{editingItem.captionText}"
                  </p>
                </div>
              )}

              {/* Título de la Vacante */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Título del Puesto <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Panadero / Repostero, Chofer Cat. 3, Cajera..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Empresa y Categoría */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={editForm.companyName}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Quisqueya Talent o Empresa cliente"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Categoría
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Alimentos & Gastronomía">Alimentos & Gastronomía</option>
                    <option value="Logística & Transporte">Logística & Transporte</option>
                    <option value="Logística & Operaciones">Logística & Operaciones</option>
                    <option value="Ventas & Comercio">Ventas & Comercio</option>
                    <option value="Salud & Medicina">Salud & Medicina</option>
                    <option value="Mantenimiento & Limpieza">Mantenimiento & Limpieza</option>
                    <option value="Seguridad">Seguridad</option>
                    <option value="Administración & Oficina">Administración & Oficina</option>
                    <option value="Banca & Finanzas">Banca & Finanzas</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Call Center & BPO">Call Center & BPO</option>
                    <option value="Tecnología">Tecnología</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
              </div>

              {/* Provincia y Correo de Aplicación */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Provincia
                  </label>
                  <input
                    type="text"
                    value={editForm.province}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, province: e.target.value }))}
                    placeholder="Santo Domingo, Santiago, etc."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Correo para enviar CV (Opcional)
                  </label>
                  <input
                    type="email"
                    value={editForm.applyEmail}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, applyEmail: e.target.value }))}
                    placeholder="ejemplo@correo.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Salarios */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Salario Mínimo (DOP)
                  </label>
                  <input
                    type="number"
                    value={editForm.salaryMin}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, salaryMin: e.target.value }))}
                    placeholder="Ej: 30000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Salario Máximo (DOP)
                  </label>
                  <input
                    type="number"
                    value={editForm.salaryMax}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, salaryMax: e.target.value }))}
                    placeholder="Ej: 35000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 leading-relaxed"
                />
              </div>

              {/* Botones de acción del modal */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" /> Guardar Corrección
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

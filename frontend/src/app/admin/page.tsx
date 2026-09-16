'use client';

import { API_URL } from '@/lib/api';
import { toast } from '@/components/Toast';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import {
  ShieldCheck,
  TrendingUp,
  Users,
  Briefcase,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Building2,
  Sparkles,
  Loader2,
  Save,
  Check,
  Eye,
  ExternalLink,
  Cloud,
  HardDrive,
  ShieldAlert,
  Trash2,
  Bot,
} from 'lucide-react';
import AIPublisherTab from '@/components/AIPublisherTab';

export default function AdminDashboardPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [metrics, setMetrics] = useState<any>(null);
  const [adSlots, setAdSlots] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [storageGuard, setStorageGuard] = useState<any>(null);
  const [savingStorage, setSavingStorage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ai-publisher' | 'ads' | 'moderation' | 'companies' | 'storage' | 'system'>('ai-publisher');
  const [cleaningSystem, setCleaningSystem] = useState(false);

  const fetchAdminData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [m, ads, j, c, st] = await Promise.all([
        fetch(`${API_URL}/api/admin/metrics`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch(`${API_URL}/api/ads/admin/all`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch(`${API_URL}/api/admin/jobs`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch(`${API_URL}/api/admin/companies`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch(`${API_URL}/api/admin/storage`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      ]);
      setMetrics(m);
      if (Array.isArray(ads)) setAdSlots(ads);
      if (Array.isArray(j)) setJobs(j);
      if (Array.isArray(c)) setCompanies(c);
      if (st && !st.error) setStorageGuard(st);
    } catch (err) {
      console.error('Error cargando datos de admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN'))) {
      toast.warning('Esta área requiere permisos de Administrador. Se ha redirigido por seguridad.', 'Acceso Restringido');
      router.push('/auth/login');
      return;
    }

    if (token) {
      fetchAdminData();
    }
  }, [user, token, isLoading]);

  // Limpiar todos los datos demo de producción
  const handleCleanDemoData = async () => {
    const confirmed = window.confirm(
      '⚠️ ATENCIÓN: ¿Estás seguro de que deseas eliminar todas las empresas, vacantes, postulaciones y usuarios de prueba?\n\nEsta acción dejará el sistema completamente limpio y únicamente conservará tu cuenta de Super Administrador (carlosivancastillofeliz@gmail.com).'
    );
    if (!confirmed) return;

    try {
      setCleaningSystem(true);
      const res = await fetch(`${API_URL}/api/admin/clean-demo-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Sistema limpio con éxito.', 'Limpieza Completada');
        await fetchAdminData();
      } else {
        toast.error(data.error || 'No se pudo realizar la limpieza.', 'Error');
      }
    } catch (e: any) {
      console.error(e);
      toast.error('Error al comunicarse con el servidor.', 'Error de Conexión');
    } finally {
      setCleaningSystem(false);
    }
  };

  // Activar / Desactivar Guardián de Almacenamiento Anti-Cobros (Cloudflare R2)
  const handleToggleStorageGuard = async (active: boolean) => {
    try {
      setSavingStorage(true);
      const res = await fetch(`${API_URL}/api/admin/storage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isGuardActive: active }),
      });
      const data = await res.json();
      if (res.ok && data.guard) {
        setStorageGuard(data.guard);
        if (active) {
          toast.success('Protección Anti-Cobros ACTIVADA: Si se alcanza el 90% de los 10 GB gratuitos, se detendrán nuevas subidas.', 'Guardián R2');
        } else {
          toast.warning('Protección Anti-Cobros DESACTIVADA: El sistema permitirá subidas según la política de Cloudflare.', 'Guardián R2');
        }
      }
    } catch (e) {
      console.error(e);
      toast.error('Error al actualizar el estado de protección de almacenamiento', 'Error R2');
    } finally {
      setSavingStorage(false);
    }
  };

  // Guardar configuración de un slot de AdSense
  const handleUpdateAdSlot = async (slot: any) => {
    try {
      const res = await fetch(`${API_URL}/api/ads/admin/${slot.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(slot),
      });
      if (res.ok) {
        toast.success(`Posición publicitaria [${slot.slotCode}] guardada con éxito.`, 'AdSense Guardado');
      }
    } catch (e) {
      console.error(e);
      toast.error('No se pudo guardar la posición publicitaria.', 'Error');
    }
  };

  // Moderar vacante
  const handleModerateJob = async (jobId: string, status: string, featured?: boolean) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/jobs/${jobId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, featured }),
      });
      if (res.ok) {
        toast.success('Estado de la vacante actualizado correctamente.', 'Moderación');
        setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status, ...(featured !== undefined && { featured }) } : j)));
      }
    } catch (e) {
      console.error(e);
      toast.error('No se pudo actualizar el estado de la vacante.', 'Error de Moderación');
    }
  };

  // Alternar verificación de empresa
  const handleToggleVerifyCompany = async (companyId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/companies/${companyId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isVerified: !currentStatus }),
      });
      if (res.ok) {
        setCompanies((prev) =>
          prev.map((c) => (c.id === companyId ? { ...c, isVerified: !currentStatus } : c))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Banner Admin Diferenciado */}
        <div className="bg-[#001428] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                🛡️ Super Admin
              </span>
              <span className="text-xs text-sky-300 font-medium">
                Control Operativo de Quisqueya Talent
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-['Plus_Jakarta_Sans']">
              Centro de Mando Administrativo & AdManager
            </h1>
            <p className="text-xs text-slate-400">
              Gestión de ingresos publicitarios con Google AdSense, auditoría de empresas dominicanas y moderación laboral
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="block text-[11px] text-slate-400 font-bold uppercase">Sesión activa:</span>
              <span className="block text-xs font-bold text-amber-400">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Métricas Globales */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Usuarios Totales
            </div>
            <div className="text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
              {metrics?.totalUsers || 3}
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Candidatos
            </div>
            <div className="text-2xl font-black text-blue-600 font-['Plus_Jakarta_Sans']">
              {metrics?.totalCandidates || 1}
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Empresas
            </div>
            <div className="text-2xl font-black text-indigo-600 font-['Plus_Jakarta_Sans']">
              {metrics?.totalCompanies || companies.length || 3}
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Vacantes Publicadas
            </div>
            <div className="text-2xl font-black text-blue-600 font-['Plus_Jakarta_Sans']">
              {metrics?.publishedJobs || jobs.length || 4}
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Postulaciones
            </div>
            <div className="text-2xl font-black text-amber-600 font-['Plus_Jakarta_Sans']">
              {metrics?.totalApplications || 1}
            </div>
          </div>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ai-publisher')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'ai-publisher'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bot className="w-4 h-4 text-amber-300" /> 🤖 Publicador IA (Instagram)
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
              AUTO
            </span>
          </button>
          <button
            onClick={() => setActiveTab('ads')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'ads'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <DollarSign className="w-4 h-4" /> Gestor de Publicidad Google AdSense
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'moderation'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Moderación de Vacantes ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'companies'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4" /> Empresas & RNC ({companies.length})
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'storage'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Cloud className="w-4 h-4" /> Almacenamiento & Costo $0
            {storageGuard?.isGuardActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'system'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Trash2 className="w-4 h-4" /> Mantenimiento & Limpieza
          </button>
        </div>

        {/* PESTAÑA: PUBLICADOR IA DE VACANTES (INSTAGRAM) */}
        {activeTab === 'ai-publisher' && token && <AIPublisherTab token={token} />}

        {/* PESTAÑA 1: ADSLOT MANAGER (GOOGLE ADSENSE) */}
        {activeTab === 'ads' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#001428] font-['Plus_Jakarta_Sans']">
                Configuración de Posiciones AdSense (AdSlot Manager)
              </h2>
              <p className="text-xs text-slate-500">
                Activa, pausa o reemplaza códigos de anuncios de Google sin modificar el código fuente de las páginas.
              </p>
            </div>

            <div className="space-y-4">
              {adSlots.map((slot, idx) => (
                <div
                  key={slot.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">{slot.name}</span>
                        <code className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          {slot.slotCode}
                        </code>
                      </div>
                      <span className="text-xs text-slate-500">{slot.pageLocation}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={slot.isActive}
                          onChange={(e) => {
                            const updated = [...adSlots];
                            updated[idx].isActive = e.target.checked;
                            setAdSlots(updated);
                          }}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                        {slot.isActive ? 'Activo' : 'Desactivado'}
                      </label>

                      <button
                        type="button"
                        onClick={() => handleUpdateAdSlot(slot)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" /> Guardar
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Google Publisher ID
                      </label>
                      <input
                        type="text"
                        value={slot.publisherId || ''}
                        onChange={(e) => {
                          const updated = [...adSlots];
                          updated[idx].publisherId = e.target.value;
                          setAdSlots(updated);
                        }}
                        placeholder="ca-pub-1234567890123456"
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Ad Slot ID
                      </label>
                      <input
                        type="text"
                        value={slot.slotId || ''}
                        onChange={(e) => {
                          const updated = [...adSlots];
                          updated[idx].slotId = e.target.value;
                          setAdSlots(updated);
                        }}
                        placeholder="1234567890"
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA 2: MODERACIÓN DE VACANTES */}
        {activeTab === 'moderation' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#001428] font-['Plus_Jakarta_Sans']">
                Auditoría y Moderación Antifraude
              </h2>
              <p className="text-xs text-slate-500">
                Supervisa que las vacantes cumplan el Código de Trabajo de RD y no contengan estafas o cobro a candidatos.
              </p>
            </div>

            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{job.title}</span>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">
                        {job.status}
                      </span>
                      {job.featured && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          Destacada
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex flex-wrap gap-2">
                      <span className="font-semibold text-slate-700">{job.company?.name}</span>
                      <span>•</span>
                      <span>📍 {job.province}</span>
                      <span>•</span>
                      <span>Recepción: {job.applyMethod === 'EMAIL' ? `Correo (${job.applyEmail})` : 'Plataforma'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleModerateJob(job.id, 'PUBLISHED', true)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      Destacar
                    </button>
                    <button
                      onClick={() => handleModerateJob(job.id, 'PAUSED')}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      Pausar
                    </button>
                    <button
                      onClick={() => handleModerateJob(job.id, 'REJECTED')}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      Rechazar
                    </button>
                    <Link
                      href={`/empleos/${job.slug}`}
                      target="_blank"
                      className="p-1.5 text-slate-400 hover:text-slate-700"
                      title="Ver vacante"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA 3: EMPRESAS & RNC */}
        {activeTab === 'companies' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#001428] font-['Plus_Jakarta_Sans']">
                Empresas Registradas & Verificación de RNC
              </h2>
              <p className="text-xs text-slate-500">
                Audita la autenticidad corporativa de las empresas antes de permitirles publicar masivamente.
              </p>
            </div>

            <div className="space-y-4">
              {companies.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{c.name}</span>
                      {c.isVerified ? (
                        <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-200">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" /> Verificada
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Pendiente Verificación
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex flex-wrap gap-2">
                      <span>RNC: <strong className="text-slate-700">{c.rnc || 'No registrado'}</strong></span>
                      <span>•</span>
                      <span>Sector: {c.industry}</span>
                      <span>•</span>
                      <span>📍 {c.province || 'RD'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleToggleVerifyCompany(c.id, c.isVerified)}
                      className={`text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer ${
                        c.isVerified
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                      }`}
                    >
                      {c.isVerified ? 'Quitar Verificación' : 'Verificar Empresa ✓'}
                    </button>
                    <Link
                      href={`/empresas/${c.slug}`}
                      target="_blank"
                      className="p-2 text-slate-400 hover:text-slate-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA 4: STORAGE & COST GUARD (CLOUDFLARE R2) */}
        {activeTab === 'storage' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">☁️</span>
                    <h2 className="text-lg font-bold text-[#001428] font-['Plus_Jakarta_Sans']">
                      Guardián de Almacenamiento & Costo $0 (Cloudflare R2)
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 max-w-xl">
                    Monitorea el espacio consumido por fotos de perfil y certificados para evitar que alcances el límite mensual de 10 GB y garantizar que nunca se te aplique ningún cobro.
                  </p>
                </div>

                {/* Switch de activación */}
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="text-right">
                    <span className="block text-xs font-bold text-slate-900">
                      {storageGuard?.isGuardActive ? 'Protección Activa' : 'Protección Desactivada'}
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      {storageGuard?.isGuardActive ? 'Detiene subidas al 90%' : 'Permite subidas sin tope'}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={savingStorage}
                    onClick={() => handleToggleStorageGuard(!storageGuard?.isGuardActive)}
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      storageGuard?.isGuardActive ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        storageGuard?.isGuardActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Barra de progreso de almacenamiento */}
              {storageGuard && (
                <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <HardDrive className="w-4 h-4 text-blue-600" />
                      Espacio utilizado en Cloudflare R2
                    </span>
                    <span className="text-slate-900 font-mono">
                      {(storageGuard.usedStorageBytes / (1024 * 1024)).toFixed(2)} MB / {(storageGuard.maxStorageBytes / (1024 * 1024 * 1024)).toFixed(1)} GB
                    </span>
                  </div>

                  {/* Barra visual */}
                  <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        (storageGuard.usedStorageBytes / storageGuard.maxStorageBytes) > 0.85
                          ? 'bg-rose-500'
                          : (storageGuard.usedStorageBytes / storageGuard.maxStorageBytes) > 0.6
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.max(
                          2,
                          Math.min(100, (storageGuard.usedStorageBytes / storageGuard.maxStorageBytes) * 100)
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    <span>Límite gratuito total de Cloudflare: <strong>10.0 GB/mes</strong></span>
                    <span>Tope de seguridad configurado: <strong>{(storageGuard.maxStorageBytes / (1024 * 1024 * 1024)).toFixed(1)} GB</strong></span>
                  </div>
                </div>
              )}

              {/* Estadísticas y detalles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Archivos en la Nube
                  </div>
                  <div className="text-xl font-black text-slate-900">
                    {storageGuard?.totalFilesUploaded || 0} archivos
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Avatares, certificados y logos</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Límite por Archivo
                  </div>
                  <div className="text-xl font-black text-blue-600">
                    {((storageGuard?.maxFileSizeBytes || 3145728) / (1024 * 1024)).toFixed(0)} MB máx.
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Evita archivos excesivamente pesados</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Bucket de R2
                  </div>
                  <div className="text-sm font-black text-indigo-600 font-mono truncate">
                    quisqueyatalent-storage
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Región automática con CDN global</p>
                </div>
              </div>

              {/* Alerta de garantía costo cero */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 space-y-1">
                  <strong className="block font-bold">Garantía de Costo $0 activa</strong>
                  <p className="text-emerald-800 leading-relaxed">
                    Mientras la opción <strong>Protección Activa</strong> esté encendida, el servidor rechazará automáticamente cualquier archivo que pudiera hacer que la cuenta sobrepase los 9.0 GB. De esta manera, tu tarjeta registrada en Cloudflare nunca recibirá un cobro imprevisto.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 5: MANTENIMIENTO DEL SISTEMA Y LIMPIEZA DE DEMO */}
        {activeTab === 'system' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-rose-100 text-rose-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Zona de Super Admin
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#001428] font-['Plus_Jakarta_Sans']">
                Mantenimiento y Purga de Datos Demo
              </h2>
              <p className="text-xs text-slate-500">
                Herramientas administrativas de bajo nivel para depurar la base de datos de producción antes del lanzamiento oficial.
              </p>
            </div>

            {/* Tarjeta de Limpieza Completa */}
            <div className="p-6 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-rose-900">
                    Limpieza de Datos de Demostración (Producción)
                  </h3>
                  <p className="text-xs text-rose-700 leading-relaxed">
                    Esta acción eliminará de forma irreversible todas las empresas ficticias (Altice Dominicana, Banco BHD, Concentrix), todas sus vacantes publicadas, postulaciones de prueba y los usuarios demo.
                  </p>
                </div>
              </div>

              {/* Lo que se conserva */}
              <div className="bg-white p-4 rounded-xl border border-rose-200/70 text-xs space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Cuenta que se preservará y mantendrá intacta:
                </div>
                <div className="pl-6 space-y-1 text-slate-600">
                  <div>
                    <strong>Super Administrador:</strong> <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px] font-mono">carlosivancastillofeliz@gmail.com</code>
                  </div>
                  <div>
                    <strong>Contraseña garantizada:</strong> <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px] font-mono">11712Ivandi</code>
                  </div>
                  <div>
                    <strong>Rol:</strong> <span className="text-emerald-700 font-bold">SUPER_ADMIN</span> (Acceso total e irrestricto a la plataforma)
                  </div>
                </div>
              </div>

              {/* Botón de Ejecución */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-[11px] text-rose-600 font-medium">
                  ⚠️ Se solicitará confirmación antes de proceder.
                </p>
                <button
                  type="button"
                  onClick={handleCleanDemoData}
                  disabled={cleaningSystem}
                  className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[42px]"
                >
                  {cleaningSystem ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Limpiando base de datos...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Limpiar Todo y Dejar Solo Mi Super Admin
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

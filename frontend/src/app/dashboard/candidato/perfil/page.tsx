'use client';

import { API_URL } from '@/lib/api';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth-context';
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar,
  Plus,
  Trash2,
  Edit3,
  UploadCloud,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  Camera,
  ChevronRight,
  Download,
  Building2,
  Loader2,
  X,
  Sparkles,
  Share2,
  FileCheck,
  Lock,
  Unlock,
  RefreshCw,
} from 'lucide-react';

const LinkedInIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const GithubIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

export default function CandidateProfilePage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [primaryResume, setPrimaryResume] = useState<any>(null);
  const [allResumes, setAllResumes] = useState<any[]>([]);

  // Modales
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [addExpOpen, setAddExpOpen] = useState(false);
  const [addEduOpen, setAddEduOpen] = useState(false);
  const [addCertOpen, setAddCertOpen] = useState(false);

  // Estados de formulario de edición de perfil
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    headline: '',
    bio: '',
    province: 'Santo Domingo',
    city: '',
    phone: '',
    linkedinUrl: '',
    portfolioUrl: '',
    githubUrl: '',
    avatarUrl: '',
  });

  // Estados de formularios secundarios
  const [expForm, setExpForm] = useState({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    city: 'Santo Domingo',
    description: '',
  });

  const [eduForm, setEduForm] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
  });

  const [certForm, setCertForm] = useState({
    name: '',
    issuingOrganization: '',
    issueDate: '',
    credentialUrl: '',
    fileUrl: '',
  });

  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const fetchProfileData = async (authToken: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/candidates/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setPrimaryResume(data.primaryResume);
        setAllResumes(data.allResumes || []);

        if (data.profile) {
          setProfileForm({
            firstName: data.profile.firstName || '',
            lastName: data.profile.lastName || '',
            headline: data.profile.headline || '',
            bio: data.profile.bio || '',
            province: data.profile.province || 'Santo Domingo',
            city: data.profile.city || '',
            phone: data.profile.phone || '',
            linkedinUrl: data.profile.linkedinUrl || '',
            portfolioUrl: data.profile.portfolioUrl || '',
            githubUrl: data.profile.githubUrl || '',
            avatarUrl: data.profile.avatarUrl || '',
          });
        }
      }
    } catch (err) {
      console.error('Error al cargar perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }
    if (token) {
      fetchProfileData(token);
    }
  }, [user, token, isLoading]);

  const [isSyncing, setIsSyncing] = useState(false);

  // Sincronizar datos del CV al Perfil
  const handleSyncFromResume = async () => {
    if (!token) return;
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_URL}/api/candidates/sync-from-resume`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchProfileData(token);
        setFeedback({ text: '¡Perfil sincronizado exitosamente con tu currículum!', type: 'success' });
      } else {
        const data = await res.json();
        setFeedback({ text: data.error || 'Error al sincronizar con el currículum', type: 'error' });
      }
    } catch {
      setFeedback({ text: 'Error de conexión al sincronizar con tu currículum', type: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  // Alternar privacidad (Público / Privado)
  const handleTogglePrivacy = async () => {
    if (!token) return;
    const newStatus = !profile?.isPublic;
    try {
      const res = await fetch(`${API_URL}/api/candidates/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublic: newStatus }),
      });
      if (res.ok) {
        setProfile((prev: any) => ({ ...prev, isPublic: newStatus }));
        setFeedback({
          text: newStatus
            ? 'Tu perfil ahora es PÚBLICO y visible para empresas y reclutadores.'
            : 'Tu perfil ahora es PRIVADO. Solo se compartirá cuando apliques.',
          type: 'success',
        });
      }
    } catch {
      setFeedback({ text: 'Error al cambiar visibilidad de perfil', type: 'error' });
    }
  };

  // Guardar Cambios en Perfil General
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/candidates/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setEditProfileOpen(false);
        setFeedback({ text: '¡Perfil actualizado exitosamente!', type: 'success' });
      } else {
        const data = await res.json();
        setFeedback({ text: data.error || 'Error al guardar perfil', type: 'error' });
      }
    } catch (err) {
      setFeedback({ text: 'Error al conectar con el servidor', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Subir Avatar de Perfil
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setFeedback({ text: 'Subiendo foto de perfil...', type: 'success' });
      const res = await fetch(`${API_URL}/api/candidates/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const newAvatarUrl = data.imageUrl?.startsWith('http') ? data.imageUrl : `${API_URL}${data.imageUrl}`;
        setProfileForm((prev) => ({ ...prev, avatarUrl: newAvatarUrl }));

        // Guardar de inmediato
        await fetch(`${API_URL}/api/candidates/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...profileForm, avatarUrl: newAvatarUrl }),
        });

        await fetchProfileData(token);
        setFeedback({ text: '¡Foto de perfil actualizada!', type: 'success' });
      } else {
        const data = await res.json();
        setFeedback({ text: data.error || 'Error al subir foto de perfil', type: 'error' });
      }
    } catch (err: any) {
      setFeedback({ text: err.message || 'Error al subir foto de perfil', type: 'error' });
    }
  };

  // Subir Archivo de Certificado (PDF o Imagen)
  const handleCertificateFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('certificate', file);

    try {
      const res = await fetch(`${API_URL}/api/candidates/upload-certificate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const finalFileUrl = data.fileUrl?.startsWith('http') ? data.fileUrl : `${API_URL}${data.fileUrl}`;
        setCertForm((prev) => ({ ...prev, fileUrl: finalFileUrl }));
        setUploadedFileName(data.fileName);
        setFeedback({ text: '¡Documento del certificado subido correctamente!', type: 'success' });
      } else {
        const data = await res.json();
        setFeedback({ text: data.error || 'Error al subir archivo', type: 'error' });
      }
    } catch (err: any) {
      setFeedback({ text: err.message || 'Error al subir archivo de certificado', type: 'error' });
    } finally {
      setUploadingFile(false);
    }
  };

  // Agregar Certificación a la base de datos
  const handleAddCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/candidates/certificates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(certForm),
      });

      if (res.ok) {
        setAddCertOpen(false);
        setCertForm({ name: '', issuingOrganization: '', issueDate: '', credentialUrl: '', fileUrl: '' });
        setUploadedFileName('');
        await fetchProfileData(token);
        setFeedback({ text: '¡Certificación añadida exitosamente!', type: 'success' });
      } else {
        const data = await res.json();
        setFeedback({ text: data.error || 'Error al agregar certificación', type: 'error' });
      }
    } catch (err) {
      setFeedback({ text: 'Error de comunicación con el servidor', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Eliminar Certificación
  const handleDeleteCertification = async (certId: string) => {
    if (!token || !confirm('¿Estás seguro de eliminar este certificado?')) return;
    try {
      const res = await fetch(`${API_URL}/api/candidates/certificates/${certId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchProfileData(token);
        setFeedback({ text: 'Certificación eliminada correctamente', type: 'success' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Agregar Experiencia
  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/candidates/experiences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expForm),
      });

      if (res.ok) {
        setAddExpOpen(false);
        setExpForm({
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          isCurrent: false,
          city: 'Santo Domingo',
          description: '',
        });
        await fetchProfileData(token);
        setFeedback({ text: '¡Experiencia laboral añadida al cronograma!', type: 'success' });
      }
    } catch (err) {
      setFeedback({ text: 'Error al agregar experiencia', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Eliminar Experiencia
  const handleDeleteExperience = async (expId: string) => {
    if (!token || !confirm('¿Deseas eliminar esta experiencia del cronograma?')) return;
    try {
      const res = await fetch(`${API_URL}/api/candidates/experiences/${expId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchProfileData(token);
        setFeedback({ text: 'Experiencia eliminada', type: 'success' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Agregar Educación
  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/candidates/education`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eduForm),
      });

      if (res.ok) {
        setAddEduOpen(false);
        setEduForm({
          institution: '',
          degree: '',
          fieldOfStudy: '',
          startDate: '',
          endDate: '',
          isCurrent: false,
        });
        await fetchProfileData(token);
        setFeedback({ text: '¡Educación añadida exitosamente!', type: 'success' });
      }
    } catch (err) {
      setFeedback({ text: 'Error al agregar educación', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Eliminar Educación
  const handleDeleteEducation = async (eduId: string) => {
    if (!token || !confirm('¿Deseas eliminar este registro de educación?')) return;
    try {
      const res = await fetch(`${API_URL}/api/candidates/education/${eduId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchProfileData(token);
        setFeedback({ text: 'Registro educativo eliminado', type: 'success' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Cargando tu perfil profesional...</p>
        </div>
      </div>
    );
  }

  const experiences = primaryResume?.experiences || [];
  const education = primaryResume?.education || [];
  const certifications = primaryResume?.certifications || [];
  const skills = primaryResume?.skills || [];
  const languages = primaryResume?.languages || [];

  return (
    <div className="min-h-screen bg-[#f3f4f6] pb-16">
      {/* Notificación flotante de retroalimentación */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all duration-300 ${
            feedback.type === 'success'
              ? 'bg-blue-50 border-blue-200 text-blue-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Contenedor Central Estilo LinkedIn */}
      <div className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* BARRA SUPERIOR DE NAVEGACIÓN RÁPIDA */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Link href="/dashboard/candidato" className="hover:text-blue-600 transition font-medium">
              Panel Candidato
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-900">Mi Perfil Profesional</span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Botón Ver como Empresa */}
            <Link
              href={`/candidatos/${user?.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition border border-slate-300 shadow-sm"
              title="Abre la vista exacta que ven los reclutadores y empresas"
            >
              <Eye className="w-4 h-4 text-slate-600" />
              Ver como Empresa / Reclutador
            </Link>

            {/* Enlace al Diseñador de CVs */}
            <Link
              href="/dashboard/candidato/cv"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
            >
              <FileText className="w-4 h-4" />
              Gestionar Mis CVs
            </Link>
          </div>
        </div>

        {/* WIDGET DE PRIVACIDAD Y VISTA PRIVADA DEL CANDIDATO */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-blue-900/40">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {profile?.isPublic ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" /> Perfil Público Activo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Lock className="w-3.5 h-3.5 text-amber-400" /> Perfil Privado (Restringido)
                </span>
              )}
              <span className="text-xs text-blue-200">· Vista Privada del Titular</span>
            </div>
            <p className="text-xs text-blue-100/90 max-w-xl leading-relaxed">
              {profile?.isPublic
                ? 'Tu perfil está abierto y visible para reclutadores de República Dominicana. Puedes compartir tu enlace con empresas o contactos.'
                : 'Tu perfil completo está oculto. Solo las empresas a cuyas vacantes te postules de forma deliberada podrán consultar tu historial.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              onClick={handleTogglePrivacy}
              className={`flex-1 md:flex-none px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                profile?.isPublic
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
              }`}
            >
              {profile?.isPublic ? <Lock className="w-3.5 h-3.5 text-amber-300" /> : <Unlock className="w-3.5 h-3.5" />}
              {profile?.isPublic ? 'Cambiar a Modo Privado' : 'Hacer Perfil Público'}
            </button>

            <button
              onClick={handleSyncFromResume}
              disabled={isSyncing}
              className="flex-1 md:flex-none px-4 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
              title="Copia el resumen y titular de tu currículum a tu perfil automáticamente"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar con CV 1-clic'}
            </button>

            <Link
              href={`/candidatos/${user?.id}`}
              target="_blank"
              className="flex-1 md:flex-none px-4 py-2.5 text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              Ver Perfil Público
            </Link>
          </div>
        </div>

        {/* 1. TARJETA PRINCIPAL DE CABECERA (PORTADA + AVATAR + TITULAR) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
          {/* Portada Corporativa Ejecutiva */}
          <div className="h-44 md:h-52 bg-gradient-to-r from-[#001f3f] via-[#003366] to-[#0051d5] relative">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium flex items-center gap-1.5 border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              Perfil Profesional Quisqueya Talent
            </div>
          </div>

          {/* Información del Perfil */}
          <div className="px-6 md:px-8 pb-6 pt-0 relative">
            {/* Avatar Flotante con Botón de Carga */}
            <div className="flex flex-col md:flex-row md:items-end justify-between -mt-16 md:-mt-20 mb-4 gap-4">
              <div className="relative group w-28 h-28 md:w-36 md:h-36 rounded-full ring-4 ring-white shadow-md bg-white overflow-hidden flex items-center justify-center">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center text-3xl font-black">
                    {profile?.firstName?.[0] || 'C'}
                    {profile?.lastName?.[0] || 'T'}
                  </div>
                )}
                {/* Botón cambiar foto */}
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  title="Cambiar foto de perfil"
                  className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer"
                >
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">Cambiar foto</span>
                </button>
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Botón Editar Perfil */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditProfileOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-blue-600" />
                  Editar Datos de Perfil
                </button>
              </div>
            </div>

            {/* Nombre, Titular y Ubicación */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900">
                  {profile?.firstName} {profile?.lastName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verificado
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Buscando empleo
                </span>
              </div>

              <p className="text-base md:text-lg text-slate-700 font-medium">
                {profile?.headline || 'Profesional en búsqueda de oportunidades en República Dominicana'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>
                    {profile?.city ? `${profile.city}, ` : ''}
                    {profile?.province || 'Santo Domingo'}, República Dominicana
                  </span>
                </div>
                {profile?.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {user?.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{user.email}</span>
                  </div>
                )}
              </div>

              {/* Redes y Enlaces Sociales */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {profile?.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition"
                  >
                    <LinkedInIcon className="w-3.5 h-3.5" />
                    LinkedIn
                  </a>
                )}
                {profile?.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1.5 rounded-lg transition"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    GitHub
                  </a>
                )}
                {profile?.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Portafolio Web
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. ACERCA DE MÍ (EXTRACTO PROFESIONAL) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Acerca de mí
            </h2>
            <button
              onClick={() => setEditProfileOpen(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Editar
            </button>
          </div>
          <p className="text-slate-700 text-sm md:text-base leading-relaxed whitespace-pre-line">
            {profile?.bio ||
              primaryResume?.summary ||
              'Aún no has agregado un resumen profesional. Haz clic en Editar Datos de Perfil para redactar una presentación atractiva para los reclutadores.'}
          </p>
        </div>

        {/* 3. CRONOGRAMA DE EXPERIENCIA LABORAL (TIMELINE INTERACTIVO) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Cronograma de Experiencia Laboral
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Historial cronológico sincronizado con tu Currículum Principal
              </p>
            </div>
            <button
              onClick={() => setAddExpOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Agregar Experiencia
            </button>
          </div>

          {experiences.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No hay experiencias registradas en tu cronograma</p>
              <p className="text-xs text-slate-500 mb-4">Muestra tu trayectoria a las empresas que visitan tu perfil</p>
              <button
                onClick={() => setAddExpOpen(true)}
                className="px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
              >
                + Añadir primera experiencia
              </button>
            </div>
          ) : (
            <div className="relative pl-6 md:pl-8 space-y-8 before:absolute before:left-3 md:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200">
              {experiences.map((exp: any, index: number) => (
                <div key={exp.id || index} className="relative group">
                  {/* Nodo del Cronograma */}
                  <div className="absolute -left-[27px] md:-left-[29px] top-1.5 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white border-2 border-blue-200" />

                  <div className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{exp.position}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700 font-semibold mt-0.5">
                          <span className="text-blue-700">{exp.company}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-500 font-normal">{exp.city || 'Santo Domingo'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {exp.startDate} - {exp.isCurrent ? 'Actualidad' : exp.endDate || 'Presente'}
                          </span>
                          {exp.isCurrent && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              Trabajo actual
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Botón Eliminar */}
                      <button
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Eliminar experiencia"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {exp.description && (
                      <p className="text-xs md:text-sm text-slate-600 mt-3 leading-relaxed whitespace-pre-line border-t border-slate-200/60 pt-2">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. CRONOGRAMA DE EDUCACIÓN & FORMACIÓN */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Educación y Formación Académica
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Títulos universitarios, técnicos y grados cursados</p>
            </div>
            <button
              onClick={() => setAddEduOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Agregar Educación
            </button>
          </div>

          {education.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
              <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No hay información educativa registrada</p>
              <button
                onClick={() => setAddEduOpen(true)}
                className="mt-3 px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
              >
                + Añadir educación
              </button>
            </div>
          ) : (
            <div className="relative pl-6 md:pl-8 space-y-6 before:absolute before:left-3 md:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200">
              {education.map((edu: any, index: number) => (
                <div key={edu.id || index} className="relative group">
                  <div className="absolute -left-[27px] md:-left-[29px] top-1.5 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white border-2 border-blue-200" />
                  <div className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200 transition flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{edu.degree}</h3>
                      <p className="text-sm font-semibold text-blue-700">{edu.institution}</p>
                      {edu.fieldOfStudy && (
                        <p className="text-xs text-slate-600 mt-0.5">Área de estudio: {edu.fieldOfStudy}</p>
                      )}
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {edu.startDate} - {edu.isCurrent ? 'En curso' : edu.endDate || 'Graduado'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteEducation(edu.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. SECCIÓN DE CERTIFICACIONES Y CURSOS (CON SUBIDA DE ARCHIVOS) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Cursos y Certificaciones Profesionales
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sube los certificados de los cursos que has realizado para que las empresas verifiquen tus credenciales
              </p>
            </div>
            <button
              onClick={() => setAddCertOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Subir / Agregar Certificado
            </button>
          </div>

          {certifications.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Award className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700">Aún no has subido certificados de cursos</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Subir comprobantes en PDF o imagen aumenta en un 80% las oportunidades de ser contactado por empresas
                dominicanas.
              </p>
              <button
                onClick={() => setAddCertOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
              >
                <UploadCloud className="w-4 h-4" />
                Subir Certificado de Curso
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifications.map((cert: any, index: number) => (
                <div
                  key={cert.id || index}
                  className="bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-xl p-4 flex flex-col justify-between transition group relative"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">{cert.name}</h4>
                          <p className="text-xs font-semibold text-blue-700">{cert.issuingOrganization}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteCertification(cert.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition p-1"
                        title="Eliminar certificación"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {cert.issueDate && (
                      <p className="text-[11px] text-slate-500 font-medium pl-10.5">Expedición: {cert.issueDate}</p>
                    )}
                  </div>

                  {/* Acciones del Certificado: Ver Documento o Enlace Web */}
                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                    {cert.fileUrl ? (
                      <a
                        href={cert.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition"
                      >
                        <FileCheck className="w-4 h-4 text-blue-600" />
                        Ver Certificado Adjunto
                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Sin archivo adjunto</span>
                    )}

                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Validar en web
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. HABILIDADES Y COMPETENCIAS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Habilidades y Aptitudes
            </h2>
            <Link
              href="/dashboard/candidato/cv"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Editar en CV
            </Link>
          </div>

          {skills.length === 0 ? (
            <p className="text-xs text-slate-500">Agrega habilidades técnicas y blandas desde el creador de CV.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((s: any, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition"
                >
                  {typeof s === 'string' ? s : s.name}
                  {s.level && <span className="text-slate-400 font-normal ml-1">({s.level})</span>}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 7. IDIOMAS */}
        {languages.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-blue-600" />
              Idiomas
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {languages.map((lang: any, idx: number) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <p className="text-sm font-bold text-slate-900">{lang.name}</p>
                  <p className="text-xs text-slate-500">{lang.proficiency || 'Intermedio'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EDITAR DATOS DE PERFIL */}
      {/* ========================================================================= */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Editar Datos de Mi Perfil</h3>
              </div>
              <button
                onClick={() => setEditProfileOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Apellido *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Titular Profesional (Aparece bajo tu nombre) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Senior Frontend Developer | React, Next.js & TypeScript"
                  value={profileForm.headline}
                  onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Acerca de Mí (Resumen Profesional)</label>
                <textarea
                  rows={4}
                  placeholder="Describe tus fortalezas, años de experiencia y metas profesionales..."
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Provincia</label>
                  <select
                    value={profileForm.province}
                    onChange={(e) => setProfileForm({ ...profileForm, province: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Santo Domingo">Santo Domingo</option>
                    <option value="Distrito Nacional">Distrito Nacional</option>
                    <option value="Santiago">Santiago</option>
                    <option value="La Altagracia">La Altagracia (Punta Cana / Bávaro)</option>
                    <option value="Puerto Plata">Puerto Plata</option>
                    <option value="La Romana">La Romana</option>
                    <option value="San Cristóbal">San Cristóbal</option>
                    <option value="San Pedro de Macorís">San Pedro de Macorís</option>
                    <option value="La Vega">La Vega</option>
                    <option value="Duarte">Duarte (San Francisco)</option>
                    <option value="Otras Provincias">Otras Provincias</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ciudad o Sector</label>
                  <input
                    type="text"
                    placeholder="Ej. Piantini, Bella Vista, Gurabo"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="+1 809-000-0000"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">URL de Perfil en LinkedIn</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/tu-usuario"
                    value={profileForm.linkedinUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GitHub (Opcional)</label>
                  <input
                    type="url"
                    placeholder="https://github.com/tu-usuario"
                    value={profileForm.githubUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, githubUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Portafolio / Web Personal</label>
                  <input
                    type="url"
                    placeholder="https://tuportafolio.com"
                    value={profileForm.portfolioUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, portfolioUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: AGREGAR EXPERIENCIA AL CRONOGRAMA */}
      {/* ========================================================================= */}
      {addExpOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Agregar Experiencia al Cronograma</h3>
              </div>
              <button onClick={() => setAddExpOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExperience} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cargo / Posición *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Desarrollador Web, Gerente de Ventas"
                  value={expForm.position}
                  onChange={(e) => setExpForm({ ...expForm, position: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Empresa o Institución *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Banco BHD, Claro Dominicana, Remoto"
                  value={expForm.company}
                  onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fecha de Inicio *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Ene 2022"
                    value={expForm.startDate}
                    onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fecha de Finalización</label>
                  <input
                    type="text"
                    disabled={expForm.isCurrent}
                    placeholder="Ej. Dic 2023"
                    value={expForm.endDate}
                    onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCurrent"
                  checked={expForm.isCurrent}
                  onChange={(e) => setExpForm({ ...expForm, isCurrent: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="isCurrent" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Actualmente trabajo en esta posición
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción de Funciones y Logros</label>
                <textarea
                  rows={3}
                  placeholder="Detalla tus responsabilidades principales y logros alcanzados..."
                  value={expForm.description}
                  onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddExpOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Guardar al Cronograma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: AGREGAR EDUCACIÓN */}
      {/* ========================================================================= */}
      {addEduOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Agregar Formación Académica</h3>
              </div>
              <button onClick={() => setAddEduOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEducation} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título o Grado *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Licenciatura en Contabilidad, Ing. de Software"
                  value={eduForm.degree}
                  onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Institución Educativa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. UASD, INTEC, PUCMM, ITLA, UNIBE"
                  value={eduForm.institution}
                  onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Año de Inicio *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 2018"
                    value={eduForm.startDate}
                    onChange={(e) => setEduForm({ ...eduForm, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Año de Fin (o Previsto)</label>
                  <input
                    type="text"
                    placeholder="Ej. 2022"
                    value={eduForm.endDate}
                    onChange={(e) => setEduForm({ ...eduForm, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddEduOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Guardar Educación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: AGREGAR CURSO / CERTIFICACIÓN Y SUBIR ARCHIVO */}
      {/* ========================================================================= */}
      {addCertOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Agregar Curso o Certificación</h3>
              </div>
              <button onClick={() => setAddCertOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCertification} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Curso o Certificado *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Certificación AWS Cloud Practitioner, Diplomado en Finanzas"
                  value={certForm.name}
                  onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Empresa u Organización Emisora *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. INFOTEP, Platzi, Coursera, Google, Microsoft"
                  value={certForm.issuingOrganization}
                  onChange={(e) => setCertForm({ ...certForm, issuingOrganization: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fecha de Emisión</label>
                  <input
                    type="text"
                    placeholder="Ej. Mayo 2024"
                    value={certForm.issueDate}
                    onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Enlace de Validación Web (Opcional)</label>
                  <input
                    type="url"
                    placeholder="https://credly.com/..."
                    value={certForm.credentialUrl}
                    onChange={(e) => setCertForm({ ...certForm, credentialUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* ZONA DE CARGA DE ARCHIVO (PDF / IMAGEN) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subir Comprobante / Certificado en Archivo (Opcional)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/50 hover:bg-blue-50 rounded-xl p-5 text-center cursor-pointer transition"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleCertificateFileUpload}
                    accept=".pdf,image/png,image/jpeg,image/webp"
                    className="hidden"
                  />
                  {uploadingFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                      <span className="text-xs font-semibold text-blue-900">Subiendo documento...</span>
                    </div>
                  ) : uploadedFileName || certForm.fileUrl ? (
                    <div className="flex items-center justify-center gap-2 text-blue-700">
                      <FileCheck className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs font-bold">{uploadedFileName || 'Archivo cargado con éxito'}</span>
                      <span className="text-[10px] text-slate-500">(Clic para cambiar)</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <UploadCloud className="w-8 h-8 text-blue-600 mb-0.5" />
                      <p className="text-xs font-bold text-slate-800">
                        Haz clic aquí para seleccionar el archivo de tu certificado
                      </p>
                      <p className="text-[11px] text-slate-500">Formatos soportados: PDF, JPG, PNG (Hasta 15 MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddCertOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving || uploadingFile}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Guardar Certificación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

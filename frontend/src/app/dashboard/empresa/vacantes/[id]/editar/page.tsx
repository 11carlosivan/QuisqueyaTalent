'use client';

import { API_URL } from '@/lib/api';
import { toast } from '@/components/Toast';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Mail,
  Save,
  Loader2,
  PowerOff,
  AlertTriangle,
  Eye,
  Trash2,
  Sparkles,
} from 'lucide-react';

export default function EditJobPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;

  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tecnología e Informática');
  const [province, setProvince] = useState('Distrito Nacional');
  const [city, setCity] = useState('');
  const [workplaceType, setWorkplaceType] = useState('HYBRID');
  const [jobType, setJobType] = useState('FULL_TIME');
  const [experienceLevel, setExperienceLevel] = useState('MID');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [salaryCurrency, setSalaryCurrency] = useState('DOP');
  const [isSalaryPublic, setIsSalaryPublic] = useState(true);

  const [applyMethod, setApplyMethod] = useState<'PLATFORM' | 'EMAIL'>('PLATFORM');
  const [applyEmail, setApplyEmail] = useState('');

  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<'PUBLISHED' | 'CLOSED' | 'PAUSED'>('PUBLISHED');
  const [slug, setSlug] = useState('');

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
    'Espaillat (Moca)',
    'Samaná',
    'San Pedro de Macorís',
    'Barahona',
    'Azua',
    'Monseñor Nouel (Bonao)',
    'Peravia (Baní)',
    'Valverde (Mao)',
    'Monte Plata',
    'Hato Mayor',
  ];

  // Cargar datos de la vacante existente
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (!jobId || !token) return;

    setFetching(true);
    fetch(`${API_URL}/api/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Vacante no encontrada');
        }
        return data;
      })
      .then((data) => {
        const job = data.job || data;
        if (job) {
          setTitle(job.title || '');
          setCategory(job.category || 'Tecnología e Informática');
          setProvince(job.province || 'Distrito Nacional');
          setCity(job.city || '');
          setWorkplaceType(job.workplaceType || 'HYBRID');
          setJobType(job.jobType || 'FULL_TIME');
          setExperienceLevel(job.experienceLevel || 'MID');
          setSalaryMin(job.salaryMin ? String(Number(job.salaryMin)) : '');
          setSalaryMax(job.salaryMax ? String(Number(job.salaryMax)) : '');
          setSalaryCurrency(job.salaryCurrency || 'DOP');
          setIsSalaryPublic(job.isSalaryPublic !== false);
          setApplyMethod(job.applyMethod === 'EMAIL' ? 'EMAIL' : 'PLATFORM');
          setApplyEmail(job.applyEmail || '');
          setDescription(job.description || '');
          setResponsibilities(job.responsibilities || '');
          setRequirements(job.requirements || '');
          setBenefits(job.benefits || '');
          setUrgent(Boolean(job.urgent));
          setFeatured(Boolean(job.featured));
          setStatus(job.status || 'PUBLISHED');
          setSlug(job.slug || '');

          if (Array.isArray(job.skills)) {
            setSkills(job.skills.map((s: any) => (typeof s === 'string' ? s : s.skillName || '')));
          }
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.message || 'No se pudo cargar la vacante', 'Error');
      })
      .finally(() => setFetching(false));
  }, [jobId, token, user, isLoading]);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Alternar disponibilidad rápida
  const handleToggleStatus = async () => {
    const nextStatus = status === 'PUBLISHED' ? 'CLOSED' : 'PUBLISHED';
    setTogglingStatus(true);
    try {
      const res = await fetch(`${API_URL}/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Error al cambiar estado', 'Error');
        return;
      }

      setStatus(nextStatus);
      toast.success(
        nextStatus === 'PUBLISHED'
          ? 'Vacante reactivada: ya está disponible y recibiendo candidatos.'
          : 'Vacante marcada como no disponible: no admitirá más postulaciones.',
        nextStatus === 'PUBLISHED' ? '🟢 Vacante Disponible' : '⚪ Vacante No Disponible'
      );
    } catch (e) {
      toast.error('Error de red al actualizar estado', 'Error');
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!title.trim() || !description.trim()) {
      toast.error('El título y la descripción son requeridos', 'Campos Incompletos');
      return;
    }

    if (applyMethod === 'EMAIL' && !applyEmail.trim()) {
      toast.error('Indica el correo donde recibirás las postulaciones', 'Correo Requerido');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          category,
          province,
          city: city.trim() || null,
          workplaceType,
          jobType,
          experienceLevel,
          salaryMin: salaryMin ? Number(salaryMin) : null,
          salaryMax: salaryMax ? Number(salaryMax) : null,
          salaryCurrency,
          isSalaryPublic,
          applyMethod,
          applyEmail: applyMethod === 'EMAIL' ? applyEmail.trim() : null,
          description: description.trim(),
          responsibilities: responsibilities.trim() || null,
          requirements: requirements.trim() || null,
          benefits: benefits.trim() || null,
          skills,
          urgent,
          featured,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'No se pudo actualizar la vacante', 'Error');
        return;
      }

      toast.success('Los cambios en la vacante han sido guardados exitosamente.', 'Vacante Actualizada');
      router.push('/dashboard/empresa');
    } catch (err) {
      console.error(err);
      toast.error('Error de red al guardar los cambios', 'Error de Red');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || fetching) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-500 font-medium text-sm">Cargando datos de la vacante...</p>
        </div>
      </div>
    );
  }

  const isAvailable = status === 'PUBLISHED';

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24 pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Navegación y Encabezado Superior */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/dashboard/empresa"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Panel de Empresa
          </Link>

          {slug && (
            <Link
              href={`/empleos/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
            >
              <Eye className="w-4 h-4" /> Ver Vacante Pública en Vivo
            </Link>
          )}
        </div>

        {/* Tarjeta de Control Rápido de Estado / Disponibilidad */}
        <div
          className={`rounded-3xl p-6 border transition-all ${
            isAvailable
              ? 'bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-white border-emerald-300'
              : 'bg-gradient-to-r from-amber-500/10 via-slate-100 to-white border-amber-300'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                  isAvailable ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                }`}
              >
                {isAvailable ? <CheckCircle2 className="w-6 h-6" /> : <PowerOff className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-base">Disponibilidad de la Vacante:</span>
                  {isAvailable ? (
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Disponible
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span> No Disponible (Cerrada)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {isAvailable
                    ? 'La vacante está activa y visible en el directorio, recibiendo postulaciones en tiempo real.'
                    : 'La vacante no admite nuevas postulaciones. Su página sigue indexada en Google para conservar el posicionamiento SEO.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={togglingStatus}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 shrink-0 cursor-pointer shadow-xs disabled:opacity-50 ${
                isAvailable
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {togglingStatus ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isAvailable ? (
                <PowerOff className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {isAvailable ? 'Marcar No Disponible' : 'Marcar Disponible'}
            </button>
          </div>
        </div>

        {/* Formulario Principal de Edición */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bloque 1: Datos Principales */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 pb-2 border-b border-slate-100">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Información del Puesto
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Título del Empleo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Desarrollador Full Stack Senior"
                className="w-full text-sm p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Categoría Profesional <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
                >
                  <option>Tecnología e Informática</option>
                  <option>Call Center y BPO</option>
                  <option>Ventas y Comercio B2B</option>
                  <option>Banca y Finanzas</option>
                  <option>Turismo y Hotelería</option>
                  <option>Zonas Francas & Manufactura</option>
                  <option>Salud y Medicina</option>
                  <option>Administración y Recursos Humanos</option>
                  <option>Marketing y Diseño</option>
                  <option>Logística y Transporte</option>
                  <option>Servicio al Cliente</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Modalidad de Trabajo</label>
                <select
                  value={workplaceType}
                  onChange={(e) => setWorkplaceType(e.target.value)}
                  className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
                >
                  <option value="ON_SITE">🏢 Presencial en Oficina</option>
                  <option value="HYBRID">⚡ Híbrido (Oficina + Remoto)</option>
                  <option value="REMOTE">🌐 100% Remoto</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tipo de Jornada</label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
                >
                  <option value="FULL_TIME">Tiempo Completo</option>
                  <option value="PART_TIME">Medio Tiempo</option>
                  <option value="CONTRACT">Por Contrato / Proyecto</option>
                  <option value="TEMPORARY">Temporal</option>
                  <option value="INTERNSHIP">Pasantía</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nivel de Experiencia</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
                >
                  <option value="NO_EXPERIENCE">Sin Experiencia Previa</option>
                  <option value="ENTRY">Pasantía / Inicial</option>
                  <option value="JUNIOR">Junior (1 - 2 años)</option>
                  <option value="MID">Intermedio / Semi-Senior (3 - 4 años)</option>
                  <option value="SENIOR">Senior (5+ años)</option>
                  <option value="LEAD">Líder de Equipo / Gerencial</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bloque 2: Ubicación Geográfica */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 pb-2 border-b border-slate-100">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Ubicación en República Dominicana
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Provincia <span className="text-rose-500">*</span>
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
                >
                  {provincesRD.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Ciudad / Sector (Opcional)</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ej. Piantini, Bella Vista, Gurabo"
                  className="w-full text-sm p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Bloque 3: Compensación Salarial */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 pb-2 border-b border-slate-100">
              <DollarSign className="w-5 h-5 text-amber-600" />
              Rango Salarial Mensual (Opcional)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Moneda</label>
                <select
                  value={salaryCurrency}
                  onChange={(e) => setSalaryCurrency(e.target.value)}
                  className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
                >
                  <option value="DOP">DOP (Pesos Dominicanos)</option>
                  <option value="USD">USD (Dólares)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Salario Mínimo</label>
                <input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="Ej. 45000"
                  className="w-full text-sm p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Salario Máximo</label>
                <input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="Ej. 65000"
                  className="w-full text-sm p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isSalaryPublic}
                onChange={(e) => setIsSalaryPublic(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              Mostrar rango salarial públicamente a los candidatos
            </label>
          </div>

          {/* Bloque 4: Método de Recepción de Postulaciones */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 pb-2 border-b border-slate-100">
              <Mail className="w-5 h-5 text-indigo-600" />
              Método de Recepción de Candidatos
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition ${
                  applyMethod === 'PLATFORM'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="applyMethod"
                  value="PLATFORM"
                  checked={applyMethod === 'PLATFORM'}
                  onChange={() => setApplyMethod('PLATFORM')}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="block font-bold text-xs text-slate-900">⚡ ATS y Plataforma Quisqueya Talent</span>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Gestiona candidatos, estados (Entrevista, Preseleccionado, etc.) y revisa CVs directamente en tu panel.
                  </p>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border cursor-pointer flex items-start gap-3 transition ${
                  applyMethod === 'EMAIL'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="applyMethod"
                  value="EMAIL"
                  checked={applyMethod === 'EMAIL'}
                  onChange={() => setApplyMethod('EMAIL')}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="block font-bold text-xs text-slate-900">✉️ Correo Electrónico Directo</span>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Los candidatos enviarán sus currículums directamente a la casilla de correo corporativa que indiques.
                  </p>
                </div>
              </label>
            </div>

            {applyMethod === 'EMAIL' && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Correo Electrónico de Recepción <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required={applyMethod === 'EMAIL'}
                  value={applyEmail}
                  onChange={(e) => setApplyEmail(e.target.value)}
                  placeholder="ejemplo: vacantes@empresa.com.do"
                  className="w-full text-sm p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                />
              </div>
            )}
          </div>

          {/* Bloque 5: Descripción y Contenido */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 pb-2 border-b border-slate-100">
              <Building2 className="w-5 h-5 text-blue-600" />
              Detalles y Requisitos de la Oferta
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Descripción General del Puesto <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el objetivo del rol, la cultura de la empresa y la misión del puesto..."
                className="w-full text-sm p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Responsabilidades Clave</label>
              <textarea
                rows={4}
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                placeholder="• Desarrollar y mantener módulos de software&#10;• Colaborar con el equipo de diseño&#10;• Participar en reuniones diarias..."
                className="w-full text-sm p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Requisitos del Candidato</label>
              <textarea
                rows={4}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="• Licenciatura o Ingeniería en Sistemas o afines&#10;• Experiencia sólida demostrable&#10;• Residencia en República Dominicana..."
                className="w-full text-sm p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Beneficios y Compensaciones Adicionales</label>
              <textarea
                rows={3}
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                placeholder="• Seguro médico complementario&#10;• Bonificación por desempeño anual&#10;• Días de vacaciones flexibles..."
                className="w-full text-sm p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

            {/* Habilidades / Tags */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Habilidades o Competencias Clave</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Ej. React, Excel Avanzado, Inglés B2..."
                  className="flex-1 text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1 rounded-xl"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="hover:text-rose-600 transition"
                      title="Quitar"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bloque 6: Opciones de Destacado y Visibilidad */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base pb-2 border-b border-slate-100">
              Opciones de Visibilidad y Estado
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="block font-bold text-xs text-slate-900">⭐ Vacante Destacada</span>
                  <span className="text-[11px] text-slate-500">
                    Aparecerá en los primeros resultados de búsqueda de la plataforma.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition">
                <input
                  type="checkbox"
                  checked={urgent}
                  onChange={(e) => setUrgent(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="block font-bold text-xs text-slate-900">🔥 Contratación Urgente</span>
                  <span className="text-[11px] text-slate-500">
                    Muestra el distintivo de urgencia para atraer postulaciones más rápido.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Barra de Acciones Final */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <Link
              href="/dashboard/empresa"
              className="w-full sm:w-auto text-center px-6 py-3.5 rounded-2xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold text-xs transition"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl transition shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar Cambios de la Vacante
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

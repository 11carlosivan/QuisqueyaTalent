'use client';

import { API_URL } from '@/lib/api';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Building2,
  CheckCircle2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Briefcase,
  Camera,
  Loader2,
  Check,
  AlertCircle,
  Eye,
  Plus,
  ChevronRight,
  ExternalLink,
  Sparkles,
  UploadCloud,
  X,
  Users,
} from 'lucide-react';

const DOMINICAN_PROVINCES = [
  'Distrito Nacional',
  'Santo Domingo',
  'Santiago',
  'La Altagracia',
  'La Romana',
  'Puerto Plata',
  'San Cristóbal',
  'San Pedro de Macorís',
  'Duarte',
  'La Vega',
  'Espaillat',
  'Peravia',
  'Azua',
  'Barahona',
  'Monseñor Nouel',
  'Monte Plata',
  'Sánchez Ramírez',
  'Valverde',
  'Samaná',
  'Hato Mayor',
  'El Seibo',
  'María Trinidad Sánchez',
  'Hermanas Mirabal',
  'San Juan',
  'Dajabón',
  'Monte Cristi',
  'Santiago Rodríguez',
  'Bahoruco',
  'Independencia',
  'Pedernales',
  'Elías Piña',
  'San José de Ocoa',
];

const INDUSTRIES = [
  'Tecnología y Software',
  'Banca, Finanzas y Seguros',
  'Turismo, Hotelería y Restaurantes',
  'Call Center y BPO',
  'Comercio y Retail',
  'Salud, Medicina y Farmacia',
  'Logística, Transporte y Aduanas',
  'Manufactura y Zonas Francas',
  'Construcción e Inmobiliaria',
  'Educación y Capacitación',
  'Telecomunicaciones',
  'Alimentos y Bebidas',
  'Servicios Profesionales y Consultoría',
];

export default function CompanyProfileManagePage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({
    name: '',
    industry: 'Tecnología y Software',
    description: '',
    logoUrl: '',
    coverUrl: '',
    websiteUrl: '',
    phone: '',
    email: '',
    province: 'Distrito Nacional',
    city: '',
    address: '',
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const fetchCompanyData = async (authToken: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/companies/my`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        setCompany(data);
        setForm({
          name: data.name || '',
          industry: data.industry || 'Tecnología y Software',
          description: data.description || '',
          logoUrl: data.logoUrl || '',
          coverUrl: data.coverUrl || '',
          websiteUrl: data.websiteUrl || '',
          phone: data.phone || '',
          email: data.email || '',
          province: data.province || 'Distrito Nacional',
          city: data.city || '',
          address: data.address || '',
        });
      } else {
        setCompany(null);
      }
    } catch (err) {
      console.error('Error al cargar datos de empresa:', err);
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
      fetchCompanyData(token);
    }
  }, [user, token, isLoading]);

  // Guardar Cambios del Perfil
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/companies/my`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        setCompany((prev: any) => ({ ...prev, ...data.company }));
        setFeedback({ text: '¡Perfil de la empresa actualizado exitosamente!', type: 'success' });
      } else {
        const data = await res.json();
        setFeedback({ text: data.error || 'Error al guardar datos de la empresa', type: 'error' });
      }
    } catch (err) {
      setFeedback({ text: 'Error al conectar con el servidor', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Subir Logo
  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setFeedback({ text: 'Subiendo logo...', type: 'success' });
      const res = await fetch(`${API_URL}/api/candidates/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const newLogoUrl = data.imageUrl?.startsWith('http') ? data.imageUrl : `${API_URL}${data.imageUrl}`;
        setForm((prev) => ({ ...prev, logoUrl: newLogoUrl }));
        setFeedback({ text: 'Logo subido correctamente. Guarda los cambios para aplicar.', type: 'success' });
      }
    } catch (err) {
      setFeedback({ text: 'Error al subir el logo', type: 'error' });
    }
  };

  // Subir Portada
  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setFeedback({ text: 'Subiendo imagen de portada...', type: 'success' });
      const res = await fetch(`${API_URL}/api/candidates/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const newCoverUrl = data.imageUrl?.startsWith('http') ? data.imageUrl : `${API_URL}${data.imageUrl}`;
        setForm((prev) => ({ ...prev, coverUrl: newCoverUrl }));
        setFeedback({ text: 'Portada subida correctamente. Guarda los cambios para aplicar.', type: 'success' });
      }
    } catch (err) {
      setFeedback({ text: 'Error al subir la portada', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Cargando perfil corporativo...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">No tienes una empresa vinculada</h2>
          <p className="text-xs text-slate-500">
            Tu cuenta actual no está asociada a una organización o empresa empleadora en la plataforma.
          </p>
          <Link
            href="/dashboard/empresa"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
          >
            Ir al panel de empresa
          </Link>
        </div>
      </div>
    );
  }

  const activeJobsCount = company.jobs?.filter((j: any) => j.status === 'PUBLISHED').length || 0;
  const totalApplications = company.jobs?.reduce((acc: number, j: any) => acc + (j.applicationsCount || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-[#f3f4f6] pb-24">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border text-sm font-medium transition-all ${
            feedback.type === 'success'
              ? 'bg-blue-50 border-blue-200 text-blue-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* BARRA SUPERIOR DE NAVEGACIÓN Y ACCIONES */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Link href="/dashboard/empresa" className="hover:text-blue-600 transition font-medium">
              Panel Empresa
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-900">Perfil Corporativo</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/empresas/${company.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition border border-slate-300 shadow-2xs"
            >
              <Eye className="w-4 h-4 text-slate-600" />
              Ver Perfil Público
            </Link>

            <Link
              href="/dashboard/empresa/vacantes/nueva"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Publicar Vacante
            </Link>
          </div>
        </div>

        {/* WIDGET DE MÉTRICAS PRIVADAS DE LA EMPRESA */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{activeJobsCount}</div>
              <div className="text-xs font-semibold text-slate-500">Vacantes Publicadas Activas</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{totalApplications}</div>
              <div className="text-xs font-semibold text-slate-500">Postulaciones Recibidas</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-800 flex items-center gap-1">
                {company.isVerified ? 'Empresa Verificada 🇩🇴' : 'En proceso de verificación'}
              </div>
              <div className="text-xs text-slate-500">Estado de Confianza en RD</div>
            </div>
          </div>
        </div>

        {/* FORMULARIO PRINCIPAL DE IDENTIDAD CORPORATIVA */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header Visual con Portada y Logo */}
          <div
            className="h-44 md:h-52 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 relative group"
            style={
              form.coverUrl
                ? { backgroundImage: `url(${form.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : {}
            }
          >
            <div className="absolute inset-0 bg-black/30" />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 backdrop-blur-md transition cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              Cambiar Portada
            </button>
            <input
              type="file"
              ref={coverInputRef}
              onChange={handleUploadCover}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="px-6 md:px-8 pb-8 pt-0 relative">
            {/* Logo Corporativo con Uploader */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-14 md:-mt-16 mb-6 gap-4">
              <div className="relative group w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center shrink-0">
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt={form.name} className="w-full h-full object-cover" />
                ) : (
                  <img src="/icono.svg" alt="Logo" className="w-12 h-12 object-contain" />
                )}
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                >
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-bold">Cambiar Logo</span>
                </button>
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleUploadLogo}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="text-xs text-slate-500 italic">
                Formatos recomendados: PNG o JPG con fondo blanco o transparente.
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">Información General de la Empresa</h2>
                <p className="text-xs text-slate-500">
                  Esta información se muestra a los candidatos que consulten tu perfil y vacantes en Quisqueya Talent.
                </p>
              </div>

              {/* Grid 2 Columnas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nombre Oficial o Comercial de la Empresa *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Ej. BHD, Grupo Ramos, Altice..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Sector / Industria *
                  </label>
                  <select
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none bg-white"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Descripción General de la Empresa *
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe a qué se dedica tu empresa, sus principales actividades y trayectoria en el mercado dominicano..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none leading-relaxed"
                />
              </div>

              {/* Enlaces y Contacto */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Contacto y Presencia Web</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Sitio Web Oficial
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="url"
                        value={form.websiteUrl}
                        onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                        placeholder="https://tuempresa.com.do"
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Teléfono de Contacto
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="809-555-0100"
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="empleos@tuempresa.com.do"
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ubicación Geográfica */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Ubicación en República Dominicana</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Provincia *
                    </label>
                    <select
                      value={form.province}
                      onChange={(e) => setForm({ ...form, province: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none bg-white"
                    >
                      {DOMINICAN_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Ciudad o Municipio
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="Ej. Santo Domingo Este, Piantini..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Dirección Física
                    </label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Ej. Av. Winston Churchill #1099"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Botón Guardar Cambios */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                <Link
                  href={`/empresas/${company.slug}`}
                  target="_blank"
                  className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Previsualizar Perfil
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {saving ? 'Guardando...' : 'Guardar Cambios Corporativos'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

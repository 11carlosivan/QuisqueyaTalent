'use client';

import { API_URL } from '@/lib/api';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../../lib/auth-context';
import confetti from 'canvas-confetti';
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Mail,
  Send,
  Loader2,
} from 'lucide-react';

export default function NewJobPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tecnología e Informática');
  const [province, setProvince] = useState('Distrito Nacional');
  const [city, setCity] = useState('Santo Domingo');
  const [workplaceType, setWorkplaceType] = useState('HYBRID');
  const [jobType, setJobType] = useState('FULL_TIME');
  const [experienceLevel, setExperienceLevel] = useState('MID');
  const [salaryMin, setSalaryMin] = useState('85000');
  const [salaryMax, setSalaryMax] = useState('120000');

  // Método de postulación: Plataforma vs Correo
  const [applyMethod, setApplyMethod] = useState<'PLATFORM' | 'EMAIL'>('PLATFORM');
  const [applyEmail, setApplyEmail] = useState(user?.email || 'empleos@empresa.com.do');

  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');
  const [skills, setSkills] = useState<string[]>(['Trabajo en Equipo', 'Comunicación']);
  const [newSkill, setNewSkill] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [featured, setFeatured] = useState(true);

  const provincesRD = [
    'Distrito Nacional',
    'Santo Domingo',
    'Santiago',
    'La Altagracia (Punta Cana)',
    'San Cristóbal',
    'La Romana',
    'Puerto Plata',
    'La Vega',
  ];

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    setSkills([...skills, newSkill.trim()]);
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('Debes iniciar sesión con una cuenta de empresa');
      router.push('/auth/login');
      return;
    }

    if (applyMethod === 'EMAIL' && !applyEmail.trim()) {
      alert('Por favor introduce el correo electrónico donde recibirás los currículums.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          category,
          province,
          city,
          workplaceType,
          jobType,
          experienceLevel,
          salaryMin,
          salaryMax,
          salaryCurrency: 'DOP',
          applyMethod,
          applyEmail: applyMethod === 'EMAIL' ? applyEmail : null,
          description,
          responsibilities,
          requirements,
          benefits,
          skills,
          urgent,
          featured,
        }),
      });

      const data = await res.json();
      if (res.ok && data.job) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        alert('¡Vacante publicada exitosamente en Quisqueya Talent!');
        router.push(`/dashboard/empresa/vacantes/${data.job.id}/ats`);
      } else {
        alert(data.error || 'No se pudo publicar la vacante');
      }
    } catch (err) {
      alert('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <Link
            href="/dashboard/empresa"
            className="text-xs font-bold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 mb-2 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a mis vacantes
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001428] font-['Plus_Jakarta_Sans']">
            Publicar Vacante Laboral
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publica tus vacantes sin costo y conecta con los profesionales más cualificados de República Dominicana.
          </p>
        </div>

        {/* Formulario Principal */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Información Básica del Puesto
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Título de la Vacante *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Desarrollador Frontend React & Next.js"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Categoría Laboral *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option>Tecnología e Informática</option>
                  <option>Call Center y BPO</option>
                  <option>Ventas y Comercio B2B</option>
                  <option>Banca y Finanzas</option>
                  <option>Turismo y Hotelería</option>
                  <option>Zonas Francas & Manufactura</option>
                  <option>Salud y Medicina</option>
                  <option>Administración y Recursos Humanos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Modalidad de Trabajo</label>
                <select
                  value={workplaceType}
                  onChange={(e) => setWorkplaceType(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="ON_SITE">Presencial en Oficina</option>
                  <option value="HYBRID">Híbrido (Oficina + Casa)</option>
                  <option value="REMOTE">100% Remoto (Desde cualquier lugar de RD)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Jornada</label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="FULL_TIME">Tiempo Completo</option>
                  <option value="PART_TIME">Medio Tiempo</option>
                  <option value="CONTRACT">Por Contrato / Proyecto</option>
                  <option value="INTERNSHIP">Pasantía / Prácticas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nivel de Experiencia</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="ENTRY">Sin experiencia / Entrada</option>
                  <option value="JUNIOR">Junior (1-2 años)</option>
                  <option value="MID">Intermedio (2-4 años)</option>
                  <option value="SENIOR">Senior (5+ años)</option>
                  <option value="LEAD">Líder / Gerencial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Provincia (RD) *</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {provincesRD.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rango Salarial en DOP */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Salario Mínimo (RD$ Mensual)
                </label>
                <input
                  type="number"
                  placeholder="85000"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Salario Máximo (RD$ Mensual)
                </label>
                <input
                  type="number"
                  placeholder="120000"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* SELECCIÓN DE MÉTODO DE RECEPCIÓN DE CANDIDATOS */}
            <div className="p-5 bg-blue-50/80 rounded-2xl border border-blue-200/80 space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-blue-950 uppercase tracking-wide mb-1">
                  ¿Cómo prefieres recibir y gestionar las postulaciones? *
                </label>
                <p className="text-xs text-blue-800">
                  Elige si deseas que los candidatos apliquen directamente en la plataforma o mediante envío de CV a tu correo.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label
                  className={`p-4 rounded-xl border-2 transition cursor-pointer flex items-start gap-3 ${
                    applyMethod === 'PLATFORM'
                      ? 'border-blue-600 bg-white shadow-xs'
                      : 'border-slate-200 bg-white/70 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="applyMethod"
                    value="PLATFORM"
                    checked={applyMethod === 'PLATFORM'}
                    onChange={() => setApplyMethod('PLATFORM')}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-blue-600" />
                      Gestionar en la Plataforma (ATS)
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                      Los candidatos aplican con su perfil y hoja de vida. Tú revisas y gestionas el proceso en tu tablero Kanban.
                    </p>
                  </div>
                </label>

                <label
                  className={`p-4 rounded-xl border-2 transition cursor-pointer flex items-start gap-3 ${
                    applyMethod === 'EMAIL'
                      ? 'border-blue-600 bg-white shadow-xs'
                      : 'border-slate-200 bg-white/70 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="applyMethod"
                    value="EMAIL"
                    checked={applyMethod === 'EMAIL'}
                    onChange={() => setApplyMethod('EMAIL')}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-600" />
                      Recibir CVs por Correo Electrónico
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                      Los candidatos verán tu dirección de correo corporativo para adjuntar su CV directamente.
                    </p>
                  </div>
                </label>
              </div>

              {applyMethod === 'EMAIL' && (
                <div className="pt-2 animate-in fade-in duration-200">
                  <label className="block text-xs font-bold text-blue-950 mb-1">
                    Correo Electrónico para recibir postulaciones *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="talento@empresa.com.do"
                      value={applyEmail}
                      onChange={(e) => setApplyEmail(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-white border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                    />
                  </div>
                  <span className="text-[11px] text-blue-700 block mt-1">
                    Este correo se mostrará de forma destacada en la página de la vacante.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Redacción y Detalles */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              Descripción y Requisitos
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Descripción General del Puesto *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Explica de qué trata la vacante y el impacto del puesto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Responsabilidades Principales
              </label>
              <textarea
                rows={4}
                placeholder="• Liderar proyectos...&#10;• Coordinar reuniones...&#10;• Diseñar interfaces..."
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Requisitos y Competencias
              </label>
              <textarea
                rows={4}
                placeholder="• Graduado o estudiante de término...&#10;• 2+ años de experiencia...&#10;• Dominio de..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Beneficios Ofrecidos
              </label>
              <textarea
                rows={3}
                placeholder="• Seguro médico complementario...&#10;• Bonificación anual...&#10;• Flexibilidad de horario..."
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Skills Tags */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Habilidades requeridas
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Ej. React, Inglés Avanzado, Excel..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="bg-slate-800 text-white font-bold text-xs px-4 rounded-xl cursor-pointer"
                >
                  Agregar
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="hover:text-rose-600 font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Opciones de Publicación */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={urgent}
                  onChange={(e) => setUrgent(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                Marcar como Vacante Urgente
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                Destacar en la portada
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#0051d5] hover:bg-[#0041ab] text-white font-extrabold text-sm px-6 py-3 rounded-xl transition flex items-center gap-2 shadow-md shadow-blue-600/30 cursor-pointer self-end sm:self-auto"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Publicar Vacante Gratis
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

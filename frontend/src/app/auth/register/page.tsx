'use client';

import { API_URL } from '@/lib/api';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import Logo from '../../../components/Logo';
import {
  UserCircle,
  Building2,
  Mail,
  Lock,
  Phone,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [tab, setTab] = useState<'candidate' | 'company'>('candidate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('Distrito Nacional');

  // Company specific
  const [companyName, setCompanyName] = useState('');
  const [rnc, setRnc] = useState('');
  const [industry, setIndustry] = useState('Tecnología & Telecomunicaciones');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint =
        tab === 'candidate'
          ? `${API_URL}/api/auth/register-candidate`
          : `${API_URL}/api/auth/register-company`;

      const payload =
        tab === 'candidate'
          ? { firstName, lastName, email, password, phone, province }
          : { firstName, lastName, email, password, phone, province, companyName, rnc, industry };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        login(data.token, data.user);
        if (tab === 'candidate') {
          router.push('/dashboard/candidato/cv');
        } else {
          router.push('/dashboard/empresa/vacantes/nueva');
        }
      } else {
        setError(data.error || 'No se pudo completar el registro');
      }
    } catch (err) {
      setError('Error conectando con el servidor backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        <div className="text-center space-y-2">
          <Logo className="justify-center" />
          <h2 className="text-2xl font-extrabold text-[#001428] font-['Plus_Jakarta_Sans'] pt-2">
            Crear Cuenta 100% Gratuita
          </h2>
          <p className="text-xs text-slate-500">
            Únete a la mayor red de oportunidades laborales con IA en República Dominicana.
          </p>
        </div>

        {/* SELECTOR DUAL DE ROL */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setTab('candidate')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'candidate'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCircle className="w-4 h-4" /> Soy Candidato
          </button>
          <button
            type="button"
            onClick={() => setTab('company')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'company'
                ? 'bg-[#0F2942] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" /> Soy Empresa
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'company' && (
            <div className="p-4 bg-sky-50/70 border border-sky-200/70 rounded-2xl space-y-3">
              <div className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-sky-700" /> Datos Corporativos
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre de la Empresa o Razón Social
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ej. Altice Dominicana, Banco BHD..."
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">RNC (DGII)</label>
                  <input
                    type="text"
                    value={rnc}
                    onChange={(e) => setRnc(e.target.value)}
                    placeholder="101-00000-0"
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sector</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option>Tecnología & Telecomunicaciones</option>
                    <option>BPO & Call Center</option>
                    <option>Banca & Finanzas</option>
                    <option>Turismo & Hospitalidad</option>
                    <option>Comercio & Retail</option>
                    <option>Zonas Francas & Manufactura</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nombre</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Carlos"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Apellido</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Rosario"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Provincia (RD)</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {provincesRD.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-normal pt-1">
            Al registrarte aceptas las políticas de privacidad y los lineamientos de la Ley 172-13 sobre protección de datos personales de la República Dominicana.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0051d5] hover:bg-[#0041ab] text-white font-extrabold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer mt-3"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Completar Registro Gratis <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            ¿Ya tienes una cuenta registrada?{' '}
            <Link href="/auth/login" className="font-bold text-blue-600 hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

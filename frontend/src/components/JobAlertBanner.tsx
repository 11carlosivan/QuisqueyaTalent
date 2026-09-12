'use client';

import React, { useState } from 'react';
import { API_URL } from '@/lib/api';
import { Bell, Mail, CheckCircle2, Loader2, Sparkles, MapPin } from 'lucide-react';

const PROVINCES_RD = [
  'Todas las provincias',
  'Distrito Nacional',
  'Santo Domingo',
  'Santiago',
  'La Altagracia (Punta Cana / Bávaro)',
  'San Cristóbal',
  'La Romana',
  'Puerto Plata',
  'Duarte (San Francisco de Macorís)',
  'La Vega',
];

const CATEGORIES_RD = [
  'Todas las categorías',
  'Call Center y BPO',
  'Tecnología y Sistemas',
  'Ventas y Comercio',
  'Administración y Finanzas',
  'Servicio al Cliente',
  'Hotelería y Turismo',
  'Salud y Farmacia',
  'Logística y Almacén',
];

export const JobAlertBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [email, setEmail] = useState('');
  const [province, setProvince] = useState('Todas las provincias');
  const [category, setCategory] = useState('Todas las categorías');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      alert('Por favor ingresa un correo electrónico válido');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/jobs/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          province: province === 'Todas las provincias' ? null : province,
          category: category === 'Todas las categorías' ? null : category,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setMessage(data.message || '¡Te has suscrito con éxito!');
        setEmail('');
      } else {
        alert(data.error || 'Error al suscribirte');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al procesar tu solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-3xl p-8 text-white shadow-xl border border-blue-800 text-center space-y-3 animate-fade-in my-8">
        <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold">¡Alerta de Empleo Activada! 🇩🇴</h3>
        <p className="text-slate-300 text-sm max-w-md mx-auto">
          {message || 'Te enviaremos las vacantes más recientes directamente a tu correo.'}
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-xs text-blue-300 hover:text-white underline font-semibold mt-2"
        >
          Crear otra alerta
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#001428] via-[#002244] to-[#0a3560] rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-blue-900/50 my-10">
      {/* Glow decorativo de fondo */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
          <Bell className="w-3.5 h-3.5 text-blue-400 animate-bounce" /> Alertas Gratuitas
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          ¿No encontraste la vacante ideal hoy?
        </h3>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
          Activa tu alerta y recibe en tu correo las vacantes nuevas de República Dominicana antes de que se llenen los cupos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 max-w-3xl mx-auto space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Email input */}
          <div className="relative sm:col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition backdrop-blur-xs"
            />
          </div>

          {/* Selector Provincia */}
          <div className="relative sm:col-span-1">
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full px-4 py-3.5 bg-[#001f3f] border border-white/20 rounded-2xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            >
              {PROVINCES_RD.map((p) => (
                <option key={p} value={p} className="bg-slate-900 text-white">
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Selector Categoría */}
          <div className="relative sm:col-span-1">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3.5 bg-[#001f3f] border border-white/20 rounded-2xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            >
              {CATEGORIES_RD.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botón de suscripción */}
        <div className="text-center pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto min-w-[240px] px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-2xl transition-all duration-200 shadow-lg shadow-blue-600/30 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Guardando alerta...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Activar Alerta Gratis
              </>
            )}
          </button>
          <p className="text-[11px] text-slate-400 mt-2.5">
            🔒 Cero spam. Puedes cancelar tu suscripción en cualquier momento con un solo clic.
          </p>
        </div>
      </form>
    </div>
  );
};

export default JobAlertBanner;

'use client';

import React, { useState } from 'react';
import { API_URL } from '@/lib/api';
import { Bell, Mail, CheckCircle2, Loader2, Sparkles, MapPin } from 'lucide-react';
import { toast } from './Toast';

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
      toast.warning('Por favor ingresa un correo electrónico válido', 'Correo Requerido');
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
        toast.success(data.message || '¡Alerta de empleo activada con éxito!', 'Suscripción Lista');
      } else {
        toast.error(data.error || 'Error al suscribirte a las alertas', 'No se pudo suscribir');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión al procesar tu solicitud. Intenta nuevamente.', 'Error de Conexión');
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

      {/* Acceso Directo al Canal y Grupo Oficial de WhatsApp */}
      <div className="relative z-10 max-w-xl mx-auto mt-8 pt-6 border-t border-white/10 text-center space-y-3">
        <p className="text-xs text-slate-300">
          ¿Prefieres recibir las vacantes al instante en tu WhatsApp? 📲
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="https://whatsapp.com/channel/0029Vb8cLMwElagrpADWIk0T"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 font-extrabold text-xs sm:text-sm rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-950/40 cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current text-slate-950" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.13.556 4.129 1.528 5.867l-1.528 5.584 5.713-1.498c1.705.93 3.65 1.447 5.717 1.447 6.627 0 12-5.373 12-12s-5.373-12-12-12z"/>
            </svg>
            📢 Unirme al Canal Oficial (Alertas)
          </a>
          <a
            href="https://chat.whatsapp.com/F3LjBjLYwSl3TzLQUoe70b"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-2xl border border-white/20 transition-all duration-200 cursor-pointer"
          >
            💬 Grupo de WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default JobAlertBanner;

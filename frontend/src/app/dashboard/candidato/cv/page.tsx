'use client';

import { API_URL } from '@/lib/api';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth-context';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Download,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Loader2,
  ArrowLeft,
  Check,
  Camera,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  RotateCcw,
  RotateCw,
  Maximize2,
  Palette,
  Type,
  AlignJustify,
  Layers,
  Cloud,
  ExternalLink,
  Link2,
  List,
  ListOrdered,
  AlignLeft,
  RefreshCw,
  X,
  Eye,
  ShieldCheck,
  Star,
  BookOpen,
  FolderPlus,
  Compass,
  FileCheck,
  Undo2,
  Redo2,
  FileSpreadsheet,
  Pencil,
  GripVertical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Tipos de plantillas disponibles (11 Diseños oficiales de CVwizard)
export type TemplateId =
  | 'cronologica'
  | 'elegante'
  | 'circular'
  | 'moderna'
  | 'deluxe'
  | 'clasica'
  | 'informal'
  | 'horizontal'
  | 'vertical'
  | 'metro'
  | 'sencilla'
  // Alias de compatibilidad previa
  | 'curved'
  | 'executive'
  | 'sidebar'
  | 'creative'
  | 'twocolumn'
  | 'minimalist'
  | 'ats';

interface TemplateOption {
  id: TemplateId;
  name: string;
  category: string;
  description: string;
  badge?: string;
  previewBg: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'cronologica',
    name: 'Cronológica',
    category: 'Secuencial',
    description: 'Estructura cronológica limpia de una columna con fechas destacadas y acento superior.',
    badge: 'Popular',
    previewBg: 'bg-gradient-to-br from-blue-700 to-indigo-900',
  },
  {
    id: 'elegante',
    name: 'Elegante',
    category: 'Corporativo',
    description: 'Encabezado superior a color completo y dos columnas equilibradas para máxima distinción.',
    badge: 'Recomendado',
    previewBg: 'bg-gradient-to-br from-slate-800 to-slate-950',
  },
  {
    id: 'circular',
    name: 'Circular',
    category: 'Creativo & Moderno',
    description: 'Estilo Stanford con cabecera curva en columna lateral, foto circular y diseño armónico.',
    badge: 'Más Usado',
    previewBg: 'bg-gradient-to-br from-blue-600 to-cyan-800',
  },
  {
    id: 'moderna',
    name: 'Moderna',
    category: 'Tecnología & Startups',
    description: 'Barra lateral de fondo sólido a color completo, texto blanco de alto impacto y perfil dinámico.',
    badge: 'Top IT',
    previewBg: 'bg-gradient-to-br from-teal-700 to-cyan-900',
  },
  {
    id: 'deluxe',
    name: 'Deluxe',
    category: 'Ejecutivo Premium',
    description: 'Monograma "CV" de lujo, tipografía refinada, marco de foto doble y dos columnas equilibradas.',
    badge: 'Premium',
    previewBg: 'bg-gradient-to-br from-amber-700 to-yellow-900',
  },
  {
    id: 'clasica',
    name: 'Clásica',
    category: 'Tradicional & ATS',
    description: 'Encabezados con bandas horizontales sólidas, formato sobrio y 100% compatible con filtros ATS.',
    badge: '100% ATS',
    previewBg: 'bg-gradient-to-br from-slate-900 to-black',
  },
  {
    id: 'informal',
    name: 'Informal',
    category: 'Creativo & Amigable',
    description: 'Fondo suave pastel en lateral, etiquetas redondeadas, viñetas de color y estética cercana.',
    previewBg: 'bg-gradient-to-br from-purple-600 to-pink-700',
  },
  {
    id: 'horizontal',
    name: 'Horizontal',
    category: 'Visual & Dinámico',
    description: 'Banda ancha horizontal superior con foto superpuesta, franja de contacto y doble columna.',
    previewBg: 'bg-gradient-to-br from-blue-600 to-emerald-700',
  },
  {
    id: 'vertical',
    name: 'Vertical',
    category: 'Líneas Nítidas',
    description: 'Franja vertical de acento en el margen izquierdo, divisor central y jerarquía visual nítida.',
    previewBg: 'bg-gradient-to-br from-indigo-700 to-violet-900',
  },
  {
    id: 'metro',
    name: 'Metro',
    category: 'Diseño Suizo',
    description: 'Bloques geométricos sólidos para cada sección, cuadrícula compacta de habilidades y alto orden.',
    previewBg: 'bg-gradient-to-br from-sky-700 to-blue-900',
  },
  {
    id: 'sencilla',
    name: 'Sencilla',
    category: 'Minimalista Nórdico',
    description: 'Máximo espacio en blanco, líneas ultra finas, lectura fluida y formato ideal para imprimir.',
    previewBg: 'bg-gradient-to-br from-neutral-500 to-neutral-800',
  },
];

const MONTHS = [
  'Mes',
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const YEARS = ['Año', ...Array.from({ length: 45 }, (_, i) => String(2026 - i))];

// Renderizador de miniaturas de documentos reales para el modal y el drawer
const renderTemplateRealSheet = (
  id: TemplateId,
  color: string,
  personal?: { firstName?: string; lastName?: string; targetJob?: string; photoUrl?: string }
) => {
  const norm =
    id === 'curved' ? 'circular' :
    id === 'executive' ? 'cronologica' :
    id === 'sidebar' ? 'moderna' :
    id === 'creative' ? 'informal' :
    id === 'twocolumn' ? 'elegante' :
    id === 'minimalist' ? 'sencilla' :
    id === 'ats' ? 'clasica' :
    id;

  const fName = personal?.firstName || 'Carlos';
  const lName = personal?.lastName || 'Rosario';
  const job = personal?.targetJob || 'Gerente de Proyectos TI';
  const photo = personal?.photoUrl;
  const initials = `${fName[0] || 'C'}${lName[0] || 'R'}`;

  switch (norm) {
    case 'cronologica':
      return (
        <div className="w-full h-full bg-white flex flex-col select-none text-[6px] leading-tight overflow-hidden">
          {/* Banda de acento superior */}
          <div className="w-full h-1.5 shrink-0" style={{ backgroundColor: color }} />
          <div className="p-2 flex-1 flex flex-col justify-between space-y-1">
            {/* Cabecera con Foto */}
            <div className="flex items-start justify-between pb-1.5 border-b border-slate-200">
              <div className="space-y-0.5">
                <div className="text-[8.5px] font-black text-slate-900 tracking-tight leading-none uppercase">
                  {fName} {lName}
                </div>
                <div className="text-[5.5px] font-bold uppercase tracking-wider" style={{ color }}>
                  {job}
                </div>
                <div className="text-[4.5px] text-slate-500 pt-0.5 flex items-center gap-1">
                  <span>carlos@email.com</span>
                  <span>•</span>
                  <span>+1 809-555-3421</span>
                  <span>•</span>
                  <span>Santo Domingo</span>
                </div>
              </div>
              {photo ? (
                <div className="w-6 h-6 rounded-md overflow-hidden border shrink-0" style={{ borderColor: color }}>
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-white font-extrabold text-[7px]" style={{ backgroundColor: color }}>
                  {initials}
                </div>
              )}
            </div>

            {/* Perfil */}
            <div className="space-y-0.5">
              <div className="text-[5.5px] font-black uppercase tracking-wider pb-0.5 border-b" style={{ color, borderColor: `${color}40` }}>
                Perfil Profesional
              </div>
              <div className="text-[4.5px] text-slate-600 line-clamp-2 leading-relaxed">
                Ingeniero de Software Full Stack apasionado por construir productos digitales de clase mundial con arquitecturas escalables en la nube.
              </div>
            </div>

            {/* Experiencia */}
            <div className="space-y-0.5">
              <div className="text-[5.5px] font-black uppercase tracking-wider pb-0.5 border-b" style={{ color, borderColor: `${color}40` }}>
                Experiencia Laboral
              </div>
              <div className="space-y-1">
                <div>
                  <div className="flex justify-between items-center text-[5px]">
                    <span className="font-bold text-slate-800">Senior Full Stack Developer</span>
                    <span className="text-[4.5px] text-slate-400">2022 - Pres.</span>
                  </div>
                  <div className="text-[4.5px] text-slate-500">Tech Caribe Solutions • Santo Domingo</div>
                  <div className="text-[4px] text-slate-600 line-clamp-1 mt-0.5">
                    • Liderazgo técnico en microservicios y portales web bancarios.
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-[5px]">
                    <span className="font-bold text-slate-800">Frontend Developer</span>
                    <span className="text-[4.5px] text-slate-400">2020 - 2022</span>
                  </div>
                  <div className="text-[4.5px] text-slate-500">Innova Web RD</div>
                </div>
              </div>
            </div>

            {/* Educación y Habilidades */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100">
              <div>
                <div className="text-[5px] font-bold uppercase text-slate-700 mb-0.5">Educación</div>
                <div className="text-[4.5px] font-semibold text-slate-800">Ing. de Software</div>
                <div className="text-[4px] text-slate-400">INTEC • 2016-2020</div>
              </div>
              <div>
                <div className="text-[5px] font-bold uppercase text-slate-700 mb-0.5">Habilidades</div>
                <div className="flex flex-wrap gap-0.5">
                  <span className="bg-slate-100 text-slate-700 text-[4px] font-medium px-1 py-0.2 rounded">React</span>
                  <span className="bg-slate-100 text-slate-700 text-[4px] font-medium px-1 py-0.2 rounded">Node.js</span>
                  <span className="bg-slate-100 text-slate-700 text-[4px] font-medium px-1 py-0.2 rounded">TypeScript</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'elegante':
      return (
        <div className="w-full h-full bg-white flex flex-col select-none text-[6px] leading-tight overflow-hidden">
          {/* Header a todo el ancho a color */}
          <div className="p-2 text-white flex items-center justify-between shrink-0" style={{ backgroundColor: color }}>
            <div>
              <div className="text-[8.5px] font-black uppercase tracking-wider text-white">
                {fName} {lName}
              </div>
              <div className="text-[5.5px] font-medium uppercase tracking-widest text-white/90 mt-0.5">
                {job}
              </div>
            </div>
            {photo ? (
              <div className="w-6 h-6 rounded-full overflow-hidden border border-white/80 shadow-xs shrink-0">
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-white/20 border border-white/40 shadow-xs shrink-0 flex items-center justify-center text-white font-black text-[6.5px]">
                {initials}
              </div>
            )}
          </div>

          {/* Dos Columnas Equilibradas */}
          <div className="flex-1 grid grid-cols-12 overflow-hidden">
            {/* Barra lateral */}
            <div className="col-span-4 bg-slate-50 p-1.5 border-r border-slate-100 space-y-1.5">
              <div className="space-y-0.5">
                <div className="text-[5px] font-black uppercase tracking-wider" style={{ color }}>Contacto</div>
                <div className="text-[4px] text-slate-600 truncate">carlos@email.com</div>
                <div className="text-[4px] text-slate-600 truncate">+1 809-555-3421</div>
                <div className="text-[4px] text-slate-600 truncate">Santo Domingo</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[5px] font-black uppercase tracking-wider" style={{ color }}>Habilidades</div>
                <div className="space-y-0.5">
                  <div>
                    <div className="text-[4px] font-semibold text-slate-700">TypeScript</div>
                    <div className="w-full h-0.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="w-4/5 h-full" style={{ backgroundColor: color }} />
                    </div>
                  </div>
                  <div>
                    <div className="text-[4px] font-semibold text-slate-700">React & Next.js</div>
                    <div className="w-full h-0.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="w-5/6 h-full" style={{ backgroundColor: color }} />
                    </div>
                  </div>
                  <div>
                    <div className="text-[4px] font-semibold text-slate-700">Node.js</div>
                    <div className="w-full h-0.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full" style={{ backgroundColor: color }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Principal */}
            <div className="col-span-8 p-2 space-y-1.5">
              <div className="space-y-0.5">
                <div className="text-[5.5px] font-bold uppercase tracking-wider border-b pb-0.5 text-slate-800" style={{ borderColor: `${color}40` }}>
                  Perfil Profesional
                </div>
                <p className="text-[4.5px] text-slate-600 line-clamp-2 leading-relaxed">
                  Profesional de tecnología enfocado en calidad, liderazgo de proyectos digitales y soluciones robustas.
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-[5.5px] font-bold uppercase tracking-wider border-b pb-0.5 text-slate-800" style={{ borderColor: `${color}40` }}>
                  Experiencia Laboral
                </div>
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[4.8px]">
                    <span className="font-bold text-slate-900">Tech Caribe Solutions</span>
                    <span className="text-[4px] text-slate-400">2022 - Pres.</span>
                  </div>
                  <div className="text-[4.5px] font-semibold" style={{ color }}>Senior Full Stack Developer</div>
                  <div className="text-[4px] text-slate-600 line-clamp-2">
                    Liderazgo en microservicios y pasarelas de pago de retail en el Caribe.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'circular':
      return (
        <div className="w-full h-full bg-white grid grid-cols-12 select-none text-[6px] leading-tight overflow-hidden">
          {/* Columna Izquierda con arco curvado */}
          <div className="col-span-5 bg-[#F4F6F9] border-r border-slate-200/80 flex flex-col justify-between relative">
            <div
              className="pt-2 pb-2.5 px-1 text-center text-white"
              style={{
                backgroundColor: color,
                borderBottomLeftRadius: '50% 10px',
                borderBottomRightRadius: '50% 10px',
              }}
            >
              <div className="text-[5px] font-black uppercase tracking-[0.15em] text-white">
                Curriculum
              </div>
            </div>

            <div className="p-1.5 space-y-2 flex-1">
              {photo ? (
                <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow-sm mx-auto -mt-2 bg-white">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div
                  className="w-7 h-7 rounded-full border-2 border-white shadow-sm mx-auto -mt-2 flex items-center justify-center text-white font-black text-[7px]"
                  style={{ backgroundColor: color }}
                >
                  {initials}
                </div>
              )}

              <div className="space-y-0.5 pt-0.5">
                <div className="font-bold text-[5px] uppercase tracking-wider pb-0.5 border-b" style={{ color, borderColor: `${color}30` }}>
                  Datos Personales
                </div>
                <div className="text-[4px] text-slate-600 truncate">carlos@email.com</div>
                <div className="text-[4px] text-slate-600 truncate">+1 809-555-3421</div>
                <div className="text-[4px] text-slate-600 truncate">Santo Domingo, RD</div>
              </div>

              <div className="space-y-0.5">
                <div className="font-bold text-[5px] uppercase tracking-wider pb-0.5 border-b" style={{ color, borderColor: `${color}30` }}>
                  Habilidades
                </div>
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[4px] text-slate-700">
                    <span>Full Stack</span>
                    <span>95%</span>
                  </div>
                  <div className="w-full h-0.5 bg-slate-200 rounded-full">
                    <div className="w-[95%] h-full rounded-full" style={{ backgroundColor: color }} />
                  </div>
                  <div className="flex justify-between text-[4px] text-slate-700">
                    <span>Cloud & DevOps</span>
                    <span>85%</span>
                  </div>
                  <div className="w-full h-0.5 bg-slate-200 rounded-full">
                    <div className="w-[85%] h-full rounded-full" style={{ backgroundColor: color }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="col-span-7 p-2 space-y-1.5">
            <div className="border-b border-slate-100 pb-1">
              <div className="text-[8.5px] font-black text-slate-900 tracking-tight leading-none uppercase">
                {fName} {lName}
              </div>
              <div className="text-[5.5px] font-bold uppercase tracking-wider mt-0.5" style={{ color }}>
                {job}
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[5.5px] font-black uppercase tracking-wider pb-0.5 border-b" style={{ color, borderColor: `${color}30` }}>
                Perfil
              </div>
              <div className="text-[4.5px] text-slate-600 line-clamp-2 leading-relaxed">
                Especialista enfocado en arquitecturas cloud y liderazgo de equipos de ingeniería.
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[5.5px] font-black uppercase tracking-wider pb-0.5 border-b" style={{ color, borderColor: `${color}30` }}>
                Experiencia
              </div>
              <div className="space-y-0.5">
                <div className="flex justify-between text-[4.8px]">
                  <span className="font-bold text-slate-800">Senior Full Stack Developer</span>
                  <span className="text-[4px] text-slate-400">2022 - Pres.</span>
                </div>
                <div className="text-[4.2px] text-slate-500">Tech Caribe Solutions</div>
                <div className="text-[4px] text-slate-600 line-clamp-2">
                  Diseño de arquitecturas escalables y pasarelas de pago locales.
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'moderna':
      return (
        <div className="w-full h-full bg-white grid grid-cols-12 select-none text-[6px] leading-tight overflow-hidden">
          {/* Barra lateral sólida a color */}
          <div className="col-span-5 p-2 text-white space-y-1.5 flex flex-col justify-between" style={{ backgroundColor: color }}>
            <div className="space-y-1">
              {photo ? (
                <div className="w-7 h-7 rounded-xl overflow-hidden border border-white/60 shadow-xs mx-auto">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-xl bg-white/20 border border-white/40 shadow-xs mx-auto flex items-center justify-center text-white font-black text-[7px]">
                  {initials}
                </div>
              )}
              <div className="text-center">
                <div className="text-[7.5px] font-black text-white leading-none uppercase">{fName} {lName}</div>
                <div className="text-[4.8px] font-medium text-white/80 mt-0.5">{job}</div>
              </div>
            </div>

            <div className="space-y-0.5 pt-1 border-t border-white/20">
              <div className="font-bold uppercase tracking-widest text-[4.5px] text-white/60">Contacto</div>
              <div className="text-[4px] text-white/90 truncate">carlos@email.com</div>
              <div className="text-[4px] text-white/90 truncate">+1 809-555-3421</div>
              <div className="text-[4px] text-white/90 truncate">Santo Domingo, RD</div>
            </div>

            <div className="space-y-0.5 pt-1 border-t border-white/20">
              <div className="font-bold uppercase tracking-widest text-[4.5px] text-white/60">Habilidades</div>
              <div className="flex flex-wrap gap-0.5">
                <span className="bg-white/20 text-white text-[3.8px] font-medium px-1 py-0.2 rounded">JavaScript</span>
                <span className="bg-white/20 text-white text-[3.8px] font-medium px-1 py-0.2 rounded">React</span>
                <span className="bg-white/20 text-white text-[3.8px] font-medium px-1 py-0.2 rounded">Node.js</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha Blanca */}
          <div className="col-span-7 p-2 space-y-1.5">
            <div className="space-y-0.5">
              <div className="text-[5.5px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                Perfil Profesional
              </div>
              <div className="text-[4.5px] text-slate-600 line-clamp-2 leading-relaxed">
                Desarrollador con más de 6 años de experiencia creando productos web ágiles y de alta disponibilidad.
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[5.5px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                Experiencia Laboral
              </div>
              <div className="space-y-0.5">
                <div className="flex justify-between text-[4.8px]">
                  <span className="font-bold text-slate-900">Tech Caribe Solutions</span>
                  <span className="text-[4px] text-slate-400">2022 - Pres.</span>
                </div>
                <div className="text-[4.5px] font-semibold" style={{ color }}>Senior Full Stack Developer</div>
                <div className="text-[4px] text-slate-600 line-clamp-2">
                  Liderazgo técnico en microservicios e interfaces de usuario para clientes bancarios.
                </div>
              </div>
            </div>

            <div className="space-y-0.5 pt-0.5 border-t border-slate-100">
              <div className="text-[5.5px] font-black uppercase tracking-wider text-slate-900 pb-0.5">
                Educación
              </div>
              <div className="text-[4.5px] font-bold text-slate-800">Ingeniería de Software</div>
              <div className="text-[4px] text-slate-400">INTEC • Santo Domingo</div>
            </div>
          </div>
        </div>
      );

    case 'deluxe':
      return (
        <div className="w-full h-full bg-white p-2 flex flex-col justify-between select-none text-[6px] leading-tight overflow-hidden">
          {/* Header con Monograma CV */}
          <div className="flex items-center justify-between pb-1 border-b-2 border-slate-900">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-xs flex items-center justify-center font-serif font-black text-white text-[7px] shadow-xs shrink-0" style={{ backgroundColor: color }}>
                CV
              </div>
              <div>
                <div className="text-[8px] font-serif font-bold text-slate-900 tracking-wide uppercase">
                  {fName} {lName}
                </div>
                <div className="text-[5px] font-serif uppercase tracking-widest text-slate-500">
                  {job}
                </div>
              </div>
            </div>
            {photo ? (
              <div className="w-6 h-6 border-2 border-slate-300 p-0.5 rounded-xs shrink-0">
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-6 h-6 border border-slate-300 p-0.5 rounded-xs shrink-0 flex items-center justify-center text-slate-700 font-serif font-bold text-[6px]">
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1 grid grid-cols-12 gap-1.5 pt-1.5">
            {/* Columna Izquierda */}
            <div className="col-span-5 space-y-1.5 border-r border-slate-100 pr-1">
              <div className="space-y-0.5">
                <div className="text-[5px] font-serif font-bold uppercase tracking-wider text-slate-900 border-b pb-0.5" style={{ color }}>
                  Contacto
                </div>
                <div className="text-[4px] text-slate-600">carlos@email.com</div>
                <div className="text-[4px] text-slate-600">+1 809-555-3421</div>
                <div className="text-[4px] text-slate-600">Santo Domingo</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[5px] font-serif font-bold uppercase tracking-wider text-slate-900 border-b pb-0.5" style={{ color }}>
                  Educación
                </div>
                <div className="text-[4.5px] font-serif font-semibold text-slate-800">Ing. de Software</div>
                <div className="text-[3.8px] text-slate-400">INTEC • 2016-2020</div>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="col-span-7 space-y-1.5 pl-0.5">
              <div className="space-y-0.5">
                <div className="text-[5px] font-serif font-bold uppercase tracking-wider text-slate-900 border-b pb-0.5" style={{ color }}>
                  Trayectoria
                </div>
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[4.5px]">
                    <span className="font-serif font-bold text-slate-900">Tech Caribe</span>
                    <span className="text-[3.8px] text-slate-400">2022 - Pres.</span>
                  </div>
                  <div className="text-[4px] text-slate-600 line-clamp-2">
                    Liderazgo de microservicios y pasarelas de pago bancarias en República Dominicana.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'clasica':
      return (
        <div className="w-full h-full bg-white p-2 flex flex-col justify-between select-none text-[6px] leading-tight text-center overflow-hidden">
          {/* Cabecera Centrada ATS */}
          <div className="space-y-0.5 pb-1 border-b border-slate-200">
            <div className="text-[9px] font-black uppercase tracking-wider text-slate-900">
              {fName} {lName}
            </div>
            <div className="text-[5px] font-semibold text-slate-600">
              {job} • Santo Domingo, RD
            </div>
            <div className="text-[4px] text-slate-500">
              carlos@email.com | +1 809-555-3421 | linkedin.com/in/carlos
            </div>
          </div>

          {/* Banda Sección 1 */}
          <div className="space-y-1 text-left pt-1">
            <div className="w-full bg-slate-900 text-white font-bold text-[5px] uppercase tracking-wider px-1 py-0.5 rounded-xs flex items-center">
              EXPERIENCIA LABORAL
            </div>
            <div className="space-y-0.5 px-0.5">
              <div className="flex justify-between text-[4.8px]">
                <span className="font-bold text-slate-900">Senior Full Stack Developer</span>
                <span className="text-[4px] text-slate-500 font-semibold">2022 - Presente</span>
              </div>
              <div className="text-[4.2px] text-slate-600 font-medium">Tech Caribe Solutions — Santo Domingo</div>
              <div className="text-[4px] text-slate-600 space-y-0.2">
                <div>• Desarrollo y mantenimiento de arquitecturas cloud en GCP y AWS.</div>
                <div>• Optimización del 40% en tiempos de respuesta de transacciones.</div>
              </div>
            </div>
          </div>

          {/* Banda Sección 2 */}
          <div className="space-y-0.5 text-left pt-0.5">
            <div className="w-full bg-slate-900 text-white font-bold text-[5px] uppercase tracking-wider px-1 py-0.5 rounded-xs flex items-center">
              EDUCACIÓN & CERTIFICACIONES
            </div>
            <div className="px-0.5 flex justify-between text-[4.5px]">
              <div>
                <span className="font-bold text-slate-900">Ingeniería de Software</span>
                <span className="text-[4px] text-slate-500"> — INTEC</span>
              </div>
              <span className="text-[4px] text-slate-400">2016 - 2020</span>
            </div>
          </div>

          {/* Banda Sección 3 */}
          <div className="space-y-0.5 text-left pt-0.5">
            <div className="w-full bg-slate-900 text-white font-bold text-[5px] uppercase tracking-wider px-1 py-0.5 rounded-xs flex items-center">
              HABILIDADES PRINCIPALES
            </div>
            <div className="text-[4px] text-slate-700 px-0.5">
              JavaScript, TypeScript, React, Next.js, Node.js, Express, MySQL, Docker, AWS, Git.
            </div>
          </div>
        </div>
      );

    case 'informal':
      return (
        <div className="w-full h-full bg-white grid grid-cols-12 select-none text-[6px] leading-tight overflow-hidden">
          {/* Barra pastel */}
          <div className="col-span-5 p-1.5 space-y-1.5 flex flex-col justify-between" style={{ backgroundColor: `${color}15` }}>
            <div className="space-y-1 text-center">
              {photo ? (
                <div className="w-7 h-7 rounded-full overflow-hidden border border-white shadow-xs mx-auto">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full border border-white shadow-xs mx-auto flex items-center justify-center text-white font-black text-[7px]" style={{ backgroundColor: color }}>
                  {initials}
                </div>
              )}
              <div className="text-[7.5px] font-black text-slate-900 leading-none">{fName}</div>
              <div className="text-[4.5px] text-slate-600">{job}</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[4.8px] font-bold text-slate-800">Contacto</div>
              <div className="text-[4px] text-slate-600 truncate">carlos@email.com</div>
              <div className="text-[4px] text-slate-600 truncate">+1 809-555-3421</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[4.8px] font-bold text-slate-800">Habilidades</div>
              <div className="flex flex-wrap gap-0.5">
                <span className="text-[3.8px] font-bold px-1 py-0.2 rounded-full" style={{ backgroundColor: `${color}30`, color }}>React</span>
                <span className="text-[3.8px] font-bold px-1 py-0.2 rounded-full" style={{ backgroundColor: `${color}30`, color }}>Node</span>
                <span className="text-[3.8px] font-bold px-1 py-0.2 rounded-full" style={{ backgroundColor: `${color}30`, color }}>AWS</span>
              </div>
            </div>
          </div>

          <div className="col-span-7 p-2 space-y-1.5">
            <div className="space-y-0.5">
              <div className="text-[5.5px] font-bold flex items-center gap-1" style={{ color }}>
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: color }} /> Perfil
              </div>
              <div className="text-[4.5px] text-slate-600 line-clamp-2">
                Ingeniero creativo enfocado en UX moderna y desarrollo full stack ágil.
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[5.5px] font-bold flex items-center gap-1" style={{ color }}>
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: color }} /> Experiencia
              </div>
              <div className="space-y-0.5">
                <div className="flex justify-between text-[4.8px]">
                  <span className="font-bold text-slate-800">Tech Caribe</span>
                  <span className="text-[4px] text-slate-400">2022-Pres.</span>
                </div>
                <div className="text-[4px] text-slate-600 line-clamp-2">
                  Desarrollo de microservicios e interfaces de usuario para clientes bancarios.
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'horizontal':
      return (
        <div className="w-full h-full bg-white flex flex-col select-none text-[6px] leading-tight overflow-hidden">
          {/* Banda ancha superior */}
          <div className="h-6 px-2 flex items-center justify-between text-white shrink-0" style={{ backgroundColor: color }}>
            <div className="text-[8px] font-black uppercase tracking-wider text-white">
              {fName} {lName}
            </div>
            <div className="text-[5px] text-white/80">{job}</div>
          </div>

          {/* Franja de contacto con foto flotante */}
          <div className="px-2 -mt-2.5 flex items-center justify-between">
            {photo ? (
              <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-white shadow-xs shrink-0 bg-white">
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-white border-2 border-white shadow-xs shrink-0 flex items-center justify-center font-bold text-[6px]" style={{ color }}>
                {initials}
              </div>
            )}
            <div className="text-[4.2px] text-slate-500 flex items-center gap-1.5 pt-2">
              <span>carlos@email.com</span>
              <span>•</span>
              <span>+1 809-555-3421</span>
              <span>•</span>
              <span>Santo Domingo</span>
            </div>
          </div>

          {/* Doble columna */}
          <div className="p-2 flex-1 grid grid-cols-2 gap-1.5 pt-2">
            <div className="space-y-1">
              <div className="text-[5px] font-bold uppercase pl-1 border-l-2 text-slate-800" style={{ borderColor: color }}>
                Experiencia
              </div>
              <div className="space-y-0.5">
                <div className="text-[4.5px] font-bold text-slate-800">Senior Developer</div>
                <div className="text-[3.8px] text-slate-500">Tech Caribe • 2022 - Pres.</div>
                <div className="text-[4px] text-slate-600 line-clamp-2">
                  Liderazgo de proyectos clave en sector bancario y retail.
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[5px] font-bold uppercase pl-1 border-l-2 text-slate-800" style={{ borderColor: color }}>
                Habilidades
              </div>
              <div className="space-y-0.5">
                <div className="text-[4.2px] font-semibold text-slate-700">TypeScript / React</div>
                <div className="text-[4.2px] font-semibold text-slate-700">Node.js / Express</div>
                <div className="text-[4.2px] font-semibold text-slate-700">PostgreSQL / Cloud</div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'vertical':
      return (
        <div className="w-full h-full bg-white flex select-none text-[6px] leading-tight overflow-hidden">
          {/* Franja vertical de acento */}
          <div className="w-1.5 h-full shrink-0" style={{ backgroundColor: color }} />
          <div className="p-2 flex-1 flex flex-col justify-between space-y-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div>
                <div className="text-[8px] font-black text-slate-900 uppercase">{fName} {lName}</div>
                <div className="text-[5px] font-semibold text-slate-500">{job}</div>
              </div>
              {photo ? (
                <div className="w-6 h-6 rounded-full overflow-hidden border shrink-0">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-[6px]" style={{ backgroundColor: color }}>
                  {initials}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5 flex-1">
              <div className="space-y-1 border-r border-slate-100 pr-1">
                <div className="text-[5px] font-bold uppercase text-slate-800">Trayectoria</div>
                <div className="text-[4.5px] font-semibold text-slate-900">Tech Caribe Solutions</div>
                <div className="text-[4px] text-slate-600 line-clamp-2">
                  Desarrollo de microservicios escalables.
                </div>
              </div>
              <div className="space-y-1 pl-0.5">
                <div className="text-[5px] font-bold uppercase text-slate-800">Contacto & Hab.</div>
                <div className="text-[4px] text-slate-600">carlos@email.com</div>
                <div className="text-[4px] text-slate-600">TypeScript • React • Node</div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'metro':
      return (
        <div className="w-full h-full bg-white p-2 flex flex-col justify-between select-none text-[6px] leading-tight overflow-hidden">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: color }} />
              <div className="text-[8.5px] font-black text-black tracking-tighter uppercase">{fName} {lName}</div>
            </div>
            <div className="text-[5px] font-bold uppercase text-slate-500">{job}</div>
          </div>

          <div className="space-y-1">
            <div className="px-1 py-0.5 text-white font-bold text-[5px] uppercase rounded-xs" style={{ backgroundColor: color }}>
              Experiencia Laboral
            </div>
            <div className="px-0.5 space-y-0.5">
              <div className="flex justify-between text-[4.8px]">
                <span className="font-bold text-slate-900">Tech Caribe Solutions</span>
                <span className="text-[4px] text-slate-400">2022 - Pres.</span>
              </div>
              <div className="text-[4px] text-slate-600 line-clamp-1">
                Liderazgo de microservicios y arquitectura cloud.
              </div>
            </div>
          </div>

          <div className="space-y-1 pt-0.5">
            <div className="px-1 py-0.5 text-white font-bold text-[5px] uppercase rounded-xs" style={{ backgroundColor: color }}>
              Habilidades Clave
            </div>
            <div className="grid grid-cols-3 gap-0.5 px-0.5">
              <span className="bg-slate-100 text-slate-800 text-[4px] font-semibold text-center p-0.5 rounded-xs">Frontend</span>
              <span className="bg-slate-100 text-slate-800 text-[4px] font-semibold text-center p-0.5 rounded-xs">Backend</span>
              <span className="bg-slate-100 text-slate-800 text-[4px] font-semibold text-center p-0.5 rounded-xs">Cloud</span>
            </div>
          </div>
        </div>
      );

    case 'sencilla':
    default:
      return (
        <div className="w-full h-full bg-white p-2.5 flex flex-col justify-between select-none text-[6px] leading-tight text-center overflow-hidden">
          <div className="space-y-0.5 pb-1 border-b border-slate-100">
            <div className="text-[9px] font-light tracking-wide text-slate-900 uppercase">
              {fName} {lName}
            </div>
            <div className="text-[5px] font-normal text-slate-500">
              {job} • Santo Domingo, RD
            </div>
            <div className="text-[4px] text-slate-400">
              carlos@email.com | +1 809-555-3421
            </div>
          </div>

          <div className="space-y-1 text-left pt-1">
            <div className="text-[5px] font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-0.5">
              Experiencia Laboral
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between text-[4.8px]">
                <span className="font-semibold text-slate-900">Tech Caribe Solutions</span>
                <span className="text-[4px] text-slate-400">2022 - Presente</span>
              </div>
              <div className="text-[4.2px] text-slate-500">Senior Developer</div>
              <div className="text-[4px] text-slate-600 line-clamp-2">
                Desarrollo de microservicios y soluciones escalables en la nube.
              </div>
            </div>
          </div>

          <div className="space-y-0.5 text-left pt-0.5">
            <div className="text-[5px] font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-0.5">
              Educación
            </div>
            <div className="text-[4.5px] text-slate-700">INTEC — Ingeniería de Software</div>
          </div>
        </div>
      );
  }
};

const renderMiniTemplateThumbnail = (id: TemplateId, color: string) => {
  return renderTemplateRealSheet(id, color);
};

export default function CVBuilderPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados generales
  const [saving, setSaving] = useState(false);
  const [improvingAI, setImprovingAI] = useState(false);
  const [atsScore, setAtsScore] = useState(94);
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>('cronologica');
  const [showTemplateDrawer, setShowTemplateDrawer] = useState(false);
  const [activeColor, setActiveColor] = useState('#2B547E'); // Azul pizarra estilo CVwizard
  const [activeFont, setActiveFont] = useState('Inter');
  const [fontSizeScale, setFontSizeScale] = useState<'S' | 'M' | 'L'>('M');
  const [activeSpacing, setActiveSpacing] = useState<'compact' | 'normal' | 'relaxed'>('normal');
  const [cvTitle, setCvTitle] = useState('CV Profesional');
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [allResumes, setAllResumes] = useState<any[]>([]);
  const [showCvDropdown, setShowCvDropdown] = useState(false);
  const [newCvModalOpen, setNewCvModalOpen] = useState(false);
  const [newCvTitle, setNewCvTitle] = useState('');
  const [isSwitchingCv, setIsSwitchingCv] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const isCurrentPrimary = allResumes.find((r) => r.id === currentResumeId)?.isDefault || false;

  // Normalización de plantilla (soporta nombres CVwizard y alias de compatibilidad)
  const normalizedTemplate: TemplateId =
    activeTemplate === 'curved' ? 'circular' :
    activeTemplate === 'executive' ? 'cronologica' :
    activeTemplate === 'sidebar' ? 'moderna' :
    activeTemplate === 'creative' ? 'informal' :
    activeTemplate === 'twocolumn' ? 'elegante' :
    activeTemplate === 'minimalist' ? 'sencilla' :
    activeTemplate === 'ats' ? 'clasica' :
    activeTemplate;

  // Menús emergentes de la barra inferior
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSpacingMenu, setShowSpacingMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [customHexInput, setCustomHexInput] = useState('#2B547E');

  // Secciones colapsables del formulario (fiel a CVwizard)
  const [openPersonal, setOpenPersonal] = useState(true);
  const [openSummary, setOpenSummary] = useState(true);
  const [openEdu, setOpenEdu] = useState(true);
  const [openExp, setOpenExp] = useState(true);
  const [openSkills, setOpenSkills] = useState(true);
  const [openLanguages, setOpenLanguages] = useState(false);
  const [openHobbies, setOpenHobbies] = useState(false);
  const [openCertificates, setOpenCertificates] = useState(false);
  const [openReferences, setOpenReferences] = useState(false);

  // Estados de edición activa de ítems (permite colapsar al hacer clic en Aceptar)
  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [editingRefId, setEditingRefId] = useState<string | null>(null);

  // Foto de perfil
  const [photoUrl, setPhotoUrl] = useState<string>('');

  // 1. DATOS PERSONALES
  const [personalData, setPersonalData] = useState({
    firstName: 'Carlos',
    lastName: 'Rosario',
    targetJob: 'Desarrollador Full Stack Senior',
    useAsTitle: true,
    email: 'carlos.rosario@email.com',
    phone: '+1 809-555-3421',
    address: 'Av. 27 de Febrero #450, Piantini',
    postalCode: '10148',
    city: 'Santo Domingo',
    // Campos dinámicos adicionales
    birthDate: '',
    birthPlace: '',
    driverLicense: '',
    gender: '',
    nationality: 'Dominicana',
    maritalStatus: '',
    website: 'https://carlosrosario.dev',
    linkedin: 'linkedin.com/in/carlos-rosario-rd',
  });

  // Campos dinámicos activos
  const [enabledFields, setEnabledFields] = useState<string[]>([
    'nationality',
    'linkedin',
    'website',
  ]);

  // 2. PERFIL / RESUMEN
  const [summary, setSummary] = useState(
    'Profesional comprometido y responsable con amplia capacidad para adaptarse a diferentes entornos laborales y aprender nuevas habilidades rápidamente. Especialista en ingeniería de software y desarrollo web full stack con enfoque en rendimiento, escalabilidad y buenas prácticas.'
  );

  const defaultProfileSuggestion =
    'Profesional comprometido y responsable con amplia capacidad para adaptarse a diferentes entornos laborales y aprender nuevas habilidades rápidamente.';

  // 3. FORMACIÓN (EDUCACIÓN)
  const [education, setEducation] = useState<any[]>([
    {
      id: 'edu-1',
      degree: 'Ingeniería de Software',
      institution: 'Instituto Tecnológico de Santo Domingo (INTEC)',
      city: 'Santo Domingo',
      startMonth: 'Agosto',
      startYear: '2015',
      endMonth: 'Octubre',
      endYear: '2019',
      isCurrent: false,
      description:
        'Graduado Magna Cum Laude. Enfoque en sistemas distribuidos, bases de datos relacionales y arquitectura de software orientada a microservicios.',
    },
  ]);

  // 4. EXPERIENCIA LABORAL
  const [experiences, setExperiences] = useState<any[]>([
    {
      id: 'exp-1',
      position: 'Senior Full Stack Developer',
      company: 'Tech Caribe Solutions',
      city: 'Santo Domingo',
      startMonth: 'Enero',
      startYear: '2022',
      endMonth: 'Mes',
      endYear: 'Año',
      isCurrent: true,
      description:
        '• Lideró el rediseño de la arquitectura frontend con React y TypeScript, acelerando tiempos de carga en un 40%.\n• Diseñó microservicios en Node.js que procesan más de 50,000 transacciones diarias de clientes bancarios.\n• Mentorizó a un equipo de 5 ingenieros junior en buenas prácticas de código y testing automatizado.',
    },
    {
      id: 'exp-2',
      position: 'Desarrollador Web Frontend',
      company: 'Innova Web RD',
      city: 'Santiago',
      startMonth: 'Junio',
      startYear: '2019',
      endMonth: 'Diciembre',
      endYear: '2021',
      isCurrent: false,
      description:
        '• Construyó más de 12 portales comerciales integrando pasarelas de pago dominicanas (CardNet, Azul).\n• Optimizó la compatibilidad móvil y el SEO técnico de portales de comercio electrónico en el país.',
    },
  ]);

  // 5. HABILIDADES
  const [skills, setSkills] = useState<any[]>([
    { name: 'TypeScript', level: 'Experto' },
    { name: 'React / Next.js', level: 'Experto' },
    { name: 'Node.js / Express', level: 'Avanzado' },
    { name: 'MySQL / PostgreSQL', level: 'Avanzado' },
    { name: 'Tailwind CSS', level: 'Experto' },
    { name: 'Arquitectura Cloud (AWS)', level: 'Intermedio' },
  ]);

  const [newSkill, setNewSkill] = useState({ name: '', level: 'Intermedio' });

  // Sugerencias rápidas de habilidades
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([
    'Comunicación efectiva',
    'Trabajo en equipo',
    'Resolución de problemas',
    'Gestión del tiempo',
    'Adaptabilidad',
  ]);

  // 6. IDIOMAS
  const [languages, setLanguages] = useState<any[]>([
    { name: 'Español', proficiency: 'Nativo' },
    { name: 'Inglés', proficiency: 'Avanzado / C1' },
  ]);

  // 7. AFICIONES E INTERESES
  const [hobbies, setHobbies] = useState<string[]>([
    'Ajedrez competitivo',
    'Mentoría técnica',
    'Fotografía urbana',
  ]);

  // 8. CERTIFICACIONES Y CURSOS
  const [certificates, setCertificates] = useState<any[]>([
    {
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      year: '2023',
    },
  ]);

  // 9. REFERENCIAS
  const [references, setReferences] = useState<any[]>([
    {
      name: 'Ing. Marcos Guzmán',
      company: 'Tech Caribe Solutions',
      contact: 'mguzman@techcaribe.com.do - (809) 555-0199',
    },
  ]);

  // Paleta de colores preestablecidos estilo CVwizard
  const presetColors = [
    { name: 'Azul Pizarra (CVwizard)', hex: '#2B547E' },
    { name: 'Verde Bosque', hex: '#2D5A3F' },
    { name: 'Borgoña Ejecutivo', hex: '#7B2234' },
    { name: 'Gris Grafito', hex: '#37474F' },
    { name: 'Azul Cielo', hex: '#4A90E2' },
    { name: 'Dorado Cálido', hex: '#C59B27' },
  ];

  // Tipografías
  const fontOptions = [
    { name: 'Inter (Sans)', value: 'Inter, sans-serif' },
    { name: 'Arial (ATS Clásico)', value: 'Arial, sans-serif' },
    { name: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', sans-serif" },
    { name: 'Georgia (Serif Ejecutivo)', value: 'Georgia, serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
  ];

  // Función para poblar el constructor con los datos de un CV
  const loadResumeData = (res: any) => {
    if (!res) return;
    setCurrentResumeId(res.id);
    if (res.title) setCvTitle(res.title);
    if (res.summary) setSummary(res.summary);
    if (res.atsScore) setAtsScore(res.atsScore);
    if (res.templateName && TEMPLATES.some((t) => t.id === res.templateName)) {
      setActiveTemplate(res.templateName as TemplateId);
    }
    if (res.experiences) setExperiences(res.experiences);
    if (res.education) setEducation(res.education);
    if (res.skills) setSkills(res.skills);
    if (res.languages) setLanguages(res.languages);
  };

  // Cargar CV al iniciar
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (token) {
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const paramResumeId = urlParams?.get('resumeId');
      const fetchUrl = paramResumeId
        ? `${API_URL}/api/resumes/my?resumeId=${paramResumeId}`
        : `${API_URL}/api/resumes/my`;

      fetch(fetchUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => {
          if (!r.ok) return null;
          return r.json();
        })
        .then((data) => {
          if (data && data.resume) {
            loadResumeData(data.resume);
          }
          if (data && Array.isArray(data.allResumes)) {
            setAllResumes(data.allResumes);
          }
          if (data && data.profile) {
            const p = data.profile;
            setPersonalData((prev) => ({
              ...prev,
              firstName: p.firstName || prev.firstName,
              lastName: p.lastName || prev.lastName,
              phone: p.phone || prev.phone,
              city: p.city || prev.city,
              targetJob: p.headline || prev.targetJob,
              linkedin: p.linkedinUrl || prev.linkedin,
              website: p.portfolioUrl || prev.website,
            }));
            if (p.avatarUrl) setPhotoUrl(p.avatarUrl);
          }
        })
        .catch((err) => {
          console.warn('Carga activa:', err.message);
        });
    }
  }, [user, token, isLoading]);

  // Cambiar de CV dentro del creador
  const handleSelectResume = async (targetId: string) => {
    if (targetId === currentResumeId || !token) return;
    setIsSwitchingCv(true);
    setShowCvDropdown(false);
    try {
      const res = await fetch(`${API_URL}/api/resumes/my?resumeId=${targetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.resume) {
        loadResumeData(data.resume);
        if (Array.isArray(data.allResumes)) {
          setAllResumes(data.allResumes);
        }
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.set('resumeId', targetId);
          window.history.pushState({}, '', url.toString());
        }
      }
    } catch (e) {
      console.error('Error al cambiar de CV:', e);
    } finally {
      setIsSwitchingCv(false);
    }
  };

  // Establecer el CV actual como principal desde el creador
  const handleSetCurrentAsPrimary = async () => {
    if (!token || !currentResumeId) return;
    try {
      const res = await fetch(`${API_URL}/api/resumes/${currentResumeId}/set-primary`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
        setAllResumes((prev) =>
          prev.map((r) => ({
            ...r,
            isDefault: r.id === currentResumeId,
          }))
        );
      }
    } catch (e) {
      console.error('Error al marcar principal:', e);
    }
  };

  // Crear una nueva versión desde el creador
  const handleCreateNewVersionFromBuilder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newCvTitle.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/resumes/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newCvTitle.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.resume) {
        setNewCvModalOpen(false);
        setNewCvTitle('');
        setAllResumes((prev) => [data.resume, ...prev]);
        loadResumeData(data.resume);
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.set('resumeId', data.resume.id);
          window.history.pushState({}, '', url.toString());
        }
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.8 } });
      }
    } catch (e) {
      console.error('Error creando nueva versión:', e);
    }
  };

  // Manejador de subida de foto
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Alternar campo dinámico
  const toggleDynamicField = (fieldKey: string) => {
    if (enabledFields.includes(fieldKey)) {
      setEnabledFields(enabledFields.filter((k) => k !== fieldKey));
    } else {
      setEnabledFields([...enabledFields, fieldKey]);
    }
  };

  // Cargar ejemplo pre-llenado estilo CVwizard ("Empezar desde el ejemplo")
  const handleLoadSample = () => {
    setPersonalData({
      firstName: 'Ana',
      lastName: 'González De la Rosa',
      targetJob: 'Especialista en Marketing Digital y Crecimiento',
      useAsTitle: true,
      email: 'ana.gonzalez@ejemplo.com',
      phone: '+1 (809) 555-8899',
      address: 'Torre Empresarial Bella Vista #12',
      postalCode: '10112',
      city: 'Santo Domingo',
      birthDate: '1993-08-14',
      birthPlace: 'Santiago de los Caballeros',
      driverLicense: 'Categoría 02',
      gender: 'Femenino',
      nationality: 'Dominicana',
      maritalStatus: 'Soltera',
      website: 'https://anagonzalez.do',
      linkedin: 'linkedin.com/in/ana-gonzalez-mkt',
    });
    setEnabledFields(['nationality', 'linkedin', 'website', 'birthDate', 'driverLicense']);
    setSummary(
      'Especialista en marketing digital orientada a datos y crecimiento comercial con más de 7 años gestionando campañas multicanal en el Caribe. Experiencia comprobada en optimización de presupuestos publicitarios, embudos de conversión, SEO y fidelización de clientes para marcas líderes.'
    );
    setExperiences([
      {
        id: 'sample-1',
        position: 'Líder de Crecimiento y Adquisición',
        company: 'Grupo Caribe Digital',
        city: 'Santo Domingo',
        startMonth: 'Marzo',
        startYear: '2021',
        endMonth: 'Mes',
        endYear: 'Año',
        isCurrent: true,
        description:
          '• Diseñó y ejecutó estrategias de pauta digital con presupuesto de más de US$300,000 anuales, logrando un ROAS promedio de 4.8x.\n• Incrementó las conversiones orgánicas en un 65% mediante SEO técnico y marketing de contenidos.\n• Coordinó un equipo multidisciplinario de 6 especialistas en diseño, analítica y redacción creativa.',
      },
      {
        id: 'sample-2',
        position: 'Coordinadora de Medios Digitales',
        company: 'Agencia Creativa Quisqueya',
        city: 'Santiago',
        startMonth: 'Enero',
        startYear: '2018',
        endMonth: 'Febrero',
        endYear: '2021',
        isCurrent: false,
        description:
          '• Administró más de 20 cuentas corporativas en Google Ads y Meta Ads con KPIs de captación de leads.\n• Presentó reportes ejecutivos de rendimiento y analítica a directores comerciales de banca y telecomunicaciones.',
      },
    ]);
    setEducation([
      {
        id: 'edu-sample',
        degree: 'Licenciatura en Mercadeo y Negocios Internacionales',
        institution: 'Pontificia Universidad Católica Madre y Maestra (PUCMM)',
        city: 'Santiago',
        startMonth: 'Agosto',
        startYear: '2012',
        endMonth: 'Noviembre',
        endYear: '2016',
        isCurrent: false,
        description: 'Mención de honor en Investigación de Mercados y Comportamiento del Consumidor.',
      },
    ]);
    setSkills([
      { name: 'Google Ads & Analytics 4', level: 'Experto' },
      { name: 'Meta Ads Manager', level: 'Experto' },
      { name: 'SEO & Content Strategy', level: 'Avanzado' },
      { name: 'Email Marketing & Hubspot', level: 'Avanzado' },
      { name: 'Analítica de Datos (Tableau / SQL)', level: 'Intermedio' },
      { name: 'Gestión de Presupuestos y ROAS', level: 'Experto' },
    ]);
    setLanguages([
      { name: 'Español', proficiency: 'Nativo' },
      { name: 'Inglés', proficiency: 'Avanzado / C1' },
      { name: 'Francés', proficiency: 'Intermedio / B1' },
    ]);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
  };

  // Asistente IA para pulir texto en el CV Builder
  const handleImproveWithAI = async (field: 'summary' | 'experience' | 'skills', index?: number) => {
    setImprovingAI(true);
    try {
      if (field === 'summary') {
        const res = await fetch(`${API_URL}/api/ai/resume-improve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            originalText: summary,
            section: 'summary',
            targetRole: personalData.targetJob,
          }),
        });
        const data = await res.json();
        if (data.improvedText) {
          setSummary(data.improvedText);
        } else {
          setSummary(
            `Profesional de alto rendimiento en ${personalData.targetJob}, especializado en impulsar resultados medibles, escalabilidad y entrega continua. Destacada capacidad para liderar equipos y resolver desafíos técnicos complejos con eficiencia comprobada.`
          );
        }
      } else if (field === 'experience' && index !== undefined) {
        const exp = experiences[index];
        const res = await fetch(`${API_URL}/api/ai/resume-improve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            originalText: exp.description,
            section: 'experience',
            targetRole: exp.position,
          }),
        });
        const data = await res.json();
        const updated = [...experiences];
        if (data.improvedText) {
          updated[index].description = data.improvedText;
        } else {
          updated[index].description =
            `• Gestionó y optimizó procesos clave incrementando el rendimiento operacional en un 35%.\n• Diseñó e implementó soluciones técnicas de alta disponibilidad para miles de usuarios activos.\n• Coordinó sincronización entre departamentos logrando entregas antes del plazo previsto.`;
        }
        setExperiences(updated);
      } else if (field === 'skills') {
        setSuggestedSkills([
          'Liderazgo de proyectos',
          'Pensamiento analítico',
          'Arquitectura de software',
          'Optimización de procesos',
          'Negociación efectiva',
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setImprovingAI(false);
    }
  };

  // Guardar CV en servidor
  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/resumes/my`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumeId: currentResumeId,
          title: cvTitle,
          summary,
          templateName: activeTemplate,
          profileData: {
            firstName: personalData.firstName,
            lastName: personalData.lastName,
            phone: personalData.phone,
            city: personalData.city,
            headline: personalData.targetJob,
            avatarUrl: photoUrl,
            linkedinUrl: personalData.linkedin,
            portfolioUrl: personalData.website,
          },
          experiences,
          education,
          skills,
          languages,
        }),
      });
      if (res.ok) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.85 },
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // Descargar CV en PDF directamente (sin abrir diálogo de impresión Ctrl+P)
  const handleDownloadPDF = async () => {
    const el = document.getElementById('cv-document-canvas');
    if (!el) return;
    setDownloadingPDF(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const fileName = `${personalData.firstName || 'Curriculum'}_${personalData.lastName || 'Vitae'}_QuisqueyaTalent.pdf`;
      pdf.save(fileName);

      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.85 },
      });
    } catch (e) {
      console.error('Error generando PDF:', e);
      alert('Ocurrió un error al generar el PDF. Por favor intenta de nuevo.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  // Agregar habilidad sugerida con un clic
  const addSuggestedSkill = (skillName: string) => {
    if (!skills.some((s) => (typeof s === 'string' ? s === skillName : s.name === skillName))) {
      setSkills([...skills, { name: skillName, level: 'Avanzado' }]);
    }
    setSuggestedSkills(suggestedSkills.filter((s) => s !== skillName));
  };

  // Escalas dinámicas de espaciado y tipografía
  const fontSizes = {
    S: 'text-[9px]',
    M: 'text-[10px]',
    L: 'text-[11px]',
  }[fontSizeScale];

  const spacingStyles = {
    compact: {
      padding: 'p-5 sm:p-6',
      gap: 'space-y-3',
      leading: 'leading-tight',
      headerPadding: 'pt-5 pb-5 px-6',
    },
    normal: {
      padding: 'p-7 sm:p-8',
      gap: 'space-y-4 sm:space-y-5',
      leading: 'leading-normal',
      headerPadding: 'pt-7 pb-7 px-8',
    },
    relaxed: {
      padding: 'p-8 sm:p-10',
      gap: 'space-y-6',
      leading: 'leading-relaxed',
      headerPadding: 'pt-9 pb-9 px-8',
    },
  }[activeSpacing];

  // Renderizador unificado de datos personales
  const renderContactItems = (isDark = false) => {
    const textClass = isDark ? 'text-white/90' : 'text-slate-600';
    const linkClass = isDark ? 'text-blue-200' : 'text-blue-700 font-semibold';

    return (
      <div className={`space-y-1.5 ${fontSizes} ${textClass}`}>
        {personalData.email && (
          <div className="break-all flex items-center gap-1.5">
            <span>✉️</span>
            <span>{personalData.email}</span>
          </div>
        )}
        {personalData.phone && (
          <div className="flex items-center gap-1.5">
            <span>📱</span>
            <span>{personalData.phone}</span>
          </div>
        )}
        {personalData.city && (
          <div className="flex items-center gap-1.5">
            <span>📍</span>
            <span>
              {personalData.city}
              {personalData.address ? `, ${personalData.address}` : ''}
              {personalData.postalCode ? ` (CP ${personalData.postalCode})` : ''}
            </span>
          </div>
        )}
        {personalData.linkedin && (
          <div className={`break-all flex items-center gap-1.5 ${linkClass}`}>
            <span>🔗</span>
            <span>{personalData.linkedin}</span>
          </div>
        )}
        {personalData.website && (
          <div className="break-all flex items-center gap-1.5 font-medium">
            <span>🌐</span>
            <span>{personalData.website}</span>
          </div>
        )}
        {personalData.nationality && (
          <div className="flex items-center gap-1.5">
            <span>🇩🇴</span>
            <span>Nacionalidad: {personalData.nationality}</span>
          </div>
        )}
        {personalData.driverLicense && (
          <div className="flex items-center gap-1.5">
            <span>🚗</span>
            <span>Licencia: {personalData.driverLicense}</span>
          </div>
        )}
        {personalData.birthDate && (
          <div className="flex items-center gap-1.5">
            <span>🎂</span>
            <span>Nacimiento: {personalData.birthDate}</span>
          </div>
        )}
        {personalData.birthPlace && (
          <div className="flex items-center gap-1.5">
            <span>🌍</span>
            <span>Origen: {personalData.birthPlace}</span>
          </div>
        )}
        {personalData.gender && (
          <div className="flex items-center gap-1.5">
            <span>👤</span>
            <span>Género: {personalData.gender}</span>
          </div>
        )}
        {personalData.maritalStatus && (
          <div className="flex items-center gap-1.5">
            <span>💍</span>
            <span>Estado: {personalData.maritalStatus}</span>
          </div>
        )}
      </div>
    );
  };

  // Renderizador de experiencias
  const renderExperiences = (titleColor?: string) => {
    if (experiences.length === 0) return null;
    return (
      <div className={spacingStyles.gap}>
        <h3
          className="text-xs font-black uppercase tracking-wider pb-1 border-b"
          style={{ color: titleColor || activeColor, borderColor: `${activeColor}30` }}
        >
          Experiencia Laboral
        </h3>
        <div className="space-y-3">
          {experiences.map((exp, idx) => (
            <div key={idx} className={`${fontSizes} space-y-0.5`}>
              <div className="flex justify-between font-bold text-slate-900">
                <span className="font-bold">{exp.position}</span>
                <span className="text-[9px] text-slate-500 font-normal">
                  {exp.startMonth && exp.startMonth !== 'Mes' ? `${exp.startMonth} ` : ''}
                  {exp.startYear} - {exp.isCurrent ? 'Presente' : `${exp.endMonth && exp.endMonth !== 'Mes' ? `${exp.endMonth} ` : ''}${exp.endYear}`}
                </span>
              </div>
              <div className="font-semibold text-slate-700 text-[9.5px]">
                {exp.company} {exp.city ? `• ${exp.city}` : ''}
              </div>
              {exp.description && (
                <p className={`text-slate-600 ${spacingStyles.leading} whitespace-pre-line pt-0.5`}>
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizador de educación
  const renderEducation = (titleColor?: string) => {
    if (education.length === 0) return null;
    return (
      <div className={spacingStyles.gap}>
        <h3
          className="text-xs font-black uppercase tracking-wider pb-1 border-b"
          style={{ color: titleColor || activeColor, borderColor: `${activeColor}30` }}
        >
          Educación y Formación
        </h3>
        <div className="space-y-2.5">
          {education.map((edu, idx) => (
            <div key={idx} className={`${fontSizes} space-y-0.5`}>
              <div className="flex justify-between font-bold text-slate-900">
                <span>{edu.degree}</span>
                <span className="text-[9px] text-slate-500 font-normal">
                  {edu.startYear} - {edu.isCurrent ? 'Presente' : edu.endYear}
                </span>
              </div>
              <div className="text-slate-700 text-[9.5px] font-medium">
                {edu.institution} {edu.city ? `• ${edu.city}` : ''}
              </div>
              {edu.description && (
                <p className={`text-slate-600 text-[9px] ${spacingStyles.leading} pt-0.5`}>
                  {edu.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizador de habilidades
  const renderSkills = (isBadged = true) => {
    if (skills.length === 0) return null;
    return (
      <div className="space-y-2">
        <h3
          className="text-xs font-black uppercase tracking-wider pb-1 border-b"
          style={{ color: activeColor, borderColor: `${activeColor}30` }}
        >
          Habilidades
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {skills.map((s, idx) => {
            const skillName = typeof s === 'string' ? s : s.name;
            const skillLevel = typeof s === 'string' ? '' : s.level;
            return (
              <span
                key={idx}
                className={`text-[9px] font-semibold px-2 py-0.5 rounded ${
                  isBadged
                    ? 'text-white'
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}
                style={isBadged ? { backgroundColor: activeColor } : {}}
              >
                {skillName} {skillLevel ? `(${skillLevel})` : ''}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizador de idiomas
  const renderLanguages = () => {
    if (languages.length === 0) return null;
    return (
      <div className="space-y-1.5 text-[10px]">
        <h3
          className="text-xs font-black uppercase tracking-wider pb-1 border-b"
          style={{ color: activeColor, borderColor: `${activeColor}30` }}
        >
          Idiomas
        </h3>
        <div className="space-y-1">
          {languages.map((l, i) => (
            <div key={i} className="flex justify-between text-slate-700">
              <span className="font-semibold">{l.name}</span>
              <span className="text-slate-500 text-[9px]">{l.proficiency}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizador de certificaciones
  const renderCertificates = () => {
    if (certificates.length === 0) return null;
    return (
      <div className="space-y-1.5 text-[10px]">
        <h3
          className="text-xs font-black uppercase tracking-wider pb-1 border-b"
          style={{ color: activeColor, borderColor: `${activeColor}30` }}
        >
          Certificaciones
        </h3>
        <div className="space-y-1">
          {certificates.map((c, i) => (
            <div key={i} className="flex justify-between text-slate-700">
              <div>
                <span className="font-bold">{c.name}</span>
                <span className="text-slate-500 text-[9px]"> — {c.issuer}</span>
              </div>
              <span className="text-slate-400 text-[9px]">{c.year}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizador de referencias
  const renderReferences = () => {
    if (references.length === 0) return null;
    return (
      <div className="space-y-1.5 text-[10px]">
        <h3
          className="text-xs font-black uppercase tracking-wider pb-1 border-b"
          style={{ color: activeColor, borderColor: `${activeColor}30` }}
        >
          Referencias Laborales
        </h3>
        <div className="space-y-1">
          {references.map((r, i) => (
            <div key={i} className="text-slate-700">
              <span className="font-bold">{r.name}</span>
              <span className="text-slate-500"> ({r.company})</span>: {r.contact}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizador de aficiones
  const renderHobbies = () => {
    if (hobbies.length === 0) return null;
    return (
      <div className="space-y-1 text-[10px]">
        <h3
          className="text-xs font-black uppercase tracking-wider pb-1 border-b"
          style={{ color: activeColor, borderColor: `${activeColor}30` }}
        >
          Intereses
        </h3>
        <div className="text-slate-600 leading-tight">
          {hobbies.join(' • ')}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Inter'] selection:bg-blue-100">
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 1. BARRA SUPERIOR EJECUTIVA CORPORATIVA (PORTAL DE EMPLEO)                 */}
      {/* ========================================================================= */}
      <header className="bg-white text-slate-800 h-14 px-3 sm:px-6 flex items-center justify-between border-b border-slate-200 shrink-0 z-30 shadow-xs">
        {/* Lado Izquierdo: Volver & Selector de Versiones de CV */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard/candidato"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 sm:px-3 py-1.5 rounded-xl transition border border-slate-200 shrink-0"
            title="Volver a Mi Panel de Candidato"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Panel</span>
          </Link>

          {/* Selector Desplegable de Versiones de Currículum */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCvDropdown(!showCvDropdown)}
              className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 px-2.5 sm:px-3 py-1.5 rounded-xl transition border border-slate-200 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="max-w-[110px] sm:max-w-[170px] truncate">{cvTitle}</span>
              {isCurrentPrimary ? (
                <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] px-2 py-0.2 rounded-md font-extrabold flex items-center gap-0.5 shrink-0">
                  <Star className="w-2.5 h-2.5 fill-blue-700" /> Principal
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.2 rounded font-medium shrink-0">
                  Secundario
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {/* Menú Desplegable */}
            {showCvDropdown && (
              <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-xs animate-in fade-in zoom-in duration-150">
                <div className="text-[10px] font-bold text-slate-400 px-2.5 py-1 uppercase tracking-wider">
                  Mis Versiones de Currículum
                </div>
                <div className="space-y-1 my-1 max-h-56 overflow-y-auto">
                  {allResumes.map((cv) => (
                    <button
                      key={cv.id}
                      type="button"
                      disabled={isSwitchingCv}
                      onClick={() => handleSelectResume(cv.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition cursor-pointer ${
                        cv.id === currentResumeId
                          ? 'bg-blue-50 text-blue-800 font-bold border border-blue-100'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                        <span className="truncate">{cv.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {cv.isDefault && (
                          <span className="bg-blue-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-white" /> Principal
                          </span>
                        )}
                        {cv.id === currentResumeId && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1">
                  {!isCurrentPrimary && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowCvDropdown(false);
                        handleSetCurrentAsPrimary();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl text-blue-700 hover:bg-blue-50 font-bold flex items-center gap-2 transition cursor-pointer text-[11px]"
                    >
                      <Star className="w-3.5 h-3.5 fill-blue-700 shrink-0" />
                      Establecer este como CV Principal
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowCvDropdown(false);
                      setNewCvModalOpen(true);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-slate-700 hover:bg-slate-100 font-bold flex items-center gap-2 transition cursor-pointer text-[11px]"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    + Crear nueva versión de CV
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Centro: Título del documento editable */}
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <input
            type="text"
            value={cvTitle}
            onChange={(e) => setCvTitle(e.target.value)}
            className="bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-900 font-bold text-center border border-slate-200 focus:border-blue-500 rounded-xl px-2.5 py-1 max-w-[150px] sm:max-w-[220px] transition focus:outline-none"
            title="Editar nombre de este currículum"
          />
          <span title="Guardado automático">
            <Cloud className="w-3.5 h-3.5 text-slate-400" />
          </span>
          {!isCurrentPrimary && (
            <button
              type="button"
              onClick={handleSetCurrentAsPrimary}
              className="hidden lg:flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-lg transition cursor-pointer"
              title="Marcar como el CV que verán todas las empresas"
            >
              <Star className="w-3 h-3 fill-blue-700" />
              <span>Hacer Principal</span>
            </button>
          )}
        </div>

        {/* Lado Derecho: Deshacer, Rehacer, Guardar, Idioma, Descargar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1 border-r border-slate-200 pr-2 text-slate-400">
            <button
              type="button"
              onClick={() => alert('Cambio deshecho.')}
              className="p-1.5 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              title="Deshacer"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => alert('Cambio rehecho.')}
              className="p-1.5 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              title="Rehacer"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="hidden md:flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5 text-blue-600" />
            <span>{saving ? 'Guardando...' : 'Guardar'}</span>
          </button>

          {/* Selector de idioma */}
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>ES</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>

          {/* Menú tres puntos */}
          <button
            type="button"
            onClick={() => setShowTemplateModal(true)}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            title="Ver catálogo de plantillas"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Botón Principal: Descargar CV en PDF */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={downloadingPDF}
            className="flex items-center gap-2 text-xs font-bold bg-[#0051d5] hover:bg-[#0041ab] disabled:bg-blue-300 text-white px-3.5 py-1.5 rounded-xl shadow-sm transition cursor-pointer disabled:cursor-wait"
          >
            {downloadingPDF ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generando PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Descargar</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* CUERPO PRINCIPAL (FORMULARIO 6 COLS / CANVAS 6 COLS)                       */}
      {/* ========================================================================= */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* ========================================================================= */}
        {/* PANEL IZQUIERDO: FORMULARIO MULTISECCIÓN (6 COLS)                         */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 bg-white border-r border-slate-200 overflow-y-auto max-h-[calc(100vh-56px)] p-4 sm:p-6 space-y-6 pb-24">
          {/* Las 3 tarjetas de inicio rápido idénticas a CVwizard */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => alert('Función de importación de CV habilitada.')}
              className="flex flex-col items-center justify-center gap-1.5 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-700 text-[11px] font-semibold transition cursor-pointer text-center"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Subir un CV existente</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const url = prompt('Ingresa tu URL de LinkedIn para sincronizar:');
                if (url) {
                  setPersonalData((prev) => ({ ...prev, linkedin: url }));
                  if (!enabledFields.includes('linkedin')) {
                    setEnabledFields([...enabledFields, 'linkedin']);
                  }
                  alert('Perfil de LinkedIn vinculado.');
                }
              }}
              className="flex flex-col items-center justify-center gap-1.5 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-700 text-[11px] font-semibold transition cursor-pointer text-center"
            >
              <span className="font-black text-blue-700 text-base leading-none">in</span>
              <span>Importar de LinkedIn</span>
            </button>
            <button
              type="button"
              onClick={handleLoadSample}
              className="flex flex-col items-center justify-center gap-1.5 p-3 bg-slate-50 hover:bg-blue-50/70 rounded-xl border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-[11px] font-semibold transition cursor-pointer text-center"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span>Empezar del ejemplo</span>
            </button>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* SECCIÓN 1: DATOS PERSONALES                                             */}
          {/* ----------------------------------------------------------------------- */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Datos personales</h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setOpenPersonal(!openPersonal)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  {openPersonal ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {openPersonal && (
              <div className="space-y-4 pt-1">
                {/* Foto + Nombre, Apellidos, Puesto */}
                <div className="flex gap-4 items-start">
                  <label
                    htmlFor="cv-photo-input"
                    className="w-24 h-24 sm:w-28 sm:h-28 bg-slate-50 border border-dashed border-slate-300 hover:border-blue-400 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer transition shrink-0"
                  >
                    <input
                      id="cv-photo-input"
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="sr-only"
                    />
                    {photoUrl ? (
                      <>
                        <img src={photoUrl} alt="Foto CV" className="w-full h-full object-cover" />
                        <div
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold"
                        >
                          Cambiar
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setPhotoUrl('');
                          }}
                          className="absolute top-1 right-1 bg-white/90 text-rose-600 p-1 rounded-full shadow"
                          title="Eliminar foto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-slate-400 group-hover:text-blue-600 transition pointer-events-none">
                        <Camera className="w-6 h-6 mb-1 text-slate-400 group-hover:text-blue-500" />
                        <span className="text-[10px] font-bold text-slate-500 group-hover:text-blue-600">
                          Foto
                        </span>
                      </div>
                    )}
                  </label>

                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Nombre</label>
                        <input
                          type="text"
                          value={personalData.firstName}
                          onChange={(e) =>
                            setPersonalData({ ...personalData, firstName: e.target.value })
                          }
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Apellidos</label>
                        <input
                          type="text"
                          value={personalData.lastName}
                          onChange={(e) =>
                            setPersonalData({ ...personalData, lastName: e.target.value })
                          }
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Puesto de trabajo deseado
                        </label>
                        <label className="flex items-center gap-1.5 text-[10px] text-slate-500 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={personalData.useAsTitle}
                            onChange={(e) =>
                              setPersonalData({ ...personalData, useAsTitle: e.target.checked })
                            }
                            className="rounded text-blue-600 focus:ring-blue-500 w-3 h-3"
                          />
                          Usar como título
                        </label>
                      </div>
                      <input
                        type="text"
                        value={personalData.targetJob}
                        onChange={(e) =>
                          setPersonalData({ ...personalData, targetJob: e.target.value })
                        }
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Correo y Teléfono */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      value={personalData.email}
                      onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Teléfono</label>
                    <input
                      type="text"
                      value={personalData.phone}
                      onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>

                {/* Dirección */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    value={personalData.address}
                    onChange={(e) => setPersonalData({ ...personalData, address: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                {/* Código Postal y Localidad */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Código postal
                    </label>
                    <input
                      type="text"
                      value={personalData.postalCode}
                      onChange={(e) =>
                        setPersonalData({ ...personalData, postalCode: e.target.value })
                      }
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Localidad</label>
                    <input
                      type="text"
                      value={personalData.city}
                      onChange={(e) => setPersonalData({ ...personalData, city: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>

                {/* Botones píldora para campos adicionales */}
                <div className="pt-2">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'birthDate', label: '+ Fecha de nacimiento' },
                      { key: 'birthPlace', label: '+ Lugar de nacimiento' },
                      { key: 'driverLicense', label: '+ Carné de conducir' },
                      { key: 'gender', label: '+ Género' },
                      { key: 'nationality', label: '+ Nacionalidad' },
                      { key: 'maritalStatus', label: '+ Estado civil' },
                      { key: 'website', label: '+ Página web' },
                      { key: 'linkedin', label: '+ LinkedIn' },
                    ].map((f) => {
                      const isEnabled = enabledFields.includes(f.key);
                      return (
                        <button
                          key={f.key}
                          type="button"
                          onClick={() => toggleDynamicField(f.key)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition cursor-pointer ${
                            isEnabled
                              ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Render de campos dinámicos */}
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    {enabledFields.includes('birthDate') && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          Fecha de nacimiento
                        </label>
                        <input
                          type="date"
                          value={personalData.birthDate}
                          onChange={(e) =>
                            setPersonalData({ ...personalData, birthDate: e.target.value })
                          }
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>
                    )}
                    {enabledFields.includes('birthPlace') && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          Lugar de nacimiento
                        </label>
                        <input
                          type="text"
                          placeholder="Santo Domingo, RD"
                          value={personalData.birthPlace}
                          onChange={(e) =>
                            setPersonalData({ ...personalData, birthPlace: e.target.value })
                          }
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>
                    )}
                    {enabledFields.includes('driverLicense') && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          Carné de conducir
                        </label>
                        <input
                          type="text"
                          placeholder="Categoría 02"
                          value={personalData.driverLicense}
                          onChange={(e) =>
                            setPersonalData({ ...personalData, driverLicense: e.target.value })
                          }
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>
                    )}
                    {enabledFields.includes('gender') && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Género</label>
                        <select
                          value={personalData.gender}
                          onChange={(e) =>
                            setPersonalData({ ...personalData, gender: e.target.value })
                          }
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl"
                        >
                          <option value="">Seleccionar</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Femenino">Femenino</option>
                          <option value="No binario">No binario</option>
                        </select>
                      </div>
                    )}
                    {enabledFields.includes('nationality') && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          Nacionalidad
                        </label>
                        <input
                          type="text"
                          value={personalData.nationality}
                          onChange={(e) =>
                            setPersonalData({ ...personalData, nationality: e.target.value })
                          }
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>
                    )}
                    {enabledFields.includes('maritalStatus') && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          Estado civil
                        </label>
                        <select
                          value={personalData.maritalStatus}
                          onChange={(e) =>
                            setPersonalData({ ...personalData, maritalStatus: e.target.value })
                          }
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl"
                        >
                          <option value="">Seleccionar</option>
                          <option value="Soltero/a">Soltero/a</option>
                          <option value="Casado/a">Casado/a</option>
                          <option value="Unión libre">Unión libre</option>
                        </select>
                      </div>
                    )}
                    {enabledFields.includes('website') && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          Página web / Portafolio
                        </label>
                        <input
                          type="text"
                          value={personalData.website}
                          onChange={(e) =>
                            setPersonalData({ ...personalData, website: e.target.value })
                          }
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>
                    )}
                    {enabledFields.includes('linkedin') && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">LinkedIn</label>
                        <input
                          type="text"
                          value={personalData.linkedin}
                          onChange={(e) =>
                            setPersonalData({ ...personalData, linkedin: e.target.value })
                          }
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">Datos guardados automáticamente</span>
                    <button
                      type="button"
                      onClick={() => setOpenPersonal(false)}
                      className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aceptar</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* SECCIÓN 2: PERFIL                                                       */}
          {/* ----------------------------------------------------------------------- */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Perfil</h2>
              <button
                type="button"
                onClick={() => setOpenSummary(!openSummary)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                {openSummary ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>

            {openSummary && (
              <div className="space-y-3 pt-1">
                <label className="block text-[11px] font-bold text-slate-700">Descripción</label>

                <div className="border-2 border-blue-400/80 rounded-2xl p-3 bg-white space-y-3 focus-within:ring-2 focus-within:ring-blue-100 transition">
                  <textarea
                    rows={4}
                    placeholder="Empieza a escribir aquí..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
                  />

                  {/* Globo de sugerencia IA interactivo */}
                  <div
                    onClick={() => {
                      if (!summary.includes(defaultProfileSuggestion)) {
                        setSummary((prev) => (prev ? `${prev}\n\n${defaultProfileSuggestion}` : defaultProfileSuggestion));
                      }
                    }}
                    className="p-3 bg-slate-50/90 hover:bg-blue-50/80 border border-slate-200/90 hover:border-blue-300 rounded-2xl text-xs text-slate-700 flex items-start gap-2 cursor-pointer transition group"
                  >
                    <span className="text-slate-400 group-hover:text-blue-600 font-bold shrink-0">+</span>
                    <span className="leading-snug">{defaultProfileSuggestion}</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-slate-500">
                      <button type="button" className="p-1 hover:bg-slate-100 rounded text-slate-600 font-bold">
                        B
                      </button>
                      <button type="button" className="p-1 hover:bg-slate-100 rounded text-slate-600 italic">
                        I
                      </button>
                      <button type="button" className="p-1 hover:bg-slate-100 rounded text-slate-600 underline">
                        U
                      </button>
                      <span className="w-px h-3 bg-slate-200 mx-1" />
                      <button type="button" className="p-1 hover:bg-slate-100 rounded text-slate-600">
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="p-1 hover:bg-slate-100 rounded text-slate-600">
                        <ListOrdered className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleImproveWithAI('summary')}
                        disabled={improvingAI}
                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded-xl transition cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>{improvingAI ? 'Generando...' : 'Sugerencias de IA'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleImproveWithAI('summary')}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded-lg transition"
                        title="Regenerar sugerencia"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${improvingAI ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">Perfil listo para el currículum</span>
                  <button
                    type="button"
                    onClick={() => setOpenSummary(false)}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aceptar</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* SECCIÓN 3: FORMACIÓN                                                    */}
          {/* ----------------------------------------------------------------------- */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Formación</h2>
              <button
                type="button"
                onClick={() => setOpenEdu(!openEdu)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                {openEdu ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>

            {openEdu && (
              <div className="space-y-4 pt-1">
                {education.map((edu, idx) => {
                  const itemKey = edu.id || `edu-${idx}`;
                  const isEditing = editingEduId === itemKey;

                  if (!isEditing) {
                    return (
                      <div
                        key={itemKey}
                        onClick={() => setEditingEduId(itemKey)}
                        className="border border-slate-200 hover:border-blue-300 rounded-2xl p-3.5 bg-white hover:bg-slate-50/80 shadow-2xs transition flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition shrink-0" />
                          <div className="truncate">
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                              {edu.degree || '(Formación sin título)'}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">
                              {edu.institution || 'Centro de estudios'}
                              {edu.city ? ` • ${edu.city}` : ''}
                              {edu.startYear && edu.startYear !== 'Año'
                                ? ` (${edu.startMonth !== 'Mes' ? edu.startMonth : ''} ${edu.startYear} - ${edu.isCurrent ? 'Presente' : `${edu.endMonth !== 'Mes' ? edu.endMonth : ''} ${edu.endYear !== 'Año' ? edu.endYear : ''}`})`
                                : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingEduId(itemKey);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                            title="Editar formación"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEducation(education.filter((_, i) => i !== idx));
                              if (editingEduId === itemKey) setEditingEduId(null);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            title="Eliminar formación"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={itemKey}
                      className="border-2 border-blue-400/80 rounded-2xl p-4 bg-white shadow-xs space-y-3 transition"
                    >
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Formación
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Grado en Ingeniería, Licenciatura"
                          value={edu.degree}
                          onChange={(e) => {
                            const up = [...education];
                            up[idx].degree = e.target.value;
                            setEducation(up);
                          }}
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Centro de estudios
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. INTEC, UASD, PUCMM"
                            value={edu.institution}
                            onChange={(e) => {
                              const up = [...education];
                              up[idx].institution = e.target.value;
                              setEducation(up);
                            }}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Localidad</label>
                          <input
                            type="text"
                            placeholder="Santo Domingo, RD"
                            value={edu.city}
                            onChange={(e) => {
                              const up = [...education];
                              up[idx].city = e.target.value;
                              setEducation(up);
                            }}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                          />
                        </div>
                      </div>

                      {/* Fechas de inicio y fin */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Fecha de inicio
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={edu.startMonth || 'Mes'}
                              onChange={(e) => {
                                const up = [...education];
                                up[idx].startMonth = e.target.value;
                                setEducation(up);
                              }}
                              className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl"
                            >
                              {MONTHS.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                            <select
                              value={edu.startYear || 'Año'}
                              onChange={(e) => {
                                const up = [...education];
                                up[idx].startYear = e.target.value;
                                setEducation(up);
                              }}
                              className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl"
                            >
                              {YEARS.map((y) => (
                                <option key={y} value={y}>
                                  {y}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              Fecha de finalización
                            </label>
                            <label className="flex items-center gap-1.5 text-[10px] text-slate-500 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={edu.isCurrent}
                                onChange={(e) => {
                                  const up = [...education];
                                  up[idx].isCurrent = e.target.checked;
                                  setEducation(up);
                                }}
                                className="rounded text-blue-600 focus:ring-blue-500 w-3 h-3"
                              />
                              Presente
                            </label>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              disabled={edu.isCurrent}
                              value={edu.endMonth || 'Mes'}
                              onChange={(e) => {
                                const up = [...education];
                                up[idx].endMonth = e.target.value;
                                setEducation(up);
                              }}
                              className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-50"
                            >
                              {MONTHS.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                            <select
                              disabled={edu.isCurrent}
                              value={edu.endYear || 'Año'}
                              onChange={(e) => {
                                const up = [...education];
                                up[idx].endYear = e.target.value;
                                setEducation(up);
                              }}
                              className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-50"
                            >
                              {YEARS.map((y) => (
                                <option key={y} value={y}>
                                  {y}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Descripción</label>
                        <textarea
                          rows={3}
                          placeholder="Empieza a escribir aquí..."
                          value={edu.description}
                          onChange={(e) => {
                            const up = [...education];
                            up[idx].description = e.target.value;
                            setEducation(up);
                          }}
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setEducation(education.filter((_, i) => i !== idx));
                            setEditingEduId(null);
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                          title="Eliminar formación"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingEduId(null)}
                          className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Aceptar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    const newId = `edu-${Date.now()}`;
                    setEducation([
                      ...education,
                      {
                        id: newId,
                        degree: '',
                        institution: '',
                        city: '',
                        startMonth: 'Mes',
                        startYear: 'Año',
                        endMonth: 'Mes',
                        endYear: 'Año',
                        isCurrent: false,
                        description: '',
                      },
                    ]);
                    setEditingEduId(newId);
                  }}
                  className="w-full py-2.5 border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/40 text-blue-600 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir formación</span>
                </button>
              </div>
            )}
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* SECCIÓN 4: EXPERIENCIA                                                  */}
          {/* ----------------------------------------------------------------------- */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Experiencia</h2>
              <button
                type="button"
                onClick={() => setOpenExp(!openExp)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                {openExp ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>

            {openExp && (
              <div className="space-y-4 pt-1">
                {experiences.map((exp, idx) => {
                  const itemKey = exp.id || `exp-${idx}`;
                  const isEditing = editingExpId === itemKey;

                  if (!isEditing) {
                    return (
                      <div
                        key={itemKey}
                        onClick={() => setEditingExpId(itemKey)}
                        className="border border-slate-200 hover:border-blue-300 rounded-2xl p-3.5 bg-white hover:bg-slate-50/80 shadow-2xs transition flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition shrink-0" />
                          <div className="truncate">
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                              {exp.position || '(Puesto sin especificar)'}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">
                              {exp.company || 'Empresa'}
                              {exp.city ? ` • ${exp.city}` : ''}
                              {exp.startYear && exp.startYear !== 'Año'
                                ? ` (${exp.startMonth !== 'Mes' ? exp.startMonth : ''} ${exp.startYear} - ${exp.isCurrent ? 'Presente' : `${exp.endMonth !== 'Mes' ? exp.endMonth : ''} ${exp.endYear !== 'Año' ? exp.endYear : ''}`})`
                                : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingExpId(itemKey);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                            title="Editar empleo"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExperiences(experiences.filter((_, i) => i !== idx));
                              if (editingExpId === itemKey) setEditingExpId(null);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            title="Eliminar empleo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={itemKey}
                      className="border-2 border-blue-400/80 rounded-2xl p-4 bg-white shadow-xs space-y-3 transition"
                    >
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Puesto</label>
                        <input
                          type="text"
                          placeholder="Ej. Desarrollador, Gerente de Ventas"
                          value={exp.position}
                          onChange={(e) => {
                            const up = [...experiences];
                            up[idx].position = e.target.value;
                            setExperiences(up);
                          }}
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Empleador
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. Claro Dominicana, Banco BHD"
                            value={exp.company}
                            onChange={(e) => {
                              const up = [...experiences];
                              up[idx].company = e.target.value;
                              setExperiences(up);
                            }}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Localidad</label>
                          <input
                            type="text"
                            placeholder="Santo Domingo, RD"
                            value={exp.city}
                            onChange={(e) => {
                              const up = [...experiences];
                              up[idx].city = e.target.value;
                              setExperiences(up);
                            }}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                          />
                        </div>
                      </div>

                      {/* Fechas */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Fecha de inicio
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={exp.startMonth || 'Mes'}
                              onChange={(e) => {
                                const up = [...experiences];
                                up[idx].startMonth = e.target.value;
                                setExperiences(up);
                              }}
                              className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl"
                            >
                              {MONTHS.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                            <select
                              value={exp.startYear || 'Año'}
                              onChange={(e) => {
                                const up = [...experiences];
                                up[idx].startYear = e.target.value;
                                setExperiences(up);
                              }}
                              className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl"
                            >
                              {YEARS.map((y) => (
                                <option key={y} value={y}>
                                  {y}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-bold text-slate-700">
                              Fecha de finalización
                            </label>
                            <label className="flex items-center gap-1.5 text-[10px] text-slate-500 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={exp.isCurrent}
                                onChange={(e) => {
                                  const up = [...experiences];
                                  up[idx].isCurrent = e.target.checked;
                                  setExperiences(up);
                                }}
                                className="rounded text-blue-600 focus:ring-blue-500 w-3 h-3"
                              />
                              Presente
                            </label>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              disabled={exp.isCurrent}
                              value={exp.endMonth || 'Mes'}
                              onChange={(e) => {
                                const up = [...experiences];
                                up[idx].endMonth = e.target.value;
                                setExperiences(up);
                              }}
                              className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-50"
                            >
                              {MONTHS.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                            <select
                              disabled={exp.isCurrent}
                              value={exp.endYear || 'Año'}
                              onChange={(e) => {
                                const up = [...experiences];
                                up[idx].endYear = e.target.value;
                                setExperiences(up);
                              }}
                              className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-50"
                            >
                              {YEARS.map((y) => (
                                <option key={y} value={y}>
                                  {y}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Descripción con asistencia IA */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-slate-700">
                            Logros y Responsabilidades
                          </label>
                          <button
                            type="button"
                            onClick={() => handleImproveWithAI('experience', idx)}
                            disabled={improvingAI}
                            className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-blue-600" />
                            <span>Pulir con IA</span>
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          placeholder="Empieza a escribir aquí..."
                          value={exp.description}
                          onChange={(e) => {
                            const up = [...experiences];
                            up[idx].description = e.target.value;
                            setExperiences(up);
                          }}
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setExperiences(experiences.filter((_, i) => i !== idx));
                            setEditingExpId(null);
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                          title="Eliminar experiencia"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingExpId(null)}
                          className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Aceptar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    const newId = `exp-${Date.now()}`;
                    setExperiences([
                      ...experiences,
                      {
                        id: newId,
                        position: '',
                        company: '',
                        city: '',
                        startMonth: 'Mes',
                        startYear: 'Año',
                        endMonth: 'Mes',
                        endYear: 'Año',
                        isCurrent: false,
                        description: '',
                      },
                    ]);
                    setEditingExpId(newId);
                  }}
                  className="w-full py-2.5 border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/40 text-blue-600 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir empleo</span>
                </button>
              </div>
            )}
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* SECCIÓN 5: HABILIDADES                                                  */}
          {/* ----------------------------------------------------------------------- */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Habilidades</h2>
              <button
                type="button"
                onClick={() => setOpenSkills(!openSkills)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                {openSkills ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>

            {openSkills && (
              <div className="space-y-4 pt-1">
                {/* Lista de habilidades agregadas */}
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-2 group hover:border-blue-200 transition"
                    >
                      <span>{typeof s === 'string' ? s : s.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({typeof s === 'string' ? 'Avanzado' : s.level || 'Avanzado'})
                      </span>
                      <button
                        type="button"
                        onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 font-bold ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Tarjeta de entrada para nueva habilidad */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Habilidad
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Liderazgo, JavaScript, Scrum"
                        value={newSkill.name}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newSkill.name.trim()) {
                            e.preventDefault();
                            setSkills([...skills, { ...newSkill }]);
                            setNewSkill({ name: '', level: 'Intermedio' });
                          }
                        }}
                        onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Nivel</label>
                      <select
                        value={newSkill.level}
                        onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
                      >
                        <option value="Principiante">Principiante</option>
                        <option value="Básico">Básico</option>
                        <option value="Intermedio">Intermedio</option>
                        <option value="Avanzado">Avanzado</option>
                        <option value="Experto">Experto</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">Presiona Enter o haz clic en Aceptar</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNewSkill({ name: '', level: 'Intermedio' })}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                        title="Limpiar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (newSkill.name.trim()) {
                            setSkills([...skills, { ...newSkill }]);
                            setNewSkill({ name: '', level: 'Intermedio' });
                          } else if (skills.length > 0) {
                            setOpenSkills(false);
                          }
                        }}
                        className="flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aceptar</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Globo de sugerencias de habilidades */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 space-y-3 relative">
                  <div className="flex flex-wrap gap-2">
                    {suggestedSkills.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => addSuggestedSkill(s)}
                        className="text-xs font-medium text-slate-700 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 px-3 py-1.5 rounded-full transition cursor-pointer shadow-2xs"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => handleImproveWithAI('skills')}
                      disabled={improvingAI}
                      className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>{improvingAI ? 'Consultando IA...' : 'Sugerencias de IA'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleImproveWithAI('skills')}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded-lg transition"
                      title="Nuevas sugerencias"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${improvingAI ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* SECCIÓN 6: IDIOMAS                                                      */}
          {/* ----------------------------------------------------------------------- */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Idiomas</h2>
              <button
                type="button"
                onClick={() => setOpenLanguages(!openLanguages)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                {openLanguages ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>

            {openLanguages && (
              <div className="space-y-3 pt-1">
                {languages.map((l, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Idioma"
                      value={l.name}
                      onChange={(e) => {
                        const up = [...languages];
                        up[i].name = e.target.value;
                        setLanguages(up);
                      }}
                      className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    <select
                      value={l.proficiency}
                      onChange={(e) => {
                        const up = [...languages];
                        up[i].proficiency = e.target.value;
                        setLanguages(up);
                      }}
                      className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                    >
                      <option value="Básico / A1-A2">Básico / A1-A2</option>
                      <option value="Intermedio / B1-B2">Intermedio / B1-B2</option>
                      <option value="Avanzado / C1">Avanzado / C1</option>
                      <option value="Nativo / Bilingüe">Nativo / Bilingüe</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setLanguages(languages.filter((_, idx) => idx !== i))}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setLanguages([...languages, { name: '', proficiency: 'Intermedio / B1-B2' }])}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Añadir idioma
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenLanguages(false)}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aceptar</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* SECCIÓN 7: AFICIONES E INTERESES                                        */}
          {/* ----------------------------------------------------------------------- */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Aficiones e intereses</h2>
              <button
                type="button"
                onClick={() => setOpenHobbies(!openHobbies)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                {openHobbies ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>

            {openHobbies && (
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap gap-2">
                  {hobbies.map((h, i) => (
                    <span
                      key={i}
                      className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-full flex items-center gap-1.5"
                    >
                      {h}
                      <button
                        type="button"
                        onClick={() => setHobbies(hobbies.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-rose-600 font-bold cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    id="new-hobby-input"
                    placeholder="Ej. Ajedrez, Fotografía urbana, Lectura..."
                    className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl flex-1 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        if (target.value.trim()) {
                          setHobbies([...hobbies, target.value.trim()]);
                          target.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('new-hobby-input') as HTMLInputElement;
                      if (input && input.value.trim()) {
                        setHobbies([...hobbies, input.value.trim()]);
                        input.value = '';
                      } else {
                        setOpenHobbies(false);
                      }
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-xl transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aceptar</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* SECCIÓN 8: CURSOS Y CERTIFICADOS                                        */}
          {/* ----------------------------------------------------------------------- */}
          {(openCertificates || certificates.length > 0) && (
            <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Cursos y Certificados</h2>
                <button
                  type="button"
                  onClick={() => setOpenCertificates(!openCertificates)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  {openCertificates ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {openCertificates && (
                <div className="space-y-3 pt-1">
                  {certificates.map((cert, idx) => {
                    const itemKey = `cert-${idx}`;
                    const isEditing = editingCertId === itemKey;

                    if (!isEditing) {
                      return (
                        <div
                          key={itemKey}
                          onClick={() => setEditingCertId(itemKey)}
                          className="border border-slate-200 hover:border-blue-300 rounded-2xl p-3 bg-white hover:bg-slate-50/80 shadow-2xs transition flex items-center justify-between group cursor-pointer"
                        >
                          <div className="truncate">
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                              {cert.name || '(Certificado sin título)'}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">
                              {cert.issuer || 'Emisor'} {cert.year ? `(${cert.year})` : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCertId(itemKey);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCertificates(certificates.filter((_, i) => i !== idx));
                                if (editingCertId === itemKey) setEditingCertId(null);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={itemKey}
                        className="border-2 border-blue-400/80 rounded-2xl p-4 bg-white shadow-xs space-y-3"
                      >
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Nombre del curso o certificado
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. AWS Certified Solutions Architect"
                            value={cert.name}
                            onChange={(e) => {
                              const up = [...certificates];
                              up[idx].name = e.target.value;
                              setCertificates(up);
                            }}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Institución emisora
                            </label>
                            <input
                              type="text"
                              placeholder="Ej. Amazon, Google, INTEC"
                              value={cert.issuer}
                              onChange={(e) => {
                                const up = [...certificates];
                                up[idx].issuer = e.target.value;
                                setCertificates(up);
                              }}
                              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Año</label>
                            <input
                              type="text"
                              placeholder="2023"
                              value={cert.year}
                              onChange={(e) => {
                                const up = [...certificates];
                                up[idx].year = e.target.value;
                                setCertificates(up);
                              }}
                              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setCertificates(certificates.filter((_, i) => i !== idx));
                              setEditingCertId(null);
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCertId(null)}
                            className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Aceptar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => {
                      const newCert = { name: '', issuer: '', year: '2024' };
                      setCertificates([...certificates, newCert]);
                      setEditingCertId(`cert-${certificates.length}`);
                    }}
                    className="w-full py-2.5 border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/40 text-blue-600 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Añadir certificado</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* SECCIÓN 9: REFERENCIAS                                                  */}
          {/* ----------------------------------------------------------------------- */}
          {(openReferences || references.length > 0) && (
            <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Referencias</h2>
                <button
                  type="button"
                  onClick={() => setOpenReferences(!openReferences)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  {openReferences ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {openReferences && (
                <div className="space-y-3 pt-1">
                  {references.map((ref, idx) => {
                    const itemKey = `ref-${idx}`;
                    const isEditing = editingRefId === itemKey;

                    if (!isEditing) {
                      return (
                        <div
                          key={itemKey}
                          onClick={() => setEditingRefId(itemKey)}
                          className="border border-slate-200 hover:border-blue-300 rounded-2xl p-3 bg-white hover:bg-slate-50/80 shadow-2xs transition flex items-center justify-between group cursor-pointer"
                        >
                          <div className="truncate">
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                              {ref.name || '(Persona de referencia)'}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">
                              {ref.company} {ref.contact ? `• ${ref.contact}` : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingRefId(itemKey);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReferences(references.filter((_, i) => i !== idx));
                                if (editingRefId === itemKey) setEditingRefId(null);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={itemKey}
                        className="border-2 border-blue-400/80 rounded-2xl p-4 bg-white shadow-xs space-y-3"
                      >
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Nombre completo
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. Ing. Marcos Guzmán"
                            value={ref.name}
                            onChange={(e) => {
                              const up = [...references];
                              up[idx].name = e.target.value;
                              setReferences(up);
                            }}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Empresa</label>
                            <input
                              type="text"
                              placeholder="Ej. Tech Caribe Solutions"
                              value={ref.company}
                              onChange={(e) => {
                                const up = [...references];
                                up[idx].company = e.target.value;
                                setReferences(up);
                              }}
                              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Contacto</label>
                            <input
                              type="text"
                              placeholder="Teléfono o correo electrónico"
                              value={ref.contact}
                              onChange={(e) => {
                                const up = [...references];
                                up[idx].contact = e.target.value;
                                setReferences(up);
                              }}
                              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setReferences(references.filter((_, i) => i !== idx));
                              setEditingRefId(null);
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingRefId(null)}
                            className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Aceptar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => {
                      const newRef = { name: '', company: '', contact: '' };
                      setReferences([...references, newRef]);
                      setEditingRefId(`ref-${references.length}`);
                    }}
                    className="w-full py-2.5 border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/40 text-blue-600 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Añadir referencia</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Botones píldora para agregar más secciones */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Añadir más secciones al currículum
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  name: '+ Cursos y Certificados',
                  action: () => {
                    setOpenCertificates(true);
                    const newCert = { name: '', issuer: '', year: '2024' };
                    setCertificates([...certificates, newCert]);
                    setEditingCertId(`cert-${certificates.length}`);
                  },
                },
                {
                  name: '+ Prácticas',
                  action: () => {
                    setOpenExp(true);
                    const newId = `exp-${Date.now()}`;
                    setExperiences([
                      ...experiences,
                      {
                        id: newId,
                        position: 'Pasantía / Prácticas Profesionales',
                        company: '',
                        city: '',
                        startMonth: 'Mes',
                        startYear: 'Año',
                        endMonth: 'Mes',
                        endYear: 'Año',
                        isCurrent: false,
                        description: '',
                      },
                    ]);
                    setEditingExpId(newId);
                  },
                },
                {
                  name: '+ Referencias',
                  action: () => {
                    setOpenReferences(true);
                    const newRef = { name: '', company: '', contact: '' };
                    setReferences([...references, newRef]);
                    setEditingRefId(`ref-${references.length}`);
                  },
                },
                {
                  name: '+ Actividades extracurriculares',
                  action: () => setOpenHobbies(true),
                },
                {
                  name: '+ Idiomas adicionales',
                  action: () => {
                    setOpenLanguages(true);
                    setLanguages([...languages, { name: '', proficiency: 'Intermedio / B1-B2' }]);
                  },
                },
              ].map((pill, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={pill.action}
                  className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 hover:border-slate-400 px-3 py-1.5 rounded-full transition cursor-pointer"
                >
                  {pill.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PANEL DERECHO: LIENZO A4 CON ESTILOS FIELES A CVWIZARD                    */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 bg-slate-200/80 p-4 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[calc(100vh-56px)] relative">
          {/* LIENZO A4 */}
          <div
            id="cv-document-canvas"
            className="w-full max-w-[595px] mx-auto bg-white rounded-xl shadow-2xl overflow-hidden min-h-[842px] relative text-slate-900 transition-all duration-300"
            style={{ fontFamily: activeFont }}
          >
            {/* =================================================================== */}
            {/* 1. PLANTILLA: CRONOLÓGICA (CVWIZARD)                                */}
            {/* =================================================================== */}
            {normalizedTemplate === 'cronologica' && (
              <div className="min-h-[842px] bg-white flex flex-col">
                <div className="w-full h-2" style={{ backgroundColor: activeColor }} />
                
                <div className={`${spacingStyles.padding} ${spacingStyles.gap} flex-1 flex flex-col justify-between`}>
                  <div className="flex items-start justify-between border-b pb-4" style={{ borderColor: `${activeColor}40` }}>
                    <div className="space-y-1">
                      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
                        {personalData.firstName} {personalData.lastName}
                      </h1>
                      {personalData.useAsTitle && personalData.targetJob && (
                        <div className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: activeColor }}>
                          {personalData.targetJob}
                        </div>
                      )}
                      <div className="pt-2">
                        {renderContactItems(false)}
                      </div>
                    </div>

                    {photoUrl ? (
                      <div className="w-24 h-24 rounded-xl overflow-hidden border-2 shadow-sm shrink-0 bg-white" style={{ borderColor: activeColor }}>
                        <img src={photoUrl} alt="Foto" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div
                        className="w-20 h-20 rounded-xl shadow-sm shrink-0 flex items-center justify-center text-white font-extrabold text-2xl"
                        style={{ backgroundColor: activeColor }}
                      >
                        {personalData.firstName[0]}{personalData.lastName[0]}
                      </div>
                    )}
                  </div>

                  {summary && (
                    <div className="space-y-1.5">
                      <h3
                        className="text-xs font-black uppercase tracking-wider pb-1 border-b-2"
                        style={{ color: activeColor, borderColor: activeColor }}
                      >
                        Perfil Profesional
                      </h3>
                      <p className={`${fontSizes} text-slate-700 ${spacingStyles.leading} text-justify`}>
                        {summary}
                      </p>
                    </div>
                  )}

                  {renderExperiences(activeColor)}
                  {renderEducation(activeColor)}

                  <div className="grid grid-cols-2 gap-6 pt-2 border-t border-slate-200">
                    <div>
                      {renderSkills(false)}
                    </div>
                    <div className="space-y-4">
                      {renderLanguages()}
                      {renderCertificates()}
                      {renderHobbies()}
                    </div>
                  </div>

                  {renderReferences()}
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* 2. PLANTILLA: ELEGANTE (CVWIZARD)                                   */}
            {/* =================================================================== */}
            {normalizedTemplate === 'elegante' && (
              <div className="min-h-[842px] bg-white flex flex-col">
                <div className={`${spacingStyles.headerPadding} text-white flex items-center justify-between shadow-xs`} style={{ backgroundColor: activeColor }}>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
                      {personalData.firstName} {personalData.lastName}
                    </h1>
                    {personalData.useAsTitle && personalData.targetJob && (
                      <div className="text-xs font-semibold uppercase tracking-widest text-white/90 mt-1">
                        {personalData.targetJob}
                      </div>
                    )}
                  </div>
                  {photoUrl && (
                    <div className="w-18 h-18 rounded-full overflow-hidden border-2 border-white/80 shadow-md shrink-0">
                      <img src={photoUrl} alt="Foto" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-12 flex-1">
                  <div className="col-span-4 bg-[#F8FAFC] border-r border-slate-200 p-5 space-y-5">
                    <div>
                      <div className="font-bold text-[10px] uppercase tracking-wider pb-1 mb-2 border-b" style={{ color: activeColor, borderColor: `${activeColor}30` }}>
                        Datos Personales
                      </div>
                      {renderContactItems(false)}
                    </div>
                    {renderSkills(true)}
                    {renderLanguages()}
                    {renderCertificates()}
                    {renderHobbies()}
                  </div>

                  <div className={`col-span-8 ${spacingStyles.padding} space-y-5 bg-white`}>
                    {summary && (
                      <div className="space-y-1.5">
                        <h3 className="text-xs font-black uppercase tracking-wider pb-1 border-b" style={{ color: activeColor, borderColor: `${activeColor}30` }}>
                          Perfil Profesional
                        </h3>
                        <p className={`${fontSizes} text-slate-700 ${spacingStyles.leading} text-justify`}>
                          {summary}
                        </p>
                      </div>
                    )}
                    {renderExperiences(activeColor)}
                    {renderEducation(activeColor)}
                    {renderReferences()}
                  </div>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* 3. PLANTILLA: CIRCULAR (STANFORD DE CVWIZARD)                       */}
            {/* =================================================================== */}
            {normalizedTemplate === 'circular' && (
              <div className="grid grid-cols-12 min-h-[842px]">
                <div className="col-span-5 bg-[#F4F6F9] border-r border-slate-200/80 flex flex-col justify-between relative overflow-hidden">
                  <div
                    className="relative pt-7 pb-8 px-4 text-center text-white shadow-xs"
                    style={{
                      backgroundColor: activeColor,
                      borderBottomLeftRadius: '50% 20px',
                      borderBottomRightRadius: '50% 20px',
                    }}
                  >
                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
                      Curriculum vitae
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 space-y-4 flex-1">
                    {photoUrl ? (
                      <div className="w-22 h-22 rounded-full overflow-hidden border-3 border-white shadow-md mx-auto bg-white">
                        <img src={photoUrl} alt="Foto" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div
                        className="w-20 h-20 rounded-full border-3 border-white shadow-md mx-auto flex items-center justify-center text-white font-extrabold text-xl"
                        style={{ backgroundColor: activeColor }}
                      >
                        {personalData.firstName[0]}
                        {personalData.lastName[0]}
                      </div>
                    )}

                    <div className="pt-2">
                      <div
                        className="font-bold text-[10px] uppercase tracking-wider pb-1 mb-1.5 border-b"
                        style={{ color: activeColor, borderColor: `${activeColor}30` }}
                      >
                        Datos Personales
                      </div>
                      {renderContactItems(false)}
                    </div>

                    {renderSkills(true)}
                    {renderLanguages()}
                    {renderCertificates()}
                    {renderHobbies()}
                  </div>
                </div>

                <div className={`col-span-7 ${spacingStyles.padding} space-y-5 bg-white`}>
                  <div className="border-b border-slate-100 pb-3">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                      {personalData.firstName} {personalData.lastName}
                    </h1>
                    {personalData.useAsTitle && personalData.targetJob && (
                      <div className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: activeColor }}>
                        {personalData.targetJob}
                      </div>
                    )}
                  </div>

                  {summary && (
                    <div className="space-y-1.5">
                      <h3
                        className="text-xs font-black uppercase tracking-wider pb-1 border-b"
                        style={{ color: activeColor, borderColor: `${activeColor}30` }}
                      >
                        Perfil Profesional
                      </h3>
                      <p className={`${fontSizes} text-slate-700 ${spacingStyles.leading} text-justify`}>
                        {summary}
                      </p>
                    </div>
                  )}

                  {renderExperiences(activeColor)}
                  {renderEducation(activeColor)}
                  {renderReferences()}
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* 4. PLANTILLA: MODERNA (CVWIZARD)                                    */}
            {/* =================================================================== */}
            {normalizedTemplate === 'moderna' && (
              <div className="grid grid-cols-12 min-h-[842px]">
                <div className="col-span-5 p-5 sm:p-6 text-white space-y-5" style={{ backgroundColor: activeColor }}>
                  {photoUrl ? (
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/60 shadow-md mx-auto">
                      <img src={photoUrl} alt="Foto" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/40 shadow-md mx-auto flex items-center justify-center text-white font-black text-2xl">
                      {personalData.firstName[0]}{personalData.lastName[0]}
                    </div>
                  )}
                  <div className="text-center space-y-1">
                    <h2 className="text-lg font-black text-white leading-tight">
                      {personalData.firstName} {personalData.lastName}
                    </h2>
                    {personalData.useAsTitle && personalData.targetJob && (
                      <div className="text-[10px] font-medium text-white/80">{personalData.targetJob}</div>
                    )}
                  </div>
                  <div className="pt-2 border-t border-white/20">
                    <div className="font-bold uppercase tracking-widest text-[9px] text-white/60 mb-2">Contacto</div>
                    {renderContactItems(true)}
                  </div>
                  {renderSkills(true)}
                  {renderLanguages()}
                  {renderCertificates()}
                  {renderHobbies()}
                </div>

                <div className={`col-span-7 ${spacingStyles.padding} space-y-5 bg-white`}>
                  {summary && (
                    <div className="space-y-1">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                        Perfil Profesional
                      </h3>
                      <p className={`${fontSizes} text-slate-600 ${spacingStyles.leading} text-justify`}>
                        {summary}
                      </p>
                    </div>
                  )}
                  {renderExperiences(activeColor)}
                  {renderEducation(activeColor)}
                  {renderReferences()}
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* 5. PLANTILLA: DELUXE (CVWIZARD)                                     */}
            {/* =================================================================== */}
            {normalizedTemplate === 'deluxe' && (
              <div className="min-h-[842px] bg-white flex flex-col p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between border-b-2 pb-5" style={{ borderColor: activeColor }}>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center font-serif text-2xl font-black text-white shadow-md shrink-0"
                      style={{ backgroundColor: activeColor }}
                    >
                      CV
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-slate-900">
                        {personalData.firstName} {personalData.lastName}
                      </h1>
                      {personalData.useAsTitle && personalData.targetJob && (
                        <div className="text-xs font-bold uppercase tracking-widest mt-0.5" style={{ color: activeColor }}>
                          {personalData.targetJob}
                        </div>
                      )}
                    </div>
                  </div>

                  {photoUrl && (
                    <div className="w-20 h-20 border-2 p-1 rounded-xl shadow-xs shrink-0" style={{ borderColor: `${activeColor}60` }}>
                      <div className="w-full h-full rounded-lg overflow-hidden border border-slate-200">
                        <img src={photoUrl} alt="Foto" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-12 gap-6 flex-1">
                  <div className="col-span-5 space-y-5 border-r border-slate-200 pr-5">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider pb-1 mb-2 border-b" style={{ color: activeColor, borderColor: `${activeColor}30` }}>
                        Datos de Contacto
                      </h3>
                      {renderContactItems(false)}
                    </div>
                    {renderSkills(false)}
                    {renderLanguages()}
                    {renderCertificates()}
                    {renderHobbies()}
                  </div>

                  <div className="col-span-7 space-y-5">
                    {summary && (
                      <div className="space-y-1.5">
                        <h3 className="text-xs font-black uppercase tracking-wider pb-1 border-b" style={{ color: activeColor, borderColor: `${activeColor}30` }}>
                          Resumen Ejecutivo
                        </h3>
                        <p className={`${fontSizes} text-slate-700 ${spacingStyles.leading} text-justify`}>
                          {summary}
                        </p>
                      </div>
                    )}
                    {renderExperiences(activeColor)}
                    {renderEducation(activeColor)}
                    {renderReferences()}
                  </div>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* 6. PLANTILLA: CLÁSICA (CVWIZARD - ATS DIRECTO)                      */}
            {/* =================================================================== */}
            {normalizedTemplate === 'clasica' && (
              <div className={`${spacingStyles.padding} space-y-4 text-left font-['Arial'] min-h-[842px] bg-white`}>
                <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 mb-0.5">
                      Curriculum Vitae
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wide text-slate-900">
                      {personalData.firstName} {personalData.lastName}
                    </h1>
                    {personalData.useAsTitle && personalData.targetJob && (
                      <div className="text-xs font-bold text-slate-800 mt-0.5">{personalData.targetJob}</div>
                    )}
                    <div className="text-[10px] text-slate-600 flex flex-wrap gap-2 mt-1.5">
                      <span>{personalData.city}, República Dominicana</span>
                      <span>•</span>
                      <span>{personalData.phone}</span>
                      <span>•</span>
                      <span>{personalData.email}</span>
                    </div>
                  </div>
                  {photoUrl && (
                    <div className="w-20 h-20 rounded-md overflow-hidden border-2 border-slate-400 shrink-0">
                      <img src={photoUrl} alt="Foto" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {summary && (
                  <div>
                    <div className="bg-slate-900 text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-xs mb-1.5">
                      Perfil Profesional
                    </div>
                    <p className="text-[10px] text-slate-800 leading-relaxed text-justify px-1">{summary}</p>
                  </div>
                )}

                <div>
                  <div className="bg-slate-900 text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-xs mb-1.5">
                    Experiencia Laboral
                  </div>
                  <div className="px-1">{renderExperiences('#0f172a')}</div>
                </div>

                <div>
                  <div className="bg-slate-900 text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-xs mb-1.5">
                    Educación y Formación
                  </div>
                  <div className="px-1">{renderEducation('#0f172a')}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <div className="bg-slate-900 text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-xs mb-1.5">
                      Habilidades
                    </div>
                    <div className="px-1">{renderSkills(false)}</div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="bg-slate-900 text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-xs mb-1.5">
                        Idiomas y Cursos
                      </div>
                      <div className="px-1 space-y-2">
                        {renderLanguages()}
                        {renderCertificates()}
                      </div>
                    </div>
                  </div>
                </div>

                {references.length > 0 && (
                  <div>
                    <div className="bg-slate-900 text-white px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-xs mb-1.5">
                      Referencias
                    </div>
                    <div className="px-1">{renderReferences()}</div>
                  </div>
                )}
              </div>
            )}

            {/* =================================================================== */}
            {/* 7. PLANTILLA: INFORMAL (CVWIZARD)                                   */}
            {/* =================================================================== */}
            {normalizedTemplate === 'informal' && (
              <div className="grid grid-cols-12 min-h-[842px] bg-white">
                <div className="col-span-5 p-5 space-y-5 border-r border-slate-200" style={{ backgroundColor: `${activeColor}12` }}>
                  {photoUrl ? (
                    <div className="w-22 h-22 rounded-full overflow-hidden border-3 border-white shadow-md mx-auto">
                      <img src={photoUrl} alt="Foto" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div
                      className="w-20 h-20 rounded-full border-3 border-white shadow-md mx-auto flex items-center justify-center text-white font-black text-xl"
                      style={{ backgroundColor: activeColor }}
                    >
                      {personalData.firstName[0]}{personalData.lastName[0]}
                    </div>
                  )}

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b" style={{ color: activeColor, borderColor: `${activeColor}40` }}>
                      Contacto
                    </h3>
                    {renderContactItems(false)}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider pb-1 border-b" style={{ color: activeColor, borderColor: `${activeColor}40` }}>
                      Habilidades
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s, idx) => {
                        const sName = typeof s === 'string' ? s : s.name;
                        return (
                          <span
                            key={idx}
                            className="text-[9px] font-semibold px-2.5 py-1 rounded-full text-white shadow-2xs"
                            style={{ backgroundColor: activeColor }}
                          >
                            {sName}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {renderLanguages()}
                  {renderCertificates()}
                  {renderHobbies()}
                </div>

                <div className={`col-span-7 ${spacingStyles.padding} space-y-5`}>
                  <div className="space-y-1.5">
                    {personalData.useAsTitle && personalData.targetJob && (
                      <span
                        className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-white inline-block shadow-2xs"
                        style={{ backgroundColor: activeColor }}
                      >
                        {personalData.targetJob}
                      </span>
                    )}
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {personalData.firstName} {personalData.lastName}
                    </h1>
                  </div>

                  {summary && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sobre mí</h3>
                      <p className={`${fontSizes} text-slate-700 ${spacingStyles.leading}`}>{summary}</p>
                    </div>
                  )}

                  {renderExperiences(activeColor)}
                  {renderEducation(activeColor)}
                  {renderReferences()}
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* 8. PLANTILLA: HORIZONTAL (CVWIZARD)                                 */}
            {/* =================================================================== */}
            {normalizedTemplate === 'horizontal' && (
              <div className="min-h-[842px] bg-white flex flex-col">
                <div className="pt-7 pb-6 px-8 text-white relative shadow-xs" style={{ backgroundColor: activeColor }}>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
                    {personalData.firstName} {personalData.lastName}
                  </h1>
                  {personalData.useAsTitle && personalData.targetJob && (
                    <div className="text-xs font-semibold uppercase tracking-widest text-white/85 mt-0.5">
                      {personalData.targetJob}
                    </div>
                  )}
                </div>

                <div className="px-8 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-[10px] text-slate-700">
                  <div className="flex flex-wrap items-center gap-3">
                    <span>✉️ {personalData.email}</span>
                    <span>•</span>
                    <span>📱 {personalData.phone}</span>
                    <span>•</span>
                    <span>📍 {personalData.city}, RD</span>
                  </div>
                  {photoUrl && (
                    <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white shadow-md shrink-0 -mt-8 bg-white">
                      <img src={photoUrl} alt="Foto" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className={`p-6 sm:p-8 grid grid-cols-2 gap-6 flex-1`}>
                  <div className="space-y-5">
                    {summary && (
                      <div className="space-y-1.5">
                        <h3 className="text-xs font-bold uppercase tracking-wider border-l-4 pl-2" style={{ color: activeColor, borderColor: activeColor }}>
                          Perfil Profesional
                        </h3>
                        <p className={`${fontSizes} text-slate-600 ${spacingStyles.leading} text-justify`}>
                          {summary}
                        </p>
                      </div>
                    )}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider border-l-4 pl-2 mb-2" style={{ color: activeColor, borderColor: activeColor }}>
                        Experiencia
                      </h3>
                      {renderExperiences(activeColor)}
                    </div>
                    {renderReferences()}
                  </div>

                  <div className="space-y-5">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider border-l-4 pl-2 mb-2" style={{ color: activeColor, borderColor: activeColor }}>
                        Educación
                      </h3>
                      {renderEducation(activeColor)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider border-l-4 pl-2 mb-2" style={{ color: activeColor, borderColor: activeColor }}>
                        Habilidades
                      </h3>
                      {renderSkills(false)}
                    </div>
                    {renderLanguages()}
                    {renderCertificates()}
                    {renderHobbies()}
                  </div>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* 9. PLANTILLA: VERTICAL (CVWIZARD)                                   */}
            {/* =================================================================== */}
            {normalizedTemplate === 'vertical' && (
              <div className="min-h-[842px] bg-white flex overflow-hidden">
                <div className="w-3 shrink-0" style={{ backgroundColor: activeColor }} />

                <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between space-y-5">
                  <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                        {personalData.firstName} {personalData.lastName}
                      </h1>
                      {personalData.useAsTitle && personalData.targetJob && (
                        <div className="text-xs font-bold uppercase tracking-wider mt-0.5" style={{ color: activeColor }}>
                          {personalData.targetJob}
                        </div>
                      )}
                      <div className="pt-2">{renderContactItems(false)}</div>
                    </div>
                    {photoUrl && (
                      <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm border-2 border-slate-200 shrink-0">
                        <img src={photoUrl} alt="Foto" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-12 gap-6 flex-1">
                    <div className="col-span-5 space-y-5 border-r border-slate-200 pr-4">
                      {renderSkills(true)}
                      {renderLanguages()}
                      {renderCertificates()}
                      {renderHobbies()}
                    </div>

                    <div className="col-span-7 space-y-5">
                      {summary && (
                        <div className="space-y-1.5">
                          <h3 className="text-xs font-black uppercase tracking-wider pb-1 border-b" style={{ color: activeColor, borderColor: `${activeColor}30` }}>
                            Perfil
                          </h3>
                          <p className={`${fontSizes} text-slate-700 ${spacingStyles.leading} text-justify`}>
                            {summary}
                          </p>
                        </div>
                      )}
                      {renderExperiences(activeColor)}
                      {renderEducation(activeColor)}
                      {renderReferences()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* 10. PLANTILLA: METRO (CVWIZARD - DISEÑO SUIZO)                      */}
            {/* =================================================================== */}
            {normalizedTemplate === 'metro' && (
              <div className={`${spacingStyles.padding} ${spacingStyles.gap} min-h-[842px] bg-white`}>
                <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 shrink-0 rounded-xs" style={{ backgroundColor: activeColor }} />
                      <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950">
                        {personalData.firstName} {personalData.lastName}
                      </h1>
                    </div>
                    {personalData.useAsTitle && personalData.targetJob && (
                      <div className="text-xs font-bold uppercase tracking-widest pl-5" style={{ color: activeColor }}>
                        {personalData.targetJob}
                      </div>
                    )}
                    <div className="pt-2 pl-5">{renderContactItems(false)}</div>
                  </div>
                  {photoUrl && (
                    <div className="w-20 h-20 rounded-xs overflow-hidden border-2 border-slate-900 shadow-xs shrink-0">
                      <img src={photoUrl} alt="Foto" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {summary && (
                  <div>
                    <div className="inline-block px-2.5 py-1 text-white font-black uppercase text-[10px] tracking-wider mb-2 rounded-xs" style={{ backgroundColor: activeColor }}>
                      Perfil Profesional
                    </div>
                    <p className={`${fontSizes} text-slate-800 ${spacingStyles.leading} text-justify`}>{summary}</p>
                  </div>
                )}

                <div>
                  <div className="inline-block px-2.5 py-1 text-white font-black uppercase text-[10px] tracking-wider mb-2 rounded-xs" style={{ backgroundColor: activeColor }}>
                    Experiencia Laboral
                  </div>
                  {renderExperiences(activeColor)}
                </div>

                <div>
                  <div className="inline-block px-2.5 py-1 text-white font-black uppercase text-[10px] tracking-wider mb-2 rounded-xs" style={{ backgroundColor: activeColor }}>
                    Educación y Formación
                  </div>
                  {renderEducation(activeColor)}
                </div>

                <div className="grid grid-cols-2 gap-5 pt-2">
                  <div>
                    <div className="inline-block px-2.5 py-1 text-white font-black uppercase text-[10px] tracking-wider mb-2 rounded-xs" style={{ backgroundColor: activeColor }}>
                      Habilidades
                    </div>
                    <div className="pt-1">{renderSkills(false)}</div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="inline-block px-2.5 py-1 text-white font-black uppercase text-[10px] tracking-wider mb-2 rounded-xs" style={{ backgroundColor: activeColor }}>
                        Idiomas y Cursos
                      </div>
                      <div className="pt-1 space-y-2">
                        {renderLanguages()}
                        {renderCertificates()}
                      </div>
                    </div>
                  </div>
                </div>

                {renderReferences()}
              </div>
            )}

            {/* =================================================================== */}
            {/* 11. PLANTILLA: SENCILLA (CVWIZARD - MINIMALISTA NÓRDICO)            */}
            {/* =================================================================== */}
            {normalizedTemplate === 'sencilla' && (
              <div className={`${spacingStyles.padding} ${spacingStyles.gap} min-h-[842px] bg-white`}>
                <div className="border-b border-slate-200 pb-4">
                  <h1 className="text-3xl font-black tracking-tight text-slate-950">
                    {personalData.firstName} <span className="font-light text-slate-600">{personalData.lastName}</span>
                  </h1>
                  {personalData.useAsTitle && personalData.targetJob && (
                    <div className="text-xs font-bold mt-0.5" style={{ color: activeColor }}>
                      {personalData.targetJob}
                    </div>
                  )}
                  <div className="mt-2">{renderContactItems(false)}</div>
                </div>

                {summary && (
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                      Acerca de mí
                    </h3>
                    <p className={`${fontSizes} text-slate-700 ${spacingStyles.leading}`}>{summary}</p>
                  </div>
                )}

                {renderExperiences(activeColor)}
                {renderEducation(activeColor)}

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>{renderSkills(false)}</div>
                  <div className="space-y-3">
                    {renderLanguages()}
                    {renderCertificates()}
                    {renderHobbies()}
                  </div>
                </div>
                {renderReferences()}
              </div>
            )}
          </div>

          {/* =================================================================== */}
          {/* DRAWER HORIZONTAL DESLIZANTE DE PLANTILLAS (IDÉNTICO A CVWIZARD)    */}
          {/* =================================================================== */}
          {showTemplateDrawer && (
            <div className="sticky bottom-16 mb-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-3 max-w-xl mx-auto w-full z-30 animate-in fade-in slide-in-from-bottom-3 duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Plantillas ({TEMPLATES.length})
                  </span>
                  <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('templates-carousel-container');
                        if (el) el.scrollBy({ left: -220, behavior: 'smooth' });
                      }}
                      className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-white transition cursor-pointer"
                      title="Anterior"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('templates-carousel-container');
                        if (el) el.scrollBy({ left: 220, behavior: 'smooth' });
                      }}
                      className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-white transition cursor-pointer"
                      title="Siguiente"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTemplateDrawer(false);
                      setShowTemplateModal(true);
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-bold px-2 py-0.5 hover:bg-blue-50 rounded-lg transition"
                  >
                    Ver todas
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTemplateDrawer(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Contenedor deslizante de tarjetas */}
              <div
                id="templates-carousel-container"
                className="flex gap-2.5 overflow-x-auto py-2.5 scrollbar-thin scrollbar-thumb-slate-200 scroll-smooth px-1"
              >
                {TEMPLATES.map((tmpl) => {
                  const isSelected = normalizedTemplate === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setActiveTemplate(tmpl.id)}
                      className={`shrink-0 w-24 cursor-pointer group flex flex-col items-center gap-1.5 transition-all ${
                        isSelected ? 'scale-105' : 'opacity-85 hover:opacity-100 hover:scale-102'
                      }`}
                    >
                      <div
                        className={`w-24 h-32 rounded-xl border-2 p-1 bg-white shadow-xs flex flex-col justify-between transition-all relative overflow-hidden ${
                          isSelected
                            ? 'border-blue-600 ring-2 ring-blue-600/30 shadow-md'
                            : 'border-slate-200 group-hover:border-slate-300'
                        }`}
                      >
                        {renderMiniTemplateThumbnail(tmpl.id, activeColor)}

                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5 shadow-xs">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                      <span
                        className={`text-[10.5px] font-semibold text-center truncate max-w-full ${
                          isSelected ? 'text-blue-600 font-bold' : 'text-slate-700'
                        }`}
                      >
                        {tmpl.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TOOLBAR FLOTANTE INFERIOR DOCK (IDÉNTICO A CVWIZARD)                 */}
          {/* =================================================================== */}
          <div className="sticky bottom-0 mt-6 bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-slate-200 flex items-center justify-between gap-2 z-20 max-w-lg mx-auto w-full">
            {/* 1. Icono Plantillas (Documento con punto azul + chevron) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowTemplateDrawer(!showTemplateDrawer);
                  setShowFontMenu(false);
                  setShowSpacingMenu(false);
                  setShowColorMenu(false);
                }}
                className={`flex items-center gap-1.5 p-2 rounded-xl transition cursor-pointer relative ${
                  showTemplateDrawer ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-600/20' : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="Cambiar plantilla de currículum"
              >
                <div className="relative">
                  <FileText className="w-4 h-4" />
                  <span className="w-2 h-2 rounded-full bg-blue-600 absolute -top-0.5 -right-0.5 ring-2 ring-white" />
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            {/* 2. Selector de Tipografía y Tamaño (Aa + chevron) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowFontMenu(!showFontMenu);
                  setShowSpacingMenu(false);
                  setShowColorMenu(false);
                }}
                className="flex items-center gap-1.5 p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition cursor-pointer text-xs font-semibold"
                title="Tipografía y tamaño"
              >
                <span className="font-bold">Aa</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showFontMenu && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 space-y-2 z-30 animate-in fade-in duration-150">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Tamaño</div>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                    {(['S', 'M', 'L'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFontSizeScale(s)}
                        className={`text-xs font-bold py-1 rounded-lg transition ${
                          fontSizeScale === s ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  <div className="text-[10px] font-bold uppercase text-slate-400 pt-1 border-t border-slate-100">
                    Fuente
                  </div>
                  <div className="space-y-0.5">
                    {fontOptions.map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => {
                          setActiveFont(f.value);
                          setShowFontMenu(false);
                        }}
                        className={`w-full text-left text-xs px-2 py-1.5 rounded-lg transition ${
                          activeFont === f.value ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Selector de Espaciado (Líneas / interlineado) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowSpacingMenu(!showSpacingMenu);
                  setShowFontMenu(false);
                  setShowColorMenu(false);
                }}
                className="flex items-center gap-1.5 p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Espaciado de página"
              >
                <AlignJustify className="w-4 h-4 text-slate-700" />
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showSpacingMenu && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-40 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1 z-30 animate-in fade-in duration-150">
                  <div className="text-[10px] font-bold uppercase text-slate-400 px-2 py-1">Espaciado</div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSpacing('compact');
                      setShowSpacingMenu(false);
                    }}
                    className={`w-full text-left text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                      activeSpacing === 'compact' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Compacto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSpacing('normal');
                      setShowSpacingMenu(false);
                    }}
                    className={`w-full text-left text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                      activeSpacing === 'normal' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSpacing('relaxed');
                      setShowSpacingMenu(false);
                    }}
                    className={`w-full text-left text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                      activeSpacing === 'relaxed' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Espacioso
                  </button>
                </div>
              )}
            </div>

            {/* 4. Selector de Color (Paleta estilo CVwizard con swatches + input Hex) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowColorMenu(!showColorMenu);
                  setShowFontMenu(false);
                  setShowSpacingMenu(false);
                }}
                className="flex items-center gap-1.5 p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Color de la plantilla"
              >
                <div
                  className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                  style={{ backgroundColor: activeColor }}
                />
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showColorMenu && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 space-y-3 z-30 animate-in fade-in duration-150">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Paleta de Color</div>
                  <div className="grid grid-cols-6 gap-2">
                    {presetColors.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => {
                          setActiveColor(c.hex);
                          setCustomHexInput(c.hex);
                        }}
                        title={c.name}
                        className={`w-7 h-7 rounded-lg transition-transform cursor-pointer flex items-center justify-center ${
                          activeColor === c.hex ? 'ring-2 ring-blue-600 ring-offset-2 scale-105' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      >
                        {activeColor === c.hex && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </div>

                  {/* Input Hexadecimal personalizado */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Color personalizado (Hex)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={activeColor}
                        onChange={(e) => {
                          setActiveColor(e.target.value);
                          setCustomHexInput(e.target.value);
                        }}
                        className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={customHexInput}
                        onChange={(e) => {
                          setCustomHexInput(e.target.value);
                          if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                            setActiveColor(e.target.value);
                          }
                        }}
                        placeholder="#2B547E"
                        className="flex-1 text-xs p-1.5 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Pantalla Completa */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('cv-document-canvas');
                if (el) {
                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    el.requestFullscreen();
                  }
                }
              }}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              title="Pantalla completa"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL / CATÁLOGO COMPLETO DE PLANTILLAS DE CV                             */}
      {/* ========================================================================= */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
                  Elige tu Plantilla de Currículum
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Formatos profesionales optimizados para República Dominicana y estándares internacionales.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {TEMPLATES.map((tmpl) => {
                const isSelected = normalizedTemplate === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      setActiveTemplate(tmpl.id);
                      setShowTemplateModal(false);
                    }}
                    className={`group border-2 rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition relative hover:shadow-lg ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/30 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {tmpl.badge && (
                      <span className="absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                        {tmpl.badge}
                      </span>
                    )}

                    <div className="space-y-3">
                      <div className="h-64 sm:h-72 w-full bg-slate-100/70 rounded-2xl p-2.5 flex items-center justify-center overflow-hidden border border-slate-200/80 group-hover:border-blue-300 group-hover:shadow-md transition-all">
                        <div className="w-full h-full max-w-[195px] bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden relative select-none transform transition-transform group-hover:scale-[1.02]">
                          {renderTemplateRealSheet(tmpl.id, activeColor, {
                            firstName: personalData.firstName,
                            lastName: personalData.lastName,
                            targetJob: personalData.targetJob,
                            photoUrl: photoUrl,
                          })}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {tmpl.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                          {tmpl.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 leading-normal">
                          {tmpl.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-3 flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-800'}`}>
                        {isSelected ? '✓ Seleccionada' : 'Seleccionar plantilla'}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Todas las plantillas son compatibles con exportación en PDF de alta resolución.</span>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="font-bold text-blue-600 hover:text-blue-800 px-3 py-1 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL CREAR NUEVA VERSIÓN DE CV DIRECTO EN EL CONSTRUCTOR                */}
      {/* ========================================================================= */}
      {newCvModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200">
            <button
              type="button"
              onClick={() => setNewCvModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Nueva Versión de Currículum
                </h3>
                <p className="text-xs text-slate-500">
                  Crea una variante especializada para otro sector laboral
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateNewVersionFromBuilder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre o Título de la Versión:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newCvTitle}
                  onChange={(e) => setNewCvTitle(e.target.value)}
                  placeholder="Ej. CV - Especialista en Ventas / CV - Desarrollador Frontend"
                  className="w-full text-xs p-3 bg-white border border-slate-300 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Se copiarán tus experiencias y habilidades para que las adaptes de inmediato.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewCvModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newCvTitle.trim()}
                  className="bg-[#0051d5] hover:bg-[#0041ab] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Crear y Editar Ahora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

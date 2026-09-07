import React from 'react';
import Link from 'next/link';
import Logo from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#001428] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Columna 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <Logo isLight={true} />
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              La plataforma de empleo con Inteligencia Artificial gratuita para la República Dominicana.
              Conectamos el talento local con las mejores empresas del país, desde Santo Domingo y Santiago hasta Punta Cana.
            </p>
            <div className="pt-2 text-xs text-sky-400 font-medium">
              🇩🇴 Diseñado con orgullo para el mercado laboral dominicano.
            </div>
          </div>

          {/* Columna 2: Candidatos */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Para Candidatos</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="hover:text-white transition">Buscar Empleos</Link></li>
              <li><Link href="/dashboard/candidato/cv" className="hover:text-white transition">Creador de CV con IA</Link></li>
              <li><Link href="/dashboard/candidato/postulaciones" className="hover:text-white transition">Mis Postulaciones</Link></li>
              <li><Link href="/empleos?category=Call+Center+y+BPO" className="hover:text-white transition">Call Centers & BPO</Link></li>
              <li><Link href="/empleos?workplaceType=REMOTE" className="hover:text-white transition">Trabajos Remotos</Link></li>
            </ul>
          </div>

          {/* Columna 3: Empresas */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Para Empresas</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/dashboard/empresa/vacantes/nueva" className="hover:text-white transition">Publicar Empleo Gratis</Link></li>
              <li><Link href="/dashboard/empresa" className="hover:text-white transition">Panel ATS de Candidatos</Link></li>
              <li><Link href="/empresas" className="hover:text-white transition">Directorio de Empresas</Link></li>
              <li><Link href="/dashboard/empresa/vacantes/nueva" className="hover:text-white transition">Copiloto de IA para Vacantes</Link></li>
            </ul>
          </div>

          {/* Columna 4: Legal y AdSense */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Legal & Soporte</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/terminos" className="hover:text-white transition">Términos del Servicio</Link></li>
              <li><Link href="/privacidad" className="hover:text-white transition">Política de Privacidad (Ley 172-13)</Link></li>
              <li><Link href="/codigo-trabajo" className="hover:text-white transition">Código de Trabajo RD</Link></li>
              <li><Link href="/admin" className="hover:text-white transition">Gestor de Publicidad</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Quisqueya Talent RD. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <span>Sostenibilidad mediante Google AdSense</span>
            <span>100% Gratuito</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

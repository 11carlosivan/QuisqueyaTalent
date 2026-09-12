import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, Database } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad (Ley 172-13) | Quisqueya Talent',
  description: 'Tratamiento de datos personales y privacidad bajo la Ley No. 172-13 de la República Dominicana en Quisqueya Talent.',
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs space-y-8">
          <div className="border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-4 h-4" /> Cumplimiento Normativo RD
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Política de Privacidad y Protección de Datos
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              En conformidad con la <strong>Ley No. 172-13</strong> sobre la Protección Integral de los Datos Personales de la República Dominicana.
            </p>
          </div>

          <div className="space-y-6 text-slate-700 text-sm sm:text-base leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">1. Compromiso de Privacidad</h2>
              <p>
                En <strong>Quisqueya Talent</strong> valoramos y respetamos la privacidad de nuestros usuarios. Esta política 
                describe cómo recopilamos, utilizamos, almacenamos y protegemos los datos personales de candidatos, empresas y 
                visitantes que interactúan con nuestra plataforma en República Dominicana.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">2. Datos Personales que Recopilamos</h2>
              <p>Podemos recopilar los siguientes tipos de información según el uso que usted haga de la plataforma:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li><strong>Candidatos:</strong> Nombre, apellidos, correo electrónico, teléfono, provincia/ciudad, historial laboral, formación académica, habilidades, idiomas y currículum vitae en PDF o formato digital.</li>
                <li><strong>Empresas y Reclutadores:</strong> Razón social, nombre comercial, RNC (Registro Nacional del Contribuyente), sector de industria, datos de contacto del reclutador y vacantes publicadas.</li>
                <li><strong>Datos Técnicos de Navegación:</strong> Dirección IP aproximada, tipo de navegador, páginas visitadas y cookies para optimización de rendimiento y analítica (Google Analytics).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">3. Finalidad del Tratamiento de Datos</h2>
              <p>Los datos recopilados se utilizan estrictamente para las siguientes finalidades legítimas:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li>Permitir la postulación a vacantes y la visibilidad de su perfil ante empresas reclutadoras interesadas.</li>
                <li>Brindar el servicio de optimización y creación de CV mediante Inteligencia Artificial (procesamiento confidencial).</li>
                <li>Enviar notificaciones sobre el estado de sus postulaciones, confirmaciones de cuenta y alertas de empleo solicitadas.</li>
                <li>Prevenir fraudes, suplantaciones de identidad y garantizar la seguridad de la comunidad laboral.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">4. Derechos del Titular (Derechos ARCO - Ley 172-13)</h2>
              <p>
                De acuerdo con la legislación dominicana (Ley 172-13), todo usuario tiene derecho a:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" /> Acceso e Información
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Conocer qué datos personales tenemos almacenados en su cuenta.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600" /> Rectificación y Actualización
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Modificar en cualquier momento su perfil o currículum desde su panel.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-600" /> Cancelación y Supresión
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Solicitar la eliminación total de su cuenta y datos personales.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" /> Oposición
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Oponerse al tratamiento de sus datos para fines promocionales o informativos.</p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">5. No Comercialización de Datos</h2>
              <p>
                <strong>Quisqueya Talent nunca venderá, alquilará ni cederá</strong> sus datos personales o su currículum vitae a terceros 
                para fines comerciales no relacionados con la intermediación laboral. Sus datos solo son accesibles por empresas a las cuales 
                usted haya decidido postularse o aquellas que consulten la base de talento verificada.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">6. Seguridad de la Información</h2>
              <p>
                Implementamos estándares de seguridad de grado industrial, incluyendo cifrado SSL/TLS en todas las comunicaciones, hash seguro 
                de contraseñas (bcrypt), controles de acceso por roles y almacenamiento en la nube con altos protocolos de seguridad.
              </p>
            </section>

            <section className="space-y-3 pt-4 border-t border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">7. Ejercicio de Derechos y Contacto</h2>
              <p>
                Para ejercer cualquiera de sus derechos reconocidos por la Ley 172-13 o para solicitar la eliminación de su cuenta, puede 
                escribir a nuestro Oficial de Privacidad a:{' '}
                <a href="mailto:privacidad@quisqueyatalent.com.do" className="text-blue-600 font-bold hover:underline">
                  privacidad@quisqueyatalent.com.do
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

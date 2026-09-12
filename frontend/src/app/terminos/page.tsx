import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos del Servicio | Quisqueya Talent',
  description: 'Términos y condiciones de uso de la plataforma Quisqueya Talent en República Dominicana.',
};

export default function TerminosPage() {
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
              <FileText className="w-4 h-4" /> Legal & Normativa
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Términos del Servicio
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Última actualización: Septiembre 2026 • Quisqueya Talent RD
            </p>
          </div>

          <div className="space-y-6 text-slate-700 text-sm sm:text-base leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">1. Aceptación de los Términos</h2>
              <p>
                Al acceder y utilizar <strong>Quisqueya Talent</strong> (en adelante, la "Plataforma"), disponible a través de 
                <span className="font-semibold text-blue-600"> www.quisqueyatalent.com.do</span>, usted acepta quedar vinculado 
                por los presentes Términos del Servicio y por nuestra Política de Privacidad. Si no está de acuerdo con estos 
                términos, deberá abstenerse de utilizar la Plataforma.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">2. Naturaleza del Servicio y Gratuidad</h2>
              <p>
                Quisqueya Talent es una plataforma digital de intermediación laboral e impulso al empleo asistida por Inteligencia 
                Artificial, diseñada para conectar candidatos y empresas dentro de la República Dominicana.
              </p>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Principio de Gratuidad para Candidatos:</p>
                  <p className="text-xs sm:text-sm text-emerald-800 mt-1">
                    La búsqueda de empleo, la postulación a vacantes, la creación de currículums profesionales mediante IA y el acceso 
                    a las oportunidades laborales son y serán <strong>100% gratuitos para los candidatos</strong>. Queda terminantemente 
                    prohibido que cualquier empresa o tercero cobre a los candidatos por postularse o participar en procesos de selección.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">3. Obligaciones de las Empresas y Reclutadores</h2>
              <p>Las empresas y reclutadores registrados se comprometen a:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li>Publicar únicamente ofertas de empleo legítimas, verificables y vigentes en territorio dominicano o remotas autorizadas.</li>
                <li>No solicitar ningún tipo de pago, depósito, compra de cursos, certificados o materiales como requisito para optar por una vacante.</li>
                <li>Cumplir estrictamente con el <strong>Principio de No Discriminación</strong> estipulado en el Principio Fundamental VII del Código de Trabajo de la República Dominicana (Ley No. 16-92), garantizando igualdad de trato sin distinción de sexo, edad, raza, religión o condición social.</li>
                <li>Proteger la confidencialidad de los datos personales y currículums a los que tengan acceso a través del panel ATS.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">4. Obligaciones de los Candidatos</h2>
              <p>
                Los candidatos garantizan que la información suministrada en su perfil, currículum vitae y respuestas a cuestionarios es 
                veraz, exacta y actualizada. Quisqueya Talent se reserva el derecho de suspender perfiles que contengan información fraudulenta 
                o suplanten la identidad de terceros.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">5. Uso de Inteligencia Artificial</h2>
              <p>
                Nuestra plataforma incorpora herramientas de Inteligencia Artificial (IA) para la optimización de currículums, redacción de 
                descripciones de puestos y sugerencias de compatibilidad (ATS Match). Estas herramientas tienen carácter estrictamente 
                orientativo y de asistencia. La decisión final de contratación corresponde exclusivamente a los seres humanos encargados 
                del proceso de selección en cada empresa.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">6. Limitación de Responsabilidad</h2>
              <p>
                Quisqueya Talent actúa como canal facilitador y no forma parte de la relación laboral, contractual o precontractual que 
                pueda surgir entre candidatos y empleadores. La plataforma no garantiza la contratación efectiva de ningún candidato ni la 
                idoneidad absoluta de los postulantes para un puesto específico.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">7. Ley Aplicable y Jurisdicción</h2>
              <p>
                Los presentes Términos se rigen e interpretan de conformidad con las leyes de la <strong>República Dominicana</strong>. Para 
                cualquier controversia que pudiera derivarse del uso de la plataforma, las partes se someten a la jurisdicción de los tribunales 
                competentes del Distrito Nacional, República Dominicana.
              </p>
            </section>

            <section className="space-y-3 pt-4 border-t border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">8. Contacto</h2>
              <p>
                Para cualquier duda, denuncia de vacantes sospechosas o consultas legales, puede comunicarse con nuestro equipo en:{' '}
                <a href="mailto:legal@quisqueyatalent.com.do" className="text-blue-600 font-bold hover:underline">
                  legal@quisqueyatalent.com.do
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

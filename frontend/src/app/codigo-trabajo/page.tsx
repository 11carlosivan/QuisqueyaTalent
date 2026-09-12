import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, Award, ShieldAlert, CheckCircle2, DollarSign } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guía de Derechos Laborales en RD (Ley 16-92) | Quisqueya Talent',
  description: 'Conoce tus derechos como trabajador en República Dominicana según el Código de Trabajo (Ley 16-92): jornadas, preaviso, cesantía y regalía pascual.',
};

export default function CodigoTrabajoPage() {
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
              <BookOpen className="w-4 h-4" /> Orientación Laboral Dominicana
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Código de Trabajo de la República Dominicana
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Resumen orientativo de los derechos fundamentales del trabajador amparados por la <strong>Ley No. 16-92</strong>.
            </p>
          </div>

          <div className="space-y-6 text-slate-700 text-sm sm:text-base leading-relaxed">
            <p>
              En <strong>Quisqueya Talent</strong> promovemos el empleo formal, justo y transparente. Todo candidato y trabajador 
              en territorio dominicano debe conocer los pilares básicos estipulados por el Ministerio de Trabajo y el Código Laboral:
            </p>

            {/* Tarjetas de Derechos Clave */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" /> Jornada Máxima de Trabajo
                </div>
                <p className="text-xs sm:text-sm text-slate-600">
                  La jornada normal no puede exceder de <strong>8 horas al día ni de 44 horas a la semana</strong> (Art. 147). Todo 
                  trabajo que exceda las 44 horas semanales se considera hora extraordinaria remunerada con recargo legal.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" /> Salario de Navidad (Regalía)
                </div>
                <p className="text-xs sm:text-sm text-slate-600">
                  El empleador está obligado a pagar la duodécima (1/12) parte del total de los salarios ordinarios devengados en el 
                  año calendario. Debe pagarse a más tardar el <strong>20 de diciembre</strong> de cada año (Art. 219).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" /> Vacaciones Anuales
                </div>
                <p className="text-xs sm:text-sm text-slate-600">
                  Todo trabajador tiene derecho a un período de vacaciones retribuidas de <strong>14 días laborables</strong> después 
                  de un año de servicio ininterrumpido (Art. 177). A partir del quinto año, corresponden 18 días laborables.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-blue-600" /> Preaviso y Cesantía
                </div>
                <p className="text-xs sm:text-sm text-slate-600">
                  En caso de desahucio injustificado por parte del empleador, el trabajador tiene derecho al pago de su auxilio de 
                  cesantía y omisión de preaviso de acuerdo a su tiempo de servicio (Arts. 76 y 80).
                </p>
              </div>
            </div>

            <section className="space-y-3 pt-4">
              <h2 className="text-xl font-bold text-slate-900">Principio de No Discriminación en el Empleo</h2>
              <p>
                El Principio Fundamental VII del Código prohíbe categóricamente cualquier discriminación, exclusión o preferencia 
                basada en sexo, edad, raza, religión, opinión política o condición social en el acceso y mantenimiento del empleo en RD.
              </p>
            </section>

            <section className="space-y-3 pt-2">
              <h2 className="text-xl font-bold text-slate-900">Canales Oficiales del Ministerio de Trabajo</h2>
              <p>
                Para denuncias formales, consultas sobre cálculo de prestaciones laborales o asistencia jurídica gratuita para trabajadores, 
                puede acudir a las representaciones locales del <strong>Ministerio de Trabajo de la República Dominicana</strong> o ingresar a{' '}
                <a href="https://mt.gob.do" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">
                  mt.gob.do
                </a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const FROM_EMAIL = process.env.FROM_EMAIL || 'Quisqueya Talent <notificaciones@quisqueyatalent.com.do>';

export interface SendApplicationEmailParams {
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  companyEmail?: string | null;
}

export const emailService = {
  /**
   * Notificar al candidato y a la empresa tras una postulación
   */
  async sendApplicationNotifications({
    candidateEmail,
    candidateName,
    jobTitle,
    companyName,
    companyEmail,
  }: SendApplicationEmailParams) {
    if (!resend) {
      console.log('ℹ️ Resend API Key no configurada, simulando envío de correos.');
      return;
    }

    try {
      // 1. Correo de confirmación al Candidato
      await resend.emails.send({
        from: FROM_EMAIL,
        to: candidateEmail,
        subject: `¡Postulación confirmada para ${jobTitle} en ${companyName}! 🇩🇴`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #0284c7; margin: 0; font-size: 24px;">Quisqueya Talent</h1>
              <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Bolsa de Empleo con IA para República Dominicana</p>
            </div>

            <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">¡Hola, ${candidateName}!</h2>
              <p style="color: #334155; font-size: 15px; line-height: 1.6;">
                Hemos recibido tu postulación con éxito para la vacante de <strong>${jobTitle}</strong> en <strong>${companyName}</strong>.
              </p>
              <p style="color: #334155; font-size: 15px; line-height: 1.6;">
                El equipo de reclutamiento revisará tu perfil y currículum. Puedes dar seguimiento al estado de tu postulación en tu panel de candidato.
              </p>
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <a href="https://www.quisqueyatalent.com.do/dashboard/candidato/postulaciones" style="background-color: #0284c7; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Ver mis Postulaciones
              </a>
            </div>

            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0 16px;" />
            <p style="text-align: center; color: #94a3b8; font-size: 12px;">
              © 2026 Quisqueya Talent • Santo Domingo, República Dominicana
            </p>
          </div>
        `,
      });

      // 2. Correo de notificación a la Empresa (si tiene email configurado)
      if (companyEmail) {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: companyEmail,
          subject: `Nueva postulación recibida: ${candidateName} aplicó a ${jobTitle}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px; background-color: #ffffff;">
              <h2 style="color: #0284c7; margin-top: 0;">Quisqueya Talent Empresas</h2>
              <p style="color: #334155; font-size: 15px; line-height: 1.6;">
                El candidato <strong>${candidateName}</strong> se ha postulado para la vacante de <strong>${jobTitle}</strong>.
              </p>
              <p style="color: #334155; font-size: 15px; line-height: 1.6;">
                Puedes revisar su perfil, currículum y gestionar su etapa en tu panel ATS Kanban.
              </p>
              <div style="text-align: center; margin-top: 24px;">
                <a href="https://www.quisqueyatalent.com.do/dashboard/empresa" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Ir al Panel de Reclutamiento (ATS)
                </a>
              </div>
            </div>
          `,
        });
      }
    } catch (error) {
      console.error('Error enviando notificación por email con Resend:', error);
    }
  },

  /**
   * Notificar al candidato cuando su estado en el ATS cambia
   */
  async sendStatusUpdateNotification({
    candidateEmail,
    candidateName,
    jobTitle,
    companyName,
    newStatus,
  }: {
    candidateEmail: string;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    newStatus: string;
  }) {
    if (!resend) return;

    const statusLabels: Record<string, string> = {
      APPLIED: 'Postulado',
      REVIEWING: 'En Revisión',
      INTERVIEW: 'Seleccionado para Entrevista',
      OFFER: 'Oferta Laboral',
      REJECTED: 'No seleccionado en esta ocasión',
      HIRED: '¡Contratado!',
    };

    const statusName = statusLabels[newStatus] || newStatus;

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: candidateEmail,
        subject: `Actualización de tu postulación para ${jobTitle} en ${companyName}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px;">
            <h2 style="color: #0284c7; margin-top: 0;">Quisqueya Talent</h2>
            <p>Hola <strong>${candidateName}</strong>,</p>
            <p>La empresa <strong>${companyName}</strong> ha actualizado el estado de tu postulación para la vacante de <strong>${jobTitle}</strong> a:</p>
            <div style="background: #e0f2fe; color: #0369a1; padding: 12px 16px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; margin: 12px 0;">
              ${statusName}
            </div>
            <p style="color: #64748b; font-size: 14px;">Inicia sesión en tu cuenta para ver más detalles o mensajes del reclutador.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Error enviando actualización de estado con Resend:', error);
    }
  },

  /**
   * Enviar enlace para restablecer contraseña olvidada
   */
  async sendPasswordResetEmail({
    email,
    resetUrl,
    userName,
  }: {
    email: string;
    resetUrl: string;
    userName?: string;
  }) {
    if (!resend) {
      console.log('ℹ️ Resend API Key no configurada. Enlace de restablecimiento generado:', resetUrl);
      return;
    }

    try {
      const nameGreeting = userName ? `¡Hola, ${userName}!` : '¡Hola!';
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Restablece tu contraseña de Quisqueya Talent 🇩🇴',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #0284c7; margin: 0; font-size: 24px; font-weight: 800;">Quisqueya Talent</h1>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Recuperación Segura de Contraseña</p>
            </div>

            <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #f1f5f9;">
              <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">${nameGreeting}</h2>
              <p style="color: #334155; font-size: 15px; line-height: 1.6;">
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>Quisqueya Talent</strong>.
              </p>
              <p style="color: #334155; font-size: 15px; line-height: 1.6;">
                Haz clic en el siguiente botón para definir una nueva contraseña segura:
              </p>

              <div style="text-align: center; margin: 28px 0;">
                <a href="${resetUrl}" style="background-color: #0284c7; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.2);">
                  Restablecer mi Contraseña
                </a>
              </div>

              <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 0;">
                ⏱️ Este enlace es válido únicamente por <strong>1 hora</strong>. Si no solicitaste este cambio, puedes ignorar este correo; tu cuenta permanece completamente segura.
              </p>
            </div>

            <div style="text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px;">
              <p style="margin: 4px 0;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
              <p style="margin: 4px 0; word-break: break-all; color: #0284c7;">${resetUrl}</p>
              <p style="margin-top: 16px;">© 2026 Quisqueya Talent • Santo Domingo, República Dominicana</p>
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.error('Error enviando correo de restablecimiento con Resend:', error);
      throw error;
    }
  },
};

export default emailService;

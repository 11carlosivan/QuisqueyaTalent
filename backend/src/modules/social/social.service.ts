import crypto from 'crypto';
import prisma from '../../config/prisma';

export interface SocialCopyData {
  title: string;
  companyName: string;
  province: string;
  workplaceType: string;
  salaryText?: string;
  url: string;
  imageUrl?: string | null;
  descriptionSnippet?: string;
}

export class SocialService {
  /**
   * Obtiene la configuración actual de redes sociales o crea la configuración por defecto
   */
  static async getSettings() {
    let settings = await prisma.socialMediaSetting.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.socialMediaSetting.create({
        data: {
          id: 'default',
          autoShareOnPublish: true,
          whatsappActive: true,
          whatsappWebhookUrl: 'https://7107.api.greenapi.com/waInstance710722741020/sendMessage/8855ab5f803e4527b7d9580c95151dd142f950a3165647849b',
          whatsappChannelId: '120363429972361642@g.us',
          whatsappApiKey: '8855ab5f803e4527b7d9580c95151dd142f950a3165647849b',
          twitterActive: false,
          facebookActive: false,
          instagramActive: false,
        },
      });
    } else if (!settings.whatsappWebhookUrl) {
      settings = await prisma.socialMediaSetting.update({
        where: { id: 'default' },
        data: {
          whatsappActive: true,
          autoShareOnPublish: true,
          whatsappWebhookUrl: 'https://7107.api.greenapi.com/waInstance710722741020/sendMessage/8855ab5f803e4527b7d9580c95151dd142f950a3165647849b',
          whatsappChannelId: '120363429972361642@g.us',
          whatsappApiKey: '8855ab5f803e4527b7d9580c95151dd142f950a3165647849b',
        },
      });
    }

    return settings;
  }

  /**
   * Actualiza la configuración de redes sociales
   */
  static async updateSettings(data: any) {
    const updated = await prisma.socialMediaSetting.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        ...data,
      },
      update: {
        ...data,
      },
    });

    return updated;
  }

  /**
   * Extrae los datos necesarios de una vacante para armar los copys de difusión
   */
  static extractJobData(job: any): SocialCopyData {
    const title = job.title || 'Vacante Disponible';
    const companyName = job.company?.name || 'Empresa Dominicana';
    const province = job.province || 'República Dominicana';
    
    let workplaceType = 'Presencial';
    if (job.workplaceType === 'REMOTE') workplaceType = '100% Remoto';
    else if (job.workplaceType === 'HYBRID') workplaceType = 'Híbrido';

    let salaryText: string | undefined = undefined;
    if (job.salaryMin && job.salaryMax) {
      salaryText = `${job.salaryCurrency || 'RD$'} ${Number(job.salaryMin).toLocaleString()} - ${Number(job.salaryMax).toLocaleString()}`;
    } else if (job.salaryMin) {
      salaryText = `Desde ${job.salaryCurrency || 'RD$'} ${Number(job.salaryMin).toLocaleString()}`;
    }

    const url = `https://www.quisqueyatalent.com.do/empleos/${job.slug}`;

    return {
      title,
      companyName,
      province,
      workplaceType,
      salaryText,
      url,
      imageUrl: job.imageUrl || (job.company?.logoUrl && !job.company.logoUrl.includes('icono.svg') ? job.company.logoUrl : null),
      descriptionSnippet: job.description ? job.description.slice(0, 160).trim() + '...' : undefined,
    };
  }

  /**
   * Genera el copy formateado para cada red social
   */
  static formatMessage(data: SocialCopyData, channel: 'WHATSAPP' | 'TWITTER' | 'FACEBOOK' | 'INSTAGRAM', customTemplate?: string | null): string {
    if (customTemplate && customTemplate.trim()) {
      return customTemplate
        .replace(/{titulo}/gi, data.title)
        .replace(/{empresa}/gi, data.companyName)
        .replace(/{ubicacion}/gi, data.province)
        .replace(/{modalidad}/gi, data.workplaceType)
        .replace(/{salario}/gi, data.salaryText || 'No especificado')
        .replace(/{enlace}/gi, data.url);
    }

    if (channel === 'WHATSAPP') {
      let msg = `💼 *NUEVA VACANTE EN REPÚBLICA DOMINICANA* 🇩🇴\n\n`;
      msg += `📌 *Puesto:* ${data.title}\n`;
      msg += `🏢 *Empresa:* ${data.companyName}\n`;
      msg += `📍 *Ubicación:* ${data.province}\n`;
      msg += `🤝 *Modalidad:* ${data.workplaceType}\n`;
      if (data.salaryText) {
        msg += `💰 *Salario:* ${data.salaryText}\n`;
      }
      msg += `\n👉 *Ver requisitos completos y postularte gratis aquí:*\n${data.url}\n\n`;
      msg += `🔔 _Comparte esta oportunidad con un amigo o familiar que esté buscando empleo en RD._`;
      return msg;
    }

    if (channel === 'TWITTER') {
      // Máximo 280 caracteres
      let tweet = `🚨 NUEVA VACANTE EN RD 🇩🇴\n\n`;
      tweet += `💼 ${data.title}\n`;
      tweet += `🏢 ${data.companyName}\n`;
      tweet += `📍 ${data.province} (${data.workplaceType})\n\n`;
      tweet += `👉 Postúlate gratis: ${data.url}\n\n`;
      tweet += `#EmpleosRD #TrabajoRD #QuisqueyaTalent`;

      if (tweet.length > 280) {
        // Versión compacta
        tweet = `🚨 ${data.title} en ${data.companyName} (${data.province})\n\n👉 Postúlate: ${data.url}\n\n#EmpleosRD #QuisqueyaTalent`;
      }
      return tweet;
    }

    if (channel === 'FACEBOOK') {
      let post = `📢 ¡Nueva oportunidad laboral activa en Quisqueya Talent! 🇩🇴\n\n`;
      post += `💼 Puesto: ${data.title}\n`;
      post += `🏢 Empresa: ${data.companyName}\n`;
      post += `📍 Ubicación: ${data.province} | Modalidad: ${data.workplaceType}\n`;
      if (data.salaryText) {
        post += `💵 Salario: ${data.salaryText}\n`;
      }
      post += `\nEncuentra todos los detalles de la oferta, requisitos de postulación y envía tu currículum sin intermediarios:\n`;
      post += `👉 ${data.url}\n\n`;
      post += `💡 Quisqueya Talent: La plataforma gratuita de empleos en República Dominicana con asistente de CV profesional con IA.\n\n`;
      post += `#EmpleosRD #TrabajoRepublicaDominicana #VacantesRD #QuisqueyaTalent`;
      return post;
    }

    // INSTAGRAM
    let ig = `¡Nueva vacante publicada en República Dominicana! 🇩🇴✨\n\n`;
    ig += `📌 Puesto: ${data.title}\n`;
    ig += `🏢 Empresa: ${data.companyName}\n`;
    ig += `📍 Ubicación: ${data.province}\n`;
    ig += `🤝 Modalidad: ${data.workplaceType}\n`;
    if (data.salaryText) {
      ig += `💰 Salario: ${data.salaryText}\n`;
    }
    ig += `\n🔗 Para ver los detalles completos y enviar tu CV:\n`;
    ig += `Haz clic en el enlace de nuestra biografía o entra a: ${data.url}\n\n`;
    ig += `Etiqueta a alguien que esté buscando empleo o comparte en tus historias 📥\n\n`;
    ig += `#empleosrd #vacantesrd #trabajord #santodomingo #santiago #quisqueyatalent #empleosdominicana`;
    return ig;
  }

  /**
   * Genera firma OAuth 1.0a para autenticar llamadas contra la API v2 de Twitter / X
   */
  private static generateTwitterOAuthHeader(
    method: string,
    url: string,
    consumerKey: string,
    consumerSecret: string,
    accessToken: string,
    accessTokenSecret: string
  ): string {
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: consumerKey,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_token: accessToken,
      oauth_version: '1.0',
    };

    const sortedParams = Object.keys(oauthParams)
      .sort()
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(oauthParams[key])}`)
      .join('&');

    const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
    const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(accessTokenSecret)}`;
    const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');

    oauthParams['oauth_signature'] = signature;

    const authHeader =
      'OAuth ' +
      Object.keys(oauthParams)
        .sort()
        .map((key) => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
        .join(', ');

    return authHeader;
  }

  /**
   * Envía la vacante a WhatsApp (Webhook / Bot / Canal API)
   */
  static async sendToWhatsApp(data: SocialCopyData, settings: any): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!settings.whatsappActive) {
      return { success: false, error: 'Integración de WhatsApp inactiva' };
    }

    if (!settings.whatsappWebhookUrl) {
      return { success: false, error: 'No se ha configurado la URL de Webhook o API de WhatsApp' };
    }

    const message = this.formatMessage(data, 'WHATSAPP', settings.whatsappTemplate);
    const targetChatId = settings.whatsappChannelId || undefined;

    try {
      let targetUrl = settings.whatsappWebhookUrl.trim();

      // Si es Green-API y el usuario colocó solo el host base
      if (
        (targetUrl.includes('greenapi.com') || targetUrl.includes('green-api.com')) &&
        !targetUrl.includes('/sendMessage/') &&
        !targetUrl.includes('/sendFileByUrl/')
      ) {
        const cleanHost = targetUrl.replace(/\/+$/, '');
        const instance = settings.whatsappApiKey ? '710722741020' : '';
        const token = settings.whatsappApiKey || '';
        // Si el usuario puso el host base y el token
        if (targetUrl.includes('/waInstance')) {
          targetUrl = `${cleanHost}/sendMessage/${token}`;
        } else {
          targetUrl = `${cleanHost}/waInstance710722741020/sendMessage/${token}`;
        }
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (settings.whatsappApiKey && !targetUrl.includes(settings.whatsappApiKey)) {
        headers['Authorization'] = `Bearer ${settings.whatsappApiKey}`;
        headers['x-api-key'] = settings.whatsappApiKey;
      }

      // Payload universal compatible con Green-API, Baileys, Evolution API y n8n
      const payload: any = {
        chatId: targetChatId,
        recipient: targetChatId,
        channelId: targetChatId,
        message,
        text: message,
        caption: message,
        title: data.title,
        url: data.url,
        imageUrl: data.imageUrl || undefined,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        return { success: false, error: `WhatsApp HTTP ${response.status}: ${errText.slice(0, 200)}` };
      }

      let resData: any = {};
      try {
        resData = await response.json();
      } catch {}

      return {
        success: true,
        id: resData.idMessage || resData.id || resData.messageId || resData.key?.id || `wa-${Date.now()}`,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión con WhatsApp Webhook' };
    }
  }

  /**
   * Publica un tweet en X / Twitter utilizando la API oficial v2
   */
  static async sendToTwitter(data: SocialCopyData, settings: any): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!settings.twitterActive) {
      return { success: false, error: 'Integración de X (Twitter) inactiva' };
    }

    if (!settings.twitterApiKey || !settings.twitterApiSecret || !settings.twitterAccessToken || !settings.twitterAccessSecret) {
      return { success: false, error: 'Credenciales incompletas de X (Twitter)' };
    }

    const text = this.formatMessage(data, 'TWITTER', settings.twitterTemplate);
    const endpoint = 'https://api.twitter.com/2/tweets';

    try {
      const authHeader = this.generateTwitterOAuthHeader(
        'POST',
        endpoint,
        settings.twitterApiKey,
        settings.twitterApiSecret,
        settings.twitterAccessToken,
        settings.twitterAccessSecret
      );

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const resJson: any = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: `Twitter API Error (${response.status}): ${resJson.detail || resJson.title || JSON.stringify(resJson)}`,
        };
      }

      return {
        success: true,
        id: resJson.data?.id,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Fallo de conexión con X API' };
    }
  }

  /**
   * Publica una foto o post en la Página de Facebook (Meta Graph API)
   */
  static async sendToFacebook(data: SocialCopyData, settings: any): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!settings.facebookActive) {
      return { success: false, error: 'Integración de Facebook inactiva' };
    }

    if (!settings.facebookPageId || !settings.facebookAccessToken) {
      return { success: false, error: 'Faltan Page ID o Access Token de Facebook' };
    }

    const message = this.formatMessage(data, 'FACEBOOK');

    try {
      let endpoint = `https://graph.facebook.com/v19.0/${settings.facebookPageId}/feed`;
      let body: any = {
        message,
        link: data.url,
        access_token: settings.facebookAccessToken,
      };

      // Si tenemos imagen pública, publicar en endpoint /photos
      if (data.imageUrl && data.imageUrl.startsWith('http')) {
        endpoint = `https://graph.facebook.com/v19.0/${settings.facebookPageId}/photos`;
        body = {
          caption: message,
          url: data.imageUrl,
          access_token: settings.facebookAccessToken,
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const resJson: any = await response.json();

      if (!response.ok || resJson.error) {
        return {
          success: false,
          error: `Meta Graph Error: ${resJson.error?.message || JSON.stringify(resJson)}`,
        };
      }

      return {
        success: true,
        id: resJson.id || resJson.post_id,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error conectando con Facebook Graph API' };
    }
  }

  /**
   * Publica en el Feed de Instagram Business (Meta Graph API para Instagram)
   */
  static async sendToInstagram(data: SocialCopyData, settings: any): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!settings.instagramActive) {
      return { success: false, error: 'Integración de Instagram inactiva' };
    }

    if (!settings.instagramAccountId || !settings.instagramAccessToken) {
      return { success: false, error: 'Faltan Instagram Account ID o Access Token de Meta' };
    }

    if (!data.imageUrl || !data.imageUrl.startsWith('http')) {
      return { success: false, error: 'Instagram requiere obligatoriamente una imagen URL accesible para publicar' };
    }

    const caption = this.formatMessage(data, 'INSTAGRAM');

    try {
      // Paso 1: Crear contenedor de medio (media container)
      const containerRes = await fetch(`https://graph.facebook.com/v19.0/${settings.instagramAccountId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: data.imageUrl,
          caption,
          access_token: settings.instagramAccessToken,
        }),
      });

      const containerJson: any = await containerRes.json();
      if (!containerRes.ok || containerJson.error || !containerJson.id) {
        return {
          success: false,
          error: `Instagram Media Container Error: ${containerJson.error?.message || JSON.stringify(containerJson)}`,
        };
      }

      const creationId = containerJson.id;

      // Paso 2: Publicar el contenedor creado
      const publishRes = await fetch(`https://graph.facebook.com/v19.0/${settings.instagramAccountId}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: settings.instagramAccessToken,
        }),
      });

      const publishJson: any = await publishRes.json();
      if (!publishRes.ok || publishJson.error) {
        return {
          success: false,
          error: `Instagram Publish Error: ${publishJson.error?.message || JSON.stringify(publishJson)}`,
        };
      }

      return {
        success: true,
        id: publishJson.id,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error conectando con Instagram Graph API' };
    }
  }

  /**
   * Difunde una vacante a todos los canales activos o a los especificados
   */
  static async broadcastJob(jobId: string, specificChannels?: string[]): Promise<Record<string, { success: boolean; id?: string; error?: string }>> {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: {
          select: { name: true, logoUrl: true },
        },
      },
    });

    if (!job) {
      throw new Error('Vacante no encontrada para difusión');
    }

    const settings = await this.getSettings();
    const data = this.extractJobData(job);
    const results: Record<string, { success: boolean; id?: string; error?: string }> = {};

    const targetChannels = specificChannels || ['WHATSAPP', 'TWITTER', 'FACEBOOK', 'INSTAGRAM'];

    // 1. WhatsApp
    if (targetChannels.includes('WHATSAPP') && (specificChannels || settings.whatsappActive)) {
      const res = await this.sendToWhatsApp(data, settings);
      results['WHATSAPP'] = res;
      await prisma.socialShareLog.create({
        data: {
          jobId: job.id,
          channel: 'WHATSAPP',
          status: res.success ? 'SUCCESS' : 'FAILED',
          externalPostId: res.id || null,
          messageSnippet: this.formatMessage(data, 'WHATSAPP').slice(0, 150),
          errorMessage: res.error || null,
        },
      });
    }

    // 2. Twitter / X
    if (targetChannels.includes('TWITTER') && (specificChannels || settings.twitterActive)) {
      const res = await this.sendToTwitter(data, settings);
      results['TWITTER'] = res;
      await prisma.socialShareLog.create({
        data: {
          jobId: job.id,
          channel: 'TWITTER',
          status: res.success ? 'SUCCESS' : 'FAILED',
          externalPostId: res.id || null,
          messageSnippet: this.formatMessage(data, 'TWITTER').slice(0, 150),
          errorMessage: res.error || null,
        },
      });
    }

    // 3. Facebook
    if (targetChannels.includes('FACEBOOK') && (specificChannels || settings.facebookActive)) {
      const res = await this.sendToFacebook(data, settings);
      results['FACEBOOK'] = res;
      await prisma.socialShareLog.create({
        data: {
          jobId: job.id,
          channel: 'FACEBOOK',
          status: res.success ? 'SUCCESS' : 'FAILED',
          externalPostId: res.id || null,
          messageSnippet: this.formatMessage(data, 'FACEBOOK').slice(0, 150),
          errorMessage: res.error || null,
        },
      });
    }

    // 4. Instagram
    if (targetChannels.includes('INSTAGRAM') && (specificChannels || settings.instagramActive)) {
      const res = await this.sendToInstagram(data, settings);
      results['INSTAGRAM'] = res;
      await prisma.socialShareLog.create({
        data: {
          jobId: job.id,
          channel: 'INSTAGRAM',
          status: res.success ? 'SUCCESS' : 'FAILED',
          externalPostId: res.id || null,
          messageSnippet: this.formatMessage(data, 'INSTAGRAM').slice(0, 150),
          errorMessage: res.error || null,
        },
      });
    }

    return results;
  }

  /**
   * Envía un mensaje de prueba al canal solicitado
   */
  static async testChannel(channel: 'WHATSAPP' | 'TWITTER' | 'FACEBOOK' | 'INSTAGRAM') {
    const settings = await this.getSettings();

    const sampleJobData: SocialCopyData = {
      title: 'Desarrollador Full Stack & UI/UX',
      companyName: 'Quisqueya Talent (Oficial)',
      province: 'Distrito Nacional',
      workplaceType: 'Híbrido',
      salaryText: 'RD$ 85,000 - RD$ 110,000',
      url: 'https://www.quisqueyatalent.com.do',
      imageUrl: 'https://www.quisqueyatalent.com.do/og-image.png',
      descriptionSnippet: 'Buscamos profesional para el ecosistema de empleo líder en RD.',
    };

    if (channel === 'WHATSAPP') {
      return await this.sendToWhatsApp(sampleJobData, settings);
    }
    if (channel === 'TWITTER') {
      return await this.sendToTwitter(sampleJobData, settings);
    }
    if (channel === 'FACEBOOK') {
      return await this.sendToFacebook(sampleJobData, settings);
    }
    if (channel === 'INSTAGRAM') {
      return await this.sendToInstagram(sampleJobData, settings);
    }

    throw new Error(`Canal desconocido: ${channel}`);
  }

  /**
   * Obtiene los logs de difusiones recientes
   */
  static async getRecentLogs(limit = 40) {
    return await prisma.socialShareLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default SocialService;

import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';
import SocialService from './social.service';
import prisma from '../../config/prisma';

const router = Router();

// Middleware: Sólo administradores
router.use(authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN));

/**
 * 1. Obtener la configuración actual de redes sociales
 */
router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const settings = await SocialService.getSettings();
    return res.json(settings);
  } catch (error: any) {
    console.error('Error obteniendo configuración social:', error);
    return res.status(500).json({ error: 'Error al obtener configuración de redes sociales' });
  }
});

/**
 * 2. Guardar/Actualizar la configuración de redes sociales
 */
router.put('/settings', async (req: Request, res: Response) => {
  try {
    const {
      autoShareOnPublish,
      whatsappActive,
      whatsappWebhookUrl,
      whatsappChannelId,
      whatsappApiKey,
      whatsappTemplate,
      twitterActive,
      twitterApiKey,
      twitterApiSecret,
      twitterAccessToken,
      twitterAccessSecret,
      twitterTemplate,
      facebookActive,
      facebookPageId,
      facebookAccessToken,
      instagramActive,
      instagramAccountId,
      instagramAccessToken,
    } = req.body;

    const data: any = {};
    if (typeof autoShareOnPublish === 'boolean') data.autoShareOnPublish = autoShareOnPublish;

    // WhatsApp
    if (typeof whatsappActive === 'boolean') data.whatsappActive = whatsappActive;
    if (whatsappWebhookUrl !== undefined) data.whatsappWebhookUrl = whatsappWebhookUrl ? String(whatsappWebhookUrl).trim() : null;
    if (whatsappChannelId !== undefined) data.whatsappChannelId = whatsappChannelId ? String(whatsappChannelId).trim() : null;
    if (whatsappApiKey !== undefined && whatsappApiKey !== '***') data.whatsappApiKey = whatsappApiKey ? String(whatsappApiKey).trim() : null;
    if (whatsappTemplate !== undefined) data.whatsappTemplate = whatsappTemplate || null;

    // Twitter
    if (typeof twitterActive === 'boolean') data.twitterActive = twitterActive;
    if (twitterApiKey !== undefined && twitterApiKey !== '***') data.twitterApiKey = twitterApiKey ? String(twitterApiKey).trim() : null;
    if (twitterApiSecret !== undefined && twitterApiSecret !== '***') data.twitterApiSecret = twitterApiSecret ? String(twitterApiSecret).trim() : null;
    if (twitterAccessToken !== undefined && twitterAccessToken !== '***') data.twitterAccessToken = twitterAccessToken ? String(twitterAccessToken).trim() : null;
    if (twitterAccessSecret !== undefined && twitterAccessSecret !== '***') data.twitterAccessSecret = twitterAccessSecret ? String(twitterAccessSecret).trim() : null;
    if (twitterTemplate !== undefined) data.twitterTemplate = twitterTemplate || null;

    // Facebook
    if (typeof facebookActive === 'boolean') data.facebookActive = facebookActive;
    if (facebookPageId !== undefined) data.facebookPageId = facebookPageId ? String(facebookPageId).trim() : null;
    if (facebookAccessToken !== undefined && facebookAccessToken !== '***') data.facebookAccessToken = facebookAccessToken ? String(facebookAccessToken).trim() : null;

    // Instagram
    if (typeof instagramActive === 'boolean') data.instagramActive = instagramActive;
    if (instagramAccountId !== undefined) data.instagramAccountId = instagramAccountId ? String(instagramAccountId).trim() : null;
    if (instagramAccessToken !== undefined && instagramAccessToken !== '***') data.instagramAccessToken = instagramAccessToken ? String(instagramAccessToken).trim() : null;

    const updated = await SocialService.updateSettings(data);
    return res.json({ message: 'Configuración actualizada con éxito', settings: updated });
  } catch (error: any) {
    console.error('Error guardando configuración social:', error);
    return res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

/**
 * 3. Probar conexión y envío en un canal específico
 */
router.post('/test/:channel', async (req: Request, res: Response) => {
  try {
    const rawChannel = Array.isArray(req.params.channel) ? req.params.channel[0] : req.params.channel;
    const channel = (rawChannel || '').toUpperCase() as 'WHATSAPP' | 'TWITTER' | 'FACEBOOK' | 'INSTAGRAM';
    if (!['WHATSAPP', 'TWITTER', 'FACEBOOK', 'INSTAGRAM'].includes(channel)) {
      return res.status(400).json({ error: 'Canal no válido' });
    }

    const result = await SocialService.testChannel(channel);
    return res.json({ channel, ...result });
  } catch (error: any) {
    console.error(`Error en test de canal:`, error);
    return res.status(500).json({ error: error.message || 'Fallo durante la prueba' });
  }
});

/**
 * 4. Difundir una vacante a canales activos o específicos
 */
router.post('/broadcast/:jobId', async (req: Request, res: Response) => {
  try {
    const rawJobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
    const jobId = String(rawJobId);
    const { channels } = req.body; // Array opcional de canales: ['WHATSAPP', 'TWITTER']

    const results = await SocialService.broadcastJob(jobId, channels);
    return res.json({ message: 'Difusión procesada', results });
  } catch (error: any) {
    console.error('Error en difusión de vacante:', error);
    return res.status(500).json({ error: error.message || 'Error al difundir vacante' });
  }
});

/**
 * 5. Previsualizar los copys generados para una vacante específica
 */
router.get('/preview/:jobId', async (req: Request, res: Response) => {
  try {
    const rawJobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
    const jobId = String(rawJobId);
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: { select: { name: true, logoUrl: true } },
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'Vacante no encontrada' });
    }

    const settings = await SocialService.getSettings();
    const data = SocialService.extractJobData(job);

    const previews = {
      whatsapp: SocialService.formatMessage(data, 'WHATSAPP', settings.whatsappTemplate),
      twitter: SocialService.formatMessage(data, 'TWITTER', settings.twitterTemplate),
      facebook: SocialService.formatMessage(data, 'FACEBOOK'),
      instagram: SocialService.formatMessage(data, 'INSTAGRAM'),
      data,
    };

    return res.json(previews);
  } catch (error: any) {
    console.error('Error generando previsualización:', error);
    return res.status(500).json({ error: 'Error al generar previsualización' });
  }
});

/**
 * 6. Historial de logs de difusión
 */
router.get('/logs', async (_req: Request, res: Response) => {
  try {
    const logs = await SocialService.getRecentLogs(50);
    return res.json(logs);
  } catch (error: any) {
    console.error('Error obteniendo logs de difusión:', error);
    return res.status(500).json({ error: 'Error al obtener historial de logs' });
  }
});

export default router;

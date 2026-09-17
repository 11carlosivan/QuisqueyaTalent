import { Router, Request, Response } from 'express';
import { Role } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AIService } from './ai.service';
import { InstagramScraperService } from './instagram-scraper.service';
import { AIQueueService } from './ai-queue.service';
import AIPublisherWorker from './ai-publisher.worker';
import prisma from '../../config/prisma';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// Configuración de multer para subida manual de capturas o imágenes de vacantes
const uploadsDir = path.join(process.cwd(), 'uploads', 'ai-jobs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `job-flyer-${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB máximo
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  },
});

// ============================================================
// RUTAS GENERALES DE ASISTENCIA IA (Candidatos y Empresas)
// ============================================================

// 1. Mejorar sección de CV con IA
router.post('/improve-resume', authenticate, async (req: Request, res: Response) => {
  try {
    const { text, type = 'experience' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Debes proporcionar un texto para optimizar' });
    }

    const improved = await AIService.improveResumeSection(text, type);
    return res.json({ result: improved });
  } catch (error) {
    return res.status(500).json({ error: 'Error al procesar optimización con IA' });
  }
});

// 2. Asistente para redactar vacante
router.post('/generate-job', authenticate, async (req: Request, res: Response) => {
  try {
    const { title, province, experienceLevel, industry } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'El título de la vacante es obligatorio' });
    }

    const generated = await AIService.generateJobDescription({ title, province, experienceLevel, industry });
    return res.json(generated);
  } catch (error) {
    return res.status(500).json({ error: 'Error al redactar vacante con IA' });
  }
});

// 3. Generar copys y contenido para redes sociales
router.post('/generate-social', authenticate, async (req: Request, res: Response) => {
  try {
    const { title, company, province, salary, type } = req.body;
    if (!title || !company) {
      return res.status(400).json({ error: 'Título y empresa son necesarios' });
    }

    const socialMedia = await AIService.generateSocialMedia({ title, company, province, salary, type });
    return res.json(socialMedia);
  } catch (error) {
    return res.status(500).json({ error: 'Error al generar copys sociales' });
  }
});

// 4. Generar carta de presentación
router.post('/generate-cover-letter', authenticate, async (req: Request, res: Response) => {
  try {
    const { jobTitle, companyName } = req.body;
    const candidateName = req.user?.email.split('@')[0] || 'Candidato';

    const letter = await AIService.generateCoverLetter(candidateName, jobTitle || 'la vacante', companyName || 'su empresa');
    return res.json({ coverLetter: letter });
  } catch (error) {
    return res.status(500).json({ error: 'Error al generar carta de presentación' });
  }
});

// ============================================================
// RUTAS EXCLUSIVAS DEL SUPER ADMIN: PUBLICADOR AUTOMATIZADO CON IA
// ============================================================

// 5. Obtener configuración del publicador IA y empresa oficial
router.get('/publisher/settings', authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (_req: Request, res: Response) => {
  try {
    const settings = await AIQueueService.getSettings();
    return res.json(settings);
  } catch (error: any) {
    console.error('Error obteniendo settings de publicador IA:', error);
    return res.status(500).json({ error: 'Error al consultar la configuración' });
  }
});

// 6. Actualizar configuración (Pausar/Reanudar, Vacantes por hora, Modo Borrador/Automático, Cookie de Instagram)
router.patch('/publisher/settings', authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (req: Request, res: Response) => {
  try {
    const { isActive, jobsPerHour, publishMode, maxDaysOld, instagramSessionId } = req.body;
    const updated = await AIQueueService.updateSettings({
      isActive,
      jobsPerHour,
      publishMode,
      maxDaysOld,
      instagramSessionId,
    });
    return res.json({ message: 'Configuración actualizada exitosamente', settings: updated });
  } catch (error: any) {
    console.error('Error actualizando settings de publicador IA:', error);
    return res.status(500).json({ error: 'Error al actualizar la configuración' });
  }
});

// 7. Escanear portal web de empleos, enlace individual o perfil de Instagram
router.post('/publisher/scan-profile', authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (req: Request, res: Response) => {
  try {
    const targetUrl = req.body.profileUrl || req.body.url;
    const instagramSessionId = req.body.instagramSessionId || AIQueueService.getRawSessionId() || process.env.INSTAGRAM_SESSION_ID;
    if (!targetUrl) {
      return res.status(400).json({ error: 'Debes proporcionar la URL de la página web de empleos, vacante o @usuario' });
    }

    const settings = await AIQueueService.getSettings();
    const result = await InstagramScraperService.scanAndEnqueue(targetUrl, settings.maxDaysOld || 30, instagramSessionId);

    return res.json({
      message: result.message || `Escaneo completado para ${result.username}`,
      result,
    });
  } catch (error: any) {
    console.error('Error escaneando página web o perfil:', error);
    return res.status(500).json({ error: error.message || 'Error al procesar la página web o perfil' });
  }
});

// 8. Listar fuentes/perfiles de Instagram monitoreados
router.get('/publisher/sources', authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (_req: Request, res: Response) => {
  try {
    const sources = await prisma.instagramSource.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { queueItems: true } },
      },
    });
    return res.json(sources);
  } catch (error) {
    return res.status(500).json({ error: 'Error al listar perfiles de Instagram' });
  }
});

// 8.1 Registrar un perfil para monitoreo diario autónomo
router.post('/publisher/sources', authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (req: Request, res: Response) => {
  try {
    const targetUrl = req.body.url || req.body.profileUrl || req.body.username;
    if (!targetUrl) {
      return res.status(400).json({ error: 'Debes proporcionar la URL o @usuario del perfil' });
    }

    const settings = await AIQueueService.getSettings();
    const sessionId = (req.body.instagramSessionId || AIQueueService.getRawSessionId() || '').trim();

    const result = await InstagramScraperService.scanAndEnqueue(targetUrl, settings.maxDaysOld || 30, sessionId);

    return res.json({
      message: `Perfil @${result.username} registrado exitosamente para monitoreo diario autónomo`,
      result,
    });
  } catch (error: any) {
    console.error('Error registrando perfil para monitoreo:', error);
    return res.status(500).json({ error: error.message || 'Error al registrar perfil para monitoreo' });
  }
});

// 8.2 Alternar estado activo / pausado de un perfil monitoreado
router.patch('/publisher/sources/:id/toggle', authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.instagramSource.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    const updated = await prisma.instagramSource.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    return res.json({
      message: `Monitoreo para @${updated.username} ${updated.isActive ? 'activado' : 'pausado'}`,
      source: updated,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar estado del perfil' });
  }
});

// 8.3 Disparar escaneo de todas las cuentas registradas de inmediato
router.post('/publisher/scan-all-sources', authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (req: Request, res: Response) => {
  try {
    if (AIPublisherWorker.isScanning()) {
      return res.status(409).json({ error: 'Ya hay un escaneo de cuentas en curso. Por favor espera unos segundos.' });
    }

    const customSession = req.body?.instagramSessionId;
    if (customSession && typeof customSession === 'string' && customSession.trim().length > 5) {
      await AIQueueService.updateSettings({ instagramSessionId: customSession.trim() });
    }

    // Ejecutar el escaneo de forma síncrona para entregar resultados inmediatos en pantalla
    const result = await AIPublisherWorker.scanAllSources(true);

    let message = `Escaneo finalizado: ${result.scanned} cuentas analizadas.`;
    if (result.scanned === 0) {
      message = result.message || 'No tienes cuentas registradas aún. Agrega un perfil en el campo superior para comenzar.';
    } else if (result.newJobsEnqueued > 0) {
      message = `¡Éxito! ${result.newJobsEnqueued} nuevas vacantes detectadas y encoladas (${result.skippedDuplicates} ya estaban registradas).`;
    } else if (result.blockedByInstagram && result.blockedByInstagram > 0) {
      message = `Instagram bloqueó la lectura porque no se ha guardado la cookie 'sessionid' en el servidor. Configúrala en la sección de autenticación de Instagram para activar el monitoreo automático.`;
    } else {
      message = `Escaneo completado en ${result.scanned} cuentas. No se detectaron vacantes nuevas (${result.skippedDuplicates} publicaciones ya existían).`;
    }

    return res.json({
      message,
      result,
    });
  } catch (error: any) {
    console.error('Error en escaneo de todas las fuentes:', error);
    return res.status(500).json({ error: error.message || 'Error al escanear fuentes' });
  }
});

// 8.4 Consultar estado operativo del worker en segundo plano
router.get('/publisher/worker-status', authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (_req: Request, res: Response) => {
  try {
    const status = AIPublisherWorker.getStatus();
    return res.json(status);
  } catch (error) {
    return res.status(500).json({ error: 'Error al consultar estado del worker' });
  }
});

// 9. Eliminar un perfil de Instagram monitoreado
router.delete('/publisher/sources/:id', authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.instagramSource.delete({ where: { id } });
    return res.json({ message: 'Perfil eliminado del monitoreo' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al eliminar perfil' });
  }
});

// 10. Listar la cola de vacantes (con paginación, filtros y conteos)
router.get('/publisher/queue', authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const queue = await AIQueueService.getQueue(
      status as string,
      parseInt(page as string),
      parseInt(limit as string)
    );
    return res.json(queue);
  } catch (error) {
    return res.status(500).json({ error: 'Error al consultar la cola de vacantes' });
  }
});

// 11. Ejecutar de inmediato la siguiente vacante en cola (Botón "Publicar 1 Ahora")
router.post('/publisher/run-now', authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (_req: Request, res: Response) => {
  try {
    const result = await AIQueueService.processNextPending();
    if (!result) {
      return res.status(404).json({ error: 'No hay vacantes pendientes en la cola' });
    }
    return res.json({
      message: 'Vacante procesada y generada exitosamente',
      result,
    });
  } catch (error: any) {
    console.error('Error procesando vacante inmediata:', error);
    return res.status(500).json({ error: error.message || 'Error al procesar la vacante' });
  }
});

// 12. Aprobar y publicar un borrador generado por la IA
router.post('/publisher/publish-draft/:id', authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const updated = await AIQueueService.publishDraft(id);
    return res.json({ message: 'Vacante publicada exitosamente en vivo', item: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error al publicar borrador' });
  }
});

// 13. Eliminar elemento de la cola
router.delete('/publisher/queue/:id', authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await AIQueueService.deleteQueueItem(id);
    return res.json({ message: 'Elemento eliminado de la cola' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al eliminar elemento de la cola' });
  }
});

// 14. Encolar manualmente o por lote capturas / textos de vacantes
router.post(
  '/publisher/manual-enqueue',
  authenticate,
  requireRole(Role.ADMIN, Role.SUPER_ADMIN),
  upload.array('flyers', 20),
  async (req: Request, res: Response) => {
    try {
      const { caption, postUrl } = req.body;
      const files = (req.files as Express.Multer.File[]) || [];

      if (!caption && files.length === 0) {
        return res.status(400).json({ error: 'Debes proporcionar al menos texto o subir una o más capturas de vacantes' });
      }

      const createdItems: any[] = [];

      // Si subió archivos de capturas/flyers
      if (files.length > 0) {
        for (const file of files) {
          const imageUrl = `/uploads/ai-jobs/${file.filename}`;
          const uniqueId = `flyer-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

          const item = await prisma.aiJobQueue.create({
            data: {
              instagramPostId: uniqueId,
              postUrl: postUrl || null,
              postDate: new Date(),
              imageUrl,
              captionText: caption || `Captura de vacante de Instagram: ${file.originalname}`,
              status: 'PENDING',
              isJobOffer: true,
            },
          });
          createdItems.push(item);
        }
      } else if (caption) {
        // Si ingresó texto solamente
        const uniqueId = `text-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        const item = await prisma.aiJobQueue.create({
          data: {
            instagramPostId: uniqueId,
            postUrl: postUrl || null,
            postDate: new Date(),
            imageUrl: null,
            captionText: caption.trim(),
            status: 'PENDING',
            isJobOffer: true,
          },
        });
        createdItems.push(item);
      }

      return res.status(201).json({
        message: `${createdItems.length} vacante(s) encolada(s) para procesamiento y redacción con IA`,
        items: createdItems,
      });
    } catch (error: any) {
      console.error('Error encolando capturas:', error);
      return res.status(500).json({ error: 'Error al encolar las vacantes' });
    }
  }
);

export default router;

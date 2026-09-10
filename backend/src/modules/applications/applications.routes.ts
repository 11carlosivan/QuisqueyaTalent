import { Router, Request, Response } from 'express';
import { ApplicationStatus, Role } from '@prisma/client';
import prisma from '../../config/prisma';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// 1. Postularse a una vacante (Candidato)
router.post('/', authenticate, requireRole(Role.JOB_SEEKER), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { jobId, resumeId, coverLetter } = req.body;

    if (!jobId) {
      return res.status(400).json({ error: 'Debes especificar la vacante a la que deseas postularte' });
    }

    // Verificar si ya aplicó
    const existing = await prisma.application.findUnique({
      where: {
        jobId_userId: { jobId, userId },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Ya te has postulado anteriormente a esta vacante' });
    }

    // Buscar o usar el CV por defecto del usuario
    let chosenResumeId = resumeId;
    if (!chosenResumeId) {
      const defaultResume = await prisma.resume.findFirst({
        where: { userId, isDefault: true },
      });
      chosenResumeId = defaultResume?.id;
    }

    // Validar obligatoriamente que el postulante tenga un currículum creado o guardado
    if (!chosenResumeId) {
      return res.status(400).json({
        code: 'NO_RESUME',
        error: 'Debes crear o subir tu currículum en tu perfil antes de postularte a esta vacante.',
      });
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        userId,
        resumeId: chosenResumeId,
        coverLetter,
        status: ApplicationStatus.APPLIED,
        statusHistory: {
          create: {
            status: ApplicationStatus.APPLIED,
            notes: 'Postulación enviada exitosamente por el candidato',
          },
        },
      },
    });

    // Incrementar contador de postulaciones en el empleo
    await prisma.job.update({
      where: { id: jobId },
      data: { applicationsCount: { increment: 1 } },
    });

    return res.status(201).json({
      message: '¡Tu postulación ha sido enviada con éxito!',
      application,
    });
  } catch (error: any) {
    console.error('Error al postularse:', error);
    return res.status(500).json({ error: 'Error procesando la postulación' });
  }
});

// 2. Mis postulaciones (Dashboard del Candidato)
router.get('/my', authenticate, requireRole(Role.JOB_SEEKER), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const applications = await prisma.application.findMany({
      where: { userId },
      orderBy: { appliedAt: 'desc' },
      include: {
        job: {
          include: {
            company: {
              select: { name: true, logoUrl: true, slug: true, province: true },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return res.json(applications);
  } catch (error) {
    return res.status(500).json({ error: 'Error al consultar postulaciones' });
  }
});

// 3. Tablero ATS: Obtener candidatos de una vacante (Empresa)
router.get('/job/:jobId', authenticate, requireRole(Role.COMPANY_OWNER, Role.COMPANY_RECRUITER), async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId as string;
    const companyId = req.user!.companyId;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { companyId: true, title: true },
    });

    if (!job || job.companyId !== companyId) {
      return res.status(403).json({ error: 'No tienes acceso a los candidatos de esta vacante' });
    }

    const applications = await prisma.application.findMany({
      where: { jobId },
      orderBy: { appliedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
        resume: {
          include: {
            experiences: { orderBy: { sortOrder: 'asc' } },
            education: { orderBy: { sortOrder: 'asc' } },
            skills: true,
            languages: true,
            certifications: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return res.json({ jobTitle: job.title, applications });
  } catch (error) {
    return res.status(500).json({ error: 'Error obteniendo candidatos del ATS' });
  }
});

// 4. Cambiar estado en el pipeline ATS (Mover en Kanban)
router.patch('/:id/status', authenticate, requireRole(Role.COMPANY_OWNER, Role.COMPANY_RECRUITER), async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, notes } = req.body;

    if (!status || !Object.values(ApplicationStatus).includes(status)) {
      return res.status(400).json({ error: 'Estado de postulación no válido' });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status,
        statusHistory: {
          create: {
            status,
            notes: notes || `Candidato movido a fase: ${status}`,
            changedBy: req.user!.email,
          },
        },
      },
      include: {
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    return res.json({ message: 'Estado actualizado en el pipeline', application: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Error actualizando etapa del candidato' });
  }
});

// 5. Calificar candidato y agregar notas internas (Empresa)
router.patch('/:id/feedback', authenticate, requireRole(Role.COMPANY_OWNER, Role.COMPANY_RECRUITER), async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { rating, recruiterNotes } = req.body;

    const updated = await prisma.application.update({
      where: { id },
      data: {
        ...(rating !== undefined && { rating: Number(rating) }),
        ...(recruiterNotes !== undefined && { recruiterNotes }),
      },
    });

    return res.json({ message: 'Evaluación y notas guardadas', application: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Error al registrar evaluación' });
  }
});

export default router;

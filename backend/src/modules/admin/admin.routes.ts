import { Router, Request, Response } from 'express';
import { Role, JobStatus } from '@prisma/client';
import prisma from '../../config/prisma';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// Todas las rutas requieren rol ADMIN o SUPER_ADMIN
router.use(authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN));

// 1. Métricas clave del panel administrativo
router.get('/metrics', async (_req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalCandidates,
      totalCompanies,
      publishedJobs,
      pendingJobs,
      totalApplications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: Role.JOB_SEEKER } }),
      prisma.company.count(),
      prisma.job.count({ where: { status: JobStatus.PUBLISHED } }),
      prisma.job.count({ where: { status: JobStatus.PENDING_REVIEW } }),
      prisma.application.count(),
    ]);

    return res.json({
      totalUsers,
      totalCandidates,
      totalCompanies,
      publishedJobs,
      pendingJobs,
      totalApplications,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error obteniendo métricas administrativas' });
  }
});

// 2. Listado de vacantes para moderación
router.get('/jobs', async (_req: Request, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        company: {
          select: { name: true, logoUrl: true, isVerified: true },
        },
      },
    });

    return res.json(jobs);
  } catch (error) {
    return res.status(500).json({ error: 'Error al listar vacantes' });
  }
});

// 3. Moderar vacante (Aprobar, rechazar, destacar)
router.patch('/jobs/:id/moderate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, featured, urgent } = req.body;

    const job = await prisma.job.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(featured !== undefined && { featured: Boolean(featured) }),
        ...(urgent !== undefined && { urgent: Boolean(urgent) }),
      },
    });

    return res.json({ message: 'Vacante moderada exitosamente', job });
  } catch (error) {
    return res.status(500).json({ error: 'Error moderando la vacante' });
  }
});

// 4. Listado de empresas
router.get('/companies', async (_req: Request, res: Response) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { jobs: true } },
      },
    });

    return res.json(companies);
  } catch (error) {
    return res.status(500).json({ error: 'Error listando empresas' });
  }
});

// 5. Verificar empresa
router.patch('/companies/:id/verify', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const company = await prisma.company.update({
      where: { id },
      data: { isVerified: Boolean(isVerified) },
    });

    return res.json({ message: `Empresa ${company.isVerified ? 'verificada' : 'desverificada'} con éxito`, company });
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar verificación de empresa' });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { Role, JobStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';
import { authenticate, requireRole } from '../../middleware/auth';
import storageService from '../storage/storage.service';

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
    const id = req.params.id as string;
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
    const id = req.params.id as string;
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

// 6. Consultar estado del Guardián de Almacenamiento (Cloudflare R2 Cost Protection)
router.get('/storage', async (_req: Request, res: Response) => {
  try {
    const guard = await storageService.getGuard();
    return res.json(guard);
  } catch (error) {
    return res.status(500).json({ error: 'Error al consultar guardián de almacenamiento' });
  }
});

// 7. Modificar configuración del Guardián (Activar/Desactivar protección de costo, límites)
router.patch('/storage', async (req: Request, res: Response) => {
  try {
    const { isGuardActive, maxStorageBytes, maxFileSizeBytes } = req.body;
    const updated = await storageService.updateGuard({
      isGuardActive,
      maxStorageBytes,
      maxFileSizeBytes,
    });
    return res.json({ message: 'Configuración de almacenamiento actualizada', guard: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar configuración de almacenamiento' });
  }
});

// 8. Limpiar todos los datos demo del sistema (Solo SUPER_ADMIN)
router.post('/clean-demo-data', requireRole(Role.SUPER_ADMIN), async (_req: Request, res: Response) => {
  try {
    const ADMIN_EMAIL = 'carlosivancastillofeliz@gmail.com';
    const ADMIN_PASS = '11712Ivandi';

    const adminPasswordHash = await bcrypt.hash(ADMIN_PASS, 10);
    const admin = await prisma.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: {
        passwordHash: adminPasswordHash,
        role: Role.SUPER_ADMIN,
        isActive: true,
        isEmailVerified: true,
      },
      create: {
        email: ADMIN_EMAIL,
        passwordHash: adminPasswordHash,
        role: Role.SUPER_ADMIN,
        isActive: true,
        isEmailVerified: true,
        profile: {
          create: {
            firstName: 'Carlos',
            lastName: 'Castillo',
            headline: 'Fundador & Super Administrador Quisqueya Talent',
            province: 'Distrito Nacional',
            city: 'Santo Domingo',
          },
        },
      },
      include: { profile: true },
    });

    // Limpieza en cascada respetando foreign keys
    await prisma.auditLog.deleteMany({});
    await prisma.applicationStatusHistory.deleteMany({});
    await prisma.application.deleteMany({});
    await prisma.savedJob.deleteMany({});
    await prisma.jobAlert.deleteMany({});
    await prisma.jobSkill.deleteMany({});
    await prisma.job.deleteMany({});
    await prisma.companyMember.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.resumeCertification.deleteMany({});
    await prisma.resumeSkill.deleteMany({});
    await prisma.resumeLanguage.deleteMany({});
    await prisma.resumeEducation.deleteMany({});
    await prisma.resumeExperience.deleteMany({});
    await prisma.resume.deleteMany({});

    // Eliminar perfiles y usuarios excepto el Super Admin
    await prisma.userProfile.deleteMany({
      where: { userId: { not: admin.id } },
    });
    await prisma.user.deleteMany({
      where: { id: { not: admin.id } },
    });

    return res.json({
      message: 'Sistema limpio con éxito. Se eliminaron todas las empresas, vacantes y usuarios demo.',
      preservedAdmin: {
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error: any) {
    console.error('Error en limpieza del sistema:', error);
    return res.status(500).json({ error: 'Error al limpiar datos del sistema: ' + error.message });
  }
});

export default router;

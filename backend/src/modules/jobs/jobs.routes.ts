import { Router, Request, Response } from 'express';
import { JobStatus, JobType, WorkplaceType, ExperienceLevel, Role } from '@prisma/client';
import prisma from '../../config/prisma';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// 1. Búsqueda y listado público de empleos
router.get('/', async (req: Request, res: Response) => {
  try {
    const { q, category, province, jobType, workplaceType, page = '1', limit = '12' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {
      status: JobStatus.PUBLISHED,
    };

    if (q) {
      where.OR = [
        { title: { contains: String(q) } },
        { description: { contains: String(q) } },
        { company: { name: { contains: String(q) } } },
      ];
    }

    if (category && category !== 'all' && category !== 'Todas') {
      where.category = String(category);
    }

    if (province && province !== 'all' && province !== 'Todas') {
      where.province = String(province);
    }

    if (jobType && jobType !== 'all') {
      where.jobType = jobType as JobType;
    }

    if (workplaceType && workplaceType !== 'all') {
      where.workplaceType = workplaceType as WorkplaceType;
    }

    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        skip,
        take,
        orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
        include: {
          company: {
            select: { id: true, name: true, slug: true, logoUrl: true, isVerified: true },
          },
          skills: {
            select: { skillName: true },
          },
        },
      }),
    ]);

    return res.json({
      data: jobs,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error: any) {
    console.error('Error buscando empleos:', error);
    return res.status(500).json({ error: 'Error al consultar vacantes' });
  }
});

// 2. Estadísticas de categorías para la Homepage
router.get('/categories/stats', async (_req: Request, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: JobStatus.PUBLISHED },
      select: { category: true },
    });

    const counts: Record<string, number> = {};
    jobs.forEach((j) => {
      counts[j.category] = (counts[j.category] || 0) + 1;
    });

    const categoryList = Object.entries(counts).map(([name, count]) => ({
      name,
      count,
    }));

    return res.json(categoryList);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// 3. Obtener vacantes de la empresa autenticada
router.get('/company/mine', authenticate, requireRole(Role.COMPANY_OWNER, Role.COMPANY_RECRUITER), async (req: Request, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'Usuario no asociado a ninguna empresa' });
    }

    const jobs = await prisma.job.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        skills: true,
        _count: {
          select: { applications: true },
        },
      },
    });

    return res.json(jobs);
  } catch (error) {
    return res.status(500).json({ error: 'Error obteniendo vacantes de la empresa' });
  }
});

// 4. Detalle de empleo por Slug (Público con SEO)
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const job = await prisma.job.findUnique({
      where: { slug },
      include: {
        company: true,
        skills: true,
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'La vacante solicitada no existe o ya no está disponible' });
    }

    // Incrementar contador de visitas de forma asíncrona
    prisma.job.update({
      where: { id: job.id },
      data: { viewsCount: { increment: 1 } },
    }).catch(console.error);

    // Buscar empleos relacionados en la misma categoría o provincia
    const relatedJobs = await prisma.job.findMany({
      where: {
        id: { not: job.id },
        status: JobStatus.PUBLISHED,
        OR: [{ category: job.category }, { province: job.province }],
      },
      take: 4,
      include: {
        company: {
          select: { name: true, logoUrl: true },
        },
      },
    });

    return res.json({ job, relatedJobs });
  } catch (error) {
    return res.status(500).json({ error: 'Error obteniendo detalle de la vacante' });
  }
});

// 5. Publicar nueva vacante (Empresa)
router.post('/', authenticate, requireRole(Role.COMPANY_OWNER, Role.COMPANY_RECRUITER), async (req: Request, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'No tienes una empresa asociada para publicar empleos' });
    }

    const {
      title,
      category,
      description,
      responsibilities,
      requirements,
      benefits,
      jobType,
      workplaceType,
      experienceLevel,
      salaryMin,
      salaryMax,
      salaryCurrency,
      salaryPeriod,
      isSalaryPublic,
      applyMethod = 'PLATFORM',
      applyEmail,
      province,
      city,
      skills = [],
      featured = false,
      urgent = false,
    } = req.body;

    if (!title || !category || !description || !province) {
      return res.status(400).json({ error: 'Por favor completa título, categoría, provincia y descripción' });
    }

    const rawSlug = `${title}-${province}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const slug = `${rawSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

    const job = await prisma.job.create({
      data: {
        companyId,
        title,
        slug,
        category,
        description,
        responsibilities,
        requirements,
        benefits,
        jobType: jobType || JobType.FULL_TIME,
        workplaceType: workplaceType || WorkplaceType.ON_SITE,
        experienceLevel: experienceLevel || ExperienceLevel.MID,
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        salaryCurrency: salaryCurrency || 'DOP',
        isSalaryPublic: isSalaryPublic !== undefined ? isSalaryPublic : true,
        applyMethod: applyMethod || 'PLATFORM',
        applyEmail: applyMethod === 'EMAIL' ? applyEmail : null,
        province,
        city,
        featured,
        urgent,
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
        skills: {
          create: skills.map((s: string) => ({ skillName: s })),
        },
      },
      include: {
        company: true,
        skills: true,
      },
    });

    return res.status(201).json({ message: 'Vacante publicada exitosamente', job });
  } catch (error: any) {
    console.error('Error publicando vacante:', error);
    return res.status(500).json({ error: 'Error al publicar la vacante' });
  }
});

// 6. Actualizar vacante
router.put('/:id', authenticate, requireRole(Role.COMPANY_OWNER, Role.COMPANY_RECRUITER, Role.ADMIN, Role.SUPER_ADMIN), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user!.companyId;

    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Vacante no encontrada' });
    }

    if (req.user!.role !== Role.ADMIN && req.user!.role !== Role.SUPER_ADMIN && existing.companyId !== companyId) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta vacante' });
    }

    const updated = await prisma.job.update({
      where: { id },
      data: req.body,
    });

    return res.json({ message: 'Vacante actualizada con éxito', job: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar vacante' });
  }
});

// 7. Cambiar estado de vacante (Pausar, Cerrar, Reactivar)
router.patch('/:id/status', authenticate, requireRole(Role.COMPANY_OWNER, Role.COMPANY_RECRUITER), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const job = await prisma.job.update({
      where: { id },
      data: { status },
    });

    return res.json({ message: `Estado de vacante actualizado a ${status}`, job });
  } catch (error) {
    return res.status(500).json({ error: 'Error al modificar estado de la vacante' });
  }
});

export default router;

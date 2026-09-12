import { Router, Request, Response } from 'express';
import { JobStatus, Role } from '@prisma/client';
import prisma from '../../config/prisma';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// 1. Directorio público de empresas (Sanitizado sin RNC)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        industry: true,
        description: true,
        logoUrl: true,
        coverUrl: true,
        websiteUrl: true,
        province: true,
        city: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            jobs: {
              where: { status: JobStatus.PUBLISHED },
            },
          },
        },
      },
    });

    return res.json(companies);
  } catch (error) {
    return res.status(500).json({ error: 'Error al listar empresas' });
  }
});

// 2. Vista privada para el dueño/reclutador: Obtener datos completos y métricas de mi empresa
router.get('/my', authenticate, async (req: Request, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    if (!companyId) {
      return res.status(404).json({ error: 'No tienes una empresa asociada a tu cuenta' });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: {
          select: {
            jobs: true,
          },
        },
        jobs: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            jobType: true,
            workplaceType: true,
            province: true,
            viewsCount: true,
            applicationsCount: true,
            publishedAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!company) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    return res.json(company);
  } catch (error) {
    console.error('Error al obtener mi empresa:', error);
    return res.status(500).json({ error: 'Error al cargar datos de la empresa' });
  }
});

// 3. Vista privada para el dueño: Actualizar perfil corporativo
router.put(
  '/my',
  authenticate,
  requireRole(Role.COMPANY_OWNER, Role.COMPANY_RECRUITER),
  async (req: Request, res: Response) => {
    try {
      const companyId = req.user!.companyId;
      if (!companyId) {
        return res.status(400).json({ error: 'No tienes una empresa asociada' });
      }

      const {
        name,
        industry,
        description,
        logoUrl,
        coverUrl,
        websiteUrl,
        phone,
        email,
        province,
        city,
        address,
      } = req.body;

      const updated = await prisma.company.update({
        where: { id: companyId },
        data: {
          name: name ? String(name).trim() : undefined,
          industry: industry ? String(industry).trim() : undefined,
          description: description !== undefined ? String(description).trim() : undefined,
          logoUrl: logoUrl !== undefined ? logoUrl : undefined,
          coverUrl: coverUrl !== undefined ? coverUrl : undefined,
          websiteUrl: websiteUrl !== undefined ? String(websiteUrl).trim() : undefined,
          phone: phone !== undefined ? String(phone).trim() : undefined,
          email: email !== undefined ? String(email).trim() : undefined,
          province: province !== undefined ? String(province).trim() : undefined,
          city: city !== undefined ? String(city).trim() : undefined,
          address: address !== undefined ? String(address).trim() : undefined,
        },
      });

      return res.json({ message: 'Perfil de la empresa actualizado exitosamente', company: updated });
    } catch (error) {
      console.error('Error al actualizar mi empresa:', error);
      return res.status(500).json({ error: 'Error al actualizar datos de la empresa' });
    }
  }
);

// 4. Perfil público de empresa por Slug (Sin exponer RNC por privacidad)
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;

    const company = await prisma.company.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        industry: true,
        description: true,
        logoUrl: true,
        coverUrl: true,
        websiteUrl: true,
        phone: true,
        email: true,
        province: true,
        city: true,
        address: true,
        isVerified: true,
        createdAt: true,
        jobs: {
          where: { status: JobStatus.PUBLISHED },
          orderBy: { publishedAt: 'desc' },
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            jobType: true,
            workplaceType: true,
            experienceLevel: true,
            salaryMin: true,
            salaryMax: true,
            salaryCurrency: true,
            salaryPeriod: true,
            isSalaryPublic: true,
            province: true,
            city: true,
            publishedAt: true,
            featured: true,
            urgent: true,
            skills: {
              select: {
                id: true,
                skillName: true,
              },
            },
          },
        },
      },
    });

    if (!company) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    return res.json(company);
  } catch (error) {
    console.error('Error al consultar empresa:', error);
    return res.status(500).json({ error: 'Error al consultar empresa' });
  }
});

export default router;

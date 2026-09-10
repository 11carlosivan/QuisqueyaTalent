import { Router, Request, Response } from 'express';
import { JobStatus, Role } from '@prisma/client';
import prisma from '../../config/prisma';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// 1. Directorio público de empresas
router.get('/', async (_req: Request, res: Response) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' },
      include: {
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

// 2. Perfil público de empresa por Slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;

    const company = await prisma.company.findUnique({
      where: { slug },
      include: {
        jobs: {
          where: { status: JobStatus.PUBLISHED },
          orderBy: { publishedAt: 'desc' },
          include: {
            skills: true,
          },
        },
      },
    });

    if (!company) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    return res.json(company);
  } catch (error) {
    return res.status(500).json({ error: 'Error al consultar empresa' });
  }
});

// 3. Actualizar datos de mi empresa (Reclutador / Empresa)
router.put('/my', authenticate, requireRole(Role.COMPANY_OWNER), async (req: Request, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    if (!companyId) {
      return res.status(400).json({ error: 'No tienes una empresa asociada' });
    }

    const { name, industry, description, logoUrl, coverUrl, websiteUrl, phone, email, province, city, address, rnc } = req.body;

    const updated = await prisma.company.update({
      where: { id: companyId },
      data: {
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
        rnc,
      },
    });

    return res.json({ message: 'Perfil de la empresa actualizado', company: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar datos de la empresa' });
  }
});

export default router;

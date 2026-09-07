import { Router, Request, Response } from 'express';
import { Role } from '@prisma/client';
import prisma from '../../config/prisma';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// 1. Obtener CV del usuario autenticado (Candidato, Admin o Empresa en prueba)
router.get('/my', authenticate, requireRole(Role.JOB_SEEKER, Role.ADMIN, Role.EMPLOYER), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    let resume = await prisma.resume.findFirst({
      where: { userId, isDefault: true },
      include: {
        experiences: { orderBy: { sortOrder: 'asc' } },
        education: { orderBy: { sortOrder: 'asc' } },
        skills: true,
        languages: true,
        certifications: true,
      },
    });

    if (!resume) {
      resume = await prisma.resume.create({
        data: {
          userId,
          title: 'Mi Currículum Profesional',
          isDefault: true,
          atsScore: 75,
        },
        include: {
          experiences: true,
          education: true,
          skills: true,
          languages: true,
          certifications: true,
        },
      });
    }

    // Obtener también el perfil básico del usuario
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    return res.json({ resume, profile: userProfile });
  } catch (error) {
    console.error('Error al obtener CV:', error);
    return res.status(500).json({ error: 'Error cargando información del currículum' });
  }
});

// 2. Guardar y actualizar CV completo
router.put('/my', authenticate, requireRole(Role.JOB_SEEKER, Role.ADMIN, Role.EMPLOYER), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      title,
      summary,
      templateName,
      profileData,
      experiences = [],
      education = [],
      skills = [],
      languages = [],
      certifications = [],
    } = req.body;

    // Actualizar perfil de usuario si viene provisto
    if (profileData) {
      await prisma.userProfile.upsert({
        where: { userId },
        update: profileData,
        create: { ...profileData, userId },
      });
    }

    // Buscar o crear CV
    let resume = await prisma.resume.findFirst({
      where: { userId, isDefault: true },
    });

    if (!resume) {
      resume = await prisma.resume.create({
        data: { userId, title: title || 'Mi Currículum', isDefault: true },
      });
    }

    const resumeId = resume.id;

    // Calcular puntuación ATS basada en completitud y palabras clave
    let atsScore = 40;
    if (summary && summary.length > 80) atsScore += 15;
    if (experiences.length > 0) atsScore += 20;
    if (education.length > 0) atsScore += 10;
    if (skills.length >= 4) atsScore += 10;
    if (languages.length > 0) atsScore += 5;
    atsScore = Math.min(100, atsScore);

    // Actualizar datos del CV y reemplazar relaciones
    await prisma.$transaction([
      prisma.resume.update({
        where: { id: resumeId },
        data: {
          title: title || resume.title,
          summary,
          templateName: templateName || 'modern',
          atsScore,
        },
      }),

      prisma.resumeExperience.deleteMany({ where: { resumeId } }),
      prisma.resumeEducation.deleteMany({ where: { resumeId } }),
      prisma.resumeSkill.deleteMany({ where: { resumeId } }),
      prisma.resumeLanguage.deleteMany({ where: { resumeId } }),
      prisma.resumeCertification.deleteMany({ where: { resumeId } }),

      ...(experiences.length > 0
        ? [
            prisma.resumeExperience.createMany({
              data: experiences.map((exp: any, idx: number) => ({
                resumeId,
                company: exp.company,
                position: exp.position,
                startDate: exp.startDate,
                endDate: exp.endDate || null,
                isCurrent: !!exp.isCurrent,
                description: exp.description,
                city: exp.city,
                sortOrder: idx + 1,
              })),
            }),
          ]
        : []),

      ...(education.length > 0
        ? [
            prisma.resumeEducation.createMany({
              data: education.map((edu: any, idx: number) => ({
                resumeId,
                institution: edu.institution,
                degree: edu.degree,
                fieldOfStudy: edu.fieldOfStudy,
                startDate: edu.startDate,
                endDate: edu.endDate || null,
                isCurrent: !!edu.isCurrent,
                sortOrder: idx + 1,
              })),
            }),
          ]
        : []),

      ...(skills.length > 0
        ? [
            prisma.resumeSkill.createMany({
              data: skills.map((s: any) => ({
                resumeId,
                name: typeof s === 'string' ? s : s.name,
                level: s.level || 'Avanzado',
              })),
            }),
          ]
        : []),

      ...(languages.length > 0
        ? [
            prisma.resumeLanguage.createMany({
              data: languages.map((lang: any) => ({
                resumeId,
                name: lang.name,
                proficiency: lang.proficiency || 'Intermedio',
              })),
            }),
          ]
        : []),

      ...(certifications.length > 0
        ? [
            prisma.resumeCertification.createMany({
              data: certifications.map((c: any) => ({
                resumeId,
                name: c.name,
                issuingOrganization: c.issuingOrganization,
                issueDate: c.issueDate,
              })),
            }),
          ]
        : []),
    ]);

    const updatedResume = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: {
        experiences: { orderBy: { sortOrder: 'asc' } },
        education: { orderBy: { sortOrder: 'asc' } },
        skills: true,
        languages: true,
        certifications: true,
      },
    });

    return res.json({
      message: 'Currículum guardado exitosamente',
      resume: updatedResume,
      atsScore,
    });
  } catch (error: any) {
    console.error('Error guardando CV:', error);
    return res.status(500).json({ error: 'Error al actualizar el currículum' });
  }
});

export default router;

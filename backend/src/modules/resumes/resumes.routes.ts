import { Router, Request, Response } from 'express';
import { Role } from '@prisma/client';
import prisma from '../../config/prisma';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// 1. Obtener CV del usuario autenticado (Candidato, Admin o Empresa en prueba)
router.get('/my', authenticate, requireRole(Role.JOB_SEEKER, Role.ADMIN, Role.COMPANY_OWNER, Role.COMPANY_RECRUITER), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const requestedResumeId = req.query.resumeId as string | undefined;

    // Obtener todas las versiones de currículum del usuario
    let allResumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
      include: {
        experiences: { orderBy: { sortOrder: 'asc' } },
        education: { orderBy: { sortOrder: 'asc' } },
        skills: true,
        languages: true,
        certifications: true,
      },
    });

    // Si el usuario no tiene ningún CV, crear el principal inicial
    if (allResumes.length === 0) {
      const newResume = await prisma.resume.create({
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
      allResumes = [newResume];
    }

    // Seleccionar el CV solicitado o el que esté marcado como default
    let activeResume = requestedResumeId
      ? allResumes.find((r) => r.id === requestedResumeId) || allResumes[0]
      : allResumes.find((r) => r.isDefault) || allResumes[0];

    // Obtener también el perfil básico del usuario
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    return res.json({
      resume: activeResume,
      allResumes,
      profile: userProfile,
    });
  } catch (error) {
    console.error('Error al obtener CVs:', error);
    return res.status(500).json({ error: 'Error cargando información del currículum' });
  }
});

// 1.1 Establecer un CV como Principal (Visible para empresas y postulaciones)
router.patch('/:id/set-primary', authenticate, requireRole(Role.JOB_SEEKER, Role.ADMIN, Role.COMPANY_OWNER, Role.COMPANY_RECRUITER), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    // Verificar que el CV pertenece al usuario autenticado
    const targetResume = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!targetResume) {
      return res.status(404).json({ error: 'El currículum seleccionado no existe o no te pertenece' });
    }

    // Transacción atómica: desmarcar todos y marcar el seleccionado como default
    await prisma.$transaction([
      prisma.resume.updateMany({
        where: { userId },
        data: { isDefault: false },
      }),
      prisma.resume.update({
        where: { id },
        data: { isDefault: true },
      }),
    ]);

    const updatedResumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    });

    return res.json({
      message: 'Currículum principal actualizado exitosamente',
      primaryResumeId: id,
      allResumes: updatedResumes,
    });
  } catch (error) {
    console.error('Error al cambiar CV principal:', error);
    return res.status(500).json({ error: 'Error al cambiar currículum principal' });
  }
});

// 1.2 Crear una nueva versión de CV
router.post('/new', authenticate, requireRole(Role.JOB_SEEKER, Role.ADMIN, Role.COMPANY_OWNER, Role.COMPANY_RECRUITER), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title = 'Nueva Versión de CV' } = req.body;

    // Obtener CV default para clonar datos base si existe
    const defaultResume = await prisma.resume.findFirst({
      where: { userId, isDefault: true },
      include: {
        experiences: true,
        education: true,
        skills: true,
        languages: true,
      },
    });

    const newResume = await prisma.resume.create({
      data: {
        userId,
        title,
        summary: defaultResume?.summary || 'Resumen profesional...',
        templateName: defaultResume?.templateName || 'moderna',
        isDefault: false,
        atsScore: defaultResume?.atsScore || 70,
        experiences: defaultResume?.experiences
          ? {
              create: defaultResume.experiences.map((e) => ({
                company: e.company,
                position: e.position,
                startDate: e.startDate,
                endDate: e.endDate,
                isCurrent: e.isCurrent,
                description: e.description,
                city: e.city,
                sortOrder: e.sortOrder,
              })),
            }
          : undefined,
        education: defaultResume?.education
          ? {
              create: defaultResume.education.map((edu) => ({
                institution: edu.institution,
                degree: edu.degree,
                fieldOfStudy: edu.fieldOfStudy,
                startDate: edu.startDate,
                endDate: edu.endDate,
                isCurrent: edu.isCurrent,
                sortOrder: edu.sortOrder,
              })),
            }
          : undefined,
        skills: defaultResume?.skills
          ? {
              create: defaultResume.skills.map((s) => ({
                name: s.name,
                level: s.level,
              })),
            }
          : undefined,
        languages: defaultResume?.languages
          ? {
              create: defaultResume.languages.map((l) => ({
                name: l.name,
                proficiency: l.proficiency,
              })),
            }
          : undefined,
      },
      include: {
        experiences: true,
        education: true,
        skills: true,
        languages: true,
      },
    });

    return res.status(201).json({
      message: 'Nueva versión de currículum creada exitosamente',
      resume: newResume,
    });
  } catch (error) {
    console.error('Error al crear nueva versión de CV:', error);
    return res.status(500).json({ error: 'Error al crear nueva versión de currículum' });
  }
});

// 1.3 Eliminar versión de CV (no se puede eliminar si es el principal o el único)
router.delete('/:id', authenticate, requireRole(Role.JOB_SEEKER, Role.ADMIN, Role.COMPANY_OWNER, Role.COMPANY_RECRUITER), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) {
      return res.status(404).json({ error: 'El currículum no existe' });
    }

    if (resume.isDefault) {
      return res.status(400).json({
        error: 'No puedes eliminar tu currículum principal. Establece otro como principal antes de eliminar este.',
      });
    }

    await prisma.resume.delete({
      where: { id },
    });

    return res.json({ message: 'Versión de currículum eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar versión de CV:', error);
    return res.status(500).json({ error: 'Error al eliminar el currículum' });
  }
});

// 2. Guardar y actualizar CV completo
router.put('/my', authenticate, requireRole(Role.JOB_SEEKER, Role.ADMIN, Role.COMPANY_OWNER, Role.COMPANY_RECRUITER), async (req: Request, res: Response) => {
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

    // Buscar o crear CV (específico si viene resumeId, o el principal)
    const targetResumeId = req.body.resumeId;
    let resume = targetResumeId
      ? await prisma.resume.findFirst({ where: { id: targetResumeId, userId } })
      : await prisma.resume.findFirst({ where: { userId, isDefault: true } });

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
                credentialUrl: c.credentialUrl || null,
                fileUrl: c.fileUrl || null,
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

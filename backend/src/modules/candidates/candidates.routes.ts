import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import prisma from '../../config/prisma';
import { authenticate, requireRole } from '../../middleware/auth';
import storageService from '../storage/storage.service';

const router = Router();

// Configuración de Multer en memoria para subida a Cloudflare R2 con validación anti-costos
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB máximo inicial en memoria
  fileFilter: (_req, file, cb) => {
    const allowed = /pdf|jpg|jpeg|png|webp/i;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten documentos en formato PDF o imágenes (JPG, PNG, WEBP)'));
    }
  },
});

// 1. Obtener perfil completo del candidato autenticado (Vista Privada)
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        resumes: {
          orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
          include: {
            experiences: { orderBy: { sortOrder: 'asc' } },
            education: { orderBy: { sortOrder: 'asc' } },
            skills: true,
            languages: true,
            certifications: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Si no tiene perfil creado aún, inicializarlo
    if (!user.profile) {
      const newProfile = await prisma.userProfile.create({
        data: {
          userId,
          firstName: 'Candidato',
          lastName: 'Quisqueya',
          headline: 'Profesional en búsqueda de oportunidades',
          isPublic: true,
        },
      });
      user = { ...user, profile: newProfile };
    }

    // Currículum principal
    const primaryResume = user.resumes.find((r) => r.isDefault) || user.resumes[0] || null;

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      profile: user.profile,
      primaryResume,
      allResumes: user.resumes,
    });
  } catch (error) {
    console.error('Error al obtener perfil propio de candidato:', error);
    return res.status(500).json({ error: 'Error al cargar perfil' });
  }
});

// 2. Sincronizar datos entre Currículum y Perfil del Candidato
router.post('/sync-from-resume', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const defaultResume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
      include: {
        experiences: { orderBy: { sortOrder: 'asc' } },
        education: { orderBy: { sortOrder: 'asc' } },
        skills: true,
      },
    });

    if (!defaultResume) {
      return res.status(404).json({ error: 'No se encontró ningún currículum para sincronizar' });
    }

    const updateData: any = {};
    if (defaultResume.summary) {
      updateData.bio = defaultResume.summary;
    }
    if (defaultResume.title) {
      updateData.headline = defaultResume.title;
    }

    const updatedProfile = await prisma.userProfile.update({
      where: { userId },
      data: updateData,
    });

    return res.json({
      message: 'Perfil sincronizado correctamente con tu currículum',
      profile: updatedProfile,
      resume: defaultResume,
    });
  } catch (error) {
    console.error('Error al sincronizar perfil con CV:', error);
    return res.status(500).json({ error: 'Error al sincronizar con el currículum' });
  }
});

// 3. Obtener perfil público de un candidato por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // Detectar si el visitante es el dueño autenticado
    let isOwner = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.decode(token);
        if (decoded && decoded.id === id) {
          isOwner = true;
        }
      } catch {}
    }

    const user: any = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        resumes: {
          where: { isDefault: true },
          include: {
            experiences: { orderBy: { sortOrder: 'asc' } },
            education: { orderBy: { sortOrder: 'asc' } },
            skills: true,
            languages: true,
            certifications: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Candidato no encontrado' });
    }

    // Si el perfil es privado y el visitante no es el dueño
    if (user.profile && user.profile.isPublic === false && !isOwner) {
      return res.json({
        id: user.id,
        isPrivate: true,
        isOwner: false,
        profile: {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName ? `${user.profile.lastName.charAt(0)}.` : '',
          headline: user.profile.headline,
          avatarUrl: user.profile.avatarUrl,
          coverUrl: user.profile.coverUrl,
          province: user.profile.province,
          isPublic: false,
        },
        resume: null,
      });
    }

    // Si no tiene CV por defecto, buscar el más reciente
    let primaryResume = user.resumes[0];
    if (!primaryResume) {
      primaryResume = (await prisma.resume.findFirst({
        where: { userId: id },
        orderBy: { updatedAt: 'desc' },
        include: {
          experiences: { orderBy: { sortOrder: 'asc' } },
          education: { orderBy: { sortOrder: 'asc' } },
          skills: true,
          languages: true,
          certifications: true,
        },
      })) as any;
    }

    return res.json({
      id: user.id,
      isPrivate: false,
      isOwner,
      role: user.role,
      profile: user.profile,
      resume: primaryResume || {
        id: null,
        title: 'Currículum',
        summary: user.profile?.bio || '',
        experiences: [],
        education: [],
        skills: [],
        languages: [],
        certifications: [],
      },
    });
  } catch (error) {
    console.error('Error al obtener perfil de candidato:', error);
    return res.status(500).json({ error: 'Error al consultar perfil del candidato' });
  }
});

// 4. Actualizar perfil de usuario (titular, bio, redes, ubicación, etc.)
router.put('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      firstName,
      lastName,
      headline,
      bio,
      province,
      city,
      phone,
      linkedinUrl,
      portfolioUrl,
      githubUrl,
      avatarUrl,
      coverUrl,
      isPublic,
    } = req.body;

    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(headline !== undefined && { headline }),
        ...(bio !== undefined && { bio }),
        ...(province !== undefined && { province }),
        ...(city !== undefined && { city }),
        ...(phone !== undefined && { phone }),
        ...(linkedinUrl !== undefined && { linkedinUrl }),
        ...(portfolioUrl !== undefined && { portfolioUrl }),
        ...(githubUrl !== undefined && { githubUrl }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(coverUrl !== undefined && { coverUrl }),
        ...(isPublic !== undefined && { isPublic }),
      },
      create: {
        userId,
        firstName: firstName || 'Usuario',
        lastName: lastName || 'Talent',
        headline,
        bio,
        province,
        city,
        phone,
        linkedinUrl,
        portfolioUrl,
        githubUrl,
        avatarUrl,
        coverUrl,
        isPublic: isPublic !== undefined ? isPublic : true,
      },
    });

    return res.json({
      message: 'Perfil profesional actualizado exitosamente',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Error al actualizar perfil de candidato:', error);
    return res.status(500).json({ error: 'Error al guardar cambios de perfil' });
  }
});

// 4. Subida de archivo de certificado (PDF, PNG, JPG, WEBP)
router.post(
  '/upload-certificate',
  authenticate,
  memoryUpload.single('certificate'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
      }

      const { url, size } = await storageService.uploadFile({
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        folder: 'certificates',
      });

      return res.json({
        message: 'Certificado subido exitosamente',
        fileUrl: url,
        fileName: req.file.originalname,
        fileSize: size,
      });
    } catch (error: any) {
      console.error('Error al subir certificado:', error);
      return res.status(400).json({ error: error.message || 'Error al procesar el archivo' });
    }
  }
);

// 5. Subida de imagen de avatar o portada
router.post(
  '/upload-image',
  authenticate,
  (req: Request, res: Response, next: any) => {
    memoryUpload.single('image')(req, res, (err: any) => {
      if (err) {
        console.error('Error al procesar archivo con multer:', err);
        return res.status(400).json({
          error: err.message || 'El archivo seleccionado no es válido o supera el límite permitido',
        });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se ha seleccionado ninguna imagen' });
      }

      const { url } = await storageService.uploadFile({
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        folder: 'avatars',
      });

      return res.json({
        message: 'Imagen subida exitosamente',
        imageUrl: url,
      });
    } catch (error: any) {
      console.error('Error al subir imagen:', error);
      return res.status(400).json({ error: error.message || 'Error al procesar la imagen' });
    }
  }
);

// 6. Agregar un certificado a la versión principal del CV del candidato
router.post('/certificates', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, issuingOrganization, issueDate, credentialUrl, fileUrl, resumeId } = req.body;

    if (!name || !issuingOrganization) {
      return res.status(400).json({ error: 'El nombre del curso y la institución emisora son obligatorios' });
    }

    // Buscar o crear CV principal
    let targetResume = resumeId
      ? await prisma.resume.findFirst({ where: { id: resumeId, userId } })
      : await prisma.resume.findFirst({ where: { userId, isDefault: true } });

    if (!targetResume) {
      targetResume = await prisma.resume.create({
        data: {
          userId,
          title: 'Mi Currículum Profesional',
          isDefault: true,
        },
      });
    }

    const newCertification = await prisma.resumeCertification.create({
      data: {
        resumeId: targetResume.id,
        name,
        issuingOrganization,
        issueDate: issueDate || null,
        credentialUrl: credentialUrl || null,
        fileUrl: fileUrl || null,
      },
    });

    return res.status(201).json({
      message: 'Certificación agregada exitosamente a tu perfil',
      certification: newCertification,
    });
  } catch (error) {
    console.error('Error al agregar certificación:', error);
    return res.status(500).json({ error: 'Error al registrar certificación' });
  }
});

// 7. Eliminar un certificado
router.delete('/certificates/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const cert = await prisma.resumeCertification.findFirst({
      where: {
        id,
        resume: { userId },
      },
    });

    if (!cert) {
      return res.status(404).json({ error: 'Certificación no encontrada o no te pertenece' });
    }

    // Eliminar archivo del disco si existe
    if (cert.fileUrl && cert.fileUrl.startsWith('/uploads/')) {
      const diskPath = path.join(process.cwd(), cert.fileUrl.replace('/', path.sep));
      if (fs.existsSync(diskPath)) {
        try {
          fs.unlinkSync(diskPath);
        } catch (e) {
          console.warn('No se pudo borrar el archivo físico del certificado:', e);
        }
      }
    }

    await prisma.resumeCertification.delete({ where: { id } });

    return res.json({ message: 'Certificación eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar certificación:', error);
    return res.status(500).json({ error: 'Error al eliminar certificación' });
  }
});

// 8. Agregar experiencia directamente al perfil
router.post('/experiences', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { company, position, startDate, endDate, isCurrent, description, city } = req.body;

    if (!company || !position || !startDate) {
      return res.status(400).json({ error: 'Empresa, cargo y fecha de inicio son requeridos' });
    }

    let resume = await prisma.resume.findFirst({
      where: { userId, isDefault: true },
    });

    if (!resume) {
      resume = await prisma.resume.create({
        data: { userId, title: 'Mi Currículum Profesional', isDefault: true },
      });
    }

    const newExp = await prisma.resumeExperience.create({
      data: {
        resumeId: resume.id,
        company,
        position,
        startDate,
        endDate: isCurrent ? null : endDate || null,
        isCurrent: !!isCurrent,
        description: description || null,
        city: city || 'Santo Domingo',
        country: 'República Dominicana',
      },
    });

    return res.status(201).json({
      message: 'Experiencia agregada exitosamente',
      experience: newExp,
    });
  } catch (error) {
    console.error('Error al agregar experiencia:', error);
    return res.status(500).json({ error: 'Error al agregar experiencia laboral' });
  }
});

// 9. Eliminar experiencia
router.delete('/experiences/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const exp = await prisma.resumeExperience.findFirst({
      where: { id, resume: { userId } },
    });

    if (!exp) {
      return res.status(404).json({ error: 'Experiencia no encontrada' });
    }

    await prisma.resumeExperience.delete({ where: { id } });
    return res.json({ message: 'Experiencia eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar experiencia:', error);
    return res.status(500).json({ error: 'Error al eliminar experiencia' });
  }
});

// 10. Agregar educación directamente al perfil
router.post('/education', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { institution, degree, fieldOfStudy, startDate, endDate, isCurrent } = req.body;

    if (!institution || !degree || !startDate) {
      return res.status(400).json({ error: 'Institución, grado y fecha de inicio son requeridos' });
    }

    let resume = await prisma.resume.findFirst({
      where: { userId, isDefault: true },
    });

    if (!resume) {
      resume = await prisma.resume.create({
        data: { userId, title: 'Mi Currículum Profesional', isDefault: true },
      });
    }

    const newEdu = await prisma.resumeEducation.create({
      data: {
        resumeId: resume.id,
        institution,
        degree,
        fieldOfStudy: fieldOfStudy || null,
        startDate,
        endDate: isCurrent ? null : endDate || null,
        isCurrent: !!isCurrent,
      },
    });

    return res.status(201).json({
      message: 'Educación agregada exitosamente',
      education: newEdu,
    });
  } catch (error) {
    console.error('Error al agregar educación:', error);
    return res.status(500).json({ error: 'Error al agregar educación' });
  }
});

// 11. Eliminar educación
router.delete('/education/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const edu = await prisma.resumeEducation.findFirst({
      where: { id, resume: { userId } },
    });

    if (!edu) {
      return res.status(404).json({ error: 'Educación no encontrada' });
    }

    await prisma.resumeEducation.delete({ where: { id } });
    return res.json({ message: 'Educación eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar educación:', error);
    return res.status(500).json({ error: 'Error al eliminar educación' });
  }
});

export default router;

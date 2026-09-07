import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import prisma from '../../config/prisma';
import { authenticate } from '../../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'quisqueya_talent_rd_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (payload: { id: string; email: string; role: Role; companyId?: string }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
};

// Registro de Candidato
router.post('/register-candidate', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone, documentId, province } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Por favor completa todos los campos requeridos' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Ya existe una cuenta registrada con este correo' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: Role.JOB_SEEKER,
        profile: {
          create: {
            firstName,
            lastName,
            phone,
            documentId,
            province: province || 'Distrito Nacional',
          },
        },
        resumes: {
          create: {
            title: `CV de ${firstName} ${lastName}`,
            isDefault: true,
          },
        },
      },
      include: { profile: true },
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return res.status(201).json({
      message: 'Cuenta de candidato creada con éxito',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (error: any) {
    console.error('Error en registro candidato:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Registro de Empresa
router.post('/register-company', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, companyName, rnc, industry, phone, province } = req.body;

    if (!email || !password || !firstName || !lastName || !companyName || !industry) {
      return res.status(400).json({ error: 'Todos los campos obligatorios de la empresa deben completarse' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Ya existe una cuenta con este correo electrónico' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: Role.COMPANY_OWNER,
        profile: {
          create: {
            firstName,
            lastName,
            phone,
            province: province || 'Distrito Nacional',
          },
        },
        companyMemberships: {
          create: {
            role: Role.COMPANY_OWNER,
            company: {
              create: {
                name: companyName,
                slug,
                rnc,
                industry,
                phone,
                province: province || 'Distrito Nacional',
              },
            },
          },
        },
      },
      include: {
        profile: true,
        companyMemberships: {
          include: { company: true },
        },
      },
    });

    const company = user.companyMemberships[0]?.company;
    const token = generateToken({ id: user.id, email: user.email, role: user.role, companyId: company?.id });

    return res.status(201).json({
      message: 'Empresa registrada exitosamente',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        company,
      },
    });
  } catch (error: any) {
    console.error('Error en registro empresa:', error);
    return res.status(500).json({ error: 'Error al registrar la empresa' });
  }
});

// Inicio de Sesión
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Ingresa correo y contraseña' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        companyMemberships: {
          include: { company: true },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const company = user.companyMemberships[0]?.company;
    const token = generateToken({ id: user.id, email: user.email, role: user.role, companyId: company?.id });

    return res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        company,
      },
    });
  } catch (error: any) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error en el servidor al autenticar' });
  }
});

// Perfil de la sesión actual
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        profile: true,
        companyMemberships: {
          include: { company: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      company: user.companyMemberships[0]?.company,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Error obteniendo datos de usuario' });
  }
});

export default router;

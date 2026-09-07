import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import prisma from '../config/prisma';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  companyId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'quisqueya_talent_rd_super_secret_jwt_key_2026';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado: Token faltante o inválido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    // Verificar si el usuario aún existe y está activo
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        companyMemberships: {
          select: { companyId: true, role: true },
        },
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Usuario inactivo o no encontrado' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyMemberships[0]?.companyId,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token expirado o inválido' });
  }
};

export const requireRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticación requerida' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acceso denegado: permisos insuficientes' });
    }

    next();
  };
};

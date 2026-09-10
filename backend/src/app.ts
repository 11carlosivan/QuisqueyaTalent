import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './modules/auth/auth.routes';
import jobsRoutes from './modules/jobs/jobs.routes';
import applicationsRoutes from './modules/applications/applications.routes';
import resumesRoutes from './modules/resumes/resumes.routes';
import companiesRoutes from './modules/companies/companies.routes';
import candidatesRoutes from './modules/candidates/candidates.routes';
import aiRoutes from './modules/ai/ai.routes';
import adsRoutes from './modules/ads/ads.routes';
import adminRoutes from './modules/admin/admin.routes';
import prisma from './config/prisma';

export const createApp = () => {
  const app = express();

  // Middlewares globales
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Archivos estáticos subidos (certificados, fotos, etc.)
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Health check
  app.get('/api/health', async (_req: Request, res: Response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return res.json({
        status: 'ok',
        service: 'Quisqueya Talent API',
        country: 'República Dominicana',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      return res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
    }
  });

  // Módulos de la API
  app.use('/api/auth', authRoutes);
  app.use('/api/jobs', jobsRoutes);
  app.use('/api/applications', applicationsRoutes);
  app.use('/api/resumes', resumesRoutes);
  app.use('/api/companies', companiesRoutes);
  app.use('/api/candidates', candidatesRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/ads', adsRoutes);
  app.use('/api/admin', adminRoutes);

  // Manejador 404
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Ruta no encontrada en el servidor' });
  });

  return app;
};

export default createApp;

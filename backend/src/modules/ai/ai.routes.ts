import { Router, Request, Response } from 'express';
import { AIService } from './ai.service';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Mejorar sección de CV con IA
router.post('/improve-resume', authenticate, async (req: Request, res: Response) => {
  try {
    const { text, type = 'experience' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Debes proporcionar un texto para optimizar' });
    }

    const improved = await AIService.improveResumeSection(text, type);
    return res.json({ result: improved });
  } catch (error) {
    return res.status(500).json({ error: 'Error al procesar optimización con IA' });
  }
});

// Asistente para redactar vacante
router.post('/generate-job', authenticate, async (req: Request, res: Response) => {
  try {
    const { title, province, experienceLevel, industry } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'El título de la vacante es obligatorio' });
    }

    const generated = await AIService.generateJobDescription({ title, province, experienceLevel, industry });
    return res.json(generated);
  } catch (error) {
    return res.status(500).json({ error: 'Error al redactar vacante con IA' });
  }
});

// Generar copys y contenido para redes sociales
router.post('/generate-social', authenticate, async (req: Request, res: Response) => {
  try {
    const { title, company, province, salary, type } = req.body;
    if (!title || !company) {
      return res.status(400).json({ error: 'Título y empresa son necesarios' });
    }

    const socialMedia = await AIService.generateSocialMedia({ title, company, province, salary, type });
    return res.json(socialMedia);
  } catch (error) {
    return res.status(500).json({ error: 'Error al generar copys sociales' });
  }
});

// Generar carta de presentación
router.post('/generate-cover-letter', authenticate, async (req: Request, res: Response) => {
  try {
    const { jobTitle, companyName } = req.body;
    const candidateName = req.user?.email.split('@')[0] || 'Candidato';

    const letter = await AIService.generateCoverLetter(candidateName, jobTitle || 'la vacante', companyName || 'su empresa');
    return res.json({ coverLetter: letter });
  } catch (error) {
    return res.status(500).json({ error: 'Error al generar carta de presentación' });
  }
});

export default router;

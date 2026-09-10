import { Router, Request, Response } from 'express';
import { Role } from '@prisma/client';
import prisma from '../../config/prisma';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// 1. Obtener posiciones publicitarias activas (Público para el Frontend)
router.get('/slots', async (_req: Request, res: Response) => {
  try {
    const slots = await prisma.adSlot.findMany({
      where: { isActive: true },
    });

    const slotsMap = slots.reduce((acc, slot) => {
      acc[slot.slotCode] = slot;
      return acc;
    }, {} as Record<string, any>);

    return res.json(slotsMap);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener posiciones publicitarias' });
  }
});

// 2. Administración: Listar todos los slots
router.get('/admin/all', authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (_req: Request, res: Response) => {
  try {
    const allSlots = await prisma.adSlot.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return res.json(allSlots);
  } catch (error) {
    return res.status(500).json({ error: 'Error al listar slots publicitarios' });
  }
});

// 3. Administración: Actualizar configuración de un AdSlot
router.put('/admin/:id', authenticate, requireRole(Role.ADMIN, Role.SUPER_ADMIN), async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { isActive, publisherId, slotId, rawCode, name } = req.body;

    const updated = await prisma.adSlot.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(publisherId !== undefined && { publisherId }),
        ...(slotId !== undefined && { slotId }),
        ...(rawCode !== undefined && { rawCode }),
        ...(name !== undefined && { name }),
      },
    });

    return res.json({ message: 'Posición publicitaria actualizada con éxito', slot: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar slot publicitario' });
  }
});

export default router;

import { JobStatus, JobType, WorkplaceType, ExperienceLevel } from '@prisma/client';
import prisma from '../../config/prisma';
import AIService, { ExtractedJobData } from './ai.service';
import OfficialCompanyService from '../companies/official-company.service';

export class AIQueueService {
  /**
   * Obtiene la configuración del publicador IA
   */
  static async getSettings() {
    let settings = await prisma.aiJobSetting.findUnique({
      where: { id: 'default' },
    });

    const company = await OfficialCompanyService.getOfficialCompany();

    if (!settings) {
      settings = await prisma.aiJobSetting.create({
        data: {
          id: 'default',
          isActive: false,
          jobsPerHour: 2,
          publishMode: 'DRAFT',
          maxDaysOld: 30,
          officialCompanyId: company?.id || null,
        },
      });
    }

    return {
      ...settings,
      officialCompany: company,
    };
  }

  /**
   * Actualiza la configuración del publicador IA (pausa, vacantes por hora, modo)
   */
  static async updateSettings(data: {
    isActive?: boolean;
    jobsPerHour?: number;
    publishMode?: 'DRAFT' | 'PUBLISHED';
    maxDaysOld?: number;
  }) {
    const updated = await prisma.aiJobSetting.upsert({
      where: { id: 'default' },
      update: {
        ...(data.isActive !== undefined && { isActive: Boolean(data.isActive) }),
        ...(data.jobsPerHour !== undefined && { jobsPerHour: Math.max(1, Number(data.jobsPerHour)) }),
        ...(data.publishMode !== undefined && { publishMode: data.publishMode }),
        ...(data.maxDaysOld !== undefined && { maxDaysOld: Math.max(1, Number(data.maxDaysOld)) }),
      },
      create: {
        id: 'default',
        isActive: data.isActive ?? false,
        jobsPerHour: data.jobsPerHour ?? 2,
        publishMode: data.publishMode ?? 'DRAFT',
        maxDaysOld: data.maxDaysOld ?? 30,
      },
    });

    const company = await OfficialCompanyService.getOfficialCompany();

    return {
      ...updated,
      officialCompany: company,
    };
  }

  /**
   * Lista los elementos de la cola con estadísticas
   */
  static async getQueue(status?: string, page = 1, limit = 20) {
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [total, items, pendingCount, draftCount, publishedCount, discardedCount] = await Promise.all([
      prisma.aiJobQueue.count({ where }),
      prisma.aiJobQueue.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          source: { select: { username: true, profileUrl: true } },
        },
      }),
      prisma.aiJobQueue.count({ where: { status: 'PENDING' } }),
      prisma.aiJobQueue.count({ where: { status: 'DRAFT' } }),
      prisma.aiJobQueue.count({ where: { status: 'PUBLISHED' } }),
      prisma.aiJobQueue.count({ where: { status: 'DISCARDED' } }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      counts: {
        pending: pendingCount,
        draft: draftCount,
        published: publishedCount,
        discarded: discardedCount,
        total,
      },
    };
  }

  /**
   * Elimina un elemento de la cola
   */
  static async deleteQueueItem(id: string) {
    return prisma.aiJobQueue.delete({
      where: { id },
    });
  }

  /**
   * Procesa un elemento específico de la cola: redacta con IA y crea el Job
   */
  static async processQueueItem(queueItemId: string, forcePublish = false) {
    const item = await prisma.aiJobQueue.findUnique({
      where: { id: queueItemId },
    });

    if (!item) {
      throw new Error('Elemento de cola no encontrado');
    }

    const settings = await this.getSettings();
    const company = await OfficialCompanyService.getOfficialCompany();
    if (!company) {
      throw new Error('No se pudo encontrar la empresa oficial Quisqueya Talent');
    }

    // 1. Extraer o reutilizar datos con IA
    let jobData: ExtractedJobData;
    if (item.extractedData) {
      try {
        jobData = JSON.parse(item.extractedData);
      } catch (e) {
        jobData = await AIService.parseJobFromPost({
          caption: item.captionText || '',
          imageUrl: item.imageUrl || undefined,
        });
      }
    } else {
      jobData = await AIService.parseJobFromPost({
        caption: item.captionText || '',
        imageUrl: item.imageUrl || undefined,
      });
    }

    // 2. Si no es oferta de empleo legítima, marcar como descartado
    if (!jobData.isJobOffer) {
      await prisma.aiJobQueue.update({
        where: { id: item.id },
        data: {
          isJobOffer: false,
          status: 'DISCARDED',
          extractedData: JSON.stringify(jobData),
          processedAt: new Date(),
        },
      });
      return { status: 'DISCARDED', message: 'El post no corresponde a una vacante laboral' };
    }

    // 3. Determinar el estado de publicación según settings o forcePublish
    const shouldPublishNow = forcePublish || settings.publishMode === 'PUBLISHED';
    const jobStatus = shouldPublishNow ? JobStatus.PUBLISHED : JobStatus.DRAFT;

    // 4. Crear slug único
    const rawSlug = `${jobData.title}-${jobData.province}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const slug = `${rawSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 5. Agregar nota de transparencia
    let fullDescription = jobData.description;
    if (jobData.companyName && jobData.companyName !== 'Empresa Confidencial') {
      fullDescription += `\n\n📌 *Oportunidad gestionada por Quisqueya Talent para: ${jobData.companyName}*`;
    }

    // 6. Crear el Job en la base de datos vinculado a la empresa oficial Quisqueya Talent
    const job = await prisma.job.create({
      data: {
        companyId: company.id,
        title: jobData.title,
        slug,
        category: jobData.category || 'Otros',
        description: fullDescription,
        responsibilities: jobData.responsibilities,
        requirements: jobData.requirements,
        benefits: jobData.benefits,
        jobType: (jobData.jobType as JobType) || JobType.FULL_TIME,
        workplaceType: (jobData.workplaceType as WorkplaceType) || WorkplaceType.ON_SITE,
        experienceLevel: (jobData.experienceLevel as ExperienceLevel) || ExperienceLevel.MID,
        salaryMin: jobData.salaryMin ? Number(jobData.salaryMin) : null,
        salaryMax: jobData.salaryMax ? Number(jobData.salaryMax) : null,
        salaryCurrency: jobData.salaryCurrency || 'DOP',
        isSalaryPublic: jobData.isSalaryPublic ?? true,
        applyMethod: jobData.applyMethod || 'PLATFORM',
        applyEmail: jobData.applyMethod === 'EMAIL' ? jobData.applyEmail : null,
        province: jobData.province || 'Santo Domingo',
        city: jobData.city || null,
        status: jobStatus,
        publishedAt: shouldPublishNow ? new Date() : null,
        skills: {
          create: (jobData.skills || []).map((s) => ({ skillName: s })),
        },
      },
    });

    // 7. Actualizar la cola
    const updatedQueue = await prisma.aiJobQueue.update({
      where: { id: item.id },
      data: {
        jobId: job.id,
        status: shouldPublishNow ? 'PUBLISHED' : 'DRAFT',
        extractedData: JSON.stringify(jobData),
        isJobOffer: true,
        processedAt: new Date(),
        publishedAt: shouldPublishNow ? new Date() : null,
      },
    });

    return {
      status: updatedQueue.status,
      job,
      queueItem: updatedQueue,
    };
  }

  /**
   * Procesa la siguiente vacante en cola (PENDING)
   */
  static async processNextPending() {
    const nextItem = await prisma.aiJobQueue.findFirst({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
    });

    if (!nextItem) {
      return null;
    }

    const result = await this.processQueueItem(nextItem.id);

    // Actualizar timestamp de última ejecución
    await prisma.aiJobSetting.update({
      where: { id: 'default' },
      data: { lastRunAt: new Date() },
    });

    return result;
  }

  /**
   * Publica de inmediato una vacante que estaba guardada como borrador
   */
  static async publishDraft(queueId: string) {
    const item = await prisma.aiJobQueue.findUnique({
      where: { id: queueId },
    });

    if (!item) {
      throw new Error('Elemento no encontrado en la cola');
    }

    if (item.jobId) {
      await prisma.job.update({
        where: { id: item.jobId },
        data: {
          status: JobStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      });
    } else {
      // Si no tenía jobId por alguna razón, crearlo y publicarlo
      return this.processQueueItem(queueId, true);
    }

    const updated = await prisma.aiJobQueue.update({
      where: { id: queueId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });

    return updated;
  }
}

export default AIQueueService;

import prisma from '../../config/prisma';
import AIQueueService from './ai-queue.service';
import InstagramScraperService from './instagram-scraper.service';

export class AIPublisherWorker {
  private static timer: NodeJS.Timeout | null = null;
  private static initialScanTimer: NodeJS.Timeout | null = null;
  private static isRunning = false;
  private static isScanningSources = false;
  private static lastSourcesScanAt: Date | null = null;
  // Intervalo de escaneo autónomo de perfiles: cada 12 horas
  private static readonly SCAN_INTERVAL_MS = 12 * 60 * 60 * 1000;

  /**
   * Inicia el worker de publicaciones y escaneo autónomo
   */
  static start(intervalSeconds = 60) {
    if (this.timer) {
      console.log('⚠️ AIPublisherWorker ya se encuentra en ejecución');
      return;
    }

    console.log(`🤖 AIPublisherWorker iniciado (Ciclo de publicación cada ${intervalSeconds}s, Escaneo diario cada 12h)`);
    this.timer = setInterval(() => this.tick(), intervalSeconds * 1000);

    // Ejecutar un escaneo inicial autónomo 25 segundos después de que el servidor arranca
    this.initialScanTimer = setTimeout(() => {
      this.scanAllSources().catch((err) => {
        console.error('⚠️ [AIPublisherWorker] Error en escaneo inicial de fuentes:', err);
      });
    }, 25000);
  }

  /**
   * Detiene el worker
   */
  static stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.initialScanTimer) {
      clearTimeout(this.initialScanTimer);
      this.initialScanTimer = null;
    }
    console.log('🛑 AIPublisherWorker detenido');
  }

  /**
   * Indica si hay un escaneo de cuentas en curso
   */
  static isScanning(): boolean {
    return this.isScanningSources;
  }

  /**
   * Retorna el estado actual del worker para monitoreo
   */
  static getStatus() {
    const now = Date.now();
    let nextScanInHours = 0;
    if (this.lastSourcesScanAt) {
      const remainingMs = this.SCAN_INTERVAL_MS - (now - this.lastSourcesScanAt.getTime());
      nextScanInHours = Math.max(0, Math.round((remainingMs / (3600 * 1000)) * 10) / 10);
    }

    return {
      isWorkerActive: Boolean(this.timer),
      isProcessingQueue: this.isRunning,
      isScanningSources: this.isScanningSources,
      lastSourcesScanAt: this.lastSourcesScanAt,
      nextScanInHours,
      scanIntervalHours: 12,
    };
  }

  /**
   * Escanea de forma autónoma todas las cuentas de Instagram y sitios web activos
   * buscando nuevos posts de vacantes para encolar y procesar con IA
   */
  static async scanAllSources(force = false): Promise<{
    scanned: number;
    newJobsEnqueued: number;
    skippedDuplicates: number;
    errors: number;
    blockedByInstagram?: number;
    message?: string;
  }> {
    if (this.isScanningSources) {
      console.log('⏳ [AIPublisherWorker] Ya hay un escaneo de fuentes en curso. Omitiendo.');
      return {
        scanned: 0,
        newJobsEnqueued: 0,
        skippedDuplicates: 0,
        errors: 0,
        blockedByInstagram: 0,
        message: 'Ya hay un escaneo en curso',
      };
    }

    this.isScanningSources = true;
    let totalNew = 0;
    let skippedDuplicatesTotal = 0;
    let errorCount = 0;
    let scannedCount = 0;
    let blockedByInstagramCount = 0;

    try {
      // 1. Verificar si el sistema está activo globalmente (si no es forzado manualmente)
      const settings = await AIQueueService.getSettings();
      if (!force && !settings.isActive) {
        console.log('⏸️ [AIPublisherWorker] Publicador IA pausado globalmente. Omitiendo escaneo autónomo.');
        return {
          scanned: 0,
          newJobsEnqueued: 0,
          skippedDuplicates: 0,
          errors: 0,
          blockedByInstagram: 0,
          message: 'Publicador IA pausado',
        };
      }

      // 2. Obtener las cuentas a escanear (activas o todas si es forzado)
      const sources = await prisma.instagramSource.findMany({
        where: force ? {} : { isActive: true },
        orderBy: { lastScannedAt: 'asc' },
      });

      if (sources.length === 0) {
        console.log('ℹ️ [AIPublisherWorker] No hay perfiles o páginas registradas para escanear.');
        return {
          scanned: 0,
          newJobsEnqueued: 0,
          skippedDuplicates: 0,
          errors: 0,
          blockedByInstagram: 0,
          message: 'No hay cuentas registradas para escanear',
        };
      }

      console.log(`🤖 [AIPublisherWorker] Iniciando escaneo de ${sources.length} perfiles (forzado: ${force})...`);
      const sessionId = await AIQueueService.getRawSessionIdAsync();
      const maxDaysOld = settings.maxDaysOld || 30;

      for (const source of sources) {
        try {
          const target = source.profileUrl || source.username;
          console.log(`🔍 [AIPublisherWorker] Escaneando: @${source.username} (${target})...`);

          const result = await InstagramScraperService.scanAndEnqueue(target, maxDaysOld, sessionId);
          scannedCount++;
          totalNew += result.newEnqueued;
          skippedDuplicatesTotal += result.skippedDuplicates;

          if (result.sourceType === 'INSTAGRAM_PROFILE' && result.totalFound === 0 && (!sessionId || result.message?.includes('429') || result.message?.includes('bloqueó'))) {
            blockedByInstagramCount++;
          }

          console.log(
            `✨ [AIPublisherWorker] @${source.username}: ${result.newEnqueued} nuevas vacantes (${result.skippedDuplicates} ya existían).`
          );

          // Actualizar fecha de último escaneo exitoso
          await prisma.instagramSource.update({
            where: { id: source.id },
            data: { lastScannedAt: new Date() },
          });

          // Pequeña pausa entre cuentas para proteger contra límites de tasa
          if (sources.length > 1) {
            await new Promise((r) => setTimeout(r, 4000));
          }
        } catch (srcErr: any) {
          errorCount++;
          console.error(`⚠️ [AIPublisherWorker] Error escaneando fuente @${source.username}:`, srcErr.message || srcErr);
        }
      }

      this.lastSourcesScanAt = new Date();
      console.log(
        `🏁 [AIPublisherWorker] Escaneo finalizado: ${scannedCount} cuentas analizadas, ${totalNew} nuevas vacantes listas.`
      );
    } catch (err) {
      console.error('❌ [AIPublisherWorker] Error general en escaneo de fuentes:', err);
    } finally {
      this.isScanningSources = false;
    }

    return {
      scanned: scannedCount,
      newJobsEnqueued: totalNew,
      skippedDuplicates: skippedDuplicatesTotal,
      errors: errorCount,
      blockedByInstagram: blockedByInstagramCount,
    };
  }

  /**
   * Ciclo de verificación y ejecución periódica (publicación progresiva y chequeo de escaneo)
   */
  private static async tick() {
    if (this.isRunning) return;

    try {
      this.isRunning = true;

      // 1. Consultar configuración actual
      const settings = await AIQueueService.getSettings();

      // 2. Si está en pausa global, salir
      if (!settings.isActive) {
        return;
      }

      // 3. Chequeo de escaneo autónomo programado (cada 12 horas)
      const now = Date.now();
      const shouldScanSources =
        !this.lastSourcesScanAt ||
        now - this.lastSourcesScanAt.getTime() >= this.SCAN_INTERVAL_MS;

      if (shouldScanSources && !this.isScanningSources) {
        // Disparar escaneo autónomo en background sin bloquear el ciclo de cola
        this.scanAllSources().catch((e) => {
          console.error('❌ [AIPublisherWorker] Error en escaneo autónomo programado:', e);
        });
      }

      // 4. Calcular intervalo requerido por vacantes por hora
      const jobsPerHour = Math.max(1, settings.jobsPerHour || 1);
      const intervalMs = (3600 * 1000) / jobsPerHour;

      if (settings.lastRunAt) {
        const elapsed = Date.now() - new Date(settings.lastRunAt).getTime();
        if (elapsed < intervalMs) {
          // Aún no corresponde publicar según la tasa configurada
          return;
        }
      }

      // 5. Tomar y procesar la siguiente vacante en cola
      const result = await AIQueueService.processNextPending();
      if (result) {
        console.log(
          `✅ [AIPublisherWorker] Vacante procesada exitosamente (${settings.publishMode}):`,
          (result as any).job?.title || result.status
        );
      }
    } catch (error) {
      console.error('❌ [AIPublisherWorker] Error durante ejecución periódica:', error);
    } finally {
      this.isRunning = false;
    }
  }
}

export default AIPublisherWorker;

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
  static async scanAllSources(): Promise<{ scanned: number; newJobsEnqueued: number; errors: number }> {
    if (this.isScanningSources) {
      console.log('⏳ [AIPublisherWorker] Ya hay un escaneo de fuentes en curso. Omitiendo.');
      return { scanned: 0, newJobsEnqueued: 0, errors: 0 };
    }

    this.isScanningSources = true;
    let totalNew = 0;
    let errorCount = 0;
    let scannedCount = 0;

    try {
      // 1. Verificar si el sistema está activo globalmente
      const settings = await AIQueueService.getSettings();
      if (!settings.isActive) {
        console.log('⏸️ [AIPublisherWorker] Publicador IA pausado globalmente. Omitiendo escaneo autónomo.');
        return { scanned: 0, newJobsEnqueued: 0, errors: 0 };
      }

      // 2. Obtener todas las cuentas activas
      const sources = await prisma.instagramSource.findMany({
        where: { isActive: true },
        orderBy: { lastScannedAt: 'asc' }, // Primero las que llevan más tiempo sin revisarse
      });

      if (sources.length === 0) {
        console.log('ℹ️ [AIPublisherWorker] No hay perfiles o páginas registradas para escaneo autónomo.');
        return { scanned: 0, newJobsEnqueued: 0, errors: 0 };
      }

      console.log(`🤖 [AIPublisherWorker] Iniciando escaneo autónomo de ${sources.length} perfiles registrados...`);
      const sessionId = AIQueueService.getRawSessionId();
      const maxDaysOld = settings.maxDaysOld || 7;

      for (const source of sources) {
        try {
          const target = source.profileUrl || source.username;
          console.log(`🔍 [AIPublisherWorker] Escaneando automáticamente: @${source.username} (${target})...`);

          const result = await InstagramScraperService.scanAndEnqueue(target, maxDaysOld, sessionId);
          scannedCount++;
          totalNew += result.newEnqueued;

          console.log(
            `✨ [AIPublisherWorker] @${source.username}: ${result.newEnqueued} nuevas vacantes añadidas a la cola (${result.skippedDuplicates} ya existían).`
          );

          // Actualizar fecha de último escaneo exitoso
          await prisma.instagramSource.update({
            where: { id: source.id },
            data: { lastScannedAt: new Date() },
          });

          // Pausa de 6 segundos entre cuentas para proteger contra límites de tasa
          await new Promise((r) => setTimeout(r, 6000));
        } catch (srcErr: any) {
          errorCount++;
          console.error(`⚠️ [AIPublisherWorker] Error escaneando fuente @${source.username}:`, srcErr.message || srcErr);
        }
      }

      this.lastSourcesScanAt = new Date();
      console.log(
        `🏁 [AIPublisherWorker] Escaneo autónomo finalizado: ${scannedCount} cuentas analizadas, ${totalNew} nuevas vacantes listas para redactar con IA.`
      );
    } catch (err) {
      console.error('❌ [AIPublisherWorker] Error general en escaneo autónomo de fuentes:', err);
    } finally {
      this.isScanningSources = false;
    }

    return { scanned: scannedCount, newJobsEnqueued: totalNew, errors: errorCount };
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

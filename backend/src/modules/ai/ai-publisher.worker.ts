import AIQueueService from './ai-queue.service';

export class AIPublisherWorker {
  private static timer: NodeJS.Timeout | null = null;
  private static isRunning = false;

  /**
   * Inicia el worker de publicaciones automáticas
   */
  static start(intervalSeconds = 60) {
    if (this.timer) {
      console.log('⚠️ AIPublisherWorker ya se encuentra en ejecución');
      return;
    }

    console.log(`🤖 AIPublisherWorker iniciado (Chequeo cada ${intervalSeconds}s)`);
    this.timer = setInterval(() => this.tick(), intervalSeconds * 1000);
  }

  /**
   * Detiene el worker
   */
  static stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('🛑 AIPublisherWorker detenido');
    }
  }

  /**
   * Ciclo de verificación y ejecución
   */
  private static async tick() {
    if (this.isRunning) return;

    try {
      this.isRunning = true;

      // 1. Consultar configuración actual
      const settings = await AIQueueService.getSettings();

      // 2. Si está en pausa, salir
      if (!settings.isActive) {
        return;
      }

      // 3. Calcular intervalo requerido por vacantes por hora
      const jobsPerHour = Math.max(1, settings.jobsPerHour || 1);
      const intervalMs = (3600 * 1000) / jobsPerHour;

      if (settings.lastRunAt) {
        const elapsed = Date.now() - new Date(settings.lastRunAt).getTime();
        if (elapsed < intervalMs) {
          // Aún no corresponde publicar según la tasa configurada
          return;
        }
      }

      // 4. Tomar y procesar la siguiente vacante en cola
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

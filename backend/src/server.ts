import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import OfficialCompanyService from './modules/companies/official-company.service';
import AIPublisherWorker from './modules/ai/ai-publisher.worker';

const PORT = process.env.PORT || 5000;
const app = createApp();

const server = app.listen(PORT, async () => {
  console.log(`🚀 Quisqueya Talent API corriendo en el puerto ${PORT}`);
  console.log(`📡 URL Base: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);

  // Asegurar la existencia de la empresa oficial Quisqueya Talent vinculada al Admin
  try {
    await OfficialCompanyService.ensureOfficialCompany();
  } catch (err) {
    console.warn('Advertencia inicializando empresa oficial:', err);
  }

  // Iniciar worker en segundo plano para publicación programada de vacantes con IA
  AIPublisherWorker.start(60);
});

const cleanup = () => {
  AIPublisherWorker.stop();
  server.close(() => {
    console.log('Servidor finalizado limpiamente');
  });
};

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

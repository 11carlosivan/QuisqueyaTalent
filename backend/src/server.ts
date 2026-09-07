import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';

const PORT = process.env.PORT || 5000;
const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`🚀 Quisqueya Talent API corriendo en el puerto ${PORT}`);
  console.log(`📡 URL Base: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Servidor finalizado limpiamente');
  });
});

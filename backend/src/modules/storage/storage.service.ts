import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import prisma from '../../config/prisma';
import crypto from 'crypto';
import path from 'path';

// Configuración de Cloudflare R2
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '92980d03d8d512536a949709e511a303';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'quisqueyatalent-storage';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-1b2937289c0d4d57adcfed5505a3fd8b.r2.dev';

function getR2Client(): S3Client | null {
  const accountId = process.env.R2_ACCOUNT_ID || '92980d03d8d512536a949709e511a303';
  const accessKey = process.env.R2_ACCESS_KEY_ID || '';
  const secretKey = process.env.R2_SECRET_ACCESS_KEY || '';

  if (accessKey && secretKey) {
    return new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });
  }
  return null;
}

export const storageService = {
  /**
   * Obtiene o crea la configuración del Guardián Anti-Costos
   */
  async getGuard() {
    let guard = await prisma.storageGuard.findFirst();
    if (!guard) {
      guard = await prisma.storageGuard.create({
        data: {
          isGuardActive: true,
          maxStorageBytes: 9.0 * 1024 * 1024 * 1024, // 9.0 GB (Free tier límite es 10 GB)
          usedStorageBytes: 0,
          maxFileSizeBytes: 3 * 1024 * 1024, // 3 MB máximo por archivo
          totalFilesUploaded: 0,
        },
      });
    }
    return guard;
  },

  /**
   * Actualizar configuración del Guardián desde el Panel de Administración
   */
  async updateGuard(data: { isGuardActive?: boolean; maxStorageBytes?: number; maxFileSizeBytes?: number }) {
    const current = await this.getGuard();
    return await prisma.storageGuard.update({
      where: { id: current.id },
      data: {
        ...(data.isGuardActive !== undefined && { isGuardActive: data.isGuardActive }),
        ...(data.maxStorageBytes !== undefined && { maxStorageBytes: Number(data.maxStorageBytes) }),
        ...(data.maxFileSizeBytes !== undefined && { maxFileSizeBytes: Number(data.maxFileSizeBytes) }),
      },
    });
  },

  /**
   * Subir archivo con validación estricta de cuota para costo $0
   */
  async uploadFile({
    buffer,
    originalname,
    mimetype,
    folder = 'uploads',
  }: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    folder?: string;
  }): Promise<{ url: string; size: number }> {
    const fileSize = buffer.length;
    const guard = await this.getGuard();

    // 1. Validar límite por archivo individual
    if (fileSize > guard.maxFileSizeBytes) {
      const maxMb = (guard.maxFileSizeBytes / (1024 * 1024)).toFixed(1);
      throw new Error(`El archivo supera el tamaño máximo permitido de ${maxMb} MB.`);
    }

    // 2. Validar Guardián de Límite Mensual Gratuito (Cloudflare 10 GB)
    if (guard.isGuardActive) {
      if (guard.usedStorageBytes + fileSize > guard.maxStorageBytes) {
        throw new Error(
          '⚠️ Límite de seguridad de almacenamiento gratuito alcanzado (9.0 GB de 10 GB). Para protegerte de cobros en Cloudflare, las subidas se han pausado temporalmente. Puedes desactivar esta protección en el panel de administración.'
        );
      }
    }

    const ext = path.extname(originalname);
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const key = `${folder}/${uniqueId}${ext}`;

    const client = getR2Client();
    const bucketName = process.env.R2_BUCKET_NAME || 'quisqueyatalent-storage';
    const publicUrl = process.env.R2_PUBLIC_URL || 'https://pub-1b2937289c0d4d57adcfed5505a3fd8b.r2.dev';

    // 3. Subida a Cloudflare R2 si está configurado
    if (client) {
      try {
        await client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: buffer,
            ContentType: mimetype,
          })
        );

        // Registrar consumo en el Guardián
        await prisma.storageGuard.update({
          where: { id: guard.id },
          data: {
            usedStorageBytes: { increment: fileSize },
            totalFilesUploaded: { increment: 1 },
          },
        });

        return {
          url: `${publicUrl.replace(/\/$/, '')}/${key}`,
          size: fileSize,
        };
      } catch (r2Error: any) {
        console.error('Error detallado de Cloudflare R2 al subir:', r2Error);
        throw new Error(`Error en almacenamiento Cloudflare R2: ${r2Error.message || r2Error.Code || 'Acceso Denegado'}`);
      }
    } else {
      // Fallback a almacenamiento local si no hay claves R2
      const fs = require('fs');
      const uploadDir = path.join(process.cwd(), 'uploads', folder);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const localFilePath = path.join(uploadDir, `${uniqueId}${ext}`);
      fs.writeFileSync(localFilePath, buffer);

      return {
        url: `/uploads/${folder}/${uniqueId}${ext}`,
        size: fileSize,
      };
    }
  },
};

export default storageService;

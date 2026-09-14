import { MetadataRoute } from 'next';
import { API_URL } from '@/lib/api';

const SITE_URL = 'https://www.quisqueyatalent.com.do';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Rutas estáticas clave
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/empleos`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/candidatos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/empresas`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/dashboard/candidato/cv`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/codigo-trabajo`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terminos`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacidad`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Rutas dinámicas de vacantes publicadas para Google y buscadores
  let jobRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/api/jobs?limit=250`, {
      next: { revalidate: 1800 },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.jobs)) {
        jobRoutes = data.jobs.map((job: any) => ({
          url: `${SITE_URL}/empleos/${job.slug}`,
          lastModified: job.updatedAt ? new Date(job.updatedAt) : new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.8,
        }));
      }
    }
  } catch (err) {
    console.warn('Error al generar rutas dinámicas de vacantes para sitemap:', err);
  }

  return [...staticRoutes, ...jobRoutes];
}

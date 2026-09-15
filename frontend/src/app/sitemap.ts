import { MetadataRoute } from 'next';
import { API_URL } from '@/lib/api';

const SITE_URL = 'https://www.quisqueyatalent.com.do';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Rutas Estáticas Principales
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/empleos`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/candidatos`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/empresas`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/dashboard/candidato/cv`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/codigo-trabajo`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/terminos`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacidad`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // 2. Páginas de Búsqueda y Filtros Clave para Google RD (Provincias y Categorías Populares)
  const seoLandingQueries = [
    'province=Distrito+Nacional',
    'province=Santo+Domingo',
    'province=Santiago',
    'province=La+Altagracia+(Punta+Cana)',
    'province=San+Crist%C3%B3bal',
    'province=La+Romana',
    'province=Puerto+Plata',
    'category=Tecnolog%C3%ADa+e+Inform%C3%A1tica',
    'category=Call+Center+y+BPO',
    'category=Ventas+y+Comercio+B2B',
    'category=Banca+y+Finanzas',
    'category=Turismo+y+Hoteler%C3%ADa',
    'category=Zonas+Francas+%26+Log%C3%ADstica',
    'workplaceType=REMOTE',
    'workplaceType=HYBRID',
  ];

  const landingRoutes: MetadataRoute.Sitemap = seoLandingQueries.map((query) => ({
    url: `${SITE_URL}/empleos?${query}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // 3. Rutas Dinámicas de Vacantes Publicadas
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
          lastModified: job.updatedAt ? new Date(job.updatedAt) : now,
          changeFrequency: 'daily' as const,
          priority: 0.9,
        }));
      }
    }
  } catch (err) {
    console.warn('Aviso: No se pudieron consultar vacantes dinámicas para el sitemap en este momento:', err);
  }

  // 4. Rutas Dinámicas de Empresas Registradas
  let companyRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/api/companies`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const companies = await res.json();
      if (Array.isArray(companies)) {
        companyRoutes = companies.map((c: any) => ({
          url: `${SITE_URL}/empresas/${c.slug}`,
          lastModified: c.createdAt ? new Date(c.createdAt) : now,
          changeFrequency: 'weekly' as const,
          priority: 0.75,
        }));
      }
    }
  } catch (err) {
    console.warn('Aviso: No se pudieron consultar empresas dinámicas para el sitemap en este momento:', err);
  }

  return [...staticRoutes, ...landingRoutes, ...jobRoutes, ...companyRoutes];
}

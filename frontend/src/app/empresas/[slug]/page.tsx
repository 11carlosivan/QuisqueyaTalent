import type { Metadata } from 'next';
import { API_URL } from '@/lib/api';
import CompanyProfileClient from './CompanyProfileClient';

const SITE_URL = 'https://www.quisqueyatalent.com.do';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getCompany(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/companies/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompany(slug);

  if (!company || company.error) {
    return {
      title: 'Empresa no encontrada | Quisqueya Talent',
      description: 'Conoce las mejores empresas que contratan talento en República Dominicana.',
    };
  }

  const name = company.name;
  const industry = company.industry ? ` - ${company.industry}` : '';
  const location = company.province || 'República Dominicana';
  const title = `Empleos en ${name}${industry} (${location})`;
  const description = `Vacantes y oportunidades de trabajo en ${name} en ${location}. Conoce su perfil corporativo y postúlate gratis en Quisqueya Talent.`;
  const canonicalUrl = `${SITE_URL}/empresas/${slug}`;
  const logoUrl = company.logoUrl || `${SITE_URL}/og-image.png`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    keywords: [
      `Empleos ${name}`,
      `Trabajo en ${name}`,
      `Vacantes ${name}`,
      `Empresas ${location}`,
      'Quisqueya Talent',
    ],
    openGraph: {
      title: `${title} | Quisqueya Talent`,
      description,
      url: canonicalUrl,
      siteName: 'Quisqueya Talent',
      locale: 'es_DO',
      type: 'profile',
      images: [
        {
          url: logoUrl,
          width: 800,
          height: 600,
          alt: `Perfil de ${name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Quisqueya Talent`,
      description,
      images: [logoUrl],
    },
  };
}

export default async function CompanyPage({ params }: PageProps) {
  const { slug } = await params;
  const company = await getCompany(slug);

  const organizationSchema = company && !company.error
    ? {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: company.name,
        description: company.description || undefined,
        url: company.websiteUrl || `${SITE_URL}/empresas/${slug}`,
        logo: company.logoUrl || `${SITE_URL}/icon-512x512.png`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: company.city || company.province || 'Santo Domingo',
          addressRegion: company.province || 'Distrito Nacional',
          addressCountry: 'DO',
        },
      }
    : null;

  return (
    <>
      {organizationSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      )}
      <CompanyProfileClient slug={slug} initialCompany={company} />
    </>
  );
}

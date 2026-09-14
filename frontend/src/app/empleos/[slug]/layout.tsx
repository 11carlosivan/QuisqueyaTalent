import type { Metadata } from 'next';
import { API_URL } from '@/lib/api';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_URL}/api/jobs/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return {
        title: 'Vacante de Empleo',
        description: 'Encuentra las mejores oportunidades laborales en República Dominicana.',
      };
    }
    const job = await res.json();
    const companyName = job.company?.name || 'Empresa Dominicana';
    const title = `${job.title} en ${companyName}`;
    const cleanDescription = job.description
      ? job.description.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim().slice(0, 155)
      : `Vacante de empleo para ${job.title} en ${job.province || 'República Dominicana'}. Postúlate gratis en Quisqueya Talent.`;
    const snippet = `${cleanDescription}...`;
    const canonicalUrl = `https://www.quisqueyatalent.com.do/empleos/${slug}`;
    const logo = job.company?.logoUrl || '/og-image.png';

    return {
      title,
      description: snippet,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${title} | Quisqueya Talent`,
        description: snippet,
        url: canonicalUrl,
        siteName: 'Quisqueya Talent',
        images: [
          {
            url: logo,
            width: 1200,
            height: 630,
            alt: `${job.title} - Quisqueya Talent RD`,
          },
        ],
        locale: 'es_DO',
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | Quisqueya Talent`,
        description: snippet,
        images: [logo],
      },
    };
  } catch {
    return {
      title: 'Vacante de Empleo',
      description: 'Encuentra las mejores oportunidades laborales en República Dominicana.',
    };
  }
}

export default function JobLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

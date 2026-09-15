import type { Metadata } from 'next';
import { API_URL } from '@/lib/api';
import JobDetailClient from './JobDetailClient';

const SITE_URL = 'https://www.quisqueyatalent.com.do';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getJob(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/jobs/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getJob(slug);

  if (!data?.job) {
    return {
      title: 'Empleo en República Dominicana | Quisqueya Talent',
      description: 'Encuentra las mejores oportunidades laborales en República Dominicana.',
    };
  }

  const job = data.job;
  const companyName = job.company?.name || 'Empresa Confidencial';
  const location = job.city ? `${job.city}, ${job.province}` : (job.province || 'República Dominicana');
  const title = `${job.title} en ${companyName} (${location})`;
  const cleanDescription = (job.description || '')
    .replace(/[#*`_>\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
  const description = `Vacante de ${job.title} en ${companyName} (${location}). ${cleanDescription}... Postúlate gratis en Quisqueya Talent.`;

  const canonicalUrl = `${SITE_URL}/empleos/${slug}`;
  const ogImageUrl = job.company?.logoUrl || `${SITE_URL}/og-image.png`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    keywords: [
      job.title,
      `Empleos ${job.title}`,
      `Trabajo ${companyName}`,
      `Empleos ${location}`,
      'Bolsa de Empleo RD',
      'Quisqueya Talent',
    ],
    openGraph: {
      title: `${title} | Quisqueya Talent`,
      description,
      url: canonicalUrl,
      siteName: 'Quisqueya Talent',
      locale: 'es_DO',
      type: 'article',
      publishedTime: job.publishedAt || job.createdAt,
      images: [
        {
          url: ogImageUrl,
          width: 800,
          height: 600,
          alt: `${job.title} - ${companyName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Quisqueya Talent`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getJob(slug);
  const job = data?.job || null;
  const relatedJobs = data?.relatedJobs || [];

  // Google for Jobs (JobPosting Schema.org)
  const companyName = job?.company?.name || 'Empresa Dominicana';
  const location = job?.province || 'Santo Domingo';

  const jobPostingSchema = job
    ? {
        '@context': 'https://schema.org/',
        '@type': 'JobPosting',
        title: job.title,
        description: job.description,
        identifier: {
          '@type': 'PropertyValue',
          name: 'Quisqueya Talent',
          value: job.id,
        },
        datePosted: job.publishedAt || job.createdAt,
        validThrough:
          job.expiresAt ||
          new Date(new Date(job.createdAt || Date.now()).getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        employmentType: job.jobType || 'FULL_TIME',
        hiringOrganization: {
          '@type': 'Organization',
          name: companyName,
          sameAs: job.company?.websiteUrl || undefined,
          logo: job.company?.logoUrl || `${SITE_URL}/icon-512x512.png`,
        },
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: job.city || location,
            addressRegion: location,
            addressCountry: 'DO',
          },
        },
        ...(job.workplaceType === 'REMOTE' && {
          jobLocationType: 'TELECOMMUTE',
          applicantLocationRequirements: {
            '@type': 'Country',
            name: 'DO',
          },
        }),
        ...(job.salaryMin && {
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: job.salaryCurrency || 'DOP',
            value: {
              '@type': 'QuantitativeValue',
              value: job.salaryMin,
              ...(job.salaryMax && { maxValue: job.salaryMax }),
              unitText: 'MONTH',
            },
          },
        }),
        directApply: true,
      }
    : null;

  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Empleos',
        item: `${SITE_URL}/empleos`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: job?.title || slug,
        item: `${SITE_URL}/empleos/${slug}`,
      },
    ],
  };

  return (
    <>
      {jobPostingSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <JobDetailClient
        slug={slug}
        initialJob={job}
        initialRelatedJobs={relatedJobs}
      />
    </>
  );
}

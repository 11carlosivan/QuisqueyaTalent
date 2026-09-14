import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ToastProvider } from '../components/Toast';

const SITE_URL = 'https://www.quisqueyatalent.com.do';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Quisqueya Talent | Bolsa de Empleo con IA para República Dominicana',
    template: '%s | Quisqueya Talent',
  },
  description:
    'Portal de empleo 100% gratuito para República Dominicana. Encuentra vacantes en Santo Domingo, Santiago y todo el país. Diseña tu CV profesional con asistencia de Inteligencia Artificial y compatibilidad ATS.',
  keywords: [
    'Empleos RD',
    'Trabajo República Dominicana',
    'Bolsa de Empleo Santo Domingo',
    'Vacantes Santiago',
    'Call Center RD',
    'Creador de CV gratis',
    'Quisqueya Talent',
    'Empleo Dominicana',
  ],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'es_DO',
    url: SITE_URL,
    siteName: 'Quisqueya Talent',
    title: 'Quisqueya Talent | Bolsa de Empleo con IA para República Dominicana',
    description:
      'Portal de empleo 100% gratuito. Encuentra vacantes, publica empleos y diseña tu CV profesional con IA. La plataforma #1 de empleo en República Dominicana.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Quisqueya Talent - Bolsa de Empleo con IA para República Dominicana',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quisqueya Talent | Empleo con IA en República Dominicana',
    description:
      'Portal de empleo 100% gratuito. Encuentra vacantes, publica empleos y diseña tu CV profesional con IA.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'googleb2dbd89cded0686c',
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-3CS24G6VMD';
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
        {/* Google Analytics 4 */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
        {/* Meta Pixel (Facebook & Instagram) */}
        {META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
      </head>
      <body className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#0b1c30] antialiased">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

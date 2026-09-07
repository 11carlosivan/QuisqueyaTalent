import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'Quisqueya Talent | Bolsa de Empleo con IA para República Dominicana',
  description:
    'Portal de empleo 100% gratuito para República Dominicana. Encuentra vacantes en Santo Domingo, Santiago y todo el país. Diseña tu CV profesional con asistencia de Inteligencia Artificial y compatibilidad ATS.',
  keywords: [
    'Empleos RD',
    'Trabajo República Dominicana',
    'Bolsa de Empleo Santo Domingo',
    'Vacantes Santiago',
    'Call Center RD',
    'Creador de CV gratis',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#0b1c30] antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

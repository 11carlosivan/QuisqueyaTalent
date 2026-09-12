const sharp = require('sharp');
const fs = require('fs');

async function generateOgImage() {
  const width = 1200;
  const height = 630;

  // Let's create a light, clean, executive card with brand colors (blue #2563eb / white / slate-900)
  // that matches the platform's clean aesthetic and looks incredible on social networks.
  
  // Render logo.svg
  const logoBuf = await sharp('public/logo.svg')
    .resize(600)
    .png()
    .toBuffer();

  const svgTemplate = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="60%" stop-color="#f8fafc" />
          <stop offset="100%" stop-color="#eff6ff" />
        </linearGradient>
        <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#2563eb" />
          <stop offset="100%" stop-color="#1d4ed8" />
        </linearGradient>
      </defs>

      <!-- Background with subtle border -->
      <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
      <rect x="24" y="24" width="1152" height="582" rx="28" fill="none" stroke="#e2e8f0" stroke-width="2" />

      <!-- Top decorative bar -->
      <rect x="24" y="24" width="1152" height="8" rx="4" fill="#2563eb" />

      <!-- Category Pill Badge -->
      <g transform="translate(420, 80)">
        <rect x="0" y="0" width="360" height="42" rx="21" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5" />
        <text x="180" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#2563eb" text-anchor="middle" letter-spacing="1.2">
          🇩🇴 BOLSA DE EMPLEO CON INTELIGENCIA ARTIFICIAL
        </text>
      </g>

      <!-- Headline -->
      <text x="600" y="375" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="800" fill="#0f172a" text-anchor="middle">
        La plataforma líder de empleo y talento en República Dominicana
      </text>

      <!-- Subtitle Description -->
      <text x="600" y="420" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="500" fill="#64748b" text-anchor="middle">
        Encuentra vacantes en Santo Domingo, Santiago y todo el país • Diseña tu CV con IA
      </text>

      <!-- Badges row -->
      <g transform="translate(195, 465)">
        <!-- Pill 1 -->
        <rect x="0" y="0" width="245" height="48" rx="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
        <text x="122" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#1e293b" text-anchor="middle">
          ✨ CV Profesional con IA
        </text>

        <!-- Pill 2 -->
        <rect x="270" y="0" width="270" height="48" rx="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
        <text x="405" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#1e293b" text-anchor="middle">
          📍 Vacantes en Todo el País
        </text>

        <!-- Pill 3 -->
        <rect x="565" y="0" width="245" height="48" rx="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
        <text x="687" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#1e293b" text-anchor="middle">
          🚀 100% Gratuito
        </text>
      </g>

      <!-- Bottom domain footer -->
      <text x="600" y="565" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#2563eb" text-anchor="middle" letter-spacing="0.8">
        www.quisqueyatalent.com.do
      </text>
    </svg>
  `;

  const svgBuf = Buffer.from(svgTemplate);

  // Composite SVG and the centered Logo
  await sharp(svgBuf)
    .composite([
      {
        input: logoBuf,
        top: 155,
        left: 300,
      },
    ])
    .png({ quality: 95 })
    .toFile('public/og-image.png');

  console.log('OG image created successfully at public/og-image.png');
}

generateOgImage().catch(console.error);

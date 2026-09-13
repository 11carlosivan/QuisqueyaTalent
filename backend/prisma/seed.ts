import { PrismaClient, Role, JobType, WorkplaceType, ExperienceLevel, JobStatus, ApplicationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando carga de datos iniciales (Seed)...');

  // Limpiar datos existentes respetando foreign keys
  await prisma.auditLog.deleteMany({});
  await prisma.adSlot.deleteMany({});
  await prisma.applicationStatusHistory.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.savedJob.deleteMany({});
  await prisma.jobAlert.deleteMany({});
  await prisma.jobSkill.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.companyMember.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.resumeExperience.deleteMany({});
  await prisma.resumeEducation.deleteMany({});
  await prisma.resumeSkill.deleteMany({});
  await prisma.resumeLanguage.deleteMany({});
  await prisma.resumeCertification.deleteMany({});
  await prisma.resume.deleteMany({});
  await prisma.userProfile.deleteMany({});
  await prisma.user.deleteMany({});

  const adminPasswordHash = await bcrypt.hash('11712Ivandi', 10);
  const generalPasswordHash = await bcrypt.hash('password123', 10);

  // 1. Super Administrador Principal
  const adminUser = await prisma.user.create({
    data: {
      email: 'carlosivancastillofeliz@gmail.com',
      passwordHash: adminPasswordHash,
      role: Role.SUPER_ADMIN,
      isEmailVerified: true,
      profile: {
        create: {
          firstName: 'Carlos',
          lastName: 'Castillo',
          headline: 'Fundador & Super Administrador Quisqueya Talent',
          province: 'Distrito Nacional',
          city: 'Santo Domingo',
        },
      },
    },
  });

  const recruiterUser = await prisma.user.create({
    data: {
      email: 'reclutador@altice.com.do',
      passwordHash: generalPasswordHash,
      role: Role.COMPANY_OWNER,
      isEmailVerified: true,
      profile: {
        create: {
          firstName: 'Rosa',
          lastName: 'Méndez',
          phone: '+1 809-555-0199',
          headline: 'Gerente de Atracción de Talento | Altice Dominicana',
          province: 'Distrito Nacional',
          city: 'Santo Domingo',
        },
      },
    },
  });

  const candidateUser = await prisma.user.create({
    data: {
      email: 'candidato@quisqueyatalent.com',
      passwordHash: generalPasswordHash,
      role: Role.JOB_SEEKER,
      isEmailVerified: true,
      profile: {
        create: {
          firstName: 'Carlos',
          lastName: 'Rosario',
          phone: '+1 809-555-3421',
          documentId: '402-2345678-9',
          headline: 'Senior Full Stack Software Engineer | React, Node.js & Cloud',
          bio: 'Ingeniero de software con más de 6 años de experiencia desarrollando aplicaciones web escalables y plataformas de alto rendimiento en República Dominicana y de forma remota.',
          province: 'Santo Domingo',
          city: 'Santo Domingo Este',
          linkedinUrl: 'https://linkedin.com/in/carlos-rosario-rd',
          portfolioUrl: 'https://carlosrosario.dev',
        },
      },
    },
  });

  console.log('✅ Usuarios demo creados.');

  // 2. Empresas Dominicanas
  const altice = await prisma.company.create({
    data: {
      name: 'Altice Dominicana',
      slug: 'altice-dominicana',
      rnc: '101023456',
      industry: 'Telecomunicaciones & Tecnología',
      description: 'Líder en telecomunicaciones y conectividad digital en República Dominicana, ofreciendo soluciones móviles, fijas y corporativas.',
      logoUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop',
      websiteUrl: 'https://www.altice.com.do',
      phone: '+1 809-859-0000',
      email: 'talento@altice.com.do',
      province: 'Distrito Nacional',
      city: 'Santo Domingo',
      address: 'Av. Winston Churchill #1099, Torre Altice',
      isVerified: true,
      members: {
        create: {
          userId: recruiterUser.id,
          role: Role.COMPANY_OWNER,
        },
      },
    },
  });

  const bhd = await prisma.company.create({
    data: {
      name: 'Banco BHD',
      slug: 'banco-bhd',
      rnc: '101004321',
      industry: 'Banca y Servicios Financieros',
      description: 'Institución bancaria líder comprometida con el progreso de las personas y la transformación digital financiera de República Dominicana.',
      logoUrl: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?w=200&h=200&fit=crop',
      websiteUrl: 'https://www.bhd.com.do',
      province: 'Distrito Nacional',
      city: 'Santo Domingo',
      isVerified: true,
    },
  });

  const concentrix = await prisma.company.create({
    data: {
      name: 'Concentrix CVG Dominicana',
      slug: 'concentrix-dominicana',
      rnc: '130889211',
      industry: 'BPO & Contact Center',
      description: 'Compañía global de servicios tecnológicos y atención a clientes de clase mundial con sedes en Santo Domingo y Santiago.',
      logoUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200&h=200&fit=crop',
      websiteUrl: 'https://www.concentrix.com',
      province: 'Santiago',
      city: 'Santiago de los Caballeros',
      isVerified: true,
    },
  });

  console.log('✅ Empresas demo creadas.');

  // 3. Vacantes Publicadas
  const job1 = await prisma.job.create({
    data: {
      companyId: altice.id,
      title: 'Especialista en Ciberseguridad & Cloud',
      slug: 'especialista-en-ciberseguridad-cloud-santo-domingo',
      category: 'Tecnología e Informática',
      description: 'Buscamos un Ingeniero de Ciberseguridad para proteger nuestra infraestructura de telecomunicaciones y diseñar arquitecturas seguras en la nube (AWS / Azure).',
      responsibilities: '• Monitorear incidentes y amenazas en el SOC 24/7.\n• Implementar directivas de seguridad perimetral y Zero Trust.\n• Coordinar auditorías de vulnerabilidades y pruebas de penetración.',
      requirements: '• Licenciatura o Ingeniería en Sistemas, Telemática o afines.\n• 3+ años en seguridad informática y redes.\n• Certificaciones CISSP, CompTIA Security+ o AWS Security (deseable).\n• Inglés técnico intermedio.',
      benefits: '• Salario competitivo acorde al mercado.\n• Seguro médico complementario 100% cubierto.\n• Plan de telecomunicaciones y subsidio de internet.\n• Bono anual por desempeño.',
      jobType: JobType.FULL_TIME,
      workplaceType: WorkplaceType.HYBRID,
      experienceLevel: ExperienceLevel.MID,
      salaryMin: 110000,
      salaryMax: 145000,
      salaryCurrency: 'DOP',
      salaryPeriod: 'MONTHLY',
      isSalaryPublic: true,
      province: 'Distrito Nacional',
      city: 'Santo Domingo',
      status: JobStatus.PUBLISHED,
      featured: true,
      urgent: false,
      skills: {
        create: [
          { skillName: 'Ciberseguridad' },
          { skillName: 'AWS' },
          { skillName: 'Firewalls' },
          { skillName: 'SIEM' },
          { skillName: 'Ethical Hacking' },
        ],
      },
    },
  });

  const job2 = await prisma.job.create({
    data: {
      companyId: altice.id,
      title: 'Desarrollador Frontend React & TypeScript',
      slug: 'desarrollador-frontend-react-typescript-santo-domingo',
      category: 'Tecnología e Informática',
      description: 'Únete a nuestro equipo de canales digitales para crear interfaces modernas, accesibles y de alto impacto para millones de usuarios dominicanos.',
      responsibilities: '• Desarrollar interfaces web en React y Next.js.\n• Consumir APIs RESTful y GraphQL.\n• Garantizar un óptimo rendimiento en dispositivos móviles y SEO.',
      requirements: '• Dominio sólido de JavaScript moderno, TypeScript, React y Tailwind CSS.\n• Manejo de Git y trabajo en metodologías ágiles Scrum.\n• Experiencia construyendo arquitecturas componentizadas.',
      benefits: '• Modalidad de trabajo híbrida / flexible.\n• Descuentos en productos y servicios Altice.\n• Acceso a plataformas de capacitación online.',
      jobType: JobType.FULL_TIME,
      workplaceType: WorkplaceType.HYBRID,
      experienceLevel: ExperienceLevel.SENIOR,
      salaryMin: 95000,
      salaryMax: 130000,
      salaryCurrency: 'DOP',
      salaryPeriod: 'MONTHLY',
      isSalaryPublic: true,
      province: 'Distrito Nacional',
      city: 'Santo Domingo',
      status: JobStatus.PUBLISHED,
      featured: true,
      urgent: true,
      skills: {
        create: [
          { skillName: 'React' },
          { skillName: 'TypeScript' },
          { skillName: 'Next.js' },
          { skillName: 'Tailwind CSS' },
          { skillName: 'REST API' },
        ],
      },
    },
  });

  const job3 = await prisma.job.create({
    data: {
      companyId: concentrix.id,
      title: 'Supervisor de Operaciones Bilingüe (Inglés C1)',
      slug: 'supervisor-de-operaciones-bilingue-santiago',
      category: 'Call Center y BPO',
      description: 'Lidera un equipo de representantes de servicio al cliente para cuentas internacionales de tecnología y finanzas.',
      responsibilities: '• Monitorear KPIs operativos de calidad, CSAT y resolución en primera llamada.\n• Coaching y retroalimentación continua al equipo.\n• Reportes ejecutivos a gerencia en Estados Unidos.',
      requirements: '• Dominio avanzado del inglés (85% o nivel C1 oral y escrito).\n• Mínimo 1 año de experiencia como Supervisor o Team Lead en Call Center.\n• Habilidades de liderazgo y resolución de conflictos.',
      benefits: '• Bono por métricas mensuales y puntualidad.\n• Transporte corporativo nocturno.\n• Oportunidades de crecimiento y estabilidad laboral.',
      jobType: JobType.FULL_TIME,
      workplaceType: WorkplaceType.ON_SITE,
      experienceLevel: ExperienceLevel.MID,
      salaryMin: 65000,
      salaryMax: 85000,
      salaryCurrency: 'DOP',
      salaryPeriod: 'MONTHLY',
      isSalaryPublic: true,
      province: 'Santiago',
      city: 'Santiago de los Caballeros',
      status: JobStatus.PUBLISHED,
      featured: false,
      urgent: true,
      skills: {
        create: [
          { skillName: 'Inglés Avanzado' },
          { skillName: 'Liderazgo' },
          { skillName: 'Customer Service' },
          { skillName: 'Gestión de KPIs' },
        ],
      },
    },
  });

  const job4 = await prisma.job.create({
    data: {
      companyId: bhd.id,
      title: 'Oficial de Negocios y Cuentas Corporativas B2B',
      slug: 'oficial-de-negocios-cuentas-corporativas-santo-domingo',
      category: 'Banca y Ventas',
      description: 'Administración y prospección de cartera de clientes comerciales, ofreciendo soluciones de crédito, tesorería y nómina empresarial.',
      responsibilities: '• Captación y fidelización de empresas medianas y grandes.\n• Análisis básico de estados financieros para solicitudes de crédito comercial.',
      requirements: '• Graduado de Administración, Economía, Finanzas o Mercadeo.\n• 2 años en ventas de servicios financieros o intangibles B2B.\n• Vehículo propio y licencia de conducir al día.',
      benefits: '• Sueldo fijo + comisiones sin tope por colocación.\n• Asignación de combustible y depreciación de vehículo.',
      jobType: JobType.FULL_TIME,
      workplaceType: WorkplaceType.ON_SITE,
      experienceLevel: ExperienceLevel.MID,
      salaryMin: 55000,
      salaryMax: 90000,
      salaryCurrency: 'DOP',
      salaryPeriod: 'MONTHLY',
      isSalaryPublic: true,
      province: 'Distrito Nacional',
      city: 'Santo Domingo',
      status: JobStatus.PUBLISHED,
      featured: false,
      urgent: false,
      skills: {
        create: [
          { skillName: 'Ventas B2B' },
          { skillName: 'Análisis Financiero' },
          { skillName: 'Negociación' },
          { skillName: 'Prospección Comercial' },
        ],
      },
    },
  });

  console.log('✅ Vacantes publicadas creadas.');

  // 4. CV Profesional del Candidato
  const resume = await prisma.resume.create({
    data: {
      userId: candidateUser.id,
      title: 'Currículum Principal - Ingeniero de Software',
      summary: 'Ingeniero de Software Full Stack apasionado por construir productos digitales de clase mundial. Especializado en ecosistemas JavaScript/TypeScript, React, Node.js y arquitecturas escalables en la nube.',
      templateName: 'modern',
      isDefault: true,
      atsScore: 94,
      experiences: {
        create: [
          {
            company: 'Tech Caribe Solutions',
            position: 'Senior Full Stack Developer',
            startDate: '2022-01',
            endDate: null,
            isCurrent: true,
            description: 'Liderazgo técnico en el diseño de microservicios e interfaces de usuario para clientes bancarios y de retail en el Caribe, logrando un 40% de reducción en tiempos de carga.',
            city: 'Santo Domingo',
            country: 'República Dominicana',
            sortOrder: 1,
          },
          {
            company: 'Innova Web RD',
            position: 'Desarrollador Web Frontend',
            startDate: '2019-06',
            endDate: '2021-12',
            isCurrent: false,
            description: 'Desarrollo de portales web interactivos utilizando React, Redux y Tailwind CSS con integración a pasarelas de pago locales (Azul, CardNet).',
            city: 'Santo Domingo',
            country: 'República Dominicana',
            sortOrder: 2,
          },
        ],
      },
      education: {
        create: [
          {
            institution: 'Instituto Tecnológico de Santo Domingo (INTEC)',
            degree: 'Ingeniería de Software',
            fieldOfStudy: 'Ciencias de la Computación',
            startDate: '2015-08',
            endDate: '2019-10',
            isCurrent: false,
            sortOrder: 1,
          },
        ],
      },
      skills: {
        create: [
          { name: 'TypeScript', level: 'Experto' },
          { name: 'React / Next.js', level: 'Experto' },
          { name: 'Node.js / Express', level: 'Avanzado' },
          { name: 'MySQL & PostgreSQL', level: 'Avanzado' },
          { name: 'Tailwind CSS', level: 'Experto' },
          { name: 'Docker & AWS', level: 'Intermedio' },
        ],
      },
      languages: {
        create: [
          { name: 'Español', proficiency: 'Nativo' },
          { name: 'Inglés', proficiency: 'Avanzado / Profesional (C1)' },
        ],
      },
      certifications: {
        create: [
          {
            name: 'AWS Certified Solutions Architect – Associate',
            issuingOrganization: 'Amazon Web Services',
            issueDate: '2023-05',
          },
        ],
      },
    },
  });

  console.log('✅ CV Profesional con puntuación ATS creado.');

  // 5. Postulación Demo
  const app1 = await prisma.application.create({
    data: {
      jobId: job2.id,
      userId: candidateUser.id,
      resumeId: resume.id,
      status: ApplicationStatus.INTERVIEWING,
      coverLetter: 'Estimado equipo de Altice Dominicana: Les escribo con gran entusiasmo para postularme a la vacante de Desarrollador Frontend React...',
      rating: 5,
      recruiterNotes: 'Perfil técnico sobresaliente. Excelente comunicación en la llamada de filtro. Se agendó entrevista técnica para el jueves.',
      statusHistory: {
        create: [
          { status: ApplicationStatus.APPLIED, notes: 'Postulación recibida en la plataforma' },
          { status: ApplicationStatus.REVIEWING, notes: 'CV revisado por Rosa Méndez' },
          { status: ApplicationStatus.SHORTLISTED, notes: 'Cumple con el 100% de los requisitos técnicos' },
          { status: ApplicationStatus.INTERVIEWING, notes: 'Entrevista técnica coordinada' },
        ],
      },
    },
  });

  // Guardar empleo favorito
  await prisma.savedJob.create({
    data: {
      userId: candidateUser.id,
      jobId: job1.id,
    },
  });

  // 6. AdSlots de Google AdSense
  await prisma.adSlot.createMany({
    data: [
      {
        slotCode: 'HOME_TOP',
        name: 'Banner Superior - Portada',
        pageLocation: 'Homepage / Entre Hero y Buscador',
        adProvider: 'GOOGLE_ADSENSE',
        publisherId: 'ca-pub-1234567890123456',
        slotId: '1234567890',
        isActive: true,
      },
      {
        slotCode: 'SEARCH_MIDDLE',
        name: 'In-Feed Búsqueda de Empleos',
        pageLocation: 'Listado de empleos / Cada 5 resultados',
        adProvider: 'GOOGLE_ADSENSE',
        publisherId: 'ca-pub-1234567890123456',
        slotId: '2345678901',
        isActive: true,
      },
      {
        slotCode: 'JOB_SIDEBAR',
        name: 'Sidebar en Detalle de Empleo',
        pageLocation: 'Página de empleo / Columna lateral derecha',
        adProvider: 'GOOGLE_ADSENSE',
        publisherId: 'ca-pub-1234567890123456',
        slotId: '3456789012',
        isActive: true,
      },
      {
        slotCode: 'CV_BUILDER_BOTTOM',
        name: 'Banner Inferior Creador de CV',
        pageLocation: 'Pie del editor de CV',
        adProvider: 'GOOGLE_ADSENSE',
        publisherId: 'ca-pub-1234567890123456',
        slotId: '4567890123',
        isActive: true,
      },
    ],
  });

  console.log('✅ Posiciones de publicidad (AdSlots) configuradas.');
  console.log('🎉 Seed completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

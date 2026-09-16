/**
 * clean-demo-data.ts
 * Elimina todos los datos demo de la base de datos de PRODUCCIÓN,
 * conservando únicamente el Super Administrador.
 *
 * Uso:
 *   DATABASE_URL="mysql://..." npx ts-node -r tsconfig-paths/register prisma/clean-demo-data.ts
 */
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'carlosivancastillofeliz@gmail.com';
const ADMIN_PASS = '11712Ivandi';

async function main() {
  console.log('🧹 Iniciando limpieza de datos demo en producción...');
  console.log(`✅ Se asegurará y conservará: ${ADMIN_EMAIL}`);

  // Asegurar que el Super Administrador existe y tiene las credenciales correctas
  const adminPasswordHash = await bcrypt.hash(ADMIN_PASS, 10);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      passwordHash: adminPasswordHash,
      role: Role.SUPER_ADMIN,
      isActive: true,
      isEmailVerified: true,
    },
    create: {
      email: ADMIN_EMAIL,
      passwordHash: adminPasswordHash,
      role: Role.SUPER_ADMIN,
      isActive: true,
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
    include: { profile: true },
  });
  console.log(`✅ Admin verificado/creado con ID: ${admin.id}. Procediendo con la limpieza...`);

  // --- Eliminar en orden respetando foreign keys ---

  // 1. Logs de auditoría
  const logs = await prisma.auditLog.deleteMany({});
  console.log(`🗑️  AuditLog eliminados: ${logs.count}`);

  // 2. Historial de estado de postulaciones
  const statusHistory = await prisma.applicationStatusHistory.deleteMany({});
  console.log(`🗑️  ApplicationStatusHistory eliminados: ${statusHistory.count}`);

  // 3. Postulaciones
  const apps = await prisma.application.deleteMany({});
  console.log(`🗑️  Applications eliminadas: ${apps.count}`);

  // 4. Empleos guardados
  const saved = await prisma.savedJob.deleteMany({});
  console.log(`🗑️  SavedJobs eliminados: ${saved.count}`);

  // 5. Alertas de empleo
  const alerts = await prisma.jobAlert.deleteMany({});
  console.log(`🗑️  JobAlerts eliminados: ${alerts.count}`);

  // 6. Skills de vacantes
  const jobSkills = await prisma.jobSkill.deleteMany({});
  console.log(`🗑️  JobSkills eliminados: ${jobSkills.count}`);

  // 7. Vacantes
  const jobs = await prisma.job.deleteMany({});
  console.log(`🗑️  Jobs eliminados: ${jobs.count}`);

  // 8. Miembros de empresa
  const members = await prisma.companyMember.deleteMany({});
  console.log(`🗑️  CompanyMembers eliminados: ${members.count}`);

  // 9. Empresas
  const companies = await prisma.company.deleteMany({});
  console.log(`🗑️  Companies eliminadas: ${companies.count}`);

  // 10. Certificaciones, skills, idiomas, educación y experiencias de CV
  await prisma.resumeCertification.deleteMany({});
  await prisma.resumeSkill.deleteMany({});
  await prisma.resumeLanguage.deleteMany({});
  await prisma.resumeEducation.deleteMany({});
  await prisma.resumeExperience.deleteMany({});

  // 11. CVs
  const resumes = await prisma.resume.deleteMany({});
  console.log(`🗑️  Resumes eliminados: ${resumes.count}`);

  // 12. Perfiles y usuarios demo (todos excepto el admin)
  const deletedProfiles = await prisma.userProfile.deleteMany({
    where: { userId: { not: admin.id } },
  });
  console.log(`🗑️  UserProfiles demo eliminados: ${deletedProfiles.count}`);

  const deletedUsers = await prisma.user.deleteMany({
    where: { id: { not: admin.id } },
  });
  console.log(`🗑️  Users demo eliminados: ${deletedUsers.count}`);

  // 13. AdSlots (datos de configuración de prueba)
  const adSlots = await prisma.adSlot.deleteMany({});
  console.log(`🗑️  AdSlots eliminados: ${adSlots.count}`);

  // 14. Crear / Conservar la Empresa Oficial "Quisqueya Talent" vinculada al Admin
  const officialCompany = await prisma.company.upsert({
    where: { slug: 'quisqueyatalent' },
    update: { isVerified: true },
    create: {
      name: 'Quisqueya Talent',
      slug: 'quisqueyatalent',
      rnc: '101000001',
      industry: 'Servicios de Empleo y Reclutamiento',
      description:
        'Cuenta oficial y verificada de Quisqueya Talent. Publicamos oportunidades laborales y vacantes verificadas para conectar el mejor talento de la República Dominicana con organizaciones líderes.',
      logoUrl: '/uploads/logo-quisqueya-talent.png',
      province: 'Distrito Nacional',
      city: 'Santo Domingo',
      address: 'Av. Winston Churchill, Santo Domingo, D.N.',
      email: 'contacto@quisqueyatalent.com.do',
      phone: '+1 809-555-0100',
      websiteUrl: 'https://quisqueyatalent.com.do',
      isVerified: true,
    },
  });

  await prisma.companyMember.upsert({
    where: {
      companyId_userId: {
        companyId: officialCompany.id,
        userId: admin.id,
      },
    },
    update: { role: Role.COMPANY_OWNER },
    create: {
      companyId: officialCompany.id,
      userId: admin.id,
      role: Role.COMPANY_OWNER,
    },
  });
  console.log(`🏛️  Empresa oficial Quisqueya Talent asegurada y vinculada a ${ADMIN_EMAIL}`);

  console.log('');
  console.log('🎉 Limpieza completada exitosamente.');
  console.log(`✅ Base de datos limpia. Cuenta oficial Quisqueya Talent vinculada a ${ADMIN_EMAIL} (SUPER_ADMIN)`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante la limpieza:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

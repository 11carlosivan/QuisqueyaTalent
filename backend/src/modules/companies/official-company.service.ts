import { Role } from '@prisma/client';
import prisma from '../../config/prisma';

export const OFFICIAL_COMPANY_SLUG = 'quisqueyatalent';
export const ADMIN_EMAIL = 'carlosivancastillofeliz@gmail.com';

export class OfficialCompanyService {
  /**
   * Garantiza que la empresa oficial "Quisqueya Talent" exista y esté
   * vinculada al Super Administrador con rol COMPANY_OWNER.
   */
  static async ensureOfficialCompany() {
    try {
      // 1. Buscar si ya existe la empresa
      let company = await prisma.company.findUnique({
        where: { slug: OFFICIAL_COMPANY_SLUG },
      });

      if (!company) {
        company = await prisma.company.create({
          data: {
            name: 'Quisqueya Talent',
            slug: OFFICIAL_COMPANY_SLUG,
            rnc: '101000001',
            industry: 'Servicios de Empleo y Reclutamiento',
            description:
              'Cuenta oficial y verificada de Quisqueya Talent. Publicamos oportunidades laborales y vacantes verificadas para conectar el mejor talento de la República Dominicana con organizaciones líderes.',
            logoUrl: '/icono.svg',
            province: 'Distrito Nacional',
            city: 'Santo Domingo',
            address: 'Av. Winston Churchill, Santo Domingo, D.N.',
            email: 'contacto@quisqueyatalent.com.do',
            phone: '+1 809-555-0100',
            websiteUrl: 'https://quisqueyatalent.com.do',
            isVerified: true,
          },
        });
        console.log(`🏛️ Empresa oficial Quisqueya Talent creada con ID: ${company.id}`);
      } else {
        // Asegurar que esté verificada y con el icono oficial
        const updates: any = {};
        if (!company.isVerified) updates.isVerified = true;
        if (company.logoUrl !== '/icono.svg') {
          updates.logoUrl = '/icono.svg';
        }

        if (Object.keys(updates).length > 0) {
          company = await prisma.company.update({
            where: { id: company.id },
            data: updates,
          });
        }
      }

      // 2. Vincular con el Super Admin si existe el usuario
      const adminUser = await prisma.user.findUnique({
        where: { email: ADMIN_EMAIL },
      });

      if (adminUser) {
        const membership = await prisma.companyMember.findUnique({
          where: {
            companyId_userId: {
              companyId: company.id,
              userId: adminUser.id,
            },
          },
        });

        if (!membership) {
          await prisma.companyMember.create({
            data: {
              companyId: company.id,
              userId: adminUser.id,
              role: Role.COMPANY_OWNER,
            },
          });
          console.log(`🔗 Empresa oficial vinculada a Super Admin: ${ADMIN_EMAIL}`);
        }
      }

      // 3. Garantizar registro inicial de AiJobSetting
      const setting = await prisma.aiJobSetting.findUnique({
        where: { id: 'default' },
      });

      if (!setting) {
        await prisma.aiJobSetting.create({
          data: {
            id: 'default',
            isActive: false, // Inicia en pausa por seguridad hasta que el admin la active
            jobsPerHour: 2,
            publishMode: 'DRAFT',
            maxDaysOld: 30,
            officialCompanyId: company.id,
          },
        });
      } else if (!setting.officialCompanyId) {
        await prisma.aiJobSetting.update({
          where: { id: 'default' },
          data: { officialCompanyId: company.id },
        });
      }

      return company;
    } catch (error) {
      console.error('Error asegurando empresa oficial Quisqueya Talent:', error);
      return null;
    }
  }

  /**
   * Obtiene la empresa oficial Quisqueya Talent
   */
  static async getOfficialCompany() {
    let company = await prisma.company.findUnique({
      where: { slug: OFFICIAL_COMPANY_SLUG },
    });

    if (!company) {
      company = await this.ensureOfficialCompany();
    } else if (company.logoUrl !== '/icono.svg' || !company.isVerified) {
      company = await prisma.company.update({
        where: { id: company.id },
        data: {
          logoUrl: '/icono.svg',
          isVerified: true,
        },
      });
    }

    return company;
  }
}

export default OfficialCompanyService;

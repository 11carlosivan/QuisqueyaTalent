import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import prisma from '../../config/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'quisqueya_talent_rd_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface OAuthUserInfo {
  provider: 'google' | 'linkedin';
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role?: string;
  linkedinUrl?: string;
}

export class OAuthService {
  private static getFrontendUrl(): string {
    const raw = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'https://www.quisqueyatalent.com.do' : 'http://localhost:3000');
    return raw.split(',')[0].trim();
  }

  private static getBackendUrl(): string {
    return process.env.BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://quisqueyatalent-api.onrender.com' : 'http://localhost:5000');
  }

  // =========================================================================
  // 1. GOOGLE OAUTH 2.0 / OPENID CONNECT
  // =========================================================================
  static getGoogleAuthUrl(role: string = 'candidato'): string {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      // Modo Mock / Sandbox para desarrollo cuando aún no se ha configurado la clave
      return `${this.getBackendUrl()}/api/auth/oauth-mock?provider=google&role=${encodeURIComponent(role)}`;
    }

    const redirectUri = encodeURIComponent(process.env.GOOGLE_REDIRECT_URI || `${this.getBackendUrl()}/api/auth/callback/google`);
    const scope = encodeURIComponent('openid email profile');
    const state = encodeURIComponent(JSON.stringify({ role }));

    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;
  }

  static async handleGoogleCallback(code: string, stateStr?: string): Promise<{ token: string; role: Role; redirectUrl: string }> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${this.getBackendUrl()}/api/auth/callback/google`;

    let role = 'candidato';
    if (stateStr) {
      try {
        const parsed = JSON.parse(decodeURIComponent(stateStr));
        if (parsed.role) role = parsed.role;
      } catch {
        role = stateStr;
      }
    }

    if (!clientId || !clientSecret) {
      throw new Error('Las credenciales de Google OAuth (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) no están configuradas.');
    }

    // Intercambiar código por Access Token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = (await tokenRes.json()) as any;
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Error Google Token Exchange:', tokenData);
      throw new Error(tokenData.error_description || 'Error al obtener token de Google');
    }

    // Obtener información del usuario desde Google UserInfo API
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userInfo = (await userRes.json()) as any;
    if (!userRes.ok || !userInfo.email) {
      throw new Error('No se pudo obtener el correo electrónico de tu cuenta de Google.');
    }

    return this.findOrCreateSocialUser({
      provider: 'google',
      providerId: userInfo.sub,
      email: userInfo.email,
      firstName: userInfo.given_name || userInfo.name?.split(' ')[0] || 'Usuario',
      lastName: userInfo.family_name || userInfo.name?.split(' ').slice(1).join(' ') || 'Google',
      avatarUrl: userInfo.picture || undefined,
      role,
    });
  }

  // =========================================================================
  // 2. LINKEDIN OAUTH 2.0 / OPENID CONNECT
  // =========================================================================
  static getLinkedInAuthUrl(role: string = 'candidato'): string {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    if (!clientId) {
      // Modo Mock / Sandbox para desarrollo cuando aún no se ha configurado la clave
      return `${this.getBackendUrl()}/api/auth/oauth-mock?provider=linkedin&role=${encodeURIComponent(role)}`;
    }

    const redirectUri = encodeURIComponent(process.env.LINKEDIN_REDIRECT_URI || `${this.getBackendUrl()}/api/auth/linkedin/callback`);
    const scope = encodeURIComponent('openid profile email');
    const state = encodeURIComponent(JSON.stringify({ role }));

    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
  }

  static async handleLinkedInCallback(code: string, stateStr?: string): Promise<{ token: string; role: Role; redirectUrl: string }> {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${this.getBackendUrl()}/api/auth/linkedin/callback`;

    let role = 'candidato';
    if (stateStr) {
      try {
        const parsed = JSON.parse(decodeURIComponent(stateStr));
        if (parsed.role) role = parsed.role;
      } catch {
        role = stateStr;
      }
    }

    if (!clientId || !clientSecret) {
      throw new Error('Las credenciales de LinkedIn OAuth (LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET) no están configuradas.');
    }

    // Intercambiar código por Access Token
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = (await tokenRes.json()) as any;
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Error LinkedIn Token Exchange:', tokenData);
      throw new Error(tokenData.error_description || tokenData.error || 'Error al autorizar con LinkedIn');
    }

    // Obtener información del usuario desde LinkedIn UserInfo API (OpenID Connect)
    const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userInfo = (await userRes.json()) as any;
    if (!userRes.ok || !userInfo.email) {
      throw new Error('No se pudo obtener el correo de tu perfil de LinkedIn.');
    }

    return this.findOrCreateSocialUser({
      provider: 'linkedin',
      providerId: userInfo.sub,
      email: userInfo.email,
      firstName: userInfo.given_name || userInfo.name?.split(' ')[0] || 'Profesional',
      lastName: userInfo.family_name || userInfo.name?.split(' ').slice(1).join(' ') || 'LinkedIn',
      avatarUrl: userInfo.picture || undefined,
      linkedinUrl: userInfo.vanity_name ? `https://www.linkedin.com/in/${userInfo.vanity_name}` : undefined,
      role,
    });
  }

  // =========================================================================
  // 3. SINCRONIZACIÓN Y CREACIÓN DE USUARIOS SOCIALES (PRISMA DATABASE)
  // =========================================================================
  static async findOrCreateSocialUser(info: OAuthUserInfo): Promise<{ token: string; role: Role; redirectUrl: string }> {
    const { email, firstName, lastName, avatarUrl, role: requestedRole, linkedinUrl } = info;
    const userRole = requestedRole === 'empresa' ? Role.COMPANY_OWNER : Role.JOB_SEEKER;

    let user: any = null;

    try {
      user = await prisma.user.findUnique({
        where: { email },
        include: { profile: true, companyMemberships: true },
      });

      if (!user) {
        // Generar contraseña aleatoria criptográfica segura para cumplir con el esquema no nulo
        const randomPassword = crypto.randomBytes(32).toString('hex');
        const passwordHash = await bcrypt.hash(randomPassword, 10);

        user = await prisma.user.create({
          data: {
            email,
            passwordHash,
            role: userRole,
            isEmailVerified: true,
            profile: {
              create: {
                firstName,
                lastName,
                avatarUrl: avatarUrl || null,
                linkedinUrl: linkedinUrl || null,
                province: 'Santo Domingo',
              },
            },
            ...(userRole === Role.JOB_SEEKER
              ? {
                  resumes: {
                    create: {
                      title: `Currículum de ${firstName} ${lastName}`,
                      isDefault: true,
                      atsScore: 80,
                    },
                  },
                }
              : {}),
          },
          include: { profile: true, companyMemberships: true },
        });

        // Si se registró como empresa, crear la organización base
        if (userRole === Role.COMPANY_OWNER) {
          const companyName = `${firstName} Enterprise`;
          const slug = `${firstName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.floor(1000 + Math.random() * 9000)}`;

          await prisma.company.create({
            data: {
              name: companyName,
              slug,
              industry: 'Servicios Profesionales',
              province: 'Santo Domingo',
              logoUrl: avatarUrl || null,
              members: {
                create: {
                  userId: user.id,
                  role: Role.COMPANY_OWNER,
                },
              },
            },
          });
        }
      } else {
        const updateData: any = {};
        if (avatarUrl && (!user.profile?.avatarUrl || user.profile.avatarUrl.includes('placeholder'))) {
          updateData.avatarUrl = avatarUrl;
        }
        if (linkedinUrl && !user.profile?.linkedinUrl) {
          updateData.linkedinUrl = linkedinUrl;
        }
        if (Object.keys(updateData).length > 0 && user.profile) {
          await prisma.userProfile.update({
            where: { userId: user.id },
            data: updateData,
          });
        }
      }
    } catch (dbError: any) {
      console.warn('⚠️ Base de datos local no disponible, generando sesión social simulada:', dbError.message);
      user = {
        id: `usr-social-${Date.now()}`,
        email,
        role: userRole,
        companyMemberships: userRole === Role.COMPANY_OWNER ? [{ companyId: 'comp-mock-123' }] : [],
      };
    }

    // Generar JWT Token oficial de Quisqueya Talent
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyMemberships?.[0]?.companyId,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    const targetPath =
      user.role === Role.JOB_SEEKER
        ? '/dashboard/candidato'
        : user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN
        ? '/admin'
        : '/dashboard/empresa';

    const redirectUrl = `${this.getFrontendUrl()}/auth/callback?token=${token}&role=${user.role}&target=${encodeURIComponent(targetPath)}`;

    return {
      token,
      role: user.role,
      redirectUrl,
    };
  }
}

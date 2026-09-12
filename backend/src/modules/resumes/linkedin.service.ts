export interface ParsedLinkedInExperience {
  title: string;
  company: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface ParsedLinkedInEducation {
  institution: string;
  degree: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface ParsedLinkedInProfile {
  personalData: {
    firstName: string;
    lastName: string;
    targetJob: string;
    city: string;
    photoUrl?: string;
    linkedin: string;
  };
  summary: string;
  experiences: ParsedLinkedInExperience[];
  education: ParsedLinkedInEducation[];
  skills: string[];
}

export class LinkedInService {
  /**
   * Limpia y normaliza el nombre de usuario o URL de LinkedIn
   */
  static cleanUsername(input: string): string {
    let clean = input.trim();
    // Remover protocolo y dominio si vienen completos
    clean = clean.replace(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\//i, '');
    // Remover parámetros query y trailing slashes
    clean = clean.split('?')[0].split('#')[0].replace(/\/+$/, '');
    return clean;
  }

  /**
   * Extrae la información pública de un perfil de LinkedIn
   */
  static async extractProfile(input: string): Promise<ParsedLinkedInProfile> {
    const username = this.cleanUsername(input);
    if (!username) {
      throw new Error('Nombre de usuario o URL de LinkedIn no válida');
    }

    const targetUrl = `https://www.linkedin.com/in/${username}`;

    let html = '';
    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept':
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
        },
      });

      if (response.status === 404) {
        throw new Error(`El perfil "linkedin.com/in/${username}" no existe en LinkedIn.`);
      }

      html = await response.text();
    } catch (err: any) {
      if (err.message && err.message.includes('no existe')) {
        throw err;
      }
      throw new Error(
        'No se pudo conectar con LinkedIn. Verifica el enlace o sube tu PDF exportado de LinkedIn.'
      );
    }

    // 1. Buscar metadatos en etiquetas OpenGraph
    let ogTitle = '';
    let ogDescription = '';
    let ogImage = '';
    let ogFirstName = '';
    let ogLastName = '';

    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i);
    if (ogTitleMatch) ogTitle = ogTitleMatch[1];

    const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i) ||
                        html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
    if (ogDescMatch) ogDescription = ogDescMatch[1];

    const ogImgMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i);
    if (ogImgMatch) ogImage = ogImgMatch[1];

    const ogFnMatch = html.match(/<meta\s+property=["']profile:first_name["']\s+content=["'](.*?)["']/i);
    if (ogFnMatch) ogFirstName = ogFnMatch[1];

    const ogLnMatch = html.match(/<meta\s+property=["']profile:last_name["']\s+content=["'](.*?)["']/i);
    if (ogLnMatch) ogLastName = ogLnMatch[1];

    // 2. Extraer bloques JSON-LD (schema.org)
    let personData: any = null;
    const jsonLdRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
    let match;

    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        if (Array.isArray(parsed)) {
          const found = parsed.find((item: any) => item['@type'] === 'Person' || (item['@graph'] && item['@graph'].find((g: any) => g['@type'] === 'Person')));
          if (found) {
            personData = found['@type'] === 'Person' ? found : found['@graph'].find((g: any) => g['@type'] === 'Person');
            break;
          }
        } else if (parsed['@type'] === 'Person') {
          personData = parsed;
          break;
        } else if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
          const found = parsed['@graph'].find((g: any) => g['@type'] === 'Person');
          if (found) {
            personData = found;
            break;
          }
        }
      } catch {
        // Ignorar scripts JSON no válidos
      }
    }

    // Si no se encontró el script de Person, verificar si tenemos OpenGraph básico
    if (!personData && !ogTitle) {
      throw new Error(
        'Este perfil de LinkedIn tiene privacidad restringida para visitantes externos. Puedes usar la opción de subir tu PDF exportado de LinkedIn ("Guardar como PDF") para cargarlo en 1 segundo.'
      );
    }

    // 3. Procesar Nombre y Apellidos
    let fullName = personData?.name || '';
    if (!fullName && ogTitle) {
      // ogTitle suele ser: "Satya Nadella - Chairman and CEO at Microsoft | LinkedIn"
      const parts = ogTitle.split(' - ')[0].replace(/\s*\|\s*LinkedIn$/i, '').trim();
      fullName = parts;
    }

    let firstName = ogFirstName || '';
    let lastName = ogLastName || '';

    if (!firstName && fullName) {
      const nameParts = fullName.trim().split(/\s+/);
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    // 4. Titular / Puesto de trabajo deseado
    let targetJob = '';
    if (personData?.jobTitle) {
      targetJob = Array.isArray(personData.jobTitle)
        ? personData.jobTitle[0]
        : String(personData.jobTitle);
    } else if (ogTitle && ogTitle.includes(' - ')) {
      const afterDash = ogTitle.split(' - ')[1]?.split(' | ')[0]?.trim();
      if (afterDash) targetJob = afterDash;
    }

    // 5. Ubicación
    let city = '';
    if (personData?.address?.addressLocality) {
      city = personData.address.addressLocality;
    }

    // 6. Resumen / Perfil Profesional
    let summary = personData?.description || '';
    if (!summary && ogDescription) {
      // Limpiar texto de ogDescription si contiene sufijos de LinkedIn
      const cleanDesc = ogDescription
        .replace(/\s*·\s*500\+\s*connections.*$/i, '')
        .replace(/\s*·\s*Location:.*$/i, '')
        .replace(/\s*·\s*Experience:.*$/i, '');
      summary = cleanDesc.trim();
    }

    // 7. Foto de perfil
    let photoUrl = '';
    if (personData?.image?.contentUrl) {
      photoUrl = personData.image.contentUrl;
    } else if (typeof personData?.image === 'string') {
      photoUrl = personData.image;
    } else if (ogImage && !ogImage.includes('static.licdn.com/aero-v1/sc/h/')) {
      photoUrl = ogImage;
    }

    // 8. Experiencias Laborales
    const experiences: ParsedLinkedInExperience[] = [];
    if (Array.isArray(personData?.worksFor)) {
      for (const org of personData.worksFor) {
        const company = org.name || '';
        const role = org.member || {};
        const title = role.roleName || (Array.isArray(personData.jobTitle) ? personData.jobTitle[0] : 'Puesto Profesional');
        const startDate = role.startDate ? String(role.startDate) : undefined;
        const endDate = role.endDate ? String(role.endDate) : undefined;
        const orgCity = org.location || undefined;

        if (company) {
          experiences.push({
            title: title || 'Colaborador',
            company,
            city: orgCity,
            startDate,
            endDate,
            current: !endDate,
            description: `Desempeño de funciones clave y responsabilidades operativas en ${company}.`,
          });
        }
      }
    }

    // 9. Educación
    const education: ParsedLinkedInEducation[] = [];
    if (Array.isArray(personData?.alumniOf)) {
      for (const edu of personData.alumniOf) {
        const institution = edu.name || '';
        const member = edu.member || {};
        const startDate = member.startDate ? String(member.startDate) : undefined;
        const endDate = member.endDate ? String(member.endDate) : undefined;

        if (institution) {
          education.push({
            institution,
            degree: 'Grado Académico / Certificación',
            startDate,
            endDate,
            description: `Estudios cursados en ${institution}.`,
          });
        }
      }
    }

    // 10. Habilidades inferidas a partir del puesto y resumen
    const skills: string[] = [];
    if (targetJob) {
      skills.push(targetJob);
    }
    if (targetJob.toLowerCase().includes('ceo') || targetJob.toLowerCase().includes('director') || targetJob.toLowerCase().includes('gerente')) {
      skills.push('Liderazgo Ejecutivo', 'Estrategia Empresarial', 'Gestión de Equipos');
    } else if (targetJob.toLowerCase().includes('software') || targetJob.toLowerCase().includes('developer') || targetJob.toLowerCase().includes('ingeniero')) {
      skills.push('Desarrollo de Software', 'Arquitectura Web', 'Resolución de Problemas');
    }

    return {
      personalData: {
        firstName,
        lastName,
        targetJob,
        city,
        photoUrl: photoUrl || undefined,
        linkedin: targetUrl,
      },
      summary,
      experiences,
      education,
      skills,
    };
  }
}

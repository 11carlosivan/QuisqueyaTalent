export interface AIJobPrompt {
  title: string;
  industry?: string;
  province?: string;
  experienceLevel?: string;
}

export interface ExtractedJobData {
  isJobOffer: boolean;
  title: string;
  companyName: string;
  category: string;
  province: string;
  city?: string;
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'TEMPORARY';
  workplaceType: 'ON_SITE' | 'REMOTE' | 'HYBRID';
  experienceLevel: 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR';
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  isSalaryPublic: boolean;
  applyMethod: 'EMAIL' | 'PLATFORM';
  applyEmail?: string | null;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  skills: string[];
}

export class AIService {
  private static get apiKey(): string {
    return process.env.GEMINI_API_KEY || '';
  }

  /**
   * 1. Analiza una publicación de Instagram (caption y/o imagen) y extrae una vacante redactada profesionalmente
   */
  static async parseJobFromPost(input: {
    caption?: string;
    imageUrl?: string;
    imageBuffer?: Buffer;
    imageMime?: string;
  }): Promise<ExtractedJobData> {
    const caption = input.caption || '';
    const key = this.apiKey;

    // Si hay Gemini API Key configurada, llamar a Gemini 1.5 Flash
    if (key && key.trim().length > 10) {
      try {
        const prompt = `
Actúa como un reclutador y redactor senior especializado en el mercado laboral de la República Dominicana para la plataforma de empleo Quisqueya Talent.
Analiza la siguiente publicación de Instagram y determina si es una oferta de empleo legítima. Si lo es, extrae y redacta la información con estilo corporativo y profesional.

Texto de la publicación:
"""${caption}"""

Debes responder ÚNICAMENTE un objeto JSON válido con la siguiente estructura (sin markdown, sin bloques de código extraños, solo JSON puro):
{
  "isJobOffer": true, // false si es un meme, felicitación, saludo o contenido no relacionado con empleo
  "title": "Título profesional y limpio del puesto",
  "companyName": "Nombre de la empresa que contrata si se menciona, o 'Empresa Confidencial'",
  "category": "Una de: Tecnología | Ventas & Comercio | Call Center & BPO | Administración & Finanzas | Servicio al Cliente | Turismo & Hotelería | Salud & Medicina | Logística & Operaciones | Educación",
  "province": "Una provincia de República Dominicana (ej. Santo Domingo, Distrito Nacional, Santiago, La Altagracia, etc.)",
  "city": "Ciudad o sector si se menciona, o null",
  "jobType": "FULL_TIME", // FULL_TIME | PART_TIME | CONTRACT | INTERNSHIP | TEMPORARY
  "workplaceType": "ON_SITE", // ON_SITE | REMOTE | HYBRID
  "experienceLevel": "MID", // ENTRY | JUNIOR | MID | SENIOR
  "salaryMin": null, // número si se menciona salario o null
  "salaryMax": null,
  "salaryCurrency": "DOP", // DOP o USD
  "isSalaryPublic": false,
  "applyMethod": "EMAIL", // EMAIL si hay un correo para enviar CV, de lo contrario PLATFORM
  "applyEmail": "correo@ejemplo.com si aparece en el texto, de lo contrario null",
  "description": "Redacción atractiva, formal y clara describiendo la vacante para candidatos dominicanos.",
  "responsibilities": "• Lista de responsabilidades principales con viñetas.",
  "requirements": "• Lista de requisitos clave (educación, experiencia, habilidades, etc.) con viñetas.",
  "benefits": "• Beneficios ofrecidos (salario competitivo, seguro médico, beneficios de ley en RD, etc.) con viñetas.",
  "skills": ["Habilidad 1", "Habilidad 2", "Habilidad 3"]
}
`;

        const parts: any[] = [{ text: prompt }];

        // Si tenemos buffer de imagen, incluirlo en la llamada multimodal
        if (input.imageBuffer && input.imageMime) {
          parts.push({
            inlineData: {
              mimeType: input.imageMime,
              data: input.imageBuffer.toString('base64'),
            },
          });
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts }],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (response.ok) {
          const result: any = await response.json();
          const rawJson = result?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawJson) {
            const parsed = JSON.parse(rawJson);
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Fallo llamada directa a Gemini API, activando extractor heurístico dominicano.');
      }
    }

    // Adaptador Heurístico Inteligente Especializado en Vacantes Dominicanas
    return this.heuristicJobExtractor(caption);
  }

  /**
   * Detector avanzado para distinguir ofertas de empleo de posts normales (memes, tips, feriados, efemérides, saludos)
   */
  static isLegitimateJobOffer(text: string): { isJob: boolean; reason: string } {
    const lower = text.toLowerCase();

    // 1. Patrones Negativos Críticos (posts comunes que NUNCA son vacantes)
    const nonJobPatterns = [
      'feliz día',
      'feliz dia',
      'feliz fin de semana',
      'feliz inicio de semana',
      'buenos días',
      'buenos dias',
      'buenas tardes',
      'buenas noches',
      'recordatorio de feriado',
      'día no laborable',
      'dia no laborable',
      'aniversario',
      'felicitaciones',
      'enhorabuena',
      'tips para tu entrevista',
      'consejos para tu entrevista',
      'consejos para tu cv',
      'tips para tu cv',
      'sabías que',
      'sabias que',
      'frase del día',
      'frase motivacional',
      'reflexión de hoy',
      'reflexion de hoy',
      'diplomado',
      'taller práctico',
      'taller virtual',
      'curso online',
      'webinar',
      'precio de preventa',
      'compra ya',
      'descuento especial',
      '2x1',
    ];

    for (const pattern of nonJobPatterns) {
      if (lower.includes(pattern)) {
        return {
          isJob: false,
          reason: `Descartado: contiene patrón no laboral ("${pattern}")`,
        };
      }
    }

    // 2. Patrones Positivos Fuertes (indicadores inequívocos de contratación)
    const strongJobKeywords = [
      'estamos contratando',
      'vacante disponible',
      'vacantes disponibles',
      'nueva vacante',
      'se busca',
      'estamos buscando',
      'solicitamos',
      'oportunidad de empleo',
      'oportunidad laboral',
      'envía tu cv',
      'enviar cv',
      'aplica ya',
      'postúlate',
      'postulate',
      'perfil del puesto',
      'requisitos del puesto',
      'requisitos:',
      'funciones:',
      'responsabilidades:',
      'we are hiring',
      'now hiring',
      'job opening',
    ];

    const hasStrongIndicator = strongJobKeywords.some((k) => lower.includes(k));

    // Si tiene un correo explícito y además alguna palabra clave de empleo
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
    const hasAnyJobWord = ['vacante', 'empleo', 'puesto', 'salario', 'contratación', 'personal'].some((w) =>
      lower.includes(w)
    );

    if (hasStrongIndicator || (hasEmail && hasAnyJobWord)) {
      return { isJob: true, reason: 'Oferta de empleo detectada por patrones de contratación' };
    }

    return {
      isJob: false,
      reason: 'No cuenta con señales ni llamados de reclutamiento laboral',
    };
  }

  /**
   * Motor de extracción heurística y redacción para publicaciones dominicanas
   */
  private static heuristicJobExtractor(text: string): ExtractedJobData {
    const lower = text.toLowerCase();
    const check = this.isLegitimateJobOffer(text);
    const isJobOffer = check.isJob;

    // 2. Extraer correo para postulación
    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const applyEmail = emailMatch ? emailMatch[1].toLowerCase() : null;

    // 3. Detectar Provincia
    const dominicanProvinces = [
      'Distrito Nacional',
      'Santo Domingo',
      'Santiago',
      'La Altagracia',
      'Punta Cana',
      'Bávaro',
      'Puerto Plata',
      'La Romana',
      'San Cristóbal',
      'La Vega',
      'San Pedro de Macorís',
      'San Francisco de Macorís',
      'Boca Chica',
    ];

    let province = 'Santo Domingo';
    for (const p of dominicanProvinces) {
      if (lower.includes(p.toLowerCase())) {
        province = p === 'Punta Cana' || p === 'Bávaro' ? 'La Altagracia' : p;
        break;
      }
    }

    // 4. Detectar Modalidad
    let workplaceType: 'ON_SITE' | 'REMOTE' | 'HYBRID' = 'ON_SITE';
    if (lower.includes('remoto') || lower.includes('home office') || lower.includes('desde casa')) {
      workplaceType = 'REMOTE';
    } else if (lower.includes('híbrido') || lower.includes('hibrido')) {
      workplaceType = 'HYBRID';
    }

    // 5. Detectar Categoría y Título
    let category = 'Administración & Oficina';
    let title = 'Colaborador / Posición Vacante';

    if (lower.includes('desarrollador') || lower.includes('programador') || lower.includes('software') || lower.includes('ti') || lower.includes('tecnología') || lower.includes('soporte técnico')) {
      category = 'Tecnología';
      title = lower.includes('desarrollador') ? 'Desarrollador de Software' : 'Especialista en Tecnología';
    } else if (lower.includes('call center') || lower.includes('bilingüe') || lower.includes('bilingual') || lower.includes('servicio al cliente') || lower.includes('customer service')) {
      category = 'Call Center & BPO';
      title = lower.includes('bilingual') || lower.includes('bilingüe') ? 'Customer Service Representative (Bilingüe)' : 'Representante de Servicio al Cliente';
    } else if (lower.includes('ventas') || lower.includes('comercial') || lower.includes('asesor') || lower.includes('vendedor')) {
      category = 'Ventas & Comercio';
      title = 'Asesor / Ejecutivo de Ventas';
    } else if (lower.includes('contabilidad') || lower.includes('contador') || lower.includes('finanzas') || lower.includes('auditor')) {
      category = 'Banca & Finanzas';
      title = 'Asistente de Contabilidad / Finanzas';
    } else if (lower.includes('almacén') || lower.includes('almacen') || lower.includes('chofer') || lower.includes('despacho') || lower.includes('inventario')) {
      category = 'Logística & Operaciones';
      title = 'Encargado de Almacén & Logística';
    }

    // Intentar extraer una primera línea atractiva como título
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (
        (line.toLowerCase().includes('buscamos') ||
          line.toLowerCase().includes('vacante:') ||
          line.toLowerCase().includes('puesto:')) &&
        line.length < 70
      ) {
        title = line.replace(/vacante:|puesto:|buscamos:?/gi, '').trim();
        break;
      }
    }

    // 6. Detectar salarios
    let salaryMin: number | null = null;
    let salaryMax: number | null = null;
    let salaryCurrency = 'DOP';

    const salaryMatch = text.match(/(?:rd\$|dop|\$)\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]{2,6})/i);
    if (salaryMatch) {
      const num = parseInt(salaryMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(num) && num > 1000) {
        salaryMin = num;
        salaryMax = Math.round(num * 1.15);
      }
    }

    return {
      isJobOffer,
      title: title || 'Posición Laboral Requerida',
      companyName: 'Empresa Destacada',
      category,
      province,
      jobType: 'FULL_TIME',
      workplaceType,
      experienceLevel: 'MID',
      salaryMin,
      salaryMax,
      salaryCurrency,
      isSalaryPublic: salaryMin !== null,
      applyMethod: applyEmail ? 'EMAIL' : 'PLATFORM',
      applyEmail: applyEmail,
      description: `Oportunidad laboral para el puesto de ${title} en ${province}, República Dominicana. Buscamos una persona responsable, proactiva y con deseos de crecimiento profesional.\n\n${text.substring(0, 300)}...`,
      responsibilities: `• Ejecutar las funciones clave vinculadas a la posición de ${title}.\n• Cumplir con los estándares operativos y metas de productividad establecidas.\n• Colaborar proactivamente con el equipo de trabajo y coordinadores.`,
      requirements: `• Experiencia previa comprobable en roles similares o formación técnica correspondiente.\n• Residir en ${province} o contar con disponibilidad de traslado.\n• Compromiso, puntualidad y excelentes relaciones interpersonales.`,
      benefits: `• Compensación acorde al mercado dominicano.\n• Todos los beneficios de ley (Seguro Familiar de Salud TSS, Regalía, Vacaciones).\n• Oportunidades de capacitación y desarrollo profesional.`,
      skills: ['Responsabilidad', 'Puntualidad', 'Trabajo en Equipo', 'Comunicación'],
    };
  }

  // 2. Mejora de redacción de Experiencia o Perfil para CV
  static async improveResumeSection(text: string, type: 'summary' | 'experience' | 'skills'): Promise<string> {
    if (type === 'summary') {
      return `Profesional orientado a resultados con sólida trayectoria en el sector. Especializado en optimización de flujos operativos, resolución proactiva de desafíos técnicos y liderazgo de equipos multidisciplinarios. Enfocado en generar impacto medible y valor estratégico en organizaciones líderes en República Dominicana y mercados internacionales.`;
    }

    if (type === 'experience') {
      return `• Lideró el diseño y ejecución de estrategias clave, logrando un incremento del 25% en la eficiencia operativa.\n• Coordinó con equipos interdisciplinarios la implementación de soluciones innovadoras, reduciendo tiempos de entrega en un 30%.\n• Diseñó y documentó procesos estandarizados que garantizaron altos estándares de calidad y satisfacción de clientes clave.`;
    }

    return text;
  }

  // 3. Generador de Descripciones de Vacantes para Empresas
  static async generateJobDescription(data: AIJobPrompt): Promise<{
    description: string;
    responsibilities: string;
    requirements: string;
    benefits: string;
    suggestedSkills: string[];
  }> {
    const { title, province = 'Santo Domingo', experienceLevel = 'Intermedio' } = data;

    return {
      description: `Estamos en búsqueda de un/a talentoso/a ${title} para integrarse a nuestro equipo en ${province}. Esta posición es clave para impulsar proyectos de alto impacto, garantizando excelencia operativa y calidad en cada entrega.`,
      responsibilities: `• Diseñar, planificar y ejecutar las tareas prioritarias del área de ${title}.\n• Colaborar estrechamente con departamentos internos para asegurar el cumplimiento de metas y plazos.\n• Analizar métricas operativas y proponer iniciativas continuas de optimización.\n• Mantener altos estándares de calidad y cumplimiento normativo vigente en el país.`,
      requirements: `• Título universitario o técnico en el área o experiencia profesional equivalente comprobable.\n• Mínimo 2 a 3 años de experiencia en roles afines (${experienceLevel}).\n• Excelentes habilidades de comunicación, pensamiento crítico y orientación a objetivos.\n• Capacidad para trabajar de manera autónoma y en equipo bajo metodologías ágiles.`,
      benefits: `• Compensación salarial competitiva acorde al mercado dominicano.\n• Seguro médico complementario y cobertura de salud de primera línea.\n• Oportunidades reales de plan de carrera y desarrollo profesional.\n• Excelente clima laboral, flexibilidad y beneficios corporativos exclusivos.`,
      suggestedSkills: [
        'Liderazgo',
        'Pensamiento Estratégico',
        'Resolución de Problemas',
        'Trabajo en Equipo',
        'Comunicación Asertiva',
      ],
    };
  }

  // 4. Generador de Contenido y Copys para Redes Sociales
  static async generateSocialMedia(job: {
    title: string;
    company: string;
    province: string;
    salary?: string;
    type?: string;
  }): Promise<{
    linkedin: string;
    instagram: string;
    twitter: string;
    hashtags: string[];
  }> {
    const hashtags = ['#EmpleosRD', '#TrabajoRD', '#VacantesRD', `#${job.title.replace(/\s+/g, '')}`, '#QuisqueyaTalent', '#OportunidadLaboral'];

    return {
      linkedin: `🚀 ¡Estamos Contratando en ${job.company}!\n\nBuscamos un/a profesional para el puesto de: ${job.title} en ${job.province}.\n\nSi buscas un entorno dinámico, crecimiento profesional y retos estimulantes, ¡queremos conocer tu talento!\n\n📍 Ubicación: ${job.province}, República Dominicana\n💼 Modalidad: ${job.type || 'Tiempo Completo'}\n💰 Compensación: ${job.salary || 'Competitiva acorde al mercado'}\n\n👉 Postúlate 100% gratis hoy mismo en Quisqueya Talent. Enlace en el primer comentario o en nuestro perfil.\n\n${hashtags.join(' ')}`,
      instagram: `🔥 ¡NUEVA VACANTE DISPONIBLE! 🔥\n\n📌 Posición: ${job.title}\n🏢 Empresa: ${job.company}\n📍 Ubicación: ${job.province}, RD\n\n¿Tienes lo que se necesita para sumarte al equipo? Dale click al link en nuestra bio para enviar tu CV o compártelo con alguien que esté buscando esta gran oportunidad. 📲\n\n${hashtags.join(' ')}`,
      twitter: `📢 ¡Buscamos ${job.title} en ${job.province} con ${job.company}! Postúlate gratis y da el siguiente paso en tu carrera profesional a través de Quisqueya Talent: https://quisqueyatalent.com/empleos 🇩🇴💼 ${hashtags.slice(0, 4).join(' ')}`,
      hashtags,
    };
  }

  // 5. Generador de Carta de Presentación
  static async generateCoverLetter(candidateName: string, jobTitle: string, companyName: string): Promise<string> {
    return `Estimado equipo de Selección y Atracción de Talento de ${companyName}:\n\nPor medio de la presente, deseo manifestar mi profundo interés en formar parte de su organización en la posición de ${jobTitle}, publicada recientemente en Quisqueya Talent.\n\nA lo largo de mi trayectoria profesional, he desarrollado sólidas competencias y experiencia práctica directamente alineadas con los desafíos que demanda este puesto. Me considero una persona proactiva, orientada al logro de metas y con alta capacidad de adaptación para generar resultados tangibles desde el primer día.\n\nEstaría muy agradecido/a por la oportunidad de mantener una entrevista para conversar más detalladamente sobre cómo mi experiencia y entusiasmo pueden aportar al crecimiento continuo de ${companyName}.\n\nAtentamente,\n\n${candidateName}\nCandidato en Quisqueya Talent`;
  }
}

export default AIService;

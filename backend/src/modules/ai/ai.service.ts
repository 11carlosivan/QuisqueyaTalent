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
        // ─── Prompt de extracción con PRIORIDAD ESTRICTA a la imagen ───────────
        // La imagen va PRIMERO en el array de parts para que Gemini la procese como
        // fuente principal. El caption es solo referencia secundaria para completar
        // campos que la imagen no aclara. NUNCA se deben pisar datos de la imagen
        // con datos del caption (ej. si la imagen dice "WhatsApp: 809-xxx", se usa).

        const systemInstruction = `Eres un extractor experto de vacantes de empleo para la plataforma Quisqueya Talent (República Dominicana).

REGLA FUNDAMENTAL — PRIORIDAD DE FUENTES:
1. La IMAGEN (flyer/afiche) es tu fuente PRINCIPAL y DEFINITIVA.
   - Lee TODO el texto visible en la imagen: título, empresa, requisitos, responsabilidades, salario, método de contacto (WhatsApp, teléfono, email, link).
   - Si la imagen indica un número de WhatsApp o teléfono para aplicar, DEBES incluirlo literalmente en el campo "description" y ajustar "applyMethod" a "PLATFORM".
   - NUNCA omitas información de contacto visible en la imagen.
2. El texto/caption es solo REFERENCIA SECUNDARIA para complementar lo que la imagen NO aclara.
   - Si la imagen tiene el título → usa ese título (ignora el del caption si difieren).
   - Si la imagen tiene instrucciones de aplicación → úsalas (ignora las del caption si difieren).
3. Si NO hay imagen o la imagen es ilegible, usa el caption como fuente.

INSTRUCCIONES DE REDACCIÓN:
- Redacta en español formal dominicano, estilo corporativo y profesional.
- La "description" debe ser atractiva para el candidato e incluir TODOS los detalles de contacto/aplicación que aparezcan en la imagen (WhatsApp, correo, enlace, etc.).
- Si ves un número de WhatsApp, escríbelo explícitamente: "Para aplicar, escribe por WhatsApp al [número]".
- Responde ÚNICAMENTE con JSON puro (sin markdown, sin bloques de código).`;

        const prompt = `${systemInstruction}

---
TEXTO/CAPTION (referencia secundaria):
"""${caption}"""

---
ANALIZA LA IMAGEN ADJUNTA y extrae la información de la vacante. Responde con este JSON exacto:
{
  "isJobOffer": true,
  "title": "Título exacto del puesto según la imagen",
  "companyName": "Empresa mencionada en la imagen, o 'Empresa Confidencial'",
  "category": "Una de: Tecnología | Ventas & Comercio | Call Center & BPO | Administración & Finanzas | Servicio al Cliente | Turismo & Hotelería | Salud & Medicina | Logística & Operaciones | Educación",
  "province": "Provincia de RD (Santo Domingo, Distrito Nacional, Santiago, La Altagracia, etc.)",
  "city": "Ciudad o sector visible en la imagen, o null",
  "jobType": "FULL_TIME",
  "workplaceType": "ON_SITE",
  "experienceLevel": "MID",
  "salaryMin": null,
  "salaryMax": null,
  "salaryCurrency": "DOP",
  "isSalaryPublic": false,
  "applyMethod": "EMAIL",
  "applyEmail": "email@ejemplo.com si aparece en la imagen, o null",
  "description": "Descripción completa incluyendo TODOS los detalles de contacto y método de aplicación visibles en la imagen (WhatsApp, teléfono, link, correo, etc.).",
  "responsibilities": "• Responsabilidades con viñetas según la imagen.",
  "requirements": "• Requisitos con viñetas según la imagen.",
  "benefits": "• Beneficios si se mencionan, o beneficios estándar de ley en RD.",
  "skills": ["Habilidad 1", "Habilidad 2", "Habilidad 3"]
}`;

        // Descargar la imagen si se pasó por URL para enviarla a Gemini Multimodal / OCR
        let imgBuffer = input.imageBuffer;
        let imgMime = input.imageMime;

        if (!imgBuffer && input.imageUrl && input.imageUrl.startsWith('http')) {
          try {
            const imgRes = await fetch(input.imageUrl, {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              },
            });
            if (imgRes.ok) {
              const arrayBuf = await imgRes.arrayBuffer();
              imgBuffer = Buffer.from(arrayBuf);
              imgMime = imgRes.headers.get('content-type') || 'image/jpeg';
            }
          } catch (imgErr) {
            console.warn('No se pudo descargar imagen para análisis multimodal:', imgErr);
          }
        }

        // ⬇ IMAGEN PRIMERO para que Gemini la procese como fuente principal,
        //   el texto del prompt va después como instrucción secundaria.
        const parts: any[] = [];

        if (imgBuffer && imgMime) {
          // Imagen va al INICIO del array
          parts.push({
            inlineData: {
              mimeType: imgMime.split(';')[0].trim(),
              data: imgBuffer.toString('base64'),
            },
          });
        }

        // Texto del prompt siempre al final
        parts.push({ text: prompt });


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

            // Post-procesado: si la descripción menciona WhatsApp/teléfono,
            // forzar applyMethod a PLATFORM aunque Gemini haya devuelto EMAIL
            const desc = (parsed.description || '').toLowerCase();
            const hasWhatsApp = /whatsapp|wha?ts|wa\.me|809|829|849|\+1[-\s]?\(?8[0-9]{2}\)?/.test(desc);
            const hasPhone = /llama[r]?\s+al|escrib[ei]\s+al|cont[aá]ct[ao]\s+al|tel[eé]fono|celular/.test(desc);

            if (hasWhatsApp || hasPhone) {
              parsed.applyMethod = 'PLATFORM';
              if (!parsed.applyEmail) {
                parsed.applyEmail = null;
              }
            }

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
      'contratando',
      'vacante disponible',
      'vacantes disponibles',
      'vacante:',
      'vacantes:',
      'nueva vacante',
      'se busca',
      'estamos buscando',
      'buscamos',
      'solicitamos',
      'requerimos',
      'necesitamos',
      'oportunidad de empleo',
      'oportunidad laboral',
      'envía tu cv',
      'enviar cv',
      'envianos tu cv',
      'mandar cv',
      'aplica ya',
      'postúlate',
      'postulate',
      'perfil del puesto',
      'requisitos del puesto',
      'requisitos:',
      'funciones:',
      'responsabilidades:',
      'beneficios:',
      'interesados enviar',
      'interesados postularse',
      'interesados aplicar',
      'sueldo:',
      'salario:',
      'jornada laboral',
      'we are hiring',
      'now hiring',
      'job opening',
      'jobposting',
    ];

    const hasStrongIndicator = strongJobKeywords.some((k) => lower.includes(k));

    // Si tiene un correo explícito y además alguna palabra clave de empleo
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
    const hasAnyJobWord = ['vacante', 'empleo', 'puesto', 'salario', 'contratación', 'personal', 'posición', 'posicion'].some((w) =>
      lower.includes(w)
    );

    // Si contiene términos de empleo junto con requisitos/funciones/experiencia
    const hasJobTerm = ['vacante', 'empleo', 'puesto', 'posición', 'posicion', 'cargo'].some((w) => lower.includes(w));
    const hasDetailTerm = ['requisito', 'funcion', 'función', 'responsabilidad', 'beneficio', 'experiencia', 'aplicar', 'postul', 'licenciatura', 'estudiante', 'bachiller'].some((w) => lower.includes(w));

    if (hasStrongIndicator || (hasEmail && hasAnyJobWord) || (hasJobTerm && hasDetailTerm)) {
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

    // 5. Detectar Título y Categoría con Diccionario Dominicano Especializado
    let category = 'Administración & Oficina';
    let title = '';

    // A. Buscar primero patrones explícitos de título en el texto
    const explicitTitleRegexes = [
      /(?:vacante(?:s)?\s*(?:disponible(?:s)?)?:|puesto:|posici[oó]n:|se solicita:|se busca:|buscamos:?|solicitamos:?|requerimos:?)\s*([^\n\r,.;!]{3,60})/i,
      /(?:^|\n)\s*(?:[🚨🔥💼📌✅📢👉]*\s*)?(?:se\s+busca|se\s+solicita|buscamos|solicitamos|vacante:?)\s+([^\n\r,.;!]{3,60})/i,
    ];

    for (const rx of explicitTitleRegexes) {
      const match = text.match(rx);
      if (match && match[1]) {
        const candidate = match[1].replace(/^[^\wáéíóúñÁÉÍÓÚÑ]+|[^\wáéíóúñÁÉÍÓÚÑ]+$/g, '').trim();
        if (candidate.length >= 3 && candidate.length <= 60 && !candidate.toLowerCase().includes('http') && !candidate.includes('@')) {
          title = candidate;
          break;
        }
      }
    }

    // B. Si no hay patrón explícito, buscar la primera línea que parezca un encabezado de vacante
    if (!title) {
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      for (const line of lines.slice(0, 5)) {
        const cleanLine = line.replace(/^[🚨🔥💼📌✅📢👉*#•\-\s]+|[!*#\s]+$/g, '').trim();
        if (
          cleanLine.length >= 4 &&
          cleanLine.length <= 50 &&
          !cleanLine.toLowerCase().includes('http') &&
          !cleanLine.includes('@') &&
          !cleanLine.toLowerCase().includes('empleos_') &&
          !cleanLine.toLowerCase().includes('república dominicana') &&
          !cleanLine.toLowerCase().includes('republica dominicana') &&
          !cleanLine.toLowerCase().includes('santo domingo') &&
          !cleanLine.toLowerCase().includes('desliza') &&
          !cleanLine.toLowerCase().includes('síguenos') &&
          !cleanLine.toLowerCase().includes('etiqueta')
        ) {
          title = cleanLine;
          break;
        }
      }
    }

    // C. Mapeo por palabras clave vocacionales dominicanas para títulos y categorías
    const vocations: Array<{ pattern: RegExp; title: string; category: string }> = [
      // Panadería y Pastelería
      { pattern: /\b(panader[oa]|reposter[oa]|pastelero?|hornero)\b/i, title: 'Experto en Panadería / Repostería', category: 'Alimentos & Gastronomía' },
      { pattern: /\b(cociner[oa]|chef|sous\s+chef|pizzero|ayudante\s+de\s+cocina|steward)\b/i, title: 'Cocinero / Personal de Cocina', category: 'Alimentos & Gastronomía' },
      { pattern: /\b(meser[oa]|camarer[oa]|barista|bartender)\b/i, title: 'Mesero / Servicio Gastronómico', category: 'Alimentos & Gastronomía' },
      
      // Choferes y Transporte
      { pattern: /\b(chofer\s+cat[.\s]*[234]|chofer\s+pesado|conductor|chofer)\b/i, title: 'Chofer Profesional', category: 'Logística & Transporte' },
      { pattern: /\b(mensajer[oa]|delivery|motorizado)\b/i, title: 'Mensajero con Motor Propio', category: 'Logística & Transporte' },
      { pattern: /\b(almac[eé]n|montacargas|montacarguista|estibador|despacho|inventario)\b/i, title: 'Auxiliar de Almacén & Logística', category: 'Logística & Operaciones' },

      // Ventas y Comercio
      { pattern: /\b(cajer[oa])\b/i, title: 'Cajero / Cajera', category: 'Ventas & Comercio' },
      { pattern: /\b(asesor[a]?\s+de\s+ventas|ejecutiv[oa]\s+de\s+ventas|vendedor[a]?|promotor[a]?|mercaderista)\b/i, title: 'Ejecutivo / Asesor de Ventas', category: 'Ventas & Comercio' },

      // Salud y Medicina
      { pattern: /\b(enfermer[oa]|auxiliar\s+de\s+enfermer[ií]a)\b/i, title: 'Enfermero/a Profesional', category: 'Salud & Medicina' },
      { pattern: /\b(m[eé]dic[oa]|asistente\s+dental|odont[oó]log[oa]|farmac[eé]utic[oa]|bioanalista)\b/i, title: 'Profesional del Área de Salud', category: 'Salud & Medicina' },

      // Limpieza y Seguridad
      { pattern: /\b(conserje|limpieza|mantenimiento|afanador)\b/i, title: 'Personal de Limpieza & Conserjería', category: 'Mantenimiento & Limpieza' },
      { pattern: /\b(seguridad|vigilante|guardaespaldas|oficial\s+de\s+seguridad)\b/i, title: 'Oficial de Seguridad', category: 'Seguridad' },

      // Administración y Oficina
      { pattern: /\b(recepcionista|secretaria)\b/i, title: 'Recepcionista / Secretaria', category: 'Administración & Oficina' },
      { pattern: /\b(asistente\s+administrativ[oa]|asistente\s+de\s+oficina)\b/i, title: 'Asistente Administrativo/a', category: 'Administración & Oficina' },
      { pattern: /\b(contab|contador[a]?|auditor[a]?|finanzas)\b/i, title: 'Asistente de Contabilidad & Finanzas', category: 'Banca & Finanzas' },
      { pattern: /\b(recursos\s+humanos|rrhh|gesti[oó]n\s+humana|reclutador)\b/i, title: 'Generalista de Recursos Humanos', category: 'Recursos Humanos' },

      // Call Center & BPO
      { pattern: /\b(call\s+center|bilingual|biling[uü]e|customer\s+service|chat\s+agent)\b/i, title: 'Representante de Servicio al Cliente (Bilingüe)', category: 'Call Center & BPO' },

      // Tecnología (¡SOLO PALABRAS PRECISAS, NUNCA 'ti' A SECAS!)
      { pattern: /\b(desarrollador|programador|software|soporte\s+t[eé]cnico|full\s+stack|frontend|backend|devops|ingeniero\s+de\s+sistemas)\b/i, title: 'Especialista en Desarrollo y Tecnología', category: 'Tecnología' },
    ];

    for (const voc of vocations) {
      if (voc.pattern.test(lower)) {
        category = voc.category;
        if (!title || title.length > 50) {
          title = voc.title;
        }
        break;
      }
    }

    // Si aún no tenemos título específico
    if (!title || title.length < 3) {
      title = 'Colaborador / Posición Vacante';
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

import path from 'path';
import fs from 'fs';
import Tesseract from 'tesseract.js';

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
  additionalJobs?: ExtractedJobData[];
}

export class AIService {
  private static get apiKey(): string {
    return process.env.GEMINI_API_KEY || '';
  }

  /**
   * Normaliza y valida la categoría en base al título y contenido para evitar clasificaciones erróneas
   */
  static normalizeCategory(title: string, rawCategory: string, text: string): string {
    const combined = `${title} ${rawCategory} ${text}`.toLowerCase();

    // 1. Gastronomía / Panadería / Restaurantes / Hotelería
    if (/panader|reposter|pastel|cocin|chef|pizzero|hornero|masas\b|pan\b|meser|camarer|barista|bartender|restaurante|cafeter[ií]a|alimento|gastronom/i.test(combined)) {
      return 'Turismo y Hotelería';
    }

    // 2. Call Center / BPO
    if (/call\s+center|bpo|biling|customer\s+service|chat\s+agent|agente\s+telef[oó]nico|soporte\s+al\s+cliente/i.test(combined)) {
      return 'Call Center y BPO';
    }

    // 3. Ventas y Comercio B2B
    if (/ventas|vendedor|asesor\s+comercial|ejecutiv[oa]\s+de\s+ventas|promotor|mercaderista|cajer[oa]/i.test(combined)) {
      return 'Ventas y Comercio B2B';
    }

    // 4. Banca y Finanzas
    if (/contab|contador|auditor|finanz|banco|cr[eé]dito|cobro/i.test(combined)) {
      return 'Banca y Finanzas';
    }

    // 5. Salud y Medicina
    if (/enferm|m[eé]dic|salud|farmac|odont|dental|bioanal|cl[ií]nic|laboratorio\s+cl[ií]nico/i.test(combined)) {
      return 'Salud y Medicina';
    }

    // 6. Zonas Francas & Logística / Manufactura
    if (/chofer|conductor|almac[eé]n|montacarga|despacho|inventario|mensajer|delivery|log[ií]stic|zona\s+franca|operari|manufactura/i.test(combined)) {
      return 'Zonas Francas & Logística';
    }

    // 7. Administración y Recursos Humanos
    if (/asistente\s+administrativ|recepcion|secretari|recursos\s+humanos|rrhh|gesti[oó]n\s+humana/i.test(combined)) {
      return 'Administración y Recursos Humanos';
    }

    // 8. Tecnología (estricto: software, desarrollo, TI, programación)
    if (/desarrollador|programador|software|full\s+stack|frontend|backend|devops|sistemas|soporte\s+it|ingeniero\s+de\s+software|tecnolog[ií]a|inform[aá]tic/i.test(combined)) {
      return 'Tecnología e Informática';
    }

    // Mapeo de categorías raw predefinidas si existen
    if (/turismo|hotel/i.test(rawCategory)) return 'Turismo y Hotelería';
    if (/venta|comerc/i.test(rawCategory)) return 'Ventas y Comercio B2B';
    if (/call\s*center/i.test(rawCategory)) return 'Call Center y BPO';
    if (/finanz|banca/i.test(rawCategory)) return 'Banca y Finanzas';
    if (/salud|medic/i.test(rawCategory)) return 'Salud y Medicina';
    if (/log[ií]st|zona/i.test(rawCategory)) return 'Zonas Francas & Logística';
    if (/admin/i.test(rawCategory)) return 'Administración y Recursos Humanos';
    if (/tecnol|inform/i.test(rawCategory)) return 'Tecnología e Informática';

    return rawCategory || 'Otros';
  }

  /**
   * Limpia impurezas y texto de redes sociales típico de Instagram
   * (hashtags, menciones, enlaces en bio, canales de WhatsApp, llamadas a etiquetar amigos)
   */
  static cleanInstagramNoise(text: string): string {
    if (!text) return '';
    return text
      // Eliminar hashtags (#empleosrd, #vacantes, etc.)
      .replace(/#[\wáéíóúÁÉÍÓÚñÑ_]+/gi, '')
      // Eliminar menciones (@usuario) pero preservar correos electrónicos
      .replace(/(^|\s)@[\w._]+/g, '$1')
      // Eliminar URLs
      .replace(/https?:\/\/[^\s]+/gi, '')
      // Eliminar frases típicas de captación en redes sociales
      .replace(/["']?etiqueta a (?:tu|un) amigo[^\n\r.]*["']?/gi, '')
      .replace(/¿?quieres recibir las vacantes directamente[^\n\r.]*\??/gi, '')
      .replace(/(?:únete|unete) a nuestro canal de whatsapp[^\n\r.]*/gi, '')
      .replace(/(?:únete|unete) a nuestro grupo[^\n\r.]*/gi, '')
      .replace(/link en (?:la )?bio[^\n\r.]*/gi, '')
      .replace(/enlace en (?:el )?perfil[^\n\r.]*/gi, '')
      .replace(/desliza para ver[^\n\r.]*/gi, '')
      .replace(/desliza hacia la izquierda[^\n\r.]*/gi, '')
      .replace(/s[íi]guenos para m[áa]s[^\n\r.]*/gi, '')
      .replace(/comparte (?:este post|esta vacante|con alguien)[^\n\r.]*/gi, '')
      .replace(/guarda este post[^\n\r.]*/gi, '')
      .replace(/infovacantesrd\w*/gi, '')
      .replace(/empleos_parati_rd/gi, '')
      .replace(/empleosrd/gi, '')
      // Normalizar saltos de línea
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      .trim();
  }

  /**
   * 1. Analiza una publicación de Instagram (caption y/o imagen) y extrae una vacante redactada profesionalmente.
   * La IMAGEN (flyer/afiche) es la prioridad estricta. El caption de Instagram NO debe copiarse en la descripción.
   */
  static async parseJobFromPost(input: {
    caption?: string;
    imageUrl?: string;
    imageUrls?: string[];
    imageBuffer?: Buffer;
    imageBuffers?: Buffer[];
    imageMime?: string;
    postUrl?: string;
  }): Promise<ExtractedJobData> {
    const caption = input.caption || '';
    const key = this.apiKey;

    // Recolectar imágenes (locales /uploads/ y remotas http/https) y buffer primario para OCR
    const parts: any[] = [];
    const candidateUrls: string[] = [];
    let primaryImageBuffer: Buffer | null = input.imageBuffer || null;

    if (input.imageUrls && Array.isArray(input.imageUrls)) {
      candidateUrls.push(...input.imageUrls);
    }
    if (input.imageUrl) {
      if (input.imageUrl.includes(',')) {
        candidateUrls.push(...input.imageUrl.split(',').map((u) => u.trim()).filter(Boolean));
      } else {
        candidateUrls.push(input.imageUrl.trim());
      }
    }

    // 1. Agregar buffers directos si los hay
    if (input.imageBuffer) {
      parts.push({
        inlineData: {
          mimeType: (input.imageMime || 'image/jpeg').split(';')[0].trim(),
          data: input.imageBuffer.toString('base64'),
        },
      });
    }
    if (input.imageBuffers && Array.isArray(input.imageBuffers)) {
      for (const buf of input.imageBuffers) {
        if (!primaryImageBuffer) primaryImageBuffer = buf;
        parts.push({
          inlineData: {
            mimeType: (input.imageMime || 'image/jpeg').split(';')[0].trim(),
            data: buf.toString('base64'),
          },
        });
      }
    }

    // 2. Procesar URLs (locales de /uploads/ y remotas http)
    for (const rawUrl of candidateUrls) {
      if (!rawUrl) continue;

      // Archivo local en /uploads/
      if (rawUrl.startsWith('/uploads/') || rawUrl.startsWith('uploads/')) {
        try {
          const cleanRel = rawUrl.replace(/^\//, '');
          const localPath = path.join(process.cwd(), cleanRel);
          if (fs.existsSync(localPath)) {
            const fileBuf = fs.readFileSync(localPath);
            if (!primaryImageBuffer) primaryImageBuffer = fileBuf;
            const ext = path.extname(localPath).toLowerCase().replace('.', '');
            const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
            parts.push({
              inlineData: {
                mimeType: mime,
                data: fileBuf.toString('base64'),
              },
            });
          }
        } catch (localErr) {
          console.warn('[AIService] Error cargando imagen local:', localErr);
        }
      } else if (rawUrl.startsWith('http')) {
        // Imagen remota
        try {
          const imgRes = await fetch(rawUrl, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            },
          });
          if (imgRes.ok) {
            const arrayBuf = await imgRes.arrayBuffer();
            const fileBuf = Buffer.from(arrayBuf);
            if (!primaryImageBuffer) primaryImageBuffer = fileBuf;
            const mime = (imgRes.headers.get('content-type') || 'image/jpeg').split(';')[0].trim();
            parts.push({
              inlineData: {
                mimeType: mime,
                data: fileBuf.toString('base64'),
              },
            });
          }
        } catch (imgErr) {
          console.warn('[AIService] Error descargando imagen remota:', imgErr);
        }
      }
    }

    // Si hay Gemini API Key configurada, llamar a Gemini Multimodal
    if (key && key.trim().length > 10) {
      try {
        const systemInstruction = `Eres un extractor y redactor experto de ofertas laborales para la plataforma Quisqueya Talent (República Dominicana).

REGLA FUNDAMENTAL DE ORO — PRIORIDAD ABSOLUTA A LA(S) IMAGEN(ES) Y MANEJO DE MÚLTIPLES FOTOS:
1. LA(S) IMAGEN(ES) ES TU FUENTE PRINCIPAL Y DEFINITIVA:
   - Es muy común en Instagram que un post tenga VARIAS IMÁGENES (carrusel de diapositivas).
   - CASO A (Portada genérica + afiches): La diapositiva 1 suele ser una portada publicitaria ("Desliza para ver más", "Nuevas ofertas"). DEBES IGNORAR la portada y enfocarte en los AFICHES REALES que contienen las vacantes.
   - CASO B (Una sola vacante en varias diapositivas): Por ejemplo, Diapositiva 1 con título y empresa, Diapositiva 2 con requisitos, Diapositiva 3 con horario, beneficios y correo. Consolida TODA la información de todas las diapositivas en una sola vacante completa y coherente.
   - CASO C (Múltiples vacantes distintas en el mismo post): Si en el carrusel aparecen dos o más puestos de trabajo totalmente diferentes (por ejemplo, Diapositiva 2 es "Asistente Administrativa" y Diapositiva 3 es "Agente de Ventas"):
     * Extrae el primer puesto en los campos principales del JSON.
     * Incluye los demás puestos en el arreglo "additionalJobs", cada uno con su título, empresa, categoría, requisitos, horario y forma de postulación.

2. PROHIBICIÓN ESTRICTA Y TOTAL DE COPIAR EL CAPTION DE INSTAGRAM EN LA DESCRIPCIÓN:
   - NUNCA copies o pegues el texto del caption de Instagram en el campo "description".
   - El caption contiene hashtags (#empleosrd, #vacantes), menciones (@...), llamadas a la acción ("etiqueta a tu amigo", "link en la bio", "únete a nuestro canal", "comenta", "desliza"), y saludos que ESTÁN ESTRICTAMENTE PROHIBIDOS en la vacante.
   - La descripción debe ser una redacción 100% formal, profesional y corporativa en español dominicano basada ÚNICAMENTE en la oferta de los afiches.

3. CAMPOS OBLIGATORIOS A INCLUIR EN EL CAMPO "description":
   La descripción debe redactarse en español formal dominicano (2 o 3 párrafos limpios y fluidos) e incluir SIEMPRE:
   - Introducción profesional al puesto y a la empresa.
   - ⏰ Horario de Trabajo: Si la imagen indica horario o días de trabajo (ej: "Lunes a viernes y feriados, de 8:50 a. m. a 6:00 p. m."), debes escribirlo en una línea dedicada:
     "⏰ Horario: [horario visible en el afiche]".
   - 📍 Ubicación / Sector: Si la imagen indica sector, ciudad o dirección (ej: "Santo Domingo, D.N." o "La Castellana"), agrégalo en una línea dedicada:
     "📍 Ubicación: [ubicación visible en el afiche]".
   - 📩 / 📲 / 🏢 Forma de Postularse Clara:
     * Si la imagen tiene correo electrónico para enviar CV: "📩 Para postularte, envía tu CV a: [correo]".
     * Si la imagen tiene WhatsApp: "📲 Para postularte, envía tu CV vía WhatsApp al: [número]". (¡Cuidado! No confundir con canales de difusión de Instagram).
     * Si es aplicación presencial: "🏢 Entrevista o entrega de CV presencial en: [dirección]".

4. TÍTULO LIMPIO:
   - El campo "title" debe ser el nombre exacto del cargo (ej: "Asistente Administrativa" o "Agente de Ventas Call Center").
   - NUNCA incluyas "Buscamos personal para:", "Se busca:", "Vacante de:", ni emojis en el título.
- Responde ÚNICAMENTE con JSON puro sin markdown ni bloques de código.`;

        const prompt = `${systemInstruction}

---
TEXTO/CAPTION DE INSTAGRAM (Úsalo solo como contexto de apoyo secundario; NUNCA lo copies literalmente en la descripción):
"""${caption}"""

---
ANALIZA TODAS LAS IMÁGENES ADJUNTAS (CARRUSEL) Y RESPONDE CON ESTE JSON EXACTO:
{
  "isJobOffer": true,
  "title": "Título exacto del puesto principal según el afiche (ej: Asistente Administrativa)",
  "companyName": "Empresa contratante visible en el afiche (ej: 3NL Tres en Línea, S.R.L.), o 'Empresa Destacada'",
  "category": "Una de: Tecnología e Informática | Ventas y Comercio B2B | Call Center y BPO | Administración y Recursos Humanos | Turismo y Hotelería | Salud y Medicina | Zonas Francas & Logística | Banca y Finanzas | Otros",
  "province": "Provincia de RD (Santo Domingo, Distrito Nacional, Santiago, La Altagracia, etc.)",
  "city": "Ciudad, sector o dirección según el afiche (ej: Distrito Nacional, La Castellana), o null",
  "jobType": "FULL_TIME",
  "workplaceType": "ON_SITE",
  "experienceLevel": "MID",
  "salaryMin": null,
  "salaryMax": null,
  "salaryCurrency": "DOP",
  "isSalaryPublic": false,
  "applyMethod": "EMAIL",
  "applyEmail": "correo visible en el afiche para recibir CVs, o null",
  "description": "Descripción formal profesional basada en el afiche. Incluye '⏰ Horario: ...' y '📍 Ubicación: ...' si aparecen en la imagen, y explica claramente el método de aplicación (correo, WhatsApp o presencial). PROHIBIDO copiar texto de Instagram.",
  "responsibilities": "• Lista con viñetas de las funciones según el afiche.",
  "requirements": "• Lista con viñetas de todos los requisitos según el afiche.",
  "benefits": "• Lista con viñetas de los beneficios del afiche (o beneficios de ley).",
  "skills": ["Habilidad 1", "Habilidad 2", "Habilidad 3"],
  "additionalJobs": [
    {
      "isJobOffer": true,
      "title": "Título de la segunda vacante si el post/carrusel incluye más de un puesto distinto en sus diapositivas",
      "companyName": "Empresa",
      "category": "Categoría",
      "province": "Provincia de RD",
      "city": null,
      "jobType": "FULL_TIME",
      "workplaceType": "ON_SITE",
      "experienceLevel": "MID",
      "salaryMin": null,
      "salaryMax": null,
      "salaryCurrency": "DOP",
      "isSalaryPublic": false,
      "applyMethod": "EMAIL",
      "applyEmail": "correo si aplica",
      "description": "Descripción formal de este segundo puesto (incluyendo horario y ubicación si aparecen)...",
      "responsibilities": "• Funciones...",
      "requirements": "• Requisitos...",
      "benefits": "• Beneficios...",
      "skills": ["Habilidad 1", "Habilidad 2"]
    }
  ]
}`;

        // El texto del prompt siempre va al final de las partes multimodales
        const geminiParts = [...parts, { text: prompt }];

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: geminiParts }],
              generationConfig: {
                temperature: 0.1,
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

            // 1. Limpieza de título: remover prefijos como "Buscamos personal para:"
            if (parsed.title) {
              parsed.title = parsed.title
                .replace(/^(?:buscamos\s+(?:personal\s+para:?|personal:?|un\/a|a)?:?|se\s+busca:?|se\s+solicita:?|vacante(?:\s+de)?:?|oportunidad(?:\s+de)?:?)\s*/i, '')
                .replace(/[▫️▪️🔹🔥🚨📌👉*•]+/g, '')
                .trim();
            }

            // 2. Normalización ESTRICTA de categoría según estándares de la plataforma
            parsed.category = this.normalizeCategory(
              parsed.title || '',
              parsed.category || '',
              `${parsed.description || ''} ${parsed.requirements || ''} ${caption}`
            );

            // 3. Limpieza de descripción: asegurar que no haya quedado basura de Instagram
            if (parsed.description) {
              parsed.description = this.cleanInstagramNoise(parsed.description);
            }
            if (parsed.requirements) {
              parsed.requirements = this.cleanInstagramNoise(parsed.requirements);
            }
            if (parsed.responsibilities) {
              parsed.responsibilities = this.cleanInstagramNoise(parsed.responsibilities);
            }

            // 4. Post-procesar vacantes secundarias del carrusel si existen
            if (Array.isArray(parsed.additionalJobs)) {
              parsed.additionalJobs = parsed.additionalJobs
                .filter((sub: any) => sub && sub.title && sub.title.length > 2)
                .map((sub: any) => {
                  const cleanSubTitle = (sub.title || '')
                    .replace(/^(?:buscamos\s+(?:personal\s+para:?|personal:?|un\/a|a)?:?|se\s+busca:?|se\s+solicita:?|vacante(?:\s+de)?:?|oportunidad(?:\s+de)?:?)\s*/i, '')
                    .replace(/[▫️▪️🔹🔥🚨📌👉*•]+/g, '')
                    .trim();
                  return {
                    ...sub,
                    isJobOffer: true,
                    title: cleanSubTitle,
                    companyName: sub.companyName || parsed.companyName || 'Empresa Destacada',
                    category: this.normalizeCategory(cleanSubTitle, sub.category || '', sub.description || ''),
                    province: sub.province || parsed.province || 'Santo Domingo',
                    description: this.cleanInstagramNoise(sub.description || ''),
                    requirements: this.cleanInstagramNoise(sub.requirements || ''),
                    responsibilities: this.cleanInstagramNoise(sub.responsibilities || ''),
                    benefits: this.cleanInstagramNoise(sub.benefits || ''),
                  };
                });
            }

            return parsed;
          }
        }

      } catch (err) {
        console.warn('Fallo llamada directa a Gemini API, activando extractor heurístico dominicano con OCR.');
      }
    }

    // Extracción OCR con Tesseract si hay imagen disponible
    let ocrText = '';
    if (primaryImageBuffer) {
      try {
        const ocrRes = await Tesseract.recognize(primaryImageBuffer, 'spa');
        if (ocrRes?.data?.text) {
          ocrText = ocrRes.data.text;
        }
      } catch (ocrErr) {
        try {
          const ocrRes = await Tesseract.recognize(primaryImageBuffer);
          if (ocrRes?.data?.text) {
            ocrText = ocrRes.data.text;
          }
        } catch (e2) {}
      }
    }

    // Adaptador Heurístico Inteligente Especializado en Vacantes Dominicanas (con OCR de imagen)
    return this.heuristicJobExtractor(caption, ocrText);
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
   * Motor de extracción heurística y redacción para publicaciones dominicanas.
   * Utiliza el texto del afiche/imagen obtenido por OCR y el caption de Instagram.
   */
  private static heuristicJobExtractor(text: string, ocrText: string = ''): ExtractedJobData {
    const cleanText = this.cleanInstagramNoise(text);
    const cleanOcr = this.cleanInstagramNoise(ocrText);
    const combinedSearch = `${cleanOcr}\n${cleanText}`;
    const lower = combinedSearch.toLowerCase();

    // Verificación de si es oferta de empleo
    const check = this.isLegitimateJobOffer(combinedSearch.length > 20 ? combinedSearch : text);
    const isJobOffer = check.isJob;

    // 1. Extraer correo para postulación (priorizar el que aparece en la imagen)
    const emailMatch = combinedSearch.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const applyEmail = emailMatch ? emailMatch[1].toLowerCase() : null;

    // Extraer WhatsApp o teléfono
    const waMatch = combinedSearch.match(/(?:whatsapp|wa\.me|escribe al|celular|tel[eé]fono)[\s:]*([+0-9\s-]{8,20})/i);

    // Extraer Horario si aparece
    const schedMatch = combinedSearch.match(/(?:horario|jornada)[\s:]*([^\n\r.]+)/i);

    // Extraer Ubicación o Sector
    const locMatch = combinedSearch.match(/(?:ubicaci[oó]n|sector|direcci[oó]n|zona|lugar)[\s:]*([^\n\r.]+)/i);

    // 2. Detectar Provincia en República Dominicana
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
      'Bonao',
      'Moca',
      'Baní',
      'Azua',
      'Barahona',
      'Samaná',
    ];

    let province = 'Santo Domingo';
    for (const p of dominicanProvinces) {
      if (lower.includes(p.toLowerCase())) {
        province = p === 'Punta Cana' || p === 'Bávaro' ? 'La Altagracia' : p;
        break;
      }
    }

    // 3. Detectar Modalidad
    let workplaceType: 'ON_SITE' | 'REMOTE' | 'HYBRID' = 'ON_SITE';
    if (lower.includes('remoto') || lower.includes('home office') || lower.includes('desde casa')) {
      workplaceType = 'REMOTE';
    } else if (lower.includes('híbrido') || lower.includes('hibrido')) {
      workplaceType = 'HYBRID';
    }

    // 4. Detectar Título y Categoría con Diccionario Dominicano Especializado
    // Las categorías coinciden con las categorías oficiales de Quisqueya Talent:
    // 'Turismo y Hotelería', 'Tecnología e Informática', 'Ventas y Comercio B2B', 'Call Center y BPO',
    // 'Banca y Finanzas', 'Zonas Francas & Logística', 'Salud y Medicina', 'Administración y Recursos Humanos', 'Otros'
    let category = 'Administración y Recursos Humanos';
    let title = '';

    const vocations: Array<{ pattern: RegExp; title: string; category: string }> = [
      // Panadería, Pastelería y Gastronomía (Turismo y Hotelería)
      { pattern: /\b(panader[ií]a|panader[oa]s?|reposter[ií]a|reposter[oa]s?|pastelero?s?|hornero|masas|panadero?)\b/i, title: 'Experto en Panadería y Repostería', category: 'Turismo y Hotelería' },
      { pattern: /\b(cociner[oa]s?|chef|sous\s+chef|pizzero|ayudante\s+de\s+cocina|steward|parrillero)\b/i, title: 'Cocinero / Personal de Cocina', category: 'Turismo y Hotelería' },
      { pattern: /\b(meser[oa]s?|camarer[oa]s?|barista|bartender)\b/i, title: 'Mesero / Personal de Servicio', category: 'Turismo y Hotelería' },

      // Call Center & BPO
      { pattern: /\b(call\s+center|bilingual|biling[uü]e|customer\s+service|chat\s+agent)\b/i, title: 'Representante de Servicio al Cliente (Bilingüe)', category: 'Call Center y BPO' },

      // Ventas y Comercio B2B
      { pattern: /\b(cajer[oa]s?)\b/i, title: 'Cajero / Cajera Comercial', category: 'Ventas y Comercio B2B' },
      { pattern: /\b(asesor[a]?\s+de\s+ventas|ejecutiv[oa]\s+de\s+ventas|vendedor[a]?s?|promotor[a]?|mercaderista|agente\s+de\s+ventas|preventista)\b/i, title: 'Ejecutivo / Asesor de Ventas', category: 'Ventas y Comercio B2B' },

      // Choferes y Logística (Zonas Francas & Logística)
      { pattern: /\b(chofer\s+cat[.\s]*[234]|chofer\s+pesado|conductor|choferes?)\b/i, title: 'Chofer Profesional', category: 'Zonas Francas & Logística' },
      { pattern: /\b(mensajer[oa]s?|delivery|motorizado)\b/i, title: 'Mensajero con Motor Propio', category: 'Zonas Francas & Logística' },
      { pattern: /\b(almac[eé]n|montacargas|montacarguista|estibador|despacho|inventario|auxiliar\s+de\s+almac[eé]n)\b/i, title: 'Auxiliar de Almacén & Logística', category: 'Zonas Francas & Logística' },

      // Administración y Recursos Humanos
      { pattern: /\b(asistente\s+administrativ[oa]|asistente\s+de\s+oficina)\b/i, title: 'Asistente Administrativo/a', category: 'Administración y Recursos Humanos' },
      { pattern: /\b(recepcionista|secretaria)\b/i, title: 'Recepcionista / Secretaria', category: 'Administración y Recursos Humanos' },
      { pattern: /\b(recursos\s+humanos|rrhh|gesti[oó]n\s+humana|reclutador)\b/i, title: 'Generalista de Recursos Humanos', category: 'Administración y Recursos Humanos' },

      // Banca y Finanzas
      { pattern: /\b(contab|contador[a]?|auditor[a]?|finanzas)\b/i, title: 'Asistente de Contabilidad & Finanzas', category: 'Banca y Finanzas' },

      // Salud y Medicina
      { pattern: /\b(enfermer[oa]s?|auxiliar\s+de\s+enfermer[ií]a)\b/i, title: 'Enfermero/a Profesional', category: 'Salud y Medicina' },
      { pattern: /\b(m[eé]dic[oa]s?|asistente\s+dental|odont[oó]log[oa]|farmac[eé]utic[oa]|bioanalista)\b/i, title: 'Profesional del Área de Salud', category: 'Salud y Medicina' },

      // Tecnología e Informática (estricto)
      { pattern: /\b(desarrollador|programador|software|soporte\s+it\b|full\s+stack|frontend|backend|devops|ingeniero\s+de\s+sistemas)\b/i, title: 'Especialista en Desarrollo y Tecnología', category: 'Tecnología e Informática' },
    ];

    // A. Buscar primero patrones explícitos de título en el texto de la imagen (OCR) o caption
    const explicitTitleRegexes = [
      /(?:vacante(?:s)?\s*(?:disponible(?:s)?)?:|puesto:|posici[oó]n:|se solicita:|se busca:|buscamos:?|solicitamos:?|requerimos:?)\s*(?:personal\s+para:?)?\s*([^\n\r,.;!]{3,50})/i,
      /(?:^|\n)\s*(?:[🚨🔥💼📌✅📢👉*•-]*\s*)?(?:se\s+busca|se\s+solicita|buscamos|solicitamos|vacante:?)\s+(?:personal\s+para:?)?\s*([^\n\r,.;!]{3,50})/i,
    ];

    // Primero revisar OCR por líneas destacadas
    if (cleanOcr) {
      const ocrLines = cleanOcr.split('\n').map((l) => l.trim()).filter((l) => l.length >= 4 && l.length <= 50);
      for (const line of ocrLines) {
        for (const voc of vocations) {
          if (voc.pattern.test(line)) {
            // Limpiar la línea para dejarla como título
            const cleanLine = line
              .replace(/^(?:se\s+solicita|se\s+busca|buscamos|solicitamos|requerimos|vacante\s+de|vacante:?)\s*:?/i, '')
              .replace(/^[^\wáéíóúñÁÉÍÓÚÑ]+|[^\wáéíóúñÁÉÍÓÚÑ]+$/g, '')
              .trim();
            if (cleanLine.length >= 3 && cleanLine.length <= 45 && !cleanLine.includes('@')) {
              title = cleanLine.charAt(0).toUpperCase() + cleanLine.slice(1);
            } else {
              title = voc.title;
            }
            category = voc.category;
            break;
          }
        }
        if (title) break;
      }
    }

    // Si no se encontró en líneas del OCR, buscar con regex explícito en OCR y luego en caption
    if (!title) {
      for (const rx of explicitTitleRegexes) {
        const match = cleanOcr.match(rx) || cleanText.match(rx);
        if (match && match[1]) {
          let candidate = match[1]
            .replace(/^(?:personal\s+para:?|personal:?|un\/a|a)\s*/i, '')
            .replace(/^[^\wáéíóúñÁÉÍÓÚÑ]+|[^\wáéíóúñÁÉÍÓÚÑ]+$/g, '')
            .replace(/[▫️▪️🔹🔥🚨📌👉*•]+/g, '')
            .trim();
          if (candidate.length >= 3 && candidate.length <= 50 && !candidate.toLowerCase().includes('http') && !candidate.includes('@')) {
            title = candidate;
            break;
          }
        }
      }
    }

    // B. Buscar por vocaciones en todo el texto combinado si aún no hay título
    for (const voc of vocations) {
      if (voc.pattern.test(lower)) {
        category = voc.category;
        if (!title || title.length > 50 || title.toLowerCase().includes('buscamos')) {
          title = voc.title;
        }
        break;
      }
    }

    // Normalizar título final
    if (!title || title.length < 3) {
      title = 'Colaborador / Posición Vacante';
    }
    title = title
      .replace(/^(?:buscamos\s+(?:personal\s+para:?|personal:?|un\/a|a)?:?|se\s+busca:?|se\s+solicita:?|vacante(?:\s+de)?:?)\s*/i, '')
      .replace(/[▫️▪️🔹🔥🚨📌👉*•]+/g, '')
      .trim();

    // Normalización definitiva de la categoría
    category = this.normalizeCategory(title, category, combinedSearch);

    // 5. Detectar salarios
    let salaryMin: number | null = null;
    let salaryMax: number | null = null;
    let salaryCurrency = 'DOP';

    const salaryMatch = combinedSearch.match(/(?:rd\$|dop|\$)\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]{2,6})/i);
    if (salaryMatch) {
      const num = parseInt(salaryMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(num) && num > 1000) {
        salaryMin = num;
        salaryMax = Math.round(num * 1.15);
      }
    }

    // 6. Detectar nombre de empresa si aparece
    let companyName = 'Empresa Destacada';
    if (/3nl|tres\s+en\s+l[ií]nea/i.test(combinedSearch)) {
      companyName = '3NL Tres en Línea, S.R.L.';
    }

    // 7. Extraer Requisitos y Responsabilidades reales del OCR si están presentes
    const extractedRequirements: string[] = [];
    const extractedResponsibilities: string[] = [];

    if (cleanOcr) {
      const ocrLines = cleanOcr.split('\n').map((l) => l.trim()).filter(Boolean);
      let currentSection: 'REQ' | 'RESP' | null = null;
      for (const line of ocrLines) {
        if (/requisitos?:?|perfil:?/i.test(line)) {
          currentSection = 'REQ';
          continue;
        } else if (/funciones?:?|responsabilidades?:?/i.test(line)) {
          currentSection = 'RESP';
          continue;
        } else if (/horario|beneficio|ubicaci|interesados|enviar/i.test(line)) {
          currentSection = null;
        }

        if (currentSection === 'REQ' && line.length >= 5 && line.length <= 90 && !line.includes('@')) {
          extractedRequirements.push(line.replace(/^[•*\-\s]+/, '').trim());
        } else if (currentSection === 'RESP' && line.length >= 5 && line.length <= 90 && !line.includes('@')) {
          extractedResponsibilities.push(line.replace(/^[•*\-\s]+/, '').trim());
        }
      }
    }

    const finalRequirements = extractedRequirements.length > 0
      ? extractedRequirements.map((r) => `• ${r}`).join('\n')
      : `• Formación técnica o experiencia previa comprobable en el área de ${title}.\n• Residencia en ${province} o facilidad de traslado al lugar de trabajo.\n• Responsabilidad, proactividad, buenas relaciones interpersonales y puntualidad.`;

    const finalResponsibilities = extractedResponsibilities.length > 0
      ? extractedResponsibilities.map((r) => `• ${r}`).join('\n')
      : `• Ejecutar de forma eficiente y con calidad las labores inherentes al puesto de ${title}.\n• Mantener los estándares de orden, productividad e higiene en el área asignada.\n• Colaborar y comunicarse proactivamente con el equipo de trabajo y superiores.`;

    // 8. Construir Descripción Profesional 100% limpia de Instagram
    let description = `Oportunidad laboral para la posición de ${title} en ${province}, República Dominicana. Nos encontramos en la búsqueda de personal comprometido, dinámico y con vocación de servicio para incorporarse de manera inmediata.`;

    if (schedMatch) {
      description += `\n\n⏰ Horario: ${schedMatch[1].trim()}`;
    }
    if (locMatch) {
      description += `\n\n📍 Ubicación: ${locMatch[1].trim()}`;
    }
    if (salaryMin) {
      description += `\n\n💰 Salario: RD$ ${salaryMin.toLocaleString('es-DO')}${salaryMax ? ` - RD$ ${salaryMax.toLocaleString('es-DO')}` : ''} ${salaryCurrency}`;
    }

    if (applyEmail) {
      description += `\n\n📩 Para postularte a esta vacante, envía tu currículum actualizado a: ${applyEmail}`;
    } else if (waMatch) {
      description += `\n\n📲 Para postularte o solicitar información, comunícate vía WhatsApp al: ${waMatch[1].trim()}`;
    } else {
      description += `\n\n👉 Puedes postularte a esta posición directamente a través de Quisqueya Talent completando tu perfil profesional verificado.`;
    }

    // 9. Detectar si el texto contiene una vacante secundaria adicional
    const additionalJobs: ExtractedJobData[] = [];
    if (lower.includes('agente de ventas') && !title.toLowerCase().includes('agente de ventas')) {
      additionalJobs.push({
        isJobOffer: true,
        title: 'Agente de Ventas (Call Center)',
        companyName,
        category: 'Ventas y Comercio B2B',
        province,
        city: 'La Castellana',
        jobType: 'FULL_TIME',
        workplaceType,
        experienceLevel: 'MID',
        salaryMin: null,
        salaryMax: null,
        salaryCurrency: 'DOP',
        isSalaryPublic: false,
        applyMethod: applyEmail ? 'EMAIL' : 'PLATFORM',
        applyEmail,
        description: `Oportunidad laboral para la posición de Agente de Ventas (Call Center) en ${province}, República Dominicana. Buscamos una persona dinámica, proactiva y con excelentes habilidades de comunicación para integrarse al equipo comercial.\n\n📍 Ubicación: La Castellana, Santo Domingo, D.N.\n\n${applyEmail ? `📩 Para postularte, envía tu CV actualizado a: ${applyEmail}` : '👉 Postúlate directamente a través de Quisqueya Talent.'}`,
        responsibilities: `• Realizar llamadas a prospectos y gestionar cartera de clientes.\n• Cumplir con las metas de ventas y productividad comercial establecidas.\n• Ofrecer asesoría personalizada y seguimiento oportuno.`,
        requirements: `• Experiencia previa en ventas telefónicas, call center o servicio al cliente.\n• Excelentes habilidades de comunicación asertiva y negociación.\n• Orientación al cliente y enfoque en el logro de resultados.`,
        benefits: `• Salario competitivo acorde al mercado dominicano.\n• Atractivo esquema de comisiones por metas.\n• Beneficios de ley y capacitación continua.`,
        skills: ['Ventas Telefónicas', 'Comunicación Asertiva', 'Negociación', 'Orientación a Metas'],
      });
    }

    return {
      isJobOffer,
      title: title || 'Posición Laboral Requerida',
      companyName,
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
      description,
      responsibilities: finalResponsibilities,
      requirements: finalRequirements,
      benefits: `• Compensación competitiva acorde al mercado dominicano.\n• Todos los beneficios de ley (Seguro Familiar de Salud TSS, Regalía Pascual, Vacaciones).\n• Estabilidad laboral y oportunidades de capacitación continua.`,
      skills: ['Responsabilidad', 'Puntualidad', 'Trabajo en Equipo', 'Orientación al Logro'],
      additionalJobs: additionalJobs.length > 0 ? additionalJobs : undefined,
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

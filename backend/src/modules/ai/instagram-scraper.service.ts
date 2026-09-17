import crypto from 'crypto';
import prisma from '../../config/prisma';
import AIService, { ExtractedJobData } from './ai.service';

export interface ScrapedPost {
  id: string; // shortcode o ID único (web-hash o IG shortcode)
  url: string;
  caption: string;
  imageUrl: string;
  author?: string;
  publishedAt: Date;
  extractedData?: ExtractedJobData;
}

export interface ScanResult {
  username: string;
  sourceType: 'WEB_LISTING' | 'WEB_SINGLE' | 'INSTAGRAM_POST' | 'INSTAGRAM_PROFILE';
  totalFound: number;
  newEnqueued: number;
  skippedDuplicates: number;
  skippedTooOld: number;
  message?: string;
  items: any[];
}

export class InstagramScraperService {
  /**
   * Normaliza texto HTML a texto plano limpio y legible
   */
  static cleanHtmlToText(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&iexcl;/gi, '¡')
      .replace(/&iquest;/gi, '¿')
      .replace(/&aacute;/gi, 'á')
      .replace(/&eacute;/gi, 'é')
      .replace(/&iacute;/gi, 'í')
      .replace(/&oacute;/gi, 'ó')
      .replace(/&uacute;/gi, 'ú')
      .replace(/&ntilde;/gi, 'ñ')
      .replace(/&Aacute;/gi, 'Á')
      .replace(/&Eacute;/gi, 'É')
      .replace(/&Iacute;/gi, 'Í')
      .replace(/&Oacute;/gi, 'Ó')
      .replace(/&Uacute;/gi, 'Ú')
      .replace(/&Ntilde;/gi, 'Ñ')
      .replace(/&zwj;/gi, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
      .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(parseInt(code, 10)))
      .replace(/\s{2,}/g, ' ')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  }

  /**
   * Extrae esquema estructurado Schema.org JobPosting de una página web
   */
  static extractJsonLdJob(html: string): any {
    const jsonLdRegex = /<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        const items = Array.isArray(data) ? data : data['@graph'] ? data['@graph'] : [data];
        for (const item of items) {
          if (item['@type'] === 'JobPosting') {
            return item;
          }
        }
      } catch (e) {}
    }
    return null;
  }

  /**
   * Extrae los datos de una vacante individual de cualquier página web
   */
  static async scrapeSingleWebJob(url: string): Promise<ScrapedPost | null> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-DO,es;q=0.9,en;q=0.8',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) return null;
      const html = await res.text();

      const jsonJob = this.extractJsonLdJob(html);

      const ogTitle =
        (
          html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i) ||
          html.match(/<meta\s+name="twitter:title"\s+content="([^"]*)"/i)
        )?.[1] || '';
      const ogDesc =
        (
          html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i) ||
          html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)
        )?.[1] || '';
      const ogImage =
        (
          html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/i) ||
          html.match(/<meta\s+name="twitter:image"\s+content="([^"]*)"/i)
        )?.[1] || '';

      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const cleanText = this.cleanHtmlToText(bodyMatch ? bodyMatch[1] : html);

      const title = (jsonJob?.title || ogTitle || 'Vacante Laboral')
        .replace(/\s*•\s*Tu Empleo RD.*$/i, '')
        .replace(/\s*-\s*Aldaba.*$/i, '')
        .replace(/\s*-\s*Computrabajo.*$/i, '')
        .trim();

      const description = jsonJob?.description
        ? this.cleanHtmlToText(jsonJob.description)
        : ogDesc && ogDesc.length > 30
        ? `${ogDesc}\n\n${cleanText.slice(0, 1200)}`
        : cleanText.slice(0, 1500);

      const companyName = jsonJob?.hiringOrganization?.name || 'Empresa Destacada';
      const postDate = jsonJob?.datePosted ? new Date(jsonJob.datePosted) : new Date();

      const idHash = 'web-' + crypto.createHash('md5').update(url).digest('hex').slice(0, 16);
      const combinedCaption = `${title}\nEmpresa: ${companyName}\n\n${description}`;

      // Pre-extraer con el extractor inteligente
      const extractedData = await AIService.parseJobFromPost({ caption: combinedCaption });
      if (title && title.length > 3 && (extractedData.title === 'Posición Laboral Requerida' || !extractedData.title)) {
        extractedData.title = title;
      }
      if (companyName && companyName !== 'Empresa Destacada' && companyName !== 'Empresa Confidencial') {
        extractedData.companyName = companyName;
      }

      return {
        id: idHash,
        url,
        caption: combinedCaption,
        imageUrl: ogImage,
        publishedAt: isNaN(postDate.getTime()) ? new Date() : postDate,
        extractedData,
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Detecta y extrae múltiples vacantes desde una página de listado o portal de empleos
   */
  static async scrapeListingWebJobs(listingUrl: string, maxItems = 12): Promise<ScrapedPost[]> {
    try {
      const parsedUrl = new URL(listingUrl);
      const baseDomain = parsedUrl.origin;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(listingUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-DO,es;q=0.9,en;q=0.8',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) return [];
      const html = await res.text();

      // Encontrar todos los enlaces a vacantes internas
      const linkRegex = /href="([^"]+)"/gi;
      let match;
      const candidateUrls = new Set<string>();

      while ((match = linkRegex.exec(html)) !== null) {
        const raw = match[1].trim();
        if (!raw || raw.startsWith('#') || raw.startsWith('javascript:')) continue;
        try {
          const full = new URL(raw, baseDomain).href;
          const lower = full.toLowerCase();
          if (
            (lower.includes('/empleo/') ||
              lower.includes('/vacante/') ||
              lower.includes('/oferta/') ||
              lower.includes('/job/') ||
              lower.includes('/puesto/')) &&
            !lower.includes('/category/') &&
            !lower.includes('/categoria/') &&
            !lower.includes('/tag/') &&
            !lower.includes('/page/') &&
            !lower.includes('feed') &&
            !lower.includes('wp-') &&
            full !== listingUrl
          ) {
            candidateUrls.add(full);
          }
        } catch (e) {}
      }

      const jobUrls = [...candidateUrls].slice(0, maxItems);
      if (jobUrls.length === 0) return [];

      const posts: ScrapedPost[] = [];
      for (const jobUrl of jobUrls) {
        const post = await this.scrapeSingleWebJob(jobUrl);
        if (post) {
          posts.push(post);
        }
      }

      return posts;
    } catch (e) {
      return [];
    }
  }

  /**
   * Decodifica entidades HTML y emojis en textos extraídos
   */
  static decodeHtmlEntities(str: string): string {
    if (!str) return '';
    return str
      .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
      .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(parseInt(code, 10)))
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .trim();
  }

  /**
   * Extrae información de una publicación específica de Instagram (post o reel)
   */
  static async fetchSingleInstagramPost(shortcode: string, fullUrl: string): Promise<ScrapedPost | null> {
    try {
      const res = await fetch(`https://www.instagram.com/p/${shortcode}/`, {
        headers: {
          'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-DO,es;q=0.9,en;q=0.8',
        },
      });

      if (res.ok) {
        const html = await res.text();
        const ogTitleRaw =
          (
            html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i) ||
            html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)
          )?.[1] || '';
        const ogDescRaw =
          (
            html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i) ||
            html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)
          )?.[1] || '';
        const ogImageRaw = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/i)?.[1] || '';

        const ogTitle = this.decodeHtmlEntities(ogTitleRaw);
        const ogDesc = this.decodeHtmlEntities(ogDescRaw);
        const ogImage = this.decodeHtmlEntities(ogImageRaw).replace(/&amp;/g, '&');

        // Detectar usuario autor de la publicación (ej: "... - empleos_parati_rd on/el September 16, 2026")
        const authorMatch =
          ogDesc.match(/(?:likes|comments|me gusta|comentarios)\s*-\s*([a-zA-Z0-9._]+)\s+(?:on|el|le)\s+/i) ||
          ogDesc.match(/-\s*([a-zA-Z0-9._]+)\s+(?:on|el|le)\s+[A-Za-z]+\s+\d+/i);
        const author = authorMatch ? authorMatch[1].toLowerCase() : '';

        // Limpiar el prefijo de contadores de Instagram en la descripción
        let caption = ogDesc
          .replace(/^[0-9,KMk\s]+likes,\s+[0-9,KMk\s]+comments\s+-\s+[^:]+:\s*"?/i, '')
          .replace(/^[0-9,KMk\s]+me gusta,\s+[0-9,KMk\s]+comentarios\s+-\s+[^:]+:\s*"?/i, '')
          .replace(/"?\.\s*$/i, '')
          .trim();

        if (!caption && ogTitle) {
          caption = ogTitle.replace(/^[^\"]*:\s*\"?/i, '').replace(/"?\s*$/i, '').trim();
        }

        // Pre-extraer los datos de la vacante con IA
        let extractedData: ExtractedJobData | undefined;
        try {
          if (caption && caption.length > 20) {
            extractedData = await AIService.parseJobFromPost({ caption, imageUrl: ogImage });
          }
        } catch (e) {}

        return {
          id: shortcode,
          url: fullUrl,
          caption: caption || `Publicación de empleo en Instagram (${shortcode})`,
          imageUrl: ogImage,
          author,
          publishedAt: new Date(),
          extractedData,
        };
      }
    } catch (e) {}

    return {
      id: shortcode,
      url: fullUrl,
      caption: `Vacante detectada desde Instagram post ${shortcode}`,
      imageUrl: '',
      publishedAt: new Date(),
    };
  }

  /**
   * Normaliza cualquier URL o @mención a un nombre de usuario limpio
   */
  static cleanUsername(input: string): string {
    let clean = input.trim();
    if (clean.startsWith('@')) {
      clean = clean.substring(1);
    }
    try {
      if (clean.includes('instagram.com/')) {
        const parts = clean.split('instagram.com/')[1].split('/')[0].split('?')[0];
        clean = parts;
      }
    } catch (e) {}
    return clean.replace(/[^a-zA-Z0-9._]/g, '').toLowerCase();
  }

  /**
   * Intenta extraer posts recientes de un perfil de Instagram usando múltiples estrategias
   */
  /**
   * Intenta extraer posts recientes de un perfil de Instagram usando múltiples estrategias
   */
  static async fetchProfilePosts(username: string, sessionId?: string): Promise<ScrapedPost[]> {
    const posts: ScrapedPost[] = [];
    const cleanUser = this.cleanUsername(username);

    // 1. Obtener la sesión activa garantizada
    let rawSession = (sessionId || process.env.INSTAGRAM_SESSION_ID || '').trim();
    rawSession = rawSession.replace(/^["']|["']$/g, '').trim();

    if (!rawSession) {
      try {
        const setting = await prisma.aiJobSetting.findUnique({ where: { id: 'default' } });
        if (setting?.instagramSessionId) {
          rawSession = setting.instagramSessionId.trim();
        }
      } catch (e) {}
    }

    // Preparar encabezado Cookie normalizado
    let cookieHeader = '';
    if (rawSession && rawSession.length > 5) {
      if (rawSession.includes(';')) {
        cookieHeader = rawSession.replace(/^Cookie:\s*/i, '');
      } else {
        const cleanSession = rawSession.replace(/^sessionid=/, '').trim();
        const dsUserIdMatch = cleanSession.match(/^(\d+)/);
        const dsUserId = dsUserIdMatch ? dsUserIdMatch[1] : '';
        cookieHeader = `sessionid=${cleanSession};${dsUserId ? ` ds_user_id=${dsUserId};` : ''}`;
      }
    }

    // Helper para mapear nodos devueltos por Instagram
    const parseNodes = (edges: any[]) => {
      const results: ScrapedPost[] = [];
      for (const edge of edges) {
        const node = edge.node || edge;
        if (!node) continue;

        const shortcode = node.shortcode || node.code || node.id;
        if (!shortcode) continue;

        const caption =
          node.edge_media_to_caption?.edges?.[0]?.node?.text ||
          node.caption?.text ||
          node.caption ||
          '';
        const imageUrl =
          node.display_url ||
          node.display_src ||
          node.thumbnail_src ||
          node.image_versions2?.candidates?.[0]?.url ||
          '';
        const timestamp = node.taken_at_timestamp
          ? new Date(node.taken_at_timestamp * 1000)
          : node.device_timestamp
          ? new Date(node.device_timestamp * 1000)
          : new Date();

        results.push({
          id: shortcode,
          url: `https://www.instagram.com/p/${shortcode}/`,
          caption: typeof caption === 'string' ? caption : '',
          imageUrl: typeof imageUrl === 'string' ? imageUrl : '',
          publishedAt: timestamp,
        });
      }
      return results;
    };

    // Estrategia 1: Consulta oficial a web_profile_info con headers de escritorio Chrome
    if (cookieHeader) {
      try {
        console.log(`[Instagram Scraper] Consultando @${cleanUser} en Instagram con sesión...`);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        const response = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${cleanUser}`, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'x-ig-app-id': '936619743392459',
            'x-asbd-id': '129477',
            'x-requested-with': 'XMLHttpRequest',
            'Accept-Language': 'es-DO,es;q=0.9,en;q=0.8',
            Cookie: cookieHeader,
            Referer: `https://www.instagram.com/${cleanUser}/`,
            Accept: '*/*',
          },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        console.log(`[Instagram Scraper] Respuesta web_profile_info para @${cleanUser}: HTTP ${response.status}`);

        if (response.ok) {
          const json: any = await response.json();
          const edges = json?.data?.user?.edge_owner_to_timeline_media?.edges || [];
          const parsed = parseNodes(edges);
          if (parsed.length > 0) return parsed;
        }
      } catch (e: any) {
        console.warn(`[Instagram Scraper] Fallo web_profile_info para @${cleanUser}:`, e?.message);
      }

      // Estrategia 2: GraphQL Query oficial de Instagram Web
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const variables = JSON.stringify({ data: { count: 12 }, username: cleanUser });
        const gqlUrl = `https://www.instagram.com/graphql/query/?doc_id=7427845727339794&variables=${encodeURIComponent(variables)}`;

        const gqlRes = await fetch(gqlUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'x-ig-app-id': '936619743392459',
            Cookie: cookieHeader,
            Referer: `https://www.instagram.com/${cleanUser}/`,
            Accept: '*/*',
          },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (gqlRes.ok) {
          const gqlJson: any = await gqlRes.json();
          const edges =
            gqlJson?.data?.user?.edge_owner_to_timeline_media?.edges ||
            gqlJson?.data?.xdt_api__v1__feed__user_timeline_graphql_connection?.edges ||
            [];
          const parsed = parseNodes(edges);
          if (parsed.length > 0) return parsed;
        }
      } catch (e) {}

      // Estrategia 3: User-Agent móvil con sesión
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const mobRes = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${cleanUser}`, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
            'x-ig-app-id': '936619743392459',
            'x-asbd-id': '129477',
            Cookie: cookieHeader,
            Referer: `https://www.instagram.com/${cleanUser}/`,
            Accept: '*/*',
          },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (mobRes.ok) {
          const mobJson: any = await mobRes.json();
          const edges = mobJson?.data?.user?.edge_owner_to_timeline_media?.edges || [];
          const parsed = parseNodes(edges);
          if (parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }

    // Estrategia 4: Consulta anónima directa
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${cleanUser}`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
          'x-ig-app-id': '936619743392459',
          Referer: `https://www.instagram.com/${cleanUser}/`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        const json: any = await response.json();
        const edges = json?.data?.user?.edge_owner_to_timeline_media?.edges || [];
        const parsed = parseNodes(edges);
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {}

    // Estrategia 5: Gateways de feed público de Instagram (RSS-Bridge JSON Feed)
    const bridgeUrls = [
      `https://rss-bridge.org/bridge01/?action=display&bridge=Instagram&context=Username&u=${cleanUser}&format=Json`,
      `https://feed.eugenemolotov.ru/?action=display&bridge=Instagram&context=Username&u=${cleanUser}&format=Json`,
    ];

    for (const bUrl of bridgeUrls) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 9000);

        const res = await fetch(bUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            Accept: 'application/json',
          },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data: any = await res.json();
          const items = data.items || [];
          for (const item of items) {
            const shortcodeMatch = (item.url || item.id || '').match(/\/(?:p|reel)\/([a-zA-Z0-9_-]+)/);
            const shortcode = shortcodeMatch ? shortcodeMatch[1] : '';
            if (!shortcode) continue;

            const rawCaption = item.content_html || item.title || '';
            const cleanCaption = this.cleanHtmlToText(rawCaption);
            const imageUrl =
              item.image || item.attachments?.[0]?.url || `https://www.instagram.com/p/${shortcode}/media?size=l`;
            const publishedAt = item.date_published ? new Date(item.date_published) : new Date();

            posts.push({
              id: shortcode,
              url: item.url || `https://www.instagram.com/p/${shortcode}/`,
              caption: cleanCaption,
              imageUrl,
              publishedAt: isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
            });
          }

          if (posts.length > 0) {
            console.log(
              `✨ [Instagram Scraper] ¡Éxito! ${posts.length} publicaciones extraídas del perfil @${cleanUser}`
            );
            return posts;
          }
        }
      } catch (e: any) {
        console.warn(`[Instagram Scraper] Bridge fallo para @${cleanUser}:`, e?.message);
      }
    }

    return posts;
  }

  /**
   * Escaneo universal inteligente: acepta enlaces de portales web (Tu Empleo RD, Aldaba, Computrabajo, etc.),
   * enlaces individuales de vacantes, enlaces de posts de Instagram o perfiles de Instagram.
   */
  static async scanAndEnqueue(urlOrUsername: string, maxDays = 30, sessionId?: string): Promise<ScanResult> {
    const raw = urlOrUsername.trim();
    if (!raw) {
      throw new Error('Debes proporcionar un enlace web, perfil o publicación');
    }

    // Soporte para múltiples URLs (separadas por salto de línea, coma o espacio)
    const rawUrls = raw
      .split(/[\r\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http://') || u.startsWith('https://'));

    if (rawUrls.length > 1) {
      let combinedNewEnqueued = 0;
      let combinedDuplicates = 0;
      let combinedTooOld = 0;
      let totalFound = 0;
      const allItems: any[] = [];
      let lastUsername = '';

      for (const singleUrl of rawUrls) {
        try {
          const res = await this.scanAndEnqueue(singleUrl, maxDays, sessionId);
          combinedNewEnqueued += res.newEnqueued;
          combinedDuplicates += res.skippedDuplicates;
          combinedTooOld += res.skippedTooOld;
          totalFound += res.totalFound;
          allItems.push(...res.items);
          if (res.username) lastUsername = res.username;
        } catch (e) {}
      }

      return {
        username: lastUsername || 'múltiples_enlaces',
        sourceType: 'INSTAGRAM_POST',
        totalFound,
        newEnqueued: combinedNewEnqueued,
        skippedDuplicates: combinedDuplicates,
        skippedTooOld: combinedTooOld,
        message: `Se procesaron ${rawUrls.length} enlaces: ${combinedNewEnqueued} nuevas vacantes añadidas a la cola (${combinedDuplicates} ya existían).`,
        items: allItems,
      };
    }

    const activeSession = (sessionId || process.env.INSTAGRAM_SESSION_ID || '').trim();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxDays);

    let sourceType: 'WEB_LISTING' | 'WEB_SINGLE' | 'INSTAGRAM_POST' | 'INSTAGRAM_PROFILE' = 'INSTAGRAM_PROFILE';
    let username = '';
    let profileUrl = '';
    let rawPosts: ScrapedPost[] = [];

    const isWebUrl =
      raw.startsWith('http://') ||
      raw.startsWith('https://') ||
      (raw.includes('.') && raw.includes('/') && !raw.startsWith('@'));
    const fullUrl = raw.startsWith('http') ? raw : `https://${raw}`;

    if (isWebUrl) {
      let parsed: URL;
      try {
        parsed = new URL(fullUrl);
      } catch (e) {
        throw new Error('URL inválida proporcionada');
      }

      const hostname = parsed.hostname.toLowerCase();

      // Caso 1: Enlace de Instagram (post, reel o perfil)
      if (hostname.includes('instagram.com')) {
        const pathname = parsed.pathname;
        if (pathname.includes('/p/') || pathname.includes('/reel/')) {
          sourceType = 'INSTAGRAM_POST';
          const shortcodeMatch = pathname.match(/\/(?:p|reel)\/([a-zA-Z0-9_-]+)/);
          const shortcode = shortcodeMatch ? shortcodeMatch[1] : `ig_${Date.now()}`;
          username = `ig_post_${shortcode}`;
          profileUrl = fullUrl;

          const singlePost = await this.fetchSingleInstagramPost(shortcode, fullUrl);
          if (singlePost) {
            rawPosts.push(singlePost);
            if (singlePost.author) {
              username = singlePost.author;
              profileUrl = `https://www.instagram.com/${singlePost.author}/`;
            }
          }
        } else {
          sourceType = 'INSTAGRAM_PROFILE';
          username = this.cleanUsername(raw);
          profileUrl = `https://www.instagram.com/${username}/`;
          rawPosts = await this.fetchProfilePosts(username, activeSession);
        }
      } else {
        // Caso 2: Sitio web externo (portal de empleo o empresa)
        username = hostname.replace(/^www\./, '');
        profileUrl = fullUrl;

        // Intentar primero ver si es una página de listado con múltiples vacantes
        const listingPosts = await this.scrapeListingWebJobs(fullUrl, 15);
        if (listingPosts.length > 0) {
          sourceType = 'WEB_LISTING';
          rawPosts = listingPosts;
        } else {
          // Si no contiene lista de vacantes, analizar como vacante individual
          sourceType = 'WEB_SINGLE';
          const singleJob = await this.scrapeSingleWebJob(fullUrl);
          if (singleJob) {
            rawPosts.push(singleJob);
          }
        }
      }
    } else {
      // Caso 3: Nombre de usuario de Instagram directo (@usuario)
      sourceType = 'INSTAGRAM_PROFILE';
      username = this.cleanUsername(raw);
      profileUrl = `https://www.instagram.com/${username}/`;
      rawPosts = await this.fetchProfilePosts(username, activeSession);
    }

    // Asegurar o crear la fuente monitoreada
    const source = await prisma.instagramSource.upsert({
      where: { username },
      update: {
        lastScannedAt: new Date(),
        profileUrl,
        isActive: true,
      },
      create: {
        username,
        profileUrl,
        lastScannedAt: new Date(),
        isActive: true,
      },
    });

    let newEnqueued = 0;
    let skippedDuplicates = 0;
    let skippedTooOld = 0;
    const enqueuedItems: any[] = [];

    for (const post of rawPosts) {
      if (post.publishedAt < cutoffDate) {
        skippedTooOld++;
        continue;
      }

      const existing = await prisma.aiJobQueue.findUnique({
        where: { instagramPostId: post.id },
      });

      if (existing) {
        skippedDuplicates++;
        if (!existing.sourceId) {
          await prisma.aiJobQueue.update({
            where: { id: existing.id },
            data: { sourceId: source.id },
          });
        }
        continue;
      }

      // Si el post no tiene imagen o el caption vino recortado, recuperarlo con el extractor individual OpenGraph
      if (!post.imageUrl || !post.caption || post.caption.length < 20) {
        try {
          const enriched = await this.fetchSingleInstagramPost(post.id, post.url);
          if (enriched) {
            if (enriched.caption && enriched.caption.length > (post.caption || '').length) {
              post.caption = enriched.caption;
            }
            if (enriched.imageUrl && !post.imageUrl) {
              post.imageUrl = enriched.imageUrl;
            }
            if (enriched.extractedData && !post.extractedData) {
              post.extractedData = enriched.extractedData;
            }
          }
        } catch (e) {}
      }

      // Si aún no se extrajeron los datos estructurados con IA, ejecutar el parser de vacantes
      if (!post.extractedData && post.caption && post.caption.length > 20) {
        try {
          post.extractedData = await AIService.parseJobFromPost({ caption: post.caption, imageUrl: post.imageUrl });
        } catch (e) {}
      }

      let initialStatus: 'PENDING' | 'DISCARDED' = 'PENDING';
      let isJobOffer = true;

      // Si viene de una página web con formato de vacante, es legítima por defecto
      if (sourceType.startsWith('WEB_')) {
        isJobOffer = true;
        initialStatus = 'PENDING';
      } else if (post.caption && post.caption.length > 15) {
        const check = AIService.isLegitimateJobOffer(post.caption);
        if (!check.isJob) {
          initialStatus = 'DISCARDED';
          isJobOffer = false;
        }
      }

      const queueItem = await prisma.aiJobQueue.create({
        data: {
          sourceId: source.id,
          instagramPostId: post.id,
          postUrl: post.url,
          postDate: post.publishedAt,
          imageUrl: post.imageUrl || null,
          captionText: post.caption || '',
          isJobOffer,
          status: initialStatus,
          extractedData: post.extractedData ? JSON.stringify(post.extractedData) : null,
        },
      });

      if (initialStatus === 'PENDING') {
        newEnqueued++;
      }
      enqueuedItems.push(queueItem);
    }

    let message = `Escaneo completado para ${username}`;
    if (sourceType === 'WEB_LISTING') {
      message = `Portal web analizado: ${rawPosts.length} vacantes detectadas, ${newEnqueued} nuevas añadidas a la cola (${skippedDuplicates} ya existían).`;
    } else if (sourceType === 'WEB_SINGLE') {
      message =
        newEnqueued > 0
          ? `Vacante web extraída y añadida a la cola con éxito desde ${username}.`
          : skippedDuplicates > 0
          ? `Esta vacante web ya se encontraba registrada en la cola.`
          : `No se pudo extraer la vacante de la página indicada.`;
    } else if (sourceType === 'INSTAGRAM_POST') {
      message =
        newEnqueued > 0
          ? `¡Éxito! Vacante extraída de Instagram (@${username}) con su afiche y encolada para redacción con IA.`
          : skippedDuplicates > 0
          ? `Esta publicación de vacante ya se encontraba en la cola.`
          : `No se pudo extraer la información del post de Instagram.`;
    } else if (sourceType === 'INSTAGRAM_PROFILE' && newEnqueued === 0 && skippedDuplicates === 0) {
      if (!activeSession) {
        message = `Instagram bloqueó la lectura del perfil @${username} (error 429 de Meta). Puedes pegar el link del post directamente (ej: https://www.instagram.com/p/...) o configurar tu cookie sessionid abajo para el monitoreo automático.`;
      }
    }

    return {
      username,
      sourceType,
      totalFound: rawPosts.length,
      newEnqueued,
      skippedDuplicates,
      skippedTooOld,
      message,
      items: enqueuedItems,
    };
  }
}

export const UniversalScraperService = InstagramScraperService;
export default InstagramScraperService;

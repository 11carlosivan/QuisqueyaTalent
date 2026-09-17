import crypto from 'crypto';
import prisma from '../../config/prisma';
import AIService, { ExtractedJobData } from './ai.service';

export interface ScrapedPost {
  id: string; // shortcode o ID único (web-hash o IG shortcode)
  url: string;
  caption: string;
  imageUrl: string;
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
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
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
        const ogTitle =
          (
            html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i) ||
            html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)
          )?.[1] || '';
        const ogDesc =
          (
            html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i) ||
            html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)
          )?.[1] || '';
        const ogImage = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/i)?.[1] || '';

        const caption = ogDesc || ogTitle || `Publicación de empleo en Instagram (${shortcode})`;

        return {
          id: shortcode,
          url: fullUrl,
          caption,
          imageUrl: ogImage,
          publishedAt: new Date(),
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
  static async fetchProfilePosts(username: string): Promise<ScrapedPost[]> {
    const posts: ScrapedPost[] = [];

    // Estrategia 1: Consulta directa con headers simulados
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);

      const response = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
          'x-ig-app-id': '936619743392459',
          'Accept-Language': 'es-DO,es;q=0.9,en;q=0.8',
          Referer: `https://www.instagram.com/${username}/`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        const json: any = await response.json();
        const edges = json?.data?.user?.edge_owner_to_timeline_media?.edges || [];
        for (const edge of edges) {
          const node = edge.node;
          if (!node) continue;

          const shortcode = node.shortcode || node.id;
          const caption = node.edge_media_to_caption?.edges?.[0]?.node?.text || '';
          const imageUrl = node.display_url || node.thumbnail_src || '';
          const timestamp = node.taken_at_timestamp ? new Date(node.taken_at_timestamp * 1000) : new Date();

          posts.push({
            id: shortcode,
            url: `https://www.instagram.com/p/${shortcode}/`,
            caption,
            imageUrl,
            publishedAt: timestamp,
          });
        }
      }
    } catch (e) {}

    // Estrategia 2: Espejo web público
    if (posts.length === 0) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 7000);

        const htmlResp = await fetch(`https://imginn.com/${username}/`, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (htmlResp.ok) {
          const html = await htmlResp.text();
          const matches = [...html.matchAll(/href="\/p\/([a-zA-Z0-9_-]+)\/"/g)];
          const seenShortcodes = new Set<string>();

          for (const m of matches) {
            const shortcode = m[1];
            if (!shortcode || seenShortcodes.has(shortcode)) continue;
            seenShortcodes.add(shortcode);

            const imgRegex = new RegExp(
              `href="\\/p\\/${shortcode}\\/"[\\s\\S]*?<img[^>]+src="([^"]+)"[\\s\\S]*?alt="([^"]*)"`,
              'i'
            );
            const imgMatch = html.match(imgRegex);

            const imageUrl = imgMatch ? imgMatch[1] : '';
            const caption = imgMatch ? imgMatch[2] : `Vacante compartida por @${username}`;

            posts.push({
              id: shortcode,
              url: `https://www.instagram.com/p/${shortcode}/`,
              caption,
              imageUrl,
              publishedAt: new Date(),
            });

            if (posts.length >= 12) break;
          }
        }
      } catch (e) {}
    }

    return posts;
  }

  /**
   * Escaneo universal inteligente: acepta enlaces de portales web (Tu Empleo RD, Aldaba, Computrabajo, etc.),
   * enlaces individuales de vacantes, enlaces de posts de Instagram o perfiles de Instagram.
   */
  static async scanAndEnqueue(urlOrUsername: string, maxDays = 30): Promise<ScanResult> {
    const raw = urlOrUsername.trim();
    if (!raw) {
      throw new Error('Debes proporcionar un enlace web, perfil o publicación');
    }

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
          }
        } else {
          sourceType = 'INSTAGRAM_PROFILE';
          username = this.cleanUsername(raw);
          profileUrl = `https://www.instagram.com/${username}/`;
          rawPosts = await this.fetchProfilePosts(username);
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
      rawPosts = await this.fetchProfilePosts(username);
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
        continue;
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
          ? `Publicación de Instagram encolada para redacción con IA.`
          : `Esta publicación ya se encontraba en la cola.`;
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

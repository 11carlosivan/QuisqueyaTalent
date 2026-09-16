import prisma from '../../config/prisma';
import AIService from './ai.service';

export interface ScrapedPost {
  id: string; // shortcode o ID único de Instagram
  url: string;
  caption: string;
  imageUrl: string;
  publishedAt: Date;
}

export interface ScanResult {
  username: string;
  totalFound: number;
  newEnqueued: number;
  skippedDuplicates: number;
  skippedTooOld: number;
  items: any[];
}

export class InstagramScraperService {
  /**
   * Normaliza cualquier URL o @mención a un nombre de usuario limpio
   */
  static cleanUsername(input: string): string {
    let clean = input.trim();
    // Eliminar arroba inicial
    if (clean.startsWith('@')) {
      clean = clean.substring(1);
    }
    // Si es una URL completa
    try {
      if (clean.includes('instagram.com/')) {
        const parts = clean.split('instagram.com/')[1].split('/')[0].split('?')[0];
        clean = parts;
      }
    } catch (e) {
      // conservar limpio
    }
    return clean.replace(/[^a-zA-Z0-9._]/g, '').toLowerCase();
  }

  /**
   * Intenta extraer posts recientes de un perfil de Instagram usando múltiples estrategias
   */
  static async fetchProfilePosts(username: string): Promise<ScrapedPost[]> {
    const posts: ScrapedPost[] = [];

    // Estrategia 1: Consulta con headers de navegador
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
          'x-ig-app-id': '936619743392459',
          'Accept-Language': 'es-DO,es;q=0.9,en;q=0.8',
          'Referer': `https://www.instagram.com/${username}/`,
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
    } catch (e) {
      // Fallback a siguiente estrategia
    }

    // Estrategia 2: Si Instagram requirió login o falló, intentar extraer de HTML público o visualizador web
    if (posts.length === 0) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 7000);

        const htmlResp = await fetch(`https://imginn.com/${username}/`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (htmlResp.ok) {
          const html = await htmlResp.text();
          // Regex para capturar items de imginn: /p/SHORTCODE/
          const matches = [...html.matchAll(/href="\/p\/([a-zA-Z0-9_-]+)\/"/g)];
          const seenShortcodes = new Set<string>();

          for (const m of matches) {
            const shortcode = m[1];
            if (!shortcode || seenShortcodes.has(shortcode)) continue;
            seenShortcodes.add(shortcode);

            // Intentar extraer imagen asociada
            const imgRegex = new RegExp(`href="\\/p\\/${shortcode}\\/"[\\s\\S]*?<img[^>]+src="([^"]+)"[\\s\\S]*?alt="([^"]*)"`, 'i');
            const imgMatch = html.match(imgRegex);

            const imageUrl = imgMatch ? imgMatch[1] : '';
            const caption = imgMatch ? imgMatch[2] : `Vacante compartida por @${username}`;

            posts.push({
              id: shortcode,
              url: `https://www.instagram.com/p/${shortcode}/`,
              caption,
              imageUrl,
              publishedAt: new Date(), // post reciente
            });

            if (posts.length >= 12) break;
          }
        }
      } catch (e) {
        // Continuar
      }
    }

    return posts;
  }

  /**
   * Escanea un perfil de Instagram, filtra por antigüedad (< 30 días) y omite repetidos
   */
  static async scanAndEnqueue(usernameOrUrl: string, maxDays = 30): Promise<ScanResult> {
    const username = this.cleanUsername(usernameOrUrl);
    if (!username) {
      throw new Error('Nombre de usuario o URL de Instagram no válida');
    }

    // 1. Asegurar o crear la fuente de Instagram monitoreada
    const profileUrl = `https://www.instagram.com/${username}/`;
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

    // 2. Extraer posts recientes
    const rawPosts = await this.fetchProfilePosts(username);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxDays);

    let newEnqueued = 0;
    let skippedDuplicates = 0;
    let skippedTooOld = 0;
    const enqueuedItems: any[] = [];

    // 3. Procesar cada post con filtros
    for (const post of rawPosts) {
      // Filtro 1: Antigüedad máxima (menos de 1 mes / maxDays)
      if (post.publishedAt < cutoffDate) {
        skippedTooOld++;
        continue;
      }

      // Filtro 2: Cero vacantes repetidas (deduplicación por instagramPostId)
      const existing = await prisma.aiJobQueue.findUnique({
        where: { instagramPostId: post.id },
      });

      if (existing) {
        skippedDuplicates++;
        continue;
      }

      // Filtro 3: Detección inteligente de vacante real vs post normal
      let initialStatus: 'PENDING' | 'DISCARDED' = 'PENDING';
      let isJobOffer = true;
      if (post.caption && post.caption.length > 15) {
        const check = AIService.isLegitimateJobOffer(post.caption);
        if (!check.isJob) {
          initialStatus = 'DISCARDED';
          isJobOffer = false;
        }
      }

      // 4. Registrar en cola
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
        },
      });

      if (initialStatus === 'PENDING') {
        newEnqueued++;
      }
      enqueuedItems.push(queueItem);
    }

    return {
      username,
      totalFound: rawPosts.length,
      newEnqueued,
      skippedDuplicates,
      skippedTooOld,
      items: enqueuedItems,
    };
  }
}

export default InstagramScraperService;

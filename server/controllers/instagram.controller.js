import Gallery from '../models/Gallery.model.js';

/**
 * Live Instagram feed.
 *
 * Two modes:
 *  - LIVE  (recommended): set `INSTAGRAM_ACCESS_TOKEN` (long-lived Instagram
 *    Graph API token) and optionally `INSTAGRAM_USERNAME`. The server proxies
 *    `GET /me/media` from the Instagram Graph API and returns the latest posts
 *    and reels (images + short videos) in the NOIR grid format. Content
 *    auto-updates whenever Instagram changes.
 *  - CURATED fallback: with no token configured, the endpoint returns the
 *    studio-curated items from the Gallery collection whose `source` is
 *    `'instagram'`. This lets the feed still render before an API token exists,
 *    and marks `live:false` so the UI can indicate it's managed content.
 *
 * `limit` (query param) controls the number of items returned (default 30).
 */

const GRAPH_API = 'https://graph.instagram.com/me/media';

function normalizeGraphItems(payload) {
  return (payload.data || [])
    .map((m) => {
      const isVideo = m.media_type === 'VIDEO' || m.media_type === 'REELS';
      return {
        id: m.id,
        mediaId: m.id,
        mediaType: isVideo ? 'reel' : 'image',
        // Poster/thumbnail is what we draw in the grid; videos keep their
        // real video URL so clicking plays the actual reel.
        image: isVideo ? m.thumbnail_url : m.media_url,
        videoUrl: isVideo ? m.media_url : '',
        permalink: m.permalink,
        caption: m.caption || '',
        username: m.username || '',
        source: 'instagram',
      };
    })
    .filter((m) => m.image);
}

/** Curated fallback returned when no Graph API token is configured. */
async function curatedItems(limit) {
  const items = await Gallery.find({ source: 'instagram', active: true }).sort({ createdAt: -1 }).limit(limit || 30);
  return items.map((g) => ({
    id: g._id.toString(),
    mediaId: g.mediaId || g._id.toString(),
    mediaType: g.mediaType || 'image',
    image: g.image,
    videoUrl: g.reelUrl || '',
    permalink: g.permalink,
    caption: g.title || '',
    username: process.env.INSTAGRAM_USERNAME || 'noir.salon',
    source: 'instagram',
  }));
}

async function feedFromGraph(limit) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const query = new URLSearchParams({
    fields: 'id,media_type,media_url,thumbnail_url,permalink,caption,username',
    limit: String(limit || 30),
    access_token: token,
  });

  const res = await fetch(`${GRAPH_API}?${query.toString()}`);
  if (!res.ok) {
    let detail = `Instagram Graph API ${res.status}`;
    try {
      const body = await res.json();
      detail = body?.error?.message || detail;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(detail);
  }

  const payload = await res.json();
  return normalizeGraphItems(payload);
}

/** GET /api/v1/content/instagram */
export async function instagramFeed(req, res) {
  try {
    const limit = Math.min(Number(req.query.limit) || 30, 60);
    const items = process.env.INSTAGRAM_ACCESS_TOKEN
      ? await feedFromGraph(limit)
      : await curatedItems(limit);

    res.json({
      success: true,
      live: Boolean(process.env.INSTAGRAM_ACCESS_TOKEN),
      account: {
        username: process.env.INSTAGRAM_USERNAME || 'noir.salon',
        url: `https://www.instagram.com/${encodeURIComponent(process.env.INSTAGRAM_USERNAME || 'noir.salon')}`,
      },
      count: items.length,
      data: items,
    });
  } catch (err) {
    // If the live fetch fails (bad token / network), degrade gracefully to the
    // curated feed rather than breaking the gallery page.
    try {
      const items = await curatedItems(req.query.limit);
      res.json({
        success: true,
        live: false,
        error: err.message,
        account: { username: process.env.INSTAGRAM_USERNAME || 'noir.salon', url: '' },
        count: items.length,
        data: items,
      });
    } catch (_e) {
      res.status(502).json({ success: false, message: 'Instagram feed unavailable' });
    }
  }
}
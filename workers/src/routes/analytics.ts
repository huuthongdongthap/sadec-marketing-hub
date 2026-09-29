// Analytics Route — replaces Supabase Edge Functions: roiaas-analytics, score-lead
import { Hono } from 'hono';
import type { AppContext } from '../types';
import { extractBearerToken, verifySupabaseJwt } from '../lib/auth';

const analytics = new Hono<AppContext>();

// Public: track anonymous events (no auth required)
analytics.post('/event', async (c) => {
    const body = await c.req.json().catch(() => null);
    if (!body) return c.json({ error: 'Invalid body' }, 400);

    const { event, page, properties } = body as {
        event: string;
        page?: string;
        properties?: Record<string, unknown>;
    };

    if (!event) return c.json({ error: 'Event name required' }, 400);

    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    const ua = c.req.header('User-Agent') || '';
    const country = c.req.header('CF-IPCountry') || 'VN';

    await c.env.DB.prepare(`
    INSERT INTO analytics_events (event_name, page_url, properties, ip_address, user_agent, country, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `).bind(event, page || '', JSON.stringify(properties || {}), ip, ua, country).run();

    return c.json({ ok: true });
});

// Auth required: get analytics dashboard
analytics.get('/dashboard', async (c) => {
    const token = extractBearerToken(c.req.header('Authorization') || null);
    const user = token ? await verifySupabaseJwt(token, c.env.SUPABASE_JWT_SECRET) : null;
    if (!user || !['admin', 'staff'].includes(user.role)) return c.json({ error: 'Forbidden' }, 403);

    const days = parseInt(c.req.query('days') || '30');
    const since = new Date(Date.now() - days * 86400_000).toISOString();

    const [events, topPages, countries] = await Promise.all([
        c.env.DB.prepare(`
      SELECT event_name, COUNT(*) as count
      FROM analytics_events WHERE created_at > ?
      GROUP BY event_name ORDER BY count DESC LIMIT 20
    `).bind(since).all(),
        c.env.DB.prepare(`
      SELECT page_url, COUNT(*) as views
      FROM analytics_events WHERE event_name = 'page_view' AND created_at > ?
      GROUP BY page_url ORDER BY views DESC LIMIT 10
    `).bind(since).all(),
        c.env.DB.prepare(`
      SELECT country, COUNT(*) as count
      FROM analytics_events WHERE created_at > ?
      GROUP BY country ORDER BY count DESC LIMIT 10
    `).bind(since).all(),
    ]);

    return c.json({ events: events.results, topPages: topPages.results, countries: countries.results, period: days });
});

// Score lead (replaces Supabase score-lead function)
analytics.post('/score-lead', async (c) => {
    const token = extractBearerToken(c.req.header('Authorization') || null);
    const user = token ? await verifySupabaseJwt(token, c.env.SUPABASE_JWT_SECRET) : null;
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { leadId, signals } = await c.req.json() as { leadId: string; signals: Record<string, number> };

    // Simple scoring algorithm (extend as needed)
    const score = Object.values(signals).reduce((sum, v) => sum + v, 0);
    const tier = score >= 80 ? 'hot' : score >= 50 ? 'warm' : 'cold';

    await c.env.DB.prepare(`
    UPDATE leads SET score = ?, tier = ?, updated_at = datetime('now') WHERE id = ?
  `).bind(score, tier, leadId).run();

    return c.json({ leadId, score, tier });
});

export { analytics as analyticsRoute };

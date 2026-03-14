// CMS Route — public data: testimonials, services, blog_posts, contacts (public form)
import { Hono } from 'hono';
import type { AppContext } from '../types';
import { extractBearerToken, verifySupabaseJwt } from '../lib/auth';

const cms = new Hono<AppContext>();

// ── Public: Testimonials ──────────────────────────────────────────────────────
cms.get('/testimonials', async (c) => {
    const { results } = await c.env.DB.prepare(
        `SELECT id, author, company, content, rating FROM testimonials WHERE visible=1 ORDER BY created_at DESC LIMIT 20`
    ).all();
    return c.json(results);
});

// ── Public: Services ──────────────────────────────────────────────────────────
cms.get('/services', async (c) => {
    const { results } = await c.env.DB.prepare(
        `SELECT id, name, slug, description, price, category FROM services WHERE active=1 ORDER BY name`
    ).all();
    return c.json(results);
});

// ── Public: Blog ──────────────────────────────────────────────────────────────
cms.get('/blog', async (c) => {
    const { results } = await c.env.DB.prepare(
        `SELECT id, title, slug, excerpt, author, published_at FROM blog_posts WHERE published=1 ORDER BY published_at DESC LIMIT 20`
    ).all();
    return c.json(results);
});

cms.get('/blog/:slug', async (c) => {
    const slug = c.req.param('slug');
    const row = await c.env.DB.prepare(
        `SELECT * FROM blog_posts WHERE slug=? AND published=1`
    ).bind(slug).first();
    if (!row) return c.json({ error: 'Not found' }, 404);
    return c.json(row);
});

// ── Public: Submit contact form ───────────────────────────────────────────────
cms.post('/contacts', async (c) => {
    const body = await c.req.json().catch(() => null);
    if (!body) return c.json({ error: 'Invalid body' }, 400);

    const { name, email, phone, message, source = 'website', company = '' } = body as {
        name: string; email: string; phone?: string; message: string;
        source?: string; company?: string;
    };

    if (!name || !email || !message) return c.json({ error: 'name, email, message required' }, 400);

    await c.env.DB.prepare(`
    INSERT INTO contacts (name, email, phone, company, message, source, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `).bind(name, email, phone || '', company, message, source).run();

    return c.json({ ok: true, message: 'Cảm ơn! Chúng tôi sẽ liên hệ sớm.' });
});

cms.get('/contacts', async (c) => {
    const token = extractBearerToken(c.req.header('Authorization') || null);
    const user = token ? await verifySupabaseJwt(token, c.env.SUPABASE_JWT_SECRET) : null;
    if (!user || !['admin', 'staff'].includes(user.role)) return c.json({ error: 'Forbidden' }, 403);

    const status = c.req.query('status') || null;
    const query = status
        ? `SELECT * FROM contacts WHERE status=? ORDER BY created_at DESC LIMIT 50`
        : `SELECT * FROM contacts ORDER BY created_at DESC LIMIT 50`;
    const { results } = await c.env.DB.prepare(query).bind(...(status ? [status] : [])).all();
    return c.json(results);
});

// ── Auth: Customers ───────────────────────────────────────────────────────────
cms.get('/customers', async (c) => {
    const token = extractBearerToken(c.req.header('Authorization') || null);
    const user = token ? await verifySupabaseJwt(token, c.env.SUPABASE_JWT_SECRET) : null;
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    // Client chỉ thấy record của mình; admin thấy tất cả
    const isAdmin = ['admin', 'staff'].includes(user.role);
    const query = isAdmin
        ? `SELECT * FROM customers ORDER BY created_at DESC LIMIT 100`
        : `SELECT * FROM customers WHERE supabase_user_id=?`;
    const { results } = await c.env.DB.prepare(query).bind(...(isAdmin ? [] : [user.sub])).all();
    return c.json(results);
});

cms.post('/customers', async (c) => {
    const token = extractBearerToken(c.req.header('Authorization') || null);
    const user = token ? await verifySupabaseJwt(token, c.env.SUPABASE_JWT_SECRET) : null;
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { name, email, phone, company } = await c.req.json() as {
        name: string; email: string; phone?: string; company?: string;
    };

    if (!name || !email) return c.json({ error: 'name, email required' }, 400);

    await c.env.DB.prepare(`
    INSERT OR IGNORE INTO customers (name, email, phone, company, supabase_user_id, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `).bind(name, email, phone || '', company || '', user.sub).run();

    return c.json({ ok: true });
});

export { cms as cmsRoute };

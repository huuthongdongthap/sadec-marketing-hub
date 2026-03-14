import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { paymentsRoute } from './routes/payments';
import { webhooksRoute } from './routes/webhooks';
import { assetsRoute } from './routes/assets';
import { analyticsRoute } from './routes/analytics';
import { cmsRoute } from './routes/cms';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use('*', logger());
app.use('*', secureHeaders());

app.use('/api/*', async (c, next) => {
    const origin = c.req.header('origin') || '';
    const allowed = c.env.ALLOWED_ORIGIN || 'https://sadec-marketing-hub.pages.dev';

    // Allow local dev + production
    const isAllowed = origin === allowed ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:');

    return cors({
        origin: isAllowed ? origin : allowed,
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization'],
        maxAge: 86400,
    })(c, next);
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (c) => c.json({ ok: true, ts: Date.now(), platform: 'cloudflare-workers' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.route('/api/payments', paymentsRoute);
app.route('/api/webhooks', webhooksRoute);
app.route('/api/assets', assetsRoute);
app.route('/api/analytics', analyticsRoute);
app.route('/api/cms', cmsRoute);
app.route('/api/contacts', cmsRoute);  // shorthand alias

// ── 404 ───────────────────────────────────────────────────────────────────────
app.notFound((c) => c.json({ error: 'Not found' }, 404));
app.onError((err, c) => {
    console.error('Unhandled error:', err);
    return c.json({ error: 'Internal server error' }, 500);
});

export default app;

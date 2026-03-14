// Assets Route — serve and manage files from Cloudflare R2
// Replaces Supabase Storage bucket 'client-assets'

import { Hono } from 'hono';
import type { AppContext } from '../types';
import { uploadToR2, listClientAssets, deleteFromR2, getR2PublicUrl } from '../lib/r2';
import { extractBearerToken, verifySupabaseJwt } from '../lib/auth';

const assets = new Hono<AppContext>();

// Auth middleware
assets.use('*', async (c, next) => {
    const token = extractBearerToken(c.req.header('Authorization') || null);
    if (!token) return c.json({ error: 'Unauthorized' }, 401);
    const user = await verifySupabaseJwt(token, c.env.SUPABASE_JWT_SECRET);
    if (!user) return c.json({ error: 'Invalid token' }, 401);
    c.set('user', user);
    return next();
});

// ── GET /api/assets/:clientId — list client assets ────────────────────────────
assets.get('/:clientId', async (c) => {
    const user = c.get('user')!;
    const { clientId } = c.req.param();

    // Only allow access to own assets (or admin)
    if (user.role !== 'admin' && user.sub !== clientId) {
        return c.json({ error: 'Forbidden' }, 403);
    }

    const category = c.req.query('category');
    const files = await listClientAssets(c.env.ASSETS_BUCKET, clientId, category);

    return c.json({
        files: files.map(f => ({
            ...f,
            url: getR2PublicUrl(c.env.APP_URL, f.key),
        })),
    });
});

// ── POST /api/assets/upload — upload file to R2 ───────────────────────────────
assets.post('/upload', async (c) => {
    const user = c.get('user')!;
    const formData = await c.req.formData().catch(() => null);
    if (!formData) return c.json({ error: 'No form data' }, 400);

    const file = formData.get('file') as File | null;
    const clientId = (formData.get('clientId') as string) || user.sub;
    const category = (formData.get('category') as string) || 'general';

    if (!file) return c.json({ error: 'No file provided' }, 400);

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) return c.json({ error: 'File too large (max 10MB)' }, 400);

    const ext = file.name.split('.').pop()?.toLowerCase();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${clientId}/${category}/${Date.now()}-${sanitizedName}`;

    await uploadToR2(c.env.ASSETS_BUCKET, {
        key,
        body: await file.arrayBuffer(),
        contentType: file.type || 'application/octet-stream',
        metadata: { clientId, category, originalName: file.name },
    });

    return c.json({
        success: true,
        key,
        url: getR2PublicUrl(c.env.APP_URL, key),
        size: file.size,
    });
});

// ── GET /api/assets/file/:key — serve R2 file ────────────────────────────────
assets.get('/file/:key{.*}', async (c) => {
    const key = c.req.param('key');
    const obj = await c.env.ASSETS_BUCKET.get(key);
    if (!obj) return c.json({ error: 'File not found' }, 404);

    const headers = new Headers();
    obj.writeHttpMetadata(headers);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new Response(obj.body, { headers });
});

// ── DELETE /api/assets/:key — delete file ────────────────────────────────────
assets.delete('/:key{.*}', async (c) => {
    const user = c.get('user')!;
    const key = c.req.param('key');

    // Ensure user can only delete their own files (or admin)
    const clientId = key.split('/')[0];
    if (user.role !== 'admin' && user.sub !== clientId) {
        return c.json({ error: 'Forbidden' }, 403);
    }

    await deleteFromR2(c.env.ASSETS_BUCKET, key);
    return c.json({ success: true, deleted: key });
});

export { assets as assetsRoute };

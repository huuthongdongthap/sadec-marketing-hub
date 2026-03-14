// Supabase JWT verification for Cloudflare Workers
// Verifies tokens issued by Supabase Auth WITHOUT needing Supabase SDK
// Uses Web Crypto API (built into CF Workers) to validate JWT signature

import type { AuthUser, Env } from '../types';

/**
 * Decode a JWT payload without signature verification (for inspection only)
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const [, payload] = token.split('.');
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

/**
 * Verify a Supabase JWT token using HMAC-SHA256
 * Supabase signs JWTs with HS256 using SUPABASE_JWT_SECRET
 */
export async function verifySupabaseJwt(token: string, secret: string): Promise<AuthUser | null> {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const [header, payload, signature] = parts;
        const data = `${header}.${payload}`;

        // Import the secret key
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw',
            enc.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        // Decode the signature from base64url
        const sigBytes = Uint8Array.from(
            atob(signature.replace(/-/g, '+').replace(/_/g, '/')),
            (c) => c.charCodeAt(0)
        );

        // Verify signature
        const valid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(data));
        if (!valid) return null;

        // Decode and validate payload
        const claims = decodeJwtPayload(token);
        if (!claims) return null;

        // Check expiration
        const now = Math.floor(Date.now() / 1000);
        if (typeof claims.exp === 'number' && claims.exp < now) return null;

        return {
            sub: claims.sub as string,
            email: claims.email as string,
            role: (claims.app_metadata as Record<string, string>)?.role ||
                (claims.user_metadata as Record<string, string>)?.role ||
                'client',
            aud: claims.aud as string,
            exp: claims.exp as number,
        };
    } catch (err) {
        console.error('JWT verification failed:', err);
        return null;
    }
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
    if (!authHeader?.startsWith('Bearer ')) return null;
    return authHeader.slice(7).trim();
}

/**
 * Middleware: require authenticated user
 * Usage: app.use('/api/protected/*', requireAuth)
 */
export function requireAuth(env: Env) {
    return async (token: string | null): Promise<AuthUser | null> => {
        if (!token) return null;
        return verifySupabaseJwt(token, env.SUPABASE_JWT_SECRET);
    };
}

/**
 * Standardised 401 Unauthorized response
 */
export function unauthorized(message = 'Unauthorized'): Response {
    return new Response(JSON.stringify({ error: message }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
    });
}

/**
 * Standardised 403 Forbidden response
 */
export function forbidden(message = 'Forbidden'): Response {
    return new Response(JSON.stringify({ error: message }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
    });
}

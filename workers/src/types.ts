// Cloudflare Worker Bindings — type definitions
export interface Env {
    // Cloudflare R2 — file/asset storage (replaces Supabase Storage)
    ASSETS_BUCKET: R2Bucket;

    // Cloudflare D1 — structured data (replaces Supabase Postgres data tables)
    DB: D1Database;

    // Supabase — AUTH ONLY
    SUPABASE_URL: string;
    SUPABASE_JWT_SECRET: string;  // Used to verify JWT from frontend (no Supabase SDK needed)

    // VNPay
    VNPAY_TMN_CODE: string;
    VNPAY_SECRET_KEY: string;
    VNPAY_RETURN_URL: string;

    // MoMo
    MOMO_PARTNER_CODE: string;
    MOMO_ACCESS_KEY: string;
    MOMO_SECRET_KEY: string;
    MOMO_NOTIFY_URL: string;

    // PayOS
    PAYOS_CLIENT_ID: string;
    PAYOS_API_KEY: string;
    PAYOS_CHECKSUM_KEY: string;

    // Zalo OA
    ZALO_OA_SECRET: string;

    // App
    ENVIRONMENT: string;
    ALLOWED_ORIGIN: string;
    APP_URL: string;
}

// Authenticated user context (decoded from Supabase JWT)
export interface AuthUser {
    sub: string;        // user_id (Supabase UUID)
    email: string;
    role: string;       // custom_role from Supabase JWT (admin | staff | client)
    aud: string;
    exp: number;
}

// Hono context with auth
export type AppContext = {
    Bindings: Env;
    Variables: {
        user?: AuthUser;
    };
};

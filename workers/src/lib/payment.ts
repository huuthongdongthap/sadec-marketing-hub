// Shared payment utilities — ported from supabase/functions/_shared/payment-utils.ts
// Adapted for Cloudflare Workers (no Deno APIs, uses Web Crypto + CF D1)

import type { Env } from '../types';

// ── Types ──────────────────────────────────────────────────────────────────────

export type GatewayType = 'vnpay' | 'momo' | 'payos';

export interface PaymentRequest {
    invoiceId: string;
    invoiceNumber: string;
    amount: number;
    orderInfo?: string;
    clientId?: string;
    description?: string;
}

export interface PaymentResponse {
    success: boolean;
    paymentUrl?: string;
    checkoutUrl?: string;
    transactionId?: string;
    deeplink?: string;
    error?: string;
}

export interface PaymentTransactionData {
    invoice_id?: string;
    amount: number;
    gateway: GatewayType;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    transaction_id: string;
    gateway_transaction_no?: string;
    callback_data: Record<string, unknown>;
}

export const ALLOWED_ORIGINS = [
    'https://sadec-marketing-hub.pages.dev',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:8787',
];

// ── Crypto Helpers ──────────────────────────────────────────────────────────────

export async function createHmacSha256(secretKey: string, data: string): Promise<string> {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw', enc.encode(secretKey),
        { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
    return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function createHmacSha512(secretKey: string, data: string): Promise<string> {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw', enc.encode(secretKey),
        { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
    return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Utils ───────────────────────────────────────────────────────────────────────

export function sortObject<T extends Record<string, string>>(obj: T): T {
    const sorted = {} as T;
    Object.keys(obj).sort().forEach(key => {
        sorted[key as keyof T] = obj[key as keyof T];
    });
    return sorted;
}

export function formatVnpDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

export function generateVNPayTxnRef(invoiceNumber: string): string {
    return `${invoiceNumber}-VNPAY-${Date.now()}`;
}

export function generateMoMoOrderId(invoiceNumber: string): string {
    return `${invoiceNumber}-MOMO-${Date.now()}`;
}

export function generatePayOSOrderCode(): number {
    const randomSuffix = Math.floor(Math.random() * 1000);
    return parseInt(Date.now().toString().slice(-6) + randomSuffix.toString().padStart(3, '0'));
}

export function validatePaymentRequest(body: unknown): { valid: boolean; error?: string; statusCode?: number } {
    if (!body || typeof body !== 'object') return { valid: false, error: 'Invalid request body', statusCode: 400 };
    const req = body as Partial<PaymentRequest>;
    if (!req.invoiceId || !req.invoiceNumber) return { valid: false, error: 'Invoice ID and Invoice Number are required', statusCode: 400 };
    if (typeof req.amount !== 'number' || req.amount <= 0) return { valid: false, error: 'Invalid amount', statusCode: 400 };
    return { valid: true };
}

// ── D1 Database Helpers (replaces Supabase .from() calls) ──────────────────────

export async function savePaymentTransaction(db: D1Database, data: PaymentTransactionData): Promise<void> {
    await db.prepare(`
    INSERT INTO payment_transactions (invoice_id, amount, gateway, status, transaction_id, gateway_transaction_no, callback_data, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).bind(
        data.invoice_id || null,
        data.amount,
        data.gateway,
        data.status,
        data.transaction_id,
        data.gateway_transaction_no || null,
        JSON.stringify(data.callback_data)
    ).run();
}

export async function updatePaymentStatus(
    db: D1Database,
    transactionId: string,
    status: 'completed' | 'failed' | 'cancelled',
    gatewayTxnNo?: string
): Promise<void> {
    await db.prepare(`
    UPDATE payment_transactions
    SET status = ?, gateway_transaction_no = ?, updated_at = datetime('now')
    WHERE transaction_id = ?
  `).bind(status, gatewayTxnNo || null, transactionId).run();
}

export async function markInvoiceAsPaid(db: D1Database, invoiceId: string): Promise<void> {
    await db.prepare(`
    UPDATE invoices
    SET status = 'paid', paid_at = datetime('now'), updated_at = datetime('now')
    WHERE id = ?
  `).bind(invoiceId).run();
}

export function getCorsHeaders(origin: string | null, allowedOrigins = ALLOWED_ORIGINS): Record<string, string> {
    const allowed = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowed,
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

// Shared Payment Utilities for all payment gateways
import { SupabaseClient, createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// Type-safe Supabase client type
export type SupabaseType = SupabaseClient<any, any, any>;

// Gateway type for payment routing
export type GatewayType = 'vnpay' | 'momo' | 'payos';

// Common payment handler interface
export interface PaymentHandlerConfig {
    gateway: GatewayType;
    requiredEnvVars: string[];
}

// Request validation result
export interface ValidationResult {
    valid: boolean;
    error?: string;
    statusCode?: number;
}

// Validate payment request body
export function validatePaymentRequest(body: unknown): ValidationResult {
    if (!body || typeof body !== 'object') {
        return { valid: false, error: 'Invalid request body', statusCode: 400 };
    }

    const req = body as Partial<PaymentRequest>;

    if (!req.invoiceId || !req.invoiceNumber) {
        return { valid: false, error: 'Invoice ID and Invoice Number are required', statusCode: 400 };
    }

    if (typeof req.amount !== 'number' || req.amount <= 0) {
        return { valid: false, error: 'Invalid amount', statusCode: 400 };
    }

    return { valid: true };
}

// Common error response creator
export function createPaymentError(message: string, context?: { gateway?: string; error?: unknown }): void {
    console.error(`${context?.gateway || 'Payment'} Error:`, context?.error || message);
}

// Base handler for common serve logic
export function createBaseRequestHandler(
    handler: (req: Request) => Promise<Response>,
    gateway: string
) {
    return async (req: Request): Promise<Response> => {
        try {
            return await handler(req);
        } catch (error) {
            console.error(`${gateway} handler error:`, error);
            return new Response(
                JSON.stringify({ error: 'Internal server error' }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
    };
}

// Environment variables validation
export function validateEnvVars(required: string[]): void {
    const missing = required.filter(key => !Deno.env.get(key));
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

// Restrict CORS to specific domains
export const ALLOWED_ORIGINS = [
    'https://sadec-marketing-hub.pages.dev',
    'http://localhost:3000',
    'http://localhost:8000',
];

export function getCorsHeaders(origin: string | null): Record<string, string> {
    const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };
}

// HMAC SHA-256 for MoMo and PayOS signature verification
export async function createHmacSha256(secretKey: string, data: string): Promise<string> {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(secretKey),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// HMAC SHA-512 for VNPay signature verification
export async function createHmacSha512(secretKey: string, data: string): Promise<string> {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(secretKey),
        { name: 'HMAC', hash: 'SHA-512' },
        false,
        ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Sort object keys alphabetically for signature verification
export function sortObject<T extends Record<string, string>>(obj: T): T {
    const sorted = {} as T;
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
        sorted[key as keyof T] = obj[key as keyof T];
    }
    return sorted;
}

// Generate unique orderCode for PayOS (9-digit numeric)
export function generatePayOSOrderCode(): number {
    // Use timestamp + random to ensure uniqueness (max 9 digits)
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000);
    const orderCode = parseInt(timestamp.toString().slice(-6) + randomSuffix.toString().padStart(3, '0'));
    return orderCode;
}

// Generate unique transaction reference for VNPay
export function generateVNPayTxnRef(invoiceNumber: string): string {
    const timestamp = Date.now();
    return `${invoiceNumber}-VNPAY-${timestamp}`;
}

// Generate unique transaction reference for MoMo
export function generateMoMoOrderId(invoiceNumber: string): string {
    const timestamp = Date.now();
    return `${invoiceNumber}-MOMO-${timestamp}`;
}

// Format date for VNPay (YYYYMMDDHHmmss)
export function formatVnpDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

// Payment request interface
export interface PaymentRequest {
    invoiceId: string;
    invoiceNumber: string;
    amount: number;
    orderInfo?: string;
    clientId?: string;
    description?: string;
}

// Payment response interface
export interface PaymentResponse {
    success: boolean;
    paymentUrl?: string;
    checkoutUrl?: string;
    transactionId?: string;
    deeplink?: string;
    error?: string;
}

// Transaction callback data types
export interface VNPayCallbackData {
    vnp_TxnRef: string;
    vnp_Amount: string;
    vnp_OrderInfo: string;
}

export interface MoMoCallbackData {
    orderId: string;
    requestId: string;
    orderInfo: string;
    payUrl?: string;
}

export interface PayOSCallbackData {
    orderCode: number;
    checkoutUrl?: string;
    description?: string;
}

export type PaymentCallbackData = VNPayCallbackData | MoMoCallbackData | PayOSCallbackData;

// Transaction data interface
export interface PaymentTransactionData {
    invoice_id?: string;
    amount: number;
    gateway: 'vnpay' | 'momo' | 'payos';
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    transaction_id: string;
    gateway_transaction_no?: string;
    callback_data: PaymentCallbackData;
}

// Save payment transaction to database
export async function savePaymentTransaction(
    supabase: SupabaseType,
    data: PaymentTransactionData
) {
    try {
        const { error } = await supabase.from('payment_transactions').insert({
            invoice_id: data.invoice_id || null,
            amount: data.amount,
            gateway: data.gateway,
            status: data.status,
            transaction_id: data.transaction_id,
            gateway_transaction_no: data.gateway_transaction_no || null,
            callback_data: data.callback_data,
        });

        if (error) {
            console.error('Error saving payment transaction:', error);
            throw error;
        }
    } catch (err) {
        console.error('Exception saving payment transaction:', err);
        throw err;
    }
}

// Find invoice by transaction ID from payment_transactions table
export async function findInvoiceByTransactionId(
    supabase: SupabaseType,
    transactionId: string
): Promise<{ invoice_id: string; invoice_number: string } | null> {
    const { data, error } = await supabase
        .from('payment_transactions')
        .select('invoice_id, invoices(invoice_number)')
        .eq('transaction_id', transactionId)
        .single();

    if (error || !data) {
        return null;
    }

    return {
        invoice_id: data.invoice_id,
        invoice_number: data.invoices?.invoice_number
    };
}

// Extract invoice number from transaction reference
export function extractInvoiceNumber(transactionRef: string, gateway: string): string | null {
    switch (gateway) {
        case 'vnpay':
            return transactionRef.split('-VNPAY-')[0];
        case 'momo':
            return transactionRef.split('-MOMO-')[0];
        case 'payos':
            // For PayOS, extract from description field
            const match = transactionRef.match(/INV-\d{4}-\d{3}/);
            return match ? match[0] : null;
        default:
            return null;
    }
}

// Update invoice status to paid
export async function markInvoiceAsPaid(
    supabase: SupabaseType,
    invoiceId: string,
    paidAt?: string
): Promise<void> {
    const { error } = await supabase
        .from('invoices')
        .update({
            status: 'paid',
            paid_at: paidAt || new Date().toISOString(),
        })
        .eq('id', invoiceId);

    if (error) {
        console.error('Error updating invoice:', error);
        throw error;
    }
}

// Common handler builder for payment creation endpoints
// This reduces duplication across VNPay, MoMo, and PayOS handlers
export function createPaymentHandler(options: {
    gateway: GatewayType;
    validateAmount?: (amount: number) => ValidationResult;
    minAmount?: number;
}) {
    const { gateway, validateAmount, minAmount } = options;

    // Build validation response
    function validateRequest(body: unknown): { valid: true; body: PaymentRequest } | { valid: false; response: Response } {
        const validation = validatePaymentRequest(body);
        if (!validation.valid) {
            return {
                valid: false,
                response: new Response(JSON.stringify({ error: validation.error }), {
                    status: validation.statusCode || 400,
                    headers: { 'Content-Type': 'application/json' }
                })
            };
        }

        const req = body as PaymentRequest;

        // Gateway-specific amount validation
        if (validateAmount) {
            const amountValidation = validateAmount(req.amount);
            if (!amountValidation.valid) {
                return {
                    valid: false,
                    response: new Response(JSON.stringify({ error: amountValidation.error }), {
                        status: amountValidation.statusCode || 400,
                        headers: { 'Content-Type': 'application/json' }
                    })
                };
            }
        }

        // Minimum amount check
        if (minAmount && req.amount < minAmount) {
            return {
                valid: false,
                response: new Response(
                    JSON.stringify({ error: `Minimum payment amount is ${minAmount.toLocaleString('vi-VN')} VND` }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                )
            };
        }

        return { valid: true, body: req };
    }

    return {
        validateRequest,
        gateway
    };
}

// Standard CORS + method handling wrapper
export async function handleCorsAndMethod(
    req: Request,
    handler: (req: Request) => Promise<Response>
): Promise<Response> {
    const origin = req.headers.get('origin');
    const headers = getCorsHeaders(origin);

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers }
        );
    }

    try {
        return await handler(req);
    } catch (error) {
        console.error('Server error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers }
        );
    }
}

// Create Supabase client helper
export function createSupabaseClient(): SupabaseType {
    return createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
}

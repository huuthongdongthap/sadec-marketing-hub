// Shared Payment Utilities for all payment gateways

// Environment variables validation
export function validateEnvVars(required: string[]): void {
    const missing = required.filter(key => !Deno.env.get(key));
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

// Restrict CORS to specific domains
export const ALLOWED_ORIGINS = [
    'https://sadec-marketing-hub.vercel.app',
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

// Save payment transaction to database
export async function savePaymentTransaction(
    supabase: any,
    data: {
        invoice_id?: string;
        amount: number;
        gateway: string;
        status: string;
        transaction_id: string;
        gateway_transaction_no?: string;
        callback_data: any;
    }
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
    supabase: any,
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
    supabase: any,
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

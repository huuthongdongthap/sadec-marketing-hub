// Supabase Edge Function: Create VNPay Payment
// Secure server-side payment URL generation for VNPay integration

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// VNPay Configuration (sandbox mode)
const VNPAY_CONFIG = {
    vnpUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    tmnCode: Deno.env.get('VNPAY_TMN_CODE') || 'DEMO1234',
    secretKey: Deno.env.get('VNPAY_SECRET_KEY') || 'VNPAYSECRETKEY2024',
    returnUrl: Deno.env.get('VNPAY_RETURN_URL') || 'https://sadec-marketing-hub.vercel.app/portal/payment-result.html',
    version: '2.1.0',
    locale: 'vn',
    currCode: 'VND'
};

interface PaymentRequest {
    invoiceId: string;
    amount: number;
    orderInfo: string;
    clientId?: string;
}

interface PaymentResponse {
    success: boolean;
    paymentUrl?: string;
    transactionId?: string;
    error?: string;
}

// Simple hash function for VNPay signature (HMAC-SHA512)
async function createHmacSha512(secretKey: string, data: string): Promise<string> {
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

// Sort object keys for VNPay signature
function sortObject(obj: Record<string, string>): Record<string, string> {
    const sorted: Record<string, string> = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
        sorted[key] = obj[key];
    }
    return sorted;
}

// Format date for VNPay
function formatVnpDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

// Generate unique transaction reference
function generateTxnRef(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `MKG${timestamp}${random}`.toUpperCase();
}

async function createPaymentUrl(req: PaymentRequest): Promise<PaymentResponse> {
    try {
        const txnRef = generateTxnRef();
        const createDate = formatVnpDate(new Date());
        const expireDate = formatVnpDate(new Date(Date.now() + 15 * 60 * 1000)); // 15 min expiry

        // VNPay parameters
        let vnpParams: Record<string, string> = {
            vnp_Version: VNPAY_CONFIG.version,
            vnp_Command: 'pay',
            vnp_TmnCode: VNPAY_CONFIG.tmnCode,
            vnp_Locale: VNPAY_CONFIG.locale,
            vnp_CurrCode: VNPAY_CONFIG.currCode,
            vnp_TxnRef: txnRef,
            vnp_OrderInfo: req.orderInfo || `Thanh toan hoa don ${req.invoiceId}`,
            vnp_OrderType: 'other',
            vnp_Amount: (req.amount * 100).toString(), // VNPay expects amount in smallest unit
            vnp_ReturnUrl: VNPAY_CONFIG.returnUrl,
            vnp_IpAddr: '127.0.0.1',
            vnp_CreateDate: createDate,
            vnp_ExpireDate: expireDate
        };

        // Sort and create query string
        vnpParams = sortObject(vnpParams);
        const signData = new URLSearchParams(vnpParams).toString();

        // Create secure hash
        const secureHash = await createHmacSha512(VNPAY_CONFIG.secretKey, signData);
        vnpParams['vnp_SecureHash'] = secureHash;

        // Build final URL
        const paymentUrl = `${VNPAY_CONFIG.vnpUrl}?${new URLSearchParams(vnpParams).toString()}`;

        return {
            success: true,
            paymentUrl,
            transactionId: txnRef
        };

    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to create payment URL'
        };
    }
}

serve(async (req: Request) => {
    // CORS headers
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    try {
        if (req.method !== 'POST') {
            return new Response(
                JSON.stringify({ error: 'Method not allowed' }),
                { status: 405, headers }
            );
        }

        const body: PaymentRequest = await req.json();

        // Validate request
        if (!body.invoiceId) {
            return new Response(
                JSON.stringify({ error: 'Invoice ID is required' }),
                { status: 400, headers }
            );
        }

        if (typeof body.amount !== 'number' || body.amount <= 0) {
            return new Response(
                JSON.stringify({ error: 'Invalid amount' }),
                { status: 400, headers }
            );
        }

        // Minimum amount for VNPay (10,000 VND)
        if (body.amount < 10000) {
            return new Response(
                JSON.stringify({ error: 'Minimum payment amount is 10,000 VND' }),
                { status: 400, headers }
            );
        }

        const result = await createPaymentUrl(body);

        if (!result.success) {
            return new Response(
                JSON.stringify({ error: result.error }),
                { status: 500, headers }
            );
        }

        // Optional: Log transaction to database
        // const supabase = createClient(
        //     Deno.env.get('SUPABASE_URL')!,
        //     Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        // );
        // await supabase.from('transactions').insert({
        //     transaction_id: result.transactionId,
        //     invoice_id: body.invoiceId,
        //     amount: body.amount,
        //     status: 'pending',
        //     payment_method: 'vnpay'
        // });

        return new Response(
            JSON.stringify(result),
            { status: 200, headers }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers }
        );
    }
});

// Supabase Edge Function: Create MoMo Payment
// Secure server-side payment URL generation for MoMo integration

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// MoMo Configuration (sandbox mode)
const MOMO_CONFIG = {
    endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create',
    partnerCode: Deno.env.get('MOMO_PARTNER_CODE') || 'MOMO',
    accessKey: Deno.env.get('MOMO_ACCESS_KEY') || 'MOMO_ACCESS_KEY',
    secretKey: Deno.env.get('MOMO_SECRET_KEY') || 'MOMO_SECRET_KEY',
    redirectUrl: Deno.env.get('MOMO_REDIRECT_URL') || 'https://sadec-marketing-hub.vercel.app/portal/payment-result.html',
    ipnUrl: Deno.env.get('MOMO_IPN_URL') || 'https://sadec-marketing-hub.vercel.app/api/momo-ipn',
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
    deeplink?: string;
    error?: string;
}

// HMAC-SHA256 Helper
async function createHmacSha256(secretKey: string, data: string): Promise<string> {
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

// Generate unique transaction reference
function generateOrderId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `MKG_MOMO_${timestamp}_${random}`.toUpperCase();
}

async function createPaymentUrl(req: PaymentRequest): Promise<PaymentResponse> {
    try {
        const orderId = generateOrderId();
        const requestId = orderId;
        const amount = req.amount.toString();
        const orderInfo = req.orderInfo || `Thanh toan hoa don ${req.invoiceId}`;
        const requestType = "captureWallet";
        const extraData = ""; // Base64 encoded string if needed

        // MoMo Signature format:
        // accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
        const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${MOMO_CONFIG.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${MOMO_CONFIG.partnerCode}&redirectUrl=${MOMO_CONFIG.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

        const signature = await createHmacSha256(MOMO_CONFIG.secretKey, rawSignature);

        // Request body
        const requestBody = {
            partnerCode: MOMO_CONFIG.partnerCode,
            partnerName: "Mekong Agency",
            storeId: "MekongAgency_Store",
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: MOMO_CONFIG.redirectUrl,
            ipnUrl: MOMO_CONFIG.ipnUrl,
            lang: "vi",
            requestType: requestType,
            autoCapture: true,
            extraData: extraData,
            signature: signature
        };

        // Call MoMo API
        const response = await fetch(MOMO_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();

        if (result.resultCode === 0) {
            return {
                success: true,
                paymentUrl: result.payUrl,
                deeplink: result.deeplink,
                transactionId: orderId
            };
        } else {
            return {
                success: false,
                error: result.message || result.localMessage || 'Failed to create MoMo payment'
            };
        }

    } catch (error) {
        return {
            success: false,
            error: error.message || 'Internal server error during MoMo payment creation'
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

        const result = await createPaymentUrl(body);

        if (!result.success) {
            return new Response(
                JSON.stringify({ error: result.error }),
                { status: 500, headers }
            );
        }

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

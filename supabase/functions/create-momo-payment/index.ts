// Supabase Edge Function: Create MoMo Payment
// Secure server-side payment URL generation for MoMo integration with signature verification

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import {
    validateEnvVars,
    getCorsHeaders,
    createHmacSha256,
    generateMoMoOrderId,
    savePaymentTransaction,
    type PaymentRequest,
    type PaymentResponse,
    type SupabaseType
} from '../_shared/payment-utils.ts';

// Validate required environment variables at startup
const REQUIRED_ENV_VARS = [
    'MOMO_PARTNER_CODE',
    'MOMO_ACCESS_KEY',
    'MOMO_SECRET_KEY',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
];

try {
    validateEnvVars(REQUIRED_ENV_VARS);
} catch (error) {
    console.error('Environment validation failed:', error.message);
}

// MoMo Configuration
const MOMO_CONFIG = {
    endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create',
    partnerCode: Deno.env.get('MOMO_PARTNER_CODE')!,
    accessKey: Deno.env.get('MOMO_ACCESS_KEY')!,
    secretKey: Deno.env.get('MOMO_SECRET_KEY')!,
    redirectUrl: Deno.env.get('MOMO_REDIRECT_URL') || 'https://sadec-marketing-hub.vercel.app/portal/payment-result.html',
    ipnUrl: Deno.env.get('MOMO_IPN_URL') || 'https://sadec-marketing-hub.vercel.app/api/momo-ipn',
};

async function createPaymentUrl(req: PaymentRequest, supabase: SupabaseType): Promise<PaymentResponse> {
    try {
        const orderId = generateMoMoOrderId(req.invoiceNumber);
        const requestId = orderId;
        const amount = req.amount.toString();
        const orderInfo = req.orderInfo || `Thanh toan hoa don ${req.invoiceNumber}`;
        const requestType = 'captureWallet';
        const extraData = ''; // Base64 encoded string if needed

        // MoMo Signature format:
        // accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
        const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${MOMO_CONFIG.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${MOMO_CONFIG.partnerCode}&redirectUrl=${MOMO_CONFIG.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

        const signature = await createHmacSha256(MOMO_CONFIG.secretKey, rawSignature);

        // Request body
        const requestBody = {
            partnerCode: MOMO_CONFIG.partnerCode,
            partnerName: 'Mekong Agency',
            storeId: 'MekongAgency_Store',
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: MOMO_CONFIG.redirectUrl,
            ipnUrl: MOMO_CONFIG.ipnUrl,
            lang: 'vi',
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
            // Save transaction to database
            await savePaymentTransaction(supabase, {
                invoice_id: req.invoiceId,
                amount: req.amount,
                gateway: 'momo',
                status: 'pending',
                transaction_id: orderId,
                callback_data: {
                    orderId: orderId,
                    requestId: requestId,
                    orderInfo: orderInfo,
                    payUrl: result.payUrl
                }
            });

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
        console.error('MoMo Error:', error);
        return {
            success: false,
            error: error.message || 'Internal server error during MoMo payment creation'
        };
    }
}

serve(async (req: Request) => {
    const origin = req.headers.get('origin');
    const headers = getCorsHeaders(origin);

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
        if (!body.invoiceId || !body.invoiceNumber) {
            return new Response(
                JSON.stringify({ error: 'Invoice ID and Invoice Number are required' }),
                { status: 400, headers }
            );
        }

        if (typeof body.amount !== 'number' || body.amount <= 0) {
            return new Response(
                JSON.stringify({ error: 'Invalid amount' }),
                { status: 400, headers }
            );
        }

        // Create Supabase client
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        const result = await createPaymentUrl(body, supabase);

        if (!result.success) {
            return new Response(
                JSON.stringify({ error: result.error }),
                { status: 400, headers }
            );
        }

        return new Response(
            JSON.stringify(result),
            { status: 200, headers }
        );

    } catch (error) {
        console.error('Server error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers }
        );
    }
});

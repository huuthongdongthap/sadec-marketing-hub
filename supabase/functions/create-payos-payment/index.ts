// Supabase Edge Function: Create payOS Payment
// Secure server-side payment URL generation for payOS integration with signature verification

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import {
    validateEnvVars,
    getCorsHeaders,
    createHmacSha256,
    generatePayOSOrderCode,
    savePaymentTransaction,
    type PaymentRequest,
    type PaymentResponse
} from '../_shared/payment-utils.ts';

// Validate required environment variables at startup
const REQUIRED_ENV_VARS = [
    'PAYOS_CLIENT_ID',
    'PAYOS_API_KEY',
    'PAYOS_CHECKSUM_KEY',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
];

try {
    validateEnvVars(REQUIRED_ENV_VARS);
} catch (error) {
    console.error('Environment validation failed:', error.message);
}

// payOS Configuration
const PAYOS_CONFIG = {
    endpoint: 'https://api-merchant.payos.vn/v2/payment-requests',
    clientId: Deno.env.get('PAYOS_CLIENT_ID')!,
    apiKey: Deno.env.get('PAYOS_API_KEY')!,
    checksumKey: Deno.env.get('PAYOS_CHECKSUM_KEY')!,
    returnUrl: Deno.env.get('PAYOS_RETURN_URL') || 'https://sadec-marketing-hub.vercel.app/portal/payment-result.html',
    cancelUrl: Deno.env.get('PAYOS_CANCEL_URL') || 'https://sadec-marketing-hub.vercel.app/portal/payments.html',
};

async function createPaymentUrl(req: PaymentRequest, supabase: any): Promise<PaymentResponse> {
    try {
        const orderCode = generatePayOSOrderCode();
        const amount = req.amount;
        const description = req.orderInfo || `Thanh toan hoa don ${req.invoiceNumber}`;

        // payOS request body format
        const requestBody = {
            orderCode: orderCode,
            amount: amount,
            description: description,
            buyerName: req.clientId || 'Customer',
            buyerEmail: 'customer@example.com',
            buyerPhone: '',
            buyerAddress: '',
            items: [
                {
                    name: description,
                    quantity: 1,
                    price: amount
                }
            ],
            returnUrl: PAYOS_CONFIG.returnUrl,
            cancelUrl: PAYOS_CONFIG.cancelUrl,
            expiredAt: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes expiry
        };

        // Create checksum for payOS
        // Checksum format: amount={amount}&cancelUrl={cancelUrl}&description={description}&orderCode={orderCode}&returnUrl={returnUrl}
        const checksumData = `amount=${amount}&cancelUrl=${PAYOS_CONFIG.cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${PAYOS_CONFIG.returnUrl}`;
        const signature = await createHmacSha256(PAYOS_CONFIG.checksumKey, checksumData);

        // Add signature to request
        const signedRequest = {
            ...requestBody,
            signature: signature
        };

        // Call payOS API
        const response = await fetch(PAYOS_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': PAYOS_CONFIG.clientId,
                'x-api-key': PAYOS_CONFIG.apiKey,
            },
            body: JSON.stringify(signedRequest)
        });

        const result = await response.json();

        // payOS response structure
        if (result.code === '00' && result.data) {
            // Save transaction to database
            await savePaymentTransaction(supabase, {
                invoice_id: req.invoiceId,
                amount: amount,
                gateway: 'payos',
                status: 'pending',
                transaction_id: orderCode.toString(),
                callback_data: {
                    orderCode: orderCode,
                    description: description,
                    checkoutUrl: result.data.checkoutUrl
                }
            });

            return {
                success: true,
                checkoutUrl: result.data.checkoutUrl,
                paymentUrl: result.data.checkoutUrl,
                transactionId: orderCode.toString()
            };
        } else {
            return {
                success: false,
                error: result.desc || result.message || 'Failed to create payOS payment'
            };
        }

    } catch (error) {
        console.error('payOS Error:', error);
        return {
            success: false,
            error: error.message || 'Internal server error during payOS payment creation'
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

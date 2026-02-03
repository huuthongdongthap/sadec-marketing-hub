// Supabase Edge Function: Create VNPay Payment
// Secure server-side payment URL generation for VNPay integration with signature verification

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import {
    validateEnvVars,
    getCorsHeaders,
    createHmacSha512,
    sortObject,
    formatVnpDate,
    generateVNPayTxnRef,
    savePaymentTransaction,
    type PaymentRequest,
    type PaymentResponse
} from '../_shared/payment-utils.ts';

// Validate required environment variables at startup
const REQUIRED_ENV_VARS = [
    'VNPAY_TMN_CODE',
    'VNPAY_SECRET_KEY',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
];

try {
    validateEnvVars(REQUIRED_ENV_VARS);
} catch (error) {
    console.error('Environment validation failed:', error.message);
}

// VNPay Configuration
const VNPAY_CONFIG = {
    vnpUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    tmnCode: Deno.env.get('VNPAY_TMN_CODE')!,
    secretKey: Deno.env.get('VNPAY_SECRET_KEY')!,
    returnUrl: Deno.env.get('VNPAY_RETURN_URL') || 'https://sadec-marketing-hub.vercel.app/portal/payment-result.html',
    version: '2.1.0',
    locale: 'vn',
    currCode: 'VND'
};

async function createPaymentUrl(req: PaymentRequest, supabase: any): Promise<PaymentResponse> {
    try {
        const txnRef = generateVNPayTxnRef(req.invoiceNumber);
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
            vnp_OrderInfo: req.orderInfo || `Thanh toan hoa don ${req.invoiceNumber}`,
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

        // Create secure hash using HMAC SHA-512
        const secureHash = await createHmacSha512(VNPAY_CONFIG.secretKey, signData);
        vnpParams['vnp_SecureHash'] = secureHash;

        // Build final URL
        const paymentUrl = `${VNPAY_CONFIG.vnpUrl}?${new URLSearchParams(vnpParams).toString()}`;

        // Save transaction to database
        await savePaymentTransaction(supabase, {
            invoice_id: req.invoiceId,
            amount: req.amount,
            gateway: 'vnpay',
            status: 'pending',
            transaction_id: txnRef,
            callback_data: {
                vnp_TxnRef: txnRef,
                vnp_Amount: vnpParams.vnp_Amount,
                vnp_OrderInfo: vnpParams.vnp_OrderInfo
            }
        });

        return {
            success: true,
            paymentUrl,
            transactionId: txnRef
        };

    } catch (error) {
        console.error('VNPay Error:', error);
        return {
            success: false,
            error: error.message || 'Failed to create VNPay payment URL'
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

        // Minimum amount for VNPay (10,000 VND)
        if (body.amount < 10000) {
            return new Response(
                JSON.stringify({ error: 'Minimum payment amount is 10,000 VND' }),
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

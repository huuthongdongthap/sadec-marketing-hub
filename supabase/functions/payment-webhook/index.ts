// Supabase Edge Function: Payment Webhook Handler
// Secure webhook handler for VNPay, MoMo, and PayOS with signature verification

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
    validateEnvVars,
    getCorsHeaders,
    createHmacSha256,
    createHmacSha512,
    sortObject,
    savePaymentTransaction,
    markInvoiceAsPaid,
    extractInvoiceNumber
} from '../_shared/payment-utils.ts';

// Validate required environment variables at startup
const REQUIRED_ENV_VARS = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'VNPAY_SECRET_KEY',
    'MOMO_ACCESS_KEY',
    'MOMO_SECRET_KEY',
    'PAYOS_CHECKSUM_KEY'
];

try {
    validateEnvVars(REQUIRED_ENV_VARS);
} catch (error) {
    console.error('Environment validation failed:', error.message);
}

serve(async (req) => {
    const origin = req.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const url = new URL(req.url);
        const gateway = url.searchParams.get('gateway'); // 'vnpay', 'momo', or 'payos'

        // Validate gateway parameter
        if (!gateway || !['vnpay', 'momo', 'payos'].includes(gateway)) {
            return new Response(JSON.stringify({ error: 'Invalid or missing gateway parameter' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        // Validate HTTP method based on gateway
        // VNPay uses GET for IPN, MoMo and PayOS use POST
        if (gateway === 'vnpay' && req.method !== 'GET') {
            return new Response(JSON.stringify({ error: 'VNPay webhooks must use GET method' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 405,
            });
        }
        if ((gateway === 'momo' || gateway === 'payos') && req.method !== 'POST') {
            return new Response(JSON.stringify({ error: `${gateway.toUpperCase()} webhooks must use POST method` }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 405,
            });
        }

        // Create Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        if (gateway === 'vnpay') {
            return await handleVNPayIPN(req, supabase, corsHeaders);
        } else if (gateway === 'momo') {
            return await handleMoMoIPN(req, supabase, corsHeaders);
        } else if (gateway === 'payos') {
            return await handlePayOSIPN(req, supabase, corsHeaders);
        }

    } catch (error) {
        console.error('Webhook handler error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});

async function handleVNPayIPN(req: Request, supabase: any, corsHeaders: Record<string, string>) {
    // VNPay sends GET request for IPN
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());

    const vnp_SecureHash = params.vnp_SecureHash;
    const vnp_TxnRef = params.vnp_TxnRef;
    const vnp_Amount = params.vnp_Amount;
    const vnp_ResponseCode = params.vnp_ResponseCode;
    const vnp_TransactionNo = params.vnp_TransactionNo;

    // CRITICAL: Verify VNPay signature using HMAC SHA-512
    const VNPAY_SECRET_KEY = Deno.env.get('VNPAY_SECRET_KEY')!;

    // Remove hash parameters for verification
    const paramsForHash = { ...params };
    delete paramsForHash.vnp_SecureHash;
    delete paramsForHash.vnp_SecureHashType;
    delete paramsForHash.gateway; // Remove our custom parameter

    // Sort parameters and create signature string
    const sortedParams = sortObject(paramsForHash);
    const signData = new URLSearchParams(sortedParams).toString();
    const computedHash = await createHmacSha512(VNPAY_SECRET_KEY, signData);

    const isVerified = vnp_SecureHash === computedHash;

    if (!isVerified) {
        console.error('VNPay signature verification failed');

        // Save failed verification attempt
        await savePaymentTransaction(supabase, {
            amount: parseInt(vnp_Amount) / 100,
            gateway: 'vnpay',
            status: 'failed',
            transaction_id: vnp_TxnRef,
            gateway_transaction_no: vnp_TransactionNo,
            callback_data: { ...params, verification_failed: true },
        });

        return new Response(JSON.stringify({ RspCode: '97', Message: 'Invalid Signature' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });
    }

    // Extract invoice number from transaction reference
    const invoiceNumber = extractInvoiceNumber(vnp_TxnRef, 'vnpay');
    const amount = parseInt(vnp_Amount) / 100;

    if (!invoiceNumber) {
        console.error('Could not extract invoice number from:', vnp_TxnRef);
        await savePaymentTransaction(supabase, {
            amount,
            gateway: 'vnpay',
            status: vnp_ResponseCode === '00' ? 'success' : 'failed',
            transaction_id: vnp_TxnRef,
            gateway_transaction_no: vnp_TransactionNo,
            callback_data: params,
        });

        return new Response(JSON.stringify({ RspCode: '01', Message: 'Order not found' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });
    }

    // Query for invoice
    const { data: invoice, error: invoiceQueryError } = await supabase
        .from('invoices')
        .select('id, status')
        .eq('invoice_number', invoiceNumber)
        .single();

    if (invoiceQueryError || !invoice) {
        console.error('Invoice not found:', invoiceNumber);

        // Save transaction without invoice_id
        await savePaymentTransaction(supabase, {
            amount,
            gateway: 'vnpay',
            status: vnp_ResponseCode === '00' ? 'success' : 'failed',
            transaction_id: vnp_TxnRef,
            gateway_transaction_no: vnp_TransactionNo,
            callback_data: params,
        });

        return new Response(JSON.stringify({ RspCode: '01', Message: 'Order not found' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });
    }

    if (vnp_ResponseCode === '00') {
        // Payment Success - Update invoice and save transaction
        await markInvoiceAsPaid(supabase, invoice.id);

        await savePaymentTransaction(supabase, {
            invoice_id: invoice.id,
            amount,
            gateway: 'vnpay',
            status: 'success',
            transaction_id: vnp_TxnRef,
            gateway_transaction_no: vnp_TransactionNo,
            callback_data: params,
        });

        return new Response(JSON.stringify({ RspCode: '00', Message: 'Confirm Success' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });
    } else {
        // Payment Failed
        await savePaymentTransaction(supabase, {
            invoice_id: invoice.id,
            amount,
            gateway: 'vnpay',
            status: 'failed',
            transaction_id: vnp_TxnRef,
            gateway_transaction_no: vnp_TransactionNo,
            callback_data: params,
        });

        return new Response(JSON.stringify({ RspCode: '00', Message: 'Confirm Success' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });
    }
}

async function handleMoMoIPN(req: Request, supabase: any, corsHeaders: Record<string, string>) {
    // MoMo sends POST request
    const body = await req.json();
    const {
        partnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature,
    } = body;

    // CRITICAL: Verify MoMo signature using HMAC SHA-256
    const MOMO_ACCESS_KEY = Deno.env.get('MOMO_ACCESS_KEY')!;
    const MOMO_SECRET_KEY = Deno.env.get('MOMO_SECRET_KEY')!;

    // MoMo signature format for IPN:
    // accessKey={accessKey}&amount={amount}&extraData={extraData}&message={message}&orderId={orderId}&orderInfo={orderInfo}&orderType={orderType}&partnerCode={partnerCode}&payType={payType}&requestId={requestId}&responseTime={responseTime}&resultCode={resultCode}&transId={transId}
    const rawSignature = `accessKey=${MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData || ''}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const computedSignature = await createHmacSha256(MOMO_SECRET_KEY, rawSignature);
    const isVerified = signature === computedSignature;

    if (!isVerified) {
        console.error('MoMo signature verification failed');

        // Save failed verification attempt
        await savePaymentTransaction(supabase, {
            amount: parseInt(amount),
            gateway: 'momo',
            status: 'failed',
            transaction_id: orderId,
            gateway_transaction_no: transId,
            callback_data: { ...body, verification_failed: true },
        });

        return new Response(JSON.stringify({ message: 'Invalid signature' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400
        });
    }

    // Extract invoice number from orderId
    const invoiceNumber = extractInvoiceNumber(orderId, 'momo');
    const amountNum = parseInt(amount);

    if (!invoiceNumber) {
        console.error('Could not extract invoice number from:', orderId);
        await savePaymentTransaction(supabase, {
            amount: amountNum,
            gateway: 'momo',
            status: resultCode === 0 ? 'success' : 'failed',
            transaction_id: orderId,
            gateway_transaction_no: transId,
            callback_data: body,
        });

        return new Response(JSON.stringify({ message: 'Received' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 204,
        });
    }

    // Query for invoice
    const { data: invoice, error: invoiceQueryError } = await supabase
        .from('invoices')
        .select('id, status')
        .eq('invoice_number', invoiceNumber)
        .single();

    if (invoiceQueryError || !invoice) {
        console.error('Invoice not found:', invoiceNumber);

        // Save transaction without invoice_id
        await savePaymentTransaction(supabase, {
            amount: amountNum,
            gateway: 'momo',
            status: resultCode === 0 ? 'success' : 'failed',
            transaction_id: orderId,
            gateway_transaction_no: transId,
            callback_data: body,
        });

        return new Response(JSON.stringify({ message: 'Received' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 204,
        });
    }

    if (resultCode === 0) {
        // Payment Success - Update invoice and save transaction
        await markInvoiceAsPaid(supabase, invoice.id);

        await savePaymentTransaction(supabase, {
            invoice_id: invoice.id,
            amount: amountNum,
            gateway: 'momo',
            status: 'success',
            transaction_id: orderId,
            gateway_transaction_no: transId,
            callback_data: body,
        });
    } else {
        // Payment Failed
        await savePaymentTransaction(supabase, {
            invoice_id: invoice.id,
            amount: amountNum,
            gateway: 'momo',
            status: 'failed',
            transaction_id: orderId,
            gateway_transaction_no: transId,
            callback_data: body,
        });
    }

    return new Response(JSON.stringify({ message: 'Received' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 204, // MoMo expects 204 or 200
    });
}

async function handlePayOSIPN(req: Request, supabase: any, corsHeaders: Record<string, string>) {
    // payOS sends POST request with webhook data
    const body = await req.json();
    const { code, data, signature, desc } = body;

    // CRITICAL: Verify PayOS webhook signature using HMAC SHA-256
    const PAYOS_CHECKSUM_KEY = Deno.env.get('PAYOS_CHECKSUM_KEY')!;

    // PayOS webhook signature verification
    // signature = HMAC_SHA256(checksumKey, sortedDataString)
    // Sort data object keys alphabetically and create string
    if (data && typeof data === 'object') {
        const sortedData = sortObject(
            Object.fromEntries(
                Object.entries(data).map(([k, v]) => [k, String(v)])
            )
        );
        const dataString = Object.entries(sortedData)
            .map(([k, v]) => `${k}=${v}`)
            .join('&');

        const computedSignature = await createHmacSha256(PAYOS_CHECKSUM_KEY, dataString);
        const isVerified = signature === computedSignature;

        if (!isVerified) {
            console.error('PayOS signature verification failed');

            // Save failed verification attempt
            await savePaymentTransaction(supabase, {
                amount: data.amount || 0,
                gateway: 'payos',
                status: 'failed',
                transaction_id: data.orderCode || 'UNKNOWN',
                gateway_transaction_no: data.reference || null,
                callback_data: { ...body, verification_failed: true },
            });

            return new Response(
                JSON.stringify({
                    error: 1,
                    message: 'Invalid signature',
                    data: null,
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }
    }

    // Check payment status
    // payOS codes: "00" = success, others = failed
    if (code === '00' && data) {
        const { orderCode, amount, description, reference, transactionDateTime } = data;

        // Extract invoice number from description
        const invoiceMatch = description?.match(/INV-\d{4}-\d{3}/);
        const invoiceNumber = invoiceMatch ? invoiceMatch[0] : null;

        if (invoiceNumber) {
            // Query for invoice
            const { data: invoice, error: invoiceQueryError } = await supabase
                .from('invoices')
                .select('id, status')
                .eq('invoice_number', invoiceNumber)
                .single();

            if (!invoiceQueryError && invoice) {
                // Update Invoice Status and save transaction
                await markInvoiceAsPaid(supabase, invoice.id, transactionDateTime);

                await savePaymentTransaction(supabase, {
                    invoice_id: invoice.id,
                    amount: parseInt(amount),
                    gateway: 'payos',
                    status: 'success',
                    transaction_id: orderCode.toString(),
                    gateway_transaction_no: reference || null,
                    callback_data: body,
                });

                console.log(`payOS Payment Success: ${invoiceNumber} - ${amount} VND`);
            } else {
                console.error('Invoice not found:', invoiceNumber);

                // Save transaction without invoice_id
                await savePaymentTransaction(supabase, {
                    amount: parseInt(amount),
                    gateway: 'payos',
                    status: 'success',
                    transaction_id: orderCode.toString(),
                    gateway_transaction_no: reference || null,
                    callback_data: body,
                });
            }
        } else {
            console.error('Could not extract invoice number from description:', description);

            // Save transaction without invoice_id
            await savePaymentTransaction(supabase, {
                amount: parseInt(amount),
                gateway: 'payos',
                status: 'success',
                transaction_id: orderCode.toString(),
                gateway_transaction_no: reference || null,
                callback_data: body,
            });
        }

        // Return success response (payOS expects this format)
        return new Response(
            JSON.stringify({
                error: 0,
                message: 'Success',
                data: {
                    orderCode: orderCode,
                },
            }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
            }
        );
    } else {
        // Payment failed or other status
        console.log(`payOS Payment Failed: Code ${code} - ${desc}`);

        if (data?.orderCode) {
            await savePaymentTransaction(supabase, {
                amount: data.amount || 0,
                gateway: 'payos',
                status: 'failed',
                transaction_id: data.orderCode.toString(),
                gateway_transaction_no: data.reference || null,
                callback_data: body,
            });
        }

        return new Response(
            JSON.stringify({
                error: 0,
                message: 'Received',
                data: null,
            }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
            }
        );
    }
}

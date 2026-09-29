// Supabase Edge Function: Verify MoMo Payment
// Handles return URL callback and verifies payment status

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const MOMO_SECRET_KEY = Deno.env.get('MOMO_SECRET_KEY') || 'MOMO_SECRET_KEY';
const MOMO_ACCESS_KEY = Deno.env.get('MOMO_ACCESS_KEY') || 'MOMO_ACCESS_KEY';

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

serve(async (req: Request) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    try {
        const url = new URL(req.url);
        const params = Object.fromEntries(url.searchParams.entries());

        // MoMo Redirect Params:
        // partnerCode, orderId, requestId, amount, orderInfo, orderType, transId, resultCode, message, payType, responseTime, extraData, signature

        // Check if it's a MoMo request
        if (!params.signature || !params.partnerCode) {
             return new Response(
                JSON.stringify({ error: 'Invalid MoMo parameters' }),
                { status: 400, headers }
            );
        }

        const {
            partnerCode, accessKey, requestId, amount, orderId, orderInfo,
            orderType, transId, message, localMessage, responseTime, errorCode,
            payType, extraData, signature, resultCode
        } = params;

        // Reconstruct signature string
        // accessKey=$accessKey&amount=$amount&extraData=$extraData&message=$message&orderId=$orderId&orderInfo=$orderInfo&orderType=$orderType&partnerCode=$partnerCode&payType=$payType&requestId=$requestId&responseTime=$responseTime&resultCode=$resultCode&transId=$transId

        const rawSignature = `accessKey=${MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

        const checkSum = await createHmacSha256(MOMO_SECRET_KEY, rawSignature);

        const isValidSignature = signature === checkSum;

        let status: 'success' | 'failed' | 'pending' | 'invalid' = 'failed';
        let resultMessage = message || 'Giao dịch thất bại';

        if (!isValidSignature) {
            status = 'invalid';
            resultMessage = 'Chữ ký không hợp lệ';
        } else if (resultCode === '0') {
            status = 'success';
            resultMessage = 'Thanh toán thành công';
        }

        return new Response(
            JSON.stringify({
                status,
                message: resultMessage,
                transactionId: transId,
                amount: parseInt(amount),
                bankCode: 'MOMO', // MoMo doesn't always return bank code in redirect
                payDate: responseTime, // MoMo returns timestamp in ms
                isValidSignature
            }),
            { status: 200, headers }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Internal server error', details: error.message }),
            { status: 500, headers }
        );
    }
});

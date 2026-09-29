// Supabase Edge Function: Verify VNPay Payment
// Handles return URL callback and verifies payment status

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const VNPAY_SECRET_KEY = Deno.env.get('VNPAY_SECRET_KEY') || 'VNPAYSECRETKEY2024';

interface VnpayResponse {
    vnp_Amount: string;
    vnp_BankCode: string;
    vnp_BankTranNo: string;
    vnp_CardType: string;
    vnp_OrderInfo: string;
    vnp_PayDate: string;
    vnp_ResponseCode: string;
    vnp_TmnCode: string;
    vnp_TransactionNo: string;
    vnp_TransactionStatus: string;
    vnp_TxnRef: string;
    vnp_SecureHash: string;
}

// VNPay Response Codes
const RESPONSE_CODES: Record<string, string> = {
    '00': 'Giao dịch thành công',
    '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
    '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking.',
    '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.',
    '11': 'Đã hết hạn chờ thanh toán.',
    '12': 'Thẻ/Tài khoản bị khóa.',
    '13': 'Nhập sai mật khẩu xác thực giao dịch (OTP).',
    '24': 'Khách hàng hủy giao dịch.',
    '51': 'Tài khoản không đủ số dư.',
    '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày.',
    '75': 'Ngân hàng thanh toán đang bảo trì.',
    '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định.',
    '99': 'Lỗi không xác định.'
};

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

function sortObject(obj: Record<string, string>): Record<string, string> {
    const sorted: Record<string, string> = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
        sorted[key] = obj[key];
    }
    return sorted;
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

        // Extract secure hash
        const secureHash = params.vnp_SecureHash;
        delete params.vnp_SecureHash;
        delete params.vnp_SecureHashType;

        // Sort and verify signature
        const sortedParams = sortObject(params);
        const signData = new URLSearchParams(sortedParams).toString();
        const checkSum = await createHmacSha512(VNPAY_SECRET_KEY, signData);

        const isValidSignature = secureHash === checkSum;
        const responseCode = params.vnp_ResponseCode;
        const transactionStatus = params.vnp_TransactionStatus;
        const txnRef = params.vnp_TxnRef;
        const amount = parseInt(params.vnp_Amount) / 100; // Convert back from smallest unit

        // Determine payment status
        let status: 'success' | 'failed' | 'pending' | 'invalid' = 'failed';
        let message = RESPONSE_CODES[responseCode] || 'Lỗi không xác định';

        if (!isValidSignature) {
            status = 'invalid';
            message = 'Chữ ký không hợp lệ';
        } else if (responseCode === '00' && transactionStatus === '00') {
            status = 'success';
            message = 'Thanh toán thành công';

            // Update transaction in database
            // const supabase = createClient(
            //     Deno.env.get('SUPABASE_URL')!,
            //     Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
            // );
            // await supabase.from('transactions')
            //     .update({ 
            //         status: 'completed',
            //         bank_code: params.vnp_BankCode,
            //         bank_transaction_no: params.vnp_BankTranNo,
            //         completed_at: new Date().toISOString()
            //     })
            //     .eq('transaction_id', txnRef);
        }

        return new Response(
            JSON.stringify({
                status,
                message,
                transactionId: txnRef,
                amount,
                bankCode: params.vnp_BankCode,
                payDate: params.vnp_PayDate,
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

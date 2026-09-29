// Payment Routes — CF Worker (replaces Supabase Edge Functions)
// Handles: VNPay, PayOS, MoMo payment creation and verification

import { Hono } from 'hono';
import type { AppContext } from '../types';
import {
    validatePaymentRequest,
    savePaymentTransaction,
    updatePaymentStatus,
    markInvoiceAsPaid,
    createHmacSha256,
    createHmacSha512,
    sortObject,
    formatVnpDate,
    generateVNPayTxnRef,
    generatePayOSOrderCode,
    generateMoMoOrderId,
    getCorsHeaders,
} from '../lib/payment';
import { extractBearerToken, verifySupabaseJwt } from '../lib/auth';

const payments = new Hono<AppContext>();

// ── Auth middleware for payment routes ────────────────────────────────────────
payments.use('*', async (c, next) => {
    const token = extractBearerToken(c.req.header('Authorization') || null);
    if (!token) return c.json({ error: 'Unauthorized' }, 401);

    const user = await verifySupabaseJwt(token, c.env.SUPABASE_JWT_SECRET);
    if (!user) return c.json({ error: 'Invalid or expired token' }, 401);

    c.set('user', user);
    return next();
});

// ── VNPay ─────────────────────────────────────────────────────────────────────
payments.post('/vnpay/create', async (c) => {
    const body = await c.req.json().catch(() => null);
    const validation = validatePaymentRequest(body);
    if (!validation.valid) return c.json({ error: validation.error }, validation.statusCode as 400 || 400);

    const req = body as { invoiceId: string; invoiceNumber: string; amount: number; orderInfo?: string };
    const txnRef = generateVNPayTxnRef(req.invoiceNumber);
    const createDate = formatVnpDate(new Date());
    const expireDate = formatVnpDate(new Date(Date.now() + 15 * 60 * 1000));
    const returnUrl = c.env.VNPAY_RETURN_URL || `${c.env.APP_URL}/portal/payment-result.html`;

    let vnpParams: Record<string, string> = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: c.env.VNPAY_TMN_CODE,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: req.orderInfo || `Thanh toan hoa don ${req.invoiceNumber}`,
        vnp_OrderType: 'other',
        vnp_Amount: (req.amount * 100).toString(),
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: c.req.header('CF-Connecting-IP') || '127.0.0.1',
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate,
    };

    vnpParams = sortObject(vnpParams);
    const signData = new URLSearchParams(vnpParams).toString();
    const secureHash = await createHmacSha512(c.env.VNPAY_SECRET_KEY, signData);
    vnpParams.vnp_SecureHash = secureHash;

    const paymentUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?${new URLSearchParams(vnpParams)}`;

    await savePaymentTransaction(c.env.DB, {
        invoice_id: req.invoiceId,
        amount: req.amount,
        gateway: 'vnpay',
        status: 'pending',
        transaction_id: txnRef,
        callback_data: {},
    });

    return c.json({ success: true, paymentUrl, transactionId: txnRef });
});

// ── PayOS ─────────────────────────────────────────────────────────────────────
payments.post('/payos/create', async (c) => {
    const body = await c.req.json().catch(() => null);
    const validation = validatePaymentRequest(body);
    if (!validation.valid) return c.json({ error: validation.error }, validation.statusCode as 400 || 400);

    const req = body as { invoiceId: string; invoiceNumber: string; amount: number; description?: string };
    if (req.amount < 2000) return c.json({ error: 'PayOS minimum amount is 2,000 VND' }, 400);

    const orderCode = generatePayOSOrderCode();
    const description = req.description || `Thanh toan ${req.invoiceNumber}`;
    const returnUrl = `${c.env.APP_URL}/portal/payment-result.html`;
    const cancelUrl = `${c.env.APP_URL}/portal/payments.html`;

    // PayOS signature: amount + cancelUrl + description + orderCode + returnUrl
    const rawSignature = [
        `amount=${req.amount}`,
        `cancelUrl=${cancelUrl}`,
        `description=${description}`,
        `orderCode=${orderCode}`,
        `returnUrl=${returnUrl}`,
    ].join('&');

    const signature = await createHmacSha256(c.env.PAYOS_CHECKSUM_KEY, rawSignature);

    const response = await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-client-id': c.env.PAYOS_CLIENT_ID,
            'x-api-key': c.env.PAYOS_API_KEY,
        },
        body: JSON.stringify({
            orderCode,
            amount: req.amount,
            description,
            returnUrl,
            cancelUrl,
            signature,
            items: [{
                name: description,
                quantity: 1,
                price: req.amount,
            }],
        }),
    });

    const data = await response.json() as { code: string; data?: { checkoutUrl?: string; deeplink?: string } };
    if (data.code !== '00') return c.json({ success: false, error: 'PayOS error', raw: data }, 500);

    await savePaymentTransaction(c.env.DB, {
        invoice_id: req.invoiceId,
        amount: req.amount,
        gateway: 'payos',
        status: 'pending',
        transaction_id: orderCode.toString(),
        callback_data: data.data || {},
    });

    return c.json({
        success: true,
        checkoutUrl: data.data?.checkoutUrl,
        deeplink: data.data?.deeplink,
        transactionId: orderCode.toString(),
    });
});

// ── MoMo ─────────────────────────────────────────────────────────────────────
payments.post('/momo/create', async (c) => {
    const body = await c.req.json().catch(() => null);
    const validation = validatePaymentRequest(body);
    if (!validation.valid) return c.json({ error: validation.error }, validation.statusCode as 400 || 400);

    const req = body as { invoiceId: string; invoiceNumber: string; amount: number; orderInfo?: string };
    if (req.amount < 1000) return c.json({ error: 'MoMo minimum amount is 1,000 VND' }, 400);

    const orderId = generateMoMoOrderId(req.invoiceNumber);
    const requestId = `${orderId}-REQ`;
    const orderInfo = req.orderInfo || `Thanh toan hoa don ${req.invoiceNumber}`;
    const redirectUrl = `${c.env.APP_URL}/portal/payment-result.html`;
    const ipnUrl = c.env.MOMO_NOTIFY_URL || `${c.env.APP_URL}/api/webhooks/momo`;
    const requestType = 'payWithMethod';

    const rawSignature = [
        `accessKey=${c.env.MOMO_ACCESS_KEY}`,
        `amount=${req.amount}`,
        `extraData=`,
        `ipnUrl=${ipnUrl}`,
        `orderId=${orderId}`,
        `orderInfo=${orderInfo}`,
        `partnerCode=${c.env.MOMO_PARTNER_CODE}`,
        `redirectUrl=${redirectUrl}`,
        `requestId=${requestId}`,
        `requestType=${requestType}`,
    ].join('&');

    const signature = await createHmacSha256(c.env.MOMO_SECRET_KEY, rawSignature);

    const response = await fetch('https://test-payment.momo.vn/v2/gateway/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            partnerCode: c.env.MOMO_PARTNER_CODE,
            accessKey: c.env.MOMO_ACCESS_KEY,
            requestId, orderId, amount: req.amount,
            orderInfo, redirectUrl, ipnUrl,
            requestType, extraData: '',
            lang: 'vi', signature,
        }),
    });

    const data = await response.json() as { resultCode: number; payUrl?: string; deeplink?: string; message?: string };
    if (data.resultCode !== 0) return c.json({ success: false, error: data.message }, 500);

    await savePaymentTransaction(c.env.DB, {
        invoice_id: req.invoiceId,
        amount: req.amount,
        gateway: 'momo',
        status: 'pending',
        transaction_id: orderId,
        callback_data: { payUrl: data.payUrl },
    });

    return c.json({ success: true, paymentUrl: data.payUrl, deeplink: data.deeplink, transactionId: orderId });
});

// ── VNPay verify return URL ─────────────────────────────────────────────────
payments.get('/vnpay/verify', async (c) => {
    const params = Object.fromEntries(new URL(c.req.url).searchParams);
    const vnpSecureHash = params.vnp_SecureHash;
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    const sorted = sortObject(params);
    const signData = new URLSearchParams(sorted).toString();
    const computedHash = await createHmacSha512(c.env.VNPAY_SECRET_KEY, signData);

    if (computedHash !== vnpSecureHash) return c.json({ success: false, error: 'Invalid signature' }, 400);

    const success = params.vnp_ResponseCode === '00';
    const txnRef = params.vnp_TxnRef;

    await updatePaymentStatus(
        c.env.DB,
        txnRef,
        success ? 'completed' : 'failed',
        params.vnp_TransactionNo
    );

    return c.json({ success, txnRef, responseCode: params.vnp_ResponseCode });
});

export { payments as paymentsRoute };

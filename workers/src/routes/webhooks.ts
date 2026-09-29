// Webhooks Route — handles payment webhooks from VNPay, MoMo, PayOS, Zalo
import { Hono } from 'hono';
import type { AppContext } from '../types';
import {
    createHmacSha256,
    createHmacSha512,
    sortObject,
    updatePaymentStatus,
    markInvoiceAsPaid,
    getCorsHeaders,
} from '../lib/payment';

const webhooks = new Hono<AppContext>();

// ── MoMo IPN ────────────────────────────────────────────────────────────────
webhooks.post('/momo', async (c) => {
    const body = await c.req.json().catch(() => null);
    if (!body) return c.json({ error: 'Invalid body' }, 400);

    const { partnerCode, accessKey, requestId, amount, orderId, orderInfo,
        orderType, transId, resultCode, message, localMessage,
        responseTime, extraData, signature } = body as Record<string, string | number>;

    // Verify MoMo signature
    const rawSignature = [
        `accessKey=${accessKey}`,
        `amount=${amount}`,
        `extraData=${extraData}`,
        `message=${message}`,
        `orderId=${orderId}`,
        `orderInfo=${orderInfo}`,
        `orderType=${orderType}`,
        `partnerCode=${partnerCode}`,
        `payType=web`,
        `requestId=${requestId}`,
        `responseTime=${responseTime}`,
        `resultCode=${resultCode}`,
        `transId=${transId}`,
    ].join('&');

    const expectedSig = await createHmacSha256(c.env.MOMO_SECRET_KEY, rawSignature);
    if (signature !== expectedSig) {
        console.warn('MoMo webhook: invalid signature');
        return c.json({ error: 'Invalid signature' }, 400);
    }

    const success = Number(resultCode) === 0;
    await updatePaymentStatus(c.env.DB, orderId as string, success ? 'completed' : 'failed', transId as string);

    if (success) {
        // Find and update invoice
        const txn = await c.env.DB.prepare(
            'SELECT invoice_id FROM payment_transactions WHERE transaction_id = ? LIMIT 1'
        ).bind(orderId).first<{ invoice_id: string }>();
        if (txn?.invoice_id) await markInvoiceAsPaid(c.env.DB, txn.invoice_id);
    }

    return c.json({ resultCode: 0 });
});

// ── PayOS Webhook ────────────────────────────────────────────────────────────
webhooks.post('/payos', async (c) => {
    const body = await c.req.json().catch(() => null);
    if (!body) return c.json({ error: 'Invalid body' }, 400);

    const { data, signature } = body as { data: Record<string, unknown>; signature: string };

    // Verify PayOS webhook signature
    const checkStr = Object.entries(data)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&');

    const expectedSig = await createHmacSha256(c.env.PAYOS_CHECKSUM_KEY, checkStr);
    if (signature !== expectedSig) return c.json({ error: 'Invalid signature' }, 400);

    const { orderCode, code } = data as { orderCode: number; code: string };
    const success = code === '00';
    const txnId = orderCode.toString();

    await updatePaymentStatus(c.env.DB, txnId, success ? 'completed' : 'failed');

    if (success) {
        const txn = await c.env.DB.prepare(
            'SELECT invoice_id FROM payment_transactions WHERE transaction_id = ? LIMIT 1'
        ).bind(txnId).first<{ invoice_id: string }>();
        if (txn?.invoice_id) await markInvoiceAsPaid(c.env.DB, txn.invoice_id);
    }

    return c.json({ code: '00' });
});

// ── Zalo OA Webhook ──────────────────────────────────────────────────────────
webhooks.post('/zalo', async (c) => {
    // Zalo OA verification
    const mac = c.req.header('X-ZaloOA-Signature');
    const body = await c.req.text();

    const expected = await createHmacSha256(c.env.ZALO_OA_SECRET, body);
    if (mac !== expected) return c.json({ error: 'Invalid signature' }, 400);

    // Log Zalo events — extend as needed
    const event = JSON.parse(body) as { event_name: string;[k: string]: unknown };
    console.log('Zalo event:', event.event_name, event);

    return c.json({ ok: true });
});

export { webhooks as webhooksRoute };

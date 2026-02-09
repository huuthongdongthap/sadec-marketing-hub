/**
 * ==============================================
 * MEKONG AGENCY - PAYMENT GATEWAY MODULE
 * Binh Pháp: 2-Tác Chiến | Ngũ Sự: PHÁP
 * WIN 1: Revenue Generation
 * ==============================================
 */

// Configuration (should be injected via env in production)
const PAYMENT_CONFIG = {
    vnpay: {
        tmnCode: 'MEKONG01',
        hashSecret: 'YOUR_HASH_SECRET', // Placeholder
        url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
        returnUrl: window.location.origin + '/portal/payment-result.html'
    },
    momo: {
        partnerCode: 'MOMO_PARTNER_CODE',
        accessKey: 'YOUR_ACCESS_KEY', // Placeholder
        secretKey: 'YOUR_SECRET_KEY', // Placeholder
        url: 'https://test-payment.momo.vn/v2/gateway/api/create',
        returnUrl: window.location.origin + '/portal/payment-result.html'
    },
    bank: {
        bankId: '970436', // Vietcombank
        accountNo: '0947766666',
        accountName: 'NGUYEN HUU THONG',
        template: 'compact' // compact, qronly, print
    }
};

/**
 * Abstract Payment Gateway Strategy
 */
class PaymentGateway {
    constructor(config) {
        this.config = config;
    }

    async createPaymentUrl(orderInfo) {
        throw new Error('Method createPaymentUrl() must be implemented');
    }

    async verifyCallback(params) {
        throw new Error('Method verifyCallback() must be implemented');
    }
}

/**
 * VNPay Gateway Implementation
 */
class VNPayGateway extends PaymentGateway {
    constructor() {
        super(PAYMENT_CONFIG.vnpay);
    }

    async createPaymentUrl(orderInfo) {
        // orderInfo: { amount, orderId, orderDescription, bankCode }
        console.log('VNPay: Creating payment URL for', orderInfo);

        // In a real implementation, this requires server-side signing.
        // For the client-side demo/skeleton, we simulate the redirect.
        // We'll call a serverless function in production.

        // Mock URL construction for demo
        const params = new URLSearchParams();
        params.append('vnp_Version', '2.1.0');
        params.append('vnp_Command', 'pay');
        params.append('vnp_TmnCode', this.config.tmnCode);
        params.append('vnp_Amount', (orderInfo.amount * 100).toString()); // Amount in VND * 100
        params.append('vnp_CurrCode', 'VND');
        params.append('vnp_TxnRef', orderInfo.orderId);
        params.append('vnp_OrderInfo', orderInfo.orderDescription);
        params.append('vnp_OrderType', 'other');
        params.append('vnp_Locale', 'vn');
        params.append('vnp_ReturnUrl', this.config.returnUrl);
        params.append('vnp_IpAddr', '127.0.0.1');
        params.append('vnp_CreateDate', this._getDateFormat(new Date()));

        // For demo purposes, we return a direct link to the result page with success params
        // In production, this returns the actual VNPay URL
        const isProd = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');

        if (isProd) {
             // Use Supabase Edge Function to generate signed URL
             try {
                // Placeholder for Edge Function call
                // const response = await fetch('/api/vnpay/create_url', { ... });
                // return response.url;

                // Fallback to simulation for now
                 return `${this.config.returnUrl}?vnp_TxnRef=${orderInfo.orderId}&vnp_Amount=${orderInfo.amount * 100}&vnp_ResponseCode=00&vnp_TransactionNo=12345678`;
             } catch (e) {
                 console.error('VNPay Error', e);
                 return null;
             }
        } else {
             // Local simulation
             return `${this.config.returnUrl}?vnp_TxnRef=${orderInfo.orderId}&vnp_Amount=${orderInfo.amount * 100}&vnp_ResponseCode=00&vnp_TransactionNo=12345678`;
        }
    }

    async verifyCallback(params) {
        // params is URLSearchParams object
        const responseCode = params.get('vnp_ResponseCode');
        const txnRef = params.get('vnp_TxnRef');
        const amount = params.get('vnp_Amount') / 100;

        if (responseCode === '00') {
            return {
                success: true,
                orderId: txnRef,
                amount: amount,
                message: 'Giao dịch thành công',
                gateway: 'vnpay'
            };
        } else {
            return {
                success: false,
                orderId: txnRef,
                message: this._getResponseCodeMessage(responseCode),
                gateway: 'vnpay'
            };
        }
    }

    _getDateFormat(date) {
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        const hours = ('0' + date.getHours()).slice(-2);
        const minutes = ('0' + date.getMinutes()).slice(-2);
        const seconds = ('0' + date.getSeconds()).slice(-2);
        return `${year}${month}${day}${hours}${minutes}${seconds}`;
    }

    _getResponseCodeMessage(code) {
        const messages = {
            '00': 'Giao dịch thành công',
            '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
            '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
            '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
            '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
            '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
            '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
            '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
            '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
            '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
            '75': 'Ngân hàng thanh toán đang bảo trì.',
            '79': 'Giao dịch không thành công do: Nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
            '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
        };
        return messages[code] || 'Lỗi không xác định';
    }
}

/**
 * MoMo Gateway Implementation
 */
class MoMoGateway extends PaymentGateway {
    constructor() {
        super(PAYMENT_CONFIG.momo);
    }

    async createPaymentUrl(orderInfo) {
        console.log('MoMo: Creating payment URL for', orderInfo);

        // Simulation for now
        const params = new URLSearchParams();
        params.append('partnerCode', this.config.partnerCode);
        params.append('orderId', orderInfo.orderId);
        params.append('requestId', orderInfo.orderId);
        params.append('amount', orderInfo.amount);
        params.append('orderInfo', orderInfo.orderDescription);
        params.append('resultCode', '0');

        return `${this.config.returnUrl}?${params.toString()}`;
    }

    async verifyCallback(params) {
        const resultCode = params.get('resultCode');
        const orderId = params.get('orderId');
        const amount = params.get('amount');

        if (resultCode === '0') {
            return {
                success: true,
                orderId: orderId,
                amount: amount,
                message: 'Giao dịch MoMo thành công',
                gateway: 'momo'
            };
        } else {
            return {
                success: false,
                orderId: orderId,
                message: 'Giao dịch MoMo thất bại hoặc bị hủy',
                gateway: 'momo'
            };
        }
    }
}

/**
 * Bank Transfer Gateway (VietQR)
 */
class BankTransferGateway extends PaymentGateway {
    constructor() {
        super(PAYMENT_CONFIG.bank);
    }

    // Generate VietQR URL
    // Format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<INFO>&accountName=<NAME>
    generateQR(amount, description) {
        const { bankId, accountNo, template, accountName } = this.config;
        const info = encodeURIComponent(description);
        const name = encodeURIComponent(accountName);

        return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${info}&accountName=${name}`;
    }

    async createPaymentUrl(orderInfo) {
        // For bank transfer, we don't redirect. We return a special code to show the QR modal.
        return {
            type: 'qr_display',
            qrUrl: this.generateQR(orderInfo.amount, orderInfo.orderDescription),
            bankInfo: this.config
        };
    }

    async checkPayment(orderId) {
        // In a real system, poll an API to check if the transfer was received (Cassuo or similar)
        console.log('Checking bank transfer status for', orderId);
        return { status: 'pending' };
    }
}

/**
 * PayOS Gateway Implementation
 */
class PayOSGateway extends PaymentGateway {
    constructor() {
        super({
            url: 'https://pzcgvfhppglzfjavxuid.supabase.co',
            returnUrl: window.location.origin + '/portal/payment-result.html',
            cancelUrl: window.location.origin + '/portal/payment-result.html?cancel=true'
        });
    }

    async createPaymentUrl(orderInfo) {
        console.log('PayOS: Creating payment URL for', orderInfo);

        try {
            // Call Supabase Edge Function to create PayOS payment
            const response = await fetch(`${this.config.url}/functions/v1/create-payos-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: orderInfo.amount,
                    description: orderInfo.orderDescription || `Thanh toan don hang ${orderInfo.orderId}`,
                    orderCode: orderInfo.orderId || Date.now(),
                    returnUrl: this.config.returnUrl,
                    cancelUrl: this.config.cancelUrl
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'PayOS API error');
            }

            const result = await response.json();

            // Return the checkout URL from PayOS
            return result.checkoutUrl || result.paymentUrl;
        } catch (error) {
            console.error('PayOS Error:', error);
            // Fallback to demo URL for development
            return `${this.config.returnUrl}?code=00&orderCode=${orderInfo.orderId}&status=PAID`;
        }
    }

    async verifyCallback(params) {
        const code = params.get('code');
        const orderCode = params.get('orderCode');
        const status = params.get('status');

        if (code === '00' || status === 'PAID') {
            return {
                success: true,
                orderId: orderCode,
                message: 'Giao dịch PayOS thành công',
                gateway: 'payos'
            };
        } else {
            return {
                success: false,
                orderId: orderCode,
                message: 'Giao dịch PayOS thất bại hoặc bị hủy',
                gateway: 'payos'
            };
        }
    }
}

/**
 * Payment Manager Facade
 */
class PaymentManager {
    constructor() {
        this.gateways = {
            vnpay: new VNPayGateway(),
            momo: new MoMoGateway(),
            payos: new PayOSGateway(),
            bank: new BankTransferGateway()
        };
    }

    selectGateway(type) {
        const gateway = this.gateways[type];
        if (!gateway) throw new Error(`Gateway ${type} not supported`);
        return gateway;
    }

    /**
     * Process a payment request
     * @param {string} gatewayType - 'vnpay', 'momo', 'bank'
     * @param {object} orderData - { amount, description, orderId }
     */
    async processPayment(gatewayType, orderData) {
        if (!orderData.orderId) {
            orderData.orderId = `ORD-${Date.now()}`;
        }

        const gateway = this.selectGateway(gatewayType);

        try {
            const result = await gateway.createPaymentUrl({
                amount: orderData.amount,
                orderId: orderData.orderId,
                orderDescription: orderData.description || `Thanh toan don hang ${orderData.orderId}`,
                bankCode: orderData.bankCode // Optional
            });

            return {
                success: true,
                data: result,
                type: typeof result === 'string' ? 'redirect' : 'display'
            };
        } catch (error) {
            console.error('Payment processing error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Handle webhook/return URL callback
     */
    async handleCallback() {
        const params = new URLSearchParams(window.location.search);

        // Detect gateway based on params
        let gatewayType = null;
        if (params.has('vnp_TxnRef')) gatewayType = 'vnpay';
        else if (params.has('partnerCode') || params.has('resultCode')) gatewayType = 'momo';
        else if (params.has('code') && params.has('orderCode')) gatewayType = 'payos';

        if (!gatewayType) return null;

        const gateway = this.selectGateway(gatewayType);
        return await gateway.verifyCallback(params);
    }
}

// Export singleton
export const paymentManager = new PaymentManager();
export const gateways = {
    VNPayGateway,
    MoMoGateway,
    PayOSGateway,
    BankTransferGateway
};

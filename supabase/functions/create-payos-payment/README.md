# payOS Payment Integration

Edge Function để tích hợp payOS payment gateway vào hệ thống.

## Cấu hình Environment Variables

Bạn cần cấu hình các biến môi trường sau trong Supabase:

```bash
# payOS Credentials
PAYOS_CLIENT_ID=your_client_id_here
PAYOS_API_KEY=your_api_key_here
PAYOS_CHECKSUM_KEY=your_checksum_key_here

# URLs
PAYOS_RETURN_URL=https://your-domain.com/portal/payment-result.html
PAYOS_CANCEL_URL=https://your-domain.com/portal/payments.html
```

## Cách lấy Credentials

1. Đăng ký tài khoản tại https://payos.vn
2. Đăng nhập vào Dashboard
3. Vào **Cài đặt** → **API Key**
4. Copy các thông tin:
   - **Client ID**
   - **API Key**
   - **Checksum Key**

## Deployment

```bash
# Deploy Edge Function
supabase functions deploy create-payos-payment

# Set environment variables
supabase secrets set PAYOS_CLIENT_ID=your_client_id
supabase secrets set PAYOS_API_KEY=your_api_key
supabase secrets set PAYOS_CHECKSUM_KEY=your_checksum_key
supabase secrets set PAYOS_RETURN_URL=https://your-domain.com/portal/payment-result.html
supabase secrets set PAYOS_CANCEL_URL=https://your-domain.com/portal/payments.html
```

## API Usage

### Request

```json
POST https://your-project.supabase.co/functions/v1/create-payos-payment
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN

{
  "invoiceId": "INV-2026-001",
  "amount": 8500000,
  "orderInfo": "Thanh toan hoa don INV-2026-001",
  "clientId": "customer@example.com"
}
```

### Response (Success)

```json
{
  "success": true,
  "checkoutUrl": "https://pay.payos.vn/web/xxxxxx",
  "paymentUrl": "https://pay.payos.vn/web/xxxxxx",
  "transactionId": "123456789"
}
```

### Response (Error)

```json
{
  "success": false,
  "error": "Error message here"
}
```

## Webhook Configuration

Cấu hình webhook URL trong payOS Dashboard:

```
https://your-project.supabase.co/functions/v1/payment-webhook?gateway=payos
```

## Testing

### Test Mode
payOS có hỗ trợ sandbox mode. Để sử dụng:
1. Dùng test credentials từ payOS Dashboard
2. Test với số tiền nhỏ (< 50,000 VND)
3. Sử dụng test bank accounts được cung cấp bởi payOS

### Test Flow
1. Tạo invoice test
2. Chọn payOS làm phương thức thanh toán
3. Click "Thanh toán"
4. Scan QR code bằng app ngân hàng test
5. Verify webhook được gọi và invoice status được update

## Features

- ✅ QR Code payment (hỗ trợ tất cả ngân hàng Việt Nam)
- ✅ Tự động verify checksum
- ✅ Webhook IPN handler
- ✅ Auto update invoice status
- ✅ Transaction logging
- ✅ Error handling

## Security

- HMAC-SHA256 signature verification
- Secure environment variables
- HTTPS only
- CORS protection
- Input validation

## Support

Docs: https://payos.vn/docs/
Email: support@payos.vn

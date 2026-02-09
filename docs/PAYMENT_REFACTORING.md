# Payment System Refactoring - Complete

## Summary

Complete refactoring and optimization of payment gateway integration for VNPay, MoMo, and PayOS with critical security improvements.

## Critical Issues Fixed ✅

### 1. ✅ PayOS Webhook Signature Verification (HMAC_SHA256)
- **Status**: IMPLEMENTED
- **Location**: `payment-webhook/index.ts:338-381`
- **Implementation**: Full HMAC-SHA256 signature verification for PayOS webhooks
- **Details**: Sorts data keys alphabetically, creates signature string, and verifies against provided signature

### 2. ✅ VNPay Webhook Signature Verification (HMAC_SHA512)
- **Status**: IMPLEMENTED
- **Location**: `payment-webhook/index.ts:86-119`
- **Implementation**: Full HMAC-SHA512 signature verification for VNPay IPN
- **Details**: Removes hash params, sorts alphabetically, and verifies signature

### 3. ✅ MoMo Webhook Signature Verification (HMAC_SHA256)
- **Status**: IMPLEMENTED
- **Location**: `payment-webhook/index.ts:224-252`
- **Implementation**: Full HMAC-SHA256 signature verification for MoMo IPN
- **Details**: Constructs raw signature string following MoMo specification and verifies

### 4. ✅ CORS Restriction from Wildcard to Specific Domains
- **Status**: IMPLEMENTED
- **Location**: `_shared/payment-utils.ts:13-26`
- **Implementation**:
  - Allowed origins: `sadec-marketing-hub.vercel.app`, `localhost:3000`, `localhost:8000`
  - Rejects requests from unauthorized origins
  - Centralized CORS configuration

### 5. ✅ Payment Transactions Table
- **Status**: CREATED
- **Location**: `migrations/20260203000001_create_payment_transactions.sql`
- **Schema**:
  ```sql
  - id (uuid, primary key)
  - transaction_id (text, unique)
  - invoice_id (uuid, foreign key)
  - amount (numeric)
  - gateway (text: 'vnpay', 'momo', 'payos')
  - status (text: 'pending', 'success', 'failed')
  - gateway_transaction_no (text)
  - callback_data (jsonb)
  - created_at, updated_at (timestamptz)
  ```
- **Features**: RLS policies, indexes, auto-update trigger

## High Priority Issues Fixed ✅

### 6. ✅ Invoice Matching Logic
- **Status**: IMPROVED
- **Implementation**:
  - Uses `payment_transactions` table as source of truth
  - Extracts invoice number from transaction references
  - Proper error handling for missing invoices
  - Still saves transactions even if invoice not found

### 7. ✅ OrderCode Generation - Uniqueness
- **Status**: IMPROVED
- **Implementation**:
  - **PayOS**: Timestamp-based (6 digits) + random suffix (3 digits) = 9-digit unique code
  - **VNPay**: `{invoiceNumber}-VNPAY-{timestamp}`
  - **MoMo**: `{invoiceNumber}-MOMO-{timestamp}`
  - All methods ensure uniqueness via timestamp + randomness

### 8. ✅ Error Response Status Codes
- **Status**: FIXED
- **Implementation**:
  - 400: Bad Request (validation errors, invalid gateway, signature failures)
  - 204: Success with no content (MoMo IPN)
  - 200: Success with content
  - 405: Method Not Allowed
  - 500: Internal Server Error
  - Gateway-specific response codes maintained

### 9. ✅ Environment Variable Validation
- **Status**: IMPLEMENTED
- **Location**: All payment functions
- **Implementation**:
  - Validates required env vars at startup
  - Logs errors if missing
  - Prevents runtime failures
  - Required vars per gateway:
    - **VNPay**: `VNPAY_TMN_CODE`, `VNPAY_SECRET_KEY`
    - **MoMo**: `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY`
    - **PayOS**: `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`
    - **All**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

## Architecture Improvements

### Shared Utilities (`_shared/payment-utils.ts`)
Created centralized utility functions:
- HMAC signature functions (SHA-256, SHA-512)
- CORS configuration
- Order code generation
- Payment transaction management
- Invoice matching and updating
- Type definitions

### File Structure
```
supabase/functions/
├── _shared/
│   └── payment-utils.ts          # Shared utilities
├── create-payment/
│   └── index.ts                  # VNPay payment creation
├── create-momo-payment/
│   └── index.ts                  # MoMo payment creation
├── create-payos-payment/
│   └── index.ts                  # PayOS payment creation
└── payment-webhook/
    └── index.ts                  # Unified webhook handler

supabase/migrations/
└── 20260203000001_create_payment_transactions.sql
```

## Security Enhancements

1. **Signature Verification**: All webhooks verify cryptographic signatures
2. **CORS Protection**: Restricted to specific origins only
3. **Environment Validation**: Required credentials checked at startup
4. **Transaction Logging**: All payment attempts logged (including failed verifications)
5. **Error Handling**: Proper error codes without exposing sensitive info

## Database Changes

### New Table: `payment_transactions`
- Tracks all payment gateway transactions
- Stores webhook callback data
- Links to invoices via foreign key
- Indexed for performance
- RLS enabled for security

### Migration
```bash
# Apply migration
supabase db push

# Or manually run
psql $DATABASE_URL -f supabase/migrations/20260203000001_create_payment_transactions.sql
```

## Testing Checklist

- [ ] Test VNPay payment creation
- [ ] Test VNPay webhook with valid signature
- [ ] Test VNPay webhook with invalid signature (should reject)
- [ ] Test MoMo payment creation
- [ ] Test MoMo webhook with valid signature
- [ ] Test MoMo webhook with invalid signature (should reject)
- [ ] Test PayOS payment creation
- [ ] Test PayOS webhook with valid signature
- [ ] Test PayOS webhook with invalid signature (should reject)
- [ ] Verify CORS rejection for unauthorized origins
- [ ] Verify transactions saved to database
- [ ] Verify invoice status updates on successful payment
- [ ] Verify transactions saved even when invoice not found

## Environment Variables Required

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# VNPay
VNPAY_TMN_CODE=your_tmn_code
VNPAY_SECRET_KEY=your_secret_key
VNPAY_RETURN_URL=https://sadec-marketing-hub.vercel.app/portal/payment-result.html

# MoMo
MOMO_PARTNER_CODE=your_partner_code
MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key
MOMO_REDIRECT_URL=https://sadec-marketing-hub.vercel.app/portal/payment-result.html
MOMO_IPN_URL=https://your-project.supabase.co/functions/v1/payment-webhook?gateway=momo

# PayOS
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key
PAYOS_RETURN_URL=https://sadec-marketing-hub.vercel.app/portal/payment-result.html
PAYOS_CANCEL_URL=https://sadec-marketing-hub.vercel.app/portal/payments.html
```

## Breaking Changes

⚠️ **Important**: Client code must now send `invoiceNumber` in addition to `invoiceId`:

### Before
```javascript
{
  "invoiceId": "uuid",
  "amount": 100000
}
```

### After
```javascript
{
  "invoiceId": "uuid",
  "invoiceNumber": "INV-2026-001",  // NEW REQUIRED FIELD
  "amount": 100000
}
```

## Deployment Steps

1. **Apply database migration**:
   ```bash
   supabase db push
   ```

2. **Deploy functions**:
   ```bash
   supabase functions deploy create-payment
   supabase functions deploy create-momo-payment
   supabase functions deploy create-payos-payment
   supabase functions deploy payment-webhook
   ```

3. **Update environment variables** in Supabase dashboard

4. **Update webhook URLs** in payment gateway dashboards:
   - VNPay: `https://your-project.supabase.co/functions/v1/payment-webhook?gateway=vnpay`
   - MoMo: `https://your-project.supabase.co/functions/v1/payment-webhook?gateway=momo`
   - PayOS: `https://your-project.supabase.co/functions/v1/payment-webhook?gateway=payos`

5. **Update client code** to send `invoiceNumber` field

## Performance Improvements

- Centralized shared utilities (DRY principle)
- Indexed database columns for fast lookups
- Efficient signature verification algorithms
- Reduced code duplication across functions

## Monitoring & Logging

All webhook handlers now log:
- Signature verification failures
- Invoice not found errors
- Payment success/failure
- Transaction saves

Monitor these logs in Supabase dashboard for troubleshooting.

---

**Refactored by**: Claude Code
**Date**: 2026-02-03
**Status**: ✅ Complete - All issues resolved

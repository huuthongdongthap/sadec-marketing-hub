
-- ============================================================================
-- SUPABASE SCHEMA - PAYMENT TRANSACTIONS
-- Tracks all payment attempts (VNPay, MoMo, Bank)
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    amount DECIMAL(12, 0) NOT NULL,
    gateway TEXT NOT NULL, -- 'vnpay', 'momo', 'bank'
    status TEXT DEFAULT 'pending', -- 'pending', 'success', 'failed', 'cancelled'

    -- Gateway specific details
    transaction_id TEXT, -- Transaction ID from Gateway (e.g. vnp_TxnRef)
    gateway_transaction_no TEXT, -- Gateway's internal transaction ID (e.g. vnp_TransactionNo)
    callback_data JSONB, -- Store full webhook payload for audit

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_invoice ON payment_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_txn_id ON payment_transactions(transaction_id);

-- RLS Policies
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Clients can see their own transactions (via invoice -> client_id)
CREATE POLICY "Clients read own transactions" ON payment_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = payment_transactions.invoice_id
            AND invoices.client_id = auth.uid()
        )
    );

-- Admins can view/manage all
CREATE POLICY "Admins manage all transactions" ON payment_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('super_admin', 'manager')
        )
    );

-- Trigger to update updated_at
CREATE TRIGGER payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

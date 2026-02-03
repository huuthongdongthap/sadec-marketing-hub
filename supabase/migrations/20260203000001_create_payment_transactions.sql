-- Create payment_transactions table for tracking all payment gateway transactions
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Transaction identification
    transaction_id text NOT NULL UNIQUE,
    invoice_id uuid REFERENCES public.invoices(id),

    -- Payment details
    amount numeric NOT NULL,
    gateway text NOT NULL, -- 'vnpay', 'momo', 'payos'
    status text NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed'

    -- Gateway-specific transaction reference
    gateway_transaction_no text,

    -- Callback data from payment gateway (stored as JSONB)
    callback_data jsonb DEFAULT '{}'::jsonb,

    -- Timestamps
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view payment transactions" ON public.payment_transactions
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow service role full access (for webhook handlers)
CREATE POLICY "Service role full access on payment_transactions" ON public.payment_transactions
    FOR ALL
    USING (auth.role() = 'service_role');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON public.payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_invoice_id ON public.payment_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway ON public.payment_transactions(gateway);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway_transaction_no ON public.payment_transactions(gateway_transaction_no);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON public.payment_transactions(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON public.payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_transactions_updated_at();

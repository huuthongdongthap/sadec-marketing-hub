-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id text NOT NULL UNIQUE,
    invoice_id uuid REFERENCES public.invoices(id),
    amount numeric NOT NULL,
    status text DEFAULT 'pending',
    payment_method text,
    bank_code text,
    bank_transaction_no text,
    order_info text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    completed_at timestamptz,
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own transactions" ON public.transactions
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow service role full access
CREATE POLICY "Service role full access" ON public.transactions
    FOR ALL
    USING (auth.role() = 'service_role');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_id ON public.transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_invoice_id ON public.transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

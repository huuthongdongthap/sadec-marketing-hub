import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, validateEnvVars } from '../_shared/payment-utils.ts';

function generateTempPassword(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';

    // Guarantee at least 2 uppercase, 4 lowercase, 2 digits
    const chars = [
        uppercase[Math.floor(Math.random() * uppercase.length)],
        uppercase[Math.floor(Math.random() * uppercase.length)],
        lowercase[Math.floor(Math.random() * lowercase.length)],
        lowercase[Math.floor(Math.random() * lowercase.length)],
        lowercase[Math.floor(Math.random() * lowercase.length)],
        lowercase[Math.floor(Math.random() * lowercase.length)],
        digits[Math.floor(Math.random() * digits.length)],
        digits[Math.floor(Math.random() * digits.length)],
    ];

    // Shuffle array
    for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join('');
}

serve(async (req: Request) => {
    const origin = req.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
        validateEnvVars(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        const supabase = createClient(supabaseUrl, serviceRoleKey);

        const { orderCode, packageName, amount, buyerEmail, buyerPhone } = await req.json();

        // Validate required field
        if (!buyerEmail) {
            return new Response(
                JSON.stringify({ success: false, error: 'buyerEmail is required' }),
                { status: 400, headers: corsHeaders }
            );
        }

        // Verify payment exists and is successful
        const { data: txn, error: txnError } = await supabase
            .from('payment_transactions')
            .select('*')
            .eq('transaction_id', String(orderCode))
            .eq('status', 'success')
            .single();

        if (txnError || !txn) {
            return new Response(
                JSON.stringify({ success: false, error: 'Payment not found or not successful' }),
                { status: 404, headers: corsHeaders }
            );
        }

        // Check if user already exists
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(
            (u: { email: string }) => u.email?.toLowerCase() === buyerEmail.toLowerCase()
        );

        if (existingUser) {
            return new Response(
                JSON.stringify({
                    success: true,
                    email: buyerEmail,
                    message: 'Account already exists, please login',
                }),
                { status: 200, headers: corsHeaders }
            );
        }

        // Create new user account
        const tempPassword = generateTempPassword();

        const { data: user, error: createError } = await supabase.auth.admin.createUser({
            email: buyerEmail,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
                role: 'client',
                package: packageName,
                phone: buyerPhone,
            },
        });

        if (createError || !user?.user) {
            console.error('Error creating user:', createError);
            return new Response(
                JSON.stringify({ success: false, error: 'Failed to create user account' }),
                { status: 500, headers: corsHeaders }
            );
        }

        // Insert into clients table
        const { error: clientError } = await supabase.from('clients').insert({
            user_id: user.user.id,
            email: buyerEmail,
            phone: buyerPhone,
            company_name: '',
            subscription_plan: packageName,
            subscription_start: new Date().toISOString(),
            status: 'active',
        });

        if (clientError) {
            console.error('Error inserting client:', clientError);
            return new Response(
                JSON.stringify({ success: false, error: 'Failed to create client record' }),
                { status: 500, headers: corsHeaders }
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                email: buyerEmail,
                tempPassword,
                portalUrl: '/portal/dashboard.html',
            }),
            { status: 200, headers: corsHeaders }
        );

    } catch (err) {
        console.error('Unexpected error:', err);
        return new Response(
            JSON.stringify({ success: false, error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

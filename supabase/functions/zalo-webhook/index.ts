// Supabase Edge Function: Zalo Webhook
// Handles Incoming Zalo OA Events (Mock Mode)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const MOCK_OA_SECRET = 'mock_secret_key_123';

serve(async (req: Request) => {
    // 1. Verify Request Signature (Mock)
    const signature = req.headers.get('X-Zalo-Signature');
    // In real prod, we would calculate HMAC-SHA256 here.
    // For mock mode, we just log it.
    console.log('Received Zalo Webhook Signature:', signature);

    try {
        const body = await req.json();
        console.log('Zalo Event:', JSON.stringify(body, null, 2));

        // Initialize Supabase Client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { event_name, sender, recipient, message, timestamp } = body;

        // 2. Handle 'user_send_text' event
        if (event_name === 'user_send_text') {
            const zaloUserId = sender.id;
            const oaId = recipient.id;
            const text = message.text;
            const msgId = message.msg_id;

            // Find or Create Zalo User
            // Assuming tenant_id is known or we have a mapping.
            // For this mock, we'll fetch the first tenant.
            const { data: tenants } = await supabase.from('tenants').select('id').limit(1);
            const tenantId = tenants?.[0]?.id;

            if (tenantId) {
                // Upsert User
                let { data: user } = await supabase
                    .from('zalo_users')
                    .select('id')
                    .eq('zalo_user_id', zaloUserId)
                    .eq('tenant_id', tenantId)
                    .single();

                if (!user) {
                     const { data: newUser } = await supabase
                        .from('zalo_users')
                        .insert({
                            tenant_id: tenantId,
                            zalo_user_id: zaloUserId,
                            display_name: `Zalo User ${zaloUserId.substring(0, 4)}`, // Placeholder
                            avatar: ''
                        })
                        .select()
                        .single();
                     user = newUser;
                }

                // Insert Message
                if (user) {
                    await supabase.from('zalo_messages').insert({
                        tenant_id: tenantId,
                        oa_id: oaId,
                        user_id: user.id,
                        zalo_msg_id: msgId,
                        content: text,
                        event_name: event_name,
                        direction: 'inbound',
                        timestamp: timestamp,
                        status: 'received'
                    });
                }
            }
        }

        return new Response(JSON.stringify({ message: 'Success' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('Error processing Zalo webhook:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});

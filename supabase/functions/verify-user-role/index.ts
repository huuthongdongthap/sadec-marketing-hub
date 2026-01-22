
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Get the Authorization header (Bearer token)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    // 2. Initialize Supabase Client with the Auth header
    // The client will automatically use the token for RLS and Auth checks
    const supabaseClient = createClient(
      // Use environment variables injected by Supabase
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // 3. Get User from the token
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Invalid token or user not found')
    }

    // 4. Get Role (Source of Truth: user_metadata or app_metadata)
    // Preference: app_metadata.role (set by admin/triggers) > user_metadata.role > 'guest'
    const role = user.app_metadata?.role || user.user_metadata?.role || 'guest';

    // 5. (Optional) Cross-check with database profiles if needed for stricter security
    // const { data: profile } = await supabaseClient.from('user_profiles').select('role').eq('id', user.id).single();
    // const verifiedRole = profile?.role || role;

    return new Response(
      JSON.stringify({
        user_id: user.id,
        role: role,
        email: user.email,
        verified: true,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message, verified: false }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      },
    )
  }
})

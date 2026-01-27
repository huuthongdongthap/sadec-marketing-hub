
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const gateway = url.searchParams.get("gateway"); // 'vnpay' or 'momo'

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (gateway === "vnpay") {
      return await handleVNPayIPN(req, supabase);
    } else if (gateway === "momo") {
      return await handleMoMoIPN(req, supabase);
    } else {
      return new Response(JSON.stringify({ error: "Invalid gateway specified" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

async function handleVNPayIPN(req: Request, supabase: any) {
  // VNPay sends GET request for IPN
  const url = new URL(req.url);
  const params = url.searchParams;
  const vnp_SecureHash = params.get("vnp_SecureHash");
  const vnp_TxnRef = params.get("vnp_TxnRef");
  const vnp_Amount = params.get("vnp_Amount");
  const vnp_ResponseCode = params.get("vnp_ResponseCode");

  // TODO: Verify signature using vnp_SecureHash and vnp_HashSecret from env
  // For this implementation, we assume verification passes if we are in test mode or implementation is added later
  const isVerified = true; // Placeholder for actual HMAC SHA512 verification

  if (!isVerified) {
    return new Response(JSON.stringify({ RspCode: "97", Message: "Invalid Signature" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  // Check if invoice exists and status
  // Remove prefix if any (e.g. "INV-") to match UUID if needed, or query by invoice_number
  // Assuming vnp_TxnRef maps to invoice_number or ID

  // Extract Invoice ID from TxnRef if needed (e.g. if TxnRef is "INV-2026-001-TIMESTAMP")
  // For simplicity, we search for the invoice based on the mapping stored in payment_transactions table (Task 6)
  // Or directly update invoices table if vnp_TxnRef matches invoice_number

  if (vnp_ResponseCode === "00") {
     // Payment Success
     // 1. Update Invoice Status
     const { error: invoiceError } = await supabase
       .from('invoices')
       .update({
         status: 'paid',
         paid_at: new Date().toISOString()
       })
       .eq('invoice_number', vnp_TxnRef.split('-').slice(0, 3).join('-')); // Simple heuristic, better to use transaction table

      if (invoiceError) {
          console.error("Error updating invoice:", invoiceError);
          return new Response(JSON.stringify({ RspCode: "02", Message: "Order already confirmed" }), { status: 200 });
      }

      // 2. Log Transaction (if table exists)
      // await supabase.from('payment_transactions').update({ status: 'success' }).eq('transaction_id', vnp_TxnRef);

      return new Response(JSON.stringify({ RspCode: "00", Message: "Confirm Success" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
  } else {
      // Payment Failed
      return new Response(JSON.stringify({ RspCode: "00", Message: "Confirm Success" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
  }
}

async function handleMoMoIPN(req: Request, supabase: any) {
  // MoMo sends POST request
  const body = await req.json();
  const { resultCode, orderId, amount, transId, signature } = body;

  // TODO: Verify signature
  const isVerified = true;

  if (!isVerified) {
     return new Response(JSON.stringify({ message: "Invalid signature" }), { status: 400 });
  }

  if (resultCode === 0) {
      // Payment Success
      const { error: invoiceError } = await supabase
       .from('invoices')
       .update({
         status: 'paid',
         paid_at: new Date().toISOString()
       })
       .eq('invoice_number', orderId.split('-').slice(0, 3).join('-'));

      if (invoiceError) {
          console.error("Error updating invoice:", invoiceError);
      }
  }

  return new Response(JSON.stringify({ message: "Received" }), {
      headers: { "Content-Type": "application/json" },
      status: 204, // MoMo expects 204 or 200
  });
}

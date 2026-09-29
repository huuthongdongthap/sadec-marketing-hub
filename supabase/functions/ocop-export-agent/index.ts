// Follow this code with `bunx --bun deno serve`
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an OCOP export specialist for Vietnam Mekong Delta products. 
You help Vietnamese producers create professional export listings, B2B emails, and compliance checklists.
Always respond in valid JSON format with these keys: alibaba_listing, b2b_email, compliance.
Be specific about HS codes, certifications, and export requirements.
Use professional English for listings and emails.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user from JWT
    const authHeader = req.headers.get("Authorization")?.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { product_name, category, description, origin, price_vnd, target_market } = body;

    if (!product_name || !category || !description) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check credits (need 3)
    const { data: credits } = await supabase
      .from("raas_credits")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (!credits || credits.balance < 3) {
      return new Response(JSON.stringify({ error: "Insufficient credits", balance: credits?.balance || 0 }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call LLM
    const llmUrl = Deno.env.get("LLM_BASE_URL") || "https://api.openai.com/v1";
    const llmKey = Deno.env.get("LLM_API_KEY") || "";

    const prompt = `Generate an export package for this Vietnamese OCOP product:
Name: ${product_name}
Category: ${category}
Description: ${description}
Origin: ${origin || "Mekong Delta, Vietnam"}
Price: ${price_vnd} VND
Target Market: ${target_market || "International"}

Return JSON with:
1. alibaba_listing: { title, description, specs }
2. b2b_email: { subject, body }  
3. compliance: { hs_code, certifications: [], export_docs: [], notes }`;

    let aiResult;
    try {
      const llmRes = await fetch(`${llmUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${llmKey}` },
        body: JSON.stringify({
          model: Deno.env.get("LLM_MODEL") || "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
      });
      const llmData = await llmRes.json();
      aiResult = JSON.parse(llmData.choices[0].message.content);
    } catch {
      // Fallback to template-based generation
      const priceUSD = price_vnd ? (price_vnd / 25000).toFixed(2) : "5.99";
      aiResult = {
        alibaba_listing: {
          title: `Premium ${product_name} - OCOP Certified from ${origin}`,
          description: `${description}\n\nOCOP Certified, FOB $${priceUSD}/kg, MOQ 500kg`,
          specs: `Product: ${product_name}\nOrigin: ${origin}\nPrice: $${priceUSD}/kg`,
        },
        b2b_email: {
          subject: `Partnership: Premium ${product_name} from Vietnam`,
          body: `Dear Sir/Madam,\n\nWe offer ${product_name} from ${origin}.\n${description}\n\nFOB: $${priceUSD}/kg | MOQ: 500kg\n\nBest regards,\nMekong Export Team`,
        },
        compliance: {
          hs_code: "2106.90",
          certifications: ["OCOP", "HACCP", "ISO 22000"],
          export_docs: ["Invoice", "Packing List", "C/O", "Health Certificate"],
          notes: "Check import regulations for target market",
        },
      };
    }

    // Deduct 3 credits atomically
    await supabase.rpc("deduct_credits", { p_user_id: user.id, p_amount: 3 });

    // Log transaction
    await supabase.from("raas_transactions").insert({
      user_id: user.id, amount: -3, type: "debit", reason: `OCOP Export: ${product_name}`,
    });

    // Save product + export
    const { data: product } = await supabase.from("ocop_products").insert({
      user_id: user.id, name: product_name, category, description, origin, price_vnd,
    }).select().single();

    if (product) {
      await supabase.from("ocop_exports").insert({
        product_id: product.id, alibaba_listing: aiResult.alibaba_listing,
        b2b_email: aiResult.b2b_email, compliance: aiResult.compliance,
      });
    }

    // Insert as raas_mission
    await supabase.from("raas_missions").insert({
      user_id: user.id, goal: `OCOP Export: ${product_name}`,
      complexity: "standard", status: "done", credits_cost: 3,
      result: aiResult,
    });

    return new Response(JSON.stringify(aiResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

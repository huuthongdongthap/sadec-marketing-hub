// ROIaaS Analytics Engine — Edge Function cho tính ROI, phase detection, auto-report
// Deno runtime — Turbo-all
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Bạn là chuyên gia phân tích ROI cho chiến dịch marketing.
Bạn tính toán ROI, phát hiện phase (R1-R4), và tạo báo cáo tự động.
Luôn trả về JSON hợp lệ với các keys: roi_analysis, phase_detection, recommendations.
Sử dụng tiếng Việt chuyên nghiệp.`;

// ROI Phase thresholds
const PHASE_THRESHOLDS = {
  R1: { min_roi: -1, max_roi: 0 },      // Lỗ
  R2: { min_roi: 0, max_roi: 0.5 },     // Hòa vốn → Bắt đầu lãi
  R3: { min_roi: 0.5, max_roi: 1.5 },   // Tăng trưởng
  R4: { min_roi: 1.5, max_roi: Infinity }, // Bùng nổ
};

interface ROIInput {
  campaign_id?: string;
  revenue: number;
  cost: number;
  start_date?: string;
  end_date?: string;
  channel?: string;
  metrics?: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    cac?: number;
    ltv?: number;
  };
}

interface ROIResult {
  roi: number;
  roas: number;
  profit: number;
  margin: number;
  phase: "R1" | "R2" | "R3" | "R4";
  phase_name: string;
  metrics: {
    cac?: number;
    ltv?: number;
    ltv_cac_ratio?: number;
    payback_months?: number;
  };
}

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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      campaign_id,
      revenue,
      cost,
      start_date,
      end_date,
      channel,
      metrics,
      auto_generate = false,
    } = body as ROIInput & { auto_generate?: boolean };

    // Validate required fields
    if (revenue === undefined || cost === undefined) {
      return new Response(JSON.stringify({ error: "Missing required fields: revenue, cost" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check credits (need 2 for ROI analysis)
    const { data: credits } = await supabase
      .from("raas_credits")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (!credits || credits.balance < 2) {
      return new Response(JSON.stringify({
        error: "Insufficient credits",
        balance: credits?.balance || 0,
      }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate ROI
    const profit = revenue - cost;
    const roi = cost > 0 ? (profit / cost) : 0;
    const roas = cost > 0 ? (revenue / cost) : 0;
    const margin = revenue > 0 ? (profit / revenue) : 0;

    // Phase detection
    let phase: "R1" | "R2" | "R3" | "R4" = "R1";
    let phase_name = "Lỗ";

    if (roi >= PHASE_THRESHOLDS.R4.min_roi) {
      phase = "R4";
      phase_name = "Bùng nổ";
    } else if (roi >= PHASE_THRESHOLDS.R3.min_roi) {
      phase = "R3";
      phase_name = "Tăng trưởng";
    } else if (roi >= PHASE_THRESHOLDS.R2.min_roi) {
      phase = "R2";
      phase_name = "Hòa vốn";
    } else {
      phase = "R1";
      phase_name = "Lỗ";
    }

    // Advanced metrics
    const cac = metrics?.cac || (cost / (metrics?.conversions || 1));
    const ltv = metrics?.ltv || 0;
    const ltv_cac_ratio = cac > 0 ? (ltv / cac) : 0;
    const payback_months = ltv > 0 && cac > 0 ? Math.ceil(cac / (ltv / 12)) : 0;

    const roi_result: ROIResult = {
      roi,
      roas,
      profit,
      margin,
      phase,
      phase_name,
      metrics: {
        cac,
        ltv,
        ltv_cac_ratio: Number(ltv_cac_ratio.toFixed(2)),
        payback_months: ltv_cac_ratio >= 3 ? 0 : payback_months,
      },
    };

    // Generate recommendations based on phase
    const recommendations: string[] = [];

    switch (phase) {
      case "R1":
        recommendations.push(
          "⚠️ Chiến dịch đang lỗ — Xem xét dừng hoặc tối ưu gấp",
          "Kiểm tra lại targeting và creative",
          "Giảm CPA bằng cách优化 CTR và CVR",
          "Đánh giá lại unit economics (CAC vs LTV)",
        );
        break;
      case "R2":
        recommendations.push(
          "⚖️ Chiến dịch hòa vốn — Tối ưu để đạt R3",
          "Tăng ngân sách cho ads có ROAS > 1.5",
          "A/B testing landing page để tăng CVR",
          "Retargeting warm audience",
        );
        break;
      case "R3":
        recommendations.push(
          "📈 Chiến dịch tăng trưởng tốt — Scale có kiểm soát",
          "Tăng ngân sách 20-30% mỗi tuần",
          "Mở rộng audience tương tự",
          "Đa dạng hóa kênh (TikTok, Google, Meta)",
        );
        break;
      case "R4":
        recommendations.push(
          "🚀 Chiến dịch bùng nổ — Scale mạnh",
          "Tối đa hóa ngân sách có thể",
          "Chuẩn bị hạ tầng cho volume lớn",
          "Build moat: brand, loyalty, data",
        );
        break;
    }

    // LLM enhancement for report (optional)
    let ai_report = null;
    if (auto_generate) {
      const llmUrl = Deno.env.get("LLM_BASE_URL") || "https://api.openai.com/v1";
      const llmKey = Deno.env.get("LLM_API_KEY") || "";

      const prompt = `Phân tích chiến dịch marketing và tạo báo cáo ROI chuyên nghiệp:

ROI: ${(roi * 100).toFixed(2)}%
ROAS: ${roas.toFixed(2)}x
Lợi nhuận: ${profit.toLocaleString("vi-VN")} VND
Phase: ${phase} - ${phase_name}
CAC: ${cac.toLocaleString("vi-VN")} VND
LTV/CAC Ratio: ${ltv_cac_ratio.toFixed(2)}

Tạo báo cáo ngắn gọn với:
1. Executive summary (2-3 câu)
2. Key insights (3 điểm chính)
3. Action items (3-4 việc cần làm)`;

      try {
        const llmRes = await fetch(`${llmUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${llmKey}`,
          },
          body: JSON.stringify({
            model: Deno.env.get("LLM_MODEL") || "gpt-4o-mini",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: prompt },
            ],
            temperature: 0.7,
          }),
        });
        const llmData = await llmRes.json();
        ai_report = llmData.choices[0].message.content;
      } catch {
        ai_report = `Báo cáo ROI — Phase ${phase} (${phase_name}):
- ROI: ${(roi * 100).toFixed(2)}%, ROAS: ${roas.toFixed(2)}x
- Lợi nhuận: ${profit.toLocaleString("vi-VN")} VND
- Khuyến nghị: ${recommendations[0]}`;
      }
    }

    // Deduct 2 credits atomically
    await supabase.rpc("deduct_credits", { p_user_id: user.id, p_amount: 2 });

    // Log transaction
    await supabase.from("raas_transactions").insert({
      user_id: user.id,
      amount: -2,
      type: "debit",
      reason: `ROI Analysis: ${campaign_id || "Manual"}`,
    });

    // Save to raas_missions
    const result = {
      roi_analysis: roi_result,
      recommendations,
      ai_report,
      timestamp: new Date().toISOString(),
    };

    await supabase.from("raas_missions").insert({
      user_id: user.id,
      goal: `ROI Analysis: ${campaign_id || channel || "Manual"}`,
      complexity: "standard",
      status: "done",
      credits_cost: 2,
      result,
    });

    // Save to roiaas_reports if table exists
    try {
      await supabase.from("roiaas_reports").insert({
        user_id: user.id,
        campaign_id,
        channel,
        revenue,
        cost,
        profit,
        roi,
        roas,
        phase,
        phase_name,
        metrics: roi_result.metrics,
        recommendations,
        ai_report,
      });
    } catch {
      // Table may not exist yet — ignore
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

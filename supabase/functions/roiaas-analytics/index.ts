// ROIaaS Analytics Engine — Edge Function cho analytics tổng hợp
// Deno runtime — Turbo-all
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Bạn là chuyên gia phân tích ROI cho chiến dịch marketing.
Bạn tạo báo cáo phân tích chuyên sâu dựa trên dữ liệu ROI và phase progression.
Luôn trả về markdown hoặc JSON hợp lệ theo yêu cầu.
Sử dụng tiếng Việt chuyên nghiệp.`;

// ROI Phase thresholds (reuse từ roiaas-engine)
const PHASE_THRESHOLDS = {
  R1: { min_roi: -1, max_roi: 0 },      // Lỗ
  R2: { min_roi: 0, max_roi: 0.5 },     // Hòa vốn → Bắt đầu lãi
  R3: { min_roi: 0.5, max_roi: 1.5 },   // Tăng trưởng
  R4: { min_roi: 1.5, max_roi: Infinity }, // Bùng nổ
};

interface ROIStats {
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  avg_roi: number;
  avg_roas: number;
  campaign_count: number;
}

interface ChannelStats {
  channel: string;
  revenue: number;
  cost: number;
  profit: number;
  roi: number;
  roas: number;
  campaign_count: number;
}

interface PhaseProgressEntry {
  date: string;
  phase: "R1" | "R2" | "R3" | "R4";
  phase_name: string;
  roi: number;
  revenue: number;
  cost: number;
}

interface PhaseChange {
  from: "R1" | "R2" | "R3" | "R4";
  to: "R1" | "R2" | "R3" | "R4";
  date: string;
}

interface GenerateReportRequest {
  campaign_id?: string;
  include_ai_analysis?: boolean;
  format?: "markdown" | "json";
  start_date?: string;
  end_date?: string;
}

interface GenerateReportResponse {
  campaign_id?: string;
  summary: ROIStats;
  phase_analysis: {
    progress: PhaseProgressEntry[];
    phase_changes: PhaseChange[];
    trend: "improving" | "stable" | "declining";
  };
  recommendations: string[];
  ai_analysis?: string;
}

// Helper: Detect phase từ ROI
function detectPhase(roi: number): { phase: "R1" | "R2" | "R3" | "R4"; phase_name: string } {
  if (roi >= PHASE_THRESHOLDS.R4.min_roi) {
    return { phase: "R4", phase_name: "Bùng nổ" };
  } else if (roi >= PHASE_THRESHOLDS.R3.min_roi) {
    return { phase: "R3", phase_name: "Tăng trưởng" };
  } else if (roi >= PHASE_THRESHOLDS.R2.min_roi) {
    return { phase: "R2", phase_name: "Hòa vốn" };
  } else {
    return { phase: "R1", phase_name: "Lỗ" };
  }
}

// Helper: Detect trend từ ROI progression
function detectTrend(progress: PhaseProgressEntry[]): "improving" | "stable" | "declining" {
  if (progress.length < 2) return "stable";

  const recent = progress.slice(-3);
  const first = recent[0];
  const last = recent[recent.length - 1];

  if (!first || !last) return "stable";

  const roiDiff = last.roi - first.roi;
  if (roiDiff > 0.2) return "improving";
  if (roiDiff < -0.2) return "declining";
  return "stable";
}

// Helper: Detect phase changes
function detectPhaseChanges(progress: PhaseProgressEntry[]): PhaseChange[] {
  const changes: PhaseChange[] = [];
  for (let i = 1; i < progress.length; i++) {
    const prev = progress[i - 1];
    const curr = progress[i];
    if (prev && curr && prev.phase !== curr.phase) {
      changes.push({
        from: prev.phase,
        to: curr.phase,
        date: curr.date,
      });
    }
  }
  return changes;
}

// Helper: Generate recommendations từ phase distribution
function generateRecommendations(phaseDistribution: Record<string, number>, trend: string): string[] {
  const recommendations: string[] = [];

  // Dựa vào phase chiếm đa số
  const maxPhase = Object.entries(phaseDistribution)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  switch (maxPhase) {
    case "R1":
      recommendations.push(
        "⚠️ Phần lớn chiến dịch đang ở phase lỗ — Cần xem xét lại chiến lược",
        "Audit toàn bộ campaigns để tìm nguyên nhân (targeting, creative, landing page)",
        "Dừng các ads có CPA > LTV/3",
        "Tập trung vào winning products/angles",
      );
      break;
    case "R2":
      recommendations.push(
        "⚖️ Đa số campaigns hòa vốn — Tối ưu để突破 sang R3",
        "Tăng ngân sách 10-15% cho ads có ROAS > 1.2",
        "A/B testing creative mới để tăng CTR",
        "Retargeting warm audience với offer đặc biệt",
      );
      break;
    case "R3":
      recommendations.push(
        "📈 Tăng trưởng tốt — Scale có kiểm soát",
        "Tăng ngân sách 20-30% mỗi tuần cho winning campaigns",
        "Mở rộng lookalike audiences 2-5%",
        "Test thêm kênh mới (TikTok, Google PMax)",
      );
      break;
    case "R4":
      recommendations.push(
        "🚀 Bùng nổ — Scale mạnh nhưng bền vững",
        "Tối đa hóa ngân sách có thể",
        "Chuẩn bị hạ tầng cho volume lớn",
        "Build moat: brand loyalty, customer data platform",
      );
      break;
  }

  // Thêm recommendation dựa trên trend
  if (trend === "declining") {
    recommendations.push(
      "⚠️ Trend đang giảm — Điều tra nguyên nhân ngay",
      "Kiểm tra frequency cap, ad fatigue",
      "Refresh creative hoặc pause ads cũ",
    );
  } else if (trend === "improving") {
    recommendations.push(
      "✅ Trend tích cực — Tiếp tục scale winning campaigns",
      "Document lại playbook để replicate success",
    );
  }

  return recommendations;
}

// Helper: Generate AI analysis
async function generateAIAnalysis(
  summary: ROIStats,
  phaseAnalysis: { progress: PhaseProgressEntry[]; phase_changes: PhaseChange[]; trend: string },
  recommendations: string[],
): Promise<string> {
  const llmUrl = Deno.env.get("LLM_BASE_URL") || "https://api.openai.com/v1";
  const llmKey = Deno.env.get("LLM_API_KEY") || "";

  const prompt = `Phân tích dữ liệu ROI và tạo báo cáo executive:

TỔNG QUAN:
- Tổng Revenue: ${summary.total_revenue.toLocaleString("vi-VN")} VND
- Tổng Cost: ${summary.total_cost.toLocaleString("vi-VN")} VND
- Lợi nhuận: ${summary.total_profit.toLocaleString("vi-VN")} VND
- ROI trung bình: ${(summary.avg_roi * 100).toFixed(2)}%
- ROAS trung bình: ${summary.avg_roas.toFixed(2)}x
- Số campaigns: ${summary.campaign_count}

PHASE PROGRESSION:
- Trend: ${phaseAnalysis.trend}
- Phase changes: ${phaseAnalysis.phase_changes.length} lần chuyển
- Phase distribution: ${JSON.stringify(
    phaseAnalysis.progress.reduce((acc, p) => {
      acc[p.phase] = (acc[p.phase] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  )}

Tạo báo cáo với:
1. Executive Summary (3-4 câu)
2. Key Insights (3 điểm chính)
3. Strategic Recommendations (4-5 action items)`;

  try {
    const llmRes = await fetch(`${llmUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${llmKey}`,
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

    if (!llmRes.ok) throw new Error(`LLM API error: ${llmRes.status}`);

    const llmData = await llmRes.json();
    return llmData.choices[0].message.content;
  } catch (err) {
    // Fallback template
    return `BÁO CÁO PHÂN TÍCH ROI

TỔNG QUAN
- Tổng Revenue: ${summary.total_revenue.toLocaleString("vi-VN")} VND
- Tổng Cost: ${summary.total_cost.toLocaleString("vi-VN")} VND
- Lợi nhuận: ${summary.total_profit.toLocaleString("vi-VN")} VND
- ROI trung bình: ${(summary.avg_roi * 100).toFixed(2)}%
- ROAS trung bình: ${summary.avg_roas.toFixed(2)}x

PHASE PROGRESSION: ${phaseAnalysis.trend.toUpperCase()}
- Số lần chuyển phase: ${phaseAnalysis.phase_changes.length}

KHUYẾN NGHỊ CHÍNH:
${recommendations.slice(0, 3).map(r => `- ${r}`).join("\n")}`;
  }
}

// Helper: Format markdown report
function formatMarkdownReport(report: GenerateReportResponse): string {
  return `# BÁO CÁO PHÂN TÍCH ROI

## TỔNG QUAN
| Metric | Giá trị |
|--------|---------|
| Tổng Revenue | ${report.summary.total_revenue.toLocaleString("vi-VN")} VND |
| Tổng Cost | ${report.summary.total_cost.toLocaleString("vi-VN")} VND |
| Lợi nhuận | ${report.summary.total_profit.toLocaleString("vi-VN")} VND |
| ROI trung bình | ${(report.summary.avg_roi * 100).toFixed(2)}% |
| ROAS trung bình | ${report.summary.avg_roas.toFixed(2)}x |
| Số campaigns | ${report.summary.campaign_count} |

## PHASE PROGRESSION
**Trend:** ${report.phase_analysis.trend.toUpperCase()}

### Phase Distribution
${Object.entries(report.phase_analysis.progress.reduce((acc, p) => {
    acc[p.phase] = (acc[p.phase] || 0) + 1;
    return acc;
  }, {} as Record<string, number>))
    .map(([phase, count]) => `- **${phase}**: ${count} campaigns`)
    .join("\n")}

### Phase Changes
${report.phase_analysis.phase_changes.length > 0
    ? report.phase_analysis.phase_changes
        .map(c => `- ${c.date}: ${c.from} → ${c.to}`)
        .join("\n")
    : "Không có chuyển phase nào trong kỳ"}

## KHUYẾN NGHỊ
${report.recommendations.map(r => `- ${r}`).join("\n")}

${report.ai_analysis ? `## AI ANALYSIS\n\n${report.ai_analysis}` : ""}

---
*Báo cáo tạo lúc ${new Date(report.summary.timestamp as unknown as number).toLocaleString("vi-VN")}*`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
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

    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint");

    // ROUTING
    switch (endpoint) {
      case "roi-summary":
        return await handleROISummary(req, supabase, user.id);
      case "phase-progress":
        return await handlePhaseProgress(req, supabase, user.id);
      case "generate-report":
        return await handleGenerateReport(req, supabase, user.id);
      default:
        return new Response(JSON.stringify({ error: "Invalid endpoint. Use: roi-summary, phase-progress, generate-report" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ENDPOINT: GET /roi-summary
async function handleROISummary(
  req: Request,
  supabase: ReturnType<typeof createClient>,
  userId: string,
) {
  const url = new URL(req.url);
  const startDate = url.searchParams.get("start_date") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const endDate = url.searchParams.get("end_date") || new Date().toISOString();
  const channel = url.searchParams.get("channel");
  const campaignId = url.searchParams.get("campaign_id");

  // Check credits (1 credit)
  const { data: credits } = await supabase
    .from("raas_credits")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (!credits || credits.balance < 1) {
    return new Response(JSON.stringify({
      error: "Insufficient credits",
      balance: credits?.balance || 0,
      required: 1,
    }), {
      status: 402,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Query roiaas_reports
  let query = supabase
    .from("roiaas_reports")
    .select("revenue, cost, profit, roi, roas, channel, phase")
    .eq("user_id", userId)
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (channel) query = query.eq("channel", channel);
  if (campaignId) query = query.eq("campaign_id", campaignId);

  const { data: reports, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Aggregate data
  const summary: ROIStats = {
    total_revenue: reports.reduce((sum, r) => sum + (r.revenue || 0), 0),
    total_cost: reports.reduce((sum, r) => sum + (r.cost || 0), 0),
    total_profit: reports.reduce((sum, r) => sum + (r.profit || 0), 0),
    avg_roi: reports.length > 0 ? reports.reduce((sum, r) => sum + (r.roi || 0), 0) / reports.length : 0,
    avg_roas: reports.length > 0 ? reports.reduce((sum, r) => sum + (r.roas || 0), 0) / reports.length : 0,
    campaign_count: reports.length,
  };

  // Group by channel
  const channelMap = new Map<string, ChannelStats>();
  for (const r of reports) {
    const ch = r.channel || "unknown";
    const existing = channelMap.get(ch) || { channel: ch, revenue: 0, cost: 0, profit: 0, roi: 0, roas: 0, campaign_count: 0 };
    existing.revenue += r.revenue || 0;
    existing.cost += r.cost || 0;
    existing.profit += r.profit || 0;
    existing.campaign_count += 1;
    channelMap.set(ch, existing);
  }

  const byChannel: ChannelStats[] = Array.from(channelMap.values()).map(c => ({
    ...c,
    roi: c.cost > 0 ? c.profit / c.cost : 0,
    roas: c.cost > 0 ? c.revenue / c.cost : 0,
  }));

  // Group by phase
  const byPhase: Record<string, number> = {};
  for (const r of reports) {
    const phase = r.phase || "R1";
    byPhase[phase] = (byPhase[phase] || 0) + 1;
  }

  // Deduct 1 credit atomically
  await supabase.rpc("deduct_credits", { p_user_id: userId, p_amount: 1 });

  // Log transaction
  await supabase.from("raas_transactions").insert({
    user_id: userId,
    amount: -1,
    reason: "ROI Summary Analytics",
  });

  return new Response(JSON.stringify({
    summary,
    by_channel: byChannel,
    by_phase: byPhase,
    timestamp: new Date().toISOString(),
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ENDPOINT: GET /phase-progress
async function handlePhaseProgress(
  req: Request,
  supabase: ReturnType<typeof createClient>,
  userId: string,
) {
  const url = new URL(req.url);
  const campaignId = url.searchParams.get("campaign_id");
  const days = parseInt(url.searchParams.get("days") || "30");
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // Check credits (1 credit)
  const { data: credits } = await supabase
    .from("raas_credits")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (!credits || credits.balance < 1) {
    return new Response(JSON.stringify({
      error: "Insufficient credits",
      balance: credits?.balance || 0,
      required: 1,
    }), {
      status: 402,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Query roiaas_reports
  let query = supabase
    .from("roiaas_reports")
    .select("created_at, phase, phase_name, roi, revenue, cost")
    .eq("user_id", userId)
    .gte("created_at", startDate)
    .order("created_at", { ascending: true });

  if (campaignId) query = query.eq("campaign_id", campaignId);

  const { data: reports, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Format progress
  const progress: PhaseProgressEntry[] = (reports || []).map(r => ({
    date: new Date(r.created_at).toISOString().split("T")[0],
    phase: r.phase as "R1" | "R2" | "R3" | "R4" || "R1",
    phase_name: r.phase_name || detectPhase(r.roi || 0).phase_name,
    roi: r.roi || 0,
    revenue: r.revenue || 0,
    cost: r.cost || 0,
  }));

  // Detect phase changes
  const phaseChanges = detectPhaseChanges(progress);

  // Detect trend
  const trend = detectTrend(progress);

  // Deduct 1 credit
  await supabase.rpc("deduct_credits", { p_user_id: userId, p_amount: 1 });

  // Log transaction
  await supabase.from("raas_transactions").insert({
    user_id: userId,
    amount: -1,
    reason: "Phase Progress Analytics",
  });

  return new Response(JSON.stringify({
    progress,
    phase_changes: phaseChanges,
    trend,
    timestamp: new Date().toISOString(),
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ENDPOINT: POST /generate-report
async function handleGenerateReport(
  req: Request,
  supabase: ReturnType<typeof createClient>,
  userId: string,
) {
  const body: GenerateReportRequest = await req.json();
  const {
    campaign_id,
    include_ai_analysis = false,
    format = "json",
    start_date,
    end_date,
  } = body;

  const creditsCost = include_ai_analysis ? 3 : 1;

  // Check credits
  const { data: credits } = await supabase
    .from("raas_credits")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (!credits || credits.balance < creditsCost) {
    return new Response(JSON.stringify({
      error: "Insufficient credits",
      balance: credits?.balance || 0,
      required: creditsCost,
    }), {
      status: 402,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get date range
  const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const endDate = end_date || new Date().toISOString();

  // Query roiaas_reports
  let query = supabase
    .from("roiaas_reports")
    .select("revenue, cost, profit, roi, roas, channel, phase, created_at")
    .eq("user_id", userId)
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (campaign_id) query = query.eq("campaign_id", campaign_id);

  const { data: reports, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Aggregate summary
  const summary: ROIStats & { timestamp?: string } = {
    total_revenue: reports.reduce((sum, r) => sum + (r.revenue || 0), 0),
    total_cost: reports.reduce((sum, r) => sum + (r.cost || 0), 0),
    total_profit: reports.reduce((sum, r) => sum + (r.profit || 0), 0),
    avg_roi: reports.length > 0 ? reports.reduce((sum, r) => sum + (r.roi || 0), 0) / reports.length : 0,
    avg_roas: reports.length > 0 ? reports.reduce((sum, r) => sum + (r.roas || 0), 0) / reports.length : 0,
    campaign_count: reports.length,
    timestamp: new Date().toISOString(),
  };

  // Phase analysis
  const progress: PhaseProgressEntry[] = (reports || []).map(r => ({
    date: new Date(r.created_at).toISOString().split("T")[0],
    phase: r.phase as "R1" | "R2" | "R3" | "R4" || "R1",
    phase_name: r.phase_name || detectPhase(r.roi || 0).phase_name,
    roi: r.roi || 0,
    revenue: r.revenue || 0,
    cost: r.cost || 0,
  }));

  const phaseChanges = detectPhaseChanges(progress);
  const trend = detectTrend(progress);

  // Generate recommendations
  const phaseDistribution = progress.reduce((acc, p) => {
    acc[p.phase] = (acc[p.phase] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recommendations = generateRecommendations(phaseDistribution, trend);

  // AI analysis (optional)
  let aiAnalysis: string | undefined;
  if (include_ai_analysis) {
    aiAnalysis = await generateAIAnalysis(summary, { progress, phase_changes: phaseChanges, trend }, recommendations);
  }

  const report: GenerateReportResponse = {
    campaign_id,
    summary,
    phase_analysis: {
      progress,
      phase_changes: phaseChanges,
      trend,
    },
    recommendations,
    ai_analysis: aiAnalysis,
  };

  // Deduct credits
  await supabase.rpc("deduct_credits", { p_user_id: userId, p_amount: creditsCost });

  // Log transaction
  await supabase.from("raas_transactions").insert({
    user_id: userId,
    amount: -creditsCost,
    reason: `Generate Report${include_ai_analysis ? " + AI Analysis" : ""}`,
  });

  // Save to raas_missions
  await supabase.from("raas_missions").insert({
    user_id: userId,
    goal: `Generate ROI Report${campaign_id ? `: ${campaign_id}` : ""}`,
    complexity: include_ai_analysis ? "complex" : "standard",
    status: "done",
    credits_cost: creditsCost,
    result: report,
  });

  // Format response
  if (format === "markdown" && aiAnalysis) {
    const markdown = formatMarkdownReport(report);
    return new Response(JSON.stringify({
      report: { markdown, ...report },
      credits_cost: creditsCost,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({
    report,
    credits_cost: creditsCost,
    timestamp: new Date().toISOString(),
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

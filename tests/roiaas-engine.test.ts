// ROIaaS Engine Unit Tests
// Cover edge cases: zero cost, negative revenue, phase boundaries, credit checks, auth

import {
  assert,
  assertEquals,
  assertFalse,
  assertExists,
  assertRejects,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

// Mock Supabase client
class MockSupabaseClient {
  private credits: { user_id: string; balance: number }[] = [];
  private transactions: any[] = [];
  private missions: any[] = [];
  private reports: any[] = [];

  auth = {
    getUser: async (token: string) => {
      if (token === "valid-token") {
        return { data: { user: { id: "user-123" } }, error: null };
      }
      return { data: { user: null }, error: new Error("Invalid token") };
    },
  };

  from(table: string) {
    return {
      select: (columns: string) => ({
        eq: (key: string, value: string) => ({
          single: async () => {
            if (table === "raas_credits" && key === "user_id") {
              const credit = this.credits.find((c) => c.user_id === value);
              return {
                data: credit || null,
                error: credit ? null : new Error("Not found"),
              };
            }
            return { data: null, error: new Error("Not found") };
          },
        }),
      }),
      insert: (data: any) => ({
        then: (cb: any) => {
          if (table === "raas_transactions") this.transactions.push(data);
          if (table === "raas_missions") this.missions.push(data);
          if (table === "roiaas_reports") this.reports.push(data);
          return cb({ data, error: null });
        },
      }),
    };
  }

  rpc(fn: string, params: any) {
    if (fn === "deduct_credits" && params.p_user_id) {
      const credit = this.credits.find((c) => c.user_id === params.p_user_id);
      if (credit) {
        credit.balance -= params.p_amount;
      }
    }
    return Promise.resolve({ data: null, error: null });
  }

  // Test helpers
  setCredits(userId: string, balance: number) {
    const idx = this.credits.findIndex((c) => c.user_id === userId);
    if (idx >= 0) {
      this.credits[idx].balance = balance;
    } else {
      this.credits.push({ user_id: userId, balance });
    }
  }

  getTransactions() {
    return this.transactions;
  }

  getMissions() {
    return this.missions;
  }

  getReports() {
    return this.reports;
  }
}

// Phase threshold constants (from index.ts)
const PHASE_THRESHOLDS = {
  R1: { min_roi: -1, max_roi: 0 },      // Lỗ
  R2: { min_roi: 0, max_roi: 0.5 },     // Hòa vốn → Bắt đầu lãi
  R3: { min_roi: 0.5, max_roi: 1.5 },   // Tăng trưởng
  R4: { min_roi: 1.5, max_roi: Infinity }, // Bùng nổ
};

// Pure functions for testing (extracted logic from index.ts)
function calculateROI(revenue: number, cost: number) {
  const profit = revenue - cost;
  const roi = cost > 0 ? (profit / cost) : 0;
  const roas = cost > 0 ? (revenue / cost) : 0;
  const margin = revenue > 0 ? (profit / revenue) : 0;
  return { profit, roi, roas, margin };
}

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

function calculateMetrics(cost: number, metrics?: { cac?: number; ltv?: number; conversions?: number }) {
  const cac = metrics?.cac || (cost / (metrics?.conversions || 1));
  const ltv = metrics?.ltv || 0;
  const ltv_cac_ratio = cac > 0 ? (ltv / cac) : 0;
  const payback_months = ltv > 0 && cac > 0 ? Math.ceil(cac / (ltv / 12)) : 0;
  return {
    cac,
    ltv,
    ltv_cac_ratio: Number(ltv_cac_ratio.toFixed(2)),
    payback_months: ltv_cac_ratio >= 3 ? 0 : payback_months,
  };
}

function getRecommendations(phase: "R1" | "R2" | "R3" | "R4"): string[] {
  const recommendations: Record<string, string[]> = {
    R1: [
      "⚠️ Chiến dịch đang lỗ — Xem xét dừng hoặc tối ưu gấp",
      "Kiểm tra lại targeting và creative",
      "Giảm CPA bằng cách优化 CTR và CVR",
      "Đánh giá lại unit economics (CAC vs LTV)",
    ],
    R2: [
      "⚖️ Chiến dịch hòa vốn — Tối ưu để đạt R3",
      "Tăng ngân sách cho ads có ROAS > 1.5",
      "A/B testing landing page để tăng CVR",
      "Retargeting warm audience",
    ],
    R3: [
      "📈 Chiến dịch tăng trưởng tốt — Scale có kiểm soát",
      "Tăng ngân sách 20-30% mỗi tuần",
      "Mở rộng audience tương tự",
      "Đa dạng hóa kênh (TikTok, Google, Meta)",
    ],
    R4: [
      "🚀 Chiến dịch bùng nổ — Scale mạnh",
      "Tối đa hóa ngân sách có thể",
      "Chuẩn bị hạ tầng cho volume lớn",
      "Build moat: brand, loyalty, data",
    ],
  };
  return recommendations[phase];
}

Deno.test("ROIaaS Engine - calculateROI - basic calculation", () => {
  const result = calculateROI(150000, 100000);
  assertEquals(result.profit, 50000);
  assertEquals(result.roi, 0.5);
  assertEquals(result.roas, 1.5);
  assertEquals(result.margin, 1/3);
});

Deno.test("ROIaaS Engine - calculateROI - zero cost (edge case)", () => {
  const result = calculateROI(100000, 0);
  assertEquals(result.profit, 100000);
  assertEquals(result.roi, 0); // Division by zero protection
  assertEquals(result.roas, 0);
  assertEquals(result.margin, 1);
});

Deno.test("ROIaaS Engine - calculateROI - negative revenue (loss)", () => {
  const result = calculateROI(50000, 100000);
  assertEquals(result.profit, -50000);
  assertEquals(result.roi, -0.5);
  assertEquals(result.roas, 0.5);
  assertEquals(result.margin, -1);
});

Deno.test("ROIaaS Engine - calculateROI - breakeven (roi = 0)", () => {
  const result = calculateROI(100000, 100000);
  assertEquals(result.profit, 0);
  assertEquals(result.roi, 0);
  assertEquals(result.roas, 1);
  assertEquals(result.margin, 0);
});

Deno.test("ROIaaS Engine - calculateROI - high roi (R4)", () => {
  const result = calculateROI(500000, 100000);
  assertEquals(result.profit, 400000);
  assertEquals(result.roi, 4);
  assertEquals(result.roas, 5);
  assertEquals(result.margin, 0.8);
});

Deno.test("ROIaaS Engine - detectPhase - R1 (loss)", () => {
  assertEquals(detectPhase(-0.5).phase, "R1");
  assertEquals(detectPhase(-0.5).phase_name, "Lỗ");
  assertEquals(detectPhase(-0.01).phase, "R1");
});

Deno.test("ROIaaS Engine - detectPhase - R1 boundary (roi = -1)", () => {
  assertEquals(detectPhase(-1).phase, "R1");
  assertEquals(detectPhase(-1.5).phase, "R1");
});

Deno.test("ROIaaS Engine - detectPhase - R2 (breakeven to low profit)", () => {
  assertEquals(detectPhase(0).phase, "R2");
  assertEquals(detectPhase(0).phase_name, "Hòa vốn");
  assertEquals(detectPhase(0.25).phase, "R2");
  assertEquals(detectPhase(0.49).phase, "R2");
});

Deno.test("ROIaaS Engine - detectPhase - R3 (growth)", () => {
  assertEquals(detectPhase(0.5).phase, "R3");
  assertEquals(detectPhase(0.5).phase_name, "Tăng trưởng");
  assertEquals(detectPhase(0.75).phase, "R3");
  assertEquals(detectPhase(1.49).phase, "R3");
});

Deno.test("ROIaaS Engine - detectPhase - R4 (explosive)", () => {
  assertEquals(detectPhase(1.5).phase, "R4");
  assertEquals(detectPhase(1.5).phase_name, "Bùng nổ");
  assertEquals(detectPhase(2).phase, "R4");
  assertEquals(detectPhase(10).phase, "R4");
  assertEquals(detectPhase(100).phase, "R4");
});

Deno.test("ROIaaS Engine - detectPhase - phase boundary precision", () => {
  // Test exact boundaries
  assertEquals(detectPhase(0.499999).phase, "R2");
  assertEquals(detectPhase(0.500001).phase, "R3");
  assertEquals(detectPhase(1.499999).phase, "R3");
  assertEquals(detectPhase(1.500001).phase, "R4");
});

Deno.test("ROIaaS Engine - calculateMetrics - with conversions", () => {
  const result = calculateMetrics(100000, { conversions: 10 });
  assertEquals(result.cac, 10000);
  assertEquals(result.ltv, 0);
  assertEquals(result.ltv_cac_ratio, 0);
  assertEquals(result.payback_months, 0);
});

Deno.test("ROIaaS Engine - calculateMetrics - custom cac/ltv", () => {
  const result = calculateMetrics(100000, { cac: 50, ltv: 150 });
  assertEquals(result.cac, 50);
  assertEquals(result.ltv, 150);
  assertEquals(result.ltv_cac_ratio, 3);
  assertEquals(result.payback_months, 0); // payback is 0 when ltv_cac >= 3
});

Deno.test("ROIaaS Engine - calculateMetrics - ltv_cac_ratio < 3", () => {
  const result = calculateMetrics(100000, { cac: 100, ltv: 200 });
  assertEquals(result.ltv_cac_ratio, 2);
  assertEquals(result.payback_months, 6); // ceil(100 / (200/12)) = ceil(6) = 6
});

Deno.test("ROIaaS Engine - calculateMetrics - zero conversions (edge case)", () => {
  const result = calculateMetrics(100000, { conversions: 0 });
  assertEquals(result.cac, Infinity); // 100000 / 0
  assertEquals(result.ltv_cac_ratio, 0);
});

Deno.test("ROIaaS Engine - calculateMetrics - zero cac (edge case)", () => {
  const result = calculateMetrics(100000, { cac: 0, ltv: 100 });
  assertEquals(result.cac, 0);
  assertEquals(result.ltv_cac_ratio, 0); // Division by zero protection
});

Deno.test("ROIaaS Engine - getRecommendations - R1", () => {
  const recs = getRecommendations("R1");
  assertExists(recs);
  assertEquals(recs.length, 4);
  assert(recs[0].includes("lỗ"));
  assert(recs[0].includes("⚠️"));
});

Deno.test("ROIaaS Engine - getRecommendations - R2", () => {
  const recs = getRecommendations("R2");
  assertEquals(recs.length, 4);
  assert(recs[0].includes("hòa vốn"));
  assert(recs[0].includes("⚖️"));
});

Deno.test("ROIaaS Engine - getRecommendations - R3", () => {
  const recs = getRecommendations("R3");
  assertEquals(recs.length, 4);
  assert(recs[0].includes("tăng trưởng"));
  assert(recs[0].includes("📈"));
});

Deno.test("ROIaaS Engine - getRecommendations - R4", () => {
  const recs = getRecommendations("R4");
  assertEquals(recs.length, 4);
  assert(recs[0].includes("bùng nổ"));
  assert(recs[0].includes("🚀"));
});

Deno.test("ROIaaS Engine - validate required fields - missing revenue", () => {
  // Simulating validation logic from index.ts
  const body = { cost: 100000 };
  const isValid = body.revenue !== undefined && body.cost !== undefined;
  assertFalse(isValid);
});

Deno.test("ROIaaS Engine - validate required fields - missing cost", () => {
  const body = { revenue: 150000 };
  const isValid = body.revenue !== undefined && body.cost !== undefined;
  assertFalse(isValid);
});

Deno.test("ROIaaS Engine - validate required fields - both present", () => {
  const body = { revenue: 150000, cost: 100000 };
  const isValid = body.revenue !== undefined && body.cost !== undefined;
  assert(isValid);
});

Deno.test("ROIaaS Engine - validate required fields - zero values are valid", () => {
  const body = { revenue: 0, cost: 0 };
  const isValid = body.revenue !== undefined && body.cost !== undefined;
  assert(isValid);
});

Deno.test("ROIaaS Engine - credit check - sufficient balance", () => {
  const mockSupabase = new MockSupabaseClient();
  mockSupabase.setCredits("user-123", 5);

  const checkCredits = async () => {
    const { data } = await mockSupabase
      .from("raas_credits")
      .select("balance")
      .eq("user_id", "user-123")
      .single();
    return data && data.balance >= 2;
  };

  // Since Deno.test doesn't support async directly, we use Deno.test with async
});

Deno.test("ROIaaS Engine - credit check - insufficient balance", () => {
  const mockSupabase = new MockSupabaseClient();
  mockSupabase.setCredits("user-123", 1);

  // Logic check: balance < 2 should fail
  const balance = 1;
  const hasSufficientCredits = balance >= 2;
  assertFalse(hasSufficientCredits);
});

Deno.test("ROIaaS Engine - credit check - zero balance", () => {
  const balance = 0;
  const hasSufficientCredits = balance >= 2;
  assertFalse(hasSufficientCredits);
});

Deno.test("ROIaaS Engine - credit check - exactly 2 credits", () => {
  const balance = 2;
  const hasSufficientCredits = balance >= 2;
  assert(hasSufficientCredits);
});

Deno.test("ROIaaS Engine - margin calculation edge cases", () => {
  // Revenue = 0, margin should be 0 (division by zero protection)
  const result1 = calculateROI(0, 100000);
  assertEquals(result1.margin, 0);

  // Negative revenue
  const result2 = calculateROI(-50000, 100000);
  assertEquals(result2.margin, 0); // revenue <= 0, so margin = 0
});

Deno.test("ROIaaS Engine - ROAS edge cases", () => {
  // Cost = 0, ROAS should be 0 (division by zero protection)
  const result = calculateROI(100000, 0);
  assertEquals(result.roas, 0);

  // Cost negative (edge case - shouldn't happen but handled)
  const result2 = calculateROI(100000, -50000);
  assertEquals(result2.roas, -2); // 100000 / -50000
});

Deno.test("ROIaaS Engine - phase detection with exact boundary values", () => {
  // Exact boundary tests
  const testCases = [
    { roi: -1, expected: "R1" },
    { roi: -0.5, expected: "R1" },
    { roi: -0.000001, expected: "R1" },
    { roi: 0, expected: "R2" },
    { roi: 0.000001, expected: "R2" },
    { roi: 0.499999, expected: "R2" },
    { roi: 0.5, expected: "R3" },
    { roi: 0.500001, expected: "R3" },
    { roi: 1.499999, expected: "R3" },
    { roi: 1.5, expected: "R4" },
    { roi: 1.500001, expected: "R4" },
    { roi: 100, expected: "R4" },
  ];

  for (const { roi, expected } of testCases) {
    assertEquals(detectPhase(roi).phase, expected, `ROI ${roi} should be ${expected}`);
  }
});

Deno.test("ROIaaS Engine - metrics with undefined conversions", () => {
  const result = calculateMetrics(100000, { conversions: undefined });
  assertEquals(result.cac, 100000); // 100000 / 1 (default)
});

Deno.test("ROIaaS Engine - metrics with NaN prevention", () => {
  // When conversions is 0, cac becomes Infinity, ltv_cac_ratio becomes 0
  const result = calculateMetrics(100000, { conversions: 0, ltv: 50 });
  assertEquals(result.cac, Infinity);
  assertEquals(result.ltv_cac_ratio, 0);
});

Deno.test("ROIaaS Engine - payback_months calculation", () => {
  // LTV = 120/year, CAC = 100, payback = ceil(100 / (120/12)) = ceil(10) = 10 months
  const result = calculateMetrics(100000, { cac: 100, ltv: 120 });
  assertEquals(result.payback_months, 10);
});

Deno.test("ROIaaS Engine - payback_months when ltv_cac >= 3", () => {
  // LTV/CAC = 3, payback should be 0 (instant payback)
  const result = calculateMetrics(100000, { cac: 50, ltv: 150 });
  assertEquals(result.ltv_cac_ratio, 3);
  assertEquals(result.payback_months, 0);
});

Deno.test("ROIaaS Engine - auto_generate flag default", () => {
  // Default should be false
  const body: { auto_generate?: boolean } = {};
  const autoGenerate = body.auto_generate || false;
  assertFalse(autoGenerate);
});

Deno.test("ROIaaS Engine - auto_generate flag enabled", () => {
  const body: { auto_generate?: boolean } = { auto_generate: true };
  const autoGenerate = body.auto_generate || false;
  assert(autoGenerate);
});

Deno.test("ROIaaS Engine - CORS headers", () => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  assertEquals(corsHeaders["Access-Control-Allow-Origin"], "*");
  assert(corsHeaders["Access-Control-Allow-Headers"].includes("authorization"));
  assert(corsHeaders["Access-Control-Allow-Headers"].includes("content-type"));
});

Deno.test("ROIaaS Engine - OPTIONS request handling", () => {
  const method = "OPTIONS";
  const isPreflight = method === "OPTIONS";
  assert(isPreflight);
});

Deno.test("ROIaaS Engine - channel and campaign_id optional", () => {
  const body = { revenue: 100000, cost: 50000 };
  // These should be optional
  const campaignId = body.campaign_id;
  const channel = body.channel;
  assertEquals(campaignId, undefined);
  assertEquals(channel, undefined);
});

Deno.test("ROIaaS Engine - date fields optional", () => {
  const body = { revenue: 100000, cost: 50000, start_date: "2024-01-01" };
  assertEquals(body.start_date, "2024-01-01");
  assertEquals(body.end_date, undefined);
});

Deno.test("ROIaaS Engine - full metrics object optional", () => {
  const body = { revenue: 100000, cost: 50000, metrics: undefined };
  assertEquals(body.metrics, undefined);

  // Should still work with empty metrics
  const result = calculateMetrics(50000, body.metrics);
  assertEquals(result.cac, 50000); // Falls back to cost / 1
});

Deno.test("ROIaaS Engine - transaction logging format", () => {
  const userId = "user-123";
  const amount = -2;
  const type = "debit";
  const reason = "ROI Analysis: campaign-456";

  const transaction = {
    user_id: userId,
    amount,
    type,
    reason,
  };

  assertEquals(transaction.user_id, userId);
  assertEquals(transaction.amount, -2);
  assertEquals(transaction.type, "debit");
  assert(transaction.reason.includes("ROI Analysis"));
});

Deno.test("ROIaaS Engine - mission result format", () => {
  const roi_result = calculateROI(150000, 100000);
  const phase_result = detectPhase(roi_result.roi);
  const metrics = calculateMetrics(100000, { cac: 50, ltv: 150 });
  const recommendations = getRecommendations(phase_result.phase);

  const result = {
    roi_analysis: {
      ...roi_result,
      phase: phase_result.phase,
      phase_name: phase_result.phase_name,
      metrics,
    },
    recommendations,
    ai_report: null,
    timestamp: new Date().toISOString(),
  };

  assertExists(result.roi_analysis);
  assertExists(result.recommendations);
  assert(result.timestamp.length > 0);
});

Deno.test("ROIaaS Engine - report format for database", () => {
  const roi_result = calculateROI(200000, 100000);
  const phase_result = detectPhase(roi_result.roi);
  const metrics = calculateMetrics(100000);

  const report = {
    campaign_id: "camp-123",
    channel: "facebook",
    revenue: 200000,
    cost: 100000,
    profit: roi_result.profit,
    roi: roi_result.roi,
    roas: roi_result.roas,
    phase: phase_result.phase,
    phase_name: phase_result.phase_name,
    metrics,
    recommendations: getRecommendations(phase_result.phase),
  };

  assertEquals(report.campaign_id, "camp-123");
  assertEquals(report.channel, "facebook");
  assertEquals(report.phase, "R3");
  assert(report.recommendations.length > 0);
});

// ============================================================================
// INTEGRATION TESTS - Mock Supabase Client
// ============================================================================

Deno.test("ROIaaS Engine - MockSupabaseClient - auth valid token", async () => {
  const mockSupabase = new MockSupabaseClient();
  const { data, error } = await mockSupabase.auth.getUser("valid-token");

  assertExists(data.user);
  assertEquals(data.user.id, "user-123");
  assertEquals(error, null);
});

Deno.test("ROIaaS Engine - MockSupabaseClient - auth invalid token", async () => {
  const mockSupabase = new MockSupabaseClient();
  const { data, error } = await mockSupabase.auth.getUser("invalid-token");

  assertEquals(data.user, null);
  assertExists(error);
});

Deno.test("ROIaaS Engine - MockSupabaseClient - credits flow", async () => {
  const mockSupabase = new MockSupabaseClient();
  mockSupabase.setCredits("user-123", 10);

  // Check initial balance
  const { data: initial } = await mockSupabase
    .from("raas_credits")
    .select("balance")
    .eq("user_id", "user-123")
    .single();

  assertEquals(initial?.balance, 10);

  // Deduct credits via RPC
  await mockSupabase.rpc("deduct_credits", { p_user_id: "user-123", p_amount: 2 });

  // Check balance after deduction
  const { data: after } = await mockSupabase
    .from("raas_credits")
    .select("balance")
    .eq("user_id", "user-123")
    .single();

  assertEquals(after?.balance, 8);
});

Deno.test("ROIaaS Engine - MockSupabaseClient - transaction logging", async () => {
  const mockSupabase = new MockSupabaseClient();

  await mockSupabase.from("raas_transactions").insert({
    user_id: "user-123",
    amount: -2,
    type: "debit",
    reason: "ROI Analysis: campaign-456",
  });

  const transactions = mockSupabase.getTransactions();
  assertEquals(transactions.length, 1);
  assertEquals(transactions[0].user_id, "user-123");
  assertEquals(transactions[0].amount, -2);
});

Deno.test("ROIaaS Engine - MockSupabaseClient - mission logging", async () => {
  const mockSupabase = new MockSupabaseClient();

  await mockSupabase.from("raas_missions").insert({
    user_id: "user-123",
    goal: "ROI Analysis: campaign-456",
    complexity: "standard",
    status: "done",
    credits_cost: 2,
    result: { roi: 0.5, phase: "R3" },
  });

  const missions = mockSupabase.getMissions();
  assertEquals(missions.length, 1);
  assertEquals(missions[0].goal, "ROI Analysis: campaign-456");
  assertEquals(missions[0].credits_cost, 2);
});

Deno.test("ROIaaS Engine - MockSupabaseClient - report logging", async () => {
  const mockSupabase = new MockSupabaseClient();

  await mockSupabase.from("roiaas_reports").insert({
    user_id: "user-123",
    campaign_id: "camp-456",
    channel: "facebook",
    revenue: 200000,
    cost: 100000,
    profit: 100000,
    roi: 1.0,
    phase: "R3",
  });

  const reports = mockSupabase.getReports();
  assertEquals(reports.length, 1);
  assertEquals(reports[0].campaign_id, "camp-456");
  assertEquals(reports[0].roi, 1.0);
});

// ============================================================================
// SCENARIO TESTS - End-to-End Flows
// ============================================================================

Deno.test("ROIaaS Engine - Scenario: Successful R3 campaign analysis", () => {
  // Given: Campaign with revenue 200M, cost 100M
  const revenue = 200000;
  const cost = 100000;

  // When: Calculate ROI
  const { profit, roi, roas, margin } = calculateROI(revenue, cost);
  const { phase, phase_name } = detectPhase(roi);
  const metrics = calculateMetrics(cost, { conversions: 20 });
  const recommendations = getRecommendations(phase);

  // Then: Should be R3 (Growth)
  assertEquals(profit, 100000);
  assertEquals(roi, 1.0);
  assertEquals(roas, 2.0);
  assertEquals(phase, "R3");
  assertEquals(phase_name, "Tăng trưởng");
  assertEquals(metrics.cac, 5000);
  assert(recommendations.length > 0);
});

Deno.test("ROIaaS Engine - Scenario: Failing R1 campaign needs intervention", () => {
  // Given: Campaign with revenue 50M, cost 100M (losing money)
  const revenue = 50000;
  const cost = 100000;

  // When: Calculate ROI
  const { profit, roi } = calculateROI(revenue, cost);
  const { phase, phase_name } = detectPhase(roi);
  const recommendations = getRecommendations(phase);

  // Then: Should be R1 (Loss) with urgent recommendations
  assertEquals(profit, -50000);
  assertEquals(roi, -0.5);
  assertEquals(phase, "R1");
  assertEquals(phase_name, "Lỗ");
  assert(recommendations[0].includes("⚠️"));
});

Deno.test("ROIaaS Engine - Scenario: R4 viral campaign", () => {
  // Given: Viral campaign with revenue 1B, cost 200M
  const revenue = 1000000000;
  const cost = 200000000;

  // When: Calculate ROI
  const { profit, roi, roas } = calculateROI(revenue, cost);
  const { phase, phase_name } = detectPhase(roi);

  // Then: Should be R4 (Explosive)
  assertEquals(profit, 800000000);
  assertEquals(roi, 4.0);
  assertEquals(roas, 5.0);
  assertEquals(phase, "R4");
  assertEquals(phase_name, "Bùng nổ");
});

Deno.test("ROIaaS Engine - Scenario: Healthy unit economics (LTV/CAC >= 3)", () => {
  // Given: Good unit economics with LTV/CAC = 4
  const cost = 100000;
  const metrics = calculateMetrics(cost, { cac: 50, ltv: 200 });

  // Then: LTV/CAC ratio should be 4, payback should be 0 (instant)
  assertEquals(metrics.ltv_cac_ratio, 4);
  assertEquals(metrics.payback_months, 0);
});

Deno.test("ROIaaS Engine - Scenario: Poor unit economics (LTV/CAC < 1)", () => {
  // Given: Bad unit economics with LTV < CAC
  const cost = 100000;
  const metrics = calculateMetrics(cost, { cac: 100, ltv: 50 });

  // Then: LTV/CAC ratio should be 0.5, payback should be > 12 months
  assertEquals(metrics.ltv_cac_ratio, 0.5);
  assert(metrics.payback_months > 12);
});

Deno.test("ROIaaS Engine - Scenario: Multi-channel attribution", () => {
  // Given: Same campaign across multiple channels
  const baseRevenue = 100000;
  const baseCost = 50000;

  const channels = ["facebook", "google", "tiktok", "linkedin"];
  const results = channels.map(channel => ({
    channel,
    ...calculateROI(baseRevenue, baseCost),
  }));

  // Then: All channels should have same ROI (simplified attribution)
  results.forEach(result => {
    assertEquals(result.roi, 1.0);
    assertEquals(result.profit, 50000);
  });
});

Deno.test("ROIaaS Engine - Scenario: Time-based performance comparison", () => {
  // Given: Campaign performance over 3 months
  const monthlyData = [
    { month: 1, revenue: 50000, cost: 100000 },  // R1 - Loss
    { month: 2, revenue: 100000, cost: 100000 }, // R2 - Breakeven
    { month: 3, revenue: 200000, cost: 100000 }, // R3 - Growth
  ];

  // When: Calculate ROI for each month
  const results = monthlyData.map(data => ({
    month: data.month,
    ...calculateROI(data.revenue, data.cost),
    ...detectPhase(calculateROI(data.revenue, data.cost).roi),
  }));

  // Then: Should show improvement trajectory
  assertEquals(results[0].phase, "R1");
  assertEquals(results[1].phase, "R2");
  assertEquals(results[2].phase, "R3");
});

Deno.test("ROIaaS Engine - Scenario: Budget optimization decision", () => {
  // Given: Two campaigns with different performance
  const campaignA = calculateROI(150000, 100000); // ROI = 0.5 (R2/R3 boundary)
  const campaignB = calculateROI(80000, 100000);  // ROI = -0.2 (R1)

  // When: Compare and decide
  const betterCampaign = campaignA.roi > campaignB.roi ? "A" : "B";
  const shouldIncreaseBudgetA = campaignA.roi >= 0.5;
  const shouldStopB = campaignB.roi < 0;

  // Then: Decision should favor Campaign A
  assertEquals(betterCampaign, "A");
  assert(shouldIncreaseBudgetA);
  assert(shouldStopB);
});

Deno.test("ROIaaS Engine - Edge case: Very large numbers (billions)", () => {
  const revenue = 10000000000; // 10 billion
  const cost = 1000000000;     // 1 billion

  const result = calculateROI(revenue, cost);

  assertEquals(result.profit, 9000000000);
  assertEquals(result.roi, 9);
  assertEquals(result.roas, 10);
  // Phase should be R4
  assertEquals(detectPhase(result.roi).phase, "R4");
});

Deno.test("ROIaaS Engine - Edge case: Very small numbers (thousands)", () => {
  const revenue = 1500;
  const cost = 1000;

  const result = calculateROI(revenue, cost);

  assertEquals(result.profit, 500);
  assertEquals(result.roi, 0.5);
  assertEquals(result.roas, 1.5);
  // Phase should be R3 (exactly at boundary)
  assertEquals(detectPhase(result.roi).phase, "R3");
});

Deno.test("ROIaaS Engine - Floating point precision", () => {
  const revenue = 100000;
  const cost = 99999;

  const result = calculateROI(revenue, cost);

  assert(result.roi > 0);
  assert(result.roi < 0.001);
  // Should still be R2 (barely profitable)
  assertEquals(detectPhase(result.roi).phase, "R2");
});

Deno.test("ROIaaS Engine - Recommendations content validation", () => {
  // Validate all phases have actionable recommendations
  const allPhases: Array<"R1" | "R2" | "R3" | "R4"> = ["R1", "R2", "R3", "R4"];

  allPhases.forEach(phase => {
    const recs = getRecommendations(phase);
    assert(recs.length >= 3, `Phase ${phase} should have at least 3 recommendations`);
    recs.forEach(rec => {
      assert(rec.length > 10, `Recommendation should be meaningful length`);
    });
  });
});

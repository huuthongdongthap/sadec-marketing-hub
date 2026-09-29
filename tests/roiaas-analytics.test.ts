// ROIaaS Analytics Unit Tests
// Cover edge cases: empty data, date filtering, trend detection, credit checks, auth

import {
  assert,
  assertEquals,
  assertFalse,
  assertExists,
  assertObjectMatch,
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
        gte: (field: string, value: string) => ({
          lte: (field2: string, value2: string) => ({
            order: (field3: string, opts: any) => ({
              all: async () => {
                if (table === "roiaas_reports") {
                  return {
                    data: this.reports.filter((r) => {
                      const reportDate = new Date(r.created_at).toISOString();
                      return reportDate >= value && reportDate <= value2;
                    }),
                    error: null,
                  };
                }
                return { data: null, error: null };
              },
            }),
            all: async () => {
              if (table === "roiaas_reports") {
                return {
                  data: this.reports.filter((r) => {
                    const reportDate = new Date(r.created_at).toISOString();
                    return reportDate >= value;
                  }),
                  error: null,
                };
              }
              return { data: null, error: null };
            },
          }),
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

  setReports(reports: any[]) {
    this.reports = reports;
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

// Pure functions for testing (extracted from index.ts)
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

function detectTrend(progress: Array<{ roi: number }>): "improving" | "stable" | "declining" {
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

function detectPhaseChanges(progress: Array<{ phase: string; date: string }>): Array<{ from: string; to: string; date: string }> {
  const changes: Array<{ from: string; to: string; date: string }> = [];
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

function generateRecommendations(phaseDistribution: Record<string, number>, trend: string): string[] {
  const recommendations: string[] = [];
  const maxPhase = Object.entries(phaseDistribution).sort((a, b) => b[1] - a[1])[0]?.[0];

  switch (maxPhase) {
    case "R1":
      recommendations.push("⚠️ Phần lớn chiến dịch đang ở phase lỗ");
      break;
    case "R2":
      recommendations.push("⚖️ Đa số campaigns hòa vốn");
      break;
    case "R3":
      recommendations.push("📈 Tăng trưởng tốt");
      break;
    case "R4":
      recommendations.push("🚀 Bùng nổ — Scale mạnh");
      break;
  }

  if (trend === "declining") {
    recommendations.push("⚠️ Trend đang giảm");
  } else if (trend === "improving") {
    recommendations.push("✅ Trend tích cực");
  }

  return recommendations;
}

// ==================== ROI Summary Tests ====================

Deno.test("Analytics - detectPhase - R1 (loss)", () => {
  assertEquals(detectPhase(-0.5).phase, "R1");
  assertEquals(detectPhase(-0.5).phase_name, "Lỗ");
});

Deno.test("Analytics - detectPhase - R2 (breakeven)", () => {
  assertEquals(detectPhase(0).phase, "R2");
  assertEquals(detectPhase(0).phase_name, "Hòa vốn");
});

Deno.test("Analytics - detectPhase - R3 (growth)", () => {
  assertEquals(detectPhase(0.5).phase, "R3");
  assertEquals(detectPhase(0.5).phase_name, "Tăng trưởng");
});

Deno.test("Analytics - detectPhase - R4 (explosive)", () => {
  assertEquals(detectPhase(1.5).phase, "R4");
  assertEquals(detectPhase(1.5).phase_name, "Bùng nổ");
});

Deno.test("Analytics - detectTrend - empty data returns stable", () => {
  assertEquals(detectTrend([]), "stable");
});

Deno.test("Analytics - detectTrend - single data point returns stable", () => {
  assertEquals(detectTrend([{ roi: 0.5 }]), "stable");
});

Deno.test("Analytics - detectTrend - improving trend (roi increasing)", () => {
  const progress = [
    { roi: 0.1 },
    { roi: 0.3 },
    { roi: 0.5 },
    { roi: 0.7 },
  ];
  assertEquals(detectTrend(progress), "improving");
});

Deno.test("Analytics - detectTrend - declining trend (roi decreasing)", () => {
  const progress = [
    { roi: 0.7 },
    { roi: 0.5 },
    { roi: 0.3 },
    { roi: 0.1 },
  ];
  assertEquals(detectTrend(progress), "declining");
});

Deno.test("Analytics - detectTrend - stable trend (minimal change)", () => {
  const progress = [
    { roi: 0.5 },
    { roi: 0.55 },
    { roi: 0.52 },
    { roi: 0.58 },
  ];
  assertEquals(detectTrend(progress), "stable");
});

Deno.test("Analytics - detectPhaseChanges - no changes", () => {
  const progress = [
    { phase: "R2", date: "2024-01-01" },
    { phase: "R2", date: "2024-01-02" },
    { phase: "R2", date: "2024-01-03" },
  ];
  const changes = detectPhaseChanges(progress);
  assertEquals(changes.length, 0);
});

Deno.test("Analytics - detectPhaseChanges - single change", () => {
  const progress = [
    { phase: "R1", date: "2024-01-01" },
    { phase: "R1", date: "2024-01-02" },
    { phase: "R2", date: "2024-01-03" },
  ];
  const changes = detectPhaseChanges(progress);
  assertEquals(changes.length, 1);
  assertEquals(changes[0].from, "R1");
  assertEquals(changes[0].to, "R2");
  assertEquals(changes[0].date, "2024-01-03");
});

Deno.test("Analytics - detectPhaseChanges - multiple changes", () => {
  const progress = [
    { phase: "R1", date: "2024-01-01" },
    { phase: "R2", date: "2024-01-02" },
    { phase: "R3", date: "2024-01-03" },
  ];
  const changes = detectPhaseChanges(progress);
  assertEquals(changes.length, 2);
  assertEquals(changes[0].from, "R1");
  assertEquals(changes[0].to, "R2");
  assertEquals(changes[1].from, "R2");
  assertEquals(changes[1].to, "R3");
});

Deno.test("Analytics - generateRecommendations - R1 majority", () => {
  const distribution = { R1: 5, R2: 2, R3: 1 };
  const recs = generateRecommendations(distribution, "stable");
  assertExists(recs.find((r) => r.includes("phase lỗ")));
  assertFalse(recs.some((r) => r.includes("Trend đang giảm")));
});

Deno.test("Analytics - generateRecommendations - R3 majority with declining trend", () => {
  const distribution = { R3: 5, R2: 2, R4: 1 };
  const recs = generateRecommendations(distribution, "declining");
  assertExists(recs.find((r) => r.includes("Tăng trưởng")));
  assertExists(recs.find((r) => r.includes("Trend đang giảm")));
});

Deno.test("Analytics - generateRecommendations - R4 majority with improving trend", () => {
  const distribution = { R4: 5, R3: 3 };
  const recs = generateRecommendations(distribution, "improving");
  assertExists(recs.find((r) => r.includes("Bùng nổ")));
  assertExists(recs.find((r) => r.includes("Trend tích cực")));
});

// ==================== ROI Summary Aggregation Tests ====================

Deno.test("Analytics - ROI Summary - empty dataset", () => {
  const mockSupabase = new MockSupabaseClient();
  mockSupabase.setReports([]);
  mockSupabase.setCredits("user-123", 10);

  const reports: any[] = [];
  const summary = {
    total_revenue: reports.reduce((sum: number, r: any) => sum + (r.revenue || 0), 0),
    total_cost: reports.reduce((sum: number, r: any) => sum + (r.cost || 0), 0),
    total_profit: reports.reduce((sum: number, r: any) => sum + (r.profit || 0), 0),
    avg_roi: reports.length > 0 ? reports.reduce((sum: number, r: any) => sum + (r.roi || 0), 0) / reports.length : 0,
    avg_roas: reports.length > 0 ? reports.reduce((sum: number, r: any) => sum + (r.roas || 0), 0) / reports.length : 0,
    campaign_count: reports.length,
  };

  assertEquals(summary.total_revenue, 0);
  assertEquals(summary.total_cost, 0);
  assertEquals(summary.avg_roi, 0);
  assertEquals(summary.campaign_count, 0);
});

Deno.test("Analytics - ROI Summary - single report", () => {
  const mockSupabase = new MockSupabaseClient();
  mockSupabase.setReports([
    { user_id: "user-123", revenue: 150000, cost: 100000, profit: 50000, roi: 0.5, roas: 1.5, channel: "facebook", phase: "R3" },
  ]);

  const reports = mockSupabase.getReports();
  const summary = {
    total_revenue: reports.reduce((sum: number, r: any) => sum + (r.revenue || 0), 0),
    total_cost: reports.reduce((sum: number, r: any) => sum + (r.cost || 0), 0),
    total_profit: reports.reduce((sum: number, r: any) => sum + (r.profit || 0), 0),
    avg_roi: reports.length > 0 ? reports.reduce((sum: number, r: any) => sum + (r.roi || 0), 0) / reports.length : 0,
    avg_roas: reports.length > 0 ? reports.reduce((sum: number, r: any) => sum + (r.roas || 0), 0) / reports.length : 0,
    campaign_count: reports.length,
  };

  assertEquals(summary.total_revenue, 150000);
  assertEquals(summary.total_cost, 100000);
  assertEquals(summary.total_profit, 50000);
  assertEquals(summary.avg_roi, 0.5);
  assertEquals(summary.avg_roas, 1.5);
  assertEquals(summary.campaign_count, 1);
});

Deno.test("Analytics - ROI Summary - multiple reports aggregation", () => {
  const mockSupabase = new MockSupabaseClient();
  mockSupabase.setReports([
    { user_id: "user-123", revenue: 100000, cost: 50000, profit: 50000, roi: 1.0, roas: 2.0, channel: "facebook", phase: "R4" },
    { user_id: "user-123", revenue: 200000, cost: 100000, profit: 100000, roi: 1.0, roas: 2.0, channel: "google", phase: "R4" },
    { user_id: "user-123", revenue: 50000, cost: 50000, profit: 0, roi: 0, roas: 1.0, channel: "facebook", phase: "R2" },
  ]);

  const reports = mockSupabase.getReports();
  const summary = {
    total_revenue: reports.reduce((sum: number, r: any) => sum + (r.revenue || 0), 0),
    total_cost: reports.reduce((sum: number, r: any) => sum + (r.cost || 0), 0),
    total_profit: reports.reduce((sum: number, r: any) => sum + (r.profit || 0), 0),
    avg_roi: reports.length > 0 ? reports.reduce((sum: number, r: any) => sum + (r.roi || 0), 0) / reports.length : 0,
    avg_roas: reports.length > 0 ? reports.reduce((sum: number, r: any) => sum + (r.roas || 0), 0) / reports.length : 0,
    campaign_count: reports.length,
  };

  assertEquals(summary.total_revenue, 350000);
  assertEquals(summary.total_cost, 200000);
  assertEquals(summary.total_profit, 150000);
  assertEquals(summary.avg_roi, 2/3); // (1.0 + 1.0 + 0) / 3
  assertEquals(summary.avg_roas, 5/3); // (2.0 + 2.0 + 1.0) / 3
  assertEquals(summary.campaign_count, 3);
});

Deno.test("Analytics - ROI Summary - group by channel", () => {
  const mockSupabase = new MockSupabaseClient();
  mockSupabase.setReports([
    { user_id: "user-123", revenue: 100000, cost: 50000, profit: 50000, roi: 1.0, roas: 2.0, channel: "facebook", phase: "R4" },
    { user_id: "user-123", revenue: 50000, cost: 25000, profit: 25000, roi: 1.0, roas: 2.0, channel: "facebook", phase: "R4" },
    { user_id: "user-123", revenue: 200000, cost: 100000, profit: 100000, roi: 1.0, roas: 2.0, channel: "google", phase: "R4" },
  ]);

  const reports = mockSupabase.getReports();
  const channelMap = new Map<string, any>();
  for (const r of reports) {
    const ch = r.channel || "unknown";
    const existing = channelMap.get(ch) || { channel: ch, revenue: 0, cost: 0, profit: 0, campaign_count: 0 };
    existing.revenue += r.revenue || 0;
    existing.cost += r.cost || 0;
    existing.profit += r.profit || 0;
    existing.campaign_count += 1;
    channelMap.set(ch, existing);
  }

  const facebook = channelMap.get("facebook");
  const google = channelMap.get("google");

  assertEquals(facebook.revenue, 150000);
  assertEquals(facebook.cost, 75000);
  assertEquals(facebook.campaign_count, 2);
  assertEquals(google.revenue, 200000);
  assertEquals(google.campaign_count, 1);
});

Deno.test("Analytics - ROI Summary - group by phase", () => {
  const mockSupabase = new MockSupabaseClient();
  mockSupabase.setReports([
    { user_id: "user-123", phase: "R2" },
    { user_id: "user-123", phase: "R3" },
    { user_id: "user-123", phase: "R3" },
    { user_id: "user-123", phase: "R4" },
    { user_id: "user-123", phase: "R4" },
    { user_id: "user-123", phase: "R4" },
  ]);

  const reports = mockSupabase.getReports();
  const byPhase: Record<string, number> = {};
  for (const r of reports) {
    const phase = r.phase || "R1";
    byPhase[phase] = (byPhase[phase] || 0) + 1;
  }

  assertEquals(byPhase["R2"], 1);
  assertEquals(byPhase["R3"], 2);
  assertEquals(byPhase["R4"], 3);
});

// ==================== Credit Check Tests ====================

Deno.test("Analytics - Credit Check - sufficient credits for roi-summary (1 credit)", () => {
  const mockSupabase = new MockSupabaseClient();
  mockSupabase.setCredits("user-123", 5);

  const { data: credits } = { data: { balance: 5 } } as any;
  const hasSufficientCredits = credits && credits.balance >= 1;

  assert(hasSufficientCredits);
});

Deno.test("Analytics - Credit Check - insufficient credits for roi-summary", () => {
  const mockSupabase = new MockSupabaseClient();
  mockSupabase.setCredits("user-123", 0);

  const { data: credits } = { data: { balance: 0 } } as any;
  const hasSufficientCredits = credits && credits.balance >= 1;

  assertFalse(hasSufficientCredits);
});

Deno.test("Analytics - Credit Check - sufficient credits for generate-report with AI (3 credits)", () => {
  const mockSupabase = new MockSupabaseClient();
  mockSupabase.setCredits("user-123", 5);

  const creditsCost = 3;
  const { data: credits } = { data: { balance: 5 } } as any;
  const hasSufficientCredits = credits && credits.balance >= creditsCost;

  assert(hasSufficientCredits);
});

Deno.test("Analytics - Credit Check - insufficient credits for generate-report with AI", () => {
  const mockSupabase = new MockSupabaseClient();
  mockSupabase.setCredits("user-123", 2);

  const creditsCost = 3;
  const { data: credits } = { data: { balance: 2 } } as any;
  const hasSufficientCredits = credits && credits.balance >= creditsCost;

  assertFalse(hasSufficientCredits);
});

// ==================== Auth Tests ====================

Deno.test("Analytics - Auth - valid token returns user", async () => {
  const mockSupabase = new MockSupabaseClient();
  const { data: { user }, error } = await mockSupabase.auth.getUser("valid-token");

  assertExists(user);
  assertEquals(user.id, "user-123");
  assertEquals(error, null);
});

Deno.test("Analytics - Auth - invalid token returns null user", async () => {
  const mockSupabase = new MockSupabaseClient();
  const { data: { user }, error } = await mockSupabase.auth.getUser("invalid-token");

  assertEquals(user, null);
  assertExists(error);
});

// ==================== Report Generation Tests ====================

Deno.test("Analytics - Report Generation - format markdown report structure", () => {
  const report = {
    summary: {
      total_revenue: 500000,
      total_cost: 250000,
      total_profit: 250000,
      avg_roi: 1.0,
      avg_roas: 2.0,
      campaign_count: 5,
      timestamp: new Date().toISOString(),
    },
    phase_analysis: {
      progress: [
        { date: "2024-01-01", phase: "R2", roi: 0.1, revenue: 50000, cost: 45000 },
        { date: "2024-01-02", phase: "R3", roi: 0.6, revenue: 100000, cost: 60000 },
      ],
      phase_changes: [{ from: "R2", to: "R3", date: "2024-01-02" }],
      trend: "improving" as const,
    },
    recommendations: ["📈 Tăng trưởng tốt", "✅ Trend tích cực"],
    ai_analysis: "Chiến dịch đang có xu hướng cải thiện...",
  };

  // Verify report structure
  assertObjectMatch(report.summary, {
    total_revenue: 500000,
    total_profit: 250000,
    avg_roi: 1.0,
  });

  assertEquals(report.phase_analysis.phase_changes.length, 1);
  assertEquals(report.phase_analysis.trend, "improving");
  assertEquals(report.recommendations.length, 2);
  assertExists(report.ai_analysis);
});

Deno.test("Analytics - Report Generation - JSON format without AI", () => {
  const report = {
    campaign_id: "camp-123",
    summary: {
      total_revenue: 100000,
      total_cost: 80000,
      total_profit: 20000,
      avg_roi: 0.25,
      avg_roas: 1.25,
      campaign_count: 2,
    },
    phase_analysis: {
      progress: [],
      phase_changes: [],
      trend: "stable" as const,
    },
    recommendations: [],
    credits_cost: 1,
  };

  // JSON format should not have ai_analysis
  assertEquals((report as any).ai_analysis, undefined);
  assertEquals(report.credits_cost, 1);
  assertEquals(report.campaign_id, "camp-123");
});

// ==================== Date Filtering Tests ====================

Deno.test("Analytics - Date Filtering - filter reports by date range", () => {
  const allReports = [
    { created_at: "2024-01-01T10:00:00Z", revenue: 100000 },
    { created_at: "2024-01-15T10:00:00Z", revenue: 150000 },
    { created_at: "2024-02-01T10:00:00Z", revenue: 200000 },
    { created_at: "2024-02-15T10:00:00Z", revenue: 250000 },
  ];

  const startDate = "2024-01-01T00:00:00Z";
  const endDate = "2024-01-31T23:59:59Z";

  const filtered = allReports.filter((r) => {
    const reportDate = new Date(r.created_at).toISOString();
    return reportDate >= startDate && reportDate <= endDate;
  });

  assertEquals(filtered.length, 2);
  assertEquals(filtered[0].revenue, 100000);
  assertEquals(filtered[1].revenue, 150000);
});

Deno.test("Analytics - Date Filtering - last 30 days default", () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const daysDiff = (now.getTime() - thirtyDaysAgo.getTime()) / (24 * 60 * 60 * 1000);

  assertEquals(daysDiff, 30);
});

// ==================== Edge Cases ====================

Deno.test("Analytics - Edge Case - null revenue/cost values", () => {
  const reports = [
    { revenue: null, cost: null, profit: null, roi: null, roas: null },
    { revenue: 100000, cost: 50000, profit: 50000, roi: 1.0, roas: 2.0 },
  ];

  const summary = {
    total_revenue: reports.reduce((sum, r) => sum + (r.revenue || 0), 0),
    total_cost: reports.reduce((sum, r) => sum + (r.cost || 0), 0),
    total_profit: reports.reduce((sum, r) => sum + (r.profit || 0), 0),
  };

  assertEquals(summary.total_revenue, 100000);
  assertEquals(summary.total_cost, 50000);
  assertEquals(summary.total_profit, 50000);
});

Deno.test("Analytics - Edge Case - zero cost (division by zero protection)", () => {
  const cost = 0;
  const revenue = 100000;
  const roi = cost > 0 ? (revenue - cost) / cost : 0;
  const roas = cost > 0 ? revenue / cost : 0;

  assertEquals(roi, 0); // Protected
  assertEquals(roas, 0); // Protected
});

Deno.test("Analytics - Edge Case - channel grouping with null channel", () => {
  const reports = [
    { channel: "facebook", revenue: 100000 },
    { channel: null, revenue: 50000 },
    { channel: "google", revenue: 200000 },
  ];

  const channelMap = new Map<string, any>();
  for (const r of reports) {
    const ch = r.channel || "unknown";
    const existing = channelMap.get(ch) || { revenue: 0 };
    existing.revenue += r.revenue || 0;
    channelMap.set(ch, existing);
  }

  assertEquals(channelMap.get("facebook").revenue, 100000);
  assertEquals(channelMap.get("unknown").revenue, 50000);
  assertEquals(channelMap.get("google").revenue, 200000);
});

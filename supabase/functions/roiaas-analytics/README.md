# ROIaaS Analytics Edge Function

Edge function cung cấp analytics tổng hợp cho ROIaaS platform.

## Endpoints

### GET /roi-summary

Tổng quan ROI across campaigns.

**Query Params:**
- `start_date?: string` (ISO 8601, default: 30 days ago)
- `end_date?: string` (ISO 8601, default: now)
- `channel?: string` (e.g., "facebook", "google")
- `campaign_id?: string`

**Credits Cost:** 1

**Response:**
```json
{
  "summary": {
    "total_revenue": 350000,
    "total_cost": 200000,
    "total_profit": 150000,
    "avg_roi": 0.67,
    "avg_roas": 1.67,
    "campaign_count": 3
  },
  "by_channel": [
    { "channel": "facebook", "revenue": 150000, "cost": 75000, "roi": 1.0, "roas": 2.0, "campaign_count": 2 }
  ],
  "by_phase": { "R2": 1, "R3": 1, "R4": 1 },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

### GET /phase-progress

Theo dõi phase progression theo thời gian.

**Query Params:**
- `campaign_id?: string`
- `days?: number` (default: 30)

**Credits Cost:** 1

**Response:**
```json
{
  "progress": [
    { "date": "2024-01-01", "phase": "R2", "phase_name": "Hòa vốn", "roi": 0.1, "revenue": 50000, "cost": 45000 }
  ],
  "phase_changes": [
    { "from": "R2", "to": "R3", "date": "2024-01-05" }
  ],
  "trend": "improving",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Trend values:**
- `improving` - ROI đang tăng
- `stable` - ROI ổn định
- `declining` - ROI đang giảm

---

### POST /generate-report

Generate báo cáo chi tiết với AI analysis (optional).

**Body:**
```json
{
  "campaign_id": "camp-123",
  "include_ai_analysis": true,
  "format": "json",
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-01-31T23:59:59Z"
}
```

**Credits Cost:**
- 1 credit (không có AI analysis)
- 3 credits (có AI analysis)

**Response:**
```json
{
  "report": {
    "campaign_id": "camp-123",
    "summary": { ... },
    "phase_analysis": {
      "progress": [...],
      "phase_changes": [...],
      "trend": "improving"
    },
    "recommendations": [...],
    "ai_analysis": "..." (if requested)
  },
  "credits_cost": 3,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Format options:**
- `json` - Raw JSON response
- `markdown` - Formatted markdown report (chỉ khi có AI analysis)

---

## Usage Examples

### cURL

```bash
# ROI Summary
curl -X GET "http://localhost:54321/functions/v1/roiaas-analytics?endpoint=roi-summary&start_date=2024-01-01" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Phase Progress
curl -X GET "http://localhost:54321/functions/v1/roiaas-analytics?endpoint=phase-progress&campaign_id=camp-123&days=7" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Generate Report
curl -X POST "http://localhost:54321/functions/v1/roiaas-analytics?endpoint=generate-report" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"campaign_id": "camp-123", "include_ai_analysis": true}'
```

### JavaScript/TypeScript

```typescript
const BASE_URL = 'http://localhost:54321/functions/v1/roiaas-analytics';
const TOKEN = 'your-supabase-token';

// Get ROI Summary
async function getROISummary(options?: {
  startDate?: string;
  endDate?: string;
  channel?: string;
  campaignId?: string;
}) {
  const params = new URLSearchParams();
  if (options?.startDate) params.set('start_date', options.startDate);
  if (options?.endDate) params.set('end_date', options.endDate);
  if (options?.channel) params.set('channel', options.channel);
  if (options?.campaignId) params.set('campaign_id', options.campaignId);

  const res = await fetch(`${BASE_URL}?endpoint=roi-summary&${params}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  return res.json();
}

// Get Phase Progress
async function getPhaseProgress(options?: {
  campaignId?: string;
  days?: number;
}) {
  const params = new URLSearchParams();
  if (options?.campaignId) params.set('campaign_id', options.campaignId);
  if (options?.days) params.set('days', options.days.toString());

  const res = await fetch(`${BASE_URL}?endpoint=phase-progress&${params}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  return res.json();
}

// Generate Report
async function generateReport(options: {
  campaignId?: string;
  includeAiAnalysis?: boolean;
  format?: 'json' | 'markdown';
  startDate?: string;
  endDate?: string;
}) {
  const res = await fetch(`${BASE_URL}?endpoint=generate-report`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });
  return res.json();
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Invalid endpoint or missing params |
| 401 | Unauthorized (invalid/missing token) |
| 402 | Insufficient credits |
| 500 | Server error |

---

## Testing

```bash
cd apps/sadec-marketing-hub
deno test tests/roiaas-analytics.test.ts --allow-env --allow-net
```

**Test coverage:**
- Phase detection (R1-R4)
- Trend detection (improving/stable/declining)
- Phase change detection
- ROI Summary aggregation
- Channel grouping
- Phase distribution
- Credit checks
- Auth validation
- Date filtering
- Edge cases (null values, division by zero)

---

## Architecture

### Helper Functions

| Function | Purpose |
|----------|---------|
| `detectPhase(roi)` | Map ROI to phase (R1-R4) |
| `detectTrend(progress)` | Detect trend from ROI progression |
| `detectPhaseChanges(progress)` | Find phase transition points |
| `generateRecommendations(distribution, trend)` | Generate strategic recommendations |
| `generateAIAnalysis(summary, phaseAnalysis, recommendations)` | Call LLM for analysis |
| `formatMarkdownReport(report)` | Format report as markdown |

### Phase Thresholds

| Phase | ROI Range | Description |
|-------|-----------|-------------|
| R1 | -1 to 0 | Lỗ |
| R2 | 0 to 0.5 | Hòa vốn → Bắt đầu lãi |
| R3 | 0.5 to 1.5 | Tăng trưởng |
| R4 | 1.5+ | Bùng nổ |

---

## Database Requirements

Function requires `roiaas_reports` table:

```sql
CREATE TABLE roiaas_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  campaign_id TEXT,
  channel TEXT,
  revenue NUMERIC,
  cost NUMERIC,
  profit NUMERIC,
  roi NUMERIC,
  roas NUMERIC,
  phase TEXT CHECK (phase IN ('R1', 'R2', 'R3', 'R4')),
  phase_name TEXT,
  metrics JSONB,
  recommendations JSONB,
  ai_report TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_roiaas_reports_user ON roiaas_reports(user_id, created_at DESC);
CREATE INDEX idx_roiaas_reports_phase ON roiaas_reports(phase);
```

---

## Credits System

- `roi-summary`: 1 credit
- `phase-progress`: 1 credit
- `generate-report` (no AI): 1 credit
- `generate-report` (with AI): 3 credits

Credits are deducted atomically via `deduct_credits` RPC function.

---

## See Also

- [`roiaas-engine`](../roiaas-engine/README.md) - ROI calculation单个
- [RaaS Platform](../../README.md) - Revenue-as-a-Service overview

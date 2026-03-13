# OCOP PLATFORM ROIaaS PLAN

> **Từ Sa Đéc Marketing Hub → OCOP Export ROIaaS Platform**
>
> *"Biến sản phẩm địa phương thành hàng xuất khẩu — AI lo tất cả, bạn chỉ việc thu lợi"*

---

## EXECUTIVE SUMMARY

**ROIaaS (Return On Investment as a Service)** — Mô hình platform cung cấp dịch vụ xuất khẩu OCOP theo dạng "trả theo kết quả".

| Hiện tại (V3) | Mục tiêu (V4 ROIaaS) |
|--------------|---------------------|
| Marketing Hub cho SMEs địa phương | Platform xuất khẩu OCOP ĐBSCL |
| Revenue: Subscription固定 | Revenue: % Hoa hồng xuất khẩu |
| AI: Content creation | AI: Export matching + compliance |
| Khách hàng: Local businesses | Khách hàng: OCOP producers + International buyers |

---

## 5 PHASES ROIaaS ROADMAP

### 🌾 PHASE 1: OCOP Export Agent (4 tuần)

**Mục tiêu:** Tự động hóa listing xuất khẩu cho sản phẩm OCOP

| Feature | Mô tả | Tech Stack | Est. Time |
|---------|-------|------------|-----------|
| **OCOP Exporter HTML** | Giao diện nhập sản phẩm, AI tạo listing | Vanilla JS + Material Web | ✅ Hoàn thành |
| **Edge Function: ocop-export-agent** | AI tạo Alibaba listing, B2B email, compliance checklist | Supabase Edge Functions + Qwen 3.5 | 3 ngày |
| **Credit System** | 3 credits/lần tạo export package | Supabase Realtime + Row Level Security | 2 ngày |
| **Product Database** | Lưu trữ sản phẩm + output AI | Supabase PostgreSQL | 1 ngày |

**Completion Criteria:**
- [ ] Tạo được listing hoàn chỉnh từ form input
- [ ] Credit system hoạt động real-time
- [ ] Output: Alibaba listing, B2B email, HS code, compliance checklist

---

### 🤖 PHASE 2: AI Matchmaking Engine (6 tuần)

**Mục tiêu:** AI tự động match sản phẩm OCOP với buyers quốc tế

| Feature | Mô tả | Tech Stack | Est. Time |
|---------|-------|------------|-----------|
| **Buyer Profile AI** | Phân tích buyer requirements từ inquiry emails | NLP + Vector Search | 2 tuần |
| **Product-Buyer Matching** | AI scoring độ phù hợp sản phẩm-buyer | Supabase pgvector + Qwen 3.5 | 2 tuần |
| **Auto-RFQ Generator** | Tạo RFQ (Request for Quotation) tự động | Edge Functions + Templates | 1 tuần |
| **Smart Pricing Advisor** | Gợi ý giá FOB dựa trên thị trường | External API + AI analysis | 1 tuần |

**Completion Criteria:**
- [ ] Match score >80% accuracy
- [ ] RFQ tự động gửi cho 5+ suppliers phù hợp
- [ ] Pricing advisor chính xác ±10% so với market rate

---

### 📊 PHASE 3: ROI Dashboard & Analytics (5 tuần)

**Mục tiêu:** Dashboard theo dõi ROI cho producers và investors

| Feature | Mô tả | Tech Stack | Est. Time |
|---------|-------|------------|-----------|
| **Producer Dashboard** | Theo dõi đơn hàng, revenue, export progress | PWA + Chart.js | 2 tuần |
| **ROI Calculator** | Tính ROI tự động cho từng sản phẩm | Edge Functions + Real-time DB | 1 tuần |
| **Market Intelligence** | Báo cáo xu hướng xuất khẩu theo thị trường | External APIs + AI summary | 2 tuần |

**Completion Criteria:**
- [ ] Dashboard hiển thị: revenue, orders, ROI %, top markets
- [ ] Real-time alerts cho đơn hàng mới
- [ ] Weekly AI report gửi email tự động

---

### 🌐 PHASE 4: Multi-Market Expansion (8 tuần)

**Mục tiêu:** Mở rộng sang 5 thị trường xuất khẩu chính

| Market | Features | Compliance | Est. Time |
|--------|----------|------------|-----------|
| **Trung Quốc** | Integration với 1688.com, WeChat | GACC registration | 2 tuần |
| **EU** | EUR.1 certificate, GI protection | EU Organic, PDO/PGI | 3 tuần |
| **Nhật Bản** | JAS certification support | JAS, Food Sanitation Act | 2 tuần |
| **Hàn Quốc** | KFDA compliance | KFDA, Organic Korea | 1 tuần |

**Completion Criteria:**
- [ ] Compliance checklist tự động theo thị trường
- [ ] Certificate template generator
- [ ] Multi-language support (EN, CN, JP, KR)

---

### 💰 PHASE 5: Revenue & Investment Platform (6 tuần)

**Mục tiêu:** Platform gọi vốn và chia sẻ lợi nhuận

| Feature | Mô tả | Revenue Model | Est. Time |
|---------|-------|---------------|-----------|
| **Investor Portal** | Đầu tư vào lô hàng xuất khẩu | 15-25% APR | 2 tuần |
| **Revenue Sharing** | Smart contract chia lợi nhuận tự động | Supabase Edge Functions | 2 tuần |
| **Crowdfunding Campaigns** | Gọi vốn cộng đồng cho producers | Platform fee 3-5% | 2 tuần |

**Completion Criteria:**
- [ ] Investor dashboard với portfolio tracking
- [ ] Auto-payout revenue sharing
- [ ] Crowdfunding campaign builder

---

## TIMELINE TỔNG THỂ

```
Q2 2026 (Tháng 4-6)
├── Tháng 4: Phase 1 — OCOP Export Agent ✅
│   └── Tuần 1-2: Exporter HTML + Edge Function
│   └── Tuần 3: Credit System + Database
│   └── Tuần 4: Testing + Beta launch
│
├── Tháng 5-6: Phase 2 — AI Matchmaking
│   └── Tuần 5-6: Buyer Profile AI + Vector Search
│   └── Tuần 7-8: Matching Engine + RFQ Generator
│   └── Tuần 9: Pricing Advisor
│
├── Tháng 7: Phase 3 — ROI Dashboard
│   └── Tuần 10-11: Producer Dashboard
│   └── Tuần 12: ROI Calculator + Market Intelligence
│
├── Tháng 8-9: Phase 4 — Multi-Market
│   └── Tuần 13-16: China, EU, Japan, Korea compliance
│
└── Tháng 10: Phase 5 — Revenue Platform
    └── Tuần 17-20: Investor Portal + Revenue Sharing
```

---

## TECH STACK

### Frontend
```
- Vanilla JavaScript (ES2022+) — Giữ nguyên V3 performance
- Material Design 3 Expressive — Design system
- Web Components — Reusable UI components
- PWA — Offline support + Push notifications
```

### Backend
```
- Supabase — Auth, Database, Realtime, Edge Functions
- Edge Functions — AI orchestration (ocop-export-agent, raas-bridge)
- pgvector — Semantic search cho matching
- Row Level Security — Data isolation
```

### AI/ML
```
- Qwen 3.5 Plus (via Antigravity Proxy) — Content generation
- Ollama qwen3.5:9b (local) — VIBE monitoring
- Supabase AI SDK — Edge AI inference
```

### DevOps
```
- Vercel — Frontend deployment
- Supabase CLI — Database migrations
- GitHub Actions — CI/CD
- Playwright — E2E testing
```

---

## REVENUE MODEL

### 1. Export Commission (Chính)
| Tier | Revenue Share | Features |
|------|---------------|----------|
| **Basic** | 5% FOB value | Listing + B2B matching |
| **Pro** | 8% FOB value | + Compliance + Pricing advisor |
| **Enterprise** | 12% FOB value | + Dedicated support + Priority matching |

### 2. Credit System (Phụ)
| Package | Credits | Price (VND) | Per Export |
|---------|---------|-------------|------------|
| Starter | 10 | 299,000 | 29,900 |
| Business | 50 | 999,000 | 19,980 |
| Enterprise | 200 | 2,999,000 | 14,995 |

### 3. Investor Revenue Share
| Source | Platform Fee | Est. Monthly |
|--------|--------------|--------------|
| Revenue sharing payout | 2% | 50-200M VND |
| Crowdfunding campaigns | 3-5% | 30-100M VND |
| Premium analytics | Subscription 499K/tháng | 20-50M VND |

### 4. Market Intelligence Reports
| Report Type | Price | Target |
|-------------|-------|--------|
| Weekly OCOP Export Trends | Free | Lead generation |
| Monthly Market Deep Dive | 1,999,000 | Producers |
| Quarterly Investment Outlook | 4,999,000 | Investors |

---

## FINANCIAL PROJECTIONS

### Năm 1 (2026)
| Metric | Target |
|--------|--------|
| Active Producers | 100 |
| Export Deals Closed | 50 |
| Total FOB Value | $500,000 |
| Platform Revenue (8% avg) | $40,000 (~1B VND) |
| Credit Sales | 500 packages | 250M VND |
| **Total Revenue** | **~1.25B VND** |

### Năm 2 (2027)
| Metric | Target |
|--------|--------|
| Active Producers | 500 |
| Export Deals Closed | 300 |
| Total FOB Value | $3,000,000 |
| Platform Revenue (8% avg) | $240,000 (~6B VND) |
| Credit Sales | 3,000 packages | 1.5B VND |
| Investor Platform | 100 active investors | 500M VND fees |
| **Total Revenue** | **~8B VND** |

---

## SUCCESS METRICS (KPIs)

| KPI | Target | Measurement |
|-----|--------|-------------|
| Export Packages Generated | 500+/tháng | Edge Function logs |
| Match Success Rate | >60% | Deals closed / Matches made |
| Producer Retention | >75% | Monthly active / Total |
| Average ROI for Producers | >30% | (Revenue - Cost) / Cost |
| Platform Uptime | 99.9% | Supabase monitoring |
| Credit Conversion | 15% | Free → Paid |

---

## RISK ASSESSMENT

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Compliance changes** | High | AI auto-update checklist từ official sources |
| **Payment fraud** | Medium | Escrow system + Buyer verification |
| **Supply chain disruption** | Medium | Multi-supplier matching + Backup producers |
| **AI accuracy issues** | Low | Human-in-the-loop review for first 100 deals |
| **Competition** | Medium | First-mover advantage + Local expertise |

---

## NEXT ACTIONS (Tuần 1-2)

### Tuần 1: Foundation
- [ ] **Day 1-2:** Setup Supabase tables cho OCOP products
- [ ] **Day 3-4:** Edge Function `ocop-export-agent` production-ready
- [ ] **Day 5:** Credit system integration với portal

### Tuần 2: Beta Launch
- [ ] **Day 6-7:** UI polish + Mobile responsive audit
- [ ] **Day 8-9:** E2E tests với Playwright
- [ ] **Day 10:** Beta launch với 5 producers đầu tiên

---

## PHILOSOPHY: ROIaaS TENETS

> **1. AI-First, Human-Guided** — AI làm 90%, con người review 10% critical decisions

> **2. Pay-for-Performance** — Chỉ thu phí khi có kết quả thực tế

> **3. Transparent ROI** — Mọi producer đều thấy rõ: bỏ X, nhận Y

> **4. Local Roots, Global Reach** → Bắt đầu từ ĐBSCL, vươn ra thế giới

> **5. Sustainable Growth** — Không chạy theo số lượng, tập trung chất lượng deal

---

## BINH PHÁP ALIGNMENT — 5 PHASES ROIaaS

> *"Biết người biết ta, trăm trận trăm thắng"* — Áp dụng 13 chương Tôn Tử Binh Pháp vào từng phase

### 🌾 PHASE 1: 始計 (Shi Ji) — Planning & Foundation

**Chapter 1: Estimates — Lập kế hoạch xuất khẩu**

| Binh Pháp Principle | Áp dụng ROIaaS | Implementation |
|---------------------|----------------|----------------|
| **Ngũ sự** (5 yếu tố) | Đạo, Thiên, Địa, Tướng, Pháp | Đạo: Sứ mệnh đưa OCOP ra thế giới<br>Thiên: Thời điểm vàng xuất khẩu 2026<br>Địa: ĐBSCL vùng nguyên liệu<br>Tướng: AI Agent dẫn dắt<br>Pháp: ROIaaS model |
| **Thất kế** (7 mưu) | So sánh ta-địch | Ta: OCOP chất lượng, giá cạnh tranh<br>Địch: Đối thủ Thái Lan, Trung Quốc<br>→ Differentiation: Storytelling + Traceability |
| **Công thành** | Chiếm lĩnh thị trường | Alibaba listing = công thành đầu tiên<br>→ Chiếm kênh phân phối quốc tế |

**Key Success Factor:** *"Đa toán thắng, thiểu toán bất thắng"* — Planning kỹ = export thành công

---

### 🤖 PHASE 2: 謀攻 (Mou Gong) — Strategic Matching

**Chapter 3: Attack by Stratagem — AI matchmaking**

| Binh Pháp Principle | Áp dụng ROIaaS | Implementation |
|---------------------|----------------|----------------|
| **Thượng binh phạt mưu** | AI matching > Cold outreach | 90% AI auto-match, 10% human review<br>→ Tránh "công thành" tốn kém |
| **Tri bỉ tri kỷ** | Buyer profiling sâu | Vector search phân tích buyer intent<br>→ Match score >80% accuracy |
| **Bất chiến nhi khuất nhân chi binh** | Win without fighting | Auto-RFQ gửi đúng người, đúng thời điểm<br>→ Buyer chủ động inquiry |
| **Viễn giao cận công** | Market expansion strategy | Xa: EU, Nhật (cao cấp)<br>Gần: Trung Quốc, ASEAN (khối lượng) |

**Key Success Factor:** *"Thiện chiến giả, trí nhân nhi bất trí lực"* — Dùng AI intelligence, không dùng brute force sales

---

### 📊 PHASE 3: 軍形 (Jun Xing) — Market Position & Visibility

**Chapter 4: Deployment — Dashboard & transparency**

| Binh Pháp Principle | Áp dụng ROIaaS | Implementation |
|---------------------|----------------|----------------|
| **Tiên vi bất khả thắng** | Phòng thủ trước, tấn công sau | Dashboard minh bạch = niềm tin<br>→ Producer an tâm, investor tự tin |
| **Hình chi sở bất khả kiến** | Competitor intelligence | Market Intelligence báo cáo<br>→ Thấy đối thủ, thấy xu hướng |
| **Thắng binh như thưng dật** | Winning position | ROI >30% = thế thắng<br>→ Tự động attract thêm producers |
| **Thiện thủ giả, thủ như thái sơn** | Defensibility | Data moat: Càng nhiều deals → AI càng thông minh<br>→ Rào cản gia nhập ngành |

**Key Success Factor:** *"Thiện chiến giả, lập ư bất bại chi địa"* — Dashboard tạo thế bất bại (minh bạch, data-driven)

---

### 🌐 PHASE 4: 兵勢 (Bing Shi) — Force Multipliers

**Chapter 5: Momentum — Multi-market expansion**

| Binh Pháp Principle | Áp dụng ROIaaS | Implementation |
|---------------------|----------------|----------------|
| **Thế như hoãn huyệt** | Tích lũy lực lượng | 5 thị trường = 5 cánh quân<br>→ Tạo thế "vạn quân vạn mã" |
| **Tiết như phát cơ** | Timing xuất khẩu | Mùa vụ ĐBSCL → Khớp demand quốc tế<br>→ Phát đúng thời điểm = giá cao |
| **Chính kỳ chi biến** | Orthodoxy + surprise | Chính: Compliance chuẩn<br>Kỳ: AI personalization per market<br>→ Vừa đúng luật, vừa khác biệt |
| **Dĩ chính hiệp, dĩ kỳ thắng** | Win with surprise | Standard compliance + AI storytelling<br>→ Every product has unique story |

**Key Success Factor:** *"Thế hiểm, tiết đoản"* — Tạo đà (momentum) mạnh, release ngắn gọn đúng thời cơ

---

### 💰 PHASE 5: 虛實 (Xu Shi) — Capital & Investment

**Chapter 6: Illusion & Reality — Investor platform**

| Binh Pháp Principle | Áp dụng ROIaaS | Implementation |
|---------------------|----------------|----------------|
| **Tị thực kích hư** | Strike the void | Investor vốn nhàn rỗi<br>Producer cần vốn → Match = đôi bên cùng lời |
| **Nhân chi sở dị** | Go where others don't | Crowdfunding OCOP = blue ocean<br>→ Không ai làm ở VN |
| **Vi nhân chi sở bất năng vi** | Do what others can't | Revenue sharing auto-payout<br>→ Smart contract transparency |
| **Hình nhân vô hình** | Formless strategy | Platform asset-light<br>→ Không giữ hàng, không rủi ro tồn kho |

**Key Success Factor:** *"Vô hình vô thanh"* — Platform vô hình (không sở hữu inventory) nhưng điều phối toàn bộ chain

---

## 13 CHAPTERS MAPPING — COMPLETE WARFARE

| Phase | Binh Pháp Chapter | Theme | ROIaaS Application |
|-------|-------------------|-------|-------------------|
| **Phase 1** | 始計 (Chapter 1) | Planning | Export planning + listing generation |
| **Phase 2** | 謀攻 (Chapter 3) | Strategy | AI matchmaking + RFQ |
| **Phase 3** | 軍形 (Chapter 4) | Position | Dashboard + transparency |
| **Phase 4** | 兵勢 (Chapter 5) | Momentum | Multi-market expansion |
| **Phase 5** | 虛實 (Chapter 6) | Capital | Investor platform + revenue share |
| **Ongoing** | 軍爭 (Chapter 7) | Maneuver | Competitive positioning |
| **Ongoing** | 九變 (Chapter 8) | Adaptation | Market pivot capability |
| **Ongoing** | 行軍 (Chapter 9) | March | Supply chain management |
| **Ongoing** | 地形 (Chapter 10) | Terrain | Market landscape analysis |
| **Ongoing** | 九 địa (Chapter 11) | Ground | Producer relationships |
| **Ongoing** | 火攻 (Chapter 12) | Fire | Growth hacking campaigns |
| **Ongoing** | 用間 (Chapter 13) | Spies | Market intelligence |

---

## ROIaaS BINH PHÁP MATRIX

```
                    始計    謀攻    軍形    兵勢    虛實
                    (Plan)  (Attack) (Form)  (Momentum) (Void)
                    ────────────────────────────────────────
AI Agent            ✓       ✓       ✓       -       -
Matchmaking         -       ✓       ✓       ✓       -
Dashboard           -       -       ✓       ✓       ✓
Multi-Market        -       -       ✓       ✓       ✓
Investor Platform   -       -       -       ✓       ✓
                    ────────────────────────────────────────
Primary Focus       Q2      Q3      Q3      Q4      Q4
```

**Reading:** Each phase builds on previous — no skipping steps.

---

## LÃO TỬ ALIGNMENT — DAOIST PHILOSOPHY

> ROIaaS không chỉ Binh Pháp (pháp thuật) — còn Lão Tử (đạo thuật)

| Lão Tử Principle | ROIaaS Application |
|------------------|-------------------|
| **Vô vi nhi trị** | Platform vận hành tự động, founder không cần can thiệp |
| **Nhu thắng cương** | AI mềm mỏng (email, storytelling) thắng hard sales |
| **Tri túc bất nhục** | Focus quality deals > quantity (sustainable growth) |
| **Đại khí vãn thành** | Xây platform 5 năm → Dominance 50 năm |

---

## TÔM HÙM AUTO-CTO INTEGRATION — Autonomous Dispatch

> **第九篇 行軍 (Xing Jun) — Tôm Hùm Tự Trị** áp dụng cho ROIaaS

### Auto-Generated Tasks per Phase

Tôm Hùm daemon sẽ tự động generate Binh Pháp quality tasks khi queue empty:

| Phase | Auto-Task ID | Description | Trigger |
|-------|--------------|-------------|---------|
| **Phase 1** | `ocop_export_agent` | Test export agent với 10 products mẫu | Queue empty 60 checks |
| **Phase 2** | `vector_search_quality` | Audit pgvector matching accuracy | After matching engine deploy |
| **Phase 3** | `dashboard_responsive` | Mobile responsive audit cho ROI dashboard | After dashboard deploy |
| **Phase 4** | `compliance_checklist` | Verify compliance checklists 4 markets | After each market launch |
| **Phase 5** | `revenue_sharing_test` | E2E test auto-payout flow | Before investor portal launch |

### Tôm Hùm → CC CLI Command Routing

```
tasks/mission_ocop_*.txt → /binh-phap implement: <task> /cook
                              ↓
                  expect tom-hum-persistent-dispatch.exp
                              ↓
                  CC CLI --dangerously-skip-permissions
                              ↓
                  /tmp/tom_hum_mission_done → Archive
```

### Binh Pháp Auto-Tasks for ROIaaS

| Task | Chapter | Quality Gate |
|------|---------|--------------|
| `console_cleanup` | 軍形 | 0 console.log trong production code |
| `type_safety` | 謀攻 | 0 `any` types trong TypeScript |
| `a11y_audit` | 兵勢 | WCAG 2.1 AA cho dashboard |
| `security_headers` | 虛實 | CSP, HSTS, X-Frame-Options |
| `perf_audit` | 始計 | Lighthouse score >90 |
| `i18n_sync` | 地形 | EN/CN/JP/KR translation keys sync |

---

## MEKONG-CLI COMMAND MAPPING — Execution Protocol

> **第七篇 軍爭 (Jun Zheng) — Command Protocol**

### Complexity Routing per Phase

| Phase | Complexity | Command Sequence | Est. Time |
|-------|------------|------------------|-----------|
| **Phase 1** | SIMPLE | `/plan:fast` → `/cook` → `/test` | 4 weeks |
| **Phase 2** | MODERATE | `/plan:hard` → `/cook` → `/test` → `/review` | 6 weeks |
| **Phase 3** | MODERATE | `/plan:hard` → `/cook --parallel` → `/test:ui` | 5 weeks |
| **Phase 4** | COMPLEX | `/plan:parallel [4]` → `/cook phases` → `/review:codebase` | 8 weeks |
| **Phase 5** | COMPLEX | `/plan:parallel [3]` → `/cook phases` → `/test:e2e` | 6 weeks |

### Agent Teams Orchestration

```
Phase 1-2 (Simple Features):
  Sequential: planner → developer → tester → code-reviewer

Phase 3-5 (Complex Features):
  Parallel: researcher(China) + researcher(EU) + researcher(JP/KR)
            ↓
  planner → fullstack-developer(FE/BE) → tester(unit/integration)
```

### CC CLI Session Commands

| Command | Purpose | Phase |
|---------|---------|-------|
| `mekong cook "OCOP export agent"` | Full pipeline: Plan → Execute → Verify | Phase 1 |
| `mekong plan "AI matchmaking"` | Preview steps, no execution | Phase 2 |
| `mekong run roi-dashboard.md` | Execute existing recipe | Phase 3 |
| `mekong agent FileAgent read supabase/functions/` | Explore codebase | All |
| `mekong search "compliance checklist"` | Search recipes | Phase 4 |

---

## QUALITY GATES — Six Quality Fronts

> **第十篇 地形 (Di Xing) — Quality Gates**

### Enforcement per Phase

| Front | Gate | Criterion | Verification Command |
|-------|------|-----------|---------------------|
| **始計** | Tech Debt | 0 TODOs/FIXMEs | `grep -r "TODO\|FIXME" src/` |
| **作戰** | Type Safety | 0 `any` types | `grep -r ": any" src/` |
| **謀攻** | Performance | Build < 10s | `time python3 -m pytest` |
| **軍形** | Security | 0 high vulns | `npm audit --audit-level=high` |
| **兵勢** | UX | Loading states | Manual review + Lighthouse |
| **虛實** | Documentation | Updated README | Git diff check |

### Emergency Bypass

```bash
mekong run --skip-gates "roiaas-urgent"  # Only for critical hotfixes
```

---

---

## APPENDIX: FILE STRUCTURE

```
sadec-marketing-hub/
├── portal/
│   ├── ocop-exporter.html        # ✅ Export Agent UI
│   ├── ocop-dashboard.html       # Phase 3: Producer dashboard
│   └── ocop-investor.html        # Phase 5: Investor portal
├── supabase/
│   ├── functions/
│   │   ├── ocop-export-agent     # ✅ AI export generator
│   │   ├── ocop-matchmaker       # Phase 2: Buyer matching
│   │   ├── roi-calculator        # Phase 3: ROI engine
│   │   └── revenue-share         # Phase 5: Payout automation
│   └── migrations/
│       ├── 001_ocop_products.sql
│       ├── 002_ocop_matches.sql
│       └── 003_ocop_investments.sql
├── SPRINT/
│   ├── V4_ROADMAP.md             # Original V4 plan
│   ├── UPGRADE_BLUEPRINT_V3.md   # V3 architecture
│   └── OCOP_ROIAAS_PLAN.md       # ✅ THIS FILE
└── assets/
    └── js/
        └── ocop/
            ├── exporter.js       # Export form logic
            ├── dashboard.js      # Producer dashboard
            └── investor.js       # Investor portal
```

---

> **Document Version:** 2.0
> **Created:** 2026-03-13
> **Updated:** 2026-03-13 — Added Tôm Hùm Auto-CTO, MEKONG-CLI commands, Quality Gates
> **Owner:** Antigravity Strategic Planning
> **Status:** Ready for Execution

---

## CHANGELOG

### v2.0 (2026-03-13) — Binh Pháp Alignment Complete

**Added:**
- Tôm Hùm Auto-CTO Integration — 5 auto-tasks per phase
- MEKONG-CLI Command Mapping — Complexity routing per phase
- Agent Teams Orchestration — Sequential vs Parallel patterns
- Quality Gates — 6 fronts enforcement (始計, 作戰, 謀攻, 軍形, 兵勢, 虛實)
- CC CLI Session Commands — Direct mapping for each phase

**Updated:**
- 13 Chapters Mapping → Complete warfare framework
- ROIaaS Binh Pháp Matrix → Visual component coverage

### v1.0 (2026-03-13) — Initial Plan

- 5 Phases ROIaaS Roadmap
- Executive Summary + Financial Projections
- Binh Pháp Alignment (5 phases → 5 chapters)
- Lão Tử Alignment (Daoist philosophy)

---

*"Muốn đi nhanh thì đi một mình. Muốn đi xa thì đi cùng nhau."*
**OCOP Platform — Đưa Mekong ra thế giới.**

# 📋 Mekong Marketing Hub - Execution Rules

> **MANDATORY PROTOCOL** - Áp dụng cho MỌI tính năng/trang đang xây dựng

---

## 🎯 RULE #1: Binh Pháp Mapping Protocol

Mỗi module/page PHẢI được ánh xạ với ít nhất 1 chương trong 13 Chương Tôn Tử và 1 yếu tố Ngũ Sự.

### 13 Chương Ánh Xạ

| Chương | Tên | Business Mapping |
|:------:|-----|------------------|
| 1 | Kế Hoạch | Planning & Strategy modules |
| 2 | Tác Chiến | Resource allocation, Finance |
| 3 | Mưu Công | Proposals, Negotiation tools |
| 4 | Hình Thế | Positioning, Branding |
| 5 | Thế Trận | Campaign momentum, Pipeline |
| 6 | Hư Thực | Competitor analysis |
| 7 | Quân Tranh | Speed-to-market, Workflows |
| 8 | Cửu Biến | Adaptation, A/B testing |
| 9 | Hành Quân | Execution, Deployment |
| 10 | Địa Hình | Market segmentation |
| 11 | Cửu Địa | Crisis/Opportunity response |
| 12 | Hỏa Công | Disruption campaigns |
| 13 | Dụng Gián | Intelligence, Analytics |

### Ngũ Sự (5 Fundamental Factors)

| Factor | Ý Nghĩa | KPI |
|--------|---------|-----|
| ĐẠO | Stakeholder Alignment | NPS Score, Team Health |
| THIÊN | Timing & Market | Seasonality, Trend Index |
| ĐỊA | Competitive Position | Market Share, SOV |
| TƯỚNG | Leadership | Decision Speed, Initiative |
| PHÁP | Systems & Processes | Automation %, Quality Gate |

---

## 🔍 RULE #2: 100X Deep Check Protocol

Trước khi deploy bất kỳ feature nào, PHẢI pass 10 điểm kiểm tra:

```
[ ] 1. SEO: Title, Meta, H1, Semantic HTML
[ ] 2. Security: No hardcoded secrets, HTTPS only
[ ] 3. Auth Guard: Role-based access verified
[ ] 4. Responsive: Mobile/Tablet/Desktop tested
[ ] 5. Performance: LCP < 2.5s, FID < 100ms
[ ] 6. Accessibility: WCAG 2.1 AA compliance
[ ] 7. Data Binding: Supabase fallback to demo mode
[ ] 8. Console Clean: No console.log in production
[ ] 9. Domain Consistency: All links use production domain
[ ] 10. Binh Pháp: Module mapped to strategy framework
```

**Scoring: 10 points each = Max 100 → "100X Ready"**

---

## 📐 RULE #3: Page Structure Standards

### Required Template Structure

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <!-- SEO Required -->
    <title>[Page] - [Portal] | Mekong Agency</title>
    <meta name="description" content="...">
    
    <!-- M3 Design System -->
    <link rel="stylesheet" href="m3-agency.css">
    <link rel="stylesheet" href="[portal].css">
    
    <!-- Sidebar Component -->
    <script src="sadec-sidebar.js"></script>
</head>
<body>
    <div class="[portal]-layout">
        <sadec-sidebar active="[page-id]" role="[role]"></sadec-sidebar>
        <main class="main-content">
            <!-- Page Content -->
        </main>
    </div>
    
    <!-- Auth Scripts -->
    <script src="supabase-config.js"></script>
    <script src="auth.js"></script>
</body>
</html>
```

---

## 🚦 RULE #4: Deployment Gate

**KHÔNG deploy nếu:**
- [ ] Console.log còn trong code
- [ ] 404 errors trên sidebar
- [ ] Auth redirect không hoạt động
- [ ] Domain mismatch (localhost vs production)

---

## 📊 Page-to-Strategy Mapping Matrix

### Admin Portal (31 pages)

| Page | Binh Pháp Chương | Ngũ Sự |
|------|------------------|--------|
| dashboard | 1-Kế Hoạch | PHÁP |
| pipeline | 5-Thế Trận | ĐỊA |
| leads | 3-Mưu Công | ĐẠO |
| proposals | 3-Mưu Công | TƯỚNG |
| campaigns | 5-Thế Trận | THIÊN |
| content-calendar | 7-Quân Tranh | THIÊN |
| finance | 2-Tác Chiến | PHÁP |
| binh-phap | 1-13 All | All |
| workflows | 9-Hành Quân | PHÁP |
| agents | 13-Dụng Gián | PHÁP |
| ai-analysis | 13-Dụng Gián | ĐỊA |
| vc-readiness | 4-Hình Thế | ĐẠO |

### Affiliate Portal (7 pages)

| Page | Binh Pháp Chương | Ngũ Sự |
|------|------------------|--------|
| dashboard | 1-Kế Hoạch | ĐẠO |
| referrals | 5-Thế Trận | ĐỊA |
| commissions | 2-Tác Chiến | PHÁP |
| links | 7-Quân Tranh | PHÁP |
| media | 4-Hình Thế | THIÊN |
| profile | 4-Hình Thế | ĐẠO |
| settings | 8-Cửu Biến | PHÁP |

---

## 📝 Version History

| Date | Change | Author |
|------|--------|--------|
| 2026-01-27 | Initial creation | Antigravity |


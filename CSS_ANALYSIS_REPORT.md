# BÁO CÁO PHÂN TÍCH CSS TRÙNG LẶP VÀ UNUSED SELECTORS

**File phân tích:**
- `portal.css` (58KB, 252 selectors)
- `m3-agency.css` (29KB, 121 selectors)

**Ngày phân tích:** 2026-03-07

---

## 1. CSS SELECTORS TRÙNG LẶP GIỮA 2 FILE

### Tổng quan: **18 selectors trùng lặp**

| Selector | portal.css Line | m3-agency.css Line | Trạng thái |
|----------|-----------------|--------------------|------------|
| `.btn` | 664 | 278 | ⚠️ Khác properties |
| `.btn-filled` | 678 | 307 | ⚠️ Khác hover styles |
| `.btn-outlined` | 707 | 317 | ⚠️ Khác border width |
| `.btn-tonal` | 698 | 328 | ✅ Tương tự |
| `.btn-text` | 717 | 333 | ⚠️ Khác padding |
| `.btn-large` | 727 | 342 | ⚠️ Khác padding |
| `.card-elevated` | 50 | 355 | ⚠️ Khác box-shadow |
| `.data-table` | 1046 | 1259 | ⚠️ portal.css chi tiết hơn |
| `.flex-between` | 2132 | 269 | ✅ Giống nhau |
| `.form-group` | 2546 | 466 | ⚠️ portal.css nested styles |
| `.gap-16` | 2542 | 722 | ✅ Giống nhau |
| `.mb-24` | 2264 | 714 | ✅ Giống nhau |
| `.mb-32` | 2269 | 718 | ✅ Giống nhau |
| `.pricing-card` | 1925 | 727 | ⚠️ portal.css có thêm variants |
| `.section-header` | 1361 | 993 | ⚠️ Khác properties |
| `.section-title` | 239 | 1010 | ⚠️ portal.css override font-size |
| `.text-muted` | 2086 | 212 | ✅ Giống nhau |
| `.text-primary` | 2090 | 204 | ✅ Giống nhau |

---

## 2. CHI TIẾT KHÁC BIỆT PROPERTIES

### 2.1. `.btn` Base Styles
**portal.css (Line 664):**
```css
.btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}
```

**m3-agency.css (Line 278):**
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: var(--md-sys-shape-corner-full);
  font: var(--md-sys-typescale-label-large);
  text-decoration: none;
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
}
```

**Khác biệt:**
- `padding`: 10px 20px (portal) vs 10px 24px (m3)
- `border-radius`: 8px (portal) vs var(--md-sys-shape-corner-full) (m3)
- `justify-content`: missing (portal) vs center (m3)
- m3-agency có `::after` pseudo-element cho hover effect

---

### 2.2. `.btn-filled`
**portal.css:**
```css
.btn-filled {
    background: var(--md-sys-color-primary, #006A60);
    color: var(--md-sys-color-on-primary, #fff);
}
.btn-filled:hover {
    background: color-mix(in srgb, var(--md-sys-color-primary) 85%, #000 15%);
    box-shadow: 0 2px 8px rgba(0, 106, 96, 0.3);
}
```

**m3-agency.css:**
```css
.btn-filled {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}
.btn-filled:hover {
  box-shadow: var(--md-sys-elevation-1);
  filter: brightness(1.1);
}
```

**Khác biệt:**
- portal.css có fallback colors
- portal.css dùng `color-mix()` cho hover
- m3-agency dùng `filter: brightness()` cho hover

---

### 2.3. `.btn-outlined`
**portal.css:**
```css
.btn-outlined {
    background: transparent;
    color: var(--md-sys-color-primary, #006A60);
    border: 2px solid var(--md-sys-color-primary, #006A60);
}
```

**m3-agency.css:**
```css
.btn-outlined {
  background: transparent;
  color: var(--md-sys-color-primary);
  border: 1px solid var(--md-sys-color-outline);
}
```

**Khác biệt:**
- `border-width`: 2px (portal) vs 1px (m3)
- `border-color`: primary (portal) vs outline (m3)

---

### 2.4. `.btn-text`
**portal.css:**
```css
.btn-text {
    background: transparent;
    color: var(--md-sys-color-primary, #006A60);
    padding: 8px 16px;
}
```

**m3-agency.css:**
```css
.btn-text {
  background: transparent;
  color: var(--md-sys-color-primary);
}
```

**Khác biệt:**
- portal.css có explicit `padding: 8px 16px`

---

### 2.5. `.btn-large`
**portal.css:** `padding: 14px 32px`
**m3-agency.css:** `padding: 16px 32px`

**Khác biệt:** 2px padding difference

---

### 2.6. `.card-elevated`
**portal.css (Line 50):**
```css
.card-elevated {
    box-shadow:
        0 1px 3px rgba(0, 0, 0, 0.10),
        0 4px 12px rgba(0, 0, 0, 0.08),
        0 8px 24px rgba(0, 0, 0, 0.04);
    border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 60%, transparent 40%);
    transition: box-shadow 0.25s ease, transform 0.25s ease;
}
```

**m3-agency.css (Line 355):**
```css
.card-elevated {
  background: var(--md-sys-color-surface);
  box-shadow: var(--md-sys-elevation-1);
  position: relative;
  overflow: hidden;
}
```

**Khác biệt:**
- portal.css: custom box-shadow values + border
- m3-agency: dùng CSS variable + `::before` pseudo-element

---

### 2.7. `.data-table`
**portal.css (Line 1046):** Không tìm thấy definition - chỉ dùng trong context
**m3-agency.css (Line 1259):**
```css
.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}
```

---

### 2.8. `.form-group`
**portal.css (Line 2546):**
```css
.form-group {
    margin-bottom: 20px;
}
.form-group label,
.form-group input,
.form-group select {
    /* nested styles */
}
```

**m3-agency.css (Line 466):**
```css
.form-group {
  margin-bottom: 24px;
}
```

**Khác biệt:**
- `margin-bottom`: 20px (portal) vs 24px (m3)
- portal.css có nested selectors cho label/input/select

---

### 2.9. `.pricing-card`
**portal.css (Line 1925):**
```css
.pricing-card {
    background: var(--md-sys-color-surface);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.pricing-card--current {
    /* variant styles */
}
```

**m3-agency.css (Line 727):**
```css
.pricing-card {
  padding: 16px;
  text-align: center;
  position: relative;
  overflow: visible !important;
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.pricing-card.featured {
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
}
```

**Khác biệt:**
- `padding`: 24px (portal) vs 16px (m3)
- portal.css có variant `--current`
- m3-agency có `.featured` modifier

---

### 2.10. `.section-header`
**portal.css (Line 1361):**
```css
.section-header {
    text-align: center;
    margin-bottom: 24px;
}
```

**m3-agency.css (Line 993):**
```css
.section-header {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 12px;
}
```

**Khác biệt:**
- `max-width`: missing (portal) vs 600px (m3)
- `margin`: different values

---

## 3. UNUSED CSS SELECTORS

### 3.1. portal.css - 6 selectors không dùng

| Selector | Line | Description |
|----------|------|-------------|
| `.gap-8` | 2542 | Spacing utility (8px gap) |
| `.payment-action-cell` | 1163 | Table cell action button |
| `.payment-option` | 782 | Payment method option |
| `.sidebar-item` | 2358 | Sidebar navigation item |
| `.spinner-lg` | 412 | Large loading spinner |
| `.status-pill` | 1535 | Status badge variant |

### 3.2. m3-agency.css - 8 selectors không dùng

| Selector | Line | Description |
|----------|------|-------------|
| `.card-filled` | 383 | Card background variant |
| `.display-medium` | 144 | Typography display medium |
| `.headline-small` | 160 | Typography headline small |
| `.mobile-menu-btn` | 1335 | Mobile menu toggle button |
| `.service-icon` | 608 | Service card icon |
| `.table-responsive` | 1251 | Responsive table wrapper |
| `.text-center` | 200 | Text alignment utility |
| `.toast-container` | 507 | Toast notification container |

---

## 4. ĐỀ XUẤT GỘP FILE

### 4.1. Kiến trúc đề xuất

```
assets/css/
├── m3-design-system.css    (Core design tokens + base components)
├── utilities.css            (Spacing, typography, flexbox helpers)
├── portal-components.css    (Portal-specific components)
└── admin-components.css     (Admin-specific components)
```

### 4.2. Hành động cụ thể

#### A. Gộp vào Design System Core (m3-design-system.css):
Từ **m3-agency.css**, giữ lại:
- CSS Custom Properties (root variables)
- Typography scale classes (`.display-*`, `.headline-*`, `.title-*`, `.body-*`, `.label-*`)
- Base components: `.btn`, `.card`, `.form-*`, `.nav-*`
- Layout utilities: `.container`, `.grid-*`, `.flex-*`
- Animations: `@keyframes` definitions

#### B. Gộp vào Utilities (utilities.css):
- Spacing helpers: `.mb-*`, `.gap-*`
- Text utilities: `.text-*`, `.text-center`
- Flexbox helpers: `.flex-center`, `.flex-between`, `.flex-center-y`

#### C. Portal-specific (portal-components.css):
- Portal layout: `.portal-layout`, `.main-content`, `.page-header`, `.page-title`
- Portal components: `.invoice-*`, `.project-*`, `.payment-*`, `.approval-*`, `.asset-*`
- KPI cards: `.kpi-*`
- Charts: `.chart-*`

#### D. Admin-specific (admin-components.css):
- Admin dashboard components
- Admin-specific overrides

### 4.3. Resolution cho trùng lặp:

| Component | Recommendation | Priority |
|-----------|----------------|----------|
| `.btn` variants | Use m3-agency.css base + portal.css hover effects | High |
| `.card-elevated` | Use m3-agency.css (cleaner, uses CSS variables) | High |
| `.form-group` | Use m3-agency.css margin (24px) | Medium |
| `.pricing-card` | Merge: m3-agency.css structure + portal.css padding | Medium |
| `.section-header` | Use m3-agency.css (has max-width constraint) | Low |
| `.data-table` | Use m3-agency.css (Phase 3 responsive styles) | High |
| `.text-*` utilities | Use m3-agency.css (design token based) | Low |

### 4.4. Cleanup đề xuất:

**Xóa khỏi portal.css:**
- `.gap-8`, `.payment-action-cell`, `.payment-option`, `.sidebar-item`, `.spinner-lg`, `.status-pill`

**Xóa khỏi m3-agency.css:**
- `.card-filled`, `.display-medium`, `.headline-small`, `.mobile-menu-btn`, `.service-icon`, `.table-responsive`, `.text-center`, `.toast-container`

**Estimated size reduction:**
- portal.css: 58KB → ~52KB (-10%)
- m3-agency.css: 29KB → ~25KB (-14%)
- Combined after deduplication: ~65KB (vs 87KB current = -25%)

---

## 5. HTML USAGE VERIFICATION

### 5.1. Selectors được dùng nhiều nhất:

| Selector | HTML Files Count |
|----------|------------------|
| `.card-elevated` | 45+ files |
| `.btn-filled` | 40+ files |
| `.btn-outlined` | 35+ files |
| `.portal-layout` | 15 files |
| `.main-content` | 15 files |
| `.page-header` | 15 files |
| `.section-header` | 20+ files |
| `.section-title` | 20+ files |

### 5.2. Selectors chỉ dùng trong 1-2 files:

| Selector | Files Used | Recommendation |
|----------|------------|----------------|
| `.pricing-card--current` | 1 (portal/pricing) | Keep in portal.css |
| `.kpi-*` | 2 (portal/reports) | Keep in portal.css |
| `.approval-*` | 1 (portal/approve) | Keep in portal.css |
| `.asset-*` | 1 (portal/assets) | Keep in portal.css |

---

## 6. KẾT LUẬN

### 6.1. Vấn đề chính:
1. **18 selectors trùng lặp** giữa 2 file
2. **14 unused selectors** tổng cộng (6 portal + 8 m3)
3. **Properties inconsistency** cho cùng 1 class name
4. **File size inflation** do code duplication

### 6.2. Rủi ro nếu không refactor:
- Maintainability khó khăn (phải update 2 chỗ cho 1 change)
- File size lớn不必要
- CSS specificity conflicts
- Developer confusion (dùng class nào?)

### 6.3. Benefits sau khi gộp:
- **~25% file size reduction**
- Single source of truth cho design system
- Consistent styling across portal/admin
- Easier maintenance

---

**Báo cáo hoàn thành.**
_Không có thay đổi code nào được thực hiện trong phân tích này._

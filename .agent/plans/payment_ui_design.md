# 📋 Kế Hoạch Thiết Kế UI Thanh Toán

**Dự án:** Mekong Marketing Hub  
**Ngày:** 2026-02-03  
**Design System:** M3 Agency (Material Design 3)

---

## 🎯 Mục Tiêu

Thiết kế và tích hợp tính năng thanh toán vào các trang hiện có, đảm bảo:
1. **Nhất quán** với M3 Design System hiện tại
2. **UX mượt mà** - Luồng thanh toán trực quan, ít bước
3. **Responsive** - Hoạt động tốt trên mobile/tablet/desktop
4. **Đa cổng** - Hỗ trợ PayOS, VNPay, MoMo

---

## 📁 Các Trang Cần Cập Nhật

### 1. `index.html` - Landing Page (Homepage)
**Vị trí:** Pricing Section (#pricing)

**Thay đổi:**
- Thêm nút "Thanh toán ngay" bên cạnh "Bắt đầu ngay" trong mỗi pricing card
- Khi click → Modal thanh toán xuất hiện (không redirect)
- Modal hiển thị gói, số tiền, gateway selector, submit button

### 2. `portal/dashboard.html` - Client Dashboard
- Stat card "Hóa đơn chờ thanh toán" → Clickable link
- Quick Pay button trong header
- Payment activity in feed

### 3. `portal/invoices.html` - Danh sách Hóa đơn
- Nút "Thanh toán" cho mỗi invoice
- Bulk select + Pay multiple
- Status chip: Paid | Pending | Overdue

### 4. `portal/payments.html` - ✅ Đã có
- Payment history table
- Pending transactions section
- Receipt download

### 5. `portal/payment-result.html` - ✅ Đã có
- Download receipt button
- Share transaction

### 6. `portal/subscriptions.html`
- Renewal payment flow
- Upgrade plan with payment
- Auto-renewal toggle

---

## 🎨 Design Tokens

```css
/* Payment Status Colors */
--payment-success: #34C759;
--payment-pending: #FF9500;
--payment-failed: #FF3B30;

/* Gateway Brand Colors */
--gateway-payos: #00C853;
--gateway-vnpay: #005BAA;
--gateway-momo: #A50064;
```

---

## 🔧 Implementation Phases

### Phase 1: Shared Components (3-4 hours)
- `assets/js/components/payment-modal.js`
- `assets/js/components/gateway-selector.js`
- `assets/js/components/payment-status-chip.js`
- Payment CSS tokens

### Phase 2: Homepage Integration (2 hours)
- Update Pricing section
- Payment modal integration

### Phase 3: Portal Dashboard (2 hours)
- Clickable stat card
- Quick pay button
- Payment activity

### Phase 4: Invoices Page (3 hours)
- Payment action column
- Bulk payment
- Status chips

### Phase 5: Subscriptions Page (2 hours)
- Renewal flow
- Upgrade flow

### Phase 6: Polish & Test (2 hours)
- Cross-browser
- Mobile responsive
- A11y check

---

## ✅ Acceptance Criteria

- [ ] M3 Design System compliant
- [ ] Gateway logos display correctly
- [ ] Smooth animations
- [ ] Loading states with spinner
- [ ] Error handling with toast
- [ ] Mobile-friendly (min 44px touch targets)
- [ ] Keyboard navigation
- [ ] Screen reader accessible

---

## 📊 Files

### New Files
```
assets/js/components/payment-modal.js
assets/js/components/gateway-selector.js
assets/js/components/payment-status-chip.js
assets/css/payment.css
```

### Modified Files
```
index.html
portal/dashboard.html
portal/invoices.html
portal/subscriptions.html
assets/css/m3-agency.css
```

---

Reply "go phase X" để thực thi phase tương ứng.

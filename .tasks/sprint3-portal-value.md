# Sprint 3: Portal Value — Implementation Plan

## Mục tiêu
Biến Client Portal từ shell có static data → portal thật với dữ liệu live từ Supabase. Sau sprint này, client đăng nhập sẽ thấy dashboard thật, hóa đơn thật, và workflow duyệt nội dung.

## Hiện trạng codebase

| File | Trạng thái | Vấn đề |
|------|-----------|--------|
| `portal/dashboard.html` | Static HTML | Stats hardcode (5, 12.5K, 234, 2), không gọi API |
| `portal/invoices.html` | Có integration | Dùng `DEMO_INVOICES` fallback, cần wire real |
| `portal/approve.html` | Có integration | Cần kết nối campaigns table |
| `portal/projects.html` | Static | Không gọi API |
| `portal/reports.html` | Có skeleton | Cần generate PDF |
| `assets/js/portal-client.js` | `loadDashboard()` stub | Chỉ log demo mode, không update DOM |
| `assets/js/supabase.js` | Đầy đủ CRUD | projects, invoices, campaigns modules ready |
| `supabase/functions/verify-user-role` | Deployed | Có sẵn nhưng chưa dùng client-side |

## 5 CCC Sessions

---

### Session A: Dashboard Live Data (⭐ Priority 1)

**Mục tiêu:** Wire `loadDashboard()` để fetch real stats từ Supabase và update DOM

#### CCC Command (copy-paste vào VS Code terminal):

```bash
claude "Sprint 3 Session A — Dashboard Live Data.

ĐỌC portal/dashboard.html VÀ assets/js/portal-client.js để hiểu cấu trúc.

THỰC HIỆN:

1. SỬA assets/js/portal-client.js — function loadDashboard():
   - Khi user logged in (NOT demo mode):
     a. Fetch projects count: supabase.from('projects').select('id, status').eq('client_id', clientId)
     b. Fetch invoices pending: supabase.from('invoices').select('id, status').eq('client_id', clientId).eq('status', 'pending')
     c. Fetch campaigns reach: supabase.from('campaigns').select('reach, leads_generated').eq('client_id', clientId)
   - clientId lấy từ: supabase.from('clients').select('id').eq('user_id', user.id).single()
   - Update DOM elements:
     * Tìm tất cả .stat-value elements theo thứ tự: [0]=active projects, [1]=total reach, [2]=leads, [3]=pending invoices
     * Tìm .stat-trend elements và update % dựa trên last 30 days vs previous 30 days
   - Nếu không có data → hiện empty state: 'Chưa có dữ liệu. Hãy liên hệ đội ngũ marketing.'

2. SỬA portal/dashboard.html:
   - Thêm id cho stat-value elements: id='stat-projects', id='stat-reach', id='stat-leads', id='stat-invoices'
   - Thêm loading skeleton cho mỗi stat card khi đang fetch
   - Recent activities section: fetch từ activities table, limit 5, order by created_at desc
   - Upcoming deadlines section: fetch từ projects where deadline > now(), order by deadline asc, limit 3

3. GIT:
   git add portal/dashboard.html assets/js/portal-client.js
   git commit -m 'feat(sprint3): dashboard live data integration'
   git push origin main

QUAN TRỌNG: 
- KHÔNG sửa file nào khác
- Giữ nguyên demo mode fallback
- Handle error gracefully — nếu query fail thì show static data" --allowedTools "Edit,Write,Read,Bash(git*),Bash(grep*),Bash(find*),Bash(cat*)"
```

---

### Session B: Invoices Real Data (⭐ Priority 1)

**Mục tiêu:** Invoices page fetch + render từ Supabase, có filter/search

```bash
claude "Sprint 3 Session B — Invoices Live Data.

ĐỌC portal/invoices.html VÀ assets/js/portal-client.js (function loadInvoices, renderInvoices) để hiểu.

THỰC HIỆN:

1. SỬA assets/js/portal-client.js — function loadInvoices():
   - Khi user logged in:
     a. Lấy clientId: supabase.from('clients').select('id').eq('user_id', user.id).single()
     b. Fetch invoices: supabase.from('invoices').select('*').eq('client_id', clientId).order('created_at', { ascending: false })
     c. renderInvoices với data thật
   - Đảm bảo payInvoiceOnline() hoạt động — gọi create-payos-payment edge function
   - updateInvoiceStats() update badge counts (pending/paid/overdue)

2. SỬA portal/invoices.html:
   - Thêm empty state khi không có invoices: icon receipt_long + 'Chưa có hóa đơn nào'
   - Thêm filter chips: Tất cả | Chờ thanh toán | Đã thanh toán | Quá hạn
   - Loading skeleton cho table rows
   - Badge đỏ cho invoices quá hạn (due_date < today AND status != 'paid')

3. GIT:
   git add portal/invoices.html assets/js/portal-client.js
   git commit -m 'feat(sprint3): invoices live data + filters'
   git push origin main

QUAN TRỌNG: Giữ demo mode fallback, không sửa file khác" --allowedTools "Edit,Write,Read,Bash(git*),Bash(grep*),Bash(find*),Bash(cat*)"
```

---

### Session C: Route Guard + Auth Middleware (⭐ Priority 1)

**Mục tiêu:** Bảo vệ portal pages — redirect về login nếu chưa auth

```bash
claude "Sprint 3 Session C — Route Guard cho portal pages.

ĐỌC assets/js/supabase.js và portal/login.html để hiểu auth flow.

THỰC HIỆN:

1. TẠO assets/js/portal-guard.js:
   - Import supabase từ supabase.js
   - Immediately-invoked: check supabase.auth.getUser()
   - Nếu không có user → redirect '/portal/login.html?redirect=' + encodeURIComponent(window.location.pathname)
   - Nếu có user → check role từ user_metadata.role
   - Nếu role !== 'client' → redirect '/auth/login.html' với error param
   - Export: { currentUser, clientId }
   - Thêm event listener onAuthStateChange: nếu SIGNED_OUT → redirect login

2. SỬA portal/login.html:
   - Sau login thành công: check urlParams.get('redirect')
   - Nếu có redirect param → redirect tới đó
   - Nếu không → redirect '/portal/dashboard.html'

3. THÊM guard vào TẤT CẢ portal pages (NGOẠI TRỪ login.html, payment-result.html, onboarding.html):
   - Thêm dòng: <script type='module' src='../assets/js/portal-guard.js'></script>
   - Đặt TRƯỚC portal-client.js import
   - Danh sách files cần sửa:
     * portal/dashboard.html
     * portal/invoices.html
     * portal/projects.html
     * portal/approve.html
     * portal/reports.html
     * portal/assets.html
     * portal/payments.html
     * portal/subscriptions.html

4. GIT:
   git add assets/js/portal-guard.js portal/
   git commit -m 'feat(sprint3): route guard for portal pages'
   git push origin main

QUAN TRỌNG: 
- Localhost dev mode: nếu isLocalhost thì SKIP guard (cho phép demo)
- KHÔNG sửa admin/ pages
- KHÔNG sửa portal/login.html layout, chỉ sửa redirect logic" --allowedTools "Edit,Write,Read,Bash(git*),Bash(grep*),Bash(find*),Bash(cat*)"
```

---

### Session D: Content Approval Workflow (Priority 2)

**Mục tiêu:** `approve.html` hiện nội dung cần duyệt từ campaigns table

```bash
claude "Sprint 3 Session D — Content Approval Workflow.

ĐỌC portal/approve.html để hiểu layout.

THỰC HIỆN:

1. SỬA portal/approve.html:
   - Fetch campaigns where client_id = currentClientId AND status = 'pending_approval'
   - Mỗi campaign card hiện: tên, ngày tạo, loại (Facebook/Zalo/TikTok), preview content
   - 2 action buttons: ✅ Duyệt (update status='approved') và ❌ Từ chối (update status='rejected' + comment field)
   - Khi duyệt/từ chối: update supabase campaigns table
   - Empty state: 'Không có nội dung cần duyệt' với icon check_circle
   - Badge count trên sidebar menu item

2. SỬA assets/js/portal-client.js:
   - Thêm function approveCampaign(campaignId)
   - Thêm function rejectCampaign(campaignId, reason)
   - Cả 2 update campaigns table status + feedback_at timestamp

3. GIT:
   git add portal/approve.html assets/js/portal-client.js
   git commit -m 'feat(sprint3): content approval workflow'
   git push origin main" --allowedTools "Edit,Write,Read,Bash(git*),Bash(grep*),Bash(find*),Bash(cat*)"
```

---

### Session E: Deploy + Verify (Priority 1)

```bash
claude "Sprint 3 Final — Deploy + Verify.

1. DEPLOY:
   npx vercel --prod --yes

2. VERIFY bằng grep:
   - Tất cả portal/*.html (trừ login, payment-result, onboarding) có portal-guard.js import
   - dashboard.html có stat- id elements
   - invoices.html có empty state
   - portal-client.js loadDashboard() có supabase.from queries

3. GIT final tag:
   git tag v2.0-sprint3
   git push --tags

Report kết quả." --allowedTools "Read,Bash(git*),Bash(grep*),Bash(find*),Bash(cat*),Bash(npx vercel*)"
```

---

## Thứ tự chạy

```
Session A → Session B → Session C → Session D → Session E
  (có thể chạy A+B song song nếu muốn nhanh)
```

## Verification Plan

### Automated
- `grep -r 'portal-guard' portal/` → 8 files có import
- `grep 'stat-projects\|stat-reach\|stat-leads\|stat-invoices' portal/dashboard.html` → 4 IDs
- `grep 'loadDashboard\|supabase.from' assets/js/portal-client.js` → có queries thật

### Manual (cần anh test)
- Login portal → dashboard hiện stats thật (hoặc empty state)
- Invoices page → filter hoạt động
- Truy cập portal page khi chưa login → redirect về login
- Content approve page → hiện campaigns pending

## Sprint 2 Remaining (deferred)
- ⬜ Welcome email → cần setup Resend/SendGrid (Sprint 4)

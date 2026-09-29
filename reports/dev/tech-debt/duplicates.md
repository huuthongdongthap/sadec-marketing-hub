# Duplicate Code Detection Report

**Generated:** 2026-03-14T05:51:40.978Z
**Files Scanned:** 262
**Duplicate Clusters:** 28

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total JS Files | 262 |
| Code Blocks Analyzed | 262 |
| Duplicate Clusters Found | 28 |
| Estimated Redundant Lines | 4657 |

---

## 🔁 Duplicate Code Clusters

### Cluster #1 (4 similar blocks)

**Files:** assets/js/admin/admin-campaigns.js, assets/js/admin/admin-clients.js, assets/js/admin/admin-leads.js, assets/js/features/quick-notes/notes-renderer.js

#### assets/js/admin/admin-campaigns.js:26
```javascript
export function showCampaignDetail(campaign) {
    const platformIcons = {
        facebook: { icon: 'thumb_up', color: '#1877F2', bg: '#E3F2FD' },
        google: { icon: 'search', color: '#34A853', 
```

#### assets/js/admin/admin-clients.js:195
```javascript
export function showClientDetail(client) {
    const statusLabels = {
        active: { text: 'Đang hoạt động', class: 'active' },
        paused: { text: 'Tạm dừng', class: 'paused' },
        inacti
```

#### assets/js/admin/admin-leads.js:25
```javascript
export function showLeadDetail(lead) {
    const tempLabels = {
        hot: { text: 'Hot', bg: '#FFEBEE', color: '#C62828' },
        warm: { text: 'Warm', bg: '#FFF3E0', color: '#EF6C00' },
        
```

#### assets/js/features/quick-notes/notes-renderer.js:19
```javascript
export function renderNote(note, index) {
    const color = COLORS.find(c => c.value === note.color) || COLORS[0];
    const date = new Date(note.updatedAt).toLocaleDateString('vi-VN', {
        day: 
```

**Recommendation:** Extract into shared utility function

---

### Cluster #2 (11 similar blocks)

**Files:** assets/js/admin/admin-ux-enhancements.js, assets/js/admin/keyboard-shortcuts.js, assets/js/admin/notification-bell.js, assets/js/admin/notification-panel.js, assets/js/admin/skeleton-loader.js, assets/js/features/activity-timeline.js, assets/js/features/dark-mode.js, assets/js/features/keyboard-shortcuts.js, assets/js/features/quick-notes/notes-styles.js, assets/js/services/toast-notification.js, assets/js/utils/back-to-top.js

#### assets/js/admin/admin-ux-enhancements.js:314
```javascript
function injectStyles() {
    const styles = document.createElement('style');
    styles.id = 'admin-ux-enhancements-styles';
    styles.textContent = `
      /* Dark Mode Toggle */
      .dark-mode-t
```

#### assets/js/admin/keyboard-shortcuts.js:320
```javascript
export function injectKeyboardShortcutsStyles() {
  if (document.getElementById('keyboard-shortcuts-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'keyboard-shortcu
```

#### assets/js/admin/notification-bell.js:340
```javascript
function injectStyles() {
    const styles = document.createElement('style');
    styles.id = 'notification-bell-styles';
    styles.textContent = `
      /* Notification Bell */
      .notification-b
```

#### assets/js/admin/notification-panel.js:191
```javascript
export function injectNotificationStyles() {
  if (document.getElementById('notification-bell-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'notification-bell-styl
```

#### assets/js/admin/skeleton-loader.js:188
```javascript
export function injectSkeletonLoaderStyles() {
  if (document.getElementById('skeleton-loader-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'skeleton-loader-styles
```

#### assets/js/features/activity-timeline.js:415
```javascript
function addStyles() {
    if (document.getElementById('activity-timeline-styles')) return;

    const style = document.createElement('style');
    style.id = 'activity-timeline-styles';
    style.tex
```

#### assets/js/features/dark-mode.js:90
```javascript
function addStyles() {
    if (document.getElementById('dark-mode-toggle-styles')) return;

    const style = document.createElement('style');
    style.id = 'dark-mode-toggle-styles';
    style.textC
```

#### assets/js/features/keyboard-shortcuts.js:489
```javascript
function addStyles() {
    if (document.getElementById('keyboard-shortcuts-styles')) return;

    const style = document.createElement('style');
    style.id = 'keyboard-shortcuts-styles';
    style.t
```

#### assets/js/features/quick-notes/notes-styles.js:14
```javascript
export function addWidgetStyles() {
    if (document.getElementById('quick-notes-styles')) return;

    const style = document.createElement('style');
    style.id = 'quick-notes-styles';
    style.te
```

#### assets/js/services/toast-notification.js:241
```javascript
function addToastStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .toast-container {
      position: fixed;
      z-index: 999999;
      display: flex;
      fle
```

#### assets/js/utils/back-to-top.js:19
```javascript
function createButton() {
    if (button) return;

    button = document.createElement('button');
    button.className = 'back-to-top';
    button.innerHTML = `
        <span class="material-symbols-o
```

**Recommendation:** Extract into shared utility function

---

### Cluster #3 (2 similar blocks)

**Files:** assets/js/core/theme-manager.js, assets/js/core/user-preferences.js

#### assets/js/core/theme-manager.js:176
```javascript
export function onChange(callback) {
    _listeners.push(callback);
    return () => {
        const index = _listeners.indexOf(callback);
        if (index > -1) {
            _listeners.splice(index
```

#### assets/js/core/user-preferences.js:256
```javascript
export function onChange(callback) {
    _listeners.push(callback);
    return () => {
        const index = _listeners.indexOf(callback);
        if (index > -1) {
            _listeners.splice(index
```

**Recommendation:** Extract into shared utility function

---

### Cluster #4 (2 similar blocks)

**Files:** assets/js/features/activity-timeline.js, assets/js/features/keyboard-shortcuts.js

#### assets/js/features/activity-timeline.js:385
```javascript
function showToast(message) {
    let toast = document.getElementById('activity-toast');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'activity-toast';
        
```

#### assets/js/features/keyboard-shortcuts.js:459
```javascript
function showToast(message) {
    let toast = document.getElementById('shortcut-toast');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'shortcut-toast';
        
```

**Recommendation:** Extract into shared utility function

---

### Cluster #5 (6 similar blocks)

**Files:** assets/js/finance.js, assets/js/mvp-launch.js, assets/js/pipeline.js, assets/js/services/legal.js, assets/js/services/retention.js, assets/js/services/video.js

#### assets/js/finance.js:118
```javascript
function createDemoFinance(manager) {
    manager.addTransaction({ type: 'revenue', category: 'revenue', amount: 50000000, description: 'Website project', client: 'ABC Corp' });
    manager.addTransac
```

#### assets/js/mvp-launch.js:118
```javascript
function createDemoMVP(manager) {
    const project = manager.createProject({ name: 'Mekong SaaS Platform', description: 'All-in-one agency management platform' });
    project.startPhase(0);
    proj
```

#### assets/js/pipeline.js:91
```javascript
function createDemoPipeline(manager) {
    manager.addDeal({ name: 'Website Redesign', company: 'ABC Corp', value: 50000000, stage: 'proposal' });
    manager.addDeal({ name: 'Social Media Package', c
```

#### assets/js/services/legal.js:122
```javascript
function createDemoLegal(manager) {
    const c1 = manager.createContract({ type: 'service', title: 'Marketing Services Agreement', party: 'ABC Corp', value: 120000000 });
    c1.sendForReview(); c1.s
```

#### assets/js/services/retention.js:97
```javascript
function createDemoRetention(manager) {
    manager.addClient({ name: 'ABC Corp', company: 'ABC', mrr: 15000000, npsScore: 9, usageRate: 85 });
    manager.addClient({ name: 'XYZ Shop', company: 'XYZ'
```

#### assets/js/services/video.js:122
```javascript
function createDemoVideo(manager) {
    const v1 = manager.createProject({ title: 'Agency Promo Video', type: 'promo', client: 'Internal', duration: 60 });
    v1.advanceStage(); v1.advanceStage(); v1
```

**Recommendation:** Extract into shared utility function

---

### Cluster #6 (4 similar blocks)

**Files:** assets/js/portal/portal-dashboard.js, assets/js/portal/portal-payments.js, assets/js/portal/portal-ui.js

#### assets/js/portal/portal-dashboard.js:252
```javascript
function getActivityIcon(type) {
    const icons = {
        'project': '📁',
        'invoice': '💰',
        'campaign': '📢',
        'lead': '👤',
        'payment': '💳',
        'update': '🔄'
 
```

#### assets/js/portal/portal-payments.js:213
```javascript
function getStatusLabel(status) {
    const labels = {
        'pending': 'Chưa thanh toán',
        'partial': 'Thanh toán một phần',
        'paid': 'Đã thanh toán',
        'cancelled': 'Đã hủy',
 
```

#### assets/js/portal/portal-ui.js:138
```javascript
function getStatusLabel(status) {
    const labels = {
        'active': 'Đang chạy',
        'paused': 'Tạm dừng',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy',
        'pending':
```

#### assets/js/portal/portal-ui.js:152
```javascript
function getTypeIcon(type) {
    const icons = {
        'ads': '📢',
        'seo': '🔍',
        'design': '🎨',
        'social': '📱',
        'website': '💻',
        'consulting': '💼'
    };
  
```

**Recommendation:** Extract into shared utility function

---

### Cluster #7 (31 similar blocks)

**Files:** assets/js/services/customer-success.js, assets/js/services/events.js, assets/js/services/hr-hiring.js, assets/js/services/lms.js, assets/js/services/proposals.js, assets/js/services/ui-utils.js, assets/js/services/vc-readiness.js, assets/js/shared/api-client.js, assets/js/shared/api-utils.js, assets/js/shared/api.js, assets/js/shared/dom-utils.js, assets/js/shared/format-utils.js, assets/js/ui-enhancements-2026.js, assets/js/utils/api.js, assets/js/utils/clipboard.js, assets/js/utils/export-utils.js, assets/js/utils/share.js, assets/js/utils/skeleton.js, assets/js/widgets/chart-animations.js, admin/widgets/chart-animations.js

#### assets/js/services/customer-success.js:274
```javascript
function createDemoCustomers(manager) {
    const customers = [
        { name: 'Công ty ABC', company: 'ABC Corp', email: 'abc@email.com', plan: 'premium', mrr: 15000000, usage: 90, engagement: 85, s
```

#### assets/js/services/events.js:360
```javascript
function createDemoEvents(manager) {
    // Create demo event
    const event1 = manager.createEvent({
        title: 'Agency Automation Masterclass',
        description: 'Học cách tự động hóa quy tr
```

#### assets/js/services/events.js:409
```javascript
function formatEventDate(date, time) {
    const d = new Date(`${date}T${time}:00`);
    return d.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit
```

#### assets/js/services/hr-hiring.js:115
```javascript
function createDemoHR(manager) {
    const c1 = manager.addCandidate({ name: 'Nguyễn Văn A', email: 'a@email.com', position: 'developer', source: 'LinkedIn' });
    c1.moveStage('interview'); c1.addSc
```

#### assets/js/services/lms.js:140
```javascript
function createDemoLMS(manager) {
    // Create courses
    const course1 = manager.createCourse({
        title: 'Facebook Ads Mastery',
        description: 'Learn to create high-converting Facebook
```

#### assets/js/services/proposals.js:97
```javascript
function createDemoProposals(manager) {
    const p1 = manager.create({ clientName: 'ABC Corp', clientEmail: 'abc@email.com', template: 'website', discount: 10 });
    p1.send(); p1.markViewed(); p1.a
```

#### assets/js/services/ui-utils.js:150
```javascript
export function showSkeletonGrid(container, count = 6, options = {}) {
  container.innerHTML = '';
  container.style.display = 'grid';
  container.style.gridTemplateColumns = 'repeat(auto-fill, minmax
```

#### assets/js/services/vc-readiness.js:98
```javascript
function createDemoVCReadiness(tracker) {
    tracker.updateMetric('arr', 800000000);
    tracker.updateMetric('mrr', 70000000);
    tracker.updateMetric('growth', 12);
    tracker.updateMetric('nrr',
```

#### assets/js/shared/api-client.js:178
```javascript
export function statusBadge(status, colorMap) {
  const colors = colorMap[status] || { bg: '#eee', color: '#333' };
  const label = status?.toUpperCase() || 'N/A';
  return `<span style="padding: 4px 
```

#### assets/js/shared/api-utils.js:104
```javascript
export async function postJSON(url, data = {}) {
    return fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}
```

#### assets/js/shared/api-utils.js:117
```javascript
export async function putJSON(url, data = {}) {
    return fetchWithAuth(url, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}
```

#### assets/js/shared/api-utils.js:130
```javascript
export async function patchJSON(url, data = {}) {
    return fetchWithAuth(url, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
}
```

#### assets/js/shared/api-utils.js:262
```javascript
export function handleApiError(error, context = '') {

    return {
        success: false,
        error: {
            message: error.message || 'An unexpected error occurred',
            code: err
```

#### assets/js/shared/api-utils.js:281
```javascript
export async function withRetry(fn, maxRetries = 3, delayMs = 1000) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error
```

#### assets/js/shared/api.js:103
```javascript
export function apiPost(endpoint, data = {}, headers = {}) {
    return apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
        headers
    });
}
```

#### assets/js/shared/api.js:116
```javascript
export function apiPut(endpoint, data = {}) {
    return apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}
```

#### assets/js/shared/api.js:300
```javascript
export function statusBadge(status, colorMap) {
    const colors = colorMap[status] || { bg: '#eee', color: '#333' };
    const label = status?.toUpperCase() || 'N/A';
    return `<span style="padding
```

#### assets/js/shared/dom-utils.js:295
```javascript
export function getOffset(el) {
  if (!el) return { top: 0, left: 0 };
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top + window.pageYOffset,
    left: rect.left + window.pageXO
```

#### assets/js/shared/dom-utils.js:309
```javascript
export function scrollIntoView(el, options = { behavior: 'smooth', block: 'start' }) {
  if (el) {
    el.scrollIntoView(options);
  }
}
```

#### assets/js/shared/format-utils.js:17
```javascript
export function formatCurrencyCompact(amount, currency = 'VND') {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currency,
        notation: 'compact'
    }).
```

#### assets/js/shared/format-utils.js:76
```javascript
export function formatRelativeTime(dateString) {
    if (!dateString) return '';

    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);

    const intervals = {
        year: 315
```

#### assets/js/ui-enhancements-2026.js:180
```javascript
function showToast(message, options = {}) {
    const {
        type = 'info',
        duration = 3000,
        position = 'top-right'
    } = options;

    const toast = document.createElement('div')
```

#### assets/js/utils/api.js:103
```javascript
export function apiPost(endpoint, data = {}, headers = {}) {
    return apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
        headers
    });
}
```

#### assets/js/utils/api.js:116
```javascript
export function apiPut(endpoint, data = {}) {
    return apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}
```

#### assets/js/utils/clipboard.js:125
```javascript
export async function copyUrl(options = {}) {
    return copyToClipboard(window.location.href, {
        successMessage: 'Đã sao chép link!',
        ...options
    });
}
```

#### assets/js/utils/export-utils.js:50
```javascript
export async function exportToPDF(target, filename = 'export', options = {}) {
  const { orientation = 'portrait', format = 'a4', title = '', margin = 20 } = options;

  try {
    const { jsPDF } = aw
```

#### assets/js/utils/share.js:50
```javascript
export async function sharePage(options = {}) {
    const {
        title = document.title,
        text = document.querySelector('meta[name="description"]')?.content || '',
        url = window.locat
```

#### assets/js/utils/skeleton.js:117
```javascript
export function showSkeleton(target, type = 'text', options = {}) {
    injectStyles();

    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) {
        Log
```

#### assets/js/utils/skeleton.js:165
```javascript
export async function withSkeleton(fn, target, options = {}) {
    const { type = 'text', count = 1 } = options;

    showSkeleton(target, type, { count });

    try {
        const result = await fn(
```

#### assets/js/widgets/chart-animations.js:71
```javascript
export function exportChart(chartInstance, filename = 'chart-export.png', options = {}) {
    if (!chartInstance) {
        Logger.error('Export failed: Chart instance not found');
        return;
   
```

#### admin/widgets/chart-animations.js:71
```javascript
export function exportChart(chartInstance, filename = 'chart-export.png', options = {}) {
    if (!chartInstance) {
        Logger.error('Export failed: Chart instance not found');
        return;
   
```

**Recommendation:** Extract into shared utility function

---

### Cluster #8 (2 similar blocks)

**Files:** assets/js/services/enhanced-utils.js, assets/js/utils/string.js

#### assets/js/services/enhanced-utils.js:99
```javascript
export function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
```

#### assets/js/utils/string.js:62
```javascript
export function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
```

**Recommendation:** Extract into shared utility function

---

### Cluster #9 (2 similar blocks)

**Files:** assets/js/shared/api-client.js, assets/js/shared/api.js

#### assets/js/shared/api-client.js:124
```javascript
export function onReady(initFn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFn);
  } else {
    initFn();
  }
}
```

#### assets/js/shared/api.js:246
```javascript
export function onReady(initFn) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFn);
    } else {
        initFn();
    }
}
```

**Recommendation:** Extract into shared utility function

---

### Cluster #10 (2 similar blocks)

**Files:** assets/js/shared/api-client.js, assets/js/shared/api.js

#### assets/js/shared/api-client.js:142
```javascript
export function renderTable(items, rowFn, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerH
```

#### assets/js/shared/api.js:264
```javascript
export function renderTable(items, rowFn, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
        contai
```

**Recommendation:** Extract into shared utility function

---

### Cluster #11 (2 similar blocks)

**Files:** assets/js/shared/api-client.js, assets/js/shared/api.js

#### assets/js/shared/api-client.js:160
```javascript
export function renderList(items, itemFn, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerH
```

#### assets/js/shared/api.js:282
```javascript
export function renderList(items, itemFn, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
        contai
```

**Recommendation:** Extract into shared utility function

---

### Cluster #12 (3 similar blocks)

**Files:** assets/js/shared/api-client.js, assets/js/shared/api.js, assets/js/shared/format-utils.js

#### assets/js/shared/api-client.js:189
```javascript
export function formatNumberSafe(num) {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toL
```

#### assets/js/shared/api.js:311
```javascript
export function formatNumberSafe(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return
```

#### assets/js/shared/format-utils.js:36
```javascript
export function formatNumber(num) {
    if (num === null || num === undefined) return '--';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).to
```

**Recommendation:** Extract into shared utility function

---

### Cluster #13 (2 similar blocks)

**Files:** assets/js/shared/api-client.js, assets/js/shared/api.js

#### assets/js/shared/api-client.js:216
```javascript
export function renderActivities(activities, containerId = 'live-activity-list') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!activities || activities.
```

#### assets/js/shared/api.js:338
```javascript
export function renderActivities(activities, containerId = 'live-activity-list') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!activities || activ
```

**Recommendation:** Extract into shared utility function

---

### Cluster #14 (2 similar blocks)

**Files:** assets/js/shared/api-client.js, assets/js/shared/api.js

#### assets/js/shared/api-client.js:249
```javascript
export function renderChart(chartId, chartType, data) {
  if (!window.MekongAdmin || !MekongAdmin.DashboardCharts) {
    return;
  }

  const chartFn = MekongAdmin.DashboardCharts[`${chartType}Chart`]
```

#### assets/js/shared/api.js:371
```javascript
export function renderChart(chartId, chartType, data) {
    if (!window.MekongAdmin || !MekongAdmin.DashboardCharts) {
        return;
    }

    const chartFn = MekongAdmin.DashboardCharts[`${chartTy
```

**Recommendation:** Extract into shared utility function

---

### Cluster #15 (2 similar blocks)

**Files:** assets/js/shared/api.js, assets/js/utils/api.js

#### assets/js/shared/api.js:34
```javascript
export async function apiFetch(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    const config = {
        ...options,
        header
```

#### assets/js/utils/api.js:33
```javascript
export async function apiFetch(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    const config = {
        ...options,
        he
```

**Recommendation:** Extract into shared utility function

---

... and 13 more clusters


---

## 📊 Specific Duplicate Patterns

| Pattern Type | Occurrences | Files Affected |
|--------------|-------------|----------------|
| Format Currency | 1 | 1 |
| Format Number | 1 | 1 |
| Format Date | 0 | 0 |
| Event Handlers | 9 | 9 |
| API Fetch | 27 | 27 |
| Modal Control | 21 | 21 |

---

## 🎯 Refactoring Recommendations

### High Priority (Shared Utilities)

1. **Consolidate format functions**
   - Create `assets/js/shared/format-utils.js`
   - Export: formatCurrency, formatNumber, formatDate, formatPercentage
   - Update all imports to use shared module

2. **Consolidate API helpers**
   - Create `assets/js/shared/api-utils.js`
   - Export: fetchWithAuth, postJSON, getJSON, handleResponse
   - Use Supabase client for authenticated requests

3. **Consolidate modal utilities**
   - Create `assets/js/shared/modal-utils.js`
   - Export: openModal, closeModal, createModal
   - Standardize modal behavior across app

### Medium Priority (Code Structure)

4. **Extract common event handlers**
   - Create `assets/js/shared/event-handlers.js`
   - Standardize preventDefault, loading states, error handling

5. **Create base component class**
   - Extend for similar UI components
   - Share lifecycle methods

### Low Priority (Cleanup)

6. **Remove dead code**
   - Delete unused duplicate functions
   - Keep only the canonical implementation

---

## 📈 Impact Estimate

| Refactoring | Effort | Lines Saved | Complexity Reduction |
|-------------|--------|-------------|---------------------|
| Format Utilities | 2h | ~200 | High |
| API Helpers | 3h | ~300 | High |
| Modal Utils | 1h | ~100 | Medium |
| Event Handlers | 2h | ~150 | Medium |
| **Total** | **8h** | **~750** | **Significant** |

---

## Quality Score

🔴 **14/100** - Critical (major refactoring needed)

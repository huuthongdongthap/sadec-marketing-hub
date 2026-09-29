# Dashboard Widgets Specification

> Tài liệu spec cho KPI cards, Charts, và Alerts widgets

---

## 1. KPI CARD WIDGETS

### 1.1. KPI Card Cơ Bản

**File:** `widgets/kpi-card.html`

**Attributes:**
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `title` | string | 'KPI' | Tiêu đề KPI |
| `value` | string/number | '0' | Giá trị hiển thị |
| `trend` | enum | 'neutral' | 'positive' | 'negative' | 'neutral' |
| `trend-value` | string | '0%' | Giá trị thay đổi (%) |
| `icon` | string | 'analytics' | Material icon name |
| `color` | enum | 'cyan' | 'cyan' | 'purple' | 'lime' | 'orange' | 'red' | 'green' |
| `sparkline-data` | string | '' | CSV numbers cho mini chart |

**Events:**
- `kpi-click` - Fired khi click vào card
- `kpi-refresh` - Fired khi cần reload data

**Slots:**
- `header` - Custom header content
- `footer` - Custom footer content

**Ví dụ:**
```html
<kpi-card-widget
    title="Total Revenue"
    value="125,000,000đ"
    trend="positive"
    trend-value="+12.5%"
    icon="payments"
    color="green"
    sparkline-data="10,25,18,30,22,35,28">
</kpi-card-widget>
```

---

### 1.2. KPI Grid Layout

**File:** `widgets/kpi-grid.js`

**Purpose:** Container layout cho nhiều KPI cards

**Attributes:**
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `columns` | number | 4 | Số columns (2-6) |
| `gap` | string | '16px' | Gap giữa cards |
| `responsive` | boolean | true | Auto responsive |

**Ví dụ:**
```html
<kpi-grid columns="4" gap="20px">
    <kpi-card-widget ...></kpi-card-widget>
    <kpi-card-widget ...></kpi-card-widget>
    <kpi-card-widget ...></kpi-card-widget>
    <kpi-card-widget ...></kpi-card-widget>
</kpi-grid>
```

---

### 1.3. KPI Types Registry

| KPI Type | Icon | Color | Metrics |
|----------|------|-------|---------|
| Revenue | payments | green | Total revenue, MRR, ARR |
| Users | group | cyan | Active users, new signups |
| Orders | shopping_cart | orange | Orders today, completion rate |
| Conversion | funnel | purple | Conversion rate, funnel metrics |
| Performance | speed | lime | Page speed, API latency |
| Alerts | warning | red | Critical issues, errors |

---

## 2. CHART WIDGETS

### 2.1. Line Chart Widget

**File:** `widgets/line-chart-widget.js`

**Attributes:**
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `title` | string | 'Chart' | Chart title |
| `data` | string (JSON) | '[]' | CSV or JSON data |
| `labels` | string (CSV) | '' | X-axis labels |
| `color` | string | '#00e5ff' | Line color |
| `gradient` | boolean | true | Fill gradient |
| `smooth` | boolean | true | Smooth curves |
| `show-points` | boolean | true | Show data points |
| `height` | number | 250 | Chart height (px) |

**Events:**
- `chart-point-hover` - { x, y, label, value }
- `chart-range-change` - { start, end }

**Ví dụ:**
```html
<line-chart-widget
    title="Revenue Trend"
    data="[120,150,180,220,190,250,280]"
    labels="['Mon','Tue','Wed','Thu','Fri','Sat','Sun']"
    color="#00e5ff"
    gradient="true"
    height="280">
</line-chart-widget>
```

---

### 2.2. Bar Chart Widget

**File:** `widgets/bar-chart-widget.js`

**Attributes:**
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `title` | string | 'Chart' | Chart title |
| `data` | string (JSON) | '[]' | Array of values |
| `labels` | string (CSV) | '' | X-axis labels |
| `colors` | string (CSV) | '' | Bar colors |
| `horizontal` | boolean | false | Horizontal bars |
| `stacked` | boolean | false | Stacked bars |
| `show-values` | boolean | true | Show value labels |

**Ví dụ:**
```html
<bar-chart-widget
    title="Monthly Sales"
    data="[45,67,89,34,56,78,90,45,67,89,34,56]"
    labels="['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']"
    colors="['#00e5ff','#d500f9']"
    show-values="true">
</bar-chart-widget>
```

---

### 2.3. Area Chart Widget

**File:** `widgets/area-chart-widget.js`

**Attributes:**
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `title` | string | 'Chart' | Chart title |
| `series` | string (JSON) | '[]' | Multiple data series |
| `labels` | string (CSV) | '' | X-axis labels |
| `colors` | string (CSV) | '' | Series colors |
| `opacity` | number | 0.3 | Fill opacity |
| `height` | number | 250 | Chart height |

**Ví dụ:**
```html
<area-chart-widget
    title="Traffic Sources"
    series='[{"name":"Direct","data":[10,20,30]},{"name":"Organic","data":[15,25,35]}]'
    labels="['Week 1','Week 2','Week 3']"
    colors="['#00e5ff','#c6ff00']"
    opacity="0.4">
</area-chart-widget>
```

---

### 2.4. Pie/Donut Chart Widget

**File:** `widgets/pie-chart-widget.js`

**Attributes:**
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `title` | string | 'Chart' | Chart title |
| `data` | string (JSON) | '[]' | [{label, value, color}] |
| `donut` | boolean | true | Donut mode |
| `show-legend` | boolean | true | Show legend |
| `show-percentages` | boolean | true | Show % on slices |
| `size` | number | 200 | Chart diameter |

**Ví dụ:**
```html
<pie-chart-widget
    title="Device Distribution"
    data='[{"label":"Desktop","value":45,"color":"#00e5ff"},{"label":"Mobile","value":35,"color":"#d500f9"},{"label":"Tablet","value":20,"color":"#c6ff00"}]'
    donut="true"
    show-legend="true"
    size="220">
</pie-chart-widget>
```

---

### 2.5. Mixed Chart Widget

**File:** `widgets/mixed-chart-widget.js`

**Purpose:** Kết hợp line + bar charts

**Attributes:**
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `title` | string | 'Chart' | Chart title |
| `bar-data` | string (JSON) | '[]' | Bar series data |
| `line-data` | string (JSON) | '[]' | Line series data |
| `labels` | string (CSV) | '' | X-axis labels |
| `bar-color` | string | '#00e5ff' | Bar color |
| `line-color` | string | '#ff1744' | Line color |
| `line-width` | number | 3 | Line stroke width |

**Ví dụ:**
```html
<mixed-chart-widget
    title="Revenue vs Target"
    bar-data='[100,120,140,160,180,200]'
    line-data='[110,130,150,170,190,210]'
    labels="['Q1','Q2','Q3','Q4','Q5','Q6']"
    bar-color="#00e5ff"
    line-color="#ff1744"
    line-width="4">
</mixed-chart-widget>
```

---

## 3. ALERTS WIDGET

### 3.1. Alerts Widget

**File:** `widgets/alerts-widget.js`

**Attributes:**
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `title` | string | 'Alerts' | Widget title |
| `max-items` | number | 10 | Maximum alerts to show |
| `filter` | string | 'all' | 'all' | 'critical' | 'warning' | 'info' |
| `auto-dismiss` | number | 0 | Auto-dismiss seconds (0 = disabled) |
| `sound` | boolean | false | Play sound on critical |

**Alert Types:**
| Type | Icon | Color | Priority |
|------|------|-------|----------|
| critical | error | red | 1 (highest) |
| warning | warning | orange | 2 |
| info | info | blue | 3 |
| success | check_circle | green | 4 |

**Events:**
- `alert-dismiss` - { id, type, title }
- `alert-click` - { id, type }
- `alert-clear-all` - Fired when clearing all

**Methods:**
- `addAlert(alert)` - Add new alert
- `dismissAlert(id)` - Dismiss single alert
- `clearAll()` - Clear all alerts

**Ví dụ:**
```html
<alerts-widget
    title="System Alerts"
    max-items="8"
    filter="all"
    auto-dismiss="30"
    sound="true">
</alerts-widget>

<script>
const alertsWidget = document.querySelector('alerts-widget');
alertsWidget.addAlert({
    type: 'critical',
    title: 'Database Connection Lost',
    message: 'Cannot connect to primary database',
    action: { label: 'Retry', handler: () => retryConnection() }
});
</script>
```

---

### 3.2. Notifications Integration

**File:** `widgets/notifications-integration.js`

**Purpose:** Browser notifications + Telegram webhook integration

**Config:**
```javascript
{
    browserNotifications: true,
    telegramWebhook: '/api/telegram/alerts',
    criticalKeywords: ['error', 'critical', 'down', 'fail'],
    quietHours: { start: '22:00', end: '07:00' }
}
```

---

## 4. DASHBOARD LAYOUT

### 4.1. Main Dashboard Structure

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: Title + Search + Notify + Theme Toggle             │
├─────────────────────────────────────────────────────────────┤
│  KPI GRID (4 columns)                                       │
│  ┌─────────┬─────────┬─────────┬─────────┐                 │
│  │ Revenue │ Clients │ Leads   │ Campaign│                 │
│  ├─────────┼─────────┼─────────┼─────────┤                 │
│  │ Orders  │ Conv.%  │ Speed   │ Errors  │                 │
│  └─────────┴─────────┴─────────┴─────────┘                 │
├─────────────────────────────────────────────────────────────┤
│  CHARTS ROW 1                                               │
│  ┌─────────────────────────┐ ┌─────────────────────────┐   │
│  │ Revenue Trend (Line)    │ │ Traffic (Area)          │   │
│  │                         │ │                         │   │
│  └─────────────────────────┘ └─────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  CHARTS ROW 2                                               │
│  ┌─────────────────────────┐ ┌─────────────────────────┐   │
│  │ Sales by Category (Bar) │ │ Devices (Pie)           │   │
│  │                         │ │                         │   │
│  └─────────────────────────┘ └─────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ALERTS + ACTIVITY                                          │
│  ┌─────────────────────────┐ ┌─────────────────────────┐   │
│  │ System Alerts           │ │ Live Activity Feed      │   │
│  │                         │ │                         │   │
│  └─────────────────────────┘ └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 4.2. Responsive Breakpoints

| Breakpoint | Width | Columns |
|------------|-------|---------|
| Mobile | < 640px | 1 |
| Tablet | 640-1024px | 2 |
| Desktop | > 1024px | 4 |

---

## 5. DATA INTEGRATION

### 5.1. API Endpoints

```
GET  /api/v1/dashboard/kpis          # All KPI data
GET  /api/v1/dashboard/kpi/:id       # Single KPI
GET  /api/v1/dashboard/charts/:type  # Chart data by type
GET  /api/v1/dashboard/alerts        # Active alerts
POST /api/v1/dashboard/alerts        # Create alert
DELETE /api/v1/dashboard/alerts/:id  # Dismiss alert
WS   /api/v1/dashboard/realtime      # WebSocket for real-time
```

### 5.2. Data Refresh Strategy

| Widget | Refresh Rate | Method |
|--------|--------------|--------|
| KPI Cards | 30s | Polling |
| Charts | 1m | Polling |
| Alerts | Real-time | WebSocket |
| Activity | 10s | Polling |

---

## 6. STYLING GUIDELINES

### 6.1. Color Palette

```css
:root {
    /* Primary */
    --cyan-400: #00e5ff;
    --purple-400: #d500f9;
    --lime-400: #c6ff00;
    --orange-400: #ff9100;

    /* Semantic */
    --success: #00e676;
    --error: #ff1744;
    --warning: #ff9100;
    --info: #2979ff;

    /* Background */
    --glass-bg: rgba(255, 255, 255, 0.05);
    --glass-border: rgba(255, 255, 255, 0.1);
}
```

### 6.2. Animation Standards

| Animation | Duration | Easing |
|-----------|----------|--------|
| Fade in | 300ms | ease-out |
| Slide up | 400ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Scale | 200ms | ease-in-out |
| Pulse | 2s | infinite |

---

## 7. ACCESSIBILITY (WCAG 2.1 AA)

- ✅ Keyboard navigation support
- ✅ ARIA labels for all interactive elements
- ✅ Focus indicators visible
- ✅ Color contrast ratio >= 4.5:1
- ✅ Screen reader announcements for alerts
- ✅ Reduced motion support

---

## 8. PERFORMANCE TARGETS

| Metric | Target |
|--------|--------|
| First Paint | < 1s |
| Time to Interactive | < 3s |
| Lighthouse Performance | > 90 |
| Bundle size (widgets) | < 50KB gzipped |
| Chart render time | < 100ms |

---

_Tài liệu này sẽ được cập nhật khi implement._

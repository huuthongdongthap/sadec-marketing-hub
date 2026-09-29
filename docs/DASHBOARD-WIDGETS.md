# 📊 Dashboard Widgets Guide

**Sa Đéc Marketing Hub** - Component Library for Dashboard

---

## 📦 Components

### 1. KPI Card Widget

Reusable KPI display card with animations and sparkline charts.

```html
<kpi-card-widget
  title="Doanh Thu"
  value="125.5M"
  trend="positive"
  trend-value="+12.5%"
  icon="payments"
  color="cyan"
  sparkline-data="10,25,18,30,22,35,28"
></kpi-card-widget>
```

**Attributes:**
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `title` | string | "KPI" | Label text |
| `value` | string | "0" | Main value display |
| `trend` | string | "neutral" | "positive" \| "negative" \| "neutral" |
| `trend-value` | string | "0%" | Trend percentage |
| `icon` | string | "analytics" | Material Icons name |
| `color` | string | "cyan" | "cyan" \| "purple" \| "lime" \| "orange" \| "red" \| "green" |
| `sparkline-data` | string | Auto | Comma-separated values |

---

### 2. Bar Chart

SVG-based bar chart for categorical data comparison.

```html
<bar-chart
  data='[{"label":"T1","value":45},{"label":"T2","value":52}]'
  color="cyan"
  height="200"
  show-labels="true"
></bar-chart>
```

**Attributes:**
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data` | JSON array | [] | `[{label, value}]` |
| `color` | string | "cyan" | Chart color theme |
| `height` | number | 200 | Chart height in px |
| `show-labels` | boolean | true | Show x-axis labels |

---

### 3. Line Chart

SVG-based line chart with area fill option.

```html
<line-chart
  data='[{"label":"T2","value":3200},{"label":"T3","value":4100}]'
  color="purple"
  height="200"
  show-points="true"
  show-area="true"
></line-chart>
```

**Attributes:**
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data` | JSON array | [] | `[{label, value}]` |
| `color` | string | "purple" | Chart color theme |
| `height` | number | 200 | Chart height in px |
| `show-points` | boolean | true | Show data points |
| `show-area` | boolean | false | Fill area under line |

---

### 4. Doughnut Chart

SVG-based doughnut chart with legend.

```html
<doughnut-chart
  data='[{"label":"Facebook","value":45},{"label":"Google","value":30}]'
  size="250"
  show-legend="true"
></doughnut-chart>
```

**Attributes:**
| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data` | JSON array | [] | `[{label, value}]` |
| `size` | number | 200 | Chart size (width/height) |
| `show-legend` | boolean | true | Show legend below chart |

---

### 5. Alert System

Toast notifications for user feedback.

```javascript
// Success
Alert.success('Thành công', 'Dữ liệu đã được lưu!');

// Error
Alert.error('Lỗi', 'Có lỗi xảy ra khi xử lý!');

// Warning
Alert.warning('Cảnh báo', 'Dữ liệu sắp hết hạn!');

// Info
Alert.info('Thông báo', 'Cập nhật mới available!');

// Custom duration (ms)
Alert.success('OK', 'Saved!', 3000);

// Dismiss programmatically
const id = Alert.info('Loading...', 'Processing');
Alert.dismiss(id);
```

---

### 6. Loading States

Unified loading manager API.

```javascript
// Show loading on element
Loading.show('#my-container');

// Show skeleton loaders
Loading.skeleton('#content', 'card'); // card | list | text | table | stat | image

// Fullscreen overlay
Loading.fullscreen.show('Đang xử lý...');
Loading.fullscreen.hide();
```

**Skeleton Types:**
- `card` - Card placeholder
- `list` - List items
- `text` - Text lines
- `table` - Table rows
- `stat` - Stat cards
- `image` - Image placeholder

---

## 🎨 Styling

### Dashboard Grids

```html
<!-- Auto-fit grid -->
<div class="dashboard-grid">
  <!-- Cards auto-wrap -->
</div>

<!-- 2-column grid -->
<div class="dashboard-grid-2"></div>

<!-- 3-column grid -->
<div class="dashboard-grid-3"></div>
```

### Chart Wrappers

```html
<div class="chart-wrapper">
  <!-- Charts go here -->
</div>
```

---

## 📂 File Structure

```
assets/
├── js/
│   ├── charts/
│   │   ├── bar-chart.js
│   │   ├── line-chart.js
│   │   └── doughnut-chart.js
│   ├── components/
│   │   ├── loading-button.js
│   │   ├── sadec-toast.js
│   │   └── payment-status-chip.js
│   ├── widgets/
│   │   └── kpi-card.html
│   ├── alert-system.js
│   ├── loading-states.js
│   └── micro-animations.js
└── css/
    └── widgets.css
admin/
└── widgets/
    └── widgets-demo.html
```

---

## 🔗 Import All Components

```javascript
// Import all at once
import './charts/bar-chart.js';
import './charts/line-chart.js';
import './charts/doughnut-chart.js';
import './alert-system.js';
import './loading-states.js';
import './micro-animations.js';
```

---

## 🎯 Usage Examples

### Dashboard Page

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="/assets/css/widgets.css">
</head>
<body>
  <div class="dashboard-grid">
    <kpi-card-widget title="Revenue" value="$12,450" trend="positive" trend-value="+15%"></kpi-card-widget>
    <kpi-card-widget title="Users" value="1,234" trend="positive" trend-value="+8%"></kpi-card-widget>
  </div>

  <div class="chart-wrapper">
    <bar-chart data='[{"label":"Mon","value":30},{"label":"Tue","value":45}]'></bar-chart>
  </div>

  <script type="module">
    import './assets/js/charts/bar-chart.js';
    import './assets/js/alert-system.js';
  </script>
</body>
</html>
```

### Form Submission with Feedback

```javascript
async function submitForm(data) {
  Loading.show('#form-container');
  
  try {
    await api.submit(data);
    Alert.success('Thành công', 'Đã lưu thông tin!');
  } catch (error) {
    Alert.error('Lỗi', error.message);
  } finally {
    Loading.hide('#form-container');
  }
}
```

---

## 🌐 Demo

View live demo: `/admin/widgets-demo.html`

```bash
# Open in browser
open admin/widgets-demo.html
```

---

## 📱 Responsive

All components are mobile-responsive:

- KPI cards stack on small screens
- Charts scroll horizontally if needed
- Alerts adapt to screen width
- Grids use auto-fit with minmax

---

## ♿ Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus indicators
- Reduced motion support via `prefers-reduced-motion`

---

## 🎭 Animations

Components include:

- **Entrance animations**: Slide in, fade in
- **Hover effects**: Transform, shadow
- **Loading states**: Shimmer, pulse
- **Alert animations**: Slide in/out, progress bar

---

*Last updated: 2026-03-13*
*Version: 1.0.0*

# SaDec Marketing Hub - Admin Dashboard

Dashboard quản lý marketing toàn diện với các widgets KPI, charts, và alerts system.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts 2
- **Icons**: Lucide React
- **Testing**: Vitest + Testing Library

## Installation

```bash
cd apps/sadec-marketing-hub/admin
npm install
```

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Components

### KPI Components
- `KPICard` - Hiển thị chỉ số KPI với trend indicator
- `StatCard` - Card thống kê với progress bar
- `Metric` - Metric với sparkline visualization

### Charts
- `SimpleLineChart` - Biểu đồ đường
- `SimpleBarChart` - Biểu đồ cột
- `SimplePieChart` - Biểu đồ tròn
- `SimpleAreaChart` - Biểu đồ vùng

### Alerts
- `Alert` - Alert banners (info/success/warning/error)
- `Toast` - Toast notifications với useToast hook
- `StatusBadge` - Badge trạng thái

### Layout
- `DashboardLayout` - Layout chính với sidebar navigation

## Project Structure

```
admin/
├── src/
│   ├── components/
│   │   ├── ui/           # Base UI components
│   │   ├── kpi/          # KPI widgets
│   │   ├── charts/       # Chart components
│   │   ├── alerts/       # Alert components
│   │   └── layout/       # Layout components
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilities
│   └── test/             # Test setup
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## Features

- Responsive design (mobile-first)
- Dark mode ready
- Accessibility (ARIA labels, keyboard navigation)
- TypeScript strict mode
- Unit tests với Vitest

## License

MIT

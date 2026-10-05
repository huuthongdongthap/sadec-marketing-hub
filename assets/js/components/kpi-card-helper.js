/**
 * KPI Card Helper & Styles (< 200 lines)
 * Sparkline SVG generator, theme colors, and CSS definitions.
 */

export const KPI_COLOR_MAP = {
  cyan: { primary: '#00e5ff', secondary: '#00b8d4', glow: 'rgba(0, 229, 255, 0.3)' },
  purple: { primary: '#d500f9', secondary: '#aa00ff', glow: 'rgba(213, 0, 249, 0.3)' },
  lime: { primary: '#c6ff00', secondary: '#a0cc00', glow: 'rgba(198, 255, 0, 0.3)' },
  orange: { primary: '#ff9100', secondary: '#ff6d00', glow: 'rgba(255, 145, 0, 0.3)' },
  red: { primary: '#ff1744', secondary: '#d50000', glow: 'rgba(255, 23, 68, 0.3)' },
  green: { primary: '#00e676', secondary: '#00c853', glow: 'rgba(0, 230, 118, 0.3)' },
  blue: { primary: '#2979ff', secondary: '#1565c0', glow: 'rgba(41, 121, 255, 0.3)' }
};

export function generateSparkline(dataStr, color) {
  const data = dataStr.split(',').map(Number).filter(n => !isNaN(n));
  if (data.length === 0) return '';

  const width = 200;
  const height = 40;
  const padding = 2;
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - minValue) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const firstX = padding;
  const lastX = width - padding;
  const areaPath = `M ${firstX},${height - padding} L ${points.replace(/ /g, ' L ')} L ${lastX},${height - padding} Z`;

  return `
    <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="gradient-${color.replace('#', '')}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
        </linearGradient>
      </defs>
      <path d="${areaPath}" fill="url(#gradient-${color.replace('#', '')})" />
      <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;
}

export function getKpiCardStyles(scheme, trendColor) {
  return `
    :host {
      display: block;
      width: 100%;
    }

    .kpi-card {
      background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 20px;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(10px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
    }

    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, ${scheme.primary}, ${scheme.secondary});
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .kpi-card:hover {
      transform: translateY(-4px);
      border-color: ${scheme.glow};
      box-shadow: 0 12px 40px ${scheme.glow};
    }

    .kpi-card:hover::before {
      opacity: 1;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, ${scheme.primary}, ${scheme.secondary});
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px ${scheme.glow};
    }

    .material-symbols-outlined {
      color: #0a0a14;
      font-size: 24px;
    }

    .title {
      color: rgba(255,255,255,0.6);
      font-size: 13px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .value {
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
    }

    .trend-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 12px;
    }

    .trend-icon {
      color: ${trendColor};
      font-size: 16px;
    }

    .trend-value {
      color: ${trendColor};
      font-size: 14px;
      font-weight: 600;
    }

    .trend-label {
      color: rgba(255,255,255,0.5);
      font-size: 12px;
    }

    .sparkline-container {
      height: 40px;
      margin-top: 8px;
    }

    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 4px 20px ${scheme.glow}; }
      50% { box-shadow: 0 4px 30px ${scheme.glow}, 0 0 40px ${scheme.glow}; }
    }

    .kpi-card.positive:hover {
      animation: pulse-glow 2s ease-in-out infinite;
    }
  `;
}

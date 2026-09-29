/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHART ANIMATIONS & UTILITIES — Sa Đéc Marketing Hub
 * Micro-animations, export functionality, real-time updates for charts
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * - Scroll-triggered chart animations
 * - Export chart as PNG/PDF
 * - Real-time data refresh integration
 * - Enhanced tooltips với ANIM
 * - Skeleton loading states
 * - Mobile responsive utilities
 *
 * Usage:
 *   import { initChartAnimations, exportChart, createSkeleton } from './chart-animations.js';
 *   initChartAnimations();
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from '../shared/logger.js';

/**
 * Scroll-triggered animation observer for charts
 */
export function initChartAnimations() {
    if (!('IntersectionObserver' in window)) {
        Logger.warn('IntersectionObserver not supported, skipping chart animations');
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const chart = entry.target;
                chart.classList.add('chart-animate-in');

                // Animate canvas elements
                const canvas = chart.querySelector('canvas');
                if (canvas) {
                    canvas.style.opacity = '0';
                    canvas.style.transform = 'scaleY(0.8)';

                    requestAnimationFrame(() => {
                        canvas.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                        canvas.style.opacity = '1';
                        canvas.style.transform = 'scaleY(1)';
                    });
                }

                observer.unobserve(chart);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all chart widgets
    document.querySelectorAll('.line-chart-widget, .bar-chart-widget, .area-chart-widget, .pie-chart-widget').forEach(chart => {
        observer.observe(chart);
    });

    Logger.debug('Chart animations initialized', { observed: document.querySelectorAll('.line-chart-widget, .bar-chart-widget, .area-chart-widget, .pie-chart-widget').length });
}

/**
 * Export chart as PNG image
 */
export function exportChart(chartInstance, filename = 'chart-export.png', options = {}) {
    if (!chartInstance) {
        Logger.error('Export failed: Chart instance not found');
        return;
    }

    const {
        backgroundColor = '#1a1a2e',
        scale = 2,
        format = 'png',
        quality = 1
    } = options;

    try {
        // Create temporary canvas with higher resolution
        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d');

        const originalWidth = chartInstance.canvas.width;
        const originalHeight = chartInstance.canvas.height;

        tempCanvas.width = originalWidth * scale;
        tempCanvas.height = originalHeight * scale;

        // Fill background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Draw chart canvas
        ctx.drawImage(chartInstance.canvas, 0, 0, tempCanvas.width, tempCanvas.height);

        // Create download link
        const link = document.createElement('a');
        link.download = filename;
        link.href = tempCanvas.toDataURL(`image/${format}`, quality);
        link.click();

        Logger.log('Chart exported', { filename, format, size: `${tempCanvas.width}x${tempCanvas.height}` });

        return tempCanvas;
    } catch (error) {
        Logger.error('Export failed', { error });
        return null;
    }
}

/**
 * Export chart as PDF (requires jsPDF)
 */
export async function exportChartAsPDF(chartInstance, filename = 'chart-export.pdf', title = 'Chart Export') {
    if (!chartInstance) {
        Logger.error('Export failed: Chart instance not found');
        return;
    }

    try {
        // Load jsPDF if not available
        if (!window.jspdf) {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        }

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        // Add title
        pdf.setFontSize(18);
        pdf.text(title, 14, 20);

        // Add chart image
        const chartDataUrl = chartInstance.canvas.toDataURL('image/png');
        pdf.addImage(chartDataUrl, 'PNG', 14, 30, 267, 140);

        // Add timestamp
        pdf.setFontSize(10);
        pdf.setTextColor(150);
        pdf.text(`Generated: ${new Date().toLocaleString('vi-VN')}`, 14, 180);

        // Save PDF
        pdf.save(filename);

        Logger.log('PDF exported', { filename });

        return pdf;
    } catch (error) {
        Logger.error('PDF export failed', { error });
        return null;
    }
}

/**
 * Create skeleton loading state for charts
 */
export function createSkeleton(container, options = {}) {
    const {
        height = 300,
        showHeader = true,
        showStats = false
    } = options;

    const skeleton = document.createElement('div');
    skeleton.className = 'chart-skeleton';
    skeleton.innerHTML = `
        ${showHeader ? `
            <div class="skeleton-header">
                <div class="skeleton-title"></div>
                <div class="skeleton-controls">
                    <div class="skeleton-btn"></div>
                    <div class="skeleton-btn"></div>
                </div>
            </div>
        ` : ''}
        <div class="skeleton-chart" style="height: ${height}px"></div>
        ${showStats ? `
            <div class="skeleton-stats">
                <div class="skeleton-stat"></div>
                <div class="skeleton-stat"></div>
                <div class="skeleton-stat"></div>
                <div class="skeleton-stat"></div>
            </div>
        ` : ''}
    `;

    const style = document.createElement('style');
    style.textContent = `
        .chart-skeleton {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            padding: 24px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            overflow: hidden;
        }
        .skeleton-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .skeleton-title {
            width: 150px;
            height: 24px;
            border-radius: 8px;
            background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
        }
        .skeleton-controls {
            display: flex;
            gap: 8px;
        }
        .skeleton-btn {
            width: 80px;
            height: 28px;
            border-radius: 14px;
            background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
        }
        .skeleton-chart {
            background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 8px;
        }
        .skeleton-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .skeleton-stat {
            height: 60px;
            border-radius: 8px;
            background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        @media (max-width: 768px) {
            .skeleton-stats {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    `;
    skeleton.appendChild(style);

    if (container) {
        container.appendChild(skeleton);
    }

    return skeleton;
}

/**
 * Remove skeleton loading
 */
export function removeSkeleton(container) {
    const skeleton = container?.querySelector('.chart-skeleton');
    if (skeleton) {
        skeleton.remove();
    }
}

/**
 * Enhanced tooltip formatter với ANIM
 */
export function createEnhancedTooltip(options = {}) {
    const {
        prefix = '',
        suffix = '',
        valueFormatter = null,
        showPercentage = false,
        animate = true
    } = options;

    return {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ffffff',
        titleFont: {
            size: 14,
            weight: '600'
        },
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        bodyFont: {
            size: 13
        },
        borderColor: 'rgba(0, 229, 255, 0.3)',
        borderWidth: 1,
        padding: 16,
        cornerRadius: 12,
        displayColors: true,
        boxWidth: 12,
        boxHeight: 12,
        boxBorderRadius: 3,
        usePointStyle: true,
        titleSpacing: 12,
        titleMarginBottom: 12,
        bodySpacing: 10,
        footerSpacing: 12,
        multiKeyBackground: 'rgba(255, 255, 255, 0.1)',
        callbacks: {
            title: (items) => {
                const item = items[0];
                return item.label || `Step ${item.index + 1}`;
            },
            label: (context) => {
                const label = context.dataset.label || '';
                let value = context.parsed.y ?? context.parsed.x ?? context.parsed ?? 0;

                if (valueFormatter) {
                    value = valueFormatter(value);
                }

                let result = `${label}: ${prefix}${value}${suffix}`;

                if (showPercentage && context.dataset.data) {
                    const total = context.dataset.data.reduce((a, b) => a + (b.y ?? b.x ?? b), 0);
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    result += ` (${percentage}%)`;
                }

                return result;
            },
            footer: (items) => {
                if (options.footerText) {
                    return options.footerText;
                }
                return '';
            }
        },
        animation: animate ? {
            duration: 200,
            easing: 'easeOutQuart'
        } : undefined
    };
}

/**
 * Real-time data refresh integration
 */
export function initRealTimeCharts(refreshCallback = null) {
    const charts = new Map();

    // Listen for data-refresh events
    window.addEventListener('data-refresh', async () => {
        Logger.debug('Real-time chart refresh triggered');

        for (const [id, chartConfig] of charts.entries()) {
            try {
                const newData = await refreshCallback?.(chartConfig.type, chartConfig.options);

                if (newData && chartConfig.instance) {
                    updateChartData(chartConfig.instance, newData);
                }
            } catch (error) {
                Logger.error('Failed to refresh chart', { id, error });
            }
        }
    });

    return {
        register: (id, instance, type, options) => {
            charts.set(id, { instance, type, options });
        },
        unregister: (id) => {
            charts.delete(id);
        },
        update: (id, newData) => {
            const chartConfig = charts.get(id);
            if (chartConfig?.instance) {
                updateChartData(chartConfig.instance, newData);
            }
        }
    };
}

/**
 * Update chart data with animation
 */
function updateChartData(chartInstance, newData) {
    if (!chartInstance) return;

    const { labels, datasets } = newData;

    if (labels) {
        chartInstance.data.labels = labels;
    }

    if (datasets && Array.isArray(datasets)) {
        datasets.forEach((dataset, index) => {
            if (chartInstance.data.datasets[index]) {
                chartInstance.data.datasets[index].data = dataset.data;

                if (dataset.label) {
                    chartInstance.data.datasets[index].label = dataset.label;
                }
            }
        });
    }

    // Animate update
    chartInstance.update('active');
}

/**
 * Load external script
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Responsive utilities for charts
 */
export const ResponsiveCharts = {
    // Get optimal chart height based on viewport
    getHeight: (breakpoint = 'mobile') => {
        const heights = {
            mobile: 200,
            tablet: 250,
            desktop: 300
        };

        if (window.innerWidth < 375) return heights.mobile - 20;
        if (window.innerWidth < 768) return heights.mobile;
        if (window.innerWidth < 1024) return heights.tablet;
        return heights.desktop;
    },

    // Get optimal font size
    getFontSize: () => {
        if (window.innerWidth < 375) return { title: 14, label: 10, tooltip: 11 };
        if (window.innerWidth < 768) return { title: 16, label: 11, tooltip: 12 };
        if (window.innerWidth < 1024) return { title: 17, label: 11, tooltip: 12 };
        return { title: 18, label: 12, tooltip: 13 };
    },

    // Adjust config for mobile
    adaptForMobile: (config) => {
        const isMobile = window.innerWidth < 768;

        return {
            ...config,
            options: {
                ...config.options,
                plugins: {
                    ...config.options?.plugins,
                    legend: {
                        ...config.options?.plugins?.legend,
                        display: isMobile ? false : config.options?.plugins?.legend?.display,
                        position: isMobile ? 'bottom' : 'top'
                    },
                    tooltip: {
                        ...config.options?.plugins?.tooltip,
                        bodyFont: {
                            ...config.options?.plugins?.tooltip?.bodyFont,
                            size: isMobile ? 11 : 13
                        }
                    }
                },
                scales: isMobile ? {
                    x: {
                        ...config.options?.scales?.x,
                        ticks: {
                            ...config.options?.scales?.x?.ticks,
                            maxRotation: 45,
                            minRotation: 45,
                            font: { size: 9 }
                        }
                    },
                    y: {
                        ...config.options?.scales?.y,
                        ticks: {
                            ...config.options?.scales?.y?.ticks,
                            font: { size: 9 }
                        }
                    }
                } : config.options?.scales
            }
        };
    }
};

// Auto-init on DOMContentLoaded
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initChartAnimations();
    });
}

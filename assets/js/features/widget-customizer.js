/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — DASHBOARD WIDGET CUSTOMIZER
 * Allow users to customize dashboard layout, show/hide widgets, reorder
 *
 * Features:
 * - Drag & drop widget reordering
 * - Show/hide individual widgets
 * - Save layout preferences to localStorage
 * - Reset to default layout
 * - Export/Import layout configurations
 *
 * Usage:
 *   <script type="module" src="assets/js/features/widget-customizer.js"></script>
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from '../shared/logger.js';

/**
 * Widget Customizer Class
 */
export class WidgetCustomizer {
    constructor() {
        this.storageKey = 'sadec-dashboard-layout';
        this.widgets = [];
        this.isEditMode = false;
        this.defaultLayout = this.getDefaultLayout();
        this.init();
    }

    /**
     * Get default layout configuration
     */
    getDefaultLayout() {
        return {
            widgets: [
                { id: 'kpi-revenue', visible: true, order: 0 },
                { id: 'kpi-clients', visible: true, order: 1 },
                { id: 'kpi-leads', visible: true, order: 2 },
                { id: 'kpi-campaigns', visible: true, order: 3 },
                { id: 'revenue-chart', visible: true, order: 4 },
                { id: 'traffic-chart', visible: true, order: 5 },
                { id: 'system-alerts', visible: true, order: 6 },
                { id: 'activity-feed', visible: true, order: 7 }
            ],
            columns: {
                mobile: 1,
                tablet: 2,
                desktop: 4
            }
        };
    }

    /**
     * Initialize widget customizer
     */
    init() {
        this.loadLayout();
        this.detectWidgets();
        this.bindEvents();
        this.applyLayout();
        Logger.log('[WidgetCustomizer] Initialized');
    }

    /**
     * Detect widgets on page
     */
    detectWidgets() {
        const widgetSelectors = [
            'kpi-card-widget',
            'line-chart-widget',
            'area-chart-widget',
            'bar-chart-widget',
            'pie-chart-widget',
            'alerts-widget',
            'activity-feed-widget',
            'project-progress-widget',
            '[data-widget]'
        ];

        this.widgets = [];
        widgetSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                const id = el.id || el.getAttribute('data-widget') || `widget-${this.widgets.length}`;
                if (!el.closest('.widget-customizer-exclude')) {
                    this.widgets.push({
                        id,
                        element: el,
                        visible: true
                    });
                }
            });
        });

        Logger.log(`[WidgetCustomizer] Detected ${this.widgets.length} widgets`);
    }

    /**
     * Load layout from localStorage
     */
    loadLayout() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.currentLayout = JSON.parse(saved);
            } else {
                this.currentLayout = this.defaultLayout;
            }
        } catch (e) {
            Logger.warn('[WidgetCustomizer] Failed to load layout:', e.message);
            this.currentLayout = this.defaultLayout;
        }
    }

    /**
     * Save layout to localStorage
     */
    saveLayout() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.currentLayout));
            Logger.log('[WidgetCustomizer] Layout saved');
        } catch (e) {
            Logger.warn('[WidgetCustomizer] Failed to save layout:', e.message);
        }
    }

    /**
     * Apply saved layout
     */
    applyLayout() {
        if (!this.currentLayout || !this.currentLayout.widgets) return;

        this.currentLayout.widgets.forEach(widgetConfig => {
            const widget = document.getElementById(widgetConfig.id);
            if (widget) {
                widget.style.display = widgetConfig.visible ? '' : 'none';
                if (widgetConfig.order !== undefined) {
                    widget.style.order = widgetConfig.order;
                }
            }
        });
    }

    /**
     * Toggle widget visibility
     */
    toggleWidget(widgetId) {
        const widgetConfig = this.currentLayout.widgets.find(w => w.id === widgetId);
        if (widgetConfig) {
            widgetConfig.visible = !widgetConfig.visible;
            const widget = document.getElementById(widgetId);
            if (widget) {
                widget.style.display = widgetConfig.visible ? '' : 'none';
                widget.classList.toggle('widget-hidden', !widgetConfig.visible);
            }
            this.saveLayout();
            Logger.log(`[WidgetCustomizer] Toggled ${widgetId}: ${widgetConfig.visible ? 'visible' : 'hidden'}`);
        }
    }

    /**
     * Enter/exit edit mode
     */
    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        document.body.classList.toggle('widget-edit-mode', this.isEditMode);

        if (this.isEditMode) {
            this.showEditPanel();
            this.enableDragDrop();
        } else {
            this.hideEditPanel();
            this.disableDragDrop();
        }

        Logger.log(`[WidgetCustomizer] Edit mode: ${this.isEditMode ? 'on' : 'off'}`);
    }

    /**
     * Show edit panel
     */
    showEditPanel() {
        let panel = document.getElementById('widget-edit-panel');
        if (!panel) {
            panel = this.createEditPanel();
            document.body.appendChild(panel);
        }
        panel.classList.add('visible');
    }

    /**
     * Hide edit panel
     */
    hideEditPanel() {
        const panel = document.getElementById('widget-edit-panel');
        if (panel) {
            panel.classList.remove('visible');
            setTimeout(() => panel.remove(), 300);
        }
    }

    /**
     * Create edit panel UI
     */
    createEditPanel() {
        const panel = document.createElement('div');
        panel.id = 'widget-edit-panel';
        panel.className = 'widget-edit-panel';
        panel.innerHTML = `
            <div class="widget-edit-panel-header">
                <h3>Tùy Chỉnh Dashboard</h3>
                <button class="widget-edit-close" onclick="window.MekongFeatures.WidgetCustomizer.toggleEditMode()">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="widget-edit-panel-body">
                <div class="widget-visibility-toggles">
                    <h4>Hiển thị widgets</h4>
                    ${this.widgets.map(w => `
                        <label class="widget-toggle-item">
                            <input type="checkbox"
                                   data-widget-id="${w.id}"
                                   ${this.isWidgetVisible(w.id) ? 'checked' : ''}>
                            <span>${this.getWidgetName(w.id)}</span>
                        </label>
                    `).join('')}
                </div>
                <div class="widget-edit-actions">
                    <button class="btn-reset" onclick="window.MekongFeatures.WidgetCustomizer.resetLayout()">
                        <span class="material-symbols-outlined">refresh</span>
                        Reset Default
                    </button>
                    <button class="btn-export" onclick="window.MekongFeatures.WidgetCustomizer.exportLayout()">
                        <span class="material-symbols-outlined">download</span>
                        Export
                    </button>
                    <button class="btn-import" onclick="document.getElementById('widget-import-input').click()">
                        <span class="material-symbols-outlined">upload</span>
                        Import
                    </button>
                    <input type="file" id="widget-import-input" accept=".json" style="display:none"
                           onchange="window.MekongFeatures.WidgetCustomizer.importLayout(event)">
                </div>
            </div>
        `;

        // Bind checkbox events
        panel.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const widgetId = e.target.getAttribute('data-widget-id');
                this.toggleWidget(widgetId);
            });
        });

        return panel;
    }

    /**
     * Check if widget is visible
     */
    isWidgetVisible(widgetId) {
        const widgetConfig = this.currentLayout.widgets.find(w => w.id === widgetId);
        return widgetConfig ? widgetConfig.visible : true;
    }

    /**
     * Get widget display name
     */
    getWidgetName(widgetId) {
        const names = {
            'kpi-revenue': 'Doanh Thu',
            'kpi-clients': 'Khách Hàng',
            'kpi-leads': 'Leads',
            'kpi-campaigns': 'Chiến Dịch',
            'revenue-chart': 'Biểu Đồ Doanh Thu',
            'traffic-chart': 'Biểu Đồ Traffic',
            'system-alerts': 'Cảnh Báo',
            'activity-feed': 'Hoạt Động'
        };
        return names[widgetId] || widgetId;
    }

    /**
     * Enable drag & drop
     */
    enableDragDrop() {
        // Implementation for drag & drop reordering
        this.widgets.forEach(widget => {
            widget.element.setAttribute('draggable', 'true');
            widget.element.classList.add('widget-draggable');
        });
    }

    /**
     * Disable drag & drop
     */
    disableDragDrop() {
        this.widgets.forEach(widget => {
            widget.element.removeAttribute('draggable');
            widget.element.classList.remove('widget-draggable');
        });
    }

    /**
     * Reset to default layout
     */
    resetLayout() {
        if (confirm('Bạn có chắc muốn reset layout về mặc định?')) {
            this.currentLayout = this.defaultLayout;
            this.saveLayout();
            this.applyLayout();
            Logger.log('[WidgetCustomizer] Layout reset to default');
        }
    }

    /**
     * Export layout configuration
     */
    exportLayout() {
        const data = JSON.stringify(this.currentLayout, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dashboard-layout.json';
        a.click();
        URL.revokeObjectURL(url);
        Logger.log('[WidgetCustomizer] Layout exported');
    }

    /**
     * Import layout configuration
     */
    importLayout(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const layout = JSON.parse(e.target.result);
                    this.currentLayout = layout;
                    this.saveLayout();
                    this.applyLayout();
                    Logger.log('[WidgetCustomizer] Layout imported');
                    alert('Layout imported successfully!');
                } catch (err) {
                    Logger.error('[WidgetCustomizer] Failed to import layout:', err.message);
                    alert('Invalid layout file');
                }
            };
            reader.readAsText(file);
        }
    }

    /**
     * Bind keyboard shortcut (Ctrl+Shift+E)
     */
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'E') {
                e.preventDefault();
                this.toggleEditMode();
            }
        });

        // Add edit button to dashboard if not present
        this.addEditButton();
    }

    /**
     * Add edit button to dashboard
     */
    addEditButton() {
        const header = document.querySelector('.header-section');
        if (header && !document.getElementById('widget-edit-btn')) {
            const btn = document.createElement('button');
            btn.id = 'widget-edit-btn';
            btn.className = 'btn-cyber widget-edit-trigger';
            btn.innerHTML = `
                <span class="material-symbols-outlined">dashboard_customize</span>
                Customize
            `;
            btn.onclick = () => this.toggleEditMode();
            btn.title = 'Customize Dashboard (Ctrl+Shift+E)';
            header.appendChild(btn);
        }
    }
}

/**
 * Initialize Widget Customizer
 */
export function initWidgetCustomizer() {
    return new WidgetCustomizer();
}

// Auto-initialize
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidgetCustomizer);
    } else {
        initWidgetCustomizer();
    }
}

// Export singleton instance
export const WidgetCustomizerInstance = initWidgetCustomizer();

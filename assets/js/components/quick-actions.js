/**
 * Quick Actions FAB - Floating Action Button
 * Panel với các actions nhanh thường dùng
 *
 * Features:
 * - Speed dial animations
 * - Keyboard shortcuts
 * - Customizable actions
 * - Mobile responsive
 *
 * Usage:
 *   QuickActions.init({
 *     actions: [
 *       { icon: 'add', label: 'Thêm mới', shortcut: 'N', onClick: () => {} },
 *       { icon: 'upload', label: 'Upload', shortcut: 'U', onClick: () => {} }
 *     ]
 *   });
 */

import { Logger } from '../shared/logger.js';

class QuickActionsFAB {
    constructor(options = {}) {
        this.options = {
            position: 'bottom-right',
            showTooltip: true,
            enableKeyboard: true,
            animationDuration: 300,
            actions: [],
            ...options
        };

        this.container = null;
        this.mainButton = null;
        this.panel = null;
        this.isExpanded = false;
        this.actions = [];

        this.init();
    }

    /**
     * Initialize Quick Actions FAB
     */
    init() {
        this.createDOM();
        this.bindEvents();
        this.registerKeyboardShortcuts();
        Logger.info('[QuickActions] Initialized');
    }

    /**
     * Create DOM elements
     */
    createDOM() {
        // Main container
        this.container = document.createElement('div');
        this.container.className = 'quick-actions-fab';
        this.container.setAttribute('role', 'navigation');
        this.container.setAttribute('aria-label', 'Quick actions');

        // Actions panel
        this.panel = document.createElement('div');
        this.panel.className = 'quick-actions-panel';
        this.panel.setAttribute('role', 'menu');

        // Populate actions
        this.populateActions();

        // Main FAB button
        this.mainButton = document.createElement('button');
        this.mainButton.className = 'fab-main';
        this.mainButton.setAttribute('aria-label', 'Quick actions');
        this.mainButton.setAttribute('aria-expanded', 'false');
        this.mainButton.innerHTML = `
            <span class="material-symbols-outlined">add</span>
            ${this.options.showTooltip ? '<span class="fab-tooltip">Thao tác nhanh</span>' : ''}
        `;

        // Append to container
        this.container.appendChild(this.panel);
        this.container.appendChild(this.mainButton);

        // Append to document
        document.body.appendChild(this.container);
    }

    /**
     * Populate action items
     */
    populateActions() {
        if (!this.options.actions || this.options.actions.length === 0) {
            // Default actions
            this.options.actions = [
                { icon: 'add', label: 'Thêm mới', shortcut: 'N', variant: 'primary', onClick: () => {} },
                { icon: 'upload', label: 'Upload', shortcut: 'U', variant: 'info', onClick: () => {} },
                { icon: 'download', label: 'Download', shortcut: 'D', variant: 'success', onClick: () => {} },
                { icon: 'settings', label: 'Cài đặt', shortcut: 'S', variant: 'warning', onClick: () => {} }
            ];
        }

        this.actions = this.options.actions;

        // Clear panel
        this.panel.innerHTML = '';

        // Add action items (reversed for correct order in flex column)
        [...this.actions].reverse().forEach((action, index) => {
            const item = document.createElement('button');
            item.className = `quick-action-item quick-action-item--${action.variant || 'primary'} speed-dial-item`;
            item.setAttribute('role', 'menuitem');
            item.setAttribute('data-index', index);
            item.innerHTML = `
                <span class="material-symbols-outlined">${action.icon}</span>
                <span class="quick-action-label">${action.label}</span>
                ${action.shortcut ? `<span class="quick-action-shortcut">${action.shortcut}</span>` : ''}
            `;
            item.addEventListener('click', () => this.handleActionClick(index));
            this.panel.appendChild(item);
        });

        // Add label if has actions
        if (this.actions.length > 0) {
            const label = document.createElement('div');
            label.className = 'quick-actions-label';
            label.textContent = 'Thao tác';
            this.panel.appendChild(label);
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Main button click
        this.mainButton.addEventListener('click', () => this.toggle());

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.collapse();
            }
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isExpanded) {
                this.collapse();
                this.mainButton.focus();
            }
        });
    }

    /**
     * Register keyboard shortcuts
     */
    registerKeyboardShortcuts() {
        if (!this.options.enableKeyboard) return;

        document.addEventListener('keydown', (e) => {
            // Ignore if typing in input/textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Check for action shortcuts
            this.actions.forEach((action, index) => {
                if (action.shortcut && e.key.toUpperCase() === action.shortcut) {
                    e.preventDefault();
                    this.handleActionClick(index);
                }
            });

            // Toggle with Alt+A
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    /**
     * Toggle panel visibility
     */
    toggle() {
        if (this.isExpanded) {
            this.collapse();
        } else {
            this.expand();
        }
    }

    /**
     * Expand panel
     */
    expand() {
        this.isExpanded = true;
        this.mainButton.classList.add('is-expanded');
        this.mainButton.setAttribute('aria-expanded', 'true');
        this.panel.classList.add('is-visible');

        // Animate speed dial items
        const items = this.panel.querySelectorAll('.speed-dial-item');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('is-visible');
            }, 50 + (index * 50));
        });

        Logger.debug('[QuickActions] Expanded');
    }

    /**
     * Collapse panel
     */
    collapse() {
        this.isExpanded = false;
        this.mainButton.classList.remove('is-expanded');
        this.mainButton.setAttribute('aria-expanded', 'false');
        this.panel.classList.remove('is-visible');

        // Hide speed dial items
        const items = this.panel.querySelectorAll('.speed-dial-item');
        items.forEach((item) => {
            item.classList.remove('is-visible');
        });

        Logger.debug('[QuickActions] Collapsed');
    }

    /**
     * Handle action click
     */
    handleActionClick(index) {
        const action = this.actions[index];
        if (action && typeof action.onClick === 'function') {
            action.onClick();
            this.collapse();
            Logger.info('[QuickActions] Action clicked:', action.label);
        }
    }

    /**
     * Add new action
     */
    addAction(action) {
        this.actions.push(action);
        this.populateActions();
        Logger.info('[QuickActions] Action added:', action.label);
    }

    /**
     * Remove action
     */
    removeAction(label) {
        const index = this.actions.findIndex(a => a.label === label);
        if (index !== -1) {
            this.actions.splice(index, 1);
            this.populateActions();
            Logger.info('[QuickActions] Action removed:', label);
        }
    }

    /**
     * Destroy FAB
     */
    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        Logger.info('[QuickActions] Destroyed');
    }
}

// Auto-initialize
export function initQuickActions() {
    const existingFAB = document.querySelector('.quick-actions-fab');
    if (!existingFAB) {
        return new QuickActionsFAB();
    }
    return null;
}

export default QuickActionsFAB;

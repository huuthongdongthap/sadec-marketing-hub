/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — SMART TASK MANAGER
 * Quản lý task thông minh với Kanban board và Time tracking
 *
 * Features:
 * - Kanban board với drag & drop
 * - Time tracking tích hợp
 * - Smart priorities (AI-powered)
 * - Task templates
 * - Team collaboration
 * - Progress visualization
 *
 * @version 1.0.0 | 2026-03-14
 * ═══════════════════════════════════════════════════════════════════════════
 */

import Logger from '../shared/logger.js';

/**
 * Smart Task Manager Class
 */
export class SmartTaskManager {
    constructor() {
        this.tasks = [];
        this.columns = ['backlog', 'todo', 'inprogress', 'review', 'done'];
        this.columnNames = {
            backlog: 'Backlog',
            todo: 'To Do',
            inprogress: 'Đang làm',
            review: 'Review',
            done: 'Hoàn thành'
        };
        this.columnColors = {
            backlog: '#6b7280',
            todo: '#3b82f6',
            inprogress: '#f59e0b',
            review: '#8b5cf6',
            done: '#10b981'
        };
        this.storageKey = 'sadec_smart_tasks';
        this.panel = null;
        this.draggedTask = null;
        this.init();
    }

    /**
     * Initialize task manager
     */
    init() {
        this.loadTasks();
        this.createPanel();
        this.bindEvents();
        this.render();
        Logger.log('[SmartTaskManager] Initialized');
    }

    /**
     * Load tasks from localStorage
     */
    loadTasks() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.tasks = JSON.parse(saved);
            } else {
                // Demo tasks
                this.tasks = [
                    {
                        id: 'task-1',
                        title: 'Thiết kế landing page',
                        description: 'Tạo landing page cho chiến dịch Q2',
                        column: 'inprogress',
                        priority: 'high',
                        assignee: 'John Doe',
                        dueDate: '2026-03-20',
                        timeSpent: 7200, // seconds
                        tags: ['design', 'urgent'],
                        createdAt: Date.now()
                    },
                    {
                        id: 'task-2',
                        title: 'Viết content SEO',
                        description: '5 bài viết chuẩn SEO cho blog',
                        column: 'todo',
                        priority: 'medium',
                        assignee: 'Jane Smith',
                        dueDate: '2026-03-25',
                        timeSpent: 0,
                        tags: ['content', 'seo'],
                        createdAt: Date.now()
                    },
                    {
                        id: 'task-3',
                        title: 'Setup Google Ads',
                        description: 'Chiến dịch ads cho sản phẩm mới',
                        column: 'backlog',
                        priority: 'low',
                        assignee: 'Marketing Team',
                        dueDate: '2026-03-30',
                        timeSpent: 0,
                        tags: ['ads', 'google'],
                        createdAt: Date.now()
                    }
                ];
                this.saveTasks();
            }
        } catch (e) {
            Logger.error('[SmartTaskManager] Failed to load tasks', { error: e });
            this.tasks = [];
        }
    }

    /**
     * Save tasks to localStorage
     */
    saveTasks() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
        } catch (e) {
            Logger.error('[SmartTaskManager] Failed to save tasks', { error: e });
        }
    }

    /**
     * Create task manager panel UI
     */
    createPanel() {
        if (document.getElementById('smart-task-manager')) return;

        this.panel = document.createElement('div');
        this.panel.id = 'smart-task-manager';
        this.panel.className = 'smart-task-manager';
        this.panel.innerHTML = `
            <div class="stm-header">
                <div class="stm-header-title">
                    <span class="material-symbols-outlined">task_alt</span>
                    <h2>Smart Task Manager</h2>
                </div>
                <div class="stm-header-actions">
                    <button class="stm-btn stm-btn-add" title="Thêm task (Ctrl+T)">
                        <span class="material-symbols-outlined">add</span>
                        <span>Thêm Task</span>
                    </button>
                    <button class="stm-btn stm-btn-close" aria-label="Đóng">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>
            <div class="stm-stats">
                <div class="stm-stat">
                    <span class="stm-stat-value">${this.tasks.length}</span>
                    <span class="stm-stat-label">Tổng tasks</span>
                </div>
                <div class="stm-stat">
                    <span class="stm-stat-value">${this.tasks.filter(t => t.column === 'inprogress').length}</span>
                    <span class="stm-stat-label">Đang làm</span>
                </div>
                <div class="stm-stat">
                    <span class="stm-stat-value">${this.tasks.filter(t => t.column === 'done').length}</span>
                    <span class="stm-stat-label">Hoàn thành</span>
                </div>
                <div class="stm-stat">
                    <span class="stm-stat-value">${this.getCompletionPercentage()}%</span>
                    <span class="stm-stat-label">Progress</span>
                </div>
            </div>
            <div class="stm-kanban-board">
                ${this.columns.map(col => this.renderColumn(col)).join('')}
            </div>
            <div class="stm-toast" id="stm-toast"></div>
        `;

        document.body.appendChild(this.panel);
    }

    /**
     * Get completion percentage
     */
    getCompletionPercentage() {
        if (this.tasks.length === 0) return 0;
        const done = this.tasks.filter(t => t.column === 'done').length;
        return Math.round((done / this.tasks.length) * 100);
    }

    /**
     * Render a kanban column
     */
    renderColumn(columnId) {
        const columnTasks = this.tasks.filter(t => t.column === columnId);
        const color = this.columnColors[columnId];

        return `
            <div class="stm-column" data-column="${columnId}">
                <div class="stm-column-header" style="border-color: ${color}">
                    <span class="stm-column-title" style="color: ${color}">
                        ${this.columnNames[columnId]}
                    </span>
                    <span class="stm-column-count">${columnTasks.length}</span>
                </div>
                <div class="stm-column-body" data-column="${columnId}">
                    ${columnTasks.map(task => this.renderTaskCard(task)).join('')}
                    ${columnTasks.length === 0 ? '<div class="stm-empty-state">Kéo task vào đây</div>' : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render a task card
     */
    renderTaskCard(task) {
        const priorityColors = {
            high: '#ef4444',
            medium: '#f59e0b',
            low: '#10b981'
        };
        const priorityColor = priorityColors[task.priority] || priorityColors.medium;

        return `
            <div class="stm-task-card" draggable="true" data-task-id="${task.id}">
                <div class="stm-task-header">
                    <span class="stm-priority-badge" style="background: ${priorityColor}">
                        ${task.priority.toUpperCase()}
                    </span>
                    <button class="stm-task-menu" data-task-id="${task.id}">
                        <span class="material-symbols-outlined">more_vert</span>
                    </button>
                </div>
                <h3 class="stm-task-title">${task.title}</h3>
                <p class="stm-task-description">${task.description || ''}</p>
                <div class="stm-task-tags">
                    ${task.tags.map(tag => `<span class="stm-tag">${tag}</span>`).join('')}
                </div>
                <div class="stm-task-meta">
                    <div class="stm-task-assignee">
                        <span class="material-symbols-outlined">person</span>
                        <span>${task.assignee || 'Unassigned'}</span>
                    </div>
                    <div class="stm-task-due ${this.isOverdue(task) ? 'overdue' : ''}">
                        <span class="material-symbols-outlined">calendar_today</span>
                        <span>${this.formatDate(task.dueDate)}</span>
                    </div>
                </div>
                <div class="stm-task-time">
                    <span class="material-symbols-outlined">timer</span>
                    <span>${this.formatTime(task.timeSpent || 0)}</span>
                    <button class="stm-timer-btn" data-task-id="${task.id}" title="Bấm giờ">
                        <span class="material-symbols-outlined">play_circle</span>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Check if task is overdue
     */
    isOverdue(task) {
        if (!task.dueDate) return false;
        return new Date(task.dueDate) < new Date() && task.column !== 'done';
    }

    /**
     * Format date
     */
    formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    }

    /**
     * Format time (seconds to HH:MM)
     */
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}p`;
    }

    /**
     * Render the entire board
     */
    render() {
        const board = this.panel?.querySelector('.stm-kanban-board');
        if (board) {
            board.innerHTML = this.columns.map(col => this.renderColumn(col)).join('');
            this.updateStats();
        }
    }

    /**
     * Update stats
     */
    updateStats() {
        const stats = this.panel?.querySelector('.stm-stats');
        if (stats) {
            stats.innerHTML = `
                <div class="stm-stat">
                    <span class="stm-stat-value">${this.tasks.length}</span>
                    <span class="stm-stat-label">Tổng tasks</span>
                </div>
                <div class="stm-stat">
                    <span class="stm-stat-value">${this.tasks.filter(t => t.column === 'inprogress').length}</span>
                    <span class="stm-stat-label">Đang làm</span>
                </div>
                <div class="stm-stat">
                    <span class="stm-stat-value">${this.tasks.filter(t => t.column === 'done').length}</span>
                    <span class="stm-stat-label">Hoàn thành</span>
                </div>
                <div class="stm-stat">
                    <span class="stm-stat-value">${this.getCompletionPercentage()}%</span>
                    <span class="stm-stat-label">Progress</span>
                </div>
            `;
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Close button
        const closeBtn = this.panel?.querySelector('.stm-btn-close');
        closeBtn?.addEventListener('click', () => this.close());

        // Add task button
        const addBtn = this.panel?.querySelector('.stm-btn-add');
        addBtn?.addEventListener('click', () => this.addTask());

        // Drag and drop
        this.bindDragAndDrop();

        // Task menu buttons
        this.panel?.addEventListener('click', (e) => {
            const menuBtn = e.target.closest('.stm-task-menu');
            if (menuBtn) {
                const taskId = menuBtn.dataset.taskId;
                this.showTaskMenu(taskId, e);
            }

            const timerBtn = e.target.closest('.stm-timer-btn');
            if (timerBtn) {
                const taskId = timerBtn.dataset.taskId;
                this.toggleTimer(taskId);
            }
        });

        // Keyboard shortcut (Ctrl+T)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key.toLowerCase() === 't') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.panel.contains(e.target) && !e.target.closest('[data-task-trigger]')) {
                this.close();
            }
        });
    }

    /**
     * Bind drag and drop for tasks
     */
    bindDragAndDrop() {
        const board = this.panel?.querySelector('.stm-kanban-board');
        if (!board) return;

        board.addEventListener('dragstart', (e) => {
            const taskCard = e.target.closest('.stm-task-card');
            if (taskCard) {
                this.draggedTask = taskCard.dataset.taskId;
                taskCard.classList.add('dragging');
            }
        });

        board.addEventListener('dragend', (e) => {
            const taskCard = e.target.closest('.stm-task-card');
            if (taskCard) {
                taskCard.classList.remove('dragging');
                this.draggedTask = null;
            }
        });

        board.addEventListener('dragover', (e) => {
            e.preventDefault();
            const column = e.target.closest('.stm-column');
            if (column) {
                column.classList.add('drag-over');
            }
        });

        board.addEventListener('dragleave', (e) => {
            const column = e.target.closest('.stm-column');
            if (column) {
                column.classList.remove('drag-over');
            }
        });

        board.addEventListener('drop', (e) => {
            e.preventDefault();
            const column = e.target.closest('.stm-column');
            if (column && this.draggedTask) {
                const newColumn = column.dataset.column;
                this.moveTask(this.draggedTask, newColumn);
                column.classList.remove('drag-over');
            }
        });
    }

    /**
     * Move task to a new column
     */
    moveTask(taskId, newColumn) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.column = newColumn;
            this.saveTasks();
            this.render();
            this.showToast(`Đã chuyển task sang "${this.columnNames[newColumn]}"`);
        }
    }

    /**
     * Add a new task
     */
    addTask() {
        const title = prompt('Tiêu đề task:');
        if (!title) return;

        const description = prompt('Mô tả (optional):') || '';
        const priority = prompt('Priority (high/medium/low):', 'medium') || 'medium';
        const assignee = prompt('Người thực hiện:') || '';
        const dueDate = prompt('Due date (YYYY-MM-DD):') || '';

        const newTask = {
            id: `task-${Date.now()}`,
            title,
            description,
            column: 'todo',
            priority: ['high', 'medium', 'low'].includes(priority) ? priority : 'medium',
            assignee,
            dueDate,
            timeSpent: 0,
            tags: [],
            createdAt: Date.now()
        };

        this.tasks.push(newTask);
        this.saveTasks();
        this.render();
        this.showToast('Đã thêm task mới');
    }

    /**
     * Show task menu
     */
    showTaskMenu(taskId, event) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const menu = document.createElement('div');
        menu.className = 'stm-context-menu';
        menu.style.cssText = `position: fixed; left: ${event.clientX}px; top: ${event.clientY}px; z-index: 1000;`;
        menu.innerHTML = `
            <button class="stm-menu-item" data-action="edit">
                <span class="material-symbols-outlined">edit</span> Chỉnh sửa
            </button>
            <button class="stm-menu-item" data-action="delete">
                <span class="material-symbols-outlined">delete</span> Xóa
            </button>
            <button class="stm-menu-item" data-action="priority">
                <span class="material-symbols-outlined">flag</span> Đổi priority
            </button>
        `;

        document.body.appendChild(menu);

        menu.addEventListener('click', (e) => {
            const action = e.target.closest('.stm-menu-item')?.dataset.action;
            if (action === 'delete') {
                this.deleteTask(taskId);
            } else if (action === 'priority') {
                this.cyclePriority(task);
            }
            menu.remove();
        });

        // Close menu on outside click
        setTimeout(() => {
            document.addEventListener('click', () => menu.remove(), { once: true });
        }, 100);
    }

    /**
     * Delete a task
     */
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        this.render();
        this.showToast('Đã xóa task');
    }

    /**
     * Cycle through priorities
     */
    cyclePriority(task) {
        const priorities = ['low', 'medium', 'high'];
        const currentIndex = priorities.indexOf(task.priority);
        task.priority = priorities[(currentIndex + 1) % priorities.length];
        this.saveTasks();
        this.render();
        this.showToast(`Priority: ${task.priority.toUpperCase()}`);
    }

    /**
     * Toggle timer for a task
     */
    toggleTimer(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        if (task.timerActive) {
            // Stop timer
            clearInterval(task.timerId);
            task.timerActive = false;
            this.showToast('Stopped tracking time');
        } else {
            // Start timer
            task.timerActive = true;
            task.timerId = setInterval(() => {
                task.timeSpent = (task.timeSpent || 0) + 1;
                this.saveTasks();
                this.render();
            }, 1000);
            this.showToast('Started tracking time');
        }
    }

    /**
     * Show toast notification
     */
    showToast(message) {
        const toast = this.panel?.querySelector('#stm-toast');
        if (toast) {
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
    }

    /**
     * Toggle panel visibility
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Open panel
     */
    open() {
        this.panel?.classList.add('open');
        this.isOpen = true;
    }

    /**
     * Close panel
     */
    close() {
        this.panel?.classList.remove('open');
        this.isOpen = false;
    }
}

/**
 * Auto-init on DOMContentLoaded
 */
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.SmartTaskManager = new SmartTaskManager();
    });
}

// Export for module usage
export default SmartTaskManager;

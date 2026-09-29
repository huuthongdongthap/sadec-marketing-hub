/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QUICK NOTES WIDGET
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Main widget component - renders and manages widget container
 *
 * @module features/quick-notes/notes-widget
 */

import { Logger } from '../../shared/logger.js';
import { WIDGET_ID } from './notes-constants.js';

/**
 * Create widget container if not exists
 */
export function createWidget() {
    if (document.getElementById(WIDGET_ID)) return;

    const widget = document.createElement('div');
    widget.id = WIDGET_ID;
    widget.className = 'quick-notes-widget';

    widget.innerHTML = `
        <div class="quick-notes-header">
            <div class="quick-notes-title">
                <span class="material-symbols-outlined">sticky_note_2</span>
                Ghi Chú Nhanh
            </div>
            <div class="quick-notes-actions">
                <button class="quick-notes-add" aria-label="Thêm ghi chú" title="Thêm ghi chú (Ctrl+N)">
                    <span class="material-symbols-outlined">add</span>
                </button>
                <button class="quick-notes-collapse" aria-label="Thu gọn" title="Thu gọn/Mở rộng">
                    <span class="material-symbols-outlined">keyboard_arrow_up</span>
                </button>
            </div>
        </div>
        <div class="quick-notes-content">
            <div class="quick-notes-list"></div>
        </div>
    `;

    // Add to page
    const target = document.querySelector('.admin-header') ||
                   document.querySelector('header') ||
                   document.querySelector('.dashboard-content');

    if (target) {
        target.after(widget);
    } else {
        document.body.appendChild(widget);
    }

    Logger.debug('[QuickNotes Widget] Created');
}

/**
 * Toggle widget collapse state
 */
export function toggleCollapse() {
    const widget = document.getElementById(WIDGET_ID);
    const collapseBtn = widget.querySelector('.quick-notes-collapse .material-symbols-outlined');

    widget.classList.toggle('collapsed');

    if (widget.classList.contains('collapsed')) {
        collapseBtn.textContent = 'keyboard_arrow_down';
    } else {
        collapseBtn.textContent = 'keyboard_arrow_up';
    }

    Logger.debug('[QuickNotes Widget] Toggled collapse');
}

/**
 * Get widget element
 * @returns {HTMLElement|null}
 */
export function getWidget() {
    return document.getElementById(WIDGET_ID);
}

/**
 * Get notes list container
 * @returns {HTMLElement|null}
 */
export function getNotesList() {
    return document.querySelector('.quick-notes-list');
}

/**
 * Render widget content
 * @param {string} html - HTML content to render
 */
export function renderNotesList(html) {
    const list = getNotesList();
    if (!list) return;
    list.innerHTML = html;
}

/**
 * Show empty state
 */
export function showEmptyState() {
    const list = getNotesList();
    if (!list) return;
    list.innerHTML = `
        <div class="quick-notes-empty">
            <span class="material-symbols-outlined">note_add</span>
            <p>Chưa có ghi chú nào</p>
            <button class="quick-notes-create">Tạo ghi chú đầu tiên</button>
        </div>
    `;
}

/**
 * Hide empty state
 */
export function hideEmptyState() {
    const empty = document.querySelector('.quick-notes-empty');
    if (empty) empty.style.display = 'none';
}

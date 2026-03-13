/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QUICK NOTES WIDGET — Sa Đéc Marketing Hub
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * - Sticky notes on dashboard
 * - Add/edit/delete notes
 * - Drag to reorder
 * - Color coding
 * - LocalStorage persistence
 * - Auto-save
 *
 * Usage:
 *   import { initQuickNotes } from './quick-notes.js';
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from '../shared/logger.js';

const STORAGE_KEY = 'sadec-quick-notes';
const COLORS = [
    { name: 'Vàng', value: '#fff9c4', dark: '#fbc02d' },
    { name: 'Hồng', value: '#f8bbd9', dark: '#ec407a' },
    { name: 'Xanh dương', value: '#b3e5fc', dark: '#039be5' },
    { name: 'Xanh lá', value: '#c8e6c9', dark: '#43a047' },
    { name: 'Cam', value: '#ffe0b2', dark: '#fb8c00' },
    { name: 'Tím', value: '#e1bee7', dark: '#8e24aa' }
];

let notes = [];

/**
 * Initialize quick notes widget
 */
export function initQuickNotes() {
    // Load notes from storage
    loadNotes();

    // Create widget
    createWidget();

    // Render notes
    renderNotes();

    Logger.info('[QuickNotes] Initialized');
}

/**
 * Load notes from localStorage
 */
function loadNotes() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        notes = stored ? JSON.parse(stored) : [];
        Logger.debug('[QuickNotes] Loaded', notes.length, 'notes');
    } catch (error) {
        Logger.error('[QuickNotes] Load error:', error);
        notes = [];
    }
}

/**
 * Save notes to localStorage
 */
function saveNotes() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        Logger.debug('[QuickNotes] Saved', notes.length, 'notes');
    } catch (error) {
        Logger.error('[QuickNotes] Save error:', error);
    }
}

/**
 * Create widget container
 */
function createWidget() {
    if (document.getElementById('quick-notes-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'quick-notes-widget';
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
            <div class="quick-notes-empty">
                <span class="material-symbols-outlined">note_add</span>
                <p>Chưa có ghi chú nào</p>
                <button class="quick-notes-create">Tạo ghi chú đầu tiên</button>
            </div>
        </div>
    `;

    // Add event listeners
    widget.querySelector('.quick-notes-add')?.addEventListener('click', createNewNote);
    widget.querySelector('.quick-notes-collapse')?.addEventListener('click', toggleCollapse);
    widget.querySelector('.quick-notes-create')?.addEventListener('click', createNewNote);

    // Add to page (after header or at body)
    const target = document.querySelector('.admin-header') ||
                   document.querySelector('header') ||
                   document.querySelector('.dashboard-content');

    if (target) {
        target.after(widget);
    } else {
        document.body.appendChild(widget);
    }

    // Add styles
    addStyles();

    Logger.debug('[QuickNotes] Widget created');
}

/**
 * Toggle widget collapse state
 */
function toggleCollapse() {
    const widget = document.getElementById('quick-notes-widget');
    const collapseBtn = widget.querySelector('.quick-notes-collapse .material-symbols-outlined');

    widget.classList.toggle('collapsed');

    if (widget.classList.contains('collapsed')) {
        collapseBtn.textContent = 'keyboard_arrow_down';
    } else {
        collapseBtn.textContent = 'keyboard_arrow_up';
    }

    Logger.debug('[QuickNotes] Toggled collapse');
}

/**
 * Render all notes
 */
function renderNotes() {
    const list = document.querySelector('.quick-notes-list');
    const empty = document.querySelector('.quick-notes-empty');

    if (!list) return;

    if (notes.length === 0) {
        empty.style.display = 'flex';
        list.innerHTML = '';
    } else {
        empty.style.display = 'none';
        list.innerHTML = notes.map((note, index) => renderNote(note, index)).join('');

        // Add event listeners to rendered notes
        list.querySelectorAll('.quick-note-item').forEach(item => {
            const noteId = item.dataset.id;
            attachNoteListeners(item, noteId);
        });
    }
}

/**
 * Render single note
 */
function renderNote(note, index) {
    const color = COLORS.find(c => c.value === note.color) || COLORS[0];
    const date = new Date(note.updatedAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
        <div class="quick-note-item" data-id="${note.id}" data-index="${index}" style="background-color: ${note.color}">
            <div class="quick-note-header">
                <div class="quick-note-color-dot" style="background-color: ${color.dark}" title="Màu: ${color.name}"></div>
                <div class="quick-note-date">${date}</div>
                <div class="quick-note-menu">
                    <button class="quick-note-edit" aria-label="Sửa" title="Sửa">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="quick-note-delete" aria-label="Xóa" title="Xóa">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            </div>
            <div class="quick-note-content">${escapeHtml(note.content)}</div>
        </div>
    `;
}

/**
 * Attach event listeners to note
 */
function attachNoteListeners(item, noteId) {
    const editBtn = item.querySelector('.quick-note-edit');
    const deleteBtn = item.querySelector('.quick-note-delete');

    editBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        editNote(noteId);
    });

    deleteBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteNote(noteId);
    });

    // Click on note to edit
    item.addEventListener('click', () => editNote(noteId));
}

/**
 * Create new note
 */
function createNewNote() {
    const defaultColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    const note = {
        id: Date.now().toString(),
        content: '',
        color: defaultColor.value,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    notes.unshift(note);
    saveNotes();
    renderNotes();

    // Open edit modal immediately
    openEditModal(note.id);

    Logger.info('[QuickNotes] Created new note:', note.id);
}

/**
 * Edit note
 */
function editNote(noteId) {
    openEditModal(noteId);
}

/**
 * Delete note
 */
function deleteNote(noteId) {
    if (!confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) return;

    notes = notes.filter(n => n.id !== noteId);
    saveNotes();
    renderNotes();

    Logger.info('[QuickNotes] Deleted note:', noteId);
}

/**
 * Update note
 */
function updateNote(noteId, content, color) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    note.content = content;
    note.color = color;
    note.updatedAt = new Date().toISOString();

    saveNotes();
    renderNotes();

    Logger.info('[QuickNotes] Updated note:', noteId);
}

/**
 * Open edit modal
 */
function openEditModal(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    // Create modal if not exists
    createEditModal();

    const modal = document.getElementById('quick-note-edit-modal');
    const textarea = modal.querySelector('textarea');
    const colorPicker = modal.querySelector('.quick-note-color-picker');

    // Set current values
    textarea.value = note.content;
    colorPicker.innerHTML = renderColorOptions(note.color);

    // Show modal
    modal.classList.add('visible');
    textarea.focus();

    // Add event listeners
    const saveBtn = modal.querySelector('.quick-note-save');
    const cancelBtn = modal.querySelector('.quick-note-cancel');
    const overlay = modal.querySelector('.quick-note-modal-overlay');

    saveBtn?.removeEventListener('click', onSave);
    cancelBtn?.removeEventListener('click', onClose);
    overlay?.removeEventListener('click', onClose);

    saveBtn?.addEventListener('click', onSave);
    cancelBtn?.addEventListener('click', onClose);
    overlay?.addEventListener('click', onClose);

    // Handle keyboard
    function onSave(e) {
        e.preventDefault();
        const content = textarea.value.trim();
        const color = colorPicker.querySelector('input:checked')?.value || note.color;

        if (content) {
            updateNote(noteId, content, color);
            onClose();
        } else {
            // Empty content = delete
            if (confirm('Ghi chú trống sẽ bị xóa. Tiếp tục?')) {
                deleteNote(noteId);
                onClose();
            }
        }
    }

    function onClose() {
        modal.classList.remove('visible');
    }

    // Handle Escape key
    function handleEscape(e) {
        if (e.key === 'Escape') {
            onClose();
            document.removeEventListener('keydown', handleEscape);
        }
    }
    document.addEventListener('keydown', handleEscape);
}

/**
 * Render color options
 */
function renderColorOptions(selectedColor) {
    return COLORS.map(color => `
        <label class="quick-note-color-option ${color.value === selectedColor ? 'selected' : ''}"
               style="background-color: ${color.value}">
            <input type="radio" name="note-color" value="${color.value}"
                   ${color.value === selectedColor ? 'checked' : ''}>
            <span class="quick-note-color-name">${color.name}</span>
        </label>
    `).join('');
}

/**
 * Create edit modal
 */
function createEditModal() {
    if (document.getElementById('quick-note-edit-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'quick-note-edit-modal';
    modal.className = 'quick-note-modal';

    modal.innerHTML = `
        <div class="quick-note-modal-overlay"></div>
        <div class="quick-note-modal-content">
            <div class="quick-note-modal-header">
                <h3>
                    <span class="material-symbols-outlined">edit_note</span>
                    Chỉnh Sửa Ghi Chú
                </h3>
                <button class="quick-note-modal-close" aria-label="Đóng">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="quick-note-modal-body">
                <textarea placeholder="Nhập nội dung ghi chú của bạn..." rows="6"></textarea>
                <div class="quick-note-color-picker"></div>
            </div>
            <div class="quick-note-modal-footer">
                <button type="button" class="quick-note-cancel">Hủy</button>
                <button type="button" class="quick-note-save">
                    <span class="material-symbols-outlined">check</span>
                    Lưu
                </button>
            </div>
        </div>
    `;

    // Close on X button
    modal.querySelector('.quick-note-modal-close')?.addEventListener('click', () => {
        modal.classList.remove('visible');
    });

    document.body.appendChild(modal);
    Logger.debug('[QuickNotes] Edit modal created');
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}

/**
 * Add styles
 */
function addStyles() {
    if (document.getElementById('quick-notes-styles')) return;

    const style = document.createElement('style');
    style.id = 'quick-notes-styles';
    style.textContent = `
        /* Widget container */
        .quick-notes-widget {
            margin: 20px;
            background: var(--md-sys-color-surface, #fff);
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            border: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
            overflow: hidden;
        }

        .quick-notes-widget.collapsed .quick-notes-content {
            display: none;
        }

        /* Header */
        .quick-notes-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            background: var(--md-sys-color-surface-container, #f8f9fa);
            border-bottom: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
        }

        .quick-notes-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            font-size: 16px;
            color: var(--md-sys-color-on-surface, #333);
        }

        .quick-notes-title .material-symbols-outlined {
            color: var(--md-sys-color-primary, #2e7d32);
        }

        .quick-notes-actions {
            display: flex;
            gap: 8px;
        }

        .quick-notes-actions button {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: none;
            background: transparent;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
        }

        .quick-notes-actions button:hover {
            background: var(--md-sys-color-surface-container-hover, #e8e8e8);
        }

        .quick-notes-actions button .material-symbols-outlined {
            color: var(--md-sys-color-on-surface-variant, #666);
            font-size: 20px;
        }

        /* Content */
        .quick-notes-content {
            padding: 16px;
        }

        .quick-notes-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 12px;
        }

        .quick-notes-empty {
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            text-align: center;
            color: var(--md-sys-color-on-surface-variant, #999);
        }

        .quick-notes-empty .material-symbols-outlined {
            font-size: 48px;
            margin-bottom: 12px;
            opacity: 0.5;
        }

        .quick-notes-empty p {
            margin: 8px 0 16px;
            font-size: 14px;
        }

        .quick-notes-create {
            padding: 8px 16px;
            background: var(--md-sys-color-primary, #2e7d32);
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .quick-notes-create:hover {
            background: var(--md-sys-color-primary-container, #1b5e20);
        }

        /* Note item */
        .quick-note-item {
            padding: 12px;
            border-radius: 8px;
            min-height: 120px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .quick-note-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .quick-note-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
        }

        .quick-note-color-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        .quick-note-date {
            font-size: 11px;
            color: rgba(0, 0, 0, 0.5);
            flex: 1;
        }

        .quick-note-menu {
            display: flex;
            gap: 4px;
            opacity: 0;
            transition: opacity 0.2s;
        }

        .quick-note-item:hover .quick-note-menu {
            opacity: 1;
        }

        .quick-note-menu button {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: none;
            background: rgba(0, 0, 0, 0.05);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .quick-note-menu button:hover {
            background: rgba(0, 0, 0, 0.1);
        }

        .quick-note-menu button .material-symbols-outlined {
            font-size: 16px;
            color: rgba(0, 0, 0, 0.5);
        }

        .quick-note-content {
            font-size: 13px;
            line-height: 1.5;
            color: rgba(0, 0, 0, 0.8);
            word-break: break-word;
        }

        /* Modal */
        .quick-note-modal {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 10000;
            align-items: center;
            justify-content: center;
        }

        .quick-note-modal.visible {
            display: flex;
        }

        .quick-note-modal-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
        }

        .quick-note-modal-content {
            position: relative;
            width: 100%;
            max-width: 500px;
            max-height: 80vh;
            margin: 16px;
            background: var(--md-sys-color-surface, #fff);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            overflow: hidden;
        }

        .quick-note-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
        }

        .quick-note-modal-header h3 {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0;
            font-size: 16px;
            color: var(--md-sys-color-on-surface, #333);
        }

        .quick-note-modal-header .material-symbols-outlined {
            color: var(--md-sys-color-primary, #2e7d32);
        }

        .quick-note-modal-close {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: none;
            background: transparent;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .quick-note-modal-close:hover {
            background: var(--md-sys-color-surface-container-hover, #f0f0f0);
        }

        .quick-note-modal-body {
            padding: 20px;
        }

        .quick-note-modal-body textarea {
            width: 100%;
            border: 1px solid var(--md-sys-color-outline, #ddd);
            border-radius: 8px;
            padding: 12px;
            font-size: 14px;
            font-family: inherit;
            resize: vertical;
            min-height: 120px;
            margin-bottom: 16px;
            background: var(--md-sys-color-surface-container, #f9f9f9);
        }

        .quick-note-modal-body textarea:focus {
            outline: none;
            border-color: var(--md-sys-color-primary, #2e7d32);
        }

        .quick-note-color-picker {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .quick-note-color-option {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            cursor: pointer;
            position: relative;
            border: 2px solid transparent;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .quick-note-color-option:hover {
            transform: scale(1.1);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .quick-note-color-option.selected {
            border-color: var(--md-sys-color-on-surface, #333);
        }

        .quick-note-color-option input {
            position: absolute;
            opacity: 0;
            pointer-events: none;
        }

        .quick-note-color-name {
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            white-space: nowrap;
            background: var(--md-sys-color-inverse-surface, #333);
            color: var(--md-sys-color-inverse-on-surface, #fff);
            padding: 2px 6px;
            border-radius: 4px;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s;
        }

        .quick-note-color-option:hover .quick-note-color-name {
            opacity: 1;
        }

        .quick-note-modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            padding: 16px 20px;
            border-top: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
            background: var(--md-sys-color-surface-container, #f8f9fa);
        }

        .quick-note-cancel {
            padding: 8px 16px;
            border: none;
            border-radius: 8px;
            background: transparent;
            color: var(--md-sys-color-on-surface-variant, #666);
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
        }

        .quick-note-cancel:hover {
            background: var(--md-sys-color-surface-container-hover, #e8e8e8);
        }

        .quick-note-save {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 8px 16px;
            border: none;
            border-radius: 8px;
            background: var(--md-sys-color-primary, #2e7d32);
            color: #fff;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background-color 0.2s;
        }

        .quick-note-save:hover {
            background: var(--md-sys-color-primary-container, #1b5e20);
        }

        .quick-note-save .material-symbols-outlined {
            font-size: 18px;
        }

        /* Dark mode support */
        [data-theme="dark"] .quick-notes-widget {
            background: var(--md-sys-color-surface, #1e1e1e);
            border-color: var(--md-sys-color-outline-variant, rgba(255,255,255,0.1));
        }

        [data-theme="dark"] .quick-notes-header {
            background: var(--md-sys-color-surface-container, rgba(255,255,255,0.05));
            border-color: var(--md-sys-color-outline-variant, rgba(255,255,255,0.1));
        }

        [data-theme="dark"] .quick-note-item {
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        [data-theme="dark"] .quick-note-content {
            color: rgba(255, 255, 255, 0.9);
        }

        [data-theme="dark"] .quick-note-modal-content {
            background: var(--md-sys-color-surface, #1e1e1e);
            border-color: var(--md-sys-color-outline-variant, rgba(255,255,255,0.1));
        }

        [data-theme="dark"] .quick-note-modal-body textarea {
            background: var(--md-sys-color-surface-container, rgba(255,255,255,0.05));
            border-color: var(--md-sys-color-outline, rgba(255,255,255,0.1));
            color: var(--md-sys-color-on-surface, #e0e0e0);
        }

        [data-theme="dark"] .quick-note-modal-footer {
            background: var(--md-sys-color-surface-container, rgba(255,255,255,0.05));
            border-color: var(--md-sys-color-outline-variant, rgba(255,255,255,0.1));
        }
    `;

    document.head.appendChild(style);
}

// Auto-init on DOM ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initQuickNotes);
    } else {
        initQuickNotes();
    }
}

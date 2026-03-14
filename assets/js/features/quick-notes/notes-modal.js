/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QUICK NOTES EDIT MODAL
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Modal component for editing notes
 *
 * @module features/quick-notes/notes-modal
 */

import { Logger } from '../../shared/logger.js';
import { COLORS, getRandomColor } from './notes-constants.js';
import { renderColorOptions } from './notes-renderer.js';

/**
 * Create edit modal if not exists
 */
export function createEditModal() {
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
    Logger.debug('[QuickNotes Modal] Created');
}

/**
 * Open edit modal with note data
 * @param {Object} note - Note object to edit
 * @param {Function} onSave - Callback when note is saved
 * @param {Function} onDelete - Callback when note is deleted
 */
export function openEditModal(note, onSave, onDelete) {
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
    const closeBtn = modal.querySelector('.quick-note-modal-close');

    // Remove old listeners
    const cloneSave = saveBtn.cloneNode(true);
    const cloneCancel = cancelBtn.cloneNode(true);
    const cloneOverlay = overlay.cloneNode(true);
    const cloneClose = closeBtn.cloneNode(true);

    saveBtn.parentNode.replaceChild(cloneSave, saveBtn);
    cancelBtn.parentNode.replaceChild(cloneCancel, cancelBtn);
    overlay.parentNode.replaceChild(cloneOverlay, overlay);
    closeBtn.parentNode.replaceChild(cloneClose, closeBtn);

    // Add new listeners
    cloneSave.addEventListener('click', (e) => {
        e.preventDefault();
        const content = textarea.value.trim();
        const color = colorPicker.querySelector('input:checked')?.value || note.color;

        if (content) {
            onSave(content, color);
        } else {
            // Empty content = delete
            if (confirm('Ghi chú trống sẽ bị xóa. Tiếp tục?')) {
                onDelete();
            }
        }
        closeModal();
    });

    cloneCancel.addEventListener('click', closeModal);
    cloneOverlay.addEventListener('click', closeModal);
    cloneClose.addEventListener('click', closeModal);

    // Handle Escape key
    function handleEscape(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    }
    document.addEventListener('keydown', handleEscape);
}

/**
 * Close edit modal
 */
export function closeModal() {
    const modal = document.getElementById('quick-note-edit-modal');
    if (modal) {
        modal.classList.remove('visible');
    }
}

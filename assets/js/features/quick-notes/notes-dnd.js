/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QUICK NOTES DRAG-AND-DROP
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Drag-and-drop functionality for reordering notes
 *
 * @module features/quick-notes/notes-dnd
 */

import { Logger } from '../../shared/logger.js';
import { reorderNotes, saveNotes } from './notes-storage.js';
import { renderNote } from './notes-renderer.js';

/**
 * Initialize drag-and-drop for a note element
 * @param {HTMLElement} item - Note DOM element
 * @param {string} noteId - Note ID
 */
export function initDragAndDrop(item, noteId) {
    item.setAttribute('draggable', 'true');
    item.style.cursor = 'grab';

    item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', noteId);
        e.dataTransfer.effectAllowed = 'move';
        item.classList.add('dragging');
        item.style.opacity = '0.5';
    });

    item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        item.style.opacity = '1';
        document.querySelectorAll('.quick-note-item').forEach(el => {
            el.style.borderTop = '';
        });
    });

    item.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const draggingEl = document.querySelector('.quick-note-item.dragging');
        if (!draggingEl || draggingEl === item) return;

        const rect = item.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;

        if (e.clientY < midpoint) {
            item.style.borderTop = '2px solid #00796b';
        } else {
            item.style.borderTop = '';
        }
    });

    item.addEventListener('dragleave', () => {
        item.style.borderTop = '';
    });

    item.addEventListener('drop', (e) => {
        e.preventDefault();
        item.style.borderTop = '';

        const draggedNoteId = e.dataTransfer.getData('text/plain');
        if (!draggedNoteId || draggedNoteId === noteId) return;

        // Dispatch custom event for parent component to handle
        const event = new CustomEvent('quick-notes:reorder', {
            detail: { draggedId: draggedNoteId, targetId: noteId, insertBefore: e.clientY < (item.getBoundingClientRect().top + item.getBoundingClientRect().height / 2) }
        });
        document.dispatchEvent(event);

        Logger.info('[QuickNotes DnD] Reorder:', draggedNoteId, '->', noteId);
    });
}

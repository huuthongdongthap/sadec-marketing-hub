/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QUICK NOTES COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Main component - orchestrates all sub-modules
 *
 * @module features/quick-notes/notes-component
 */

import { Logger } from '../../shared/logger.js';
import { loadNotes, saveNotes, createNote, updateNote, deleteNote, reorderNotes } from './notes-storage.js';
import { renderNote, renderEmptyState, escapeHtml } from './notes-renderer.js';
import { createWidget, toggleCollapse, getWidget, getNotesList, showEmptyState, hideEmptyState, renderNotesList } from './notes-widget.js';
import { openEditModal, closeModal } from './notes-modal.js';
import { initDragAndDrop } from './notes-dnd.js';
import { getRandomColor, WIDGET_ID } from './notes-constants.js';
import { addWidgetStyles } from './notes-styles.js';

// Internal state
let notes = [];

/**
 * Initialize quick notes widget
 */
export function initQuickNotes() {
    // Load notes from storage
    notes = loadNotes();

    // Create widget
    createWidget();
    addWidgetStyles();

    // Attach widget event listeners
    attachWidgetListeners();

    // Render notes
    renderNotes();

    // Listen for global events
    document.addEventListener('quick-notes:open', () => createNewNote());
    document.addEventListener('quick-notes:reorder', handleReorder);

    Logger.info('[QuickNotes] Initialized');
}

/**
 * Attach event listeners to widget
 */
function attachWidgetListeners() {
    const widget = getWidget();
    if (!widget) return;

    widget.querySelector('.quick-notes-add')?.addEventListener('click', createNewNote);
    widget.querySelector('.quick-notes-collapse')?.addEventListener('click', toggleCollapse);
    widget.querySelector('.quick-notes-create')?.addEventListener('click', createNewNote);
}

/**
 * Render all notes
 */
export function renderNotes() {
    const list = getNotesList();
    if (!list) return;

    if (notes.length === 0) {
        showEmptyState();
    } else {
        hideEmptyState();
        list.innerHTML = notes.map((note, index) => renderNote(note, index)).join('');

        // Attach event listeners to rendered notes
        list.querySelectorAll('.quick-note-item').forEach(item => {
            const noteId = item.dataset.id;
            attachNoteListeners(item, noteId);
        });
    }
}

/**
 * Attach event listeners to a note item
 * @param {HTMLElement} item - Note DOM element
 * @param {string} noteId - Note ID
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
        deleteNoteById(noteId);
    });

    // Click on note to edit
    item.addEventListener('click', () => editNote(noteId));

    // Add drag-and-drop
    initDragAndDrop(item, noteId);
}

/**
 * Create new note
 */
export function createNewNote() {
    const note = createNote('', getRandomColor());
    notes.unshift(note);
    saveNotes(notes);
    renderNotes();

    // Open edit modal immediately
    openEditModal(note,
        (content, color) => {
            const updated = updateNote(notes, note.id, { content, color });
            notes = updated;
            saveNotes(notes);
            renderNotes();
            Logger.info('[QuickNotes] Created note:', note.id);
        },
        () => {
            deleteNoteById(note.id);
        }
    );
}

/**
 * Edit note
 * @param {string} noteId - Note ID
 */
function editNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    openEditModal(note,
        (content, color) => {
            const updated = updateNote(notes, noteId, { content, color });
            notes = updated;
            saveNotes(notes);
            renderNotes();
            Logger.info('[QuickNotes] Updated note:', noteId);
        },
        () => {
            deleteNoteById(noteId);
        }
    );
}

/**
 * Delete note by ID
 * @param {string} noteId - Note ID
 */
function deleteNoteById(noteId) {
    if (!confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) return;

    notes = deleteNote(notes, noteId);
    saveNotes(notes);
    renderNotes();

    Logger.info('[QuickNotes] Deleted note:', noteId);
}

/**
 * Handle note reorder event
 * @param {CustomEvent} event - Reorder event
 */
function handleReorder(event) {
    const { draggedId, targetId, insertBefore } = event.detail;
    notes = reorderNotes(notes, draggedId, targetId, insertBefore);
    saveNotes(notes);
    renderNotes();
}

/**
 * Get all notes
 * @returns {Array<Object>}
 */
export function getNotes() {
    return [...notes];
}

/**
 * Get note by ID
 * @param {string} noteId - Note ID
 * @returns {Object|null}
 */
export function getNoteById(noteId) {
    return notes.find(n => n.id === noteId) || null;
}

/**
 * Clear all notes (for testing)
 */
export function clearNotes() {
    notes = [];
    saveNotes(notes);
    renderNotes();
}

// Auto-init on DOM ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initQuickNotes);
    } else {
        initQuickNotes();
    }
}

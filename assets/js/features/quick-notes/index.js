/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QUICK NOTES - MAIN EXPORT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Unified export for quick notes component
 *
 * @module features/quick-notes
 */

// Main component
export { initQuickNotes, renderNotes, createNewNote, getNotes, getNoteById, clearNotes } from './notes-component.js';

// Storage service
export { loadNotes, saveNotes, createNote, updateNote, deleteNote, reorderNotes } from './notes-storage.js';

// Renderer
export { renderNote, renderEmptyState, renderColorOptions, escapeHtml } from './notes-renderer.js';

// Widget
export { createWidget, toggleCollapse, getWidget, getNotesList } from './notes-widget.js';

// Modal
export { createEditModal, openEditModal, closeModal } from './notes-modal.js';

// Drag-and-drop
export { initDragAndDrop } from './notes-dnd.js';

// Constants
export { COLORS, STORAGE_KEY, WIDGET_ID, MODAL_ID, getRandomColor } from './notes-constants.js';

// Styles
export { addWidgetStyles } from './notes-styles.js';

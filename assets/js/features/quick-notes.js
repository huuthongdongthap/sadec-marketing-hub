/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QUICK NOTES WIDGET — Sa Đéc Marketing Hub
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DEPRECATED: This file has been refactored into modular components.
 * Please use the new module instead:
 *
 *   import { initQuickNotes } from './quick-notes/index.js';
 *
 * This file now delegates to the new module for backward compatibility.
 *
 * New modular structure:
 * - notes-component.js — Main orchestration
 * - notes-storage.js — LocalStorage persistence
 * - notes-renderer.js — UI rendering
 * - notes-widget.js — Widget container
 * - notes-modal.js — Edit modal
 * - notes-dnd.js — Drag-and-drop
 * - notes-constants.js — Shared constants
 * - notes-styles.js — CSS styles
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Re-export from new modular structure for backward compatibility
export {
    initQuickNotes,
    renderNotes,
    createNewNote,
    getNotes,
    getNoteById,
    clearNotes,
    loadNotes,
    saveNotes,
    createNote,
    updateNote,
    deleteNote,
    reorderNotes,
    renderNote,
    renderEmptyState,
    renderColorOptions,
    escapeHtml,
    createWidget,
    toggleCollapse,
    getWidget,
    getNotesList,
    createEditModal,
    openEditModal,
    closeModal,
    initDragAndDrop,
    COLORS,
    STORAGE_KEY,
    WIDGET_ID,
    MODAL_ID,
    getRandomColor,
    addWidgetStyles
} from './quick-notes/index.js';

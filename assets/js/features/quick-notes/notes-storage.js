/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QUICK NOTES STORAGE SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Handles localStorage persistence for quick notes
 *
 * @module features/quick-notes/notes-storage
 */

import { Logger } from '../../shared/logger.js';

const STORAGE_KEY = 'sadec-quick-notes';

/**
 * Load notes from localStorage
 * @returns {Array<Object>} Array of note objects
 */
export function loadNotes() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const notes = stored ? JSON.parse(stored) : [];
        Logger.debug('[QuickNotes Storage] Loaded', notes.length, 'notes');
        return notes;
    } catch (error) {
        Logger.error('[QuickNotes Storage] Load error:', error);
        return [];
    }
}

/**
 * Save notes to localStorage
 * @param {Array<Object>} notes - Array of note objects to save
 */
export function saveNotes(notes) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        Logger.debug('[QuickNotes Storage] Saved', notes.length, 'notes');
    } catch (error) {
        Logger.error('[QuickNotes Storage] Save error:', error);
    }
}

/**
 * Create a new note object
 * @param {string} content - Note content
 * @param {string} color - Note background color
 * @returns {Object} New note object
 */
export function createNote(content, color) {
    return {
        id: Date.now().toString(),
        content,
        color,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

/**
 * Update an existing note
 * @param {Array<Object>} notes - Array of notes
 * @param {string} noteId - Note ID to update
 * @param {Object} updates - Fields to update
 * @returns {Array<Object>} Updated notes array
 */
export function updateNote(notes, noteId, updates) {
    return notes.map(note => {
        if (note.id === noteId) {
            return {
                ...note,
                ...updates,
                updatedAt: new Date().toISOString()
            };
        }
        return note;
    });
}

/**
 * Delete a note
 * @param {Array<Object>} notes - Array of notes
 * @param {string} noteId - Note ID to delete
 * @returns {Array<Object>} Filtered notes array
 */
export function deleteNote(notes, noteId) {
    return notes.filter(n => n.id !== noteId);
}

/**
 * Reorder notes (for drag-and-drop)
 * @param {Array<Object>} notes - Array of notes
 * @param {string} draggedId - ID of note being dragged
 * @param {string} targetId - ID of target position
 * @param {boolean} insertBefore - Insert before or after target
 * @returns {Array<Object>} Reordered notes array
 */
export function reorderNotes(notes, draggedId, targetId, insertBefore) {
    const draggedIndex = notes.findIndex(n => n.id === draggedId);
    const targetIndex = notes.findIndex(n => n.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return notes;

    // Remove dragged note
    const [draggedNote] = notes.splice(draggedIndex, 1);

    // Insert at new position
    const newTargetIndex = notes.findIndex(n => n.id === targetId);
    const insertIndex = insertBefore ? newTargetIndex : newTargetIndex + 1;

    notes.splice(insertIndex, 0, draggedNote);
    return notes;
}

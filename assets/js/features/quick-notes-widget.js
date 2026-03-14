/**
 * Quick Notes 2026 - Ghi chú nhanh
 * Feature: Sticky notes widget với drag-and-drop
 */

class QuickNotesWidget {
  constructor() {
    this.notes = [];
    this.draggedNote = null;
    this.storageKey = 'quick-notes-2026';
    this.init();
  }

  init() {
    this.loadNotes();
    this.createUI();
    this.setupEventListeners();
    this.renderNotes();
  }

  /**
   * Load notes from localStorage
   */
  loadNotes() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        this.notes = JSON.parse(saved);
      } catch (e) {
        this.notes = [];
      }
    }
  }

  /**
   * Save notes to localStorage
   */
  saveNotes() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.notes));
  }

  /**
   * Create widget UI
   */
  createUI() {
    // Widget container
    this.widget = document.createElement('div');
    this.widget.className = 'quick-notes-widget';
    this.widget.style.cssText = `
      position: fixed;
      top: 80px;
      right: 24px;
      width: 320px;
      max-height: calc(100vh - 160px);
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      z-index: 999;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: transform 0.3s ease, opacity 0.3s ease;
    `;
    this.widget.style.transform = 'translateX(calc(100% + 24px))';
    this.widget.style.opacity = '0';
    document.body.appendChild(this.widget);

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 16px;
      background: linear-gradient(135deg, #006A60, #00897B);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <h3 style="margin: 0; font-size: 16px;">📝 Quick Notes</h3>
      <button class="notes-close" style="background: none; border: none; color: white; cursor: pointer; font-size: 20px;">&times;</button>
    `;
    this.widget.appendChild(header);

    // Add note button
    const addButton = document.createElement('button');
    addButton.className = 'add-note-btn';
    addButton.textContent = '+ Thêm ghi chú';
    addButton.style.cssText = `
      margin: 12px;
      padding: 10px 16px;
      background: #f5f5f5;
      border: 2px dashed #ccc;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
    `;
    addButton.addEventListener('mouseenter', () => {
      addButton.style.background = '#e8f5e9';
      addButton.style.borderColor = '#006A60';
    });
    addButton.addEventListener('mouseleave', () => {
      addButton.style.background = '#f5f5f5';
      addButton.style.borderColor = '#ccc';
    });
    this.widget.appendChild(addButton);

    // Notes container
    this.notesContainer = document.createElement('div');
    this.notesContainer.className = 'notes-container';
    this.notesContainer.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 0 12px 12px;
    `;
    this.widget.appendChild(this.notesContainer);

    // Toggle button
    this.toggleBtn = document.createElement('button');
    this.toggleBtn.className = 'quick-notes-toggle';
    this.toggleBtn.innerHTML = '📝';
    this.toggleBtn.setAttribute('aria-label', 'Toggle quick notes');
    this.toggleBtn.style.cssText = `
      position: fixed;
      top: 80px;
      right: 24px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: white;
      color: #006A60;
      border: 2px solid #006A60;
      cursor: pointer;
      z-index: 998;
      font-size: 20px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,106,96,0.2);
    `;
    document.body.appendChild(this.toggleBtn);

    this.isOpen = false;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Toggle widget
    this.toggleBtn.addEventListener('click', () => this.toggleWidget());

    // Close button
    this.widget.querySelector('.notes-close').addEventListener('click', () => this.closeWidget());

    // Add note button
    this.widget.querySelector('.add-note-btn').addEventListener('click', () => this.addNote());

    // Keyboard shortcut (N key)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        this.toggleWidget();
      }
    });
  }

  /**
   * Toggle widget visibility
   */
  toggleWidget() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.widget.style.transform = 'translateX(0)';
      this.widget.style.opacity = '1';
      this.toggleBtn.style.transform = 'translateX(320px)';
    } else {
      this.widget.style.transform = 'translateX(calc(100% + 24px))';
      this.widget.style.opacity = '0';
      this.toggleBtn.style.transform = 'translateX(0)';
    }
  }

  /**
   * Close widget
   */
  closeWidget() {
    this.isOpen = false;
    this.widget.style.transform = 'translateX(calc(100% + 24px))';
    this.widget.style.opacity = '0';
    this.toggleBtn.style.transform = 'translateX(0)';
  }

  /**
   * Add new note
   */
  addNote() {
    const note = {
      id: Date.now(),
      content: '',
      color: this.getRandomColor(),
      createdAt: new Date().toISOString(),
      x: 0,
      y: 0
    };
    this.notes.unshift(note);
    this.saveNotes();
    this.renderNotes();
    this.editNote(note.id);
  }

  /**
   * Edit note
   */
  editNote(id) {
    const note = this.notes.find(n => n.id === id);
    if (!note) return;

    const modal = document.createElement('div');
    modal.className = 'note-edit-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: modal-fade-in 0.2s ease;
    `;

    const editor = document.createElement('div');
    editor.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    `;

    const textarea = document.createElement('textarea');
    textarea.value = note.content;
    textarea.placeholder = 'Nhập nội dung ghi chú...';
    textarea.style.cssText = `
      width: 100%;
      min-height: 200px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      margin-bottom: 16px;
    `;

    const buttonGroup = document.createElement('div');
    buttonGroup.style.cssText = `
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    `;

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Lưu';
    saveBtn.style.cssText = `
      padding: 10px 24px;
      background: #006A60;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
    `;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Xóa';
    deleteBtn.style.cssText = `
      padding: 10px 24px;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
    `;

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Hủy';
    cancelBtn.style.cssText = `
      padding: 10px 24px;
      background: #f5f5f5;
      color: #333;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
    `;

    saveBtn.addEventListener('click', () => {
      note.content = textarea.value.trim();
      if (note.content) {
        this.saveNotes();
        this.renderNotes();
      }
      modal.remove();
    });

    deleteBtn.addEventListener('click', () => {
      this.notes = this.notes.filter(n => n.id !== id);
      this.saveNotes();
      this.renderNotes();
      modal.remove();
    });

    cancelBtn.addEventListener('click', () => {
      modal.remove();
    });

    buttonGroup.appendChild(cancelBtn);
    buttonGroup.appendChild(deleteBtn);
    buttonGroup.appendChild(saveBtn);

    editor.appendChild(textarea);
    editor.appendChild(buttonGroup);
    modal.appendChild(editor);
    document.body.appendChild(modal);

    textarea.focus();

    // Close on Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  /**
   * Delete note
   */
  deleteNote(id) {
    this.notes = this.notes.filter(n => n.id !== id);
    this.saveNotes();
    this.renderNotes();
    if (window.showToast) {
      showToast('Đã xóa ghi chú', 'info');
    }
  }

  /**
   * Get random color for notes
   */
  getRandomColor() {
    const colors = ['#FFF9C4', '#C8E6C9', '#BBDEFB', '#F8BBD0', '#E1BEE7', '#FFCCBC'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Render all notes
   */
  renderNotes() {
    this.notesContainer.innerHTML = '';

    if (this.notes.length === 0) {
      this.notesContainer.innerHTML = `
        <p style="text-align: center; color: #999; padding: 24px; font-size: 14px;">
          Chưa có ghi chú nào.<br>Nhấn "+ Thêm ghi chú" để tạo ghi chú đầu tiên.
        </p>
      `;
      return;
    }

    this.notes.forEach(note => {
      const noteEl = document.createElement('div');
      noteEl.className = 'quick-note-item';
      noteEl.style.cssText = `
        padding: 12px;
        margin: 8px 0;
        background: ${note.color};
        border-radius: 8px;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        position: relative;
      `;

      noteEl.addEventListener('mouseenter', () => {
        noteEl.style.transform = 'translateY(-2px)';
        noteEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      });

      noteEl.addEventListener('mouseleave', () => {
        noteEl.style.transform = 'translateY(0)';
        noteEl.style.boxShadow = '';
      });

      noteEl.addEventListener('click', () => this.editNote(note.id));

      const preview = note.content.substring(0, 100);
      const date = new Date(note.createdAt).toLocaleDateString('vi-VN');

      noteEl.innerHTML = `
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #333;">
          ${preview || '<em style="color: #999;">(trống)</em>'}
          ${note.content.length > 100 ? '...' : ''}
        </p>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <span style="font-size: 11px; color: #666;">${date}</span>
          <button class="delete-note-btn" style="background: none; border: none; cursor: pointer; color: #999; font-size: 16px; padding: 4px;">&times;</button>
        </div>
      `;

      // Delete button
      const deleteBtn = noteEl.querySelector('.delete-note-btn');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteNote(note.id);
      });

      this.notesContainer.appendChild(noteEl);
    });
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  new QuickNotesWidget();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuickNotesWidget;
}

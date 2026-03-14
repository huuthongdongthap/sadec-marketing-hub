/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FAVORITES MANAGER — Sa Đéc Marketing Hub
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * - Add/remove pages to favorites
 * - Quick access panel for favorites
 * - Drag-to-reorder support
 * - Keyboard shortcut (Ctrl+D to add, Ctrl+Shift+F to open)
 * - Persisted to localStorage
 * - Sync across tabs
 *
 * Usage:
 *   import { FavoritesManager } from './favorites.js';
 *   FavoritesManager.add({ path: '/admin/dashboard.html', title: 'Dashboard' });
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

const FavoritesManager = {
    panel: null,
    isOpen: false,
    storageKey: 'sadec_favorites',
    favorites: [],

    /**
     * Initialize favorites manager
     */
    init() {
        this.loadFavorites();
        this.createPanel();
        this.bindEvents();
        this.bindKeyboardShortcuts();
        this.addStarIconToPages();
    },

    /**
     * Load favorites from localStorage
     */
    loadFavorites() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.favorites = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('[Favorites] Failed to load favorites:', e);
        }
    },

    /**
     * Save favorites to localStorage
     */
    saveFavorites() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
            window.dispatchEvent(new CustomEvent('favorites-updated', {
                detail: { favorites: this.favorites }
            }));
        } catch (e) {
            console.warn('[Favorites] Failed to save favorites:', e);
        }
    },

    /**
     * Create favorites panel UI
     */
    createPanel() {
        if (document.getElementById('favorites-panel')) return;

        this.panel = document.createElement('div');
        this.panel.id = 'favorites-panel';
        this.panel.className = 'favorites-panel';
        this.panel.setAttribute('role', 'dialog');
        this.panel.setAttribute('aria-label', 'Trang Yêu Thích');
        this.panel.innerHTML = `
            <div class="favorites-header">
                <h3 class="favorites-title">
                    <span class="material-symbols-outlined">star</span>
                    Trang Yêu Thích
                </h3>
                <div class="favorites-actions">
                    <button class="favorites-add-btn" aria-label="Thêm trang hiện tại" title="Ctrl+D">
                        <span class="material-symbols-outlined">add</span>
                    </button>
                    <button class="favorites-close" aria-label="Đóng">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>
            <div class="favorites-content">
                <ul class="favorites-list" role="listbox"></ul>
                <div class="favorites-empty" hidden>
                    <span class="material-symbols-outlined">star_border</span>
                    <p>Chưa có trang yêu thích</p>
                    <small>Nhấn Ctrl+D để thêm trang hiện tại</small>
                </div>
            </div>
        `;

        document.body.appendChild(this.panel);
        this.renderList();
    },

    /**
     * Render favorites list
     */
    renderList() {
        const list = this.panel.querySelector('.favorites-list');
        const empty = this.panel.querySelector('.favorites-empty');

        if (this.favorites.length === 0) {
            list.innerHTML = '';
            empty.hidden = false;
            return;
        }

        empty.hidden = true;
        list.innerHTML = this.favorites.map((fav, index) => `
            <li class="favorite-item" data-index="${index}" draggable="true" role="option">
                <a href="${fav.path}" class="favorite-link">
                    <span class="material-symbols-outlined">star</span>
                    <span class="favorite-title">${fav.title}</span>
                </a>
                <div class="favorite-actions">
                    <button class="favorite-remove" data-index="${index}" aria-label="Xóa">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            </li>
        `).join('');

        // Bind drag and drop
        this.bindDragAndDrop();
    },

    /**
     * Bind drag and drop for reordering
     */
    bindDragAndDrop() {
        const items = this.panel.querySelectorAll('.favorite-item');
        let draggedIndex = null;

        items.forEach((item, index) => {
            item.addEventListener('dragstart', (e) => {
                draggedIndex = index;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                draggedIndex = null;
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedIndex !== null && draggedIndex !== index) {
                    const draggedItem = this.favorites[draggedIndex];
                    this.favorites.splice(draggedIndex, 1);
                    this.favorites.splice(index, 0, draggedItem);
                    this.saveFavorites();
                    this.renderList();
                }
            });
        });
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Close button
        const closeBtn = this.panel.querySelector('.favorites-close');
        closeBtn.addEventListener('click', () => this.close());

        // Add button
        const addBtn = this.panel.querySelector('.favorites-add-btn');
        addBtn.addEventListener('click', () => this.addCurrentPage());

        // Remove buttons (event delegation)
        this.panel.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.favorite-remove');
            if (removeBtn) {
                const index = parseInt(removeBtn.dataset.index);
                this.remove(index);
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.panel.contains(e.target)) {
                this.close();
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Listen for favorites updates from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                this.loadFavorites();
                this.renderList();
            }
        });
    },

    /**
     * Bind keyboard shortcuts
     */
    bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+D: Add current page to favorites
            if (e.ctrlKey && e.key === 'd' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.addCurrentPage();
            }

            // Ctrl+Shift+F: Open favorites panel
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                this.toggle();
            }
        });
    },

    /**
     * Add star icon to pages in sidebar/navigation
     */
    addStarIconToPages() {
        // Add star button to page headers
        setTimeout(() => {
            const pageTitle = document.querySelector('h1');
            if (pageTitle && !pageTitle.querySelector('.favorite-star')) {
                const starBtn = document.createElement('button');
                starBtn.className = 'favorite-star';
                starBtn.setAttribute('aria-label', 'Thêm vào yêu thích');
                starBtn.setAttribute('title', 'Ctrl+D');
                const isFavorite = this.isFavorite(window.location.pathname);
                starBtn.innerHTML = `
                    <span class="material-symbols-outlined">${isFavorite ? 'star' : 'star_border'}</span>
                `;
                starBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (isFavorite) {
                        this.removeByPath(window.location.pathname);
                    } else {
                        this.addCurrentPage();
                    }
                    starBtn.querySelector('.material-symbols-outlined').textContent =
                        this.isFavorite(window.location.pathname) ? 'star' : 'star_border';
                });
                pageTitle.appendChild(starBtn);
            }
        }, 100);
    },

    /**
     * Add current page to favorites
     */
    addCurrentPage() {
        const path = window.location.pathname;
        const title = document.title.split('-')[0].trim();

        if (this.isFavorite(path)) {
            this.showToast('Trang đã có trong danh sách yêu thích');
            return;
        }

        this.add({ path, title });
    },

    /**
     * Add a favorite
     * @param {{ path: string, title: string }} favorite
     */
    add(favorite) {
        // Check if already exists
        if (this.favorites.some(f => f.path === favorite.path)) {
            return;
        }

        this.favorites.unshift(favorite);
        this.saveFavorites();
        this.renderList();
        this.showToast(`Đã thêm "${favorite.title}" vào yêu thích`);
    },

    /**
     * Remove favorite by index
     * @param {number} index
     */
    remove(index) {
        const removed = this.favorites[index];
        this.favorites.splice(index, 1);
        this.saveFavorites();
        this.renderList();
        this.showToast(`Đã xóa "${removed.title}" khỏi yêu thích`);
    },

    /**
     * Remove favorite by path
     * @param {string} path
     */
    removeByPath(path) {
        const index = this.favorites.findIndex(f => f.path === path);
        if (index !== -1) {
            this.remove(index);
        }
    },

    /**
     * Check if page is favorite
     * @param {string} path
     * @returns {boolean}
     */
    isFavorite(path) {
        return this.favorites.some(f => f.path === path);
    },

    /**
     * Toggle panel visibility
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    /**
     * Open panel
     */
    open() {
        this.renderList();
        this.panel.classList.add('open');
        this.isOpen = true;
        this.panel.setAttribute('aria-hidden', 'false');
    },

    /**
     * Close panel
     */
    close() {
        this.panel.classList.remove('open');
        this.isOpen = false;
        this.panel.setAttribute('aria-hidden', 'true');
    },

    /**
     * Show toast notification
     * @param {string} message
     */
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'favorites-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Auto-init on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => FavoritesManager.init());
} else {
    FavoritesManager.init();
}

// Export for manual usage
export { FavoritesManager };

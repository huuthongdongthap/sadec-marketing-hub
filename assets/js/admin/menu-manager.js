/**
 * Menu Manager Module
 * F&B Menu Management - CRUD Operations with localStorage Persistence
 * @version 1.0.0
 */

(function(global) {
    'use strict';

    // Menu Manager Global Object
    const MenuManager = {
        // Storage key
        STORAGE_KEY: 'sadec_menu_items',

        // Current filter state
        currentFilter: 'all',

        // Default menu items (26 items)
        defaultItems: [
            // Coffee (10 items)
            { id: 1, name: 'Cà phê sữa đá', price: 29000, cost: 8000, category: 'coffee', emoji: '☕', available: true, recipe: 'Cà phê phin + sữa đặc + đá' },
            { id: 2, name: 'Cà phê đen đá', price: 25000, cost: 6000, category: 'coffee', emoji: '🖤', available: true, recipe: 'Cà phê phin nguyên chất' },
            { id: 3, name: 'Cà phê bạc xỉu', price: 32000, cost: 9000, category: 'coffee', emoji: '🤎', available: true, recipe: 'Sữa nóng + cà phê espresso' },
            { id: 4, name: 'Latte', price: 45000, cost: 12000, category: 'coffee', emoji: '🥛', available: true, recipe: 'Espresso + sữa steamed + foam' },
            { id: 5, name: 'Cappuccino', price: 45000, cost: 12000, category: 'coffee', emoji: '☕', available: true, recipe: 'Espresso + sữa + bọt sữa dày' },
            { id: 6, name: 'Espresso', price: 35000, cost: 10000, category: 'coffee', emoji: '⚡', available: true, recipe: 'Cà phê espresso nguyên chất' },
            { id: 7, name: 'Americano', price: 35000, cost: 9000, category: 'coffee', emoji: '🥃', available: true, recipe: 'Espresso + nước nóng' },
            { id: 8, name: 'Mocha', price: 49000, cost: 14000, category: 'coffee', emoji: '🍫', available: true, recipe: 'Espresso + chocolate + sữa' },
            { id: 9, name: 'Caramel Macchiato', price: 52000, cost: 15000, category: 'coffee', emoji: '🍮', available: true, recipe: 'Vanilla + sữa + espresso + caramel' },
            { id: 10, name: 'Cold Brew', price: 45000, cost: 11000, category: 'coffee', emoji: '🧊', available: true, recipe: 'Cà phê ủ lạnh 12h' },

            // Tea (6 items)
            { id: 11, name: 'Trà đào cam sả', price: 39000, cost: 12000, category: 'tea', emoji: '🍑', available: true, recipe: 'Trà đen + đào + cam + sả' },
            { id: 12, name: 'Trà vải hoa hồng', price: 42000, cost: 13000, category: 'tea', emoji: '🌹', available: true, recipe: 'Trà đen + vải + hoa hồng' },
            { id: 13, name: 'Trà chanh', price: 25000, cost: 7000, category: 'tea', emoji: '🍋', available: true, recipe: 'Trà đen + chanh + mật ong' },
            { id: 14, name: 'Trà xanh matcha', price: 45000, cost: 15000, category: 'tea', emoji: '🍵', available: true, recipe: 'Bột matcha Nhật Bản + sữa' },
            { id: 15, name: 'Trà thái xanh', price: 35000, cost: 10000, category: 'tea', emoji: '💚', available: true, recipe: 'Trà thái + sữa đặc + đá' },
            { id: 16, name: 'Trà oolong', price: 32000, cost: 9000, category: 'tea', emoji: '🍃', available: true, recipe: 'Trà oolong nguyên lá' },

            // Blended (5 items)
            { id: 17, name: 'Sinh tố bơ', price: 45000, cost: 14000, category: 'blended', emoji: '🥑', available: true, recipe: 'Bơ sáp + sữa + đá xay' },
            { id: 18, name: 'Sinh tố xoài', price: 45000, cost: 13000, category: 'blended', emoji: '🥭', available: true, recipe: 'Xoài cát + sữa + đá xay' },
            { id: 19, name: 'Sinh tố dâu', price: 49000, cost: 15000, category: 'blended', emoji: '🍓', available: true, recipe: 'Dâu tây + sữa + đá xay' },
            { id: 20, name: 'Xanh chuối', price: 42000, cost: 12000, category: 'blended', emoji: '🍌', available: true, recipe: 'Chuối + nếp cẩm + sữa' },
            { id: 21, name: 'Táo nho', price: 49000, cost: 16000, category: 'blended', emoji: '🍇', available: true, recipe: 'Táo + nho + sữa + đá xay' },

            // Snacks (5 items)
            { id: 22, name: 'Croissant', price: 35000, cost: 12000, category: 'snacks', emoji: '🥐', available: true, recipe: 'Bánh sừng bò nướng' },
            { id: 23, name: 'Tiramisu', price: 55000, cost: 18000, category: 'snacks', emoji: '🍰', available: true, recipe: 'Bánh tiramisu Ý' },
            { id: 24, name: 'Cheesecake', price: 55000, cost: 18000, category: 'snacks', emoji: '🧀', available: true, recipe: 'Bánh phô mai New York' },
            { id: 25, name: 'Brownie', price: 39000, cost: 13000, category: 'snacks', emoji: '🍫', available: true, recipe: 'Bánh brownie chocolate' },
            { id: 26, name: 'Muffin', price: 32000, cost: 10000, category: 'snacks', emoji: '🧁', available: true, recipe: 'Bánh muffin nướng' }
        ],

        // Menu items array
        items: [],

        /**
         * Initialize Menu Manager
         */
        init: function() {
            this.loadItems();
            this.setupEventListeners();
            this.renderTable();
            this.updateStats();
        },

        /**
         * Load items from localStorage or use defaults
         */
        loadItems: function() {
            try {
                const stored = localStorage.getItem(this.STORAGE_KEY);
                if (stored) {
                    this.items = JSON.parse(stored);
                } else {
                    this.items = [...this.defaultItems];
                    this.saveItems();
                }
            } catch (e) {
                console.error('Error loading menu items:', e);
                this.items = [...this.defaultItems];
            }
        },

        /**
         * Save items to localStorage
         */
        saveItems: function() {
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
            } catch (e) {
                console.error('Error saving menu items:', e);
            }
        },

        /**
         * Setup event listeners
         */
        setupEventListeners: function() {
            // Add menu button
            const addBtn = document.querySelector('.add-menu-btn');
            if (addBtn) {
                addBtn.addEventListener('click', () => this.openModal());
            }

            // Export button
            const exportBtn = document.querySelector('.export-btn');
            if (exportBtn) {
                exportBtn.addEventListener('click', () => this.exportCSV());
            }

            // Modal close button
            const closeBtn = document.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal());
            }

            // Modal overlay click to close
            const overlay = document.querySelector('.modal-overlay');
            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        this.closeModal();
                    }
                });
            }

            // Form submit
            const form = document.querySelector('#menu-form');
            if (form) {
                form.addEventListener('submit', (e) => this.save(e));
            }

            // Filter chips
            const filterChips = document.querySelectorAll('.filter-chip');
            filterChips.forEach(chip => {
                chip.addEventListener('click', () => {
                    filterChips.forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                    this.currentFilter = chip.dataset.category;
                    this.renderTable();
                });
            });

            // Search input
            const searchInput = document.querySelector('.menu-search');
            if (searchInput) {
                searchInput.addEventListener('input', () => this.renderTable());
            }
        },

        /**
         * Render menu table
         */
        renderTable: function() {
            const tbody = document.querySelector('.menu-table tbody');
            if (!tbody) return;

            // Filter and search
            let filtered = [...this.items];

            if (this.currentFilter !== 'all') {
                filtered = filtered.filter(item => item.category === this.currentFilter);
            }

            const searchInput = document.querySelector('.menu-search');
            if (searchInput && searchInput.value.trim()) {
                const search = searchInput.value.toLowerCase().trim();
                filtered = filtered.filter(item =>
                    item.name.toLowerCase().includes(search) ||
                    item.recipe.toLowerCase().includes(search)
                );
            }

            // Sort by category then name
            filtered.sort((a, b) => {
                if (a.category !== b.category) {
                    return this.getCategoryOrder(a.category) - this.getCategoryOrder(b.category);
                }
                return a.name.localeCompare(b.name);
            });

            // Render rows
            tbody.innerHTML = filtered.map(item => {
                const margin = this.calculateMargin(item.price, item.cost);
                const marginClass = this.getMarginClass(margin);

                return `
                    <tr data-id="${item.id}">
                        <td>
                            <div class="item-name-cell">
                                <span class="item-emoji">${item.emoji}</span>
                                <span class="item-name">${item.name}</span>
                            </div>
                        </td>
                        <td>
                            <span class="category-badge cat-${item.category}">${this.getCategoryLabel(item.category)}</span>
                        </td>
                        <td class="price-cell">
                            <span class="price-amount">${this.formatVND(item.price)}</span>
                            <span class="margin-indicator ${marginClass}">Lãi: ${margin}%</span>
                        </td>
                        <td>${this.formatVND(item.cost)}</td>
                        <td>
                            <div class="availability-toggle ${item.available ? 'on' : ''}"
                                 onclick="MenuManager.toggleAvailability(${item.id})">
                            </div>
                        </td>
                        <td>
                            <button class="action-btn edit" onclick="MenuManager.openModal(${item.id})">Sửa</button>
                            <button class="action-btn delete" onclick="MenuManager.deleteItem(${item.id})">Xóa</button>
                        </td>
                    </tr>
                `;
            }).join('');
        },

        /**
         * Get category sort order
         */
        getCategoryOrder: function(category) {
            const order = { coffee: 0, tea: 1, blended: 2, snacks: 3 };
            return order[category] || 99;
        },

        /**
         * Get category display label
         */
        getCategoryLabel: function(category) {
            const labels = {
                coffee: 'Cà phê',
                tea: 'Trà',
                blended: 'Sinh tố',
                snacks: 'Bánh'
            };
            return labels[category] || category;
        },

        /**
         * Calculate margin percentage
         */
        calculateMargin: function(price, cost) {
            if (!price || !cost) return 0;
            return Math.round(((price - cost) / price) * 100);
        },

        /**
         * Get margin color class
         */
        getMarginClass: function(margin) {
            if (margin >= 60) return 'margin-high';
            if (margin >= 40) return 'margin-mid';
            return 'margin-low';
        },

        /**
         * Toggle availability status
         */
        toggleAvailability: function(id) {
            const item = this.items.find(i => i.id === id);
            if (item) {
                item.available = !item.available;
                this.saveItems();
                this.renderTable();
                this.updateStats();
            }
        },

        /**
         * Open modal for create/edit
         */
        openModal: function(itemId) {
            const overlay = document.querySelector('.modal-overlay');
            const modalTitle = document.querySelector('.modal-title');
            const form = document.querySelector('#menu-form');

            if (!overlay || !form) return;

            // Reset form
            form.reset();

            if (itemId) {
                // Edit mode
                const item = this.items.find(i => i.id === itemId);
                if (item) {
                    modalTitle.textContent = '✏️ Chỉnh sửa món';
                    document.getElementById('editId').value = item.id;
                    document.getElementById('itemName').value = item.name;
                    document.getElementById('itemPrice').value = item.price;
                    document.getElementById('itemCost').value = item.cost;
                    document.getElementById('itemCat').value = item.category;
                    document.getElementById('itemEmoji').value = item.emoji;
                    document.getElementById('itemRecipe').value = item.recipe;
                }
            } else {
                // Create mode
                modalTitle.textContent = '➕ Thêm món mới';
                document.getElementById('editId').value = '';
                document.getElementById('itemEmoji').value = '☕';
            }

            overlay.classList.add('active');
        },

        /**
         * Close modal
         */
        closeModal: function() {
            const overlay = document.querySelector('.modal-overlay');
            if (overlay) {
                overlay.classList.remove('active');
            }
        },

        /**
         * Save item from form
         */
        save: function(e) {
            e.preventDefault();

            const id = document.getElementById('editId').value;
            const name = document.getElementById('itemName').value.trim();
            const price = parseInt(document.getElementById('itemPrice').value) || 0;
            const cost = parseInt(document.getElementById('itemCost').value) || 0;
            const category = document.getElementById('itemCat').value;
            const emoji = document.getElementById('itemEmoji').value || '☕';
            const recipe = document.getElementById('itemRecipe').value.trim();

            if (!name) {
                alert('Vui lòng nhập tên món');
                return;
            }

            if (id) {
                // Update existing
                const item = this.items.find(i => i.id === parseInt(id));
                if (item) {
                    item.name = name;
                    item.price = price;
                    item.cost = cost;
                    item.category = category;
                    item.emoji = emoji;
                    item.recipe = recipe;
                }
            } else {
                // Create new
                const newId = Math.max(0, ...this.items.map(i => i.id)) + 1;
                this.items.push({
                    id: newId,
                    name,
                    price,
                    cost,
                    category,
                    emoji,
                    available: true,
                    recipe
                });
            }

            this.saveItems();
            this.renderTable();
            this.updateStats();
            this.closeModal();
        },

        /**
         * Delete item
         */
        deleteItem: function(id) {
            if (confirm('Bạn có chắc muốn xóa món này?')) {
                this.items = this.items.filter(i => i.id !== id);
                this.saveItems();
                this.renderTable();
                this.updateStats();
            }
        },

        /**
         * Filter by category
         */
        filter: function(category) {
            this.currentFilter = category;
            this.renderTable();
        },

        /**
         * Export to CSV
         */
        exportCSV: function() {
            const headers = ['ID', 'Tên món', 'Giá bán', 'Giá vốn', 'Danh mục', 'Emoji', 'Sẵn có', 'Công thức'];
            const rows = this.items.map(item => [
                item.id,
                item.name,
                item.price,
                item.cost,
                item.category,
                item.emoji,
                item.available ? 'Có' : 'Không',
                item.recipe
            ]);

            const csv = [headers, ...rows].map(row =>
                row.map(cell => `"${cell}"`).join(',')
            ).join('\n');

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `menu-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        },

        /**
         * Update stats cards
         */
        updateStats: function() {
            const totalItems = this.items.length;
            const available = this.items.filter(i => i.available).length;
            const avgPrice = totalItems > 0
                ? Math.round(this.items.reduce((sum, i) => sum + i.price, 0) / totalItems)
                : 0;
            const avgMargin = totalItems > 0
                ? Math.round(this.items.reduce((sum, i) => sum + this.calculateMargin(i.price, i.cost), 0) / totalItems)
                : 0;

            const totalEl = document.querySelector('#stat-total');
            const availableEl = document.querySelector('#stat-available');
            const avgPriceEl = document.querySelector('#stat-avg-price');
            const avgMarginEl = document.querySelector('#stat-avg-margin');

            if (totalEl) totalEl.textContent = totalItems;
            if (availableEl) availableEl.textContent = available;
            if (avgPriceEl) avgPriceEl.textContent = this.formatVND(avgPrice);
            if (avgMarginEl) avgMarginEl.textContent = avgMargin + '%';
        },

        /**
         * Format VND currency
         */
        formatVND: function(amount) {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount).replace('₫', 'K').replace(/\./g, '');
        }
    };

    // Initialize on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => MenuManager.init());
    } else {
        MenuManager.init();
    }

    // Expose to global scope
    global.MenuManager = MenuManager;

})(typeof window !== 'undefined' ? window : this);

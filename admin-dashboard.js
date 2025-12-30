/* ==========================================================================
   ADMIN DASHBOARD JS - SA ĐÉC MARKETING HUB
   Neon 2026 Edition with Full Functionality + Supabase Integration
   ========================================================================== */

// ============================================================================
// DEMO MODE DATA
// ============================================================================
const DEMO_DATA = {
    customers: [
        { id: 1, name: 'Chú Ba Bonsai', phone: '0909 123 456', business_name: 'Bonsai Chú Ba', source: 'google_maps', status: 'closed', avatar_emoji: '🌳', created_at: 'Hôm nay', value: 15000000 },
        { id: 2, name: 'Chị Lan Bánh Tráng', phone: '0987 654 321', business_name: 'Bánh Tráng Cô Lan', source: 'facebook', status: 'hot', avatar_emoji: '🍜', created_at: 'Hôm qua', value: 8000000 },
        { id: 3, name: 'Cô Bảy Tạp Hóa', phone: '0912 345 678', business_name: 'Tạp Hóa Cô Bảy', source: 'zalo', status: 'warm', avatar_emoji: '🏪', created_at: '2 ngày trước', value: 5000000 },
        { id: 4, name: 'Anh Tư Quán Cà Phê', phone: '0888 999 000', business_name: 'Coffee House 4T', source: 'website', status: 'new', avatar_emoji: '☕', created_at: 'Hôm nay', value: 0 },
        { id: 5, name: 'Chị Năm Hoa Kiểng', phone: '0777 888 999', business_name: 'Hoa Kiểng Chị Năm', source: 'referral', status: 'hot', avatar_emoji: '🌸', created_at: '3 ngày trước', value: 12000000 },
    ],
    posts: [
        { id: 1, title: '🌸 Chào mùa xuân Sa Đéc!', platform: 'facebook', status: 'published', scheduled_at: '22/12 - 10:00' },
        { id: 2, title: '💰 Flash Sale cuối năm!', platform: 'zalo', status: 'scheduled', scheduled_at: '23/12 - 15:00' },
        { id: 3, title: '🎄 Video Noel cùng Chú Ba', platform: 'tiktok', status: 'scheduled', scheduled_at: '24/12 - 20:00' },
        { id: 4, title: '🎁 Chúc mừng Giáng Sinh', platform: 'facebook', status: 'draft', scheduled_at: '25/12 - --:--' },
    ],
    kpis: {
        leads: { value: 127, change: 23, trend: 'up' },
        revenue: { value: '45.8M', change: 12, trend: 'up' },
        engagement: { value: '8.2K', change: 45, trend: 'up' },
        customers: { value: 34, change: 5, trend: 'down' }
    }
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================
const AppState = {
    isDemoMode: localStorage.getItem('isDemoMode') !== 'false',
    isAuthenticated: false,
    currentUser: null,
    currentRole: 'guest',
    currentTab: 'dashboard',
    customers: [...DEMO_DATA.customers],
    posts: [...DEMO_DATA.posts],
    kpis: { ...DEMO_DATA.kpis },
    editingCustomer: null,
    editingPost: null
};

// ============================================================================
// SUPABASE ADMIN API
// ============================================================================
const SupabaseAdmin = {
    getClient() {
        return window.SupabaseAPI?.getClient();
    },

    async loadCustomers() {
        if (AppState.isDemoMode) return { data: AppState.customers };

        const client = this.getClient();
        if (!client) return { error: 'Not initialized', data: [] };

        const { data, error } = await client
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false });

        return error ? { error, data: [] } : { data };
    },

    async saveCustomer(customer) {
        if (AppState.isDemoMode) {
            if (customer.id) {
                const idx = AppState.customers.findIndex(c => c.id === customer.id);
                if (idx >= 0) AppState.customers[idx] = { ...AppState.customers[idx], ...customer };
            } else {
                customer.id = Date.now();
                customer.created_at = 'Vừa xong';
                AppState.customers.unshift(customer);
            }
            return { data: customer };
        }

        // Real Supabase operation
        const client = this.getClient();
        if (!client) return { error: 'Not initialized' };

        if (customer.id) {
            const { data, error } = await client
                .from('customers')
                .update(customer)
                .eq('id', customer.id)
                .select();
            return error ? { error } : { data: data[0] };
        } else {
            const { data, error } = await client
                .from('customers')
                .insert([customer])
                .select();
            return error ? { error } : { data: data[0] };
        }
    },

    async deleteCustomer(id) {
        if (AppState.isDemoMode) {
            AppState.customers = AppState.customers.filter(c => c.id !== id);
            return { success: true };
        }

        const client = this.getClient();
        if (!client) return { error: 'Not initialized' };

        const { error } = await client
            .from('customers')
            .delete()
            .eq('id', id);

        return error ? { error } : { success: true };
    },

    async loadPosts() {
        if (AppState.isDemoMode) return { data: AppState.posts };

        const client = this.getClient();
        if (!client) return { error: 'Not initialized', data: [] };

        const { data, error } = await client
            .from('scheduled_posts')
            .select('*')
            .order('scheduled_at', { ascending: true });

        return error ? { error, data: [] } : { data };
    },

    async savePost(post) {
        if (AppState.isDemoMode) {
            if (post.id) {
                const idx = AppState.posts.findIndex(p => p.id === post.id);
                if (idx >= 0) AppState.posts[idx] = { ...AppState.posts[idx], ...post };
            } else {
                post.id = Date.now();
                AppState.posts.push(post);
            }
            return { data: post };
        }

        const client = this.getClient();
        if (!client) return { error: 'Not initialized' };

        if (post.id) {
            const { data, error } = await client
                .from('scheduled_posts')
                .update(post)
                .eq('id', post.id)
                .select();
            return error ? { error } : { data: data[0] };
        } else {
            const { data, error } = await client
                .from('scheduled_posts')
                .insert([post])
                .select();
            return error ? { error } : { data: data[0] };
        }
    },

    async deletePost(id) {
        if (AppState.isDemoMode) {
            AppState.posts = AppState.posts.filter(p => p.id !== id);
            return { success: true };
        }

        const client = this.getClient();
        if (!client) return { error: 'Not initialized' };

        const { error } = await client
            .from('scheduled_posts')
            .delete()
            .eq('id', id);

        return error ? { error } : { success: true };
    }
};

// ============================================================================
// UI MANAGER
// ============================================================================
const UIManager = {
    // Toast Notifications
    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `
            <span class="toast__icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="toast__message">${message}</span>
        `;

        container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => toast.classList.add('toast--show'));

        // Auto remove
        setTimeout(() => {
            toast.classList.remove('toast--show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Modal Management
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.add('modal--open');
        document.body.style.overflow = 'hidden';
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.remove('modal--open');
        document.body.style.overflow = '';
    },

    closeAllModals() {
        document.querySelectorAll('.modal--open').forEach(modal => {
            modal.classList.remove('modal--open');
        });
        document.body.style.overflow = '';
    },

    // Tab Navigation
    switchTab(tabName) {
        AppState.currentTab = tabName;

        // Update sidebar active state
        document.querySelectorAll('.sidebar__link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.tab === tabName) {
                link.classList.add('active');
            }
        });

        // Update header title
        const titles = {
            dashboard: '📊 Dashboard Tổng Quan',
            crm: '👥 Quản Lý Khách Hàng (CRM)',
            scheduler: '📅 Lịch Đăng Bài',
            kpi: '📈 KPI & Báo Cáo',
            messages: '💬 Tin Nhắn',
            settings: '⚙️ Cài Đặt'
        };

        const titleEl = document.querySelector('.admin-header__title');
        if (titleEl) titleEl.textContent = titles[tabName] || titles.dashboard;

        // Show/hide sections based on tab
        this.updateTabContent(tabName);
    },

    updateTabContent(tabName) {
        // For now, all content is visible on dashboard
        // Future: show/hide specific sections
        console.log(`📑 Switched to tab: ${tabName}`);
    },

    // Counter Animation
    animateCounter(element, target, duration = 1500) {
        const start = 0;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(easeOutQuart * target);

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };

        requestAnimationFrame(updateCounter);
    },

    // Toggle Demo Mode
    toggleDemoMode() {
        AppState.isDemoMode = !AppState.isDemoMode;
        const btn = document.getElementById('demoModeBtn');
        if (btn) {
            btn.classList.toggle('active', AppState.isDemoMode);
            btn.querySelector('.demo-mode__status').textContent =
                AppState.isDemoMode ? 'ON' : 'OFF';
        }

        this.showToast(
            AppState.isDemoMode ? '🎭 Demo Mode: ON' : '🔌 Live Mode: Connected to Supabase',
            'info'
        );

        // Reload data
        CustomerManager.loadAndRender();
        ContentScheduler.loadAndRender();
    }
};

// ============================================================================
// CUSTOMER MANAGER (CRM)
// ============================================================================
const CustomerManager = {
    async loadAndRender() {
        const { data, error } = await SupabaseAdmin.loadCustomers();

        if (error) {
            UIManager.showToast('Lỗi tải dữ liệu khách hàng', 'error');
            return;
        }

        this.render(data);
    },

    render(customers) {
        const tbody = document.getElementById('customerTableBody');
        if (!tbody) return;

        tbody.innerHTML = customers.map(customer => `
            <tr data-id="${customer.id}">
                <td>
                    <div class="crm-table__customer">
                        <div class="crm-table__avatar">${customer.avatar_emoji || '👤'}</div>
                        <div>
                            <div class="crm-table__name">${customer.name}</div>
                            <div class="crm-table__email">${customer.phone || ''}</div>
                        </div>
                    </div>
                </td>
                <td><span class="crm-table__badge crm-table__badge--${customer.status}">${this.getStatusLabel(customer.status)}</span></td>
                <td>${this.getSourceLabel(customer.source)}</td>
                <td>${customer.created_at}</td>
                <td>
                    <div class="crm-table__actions">
                        <button class="crm-table__btn crm-table__btn--edit" onclick="CustomerManager.edit(${customer.id})" title="Sửa">✏️</button>
                        <button class="crm-table__btn crm-table__btn--call" onclick="CustomerManager.call('${customer.phone}')" title="Gọi">📞</button>
                        <button class="crm-table__btn crm-table__btn--zalo" onclick="CustomerManager.zalo('${customer.phone}')" title="Zalo">💬</button>
                        <button class="crm-table__btn crm-table__btn--delete" onclick="CustomerManager.confirmDelete(${customer.id})" title="Xóa">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    getStatusLabel(status) {
        const labels = {
            new: '🆕 Mới',
            hot: '🔥 Hot Lead',
            warm: '⏳ Đang theo',
            closed: '✅ Đã chốt',
            lost: '❌ Mất'
        };
        return labels[status] || status;
    },

    getSourceLabel(source) {
        const labels = {
            facebook: 'Facebook',
            zalo: 'Zalo',
            website: 'Website',
            google_maps: 'Google Maps',
            referral: 'Giới thiệu'
        };
        return labels[source] || source;
    },

    openAddModal() {
        AppState.editingCustomer = null;
        document.getElementById('customerModalTitle').textContent = '➕ Thêm Khách Hàng Mới';
        document.getElementById('customerForm').reset();
        UIManager.openModal('customerModal');
    },

    edit(id) {
        const customer = AppState.customers.find(c => c.id === id);
        if (!customer) return;

        AppState.editingCustomer = customer;
        document.getElementById('customerModalTitle').textContent = '✏️ Sửa Khách Hàng';

        // Fill form
        document.getElementById('customerName').value = customer.name || '';
        document.getElementById('customerPhone').value = customer.phone || '';
        document.getElementById('customerBusiness').value = customer.business_name || '';
        document.getElementById('customerSource').value = customer.source || 'website';
        document.getElementById('customerStatus').value = customer.status || 'new';
        document.getElementById('customerEmoji').value = customer.avatar_emoji || '👤';

        UIManager.openModal('customerModal');
    },

    async save() {
        const form = document.getElementById('customerForm');
        const formData = new FormData(form);

        const customer = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            business_name: formData.get('business'),
            source: formData.get('source'),
            status: formData.get('status'),
            avatar_emoji: formData.get('emoji') || '👤'
        };

        if (AppState.editingCustomer) {
            customer.id = AppState.editingCustomer.id;
        }

        const { data, error } = await SupabaseAdmin.saveCustomer(customer);

        if (error) {
            UIManager.showToast('Lỗi lưu khách hàng', 'error');
            return;
        }

        UIManager.closeModal('customerModal');
        UIManager.showToast(AppState.editingCustomer ? '✅ Đã cập nhật khách hàng' : '✅ Thêm khách hàng thành công');
        this.loadAndRender();
    },

    confirmDelete(id) {
        AppState.deletingCustomerId = id;
        document.getElementById('deleteConfirmMessage').textContent =
            'Bạn có chắc muốn xóa khách hàng này?';
        UIManager.openModal('deleteConfirmModal');
    },

    async executeDelete() {
        const id = AppState.deletingCustomerId;
        if (!id) return;

        const { error } = await SupabaseAdmin.deleteCustomer(id);

        if (error) {
            UIManager.showToast('Lỗi xóa khách hàng', 'error');
            return;
        }

        UIManager.closeModal('deleteConfirmModal');
        UIManager.showToast('🗑️ Đã xóa khách hàng');
        this.loadAndRender();
    },

    call(phone) {
        if (phone) {
            window.open(`tel:${phone.replace(/\s/g, '')}`);
        }
    },

    zalo(phone) {
        if (phone) {
            window.open(`https://zalo.me/${phone.replace(/\s/g, '')}`);
        }
    }
};

// ============================================================================
// CONTENT SCHEDULER
// ============================================================================
const ContentScheduler = {
    async loadAndRender() {
        const { data, error } = await SupabaseAdmin.loadPosts();

        if (error) {
            UIManager.showToast('Lỗi tải lịch đăng bài', 'error');
            return;
        }

        this.render(data);
    },

    render(posts) {
        const container = document.getElementById('schedulerContainer');
        if (!container) return;

        container.innerHTML = posts.map(post => `
            <div class="scheduler__item scheduler__item--${post.status}" data-id="${post.id}">
                <div class="scheduler__time">
                    <div class="scheduler__date">${post.scheduled_at?.split(' - ')[0] || '--/--'}</div>
                    <div class="scheduler__hour">${post.scheduled_at?.split(' - ')[1] || '--:--'}</div>
                </div>
                <div class="scheduler__content">
                    <span class="scheduler__platform scheduler__platform--${post.platform}">${this.getPlatformLabel(post.platform)}</span>
                    <div class="scheduler__title">${post.title}</div>
                    <div class="scheduler__status scheduler__status--${post.status}">${this.getStatusLabel(post.status)}</div>
                </div>
                <div class="scheduler__actions">
                    <button class="scheduler__btn" onclick="ContentScheduler.edit(${post.id})" title="Sửa">✏️</button>
                    <button class="scheduler__btn" onclick="ContentScheduler.confirmDelete(${post.id})" title="Xóa">🗑️</button>
                </div>
            </div>
        `).join('');
    },

    getPlatformLabel(platform) {
        const labels = {
            facebook: 'Facebook',
            zalo: 'Zalo OA',
            tiktok: 'TikTok',
            instagram: 'Instagram'
        };
        return labels[platform] || platform;
    },

    getStatusLabel(status) {
        const labels = {
            draft: '📝 Bản nháp',
            scheduled: '⏰ Đã lên lịch',
            published: '✓ Đã đăng'
        };
        return labels[status] || status;
    },

    openAddModal() {
        AppState.editingPost = null;
        document.getElementById('postModalTitle').textContent = '➕ Tạo Bài Đăng Mới';
        document.getElementById('postForm').reset();
        UIManager.openModal('postModal');
    },

    edit(id) {
        const post = AppState.posts.find(p => p.id === id);
        if (!post) return;

        AppState.editingPost = post;
        document.getElementById('postModalTitle').textContent = '✏️ Sửa Bài Đăng';

        document.getElementById('postTitle').value = post.title || '';
        document.getElementById('postPlatform').value = post.platform || 'facebook';
        document.getElementById('postStatus').value = post.status || 'draft';
        document.getElementById('postContent').value = post.content || '';

        UIManager.openModal('postModal');
    },

    async save() {
        const form = document.getElementById('postForm');
        const formData = new FormData(form);

        const post = {
            title: formData.get('title'),
            platform: formData.get('platform'),
            status: formData.get('status'),
            content: formData.get('content'),
            scheduled_at: formData.get('scheduledAt') || null
        };

        if (AppState.editingPost) {
            post.id = AppState.editingPost.id;
        }

        const { data, error } = await SupabaseAdmin.savePost(post);

        if (error) {
            UIManager.showToast('Lỗi lưu bài đăng', 'error');
            return;
        }

        UIManager.closeModal('postModal');
        UIManager.showToast(AppState.editingPost ? '✅ Đã cập nhật bài đăng' : '✅ Tạo bài đăng thành công');
        this.loadAndRender();
    },

    confirmDelete(id) {
        AppState.deletingPostId = id;
        document.getElementById('deleteConfirmMessage').textContent =
            'Bạn có chắc muốn xóa bài đăng này?';
        UIManager.openModal('deleteConfirmModal');
    },

    async executeDelete() {
        const id = AppState.deletingPostId;
        if (!id) return;

        const { error } = await SupabaseAdmin.deletePost(id);

        if (error) {
            UIManager.showToast('Lỗi xóa bài đăng', 'error');
            return;
        }

        UIManager.closeModal('deleteConfirmModal');
        UIManager.showToast('🗑️ Đã xóa bài đăng');
        this.loadAndRender();
    }
};

// ============================================================================
// KPI DASHBOARD
// ============================================================================
const KPIDashboard = {
    init() {
        this.animateAllCounters();
        this.initCharts();
    },

    animateAllCounters() {
        const counters = document.querySelectorAll('[data-counter]');
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.counter, 10);
            if (!isNaN(target)) {
                UIManager.animateCounter(counter, target);
            }
        });
    },

    initCharts() {
        // Future: Add Chart.js integration for real charts
        console.log('📊 Charts initialized');
    }
};

// ============================================================================
// AUTHENTICATION & USER MANAGEMENT
// ============================================================================
const AuthManager = {
    async checkAuth() {
        // Check localStorage for demo login
        if (localStorage.getItem('isLoggedIn') === 'true') {
            AppState.isAuthenticated = true;
            AppState.currentUser = {
                email: localStorage.getItem('userEmail') || 'user@demo.com',
                name: localStorage.getItem('userName') || 'Demo User'
            };
            AppState.currentRole = localStorage.getItem('userRole') || 'content_creator';
            AppState.isDemoMode = localStorage.getItem('isDemoMode') === 'true';
            return true;
        }

        // Check Supabase session
        if (typeof AuthAPI !== 'undefined') {
            const session = await AuthAPI.getSession();
            if (session) {
                AppState.isAuthenticated = true;
                const profile = await AuthAPI.getProfile();
                AppState.currentUser = {
                    email: session.user.email,
                    name: profile?.full_name || session.user.email
                };
                AppState.currentRole = profile?.role || 'content_creator';
                AppState.isDemoMode = false;
                return true;
            }
        }

        // Not authenticated - redirect to login
        return false;
    },

    updateUserDisplay() {
        const userInfoEl = document.getElementById('userInfo');
        if (userInfoEl && AppState.currentUser) {
            userInfoEl.innerHTML = `
                <span class="user-role">${this.getRoleLabel(AppState.currentRole)}</span>
                <span class="user-name">${AppState.currentUser.name}</span>
                <button class="user-logout" onclick="AuthManager.logout()" title="Đăng xuất">🚪</button>
            `;
        }
    },

    getRoleLabel(role) {
        const labels = {
            super_admin: '👑 Admin',
            manager: '📊 Manager',
            content_creator: '✍️ Creator',
            customer: '👤 Customer'
        };
        return labels[role] || role;
    },

    async logout() {
        // Clear localStorage
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('isDemoMode');

        // Supabase sign out
        if (typeof AuthAPI !== 'undefined') {
            await AuthAPI.signOut();
        }

        // Redirect to login
        window.location.href = 'login.html';
    },

    hasPermission(requiredRole) {
        const roleHierarchy = {
            super_admin: 100,
            manager: 50,
            content_creator: 20,
            customer: 10,
            guest: 0
        };
        return (roleHierarchy[AppState.currentRole] || 0) >= (roleHierarchy[requiredRole] || 0);
    }
};

// ============================================================================
// LIVE KPI LOADER
// ============================================================================
const LiveKPILoader = {
    async loadStats() {
        if (AppState.isDemoMode || typeof KPIAPI === 'undefined') {
            return DEMO_DATA.kpis;
        }

        try {
            const stats = await KPIAPI.getAllStats();
            return {
                leads: { value: stats.leads, change: 0, trend: 'up' },
                revenue: { value: this.formatRevenue(stats.revenue), change: 0, trend: 'up' },
                engagement: { value: stats.scheduledPosts + 'P', change: 0, trend: 'up' },
                customers: { value: stats.customers, change: 0, trend: 'up' }
            };
        } catch (err) {
            console.error('Error loading KPI:', err);
            return DEMO_DATA.kpis;
        }
    },

    formatRevenue(amount) {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 1000) {
            return (amount / 1000).toFixed(0) + 'K';
        }
        return amount.toString();
    }
};

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Admin Dashboard - Neon 2026 Edition Loading...');

    // Check authentication
    const isAuth = await AuthManager.checkAuth();
    if (!isAuth) {
        console.log('⚠️ Not authenticated, redirecting to login...');
        window.location.href = 'login.html';
        return;
    }

    // Update user display
    AuthManager.updateUserDisplay();

    // Update demo mode button state
    const demoBtn = document.getElementById('demoModeBtn');
    if (demoBtn) {
        demoBtn.classList.toggle('active', AppState.isDemoMode);
        const statusEl = demoBtn.querySelector('.demo-mode__status');
        if (statusEl) statusEl.textContent = AppState.isDemoMode ? 'ON' : 'OFF';
        demoBtn.addEventListener('click', () => UIManager.toggleDemoMode());
    }

    // Init sidebar navigation
    document.querySelectorAll('.sidebar__link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.dataset.tab || 'dashboard';
            UIManager.switchTab(tab);
        });
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                UIManager.closeAllModals();
            }
        });
    });

    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            UIManager.closeAllModals();
        }
    });

    // Load initial data
    CustomerManager.loadAndRender();
    ContentScheduler.loadAndRender();
    KPIDashboard.init();

    // Add entrance animations
    document.querySelectorAll('.kpi-card, .panel').forEach((el, i) => {
        el.style.animationDelay = `${i * 0.1}s`;
    });

    console.log('✅ Admin Dashboard Ready!');
    console.log(`👤 User: ${AppState.currentUser?.name} | Role: ${AppState.currentRole} | Demo: ${AppState.isDemoMode}`);
});

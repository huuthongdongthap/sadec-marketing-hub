/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AUTH.JS - Centralized Authentication & Permission System
 * Mekong Marketing - Binh Pháp Aligned
 * 
 * FIX: Uses window.AuthAPI (from supabase-config.js) instead of raw window.supabase
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// ROLE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

const ROLES = {
    SUPER_ADMIN: 'super_admin',
    MANAGER: 'manager',
    CONTENT_CREATOR: 'content_creator',
    CLIENT: 'client',
    AFFILIATE: 'affiliate'
};

const ROLE_LEVELS = {
    super_admin: 100,
    manager: 50,
    content_creator: 20,
    client: 15,
    affiliate: 10
};

const ROLE_REDIRECTS = {
    super_admin: '/admin-dashboard.html',
    manager: '/admin-dashboard.html',
    content_creator: '/admin-dashboard.html',
    client: '/client-portal.html',
    affiliate: '/affiliate-dashboard.html'
};

const ROLE_LABELS = {
    super_admin: '👑 Super Admin',
    manager: '📊 Manager',
    content_creator: '✍️ Content Creator',
    client: '🏢 Client',
    affiliate: '🤝 Affiliate Partner'
};

// ═══════════════════════════════════════════════════════════════════════════
// AUTH STATE
// ═══════════════════════════════════════════════════════════════════════════

const AuthState = {
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,

    // Get current session from Supabase or localStorage (demo mode)
    async init() {
        this.isLoading = true;

        try {
            // Try Supabase via AuthAPI
            if (window.AuthAPI) {
                const session = await window.AuthAPI.getSession();

                if (session?.user) {
                    this.user = session.user;
                    // Load profile using AuthAPI
                    const profile = await window.AuthAPI.getProfile();

                    if (profile) {
                        this.profile = profile;
                        // Cache in localStorage for quick access
                        localStorage.setItem('userRole', profile.role);
                        localStorage.setItem('userName', profile.full_name);
                    }

                    this.isAuthenticated = true;
                    this.isLoading = false;
                    return true;
                }
            }

            // Fallback to demo mode
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if (isLoggedIn) {
                this.user = {
                    id: 'demo-user',
                    email: localStorage.getItem('userEmail')
                };
                this.profile = {
                    id: 'demo-user',
                    email: localStorage.getItem('userEmail'),
                    full_name: localStorage.getItem('userName') || 'Demo User',
                    role: localStorage.getItem('userRole') || 'affiliate',
                    avatar_url: null
                };
                this.isAuthenticated = true;
            }

        } catch (error) {
            console.error('Auth init error:', error);
        }

        this.isLoading = false;
        return this.isAuthenticated;
    },

    // Get current role
    getRole() {
        return this.profile?.role || localStorage.getItem('userRole') || 'affiliate';
    },

    // Get role level (for permission comparison)
    getRoleLevel() {
        return ROLE_LEVELS[this.getRole()] || 0;
    },

    // Check if user has minimum required role
    hasPermission(requiredRole) {
        const userLevel = this.getRoleLevel();
        const requiredLevel = ROLE_LEVELS[requiredRole] || 0;
        return userLevel >= requiredLevel;
    },

    // Check if user has specific role
    hasRole(role) {
        return this.getRole() === role;
    },

    // Get user display name
    getDisplayName() {
        return this.profile?.full_name ||
            localStorage.getItem('userName') ||
            this.user?.email?.split('@')[0] ||
            'User';
    },

    // Get role label with emoji
    getRoleLabel() {
        return ROLE_LABELS[this.getRole()] || '👤 User';
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// AUTH ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

const AuthActions = {

    // Sign in with email/password
    async signIn(email, password) {
        try {
            // Try Supabase via AuthAPI
            if (window.AuthAPI) {
                const result = await window.AuthAPI.signIn(email, password);

                if (result.data?.user) {
                    await AuthState.init();
                    return { success: true, user: result.data.user };
                }

                if (result.error) {
                    console.warn('Supabase auth failed, trying demo mode:', result.error);
                }
            }

            // Demo mode fallback
            const DEMO_USERS = {
                'admin@mekongmarketing.com': { password: 'admin123', role: 'super_admin', name: 'Admin' },
                'manager@mekongmarketing.com': { password: 'manager123', role: 'manager', name: 'Manager' },
                'creator@mekongmarketing.com': { password: 'creator123', role: 'content_creator', name: 'Creator' },
                'client@mekongmarketing.com': { password: 'client123', role: 'client', name: 'Client Demo' },
                'affiliate@mekongmarketing.com': { password: 'affiliate123', role: 'affiliate', name: 'Affiliate Demo' }
            };

            const demoUser = DEMO_USERS[email.toLowerCase()];

            if (demoUser && demoUser.password === password) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userRole', demoUser.role);
                localStorage.setItem('userName', demoUser.name);
                localStorage.setItem('isDemoMode', 'true');

                await AuthState.init();
                return { success: true, user: { email }, isDemo: true };
            }

            return { success: false, error: 'Email hoặc mật khẩu không đúng' };

        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    },

    // Sign up new user
    async signUp(email, password, metadata = {}) {
        try {
            if (window.AuthAPI) {
                const result = await window.AuthAPI.signUp(email, password, {
                    full_name: metadata.fullName,
                    role: metadata.role || 'affiliate',
                    phone: metadata.phone
                });

                if (result.error) throw result.error;

                return {
                    success: true,
                    user: result.data?.user,
                    message: 'Đăng ký thành công! Kiểm tra email để xác nhận.'
                };
            }

            // Demo mode - just store locally
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userRole', metadata.role || 'affiliate');
            localStorage.setItem('userName', metadata.fullName || email.split('@')[0]);
            localStorage.setItem('isDemoMode', 'true');

            await AuthState.init();
            return { success: true, isDemo: true };

        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    },

    // Sign out
    async signOut() {
        try {
            if (window.AuthAPI) {
                await window.AuthAPI.signOut();
            }
        } catch (error) {
            console.error('Sign out error:', error);
        }

        // Clear local storage
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('isDemoMode');

        // Reset state
        AuthState.user = null;
        AuthState.profile = null;
        AuthState.isAuthenticated = false;

        // Redirect to login
        window.location.href = '/login.html';
    },

    // Reset password request
    async resetPassword(email) {
        try {
            if (window.SupabaseAPI) {
                const client = window.SupabaseAPI.getClient();
                if (client) {
                    const { error } = await client.auth.resetPasswordForEmail(email, {
                        redirectTo: `${window.location.origin}/reset-password.html`
                    });

                    if (error) throw error;
                    return { success: true, message: 'Email đặt lại mật khẩu đã được gửi!' };
                }
            }

            return { success: false, error: 'Demo mode: Liên hệ admin để reset mật khẩu' };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// AUTH GUARDS
// ═══════════════════════════════════════════════════════════════════════════

const AuthGuards = {

    // Require authentication - redirect to login if not authenticated
    async requireAuth() {
        await AuthState.init();

        if (!AuthState.isAuthenticated) {
            window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
            return false;
        }

        return true;
    },

    // Require specific role or higher
    async requireRole(minimumRole) {
        await AuthState.init();

        if (!AuthState.isAuthenticated) {
            window.location.href = '/login.html';
            return false;
        }

        if (!AuthState.hasPermission(minimumRole)) {
            // Redirect to appropriate dashboard based on role
            const redirect = ROLE_REDIRECTS[AuthState.getRole()] || '/';
            window.location.href = redirect;
            return false;
        }

        return true;
    },

    // Redirect authenticated users (for login/register pages)
    async redirectIfAuthenticated() {
        await AuthState.init();

        if (AuthState.isAuthenticated) {
            const redirect = ROLE_REDIRECTS[AuthState.getRole()] || '/';
            window.location.href = redirect;
            return true;
        }

        return false;
    },

    // Check and get redirect URL based on role
    getRedirectUrl() {
        return ROLE_REDIRECTS[AuthState.getRole()] || '/';
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const AuthUI = {

    // Show/hide elements based on role
    applyRoleVisibility() {
        document.querySelectorAll('[data-require-role]').forEach(el => {
            const requiredRole = el.dataset.requireRole;
            el.style.display = AuthState.hasPermission(requiredRole) ? '' : 'none';
        });

        document.querySelectorAll('[data-show-role]').forEach(el => {
            const showRole = el.dataset.showRole;
            el.style.display = AuthState.hasRole(showRole) ? '' : 'none';
        });

        document.querySelectorAll('[data-hide-role]').forEach(el => {
            const hideRole = el.dataset.hideRole;
            el.style.display = AuthState.hasRole(hideRole) ? 'none' : '';
        });
    },

    // Populate user info in UI
    populateUserInfo() {
        document.querySelectorAll('[data-user-name]').forEach(el => {
            el.textContent = AuthState.getDisplayName();
        });

        document.querySelectorAll('[data-user-email]').forEach(el => {
            el.textContent = AuthState.user?.email || '';
        });

        document.querySelectorAll('[data-user-role]').forEach(el => {
            el.textContent = AuthState.getRoleLabel();
        });

        document.querySelectorAll('[data-user-avatar]').forEach(el => {
            if (AuthState.profile?.avatar_url) {
                el.src = AuthState.profile.avatar_url;
            }
        });
    },

    // Setup logout buttons
    setupLogoutButtons() {
        document.querySelectorAll('[data-logout]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                AuthActions.signOut();
            });
        });
    },

    // Initialize all UI helpers
    async init() {
        await AuthState.init();
        this.applyRoleVisibility();
        this.populateUserInfo();
        this.setupLogoutButtons();
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

window.Auth = {
    State: AuthState,
    Actions: AuthActions,
    Guards: AuthGuards,
    UI: AuthUI,
    ROLES,
    ROLE_LEVELS,
    ROLE_LABELS,
    ROLE_REDIRECTS
};

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    AuthState.init();
});

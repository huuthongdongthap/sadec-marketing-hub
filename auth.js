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
    super_admin: '/admin/dashboard.html',
    manager: '/admin/dashboard.html',
    content_creator: '/admin/dashboard.html',
    client: '/portal/dashboard.html',
    affiliate: '/affiliate/dashboard.html'
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
    // ENHANCED: Now reads role from JWT app_metadata first (more secure)
    async init() {
        this.isLoading = true;

        try {
            // Try Supabase via AuthAPI
            if (window.AuthAPI) {
                const session = await window.AuthAPI.getSession();

                if (session?.user) {
                    this.user = session.user;

                    // PHASE 2 ENHANCEMENT: Try to get role from JWT claims first
                    // This is more secure as it's set by the database trigger
                    const jwtRole = session.user.app_metadata?.role;

                    if (jwtRole && ROLE_LEVELS[jwtRole]) {
                        // Role found in JWT - use it directly (most secure)
                        this.profile = {
                            id: session.user.id,
                            email: session.user.email,
                            full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
                            role: jwtRole,
                            avatar_url: session.user.user_metadata?.avatar_url
                        };
                        // console.debug('Auth: Role from JWT claims:', jwtRole);
                    } else {
                        // Fallback: Load profile from database (for users before trigger)
                        const profile = await window.AuthAPI.getProfile();
                        if (profile) {
                            this.profile = profile;
                        }
                        // console.debug('Auth: Role from user_profiles:', this.profile?.role);
                    }

                    // Cache in localStorage for quick access
                    if (this.profile) {
                        localStorage.setItem('userRole', this.profile.role);
                        localStorage.setItem('userName', this.profile.full_name);
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

    // Get current role - STANDARDIZED: JWT → Profile → Demo fallback
    // Priority order: 1) Profile (contains JWT role), 2) Demo localStorage, 3) Default
    getRole() {
        // Primary source: profile (populated from JWT or database in init())
        if (this.profile?.role && ROLE_LEVELS[this.profile.role]) {
            return this.profile.role;
        }

        // Demo mode fallback only
        const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
        if (isDemoMode) {
            const cachedRole = localStorage.getItem('userRole');
            if (cachedRole && ROLE_LEVELS[cachedRole]) {
                return cachedRole;
            }
        }

        return 'affiliate'; // Default role
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
            this.user?.email?.split('@')[0] ||
            localStorage.getItem('userName') ||
            'User';
    },

    // Get role label with emoji
    getRoleLabel() {
        return ROLE_LABELS[this.getRole()] || '👤 User';
    },

    // Dispatch role change event (for cross-component sync)
    _dispatchRoleChange() {
        window.dispatchEvent(new CustomEvent('auth:role:changed', {
            detail: { role: this.getRole(), profile: this.profile }
        }));
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
    },

    // Resend verification email
    async resendVerificationEmail(email) {
        try {
            if (window.SupabaseAPI) {
                const client = window.SupabaseAPI.getClient();
                if (client) {
                    const { error } = await client.auth.resend({
                        type: 'signup',
                        email: email,
                        options: {
                            emailRedirectTo: `${window.location.origin}/verify-email.html`
                        }
                    });

                    if (error) throw error;
                    return { success: true, message: 'Email xác thực đã được gửi lại!' };
                }
            }

            return { success: false, error: 'Demo mode: Không cần xác thực email' };

        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Check if email is verified
    async checkEmailVerified() {
        try {
            if (window.SupabaseAPI) {
                const client = window.SupabaseAPI.getClient();
                if (client) {
                    const { data: { user } } = await client.auth.getUser();
                    if (user) {
                        return {
                            verified: !!user.email_confirmed_at,
                            email: user.email
                        };
                    }
                }
            }
            // Demo mode - always verified
            return { verified: true, email: localStorage.getItem('userEmail') };

        } catch (error) {
            console.error('Check email verified error:', error);
            return { verified: false, email: null };
        }
    },

    // Sign in with Zalo (placeholder - coming soon)
    async signInWithZalo() {
        // Zalo OA integration requires business verification
        // This is a placeholder for future implementation
        return {
            success: false,
            error: 'Đăng nhập bằng Zalo sẽ sớm ra mắt! 🚀',
            isPlaceholder: true
        };
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
// AUTH SECURITY (Idle Timeout)
// ═══════════════════════════════════════════════════════════════════════════

const AuthSecurity = {
    IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    timeoutId: null,

    init() {
        if (!AuthState.isAuthenticated) return;

        this.resetTimer = this.resetTimer.bind(this);
        this.setupListeners();
        this.resetTimer();
        console.log('🛡️ AuthSecurity: Idle monitor active');
    },

    setupListeners() {
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(evt => {
            document.addEventListener(evt, this.resetTimer, true);
        });
    },

    resetTimer() {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => this.handleTimeout(), this.IDLE_TIMEOUT);
    },

    handleTimeout() {
        console.warn('🛡️ AuthSecurity: Session expired due to inactivity');
        AuthActions.signOut();
        alert('Phiên làm việc hết hạn. Vui lòng đăng nhập lại.');
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

        // Initialize Security Monitor
        if (AuthState.isAuthenticated) {
            AuthSecurity.init();
        }
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

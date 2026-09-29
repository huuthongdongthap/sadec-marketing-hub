// ================================================
// MEKONG AGENCY - AUTH SERVICE
// Authentication & User Management
// ================================================

import { supabase } from './supabase-client.js';

// ================================================
// AUTH FUNCTIONS
// ================================================

export const auth = {
    // Sign up with email
    async signUp(email, password, metadata = {}) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: metadata }
        });
        return { data, error };
    },

    // Sign in with email
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    },

    // Sign in with OAuth (Google/Facebook)
    async signInWithOAuth(provider) {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/portal/dashboard.html`
            }
        });
        return { data, error };
    },

    // Sign out
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (!error) window.location.href = '/portal/login.html';
        return { error };
    },

    // Get current user
    async getUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    // Get session
    async getSession() {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    // Check if user is authenticated
    async isAuthenticated() {
        const session = await this.getSession();
        return !!session;
    },

    // Update user profile
    async updateProfile(updates) {
        const { data, error } = await supabase.auth.updateUser(updates);
        return { data, error };
    },

    // Reset password
    async resetPassword(email) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/portal/reset-password.html`
        });
        return { data, error };
    },

    // Send email confirmation
    async resendConfirmation(email) {
        const { data, error } = await supabase.auth.resend({
            type: 'signup',
            email
        });
        return { data, error };
    }
};

// ================================================
// AUTH STATE MANAGEMENT
// ================================================

export class AuthManager {
    constructor() {
        this.currentUser = null;
        this.listeners = new Set();
        this.init();
    }

    init() {
        // Listen to auth state changes
        supabase.auth.onAuthStateChange((event, session) => {
            this.currentUser = session?.user || null;
            this.notifyListeners(event, session);
        });

        // Get initial session
        this.getSession();
    }

    async getSession() {
        const { data: { session } } = await supabase.auth.getSession();
        this.currentUser = session?.user || null;
        return session;
    }

    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notifyListeners(event, session) {
        this.listeners.forEach(callback => callback(event, session));
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    getUser() {
        return this.currentUser;
    }
}

// ================================================
// AUTH GUARDS
// ================================================

export const authGuards = {
    // Redirect to login if not authenticated
    async requireAuth(redirectUrl = '/portal/login.html') {
        const session = await auth.getSession();
        if (!session) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    },

    // Redirect to dashboard if already authenticated
    async redirectIfAuth(redirectUrl = '/portal/dashboard.html') {
        const session = await auth.getSession();
        if (session) {
            window.location.href = redirectUrl;
            return true;
        }
        return false;
    },

    // Check if user has required role
    async requireRole(requiredRole) {
        const user = await auth.getUser();
        if (!user) return false;

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();

        return profile?.role === requiredRole;
    },

    // Check if user has any of the required roles
    async requireAnyRole(roles) {
        const user = await auth.getUser();
        if (!user) return false;

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();

        return roles.includes(profile?.role);
    }
};

// ================================================
// EXPORTS
// ================================================

export default auth;

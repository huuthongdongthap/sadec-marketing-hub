/**
 * Realtime Dashboard Client
 * Supabase Realtime subscriptions for live data updates
 * Sa Đéc Marketing Hub
 * 
 * ENHANCED: Integrates with MekongStore for centralized data sync
 */

const RealtimeDashboard = {
    channel: null,
    callbacks: {},
    isConnected: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,

    /**
     * Initialize Realtime subscriptions
     */
    init() {
        const client = window.SupabaseAPI?.getClient();
        if (!client) {
            // console.warn('Supabase client not available for Realtime');
            return false;
        }

        // Create channel for dashboard updates
        this.channel = client.channel('dashboard-realtime')
            // Listen to customers table
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'customers' },
                (payload) => this.handleChange('customers', payload)
            )
            // Listen to contacts (leads)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'contacts' },
                (payload) => this.handleChange('contacts', payload)
            )
            // Listen to scheduled posts
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'scheduled_posts' },
                (payload) => this.handleChange('posts', payload)
            )
            // Listen to invoices
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'invoices' },
                (payload) => this.handleChange('invoices', payload)
            )
            // Listen to deals
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'deals' },
                (payload) => this.handleChange('deals', payload)
            )
            .subscribe((status) => {
                this.handleConnectionStatus(status);
            });

        return true;
    },

    /**
     * Handle connection status changes
     */
    handleConnectionStatus(status) {
        this.isConnected = status === 'SUBSCRIBED';
        this.updateConnectionIndicator();

        if (status === 'SUBSCRIBED') {
            this.reconnectAttempts = 0;
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            this.attemptReconnect();
        }
    },

    /**
     * Attempt to reconnect on connection loss
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('📡 Realtime: Max reconnect attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

        setTimeout(() => {
            this.disconnect();
            this.init();
        }, delay);
    },

    /**
     * Handle database changes - ENHANCED with MekongStore integration
     */
    handleChange(table, payload) {
        // Sync with MekongStore (if available)
        if (window.DataSync) {
            window.DataSync.handleRealtimeUpdate(table, payload);
        }

        // Show toast notification
        this.showUpdateToast(table, payload.eventType);

        // Call registered callbacks
        if (this.callbacks[table]) {
            this.callbacks[table].forEach(cb => cb(payload));
        }

        // Call global refresh if registered
        if (this.callbacks['*']) {
            this.callbacks['*'].forEach(cb => cb(table, payload));
        }
    },

    /**
     * Register callback for table changes
     * @param {string} table - Table name or '*' for all
     * @param {Function} callback - Function to call on change
     * @returns {Function} Unsubscribe function
     */
    onTableChange(table, callback) {
        if (!this.callbacks[table]) {
            this.callbacks[table] = [];
        }
        this.callbacks[table].push(callback);

        // Return unsubscribe function
        return () => {
            this.callbacks[table] = this.callbacks[table].filter(cb => cb !== callback);
        };
    },

    /**
     * Show visual notification of update
     */
    showUpdateToast(table, eventType) {
        const tableNames = {
            customers: 'Khách hàng',
            contacts: 'Lead',
            posts: 'Bài viết',
            invoices: 'Hóa đơn',
            deals: 'Deals'
        };

        const eventNames = {
            INSERT: 'mới được thêm',
            UPDATE: 'đã cập nhật',
            DELETE: 'đã xóa'
        };

        const message = `${tableNames[table] || table} ${eventNames[eventType] || eventType}`;

        // Use sadec-toast if available
        if (window.SadecToast) {
            window.SadecToast.show(message, 'info', 3000);
        }
    },

    /**
     * Update connection indicator in UI
     */
    updateConnectionIndicator() {
        const indicator = document.querySelector('.realtime-indicator');
        if (indicator) {
            indicator.classList.toggle('connected', this.isConnected);
            indicator.title = this.isConnected ? 'Realtime: Connected' : 'Realtime: Disconnected';
        }

        // Also update any status badge
        const statusBadge = document.querySelector('[data-realtime-status]');
        if (statusBadge) {
            statusBadge.textContent = this.isConnected ? '🟢 Live' : '🔴 Offline';
            statusBadge.className = this.isConnected ? 'badge badge-success' : 'badge badge-error';
        }
    },

    /**
     * Disconnect and cleanup
     */
    disconnect() {
        if (this.channel) {
            this.channel.unsubscribe();
            this.channel = null;
            this.isConnected = false;
        }
    },

    /**
     * Force refresh all data
     */
    async refreshAll() {
        if (window.DataSync) {
            await Promise.all([
                window.DataSync.fetch('customers', {}),
                window.DataSync.fetch('leads', {}),
                window.DataSync.fetch('posts', {})
            ]);
        }
    }
};

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Supabase to be initialized
    setTimeout(() => {
        RealtimeDashboard.init();
    }, 1000);
});

// Export
window.RealtimeDashboard = RealtimeDashboard;


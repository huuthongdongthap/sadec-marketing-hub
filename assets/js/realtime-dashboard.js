/**
 * Realtime Dashboard Client
 * Supabase Realtime subscriptions for live data updates
 * Sa Đéc Marketing Hub
 */

const RealtimeDashboard = {
    channel: null,
    callbacks: {},
    isConnected: false,

    /**
     * Initialize Realtime subscriptions
     */
    init() {
        const client = window.SupabaseAPI?.getClient();
        if (!client) {
            console.warn('Supabase client not available for Realtime');
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
            .subscribe((status) => {
                this.isConnected = status === 'SUBSCRIBED';
                console.log(`📡 Realtime: ${status}`);
                this.updateConnectionIndicator();
            });

        console.log('🔌 Realtime Dashboard initialized');
        return true;
    },

    /**
     * Handle database changes
     */
    handleChange(table, payload) {
        console.log(`🔄 ${table}: ${payload.eventType}`, payload.new || payload.old);

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
     */
    onTableChange(table, callback) {
        if (!this.callbacks[table]) {
            this.callbacks[table] = [];
        }
        this.callbacks[table].push(callback);
    },

    /**
     * Show visual notification of update
     */
    showUpdateToast(table, eventType) {
        const tableNames = {
            customers: 'Khách hàng',
            contacts: 'Lead',
            posts: 'Bài viết',
            invoices: 'Hóa đơn'
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
        } else {
            console.log(`🔔 ${message}`);
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

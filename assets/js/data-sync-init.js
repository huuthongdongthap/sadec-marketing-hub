/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DATA SYNC INIT - Integration Loader
 * Sa Đéc Marketing Hub - Data Synchronization System
 * 
 * Initializes and connects:
 * - MekongStore (central state)
 * - RealtimeDashboard (Supabase realtime)
 * - DataSync (API wrapper)
 * 
 * Include this AFTER supabase-config.js and auth.js
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    const DataSyncInit = {
        initialized: false,

        /**
         * Initialize the data sync system
         */
        async init() {
            if (this.initialized) {
                console.log('📦 DataSync already initialized');
                return;
            }

            console.log('📦 Initializing Data Sync System...');

            // Wait for dependencies
            await this.waitForDependencies();

            // Initialize MekongStore
            if (window.MekongStore) {
                window.MekongStore.init();
                console.log('✅ MekongStore initialized');
            }

            // Connect realtime to store
            this.connectRealtimeToStore();

            // Setup auth sync
            this.setupAuthSync();

            // Setup cross-tab sync
            this.setupCrossTabSync();

            this.initialized = true;
            console.log('✅ Data Sync System ready');

            // Dispatch ready event
            window.dispatchEvent(new CustomEvent('datasync:ready'));
        },

        /**
         * Wait for required dependencies to load
         */
        waitForDependencies() {
            return new Promise((resolve, reject) => {
                let attempts = 0;
                const maxAttempts = 100; // 10 seconds max

                const check = () => {
                    if (window.SupabaseAPI && window.MekongStore) {
                        resolve();
                    } else if (attempts >= maxAttempts) {
                        console.error('❌ DataSyncInit: Dependencies (SupabaseAPI, MekongStore) failed to load.');
                        reject(new Error('Dependencies timeout'));
                    } else {
                        attempts++;
                        setTimeout(check, 100);
                    }
                };
                check();
            });
        },

        /**
         * Connect RealtimeDashboard to MekongStore
         */
        connectRealtimeToStore() {
            if (!window.RealtimeDashboard) return;

            // Register global handler to sync all changes to store
            window.RealtimeDashboard.onTableChange('*', (table, payload) => {
                if (window.DataSync) {
                    window.DataSync.handleRealtimeUpdate(table, payload);
                }
            });

            console.log('✅ Realtime → Store connected');
        },

        /**
         * Setup auth state synchronization
         */
        setupAuthSync() {
            // Listen for auth changes
            if (window.AuthAPI?.onAuthChange) {
                window.AuthAPI.onAuthChange((event, session) => {
                    console.log('🔐 Auth event:', event);

                    if (event === 'SIGNED_OUT') {
                        // Clear store on logout
                        window.MekongStore?.clearCache();
                    } else if (event === 'SIGNED_IN' && session) {
                        // Refresh data on login
                        this.refreshAllData();
                    }
                });
            }

            // Listen for role changes
            window.addEventListener('auth:role:changed', (e) => {
                console.log('🔐 Role changed:', e.detail.role);
            });
        },

        /**
         * Setup cross-tab synchronization via localStorage events
         */
        setupCrossTabSync() {
            window.addEventListener('storage', (e) => {
                if (e.key?.startsWith('mekong_store_')) {
                    const entity = e.key.replace('mekong_store_', '');
                    console.log(`📡 Cross-tab update: ${entity}`);

                    // Restore from new localStorage value
                    if (window.MekongStore) {
                        window.MekongStore._restore(entity);
                        window.MekongStore._notify(entity, 'cross-tab', null);
                    }
                }
            });
        },

        /**
         * Refresh all data from server
         */
        async refreshAllData() {
            if (!window.DataSync) return;

            try {
                await Promise.all([
                    window.DataSync.fetch('customers', {}),
                    window.DataSync.fetch('leads', { limit: 50 }),
                    window.DataSync.fetch('posts', { limit: 20 })
                ]);
                console.log('✅ All data refreshed');
            } catch (err) {
                console.error('Failed to refresh data:', err);
            }
        },

        /**
         * Get sync status for debugging
         */
        getStatus() {
            return {
                initialized: this.initialized,
                storeReady: !!window.MekongStore,
                realtimeConnected: window.RealtimeDashboard?.isConnected,
                entities: window.MekongStore ? Object.keys(window.MekongStore.state) : []
            };
        }
    };

    // Export
    window.DataSyncInit = DataSyncInit;

    // Auto-init when DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        DataSyncInit.init().catch(err => console.error('DataSync init failed:', err));
    });

})();

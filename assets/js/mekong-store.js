/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MEKONG STORE - Central State Management
 * Sa Đéc Marketing Hub - Data Synchronization System
 * 
 * Provides:
 * - Unified reactive state for all entities
 * - Cross-component data synchronization via events
 * - LocalStorage persistence for offline support
 * - Integration with Supabase Realtime
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MekongStore = {
    // ═══════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════
    state: {
        customers: { data: [], loading: false, lastFetch: null },
        leads: { data: [], loading: false, lastFetch: null },
        posts: { data: [], loading: false, lastFetch: null },
        invoices: { data: [], loading: false, lastFetch: null },
        deals: { data: [], loading: false, lastFetch: null }
    },

    // Subscriber callbacks per entity
    subscribers: {},

    // Configuration
    config: {
        cacheTimeout: 5 * 60 * 1000, // 5 minutes
        persistKeys: ['customers', 'leads'], // Keys to persist in localStorage
        debug: false
    },

    // ═══════════════════════════════════════════════════════════════════════
    // GETTERS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Get state for an entity
     * @param {string} key - Entity key (customers, leads, etc.)
     * @returns {Object} State object with data, loading, lastFetch
     */
    get(key) {
        return this.state[key] || { data: [], loading: false, lastFetch: null };
    },

    /**
     * Get data array directly
     * @param {string} key - Entity key
     * @returns {Array} Data array
     */
    getData(key) {
        return this.state[key]?.data || [];
    },

    /**
     * Check if data needs refresh
     * @param {string} key - Entity key
     * @returns {boolean}
     */
    isStale(key) {
        const state = this.state[key];
        if (!state?.lastFetch) return true;
        return Date.now() - state.lastFetch > this.config.cacheTimeout;
    },

    // ═══════════════════════════════════════════════════════════════════════
    // SETTERS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Set data for an entity
     * @param {string} key - Entity key
     * @param {Array} data - Data array
     * @param {Object} options - { silent: boolean }
     */
    set(key, data, options = {}) {
        this._ensureState(key);

        this.state[key].data = data;
        this.state[key].loading = false;
        this.state[key].lastFetch = Date.now();

        this._persist(key);

        if (!options.silent) {
            this._notify(key, 'set', data);
        }

        this._log(`Set ${key}:`, data.length, 'items');
    },

    /**
     * Set loading state
     * @param {string} key - Entity key
     * @param {boolean} loading - Loading state
     */
    setLoading(key, loading) {
        if (this.state[key]) {
            this.state[key].loading = loading;
            this._notify(key, 'loading', loading);
        }
    },

    /**
     * Add single item to entity
     * @param {string} key - Entity key
     * @param {Object} item - Item to add
     */
    add(key, item) {
        if (!this.state[key]) return;

        this.state[key].data.unshift(item);
        this._updateMetaAndNotify(key, 'add', item);
    },

    /**
     * Update single item in entity
     * @param {string} key - Entity key
     * @param {string|number} id - Item ID
     * @param {Object} updates - Fields to update
     */
    update(key, id, updates) {
        if (!this.state[key]) return;

        const index = this.state[key].data.findIndex(item => item.id === id);
        if (index !== -1) {
            this.state[key].data[index] = { ...this.state[key].data[index], ...updates };
            this._updateMetaAndNotify(key, 'update', { id, updates });
        }
    },

    /**
     * Remove item from entity
     * @param {string} key - Entity key
     * @param {string|number} id - Item ID
     */
    remove(key, id) {
        if (!this.state[key]) return;

        this.state[key].data = this.state[key].data.filter(item => item.id !== id);
        this._updateMetaAndNotify(key, 'remove', { id });
    },

    /**
     * Helper to update timestamp, persist, and notify
     * @private
     */
    _updateMetaAndNotify(key, action, payload) {
        this.state[key].lastFetch = Date.now();
        this._persist(key);
        this._notify(key, action, payload);
        this._log(`${action} on ${key}`);
    },

    /**
     * Ensure state object exists for key
     * @private
     */
    _ensureState(key) {
        if (!this.state[key]) {
            this.state[key] = { data: [], loading: false, lastFetch: null };
        }
    },

    // ═══════════════════════════════════════════════════════════════════════
    // SUBSCRIPTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Subscribe to entity changes
     * @param {string} key - Entity key or '*' for all
     * @param {Function} callback - Callback function (action, payload)
     * @returns {Function} Unsubscribe function
     */
    subscribe(key, callback) {
        if (!this.subscribers[key]) {
            this.subscribers[key] = [];
        }
        this.subscribers[key].push(callback);

        this._log(`Subscribed to ${key}`);

        // Return unsubscribe function
        return () => {
            if (this.subscribers[key]) {
                this.subscribers[key] = this.subscribers[key].filter(cb => cb !== callback);
            }
        };
    },

    /**
     * Notify all subscribers
     * @private
     */
    _notify(key, action, payload) {
        const notifyList = (list) => {
            if (!list) return;
            list.forEach(cb => {
                try {
                    cb(action, payload, key);
                } catch (err) {
                    console.error(`MekongStore: Subscriber error for ${key}:`, err);
                }
            });
        };

        notifyList(this.subscribers[key]);
        notifyList(this.subscribers['*']);

        // Dispatch DOM event for non-JS listeners
        window.dispatchEvent(new CustomEvent('mekong:store:change', {
            detail: { key, action, payload }
        }));
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Persist entity to localStorage
     * @private
     */
    _persist(key) {
        if (!this.config.persistKeys.includes(key)) return;

        try {
            const data = this.state[key];
            localStorage.setItem(
                `mekong_store_${key}`,
                JSON.stringify({
                    data: data.data,
                    lastFetch: data.lastFetch
                })
            );
        } catch (err) {
            console.warn(`MekongStore: Failed to persist ${key}:`, err);
        }
    },

    /**
     * Restore entity from localStorage
     * @private
     */
    _restore(key) {
        try {
            const stored = localStorage.getItem(`mekong_store_${key}`);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.state[key] = {
                    data: parsed.data || [],
                    loading: false,
                    lastFetch: parsed.lastFetch || null
                };
                this._log(`Restored ${key} from cache:`, parsed.data?.length || 0, 'items');
                return true;
            }
        } catch (err) {
            console.warn(`MekongStore: Failed to restore ${key}:`, err);
        }
        return false;
    },

    /**
     * Clear all persisted data
     */
    clearCache() {
        this.config.persistKeys.forEach(key => {
            localStorage.removeItem(`mekong_store_${key}`);
        });
        this._log('Cache cleared');
    },

    // ═══════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Initialize store - restore from cache
     */
    init() {
        this.config.persistKeys.forEach(key => {
            this._restore(key);
        });
        this._log('Store initialized');
    },

    /**
     * Debug logging
     * @private
     */
    _log(...args) {
        if (this.config.debug) {
            // Debug mode only
        }
    },

    /**
     * Enable debug mode
     */
    enableDebug() {
        this.config.debug = true;
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// DATA SYNC - API Integration Layer
// ═══════════════════════════════════════════════════════════════════════════

const ENTITY_MAP = {
    customers: 'customers',
    contacts: 'leads',
    scheduled_posts: 'posts',
    invoices: 'invoices'
};

const DataSync = {
    /**
     * Fetch and sync entity data from API
     * @param {string} entity - Entity name
     * @param {Object} filters - Optional filters
     * @returns {Promise<Array>}
     */
    async fetch(entity, filters = {}) {
        // Return from cache if fresh
        if (!MekongStore.isStale(entity) && MekongStore.getData(entity).length > 0) {
            return { data: MekongStore.getData(entity), fromCache: true };
        }

        MekongStore.setLoading(entity, true);

        try {
            let result;
            switch (entity) {
                case 'customers':
                    result = await AdminAPI.loadCustomers(filters);
                    break;
                case 'leads':
                    result = await this._fetchLeads(filters);
                    break;
                case 'posts':
                    result = await AdminAPI.loadPosts(filters);
                    break;
                case 'invoices':
                    result = await this._fetchInvoices(filters);
                    break;
                default:
                    throw new Error(`Unknown entity: ${entity}`);
            }

            if (!result.error) {
                MekongStore.set(entity, result.data);
                return { data: result.data, fromCache: false };
            } else {
                throw result.error;
            }
        } catch (err) {
            console.error(`DataSync: Failed to fetch ${entity}:`, err);
            MekongStore.setLoading(entity, false);
            return { data: MekongStore.getData(entity), error: err };
        }
    },

    /**
     * Mutate entity data and sync store
     * @param {string} entity - Entity name
     * @param {string} action - Action: save, delete, updateStatus
     * @param {Object} data - Data for the action
     * @returns {Promise<Object>}
     */
    async mutate(entity, action, data) {
        try {
            let result;

            switch (entity) {
                case 'customers':
                    result = await this._mutateCustomer(action, data);
                    break;
                case 'posts':
                    result = await this._mutatePost(action, data);
                    break;
                default:
                    throw new Error(`Unknown entity for mutation: ${entity}`);
            }

            if (!result.error) {
                // Update store based on action
                if (action === 'save') {
                    if (data.id) {
                        MekongStore.update(entity, data.id, result.data);
                    } else {
                        MekongStore.add(entity, result.data);
                    }
                } else if (action === 'delete') {
                    MekongStore.remove(entity, data.id || data);
                } else if (action === 'updateStatus') {
                    MekongStore.update(entity, data.id, { status: data.status });
                }

                return { success: true, data: result.data };
            } else {
                return { success: false, error: result.error };
            }
        } catch (err) {
            console.error(`DataSync: Mutation failed for ${entity}:`, err);
            return { success: false, error: err };
        }
    },

    /**
     * Handle realtime update from Supabase
     * @param {string} table - Database table name
     * @param {Object} payload - Realtime payload
     */
    handleRealtimeUpdate(table, payload) {
        const entity = ENTITY_MAP[table];
        if (!entity) return;

        switch (payload.eventType) {
            case 'INSERT':
                MekongStore.add(entity, payload.new);
                break;
            case 'UPDATE':
                MekongStore.update(entity, payload.new.id, payload.new);
                break;
            case 'DELETE':
                MekongStore.remove(entity, payload.old.id);
                break;
        }
    },

    // Private helpers
    async _fetchLeads(filters) {
        const client = window.SupabaseAPI?.getClient();
        if (!client) return { error: 'Not initialized', data: [] };

        let query = client.from('contacts').select('*').order('created_at', { ascending: false });
        if (filters.limit) query = query.limit(filters.limit);

        return await query;
    },

    async _fetchInvoices(filters) {
        const client = window.SupabaseAPI?.getClient();
        if (!client) return { error: 'Not initialized', data: [] };

        let query = client.from('invoices').select('*').order('created_at', { ascending: false });
        if (filters.limit) query = query.limit(filters.limit);

        return await query;
    },

    async _mutateCustomer(action, data) {
        switch (action) {
            case 'save':
                return await AdminAPI.saveCustomer(data);
            case 'delete':
                return await AdminAPI.deleteCustomer(data.id || data);
            case 'updateStatus':
                return await AdminAPI.updateCustomerStatus(data.id, data.status);
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    },

    async _mutatePost(action, data) {
        switch (action) {
            case 'save':
                return await AdminAPI.savePost(data);
            case 'delete':
                return await AdminAPI.deletePost(data.id || data);
            case 'updateStatus':
                return await AdminAPI.updatePostStatus(data.id, data.status);
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

window.MekongStore = MekongStore;
window.DataSync = DataSync;

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    MekongStore.init();
});

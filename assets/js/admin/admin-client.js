/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ADMIN CLIENT - Admin API Client
 * Sa Đéc Marketing Hub - Admin Module
 *
 * Provides:
 * - Admin API client for CRUD operations
 * - Entity management (clients, campaigns, leads, deals)
 * - Integration with Supabase Admin APIs
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { mekongStore } from '../services/mekong-store.js';

const AdminClient = {
    // ═══════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════
    config: {
        baseUrl: '/functions/v1/admin',
        timeout: 30000,
        debug: false
    },

    // ═══════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════
    init() {
        console.log('[AdminClient] Initialized');
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Listen for data refresh events
        document.addEventListener('mekong:data-refresh', async (e) => {
            const { entity } = e.detail;
            if (entity) {
                await this.refreshEntity(entity);
            }
        });
    },

    // ═══════════════════════════════════════════════════════════════════════
    // CORE METHODS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Fetch entities from admin API
     * @param {string} entity - Entity type (clients, campaigns, leads, deals)
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Entity data
     */
    async fetch(entity, options = {}) {
        const url = `${this.config.baseUrl}/${entity}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(this.config.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Update store
            mekongStore.set(entity, data);

            return data;
        } catch (error) {
            console.error(`[AdminClient] Failed to fetch ${entity}:`, error);
            throw error;
        }
    },

    /**
     * Create new entity
     * @param {string} entity - Entity type
     * @param {Object} data - Entity data
     * @returns {Promise<Object>} Created entity
     */
    async create(entity, data) {
        const url = `${this.config.baseUrl}/${entity}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(this.config.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            // Refresh store
            await this.refreshEntity(entity);

            return result;
        } catch (error) {
            console.error(`[AdminClient] Failed to create ${entity}:`, error);
            throw error;
        }
    },

    /**
     * Update entity
     * @param {string} entity - Entity type
     * @param {string} id - Entity ID
     * @param {Object} data - Updated data
     * @returns {Promise<Object>} Updated entity
     */
    async update(entity, id, data) {
        const url = `${this.config.baseUrl}/${entity}/${id}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(this.config.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            // Refresh store
            await this.refreshEntity(entity);

            return result;
        } catch (error) {
            console.error(`[AdminClient] Failed to update ${entity}:`, error);
            throw error;
        }
    },

    /**
     * Delete entity
     * @param {string} entity - Entity type
     * @param {string} id - Entity ID
     * @returns {Promise<void>}
     */
    async delete(entity, id) {
        const url = `${this.config.baseUrl}/${entity}/${id}`;

        try {
            const response = await fetch(url, {
                method: 'DELETE',
                signal: AbortSignal.timeout(this.config.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Refresh store
            await this.refreshEntity(entity);
        } catch (error) {
            console.error(`[AdminClient] Failed to delete ${entity}:`, error);
            throw error;
        }
    },

    /**
     * Refresh entity data from API
     * @param {string} entity - Entity type
     */
    async refreshEntity(entity) {
        try {
            await this.fetch(entity);
            console.log(`[AdminClient] Refreshed ${entity}`);
        } catch (error) {
            console.error(`[AdminClient] Failed to refresh ${entity}:`, error);
        }
    },

    // ═══════════════════════════════════════════════════════════════════════
    // ENTITY-SPECIFIC HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    async getclients() {
        return this.fetch('clients');
    },

    async getCampaigns() {
        return this.fetch('campaigns');
    },

    async getLeads() {
        return this.fetch('leads');
    },

    async getDeals() {
        return this.fetch('deals');
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AdminClient.init());
} else {
    AdminClient.init();
}

export { AdminClient };
export default AdminClient;

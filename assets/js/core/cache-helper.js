/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SA ĐÉC MARKETING HUB — CACHE HELPER
 * Intelligent cache management with TTL support
 *
 * Features:
 * - TTL-based cache expiration
 * - LRU eviction strategy
 * - localStorage + memory hybrid
 * - Cache invalidation patterns
 * - Performance metrics tracking
 *
 * Usage:
 *   Cache.set('key', data, { ttl: 3600 });
 *   Cache.get('key');
 *   Cache.remove('key');
 *   Cache.clear();
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from '../shared/logger.js';

const CACHE_PREFIX = 'sadec_cache_';
const METADATA_SUFFIX = '_meta';

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxItems: 100,
    checkInterval: 60 * 1000, // Check every minute
    storage: 'localStorage' // 'localStorage' | 'memory' | 'hybrid'
};

/**
 * In-memory cache fallback
 */
const memoryCache = new Map();

class CacheHelper {
    constructor(config = {}) {
        this.config = { ...CACHE_CONFIG, ...config };
        this.metadata = new Map();
        this.accessOrder = new Set();

        // Auto-cleanup on interval
        this.cleanupInterval = setInterval(() => this.cleanup(), this.config.checkInterval);

        Logger.log('[CacheHelper] Initialized', this.config);
    }

    /**
     * Get value from cache
     * @param {string} key
     * @param {any} defaultValue
     * @returns {any}
     */
    get(key, defaultValue = null) {
        const fullKey = CACHE_PREFIX + key;
        const metadataKey = fullKey + METADATA_SUFFIX;

        try {
            // Check metadata first
            let meta = this.metadata.get(fullKey);

            if (!meta && this.isStorageAvailable()) {
                const metaStr = localStorage.getItem(metadataKey);
                if (metaStr) {
                    meta = JSON.parse(metaStr);
                    this.metadata.set(fullKey, meta);
                }
            }

            // Check if expired
            if (meta && meta.expiry && meta.expiry < Date.now()) {
                Logger.debug('[CacheHelper] Cache expired', key);
                this.remove(key);
                return defaultValue;
            }

            // Get from storage
            let value = null;

            if (this.config.storage === 'memory' || this.config.storage === 'hybrid') {
                value = memoryCache.get(fullKey);
            }

            if (!value && this.isStorageAvailable()) {
                const stored = localStorage.getItem(fullKey);
                if (stored) {
                    value = JSON.parse(stored);
                }
            }

            // Update access order for LRU
            if (value !== null) {
                this.updateAccessOrder(key);
                Logger.debug('[CacheHelper] Cache hit', key);
            } else {
                Logger.debug('[CacheHelper] Cache miss', key);
            }

            return value !== null ? value : defaultValue;

        } catch (error) {
            Logger.error('[CacheHelper] Get failed', { key, error });
            return defaultValue;
        }
    }

    /**
     * Set value in cache
     * @param {string} key
     * @param {any} value
     * @param {Object} options
     * @param {number} options.ttl - Time to live in seconds
     * @param {boolean} options.permanent - No expiration
     */
    set(key, value, options = {}) {
        const fullKey = CACHE_PREFIX + key;
        const metadataKey = fullKey + METADATA_SUFFIX;

        const ttl = options.permanent ? null : (options.ttl || this.config.defaultTTL) * 1000;
        const expiry = ttl ? Date.now() + ttl : null;

        try {
            // Store metadata
            const meta = {
                created: Date.now(),
                expiry,
                ttl,
                size: JSON.stringify(value).length
            };

            this.metadata.set(fullKey, meta);

            if (this.isStorageAvailable()) {
                localStorage.setItem(metadataKey, JSON.stringify(meta));
            }

            // Store value
            if (this.config.storage === 'memory' || this.config.storage === 'hybrid') {
                memoryCache.set(fullKey, value);
            }

            if (this.isStorageAvailable()) {
                localStorage.setItem(fullKey, JSON.stringify(value));
            }

            // Update access order
            this.updateAccessOrder(key);

            // Check if over limit
            if (this.metadata.size > this.config.maxItems) {
                this.evictLRU();
            }

            Logger.debug('[CacheHelper] Cache set', { key, ttl, size: meta.size });

        } catch (error) {
            Logger.error('[CacheHelper] Set failed', { key, error });

            // Handle quota exceeded
            if (error.name === 'QuotaExceededError') {
                this.handleQuotaExceeded();
            }
        }
    }

    /**
     * Remove value from cache
     * @param {string} key
     */
    remove(key) {
        const fullKey = CACHE_PREFIX + key;
        const metadataKey = fullKey + METADATA_SUFFIX;

        try {
            this.metadata.delete(fullKey);
            this.accessOrder.delete(key);

            if (this.config.storage === 'memory' || this.config.storage === 'hybrid') {
                memoryCache.delete(fullKey);
            }

            if (this.isStorageAvailable()) {
                localStorage.removeItem(fullKey);
                localStorage.removeItem(metadataKey);
            }

            Logger.debug('[CacheHelper] Cache removed', key);

        } catch (error) {
            Logger.error('[CacheHelper] Remove failed', { key, error });
        }
    }

    /**
     * Clear all cache
     */
    clear() {
        try {
            this.metadata.clear();
            this.accessOrder.clear();

            if (this.config.storage === 'memory' || this.config.storage === 'hybrid') {
                memoryCache.clear();
            }

            if (this.isStorageAvailable()) {
                const keys = Object.keys(localStorage);

                keys.forEach(key => {
                    if (key.startsWith(CACHE_PREFIX)) {
                        localStorage.removeItem(key);
                    }
                });
            }

            Logger.log('[CacheHelper] Cache cleared');

        } catch (error) {
            Logger.error('[CacheHelper] Clear failed', error);
        }
    }

    /**
     * Check if key exists in cache
     * @param {string} key
     * @returns {boolean}
     */
    has(key) {
        const fullKey = CACHE_PREFIX + key;

        try {
            let meta = this.metadata.get(fullKey);

            if (!meta && this.isStorageAvailable()) {
                const metaStr = localStorage.getItem(fullKey + METADATA_SUFFIX);
                if (metaStr) {
                    meta = JSON.parse(metaStr);
                }
            }

            if (!meta) return false;

            // Check if expired
            if (meta.expiry && meta.expiry < Date.now()) {
                this.remove(key);
                return false;
            }

            return true;

        } catch (error) {
            Logger.error('[CacheHelper] Has failed', { key, error });
            return false;
        }
    }

    /**
     * Get cache statistics
     * @returns {Object}
     */
    getStats() {
        const stats = {
            items: 0,
            totalSize: 0,
            oldest: null,
            newest: null,
            expired: 0
        };

        this.metadata.forEach((meta, key) => {
            stats.items++;
            stats.totalSize += meta.size || 0;

            if (meta.expiry && meta.expiry < Date.now()) {
                stats.expired++;
            }

            if (!stats.oldest || meta.created < stats.oldest) {
                stats.oldest = meta.created;
            }

            if (!stats.newest || meta.created > stats.newest) {
                stats.newest = meta.created;
            }
        });

        return {
            ...stats,
            oldest: stats.oldest ? new Date(stats.oldest) : null,
            newest: stats.newest ? new Date(stats.newest) : null,
            totalSizeKB: Math.round(stats.totalSize / 1024)
        };
    }

    /**
     * Clean up expired entries
     */
    cleanup() {
        const now = Date.now();
        let cleaned = 0;

        this.metadata.forEach((meta, key) => {
            if (meta.expiry && meta.expiry < now) {
                const shortKey = key.replace(CACHE_PREFIX, '');
                this.remove(shortKey);
                cleaned++;
            }
        });

        if (cleaned > 0) {
            Logger.log('[CacheHelper] Cleaned up', cleaned, 'expired entries');
        }
    }

    /**
     * Evict least recently used item
     */
    evictLRU() {
        const firstKey = this.accessOrder.values().next().value;

        if (firstKey) {
            this.remove(firstKey);
            Logger.debug('[CacheHelper] Evicted LRU', firstKey);
        }
    }

    /**
     * Handle quota exceeded error
     */
    handleQuotaExceeded() {
        Logger.warn('[CacheHelper] Quota exceeded, evicting entries');

        // Evict 20% of entries
        const toEvict = Math.floor(this.metadata.size * 0.2);

        for (let i = 0; i < toEvict; i++) {
            this.evictLRU();
        }
    }

    /**
     * Update access order for LRU tracking
     * @param {string} key
     */
    updateAccessOrder(key) {
        this.accessOrder.delete(key);
        this.accessOrder.add(key);
    }

    /**
     * Check if localStorage is available
     * @returns {boolean}
     */
    isStorageAvailable() {
        return this.config.storage === 'localStorage' || this.config.storage === 'hybrid';
    }

    /**
     * Get all keys
     * @returns {string[]}
     */
    keys() {
        const keys = [];

        this.metadata.forEach((meta, fullKey) => {
            keys.push(fullKey.replace(CACHE_PREFIX, ''));
        });

        return keys;
    }

    /**
     * Destroy cache helper and stop cleanup interval
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }

        Logger.log('[CacheHelper] Destroyed');
    }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let cacheInstance = null;

function getCache(config = {}) {
    if (!cacheInstance) {
        cacheInstance = new CacheHelper(config);
    }

    return cacheInstance;
}

// Convenience methods for direct use
const Cache = {
    get: (key, defaultValue) => getCache().get(key, defaultValue),
    set: (key, value, options) => getCache().set(key, value, options),
    remove: (key) => getCache().remove(key),
    clear: () => getCache().clear(),
    has: (key) => getCache().has(key),
    getStats: () => getCache().getStats(),
    cleanup: () => getCache().cleanup(),
    keys: () => getCache().keys()
};

// Auto-export for window
if (typeof window !== 'undefined') {
    window.Cache = Cache;
    window.CacheHelper = CacheHelper;
}

export { CacheHelper, Cache, getCache };
export default Cache;

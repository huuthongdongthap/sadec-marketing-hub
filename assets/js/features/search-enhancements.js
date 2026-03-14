/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SEARCH ENHANCEMENTS - Global Search UX Improvements
 * Sa Đéc Marketing Hub - Enhanced Search Functionality
 *
 * Features:
 * - Fuzzy search across all modules
 * - Recent searches with localStorage
 * - Keyboard shortcut (Ctrl/Cmd + K)
 * - Search analytics
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from '../shared/logger.js';

const SearchEnhancements = {
    config: {
        maxRecentSearches: 10,
        debounceMs: 300,
        storageKey: 'sadec_recent_searches'
    },

    state: {
        recentSearches: [],
        currentQuery: '',
        isActive: false
    },

    /**
     * Initialize search enhancements
     */
    init() {
        Logger.log('[SearchEnhancements] Initializing');
        this.loadRecentSearches();
        this.setupKeyboardShortcut();
        this.setupSearchListeners();
    },

    /**
     * Load recent searches from localStorage
     */
    loadRecentSearches() {
        try {
            const stored = localStorage.getItem(this.config.storageKey);
            this.state.recentSearches = stored ? JSON.parse(stored) : [];
        } catch (error) {
            Logger.error('[SearchEnhancements] Failed to load recent searches', error);
            this.state.recentSearches = [];
        }
    },

    /**
     * Save recent searches to localStorage
     */
    saveRecentSearches() {
        try {
            localStorage.setItem(this.config.storageKey, JSON.stringify(this.state.recentSearches));
        } catch (error) {
            Logger.error('[SearchEnhancements] Failed to save recent searches', error);
        }
    },

    /**
     * Add search to recent searches
     * @param {string} query - Search query
     */
    addRecentSearch(query) {
        if (!query || query.trim().length === 0) return;

        // Remove if already exists
        this.state.recentSearches = this.state.recentSearches.filter(s => s !== query);

        // Add to top
        this.state.recentSearches.unshift(query);

        // Limit size
        if (this.state.recentSearches.length > this.config.maxRecentSearches) {
            this.state.recentSearches.pop();
        }

        this.saveRecentSearches();
        this.onRecentSearchesChange();
    },

    /**
     * Clear recent searches
     */
    clearRecentSearches() {
        this.state.recentSearches = [];
        this.saveRecentSearches();
        this.onRecentSearchesChange();
    },

    /**
     * Setup keyboard shortcut (Ctrl/Cmd + K)
     */
    setupKeyboardShortcut() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }
        });
    },

    /**
     * Setup search input listeners
     */
    setupSearchListeners() {
        // Listen for search events from command palette
        document.addEventListener('command-palette:search', (e) => {
            const { query } = e.detail;
            this.state.currentQuery = query;
            this.addRecentSearch(query);
            this.trackSearch(query);
        });
    },

    /**
     * Focus search input
     */
    focusSearch() {
        const searchInput = document.querySelector('input[type="text"][placeholder*="Tìm"], input[type="search"]');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }

        // Open command palette if exists
        const commandPalette = document.querySelector('command-palette');
        if (commandPalette && commandPalette.open) {
            commandPalette.open();
        }
    },

    /**
     * Track search analytics
     * @param {string} query - Search query
     */
    trackSearch(query) {
        // Send to analytics endpoint
        const event = {
            type: 'search',
            query,
            timestamp: new Date().toISOString(),
            path: window.location.pathname
        };

        // Store locally for later sync
        const analyticsKey = 'sadec_search_analytics';
        try {
            const analytics = JSON.parse(localStorage.getItem(analyticsKey) || '[]');
            analytics.push(event);
            localStorage.setItem(analyticsKey, JSON.stringify(analytics));
        } catch (error) {
            Logger.error('[SearchEnhancements] Failed to track search', error);
        }

        Logger.debug('[SearchEnhancements] Tracked search:', query);
    },

    /**
     * Callback when recent searches change
     */
    onRecentSearchesChange() {
        // Dispatch event for components to update
        const event = new CustomEvent('search:recent-changed', {
            detail: { recentSearches: this.state.recentSearches }
        });
        document.dispatchEvent(event);
    },

    /**
     * Get recent searches
     * @returns {Array<string>} Recent searches
     */
    getRecentSearches() {
        return [...this.state.recentSearches];
    },

    /**
     * Fuzzy search implementation
     * @param {string} query - Search query
     * @param {Array<string>} items - Items to search
     * @returns {Array<{item: string, score: number}>}
     */
    fuzzySearch(query, items) {
        const normalizedQuery = query.toLowerCase().trim();

        return items
            .map(item => {
                const normalizedItem = item.toLowerCase();
                let score = 0;
                let index = normalizedItem.indexOf(normalizedQuery);

                if (index === -1) {
                    // Try fuzzy match
                    const queryChars = normalizedQuery.split('');
                    let matchCount = 0;
                    let lastIndex = -1;

                    for (const char of queryChars) {
                        const charIndex = normalizedItem.indexOf(char, lastIndex + 1);
                        if (charIndex !== -1) {
                            matchCount++;
                            lastIndex = charIndex;
                        }
                    }

                    score = matchCount / query.length;
                } else {
                    // Exact substring match
                    score = 1 - (index / normalizedItem.length);
                }

                return { item, score };
            })
            .filter(result => result.score > 0.3)
            .sort((a, b) => b.score - a.score);
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SearchEnhancements.init());
} else {
    SearchEnhancements.init();
}

export { SearchEnhancements };
export default SearchEnhancements;

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AI SEARCH ENHANCEMENTS — Sa Đéc Marketing Hub
 *
 * Features:
 * - AI-powered search suggestions
 * - Intelligent content recommendations
 * - Semantic search understanding
 * - Search history with insights
 * - Trending searches
 *
 * Usage:
 *   AISearchEnhancement.init();
 *   AISearchEnhancement.getSuggestions(query);
 *   AISearchEnhancement.getRecommendations();
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Logger } from '../shared/logger.js';

const TAG = '[AISearchEnhancement]';

/**
 * AI Search Enhancement Class
 */
class AISearchEnhancementClass {
  constructor() {
    this.searchHistory = [];
    this.trendingSearches = [];
    this.contentIndex = [];
    this.initialized = false;
    this.storageKey = 'sadec-ai-search';
  }

  /**
   * Initialize AI search enhancements
   */
  async init() {
    if (this.initialized) return;

    Logger.info(TAG, 'Initializing AI Search Enhancement...');

    // Load search history
    this.loadSearchHistory();

    // Build content index
    await this.buildContentIndex();

    // Load trending searches
    this.loadTrendingSearches();

    // Hook into existing search
    this.enhanceExistingSearch();

    this.initialized = true;
    Logger.info(TAG, 'AI Search Enhancement initialized');
  }

  /**
   * Load search history from localStorage
   */
  loadSearchHistory() {
    try {
      const stored = localStorage.getItem(`${this.storageKey}-history`);
      if (stored) {
        this.searchHistory = JSON.parse(stored);
        // Keep only last 50 searches
        this.searchHistory = this.searchHistory.slice(0, 50);
      }
    } catch (error) {
      Logger.error(TAG, 'Failed to load search history:', error);
      this.searchHistory = [];
    }
  }

  /**
   * Save search to history
   */
  saveSearch(query, results = 0) {
    const searchItem = {
      query: query.toLowerCase().trim(),
      timestamp: new Date().toISOString(),
      results,
      clicked: false
    };

    // Remove duplicate
    this.searchHistory = this.searchHistory.filter(
      item => item.query !== searchItem.query
    );

    // Add to beginning
    this.searchHistory.unshift(searchItem);

    // Trim to 50
    this.searchHistory = this.searchHistory.slice(0, 50);

    // Save
    try {
      localStorage.setItem(`${this.storageKey}-history`, JSON.stringify(this.searchHistory));
    } catch (error) {
      Logger.error(TAG, 'Failed to save search history:', error);
    }

    // Update trending
    this.updateTrendingSearches();
  }

  /**
   * Load trending searches
   */
  loadTrendingSearches() {
    try {
      const stored = localStorage.getItem(`${this.storageKey}-trending`);
      if (stored) {
        this.trendingSearches = JSON.parse(stored);
      }
    } catch (error) {
      Logger.error(TAG, 'Failed to load trending searches:', error);
      this.trendingSearches = [];
    }
  }

  /**
   * Update trending searches based on history
   */
  updateTrendingSearches() {
    const counts = {};

    // Count search frequencies
    this.searchHistory.forEach(item => {
      counts[item.query] = (counts[item.query] || 0) + 1;
    });

    // Sort by frequency
    this.trendingSearches = Object.entries(counts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Save
    try {
      localStorage.setItem(`${this.storageKey}-trending`, JSON.stringify(this.trendingSearches));
    } catch (error) {
      Logger.error(TAG, 'Failed to save trending searches:', error);
    }
  }

  /**
   * Build content index from available pages
   */
  async buildContentIndex() {
    const pages = [
      { id: 'dashboard', title: 'Dashboard', url: '/admin/dashboard.html', keywords: ['tổng quan', 'dashboard', 'thống kê', 'analytics'] },
      { id: 'pipeline', title: 'Pipeline', url: '/admin/pipeline.html', keywords: ['dự án', 'pipeline', 'quản lý', 'kanban'] },
      { id: 'analytics', title: 'AI Analytics', url: '/admin/ai-analysis.html', keywords: ['phân tích', 'AI', 'báo cáo', 'insights'] },
      { id: 'pricing', title: 'Pricing', url: '/admin/pricing.html', keywords: ['giá', 'pricing', 'bảng giá', 'gói cước'] },
      { id: 'features', title: 'Features Demo', url: '/admin/features-demo.html', keywords: ['demo', 'features', 'tính năng'] },
      { id: 'calendar', title: 'Content Calendar', url: '/admin/content-calendar.html', keywords: ['lịch', 'calendar', 'content', 'đăng bài'] },
      { id: 'leads', title: 'Lead Management', url: '/admin/leads.html', keywords: ['khách hàng', 'leads', 'CRM'] },
      { id: 'campaigns', title: 'Campaigns', url: '/admin/campaigns.html', keywords: ['chiến dịch', 'campaigns', 'marketing'] },
      { id: 'reports', title: 'Reports', url: '/admin/reports.html', keywords: ['báo cáo', 'reports', 'thống kê'] },
      { id: 'settings', title: 'Settings', url: '/admin/settings.html', keywords: ['cài đặt', 'settings', 'configuration'] }
    ];

    this.contentIndex = pages;
    Logger.info(TAG, `Indexed ${this.contentIndex.length} pages`);
  }

  /**
   * Get AI-powered search suggestions
   */
  getSuggestions(query) {
    if (!query || query.length < 2) {
      return this.getRecentSearches();
    }

    const queryLower = query.toLowerCase().trim();
    const suggestions = [];

    // 1. Match from content index
    this.contentIndex.forEach(page => {
      const titleMatch = page.title.toLowerCase().includes(queryLower);
      const keywordMatch = page.keywords.some(k => k.includes(queryLower));
      const score = titleMatch ? 10 : (keywordMatch ? 5 : 0);

      if (score > 0) {
        suggestions.push({
          type: 'page',
          id: page.id,
          title: page.title,
          url: page.url,
          score,
          icon: this.getIconForPage(page.id)
        });
      }
    });

    // 2. Match from search history
    this.searchHistory.forEach(item => {
      if (item.query.includes(queryLower) && !suggestions.some(s => s.title?.toLowerCase() === item.query)) {
        suggestions.push({
          type: 'history',
          query: item.query,
          score: 3,
          icon: '🕐'
        });
      }
    });

    // 3. Add trending searches
    if (suggestions.length < 5) {
      this.trendingSearches.forEach(trend => {
        if (trend.query.includes(queryLower) && !suggestions.some(s => s.query === trend.query)) {
          suggestions.push({
            type: 'trending',
            query: trend.query,
            score: 2,
            icon: '🔥'
          });
        }
      });
    }

    // 4. Add quick actions for common queries
    const quickActions = this.getQuickActionsForQuery(queryLower);
    suggestions.push(...quickActions);

    // Sort by score and return top 8
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }

  /**
   * Get quick actions for query
   */
  getQuickActionsForQuery(query) {
    const actions = [];

    if (query.includes('export') || query.includes('xuất')) {
      actions.push({
        type: 'action',
        id: 'export-csv',
        title: 'Xuất CSV',
        action: () => window.ExportUtils?.exportToCSV([]),
        icon: '📤'
      });
    }

    if (query.includes('new') || query.includes('mới') || query.includes('tạo')) {
      actions.push({
        type: 'action',
        id: 'new-project',
        title: 'Tạo dự án mới',
        action: () => window.location.href = '/admin/pipeline.html?action=new',
        icon: '➕'
      });
    }

    if (query.includes('dark') || query.includes('mode')) {
      actions.push({
        type: 'action',
        id: 'toggle-dark-mode',
        title: 'Bật/tắt Dark Mode',
        action: () => window.Theme?.toggle(),
        icon: '🌙'
      });
    }

    if (query.includes('help') || query.includes('hỗ trợ')) {
      actions.push({
        type: 'action',
        id: 'show-help',
        title: 'Hiển thị trợ giúp',
        action: () => window.HelpTour?.start(),
        icon: '❓'
      });
    }

    return actions;
  }

  /**
   * Get content recommendations based on current context
   */
  getRecommendations(context = {}) {
    const recommendations = [];
    const currentPage = context.page || window.location.pathname;

    // Recommend based on current page
    const pageRecommendations = {
      '/admin/dashboard.html': [
        { id: 'analytics', title: 'Xem phân tích chi tiết', url: '/admin/ai-analysis.html', icon: '📈' },
        { id: 'reports', title: 'Báo cáo tổng hợp', url: '/admin/reports.html', icon: '📊' }
      ],
      '/admin/pipeline.html': [
        { id: 'new-project', title: 'Tạo dự án mới', url: '/admin/pipeline.html?action=new', icon: '➕' },
        { id: 'calendar', title: 'Lịch nội dung', url: '/admin/content-calendar.html', icon: '📅' }
      ],
      '/admin/ai-analysis.html': [
        { id: 'dashboard', title: 'Quay lại Dashboard', url: '/admin/dashboard.html', icon: '🏠' },
        { id: 'reports', title: 'Xuất báo cáo', url: '/admin/reports.html', icon: '📤' }
      ]
    };

    return pageRecommendations[currentPage] || [];
  }

  /**
   * Get icon for page
   */
  getIconForPage(pageId) {
    const icons = {
      dashboard: '📊',
      pipeline: '📋',
      analytics: '📈',
      pricing: '💰',
      features: '🎨',
      calendar: '📅',
      leads: '👥',
      campaigns: '📢',
      reports: '📑',
      settings: '⚙️'
    };
    return icons[pageId] || '📄';
  }

  /**
   * Enhance existing search inputs
   */
  enhanceExistingSearch() {
    // Find search inputs and enhance them
    const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="tìm"]');
    searchInputs.forEach(input => {
      this.attachToInput(input);
    });
  }

  /**
   * Attach AI enhancement to input
   */
  attachToInput(input) {
    if (input._aiEnhanced) return;

    input._aiEnhanced = true;

    // Create suggestions container
    const container = document.createElement('div');
    container.className = 'ai-search-suggestions';
    container.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--md-sys-color-surface, #fff);
      border: 1px solid var(--md-sys-color-outline, #e0e0e0);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      display: none;
      max-height: 400px;
      overflow-y: auto;
    `;

    input.style.position = 'relative';
    input.parentNode.insertBefore(container, input.nextSibling);

    let debounceTimer;

    input.addEventListener('input', (e) => {
      const query = e.target.value;

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (query.length >= 2) {
          this.showSuggestions(container, query);
        } else {
          container.style.display = 'none';
        }
      }, 300);
    });

    // Hide on click outside
    document.addEventListener('click', (e) => {
      if (e.target !== input && !container.contains(e.target)) {
        container.style.display = 'none';
      }
    });

    // Handle selection
    container.addEventListener('click', (e) => {
      const suggestion = e.target.closest('.ai-suggestion-item');
      if (suggestion) {
        const index = parseInt(suggestion.dataset.index);
        const suggestions = this.getSuggestions(input.value);
        const selected = suggestions[index];

        if (selected) {
          if (selected.action) {
            selected.action();
          } else if (selected.url) {
            window.location.href = selected.url;
          } else if (selected.query) {
            input.value = selected.query;
            this.saveSearch(selected.query);
          }
        }
        container.style.display = 'none';
      }
    });
  }

  /**
   * Show suggestions in container
   */
  showSuggestions(container, query) {
    const suggestions = this.getSuggestions(query);

    if (suggestions.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.innerHTML = `
      ${suggestions.map((item, index) => `
        <div class="ai-suggestion-item" data-index="${index}" style="
          padding: 12px 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--md-sys-color-outline-variant, #f0f0f0);
        "
        onmouseover="this.style.background='var(--md-sys-color-surface-container, #f5f5f5)'"
        onmouseout="this.style.background='transparent'"
        >
          <span style="font-size: 20px;">${item.icon}</span>
          <div>
            <div style="font-weight: 500;">${item.title || item.query}</div>
            <div style="font-size: 12px; opacity: 0.7;">${this.getTypeLabel(item.type)}</div>
          </div>
        </div>
      `).join('')}
    `;

    container.style.display = 'block';

    // Save search
    this.saveSearch(query, suggestions.length);
  }

  /**
   * Get type label
   */
  getTypeLabel(type) {
    const labels = {
      page: 'Trang',
      history: 'Lịch sử',
      trending: 'Thịnh hành',
      action: 'Hành động'
    };
    return labels[type] || type;
  }

  /**
   * Get recent searches
   */
  getRecentSearches() {
    return this.searchHistory.slice(0, 5).map(item => ({
      type: 'history',
      query: item.query,
      score: 1,
      icon: '🕐'
    }));
  }
}

// Create singleton instance
const AISearchEnhancement = new AISearchEnhancementClass();

// Auto-initialize on DOM ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    AISearchEnhancement.init();
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AISearchEnhancement;
}

// Global access
window.AISearchEnhancement = AISearchEnhancement;

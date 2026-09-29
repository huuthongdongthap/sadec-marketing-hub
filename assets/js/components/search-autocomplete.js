/**
 * Search Autocomplete Component - Sa Đéc Marketing Hub
 * Real-time search with debounce and keyboard navigation
 *
 * Usage:
 *   <input type="text" class="search-autocomplete" data-search-url="/api/search">
 */

import { Logger } from '../shared/logger.js';

class SearchAutocomplete {
  constructor(input, options = {}) {
    this.input = typeof input === 'string' ? document.querySelector(input) : input;
    if (!this.input) return;

    this.options = {
      debounceMs: 300,
      minLength: 2,
      maxResults: 10,
      highlightMatch: true,
      ...options
    };

    this.results = [];
    this.selectedIndex = -1;
    this.debounceTimer = null;

    this.init();
  }

  init() {
    this.createDropdown();
    this.bindEvents();
    this.setupAccessibility();
  }

  createDropdown() {
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'search-autocomplete-dropdown';
    this.dropdown.setAttribute('role', 'listbox');
    this.dropdown.setAttribute('aria-label', 'Search suggestions');
    this.dropdown.style.cssText = `
      position: absolute;
      z-index: 1000;
      display: none;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-height: 300px;
      overflow-y: auto;
    `;

    this.input.style.position = 'relative';
    this.input.parentElement?.appendChild(this.dropdown);
  }

  bindEvents() {
    // Input events
    this.input.addEventListener('input', (e) => this.onInput(e));
    this.input.addEventListener('keydown', (e) => this.onKeydown(e));
    this.input.addEventListener('focus', () => this.onFocus());
    this.input.addEventListener('blur', () => setTimeout(() => this.hide(), 200));

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!this.input.contains(e.target) && !this.dropdown.contains(e.target)) {
        this.hide();
      }
    });

    // Search on submit
    const form = this.input.closest('form');
    if (form) {
      form.addEventListener('submit', (e) => this.onSubmit(e));
    }
  }

  setupAccessibility() {
    this.input.setAttribute('role', 'combobox');
    this.input.setAttribute('aria-autocomplete', 'list');
    this.input.setAttribute('aria-expanded', 'false');
    this.input.setAttribute('aria-controls', 'search-results');
    this.dropdown.id = 'search-results';
  }

  onInput(e) {
    const query = e.target.value.trim();

    clearTimeout(this.debounceTimer);

    if (query.length < this.options.minLength) {
      this.hide();
      return;
    }

    this.debounceTimer = setTimeout(() => {
      this.search(query);
    }, this.options.debounceMs);
  }

  async search(query) {
    try {
      const url = this.input.dataset.searchUrl || '/api/search';
      const response = await fetch(`${url}?q=${encodeURIComponent(query)}&limit=${this.options.maxResults}`);

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      this.results = data.results || data;
      this.render();
      this.show();
    } catch (error) {
      Logger.error('Search error:', error);
      this.results = [];
      this.hide();
    }
  }

  render() {
    if (this.results.length === 0) {
      this.dropdown.innerHTML = '<div class="search-no-results">No results found</div>';
      return;
    }

    this.dropdown.innerHTML = this.results.map((item, index) => `
      <div class="search-result-item${index === this.selectedIndex ? ' selected' : ''}"
           role="option"
           id="search-option-${index}"
           data-index="${index}"
           data-value="${item.value || item.label || item.title}"
           aria-selected="${index === this.selectedIndex}">
        ${this.options.highlightMatch ? this.highlight(item.label || item.title || item.name, this.input.value) : (item.label || item.title || item.name)}
        ${item.description ? `<span class="search-result-description">${item.description}</span>` : ''}
      </div>
    `).join('');

    // Click to select
    this.dropdown.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => this.select(el.dataset.value));
    });
  }

  highlight(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  onKeydown(e) {
    const items = this.dropdown.querySelectorAll('.search-result-item');

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
        this.render();
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        this.render();
        break;

      case 'Enter':
        if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
          e.preventDefault();
          this.select(items[this.selectedIndex].dataset.value);
        }
        break;

      case 'Escape':
        this.hide();
        break;
    }
  }

  onFocus() {
    if (this.results.length > 0) {
      this.show();
    }
  }

  onSubmit(e) {
    if (this.selectedIndex >= 0 && this.results[this.selectedIndex]) {
      e.preventDefault();
      this.select(this.results[this.selectedIndex].value || this.results[this.selectedIndex].label);
    }
  }

  select(value) {
    this.input.value = value;
    this.hide();
    this.input.dispatchEvent(new Event('change'));
    this.input.dispatchEvent(new CustomEvent('autocomplete-select', { detail: { value } }));
  }

  show() {
    const rect = this.input.getBoundingClientRect();
    this.dropdown.style.display = 'block';
    this.dropdown.style.width = `${rect.width}px`;
    this.dropdown.style.top = `${rect.bottom + 4}px`;
    this.dropdown.style.left = `${rect.left}px`;
    this.input.setAttribute('aria-expanded', 'true');
  }

  hide() {
    this.dropdown.style.display = 'none';
    this.input.setAttribute('aria-expanded', 'false');
    this.selectedIndex = -1;
  }
}

// Auto-init
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.search-autocomplete, [data-search-autocomplete]').forEach(input => {
      new SearchAutocomplete(input);
    });
  });
}

// Export
// Export for ES modules
export default SearchAutocomplete;

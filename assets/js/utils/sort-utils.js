/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SORT UTILS — Sa Đéc Marketing Hub
 * Sorting Utilities for DataTable
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Sort order constants
 */
export const SortOrder = {
    ASC: 'asc',
    DESC: 'desc',
    NONE: null
};

/**
 * Compare function types
 */
export const SortCompare = {
    /**
     * Default compare - works for strings and numbers
     */
    default(a, b, direction) {
        let comparison = 0;

        if (a > b) comparison = 1;
        else if (a < b) comparison = -1;

        return direction === SortOrder.DESC ? -comparison : comparison;
    },

    /**
     * String compare (locale-aware)
     */
    string(a, b, direction, locale = 'vi-VN') {
        const comparison = String(a).localeCompare(String(b), locale);
        return direction === SortOrder.DESC ? -comparison : comparison;
    },

    /**
     * Number compare
     */
    number(a, b, direction) {
        const comparison = Number(a) - Number(b);
        return direction === SortOrder.DESC ? -comparison : comparison;
    },

    /**
     * Date compare
     */
    date(a, b, direction) {
        const dateA = new Date(a);
        const dateB = new Date(b);
        const comparison = dateA.getTime() - dateB.getTime();
        return direction === SortOrder.DESC ? -comparison : comparison;
    },

    /**
     * Boolean compare (true first)
     */
    boolean(a, b, direction) {
        if (a === b) return 0;
        const comparison = a ? -1 : 1;
        return direction === SortOrder.DESC ? -comparison : comparison;
    }
};

/**
 * Sort data array
 * @param {Array} data - Data to sort
 * @param {string} key - Key to sort by
 * @param {string} direction - Sort direction (asc/desc)
 * @param {Function} compareFn - Custom compare function
 * @returns {Array} Sorted data
 */
export function sortData(data, key, direction, compareFn = null) {
    if (!direction || direction === SortOrder.NONE) {
        return [...data];
    }

    const compare = compareFn || ((a, b) => SortCompare.default(a[key], b[key], direction));

    return [...data].sort((a, b) => {
        const aVal = getValueByKey(a, key);
        const bVal = getValueByKey(b, key);

        if (compareFn) {
            return compareFn(aVal, bVal, direction);
        }

        // Auto-detect type and use appropriate compare
        if (typeof aVal === 'number') {
            return SortCompare.number(aVal, bVal, direction);
        }
        if (aVal instanceof Date || (!isNaN(Date.parse(aVal)) && !isNaN(Date.parse(bVal)))) {
            return SortCompare.date(aVal, bVal, direction);
        }
        if (typeof aVal === 'boolean') {
            return SortCompare.boolean(aVal, bVal, direction);
        }
        return SortCompare.string(String(aVal), String(bVal), direction);
    });
}

/**
 * Get value by key path (e.g., 'user.name')
 * @param {Object} obj - Object to get value from
 * @param {string} keyPath - Key path
 * @returns {*} Value
 */
function getValueByKey(obj, keyPath) {
    return keyPath.split('.').reduce((o, k) => (o || {})[k], obj);
}

/**
 * Multi-column sort
 * @param {Array} data - Data to sort
 * @param {Array} sortConfigs - Array of { key, direction }
 * @returns {Array} Sorted data
 */
export function multiColumnSort(data, sortConfigs) {
    if (!sortConfigs || sortConfigs.length === 0) {
        return [...data];
    }

    return [...data].sort((a, b) => {
        for (const { key, direction } of sortConfigs) {
            if (!direction || direction === SortOrder.NONE) continue;

            const aVal = getValueByKey(a, key);
            const bVal = getValueByKey(b, key);

            let comparison = 0;
            if (typeof aVal === 'number') {
                comparison = SortCompare.number(aVal, bVal, direction);
            } else {
                comparison = SortCompare.string(String(aVal), String(bVal), direction);
            }

            if (comparison !== 0) {
                return comparison;
            }
        }
        return 0;
    });
}

/**
 * Get sort icon SVG based on direction
 * @param {string} direction - Sort direction
 * @returns {string} SVG string
 */
export function getSortIcon(direction) {
    switch (direction) {
        case SortOrder.ASC:
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <polyline points="17 11 12 6 7 11"/>
  <polyline points="17 18 12 13 7 18"/>
</svg>`;
        case SortOrder.DESC:
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <polyline points="7 13 12 18 17 13"/>
  <polyline points="7 6 12 11 17 6"/>
</svg>`;
        default:
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" opacity="0.3">
  <polyline points="7 15 12 20 17 15"/>
  <polyline points="7 9 12 4 17 9"/>
</svg>`;
    }
}

export default {
    SortOrder,
    SortCompare,
    sortData,
    multiColumnSort,
    getSortIcon
};

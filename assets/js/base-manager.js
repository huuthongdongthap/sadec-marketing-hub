/**
 * ==============================================
 * MEKONG AGENCY - BASE MANAGER
 * Shared base class for all Manager classes
 * ==============================================
 */

/**
 * Simple Event Bus for pub/sub pattern
 */
class EventBus {
    constructor() { this.listeners = new Map(); }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} cb - Callback function
     */
    on(event, cb) {
        if (!this.listeners.has(event)) this.listeners.set(event, []);
        this.listeners.get(event).push(cb);
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} cb - Callback function
     */
    off(event, cb) {
        if (this.listeners.has(event)) {
            const cbs = this.listeners.get(event).filter(c => c !== cb);
            this.listeners.set(event, cbs);
        }
    }

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {any} data - Data to pass to listeners
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(cb => {
                try {
                    cb(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }
}

/**
 * Base class for managing collections of items with event support
 */
class BaseManager {
    /**
     * @param {string} name - Name of the manager (used for event prefix)
     */
    constructor(name) {
        this.name = name;
        this.items = new Map();
        this.bus = new EventBus();
    }

    // CRUD Operations
    
    /**
     * Add an item to the collection
     * @param {Object} item - Item to add (must have an id)
     */
    add(item) {
        if (!item || !item.id) {
            console.error(`${this.name}: Cannot add item without ID`);
            return null;
        }
        this.items.set(item.id, item);
        this.bus.emit(`${this.name}:added`, { item });
        return item;
    }

    get(id) {
        return this.items.get(id);
    }

    getAll() {
        return Array.from(this.items.values());
    }

    /**
     * Update an existing item
     * @param {string|number} id - ID of the item
     * @param {Object} updates - Partial object with updates
     */
    update(id, updates) {
        const item = this.items.get(id);
        if (item && updates) {
            Object.assign(item, updates);
            this.bus.emit(`${this.name}:updated`, { item });
            return item;
        }
        return null;
    }

    remove(id) {
        const item = this.items.get(id);
        if (item) {
            this.items.delete(id);
            this.bus.emit(`${this.name}:removed`, { item });
            return item;
        }
        return null;
    }

    // Query helpers
    filter(predicate) {
        return this.getAll().filter(predicate);
    }

    find(predicate) {
        return this.getAll().find(predicate);
    }

    count() {
        return this.items.size;
    }

    // Event subscription
    on(event, cb) {
        this.bus.on(event, cb);
        return () => this.bus.off(event, cb);
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.EventBus = EventBus;
    window.BaseManager = BaseManager;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EventBus, BaseManager };
}

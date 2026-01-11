/**
 * ==============================================
 * MEKONG AGENCY - BASE MANAGER
 * Shared base class for all Manager classes
 * ==============================================
 */

class EventBus {
    constructor() { this.listeners = new Map(); }
    on(event, cb) {
        if (!this.listeners.has(event)) this.listeners.set(event, []);
        this.listeners.get(event).push(cb);
    }
    off(event, cb) {
        if (this.listeners.has(event)) {
            const cbs = this.listeners.get(event).filter(c => c !== cb);
            this.listeners.set(event, cbs);
        }
    }
    emit(event, data) {
        if (this.listeners.has(event)) this.listeners.get(event).forEach(cb => cb(data));
    }
}

class BaseManager {
    constructor(name) {
        this.name = name;
        this.items = new Map();
        this.bus = new EventBus();
    }

    // CRUD Operations
    add(item) {
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

    update(id, updates) {
        const item = this.items.get(id);
        if (item) {
            Object.assign(item, updates);
            this.bus.emit(`${this.name}:updated`, { item });
        }
        return item;
    }

    remove(id) {
        const item = this.items.get(id);
        if (item) {
            this.items.delete(id);
            this.bus.emit(`${this.name}:removed`, { item });
        }
        return item;
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

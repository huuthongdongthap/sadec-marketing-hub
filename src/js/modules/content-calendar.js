/**
 * ==============================================
 * MEKONG AGENCY - CONTENT CALENDAR
 * AgencyOS Content Calendar Workflow
 * ==============================================
 */

const ContentTypes = {
    blog: { id: 'blog', name: 'Blog Post', icon: '📝', platforms: ['website'] },
    social: { id: 'social', name: 'Social Post', icon: '📱', platforms: ['facebook', 'instagram', 'linkedin'] },
    video: { id: 'video', name: 'Video', icon: '🎬', platforms: ['youtube', 'tiktok'] },
    email: { id: 'email', name: 'Email', icon: '📧', platforms: ['email'] },
    infographic: { id: 'infographic', name: 'Infographic', icon: '📊', platforms: ['all'] }
};

const ContentStatus = {
    idea: { id: 'idea', name: 'Idea', color: '#6b7280' },
    planned: { id: 'planned', name: 'Planned', color: '#3b82f6' },
    creating: { id: 'creating', name: 'Creating', color: '#8b5cf6' },
    review: { id: 'review', name: 'In Review', color: '#f59e0b' },
    scheduled: { id: 'scheduled', name: 'Scheduled', color: '#06b6d4' },
    published: { id: 'published', name: 'Published', color: '#10b981' }
};

class ContentItem {
    constructor(config) {
        this.id = config.id || `content-${Date.now()}`;
        this.title = config.title;
        this.type = config.type || 'social';
        this.status = 'idea';
        this.platform = config.platform || 'facebook';
        this.author = config.author || 'Team';
        this.publishDate = config.publishDate || null;
        this.content = config.content || '';
        this.tags = config.tags || [];
        this.metrics = { views: 0, likes: 0, shares: 0, comments: 0 };
        this.createdAt = new Date().toISOString();
    }

    moveStatus(status) {
        this.status = status;
        if (status === 'published') this.publishedAt = new Date().toISOString();
        return this;
    }

    schedule(date) {
        this.publishDate = date;
        this.status = 'scheduled';
        return this;
    }

    publish() {
        this.status = 'published';
        this.publishedAt = new Date().toISOString();
        return this;
    }

    updateMetrics(metrics) {
        Object.assign(this.metrics, metrics);
        return this;
    }

    getEngagement() {
        const { views, likes, shares, comments } = this.metrics;
        return views > 0 ? Math.round(((likes + shares + comments) / views) * 100) : 0;
    }
}

class ContentCalendarManager {
    constructor() {
        this.content = new Map();
    }

    createContent(config) {
        const item = new ContentItem(config);
        this.content.set(item.id, item);
        return item;
    }

    getContent(id) { return this.content.get(id); }
    getAllContent() { return Array.from(this.content.values()); }

    getByStatus(status) {
        return this.getAllContent().filter(c => c.status === status);
    }

    getByDateRange(start, end) {
        return this.getAllContent().filter(c => {
            if (!c.publishDate) return false;
            const d = new Date(c.publishDate);
            return d >= new Date(start) && d <= new Date(end);
        });
    }

    getCalendarView(month, year) {
        const content = this.getAllContent().filter(c => {
            if (!c.publishDate) return false;
            const d = new Date(c.publishDate);
            return d.getMonth() === month && d.getFullYear() === year;
        });

        const calendar = {};
        content.forEach(c => {
            const day = new Date(c.publishDate).getDate();
            if (!calendar[day]) calendar[day] = [];
            calendar[day].push(c);
        });
        return calendar;
    }

    getMetrics() {
        const all = this.getAllContent();
        const published = all.filter(c => c.status === 'published');
        return {
            total: all.length,
            published: published.length,
            scheduled: all.filter(c => c.status === 'scheduled').length,
            inProgress: all.filter(c => ['creating', 'review'].includes(c.status)).length,
            totalViews: published.reduce((sum, c) => sum + c.metrics.views, 0),
            avgEngagement: published.length > 0 ? Math.round(published.reduce((sum, c) => sum + c.getEngagement(), 0) / published.length) : 0
        };
    }
}

function createDemoContent(manager) {
    const c1 = manager.createContent({ title: '10 Tips Digital Marketing', type: 'blog', author: 'Marketing Team' });
    c1.schedule('2026-01-10'); c1.publish(); c1.updateMetrics({ views: 1500, likes: 45, shares: 12, comments: 8 });

    const c2 = manager.createContent({ title: 'New Year Promotion', type: 'social', platform: 'facebook' });
    c2.schedule('2026-01-15');

    const c3 = manager.createContent({ title: 'Tutorial Video', type: 'video', platform: 'youtube' });
    c3.moveStatus('creating');

    manager.createContent({ title: 'Monthly Newsletter', type: 'email' });

    return manager.getAllContent();
}

const contentManager = new ContentCalendarManager();
if (typeof module !== 'undefined') module.exports = { ContentCalendarManager, ContentItem, ContentTypes, ContentStatus, contentManager, createDemoContent };

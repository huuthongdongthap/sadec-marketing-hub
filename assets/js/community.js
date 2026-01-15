/**
 * ==============================================
 * MEKONG AGENCY - COMMUNITY GUILD SYSTEM
 * AgencyOS Community Guild Workflow
 * ==============================================
 */

/**
 * Event Bus for Community System
 * Handles publish/subscribe for system events
 */
class CommunityBus {
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
     * Emit an event with data
     * @param {string} event - Event name
     * @param {*} data - Data to pass to listeners
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(cb => {
                try {
                    cb(data);
                } catch (err) {
                    console.error(`Error in event listener for ${event}:`, err);
                }
            });
        }
    }
}

const communityBus = new CommunityBus();

// ==============================================
// CONSTANTS & CONFIGURATION
// ==============================================

const Channels = Object.freeze({
    announcements: { id: 'announcements', name: '📢 Thông báo', type: 'read-only', icon: 'campaign' },
    introductions: { id: 'introductions', name: '👋 Giới thiệu', type: 'open', icon: 'waving_hand' },
    wins: { id: 'wins', name: '🏆 Thành tích', type: 'members', icon: 'emoji_events' },
    help: { id: 'help', name: '❓ Hỏi đáp', type: 'qa', icon: 'help' },
    offtopic: { id: 'offtopic', name: '💬 Tán gẫu', type: 'casual', icon: 'chat' }
});

const MemberTiers = Object.freeze({
    member: { id: 'member', name: 'Member', color: '#6b7280', pointsRequired: 0, access: ['general'], icon: 'person' },
    champion: { id: 'champion', name: 'Champion', color: '#3b82f6', pointsRequired: 100, access: ['general', 'vip'], icon: 'stars' },
    mentor: { id: 'mentor', name: 'Mentor', color: '#f59e0b', pointsRequired: 500, access: ['general', 'vip', 'mentors'], icon: 'school' }
});

const PointActions = Object.freeze({
    post: { id: 'post', name: 'Đăng bài', points: 1 },
    reply: { id: 'reply', name: 'Trả lời', points: 2 },
    win: { id: 'win', name: 'Chia sẻ thành tích', points: 10 },
    help: { id: 'help', name: 'Giúp đỡ thành viên', points: 5 },
    referral: { id: 'referral', name: 'Giới thiệu thành viên', points: 20 }
});

const Levels = Object.freeze([
    { level: 1, name: 'Newcomer', minPoints: 0 },
    { level: 2, name: 'Active', minPoints: 5 },
    { level: 3, name: 'Contributor', minPoints: 25 },
    { level: 4, name: 'Expert', minPoints: 100 },
    { level: 5, name: 'Legend', minPoints: 500 }
]);

const Badges = Object.freeze([
    { id: 'first-post', name: 'First Post', icon: '📝', condition: m => m.stats.posts >= 1 },
    { id: 'helper', name: 'Helper', icon: '🤝', condition: m => m.stats.helpCount >= 5 },
    { id: 'winner', name: 'Winner', icon: '🏆', condition: m => m.stats.wins >= 3 },
    { id: 'influencer', name: 'Influencer', icon: '⭐', condition: m => m.stats.referrals >= 5 },
    { id: 'veteran', name: 'Veteran', icon: '🎖️', condition: m => (new Date() - new Date(m.joinedAt)) / (1000 * 60 * 60 * 24) >= 30 }
]);

// ==============================================
// CORE CLASSES
// ==============================================

/**
 * Represents a community member
 */
class Member {
    constructor(config) {
        this.id = config.id || `member-${Date.now()}`;
        this.name = config.name;
        this.email = config.email;
        this.avatar = config.avatar || '';
        this.bio = config.bio || '';
        this.tier = 'member';
        this.points = 0;
        this.level = 1;
        this.badges = [];
        this.stats = { posts: 0, replies: 0, wins: 0, helpCount: 0, referrals: 0 };
        this.joinedAt = new Date().toISOString();
        this.lastActiveAt = new Date().toISOString();
        this.activities = [];
    }

    /**
     * Add points and update member state (level, tier, badges)
     * @param {string} action - Action type from PointActions
     * @param {number} [amount] - Optional custom amount
     */
    addPoints(action, amount = null) {
        const actionConfig = PointActions[action];
        const pts = amount !== null ? amount : (actionConfig?.points || 0);

        this.points += pts;
        this.lastActiveAt = new Date().toISOString();

        if (action in this.stats) this.stats[action]++;

        this._checkUpdates(action, pts);

        this.activities.push({
            type: action,
            points: pts,
            timestamp: new Date().toISOString()
        });

        communityBus.emit('member:points-added', { member: this, action, points: pts });
        return this;
    }

    /** Internal state update check */
    _checkUpdates(lastAction, pointsEarned) {
        this._updateLevel();
        this._updateTier();
        this._checkBadges();
    }

    _updateLevel() {
        // Find highest level met
        const newLevel = Levels.reduce((acc, lvl) =>
            this.points >= lvl.minPoints ? lvl : acc
            , Levels[0]);

        if (this.level !== newLevel.level) {
            this.level = newLevel.level;
            communityBus.emit('member:level-up', { member: this, level: newLevel });
        }
    }

    _updateTier() {
        // Check for highest tier met
        const tiers = Object.values(MemberTiers);
        const newTier = tiers.reduce((best, tier) =>
            this.points >= tier.pointsRequired && tier.pointsRequired >= (MemberTiers[best]?.pointsRequired || 0)
                ? tier.id
                : best
            , this.tier);

        if (this.tier !== newTier) {
            const oldTier = this.tier;
            this.tier = newTier;
            communityBus.emit('member:tier-upgrade', { member: this, oldTier, newTier });
        }
    }

    _checkBadges() {
        for (const badge of Badges) {
            if (this.badges.includes(badge.id)) continue;

            if (badge.condition(this)) {
                this.badges.push(badge.id);
                communityBus.emit('member:badge-earned', { member: this, badge });
            }
        }
    }

    getLevelInfo() { return Levels.find(l => l.level === this.level) || Levels[0]; }
    getNextLevel() { return Levels.find(l => l.level === this.level + 1); }
    getTierInfo() { return MemberTiers[this.tier] || MemberTiers.member; }
}

/**
 * Represents a post in a channel
 */
class Post {
    constructor(config) {
        this.id = config.id || `post-${Date.now()}`;
        this.channelId = config.channelId;
        this.authorId = config.authorId;
        this.authorName = config.authorName;
        this.content = config.content;
        this.type = config.type || 'post';
        this.replies = [];
        this.likes = 0;
        this.createdAt = new Date().toISOString();
    }

    addReply(authorId, authorName, content) {
        const reply = {
            id: `reply-${Date.now()}`,
            authorId,
            authorName,
            content,
            createdAt: new Date().toISOString()
        };
        this.replies.push(reply);
        return reply;
    }

    like() {
        this.likes++;
        return this;
    }
}

/**
 * Main Manager for Community System
 */
class CommunityManager {
    constructor() {
        this.members = new Map();
        this.posts = new Map();
        this.channels = { ...Channels };
    }

    // ===== MEMBER MANAGEMENT =====

    registerMember(config) {
        const member = new Member(config);
        this.members.set(member.id, member);
        member.addPoints('post'); // Joining bonus (simulated)
        communityBus.emit('member:registered', { member });
        return member;
    }

    getMember(id) { return this.members.get(id); }
    getAllMembers() { return Array.from(this.members.values()); }

    /**
     * Get top members by points
     * @param {number} limit 
     */
    getLeaderboard(limit = 10) {
        return this.getAllMembers()
            .sort((a, b) => b.points - a.points)
            .slice(0, limit);
    }

    getMembersByTier(tierId) {
        // Optimized to filter
        return this.getAllMembers().filter(m => m.tier === tierId);
    }

    // ===== POST MANAGEMENT =====

    createPost(channelId, authorId, content, type = 'post') {
        const member = this.getMember(authorId);
        if (!member) return null;

        const post = new Post({ channelId, authorId, authorName: member.name, content, type });
        this.posts.set(post.id, post);

        // Award points
        member.addPoints(type === 'win' ? 'win' : 'post');

        communityBus.emit('post:created', { post, member });
        return post;
    }

    replyToPost(postId, authorId, content) {
        const post = this.posts.get(postId);
        const member = this.getMember(authorId);
        if (!post || !member) return null;

        const reply = post.addReply(authorId, member.name, content);
        member.addPoints('reply');

        // Helper bonus
        if (post.channelId === 'help' && post.authorId !== authorId) {
            member.addPoints('help');
        }

        communityBus.emit('post:replied', { post, reply, member });
        return reply;
    }

    getChannelPosts(channelId) {
        return Array.from(this.posts.values())
            .filter(p => p.channelId === channelId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // ===== METRICS =====

    /**
     * Calculate community metrics efficiently (Single Pass)
     */
    getMetrics() {
        const members = this.getAllMembers();
        const now = new Date();
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        // Initialize accumulators
        let activeMembers = 0;
        let totalPoints = 0;
        const tierDistribution = {};
        Object.keys(MemberTiers).forEach(k => tierDistribution[k] = 0);

        // Single pass loop for O(N) performance
        for (const m of members) {
            // Check active
            if (new Date(m.lastActiveAt) > thirtyDaysAgo) activeMembers++;

            // Sum points
            totalPoints += m.points;

            // Count tiers
            if (tierDistribution[m.tier] !== undefined) {
                tierDistribution[m.tier]++;
            } else {
                // Handle unknown tier edge case
                tierDistribution[m.tier] = (tierDistribution[m.tier] || 0) + 1;
            }
        }

        return {
            totalMembers: members.length,
            activeMembers,
            activeRate: members.length > 0 ? Math.round((activeMembers / members.length) * 100) : 0,
            totalPosts: this.posts.size,
            totalPoints,
            tierDistribution,
            avgPointsPerMember: members.length > 0 ? Math.round(totalPoints / members.length) : 0
        };
    }
}

// ==============================================
// DEMO DATA GENERATOR
// ==============================================

function createDemoCommunity(manager) {
    const membersData = [
        { name: 'Nguyễn Văn A', email: 'a@email.com' },
        { name: 'Trần Thị B', email: 'b@email.com' },
        { name: 'Lê Văn C', email: 'c@email.com' },
        { name: 'Phạm Thị D', email: 'd@email.com' },
        { name: 'Hoàng Văn E', email: 'e@email.com' }
    ];

    const members = membersData.map(d => manager.registerMember(d));
    const [m1, m2, m3] = members;

    // Simulate interactions
    m1.addPoints('post', 5); // Batch points
    m1.addPoints('win');
    m1.addPoints('help', 30); // Heavy helper

    m2.addPoints('win', 20);

    // Posts
    manager.createPost('introductions', m1.id, 'Xin chào mọi người! Mình là A từ Sa Đéc.');
    manager.createPost('wins', m1.id, '🎉 Vừa ký hợp đồng lớn với khách hàng mới!', 'win');
    manager.createPost('help', m2.id, 'Có ai biết cách tối ưu Facebook Ads không ạ?');
    manager.createPost('offtopic', m3.id, 'Cuối tuần này ai đi cafe không? ☕');

    return members;
}

const communityManager = new CommunityManager();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CommunityManager,
        Member,
        Post,
        Channels,
        MemberTiers,
        PointActions,
        Levels,
        Badges,
        communityManager,
        communityBus,
        createDemoCommunity
    };
}

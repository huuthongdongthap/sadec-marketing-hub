/**
 * ==============================================
 * MEKONG AGENCY - COMMUNITY GUILD SYSTEM
 * AgencyOS Community Guild Workflow
 * ==============================================
 */

// ===== EVENT BUS =====
class CommunityBus {
    constructor() { this.listeners = new Map(); }
    on(event, cb) {
        if (!this.listeners.has(event)) this.listeners.set(event, []);
        this.listeners.get(event).push(cb);
    }
    emit(event, data) {
        if (this.listeners.has(event)) this.listeners.get(event).forEach(cb => cb(data));
    }
}

const communityBus = new CommunityBus();

// ===== CHANNELS =====
const Channels = {
    announcements: { id: 'announcements', name: '📢 Thông báo', type: 'read-only', icon: 'campaign' },
    introductions: { id: 'introductions', name: '👋 Giới thiệu', type: 'open', icon: 'waving_hand' },
    wins: { id: 'wins', name: '🏆 Thành tích', type: 'members', icon: 'emoji_events' },
    help: { id: 'help', name: '❓ Hỏi đáp', type: 'qa', icon: 'help' },
    offtopic: { id: 'offtopic', name: '💬 Tán gẫu', type: 'casual', icon: 'chat' }
};

// ===== MEMBER TIERS =====
const MemberTiers = {
    member: { id: 'member', name: 'Member', color: '#6b7280', pointsRequired: 0, access: ['general'], icon: 'person' },
    champion: { id: 'champion', name: 'Champion', color: '#3b82f6', pointsRequired: 100, access: ['general', 'vip'], icon: 'stars' },
    mentor: { id: 'mentor', name: 'Mentor', color: '#f59e0b', pointsRequired: 500, access: ['general', 'vip', 'mentors'], icon: 'school' }
};

// ===== POINT ACTIONS =====
const PointActions = {
    post: { id: 'post', name: 'Đăng bài', points: 1 },
    reply: { id: 'reply', name: 'Trả lời', points: 2 },
    win: { id: 'win', name: 'Chia sẻ thành tích', points: 10 },
    help: { id: 'help', name: 'Giúp đỡ thành viên', points: 5 },
    referral: { id: 'referral', name: 'Giới thiệu thành viên', points: 20 }
};

// ===== LEVELS =====
const Levels = [
    { level: 1, name: 'Newcomer', minPoints: 0 },
    { level: 2, name: 'Active', minPoints: 5 },
    { level: 3, name: 'Contributor', minPoints: 25 },
    { level: 4, name: 'Expert', minPoints: 100 },
    { level: 5, name: 'Legend', minPoints: 500 }
];

// ===== BADGES =====
const Badges = [
    { id: 'first-post', name: 'First Post', icon: '📝', condition: 'posts >= 1' },
    { id: 'helper', name: 'Helper', icon: '🤝', condition: 'helpCount >= 5' },
    { id: 'winner', name: 'Winner', icon: '🏆', condition: 'wins >= 3' },
    { id: 'influencer', name: 'Influencer', icon: '⭐', condition: 'referrals >= 5' },
    { id: 'veteran', name: 'Veteran', icon: '🎖️', condition: 'daysActive >= 30' }
];

// ===== MEMBER =====
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

    addPoints(action, amount = null) {
        const pts = amount || PointActions[action]?.points || 0;
        this.points += pts;
        this.lastActiveAt = new Date().toISOString();

        // Update stats
        if (action in this.stats) this.stats[action]++;

        // Check level up
        this.updateLevel();

        // Check tier upgrade
        this.updateTier();

        // Check badges
        this.checkBadges();

        this.activities.push({
            type: action,
            points: pts,
            timestamp: new Date().toISOString()
        });

        communityBus.emit('member:points-added', { member: this, action, points: pts });
        return this;
    }

    updateLevel() {
        for (let i = Levels.length - 1; i >= 0; i--) {
            if (this.points >= Levels[i].minPoints) {
                if (this.level !== Levels[i].level) {
                    this.level = Levels[i].level;
                    communityBus.emit('member:level-up', { member: this, level: Levels[i] });
                }
                break;
            }
        }
    }

    updateTier() {
        const tiers = Object.values(MemberTiers).sort((a, b) => b.pointsRequired - a.pointsRequired);
        for (const tier of tiers) {
            if (this.points >= tier.pointsRequired) {
                if (this.tier !== tier.id) {
                    const oldTier = this.tier;
                    this.tier = tier.id;
                    communityBus.emit('member:tier-upgrade', { member: this, oldTier, newTier: tier.id });
                }
                break;
            }
        }
    }

    checkBadges() {
        Badges.forEach(badge => {
            if (!this.badges.includes(badge.id)) {
                // Simple condition check
                let earned = false;
                if (badge.id === 'first-post' && this.stats.posts >= 1) earned = true;
                if (badge.id === 'helper' && this.stats.helpCount >= 5) earned = true;
                if (badge.id === 'winner' && this.stats.wins >= 3) earned = true;
                if (badge.id === 'influencer' && this.stats.referrals >= 5) earned = true;

                if (earned) {
                    this.badges.push(badge.id);
                    communityBus.emit('member:badge-earned', { member: this, badge });
                }
            }
        });
    }

    getLevelInfo() {
        return Levels.find(l => l.level === this.level) || Levels[0];
    }

    getNextLevel() {
        return Levels.find(l => l.level === this.level + 1);
    }

    getTierInfo() {
        return MemberTiers[this.tier] || MemberTiers.member;
    }
}

// ===== POST =====
class Post {
    constructor(config) {
        this.id = config.id || `post-${Date.now()}`;
        this.channelId = config.channelId;
        this.authorId = config.authorId;
        this.authorName = config.authorName;
        this.content = config.content;
        this.type = config.type || 'post'; // post, win, question
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

// ===== COMMUNITY MANAGER =====
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

        // Award points for joining
        member.addPoints('post'); // First action bonus

        communityBus.emit('member:registered', { member });
        return member;
    }

    getMember(id) {
        return this.members.get(id);
    }

    getAllMembers() {
        return Array.from(this.members.values());
    }

    getLeaderboard(limit = 10) {
        return this.getAllMembers()
            .sort((a, b) => b.points - a.points)
            .slice(0, limit);
    }

    getMembersByTier(tierId) {
        return this.getAllMembers().filter(m => m.tier === tierId);
    }

    // ===== POST MANAGEMENT =====
    createPost(channelId, authorId, content, type = 'post') {
        const member = this.getMember(authorId);
        if (!member) return null;

        const post = new Post({
            channelId,
            authorId,
            authorName: member.name,
            content,
            type
        });

        this.posts.set(post.id, post);

        // Award points based on type
        if (type === 'win') {
            member.addPoints('win');
        } else {
            member.addPoints('post');
        }

        communityBus.emit('post:created', { post, member });
        return post;
    }

    replyToPost(postId, authorId, content) {
        const post = this.posts.get(postId);
        const member = this.getMember(authorId);
        if (!post || !member) return null;

        const reply = post.addReply(authorId, member.name, content);
        member.addPoints('reply');

        // If this is a help channel post, give helper points
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
    getMetrics() {
        const members = this.getAllMembers();
        const now = new Date();
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        const activeMembers = members.filter(m =>
            new Date(m.lastActiveAt) > thirtyDaysAgo
        ).length;

        const tierDistribution = {};
        Object.keys(MemberTiers).forEach(t => {
            tierDistribution[t] = members.filter(m => m.tier === t).length;
        });

        return {
            totalMembers: members.length,
            activeMembers,
            activeRate: members.length > 0 ? Math.round((activeMembers / members.length) * 100) : 0,
            totalPosts: this.posts.size,
            totalPoints: members.reduce((sum, m) => sum + m.points, 0),
            tierDistribution,
            avgPointsPerMember: members.length > 0
                ? Math.round(members.reduce((sum, m) => sum + m.points, 0) / members.length)
                : 0
        };
    }
}

// ===== DEMO DATA =====
function createDemoCommunity(manager) {
    // Register demo members
    const member1 = manager.registerMember({ name: 'Nguyễn Văn A', email: 'a@email.com' });
    const member2 = manager.registerMember({ name: 'Trần Thị B', email: 'b@email.com' });
    const member3 = manager.registerMember({ name: 'Lê Văn C', email: 'c@email.com' });
    const member4 = manager.registerMember({ name: 'Phạm Thị D', email: 'd@email.com' });
    const member5 = manager.registerMember({ name: 'Hoàng Văn E', email: 'e@email.com' });

    // Simulate activity
    member1.addPoints('post'); member1.addPoints('post'); member1.addPoints('win');
    member1.addPoints('help'); member1.addPoints('help'); member1.addPoints('help');
    for (let i = 0; i < 50; i++) member1.addPoints('reply');

    member2.addPoints('win'); member2.addPoints('win');
    for (let i = 0; i < 30; i++) member2.addPoints('post');

    member3.addPoints('win');
    for (let i = 0; i < 10; i++) member3.addPoints('reply');

    // Create some posts
    manager.createPost('introductions', member1.id, 'Xin chào mọi người! Mình là A từ Sa Đéc.');
    manager.createPost('wins', member1.id, '🎉 Vừa ký hợp đồng lớn với khách hàng mới!', 'win');
    manager.createPost('help', member2.id, 'Có ai biết cách tối ưu Facebook Ads không ạ?');
    manager.createPost('offtopic', member3.id, 'Cuối tuần này ai đi cafe không? ☕');

    return [member1, member2, member3, member4, member5];
}

// ===== GLOBAL INSTANCE =====
const communityManager = new CommunityManager();

// ===== EXPORTS =====
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

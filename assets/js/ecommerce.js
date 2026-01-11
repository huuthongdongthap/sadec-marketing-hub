/**
 * ==============================================
 * MEKONG AGENCY - RETAIL E-COMMERCE TOOLKIT
 * AgencyOS Retail E-commerce Workflow
 * ==============================================
 */

// ===== EVENT BUS =====
class EcommerceEventBus {
    constructor() {
        this.listeners = new Map();
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(cb => cb(data));
        }
    }
}

const ecommerceBus = new EcommerceEventBus();

// ===== STORE AUDIT =====
class StoreAudit {
    constructor(storeUrl) {
        this.storeUrl = storeUrl;
        this.metrics = null;
        this.issues = [];
        this.recommendations = [];
    }

    async run() {
        ecommerceBus.emit('audit:started', { url: this.storeUrl });

        // Simulate store analysis
        await this.simulateWork(1500);

        this.metrics = this.generateMetrics();
        this.issues = this.identifyIssues();
        this.recommendations = this.generateRecommendations();

        ecommerceBus.emit('audit:completed', {
            url: this.storeUrl,
            metrics: this.metrics,
            issues: this.issues,
            recommendations: this.recommendations
        });

        return this.getReport();
    }

    generateMetrics() {
        return {
            conversionRate: (Math.random() * 3 + 0.5).toFixed(2),
            averageOrderValue: Math.floor(Math.random() * 500000 + 300000),
            cartAbandonmentRate: Math.floor(Math.random() * 20 + 60),
            bounceRate: Math.floor(Math.random() * 30 + 40),
            sessionsPerDay: Math.floor(Math.random() * 500 + 100),
            revenuePerSession: Math.floor(Math.random() * 50000 + 10000),
            returningCustomerRate: Math.floor(Math.random() * 20 + 15),
            pageLoadTime: (Math.random() * 3 + 1).toFixed(1),
            mobileTrafficShare: Math.floor(Math.random() * 30 + 55)
        };
    }

    identifyIssues() {
        const issues = [];

        if (this.metrics.cartAbandonmentRate > 70) {
            issues.push({
                severity: 'high',
                type: 'cart_abandonment',
                title: 'Tỷ lệ bỏ giỏ hàng cao',
                description: `${this.metrics.cartAbandonmentRate}% khách hàng bỏ giỏ hàng`,
                impact: 'Mất doanh thu tiềm năng'
            });
        }

        if (this.metrics.conversionRate < 1.5) {
            issues.push({
                severity: 'high',
                type: 'low_conversion',
                title: 'Tỷ lệ chuyển đổi thấp',
                description: `Chỉ ${this.metrics.conversionRate}% visitors mua hàng`,
                impact: 'Lãng phí traffic'
            });
        }

        if (parseFloat(this.metrics.pageLoadTime) > 3) {
            issues.push({
                severity: 'medium',
                type: 'slow_loading',
                title: 'Tốc độ tải trang chậm',
                description: `Thời gian tải: ${this.metrics.pageLoadTime}s`,
                impact: 'Giảm trải nghiệm người dùng'
            });
        }

        if (this.metrics.mobileTrafficShare > 60 && this.metrics.bounceRate > 50) {
            issues.push({
                severity: 'medium',
                type: 'mobile_ux',
                title: 'UX Mobile cần cải thiện',
                description: `${this.metrics.mobileTrafficShare}% traffic từ mobile, bounce rate ${this.metrics.bounceRate}%`,
                impact: 'Mất khách hàng mobile'
            });
        }

        return issues;
    }

    generateRecommendations() {
        const recs = [];

        this.issues.forEach(issue => {
            switch (issue.type) {
                case 'cart_abandonment':
                    recs.push({
                        priority: 1,
                        action: 'Thiết lập Email Recovery',
                        description: 'Tạo chuỗi 3 email tự động để recover giỏ hàng bị bỏ',
                        expectedImpact: '+15-30% cart recovery'
                    });
                    recs.push({
                        priority: 2,
                        action: 'Thêm Exit Intent Popup',
                        description: 'Hiển thị ưu đãi khi khách chuẩn bị rời trang',
                        expectedImpact: '+5-10% conversion'
                    });
                    break;
                case 'low_conversion':
                    recs.push({
                        priority: 1,
                        action: 'Tối ưu Landing Page',
                        description: 'Cải thiện CTA, social proof và product images',
                        expectedImpact: '+20-50% conversion'
                    });
                    break;
                case 'slow_loading':
                    recs.push({
                        priority: 2,
                        action: 'Tối ưu tốc độ trang',
                        description: 'Compress images, enable caching, lazy loading',
                        expectedImpact: '-50% load time'
                    });
                    break;
                case 'mobile_ux':
                    recs.push({
                        priority: 2,
                        action: 'Cải thiện Mobile UX',
                        description: 'Responsive design, touch-friendly buttons, mobile checkout',
                        expectedImpact: '-20% bounce rate'
                    });
                    break;
            }
        });

        // Add retargeting recommendation
        recs.push({
            priority: 3,
            action: 'Thiết lập Retargeting Ads',
            description: 'Target khách đã xem sản phẩm nhưng chưa mua',
            expectedImpact: '+10-20% returning visitors'
        });

        return recs.sort((a, b) => a.priority - b.priority);
    }

    getReport() {
        return {
            storeUrl: this.storeUrl,
            auditDate: new Date().toISOString(),
            metrics: this.metrics,
            issues: this.issues,
            recommendations: this.recommendations,
            overallScore: this.calculateScore()
        };
    }

    calculateScore() {
        let score = 100;
        this.issues.forEach(issue => {
            score -= issue.severity === 'high' ? 20 : 10;
        });
        return Math.max(score, 0);
    }

    simulateWork(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ===== E-COMMERCE ANALYTICS =====
class EcommerceAnalytics {
    constructor() {
        this.events = [];
        this.sessions = [];
    }

    trackEvent(eventType, data = {}) {
        const event = {
            id: `evt-${Date.now()}`,
            type: eventType,
            data,
            timestamp: new Date().toISOString()
        };

        this.events.push(event);
        ecommerceBus.emit('analytics:event', event);

        return event;
    }

    addToCart(product, quantity = 1) {
        return this.trackEvent('add_to_cart', {
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity,
            currency: 'VND'
        });
    }

    beginCheckout(cart) {
        return this.trackEvent('begin_checkout', {
            cartValue: cart.total,
            itemCount: cart.items.length,
            currency: 'VND'
        });
    }

    purchase(order) {
        return this.trackEvent('purchase', {
            orderId: order.id,
            revenue: order.total,
            tax: order.tax || 0,
            shipping: order.shipping || 0,
            itemCount: order.items?.length || 0,
            currency: 'VND'
        });
    }

    cartAbandoned(cart) {
        return this.trackEvent('cart_abandoned', {
            cartId: cart.id,
            cartValue: cart.total,
            itemCount: cart.items.length,
            currency: 'VND'
        });
    }

    getEventsByType(type) {
        return this.events.filter(e => e.type === type);
    }

    getMetrics() {
        const purchases = this.getEventsByType('purchase');
        const carts = this.getEventsByType('begin_checkout');
        const abandoned = this.getEventsByType('cart_abandoned');

        const totalRevenue = purchases.reduce((sum, e) => sum + e.data.revenue, 0);
        const totalOrders = purchases.length;

        return {
            totalRevenue,
            totalOrders,
            averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
            cartAbandonmentRate: carts.length > 0
                ? Math.round((abandoned.length / carts.length) * 100)
                : 0,
            conversionEvents: this.events.length
        };
    }
}

// ===== ABANDONED CART FLOW =====
class AbandonedCartFlow {
    constructor() {
        this.abandonedCarts = new Map();
        this.emailSequence = [
            { id: 1, delay: '2 hours', subject: '🛒 Bạn đã bỏ quên gì đó!', type: 'reminder' },
            { id: 2, delay: '24 hours', subject: '⚡ Ưu đãi đặc biệt cho bạn!', type: 'incentive' },
            { id: 3, delay: '72 hours', subject: '⏰ Cơ hội cuối cùng!', type: 'urgency' }
        ];
        this.sentEmails = [];
        this.recoveredCarts = [];
    }

    registerAbandonedCart(cart, customerEmail) {
        const abandoned = {
            id: cart.id || `cart-${Date.now()}`,
            email: customerEmail,
            cart,
            abandonedAt: new Date().toISOString(),
            status: 'active',
            emailsSent: [],
            recovered: false
        };

        this.abandonedCarts.set(abandoned.id, abandoned);

        ecommerceBus.emit('cart:abandoned', abandoned);

        // Simulate email sequence
        this.startEmailSequence(abandoned);

        return abandoned;
    }

    startEmailSequence(abandoned) {
        this.emailSequence.forEach((email, index) => {
            setTimeout(() => {
                if (abandoned.status === 'active' && !abandoned.recovered) {
                    this.sendRecoveryEmail(abandoned, email);
                }
            }, (index + 1) * 2000); // Simulated timing (2s per email for demo)
        });
    }

    sendRecoveryEmail(abandoned, emailTemplate) {
        const email = {
            id: `email-${Date.now()}`,
            cartId: abandoned.id,
            to: abandoned.email,
            subject: emailTemplate.subject,
            type: emailTemplate.type,
            sentAt: new Date().toISOString(),
            cartValue: abandoned.cart.total
        };

        abandoned.emailsSent.push(email);
        this.sentEmails.push(email);

        ecommerceBus.emit('email:sent', email);

        return email;
    }

    recoverCart(cartId) {
        const abandoned = this.abandonedCarts.get(cartId);
        if (!abandoned) return null;

        abandoned.recovered = true;
        abandoned.status = 'recovered';
        abandoned.recoveredAt = new Date().toISOString();

        this.recoveredCarts.push(abandoned);

        ecommerceBus.emit('cart:recovered', abandoned);

        return abandoned;
    }

    getMetrics() {
        const total = this.abandonedCarts.size;
        const recovered = this.recoveredCarts.length;
        const emailsSent = this.sentEmails.length;

        const recoveredValue = this.recoveredCarts.reduce(
            (sum, c) => sum + c.cart.total, 0
        );

        return {
            totalAbandoned: total,
            recovered,
            recoveryRate: total > 0 ? Math.round((recovered / total) * 100) : 0,
            emailsSent,
            recoveredValue
        };
    }

    getEmailSequence() {
        return this.emailSequence;
    }

    updateEmailSequence(sequence) {
        this.emailSequence = sequence;
        ecommerceBus.emit('flow:updated', { sequence });
    }
}

// ===== RETARGETING MANAGER =====
class RetargetingManager {
    constructor() {
        this.audiences = new Map();
        this.campaigns = [];
        this.platforms = ['meta', 'google', 'tiktok'];
    }

    createAudience(config) {
        const audience = {
            id: config.id || `aud-${Date.now()}`,
            name: config.name,
            type: config.type, // cart_abandoners, product_viewers, past_customers
            size: config.size || Math.floor(Math.random() * 5000 + 1000),
            createdAt: new Date().toISOString(),
            rules: config.rules || [],
            platforms: config.platforms || ['meta']
        };

        this.audiences.set(audience.id, audience);

        ecommerceBus.emit('audience:created', audience);

        return audience;
    }

    createCampaign(config) {
        const campaign = {
            id: config.id || `camp-${Date.now()}`,
            name: config.name,
            audienceId: config.audienceId,
            platform: config.platform,
            budget: config.budget,
            budgetType: config.budgetType || 'daily', // daily, lifetime
            status: 'draft',
            createdAt: new Date().toISOString(),
            metrics: {
                impressions: 0,
                clicks: 0,
                conversions: 0,
                spend: 0,
                roas: 0
            }
        };

        this.campaigns.push(campaign);

        ecommerceBus.emit('campaign:created', campaign);

        return campaign;
    }

    activateCampaign(campaignId) {
        const campaign = this.campaigns.find(c => c.id === campaignId);
        if (!campaign) return null;

        campaign.status = 'active';
        campaign.activatedAt = new Date().toISOString();

        // Simulate metrics
        this.simulateMetrics(campaign);

        ecommerceBus.emit('campaign:activated', campaign);

        return campaign;
    }

    simulateMetrics(campaign) {
        // Simulate ad performance after activation
        setTimeout(() => {
            campaign.metrics = {
                impressions: Math.floor(Math.random() * 10000 + 5000),
                clicks: Math.floor(Math.random() * 500 + 100),
                conversions: Math.floor(Math.random() * 20 + 5),
                spend: Math.floor(campaign.budget * 0.7),
                roas: (Math.random() * 3 + 1.5).toFixed(2)
            };

            ecommerceBus.emit('campaign:metrics-updated', campaign);
        }, 3000);
    }

    getDefaultAudiences() {
        return [
            { id: 'cart_abandoners', name: 'Cart Abandoners', type: 'cart_abandoners', description: 'Khách bỏ giỏ hàng trong 30 ngày' },
            { id: 'product_viewers', name: 'Product Viewers', type: 'product_viewers', description: 'Khách xem sản phẩm nhưng chưa thêm vào giỏ' },
            { id: 'past_customers', name: 'Past Customers', type: 'past_customers', description: 'Khách đã mua hàng trước đây' },
            { id: 'high_intent', name: 'High Intent', type: 'high_intent', description: 'Khách có hành vi mua hàng cao' }
        ];
    }

    getMetrics() {
        const activeCampaigns = this.campaigns.filter(c => c.status === 'active');

        const totals = activeCampaigns.reduce((acc, c) => ({
            impressions: acc.impressions + c.metrics.impressions,
            clicks: acc.clicks + c.metrics.clicks,
            conversions: acc.conversions + c.metrics.conversions,
            spend: acc.spend + c.metrics.spend
        }), { impressions: 0, clicks: 0, conversions: 0, spend: 0 });

        return {
            ...totals,
            audienceCount: this.audiences.size,
            campaignCount: this.campaigns.length,
            activeCampaigns: activeCampaigns.length,
            avgRoas: activeCampaigns.length > 0
                ? (activeCampaigns.reduce((sum, c) => sum + parseFloat(c.metrics.roas || 0), 0) / activeCampaigns.length).toFixed(2)
                : 0
        };
    }
}

// ===== FORMATTERS =====
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function formatNumber(num) {
    return new Intl.NumberFormat('vi-VN').format(num);
}

// ===== GLOBAL INSTANCES =====
const ecommerceAnalytics = new EcommerceAnalytics();
const abandonedCartFlow = new AbandonedCartFlow();
const retargetingManager = new RetargetingManager();

// ===== EXPORTS =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        StoreAudit,
        EcommerceAnalytics,
        AbandonedCartFlow,
        RetargetingManager,
        ecommerceAnalytics,
        abandonedCartFlow,
        retargetingManager,
        ecommerceBus,
        formatCurrency,
        formatNumber
    };
}

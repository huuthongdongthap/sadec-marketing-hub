/**
 * ==============================================
 * MEKONG AGENCY - PRICING STRATEGY
 * AgencyOS Pricing Strategy Workflow
 * ==============================================
 */

const PricingModels = {
    hourly: { id: 'hourly', name: 'Hourly Rate', description: 'Charge by the hour' },
    project: { id: 'project', name: 'Project-Based', description: 'Fixed price per project' },
    retainer: { id: 'retainer', name: 'Monthly Retainer', description: 'Recurring monthly fee' },
    value: { id: 'value', name: 'Value-Based', description: 'Price based on ROI delivered' }
};

const ServiceTiers = {
    basic: { id: 'basic', name: 'Basic', multiplier: 1.0, features: ['Core service', 'Email support'] },
    standard: { id: 'standard', name: 'Standard', multiplier: 1.5, features: ['All Basic', 'Priority support', 'Monthly reports'] },
    premium: { id: 'premium', name: 'Premium', multiplier: 2.5, features: ['All Standard', 'Dedicated manager', 'Custom solutions', '24/7 support'] }
};

class PricingCalculator {
    constructor() {
        this.baseRates = {
            development: 1500000, // per hour
            design: 1200000,
            marketing: 1000000,
            consulting: 2000000
        };
    }

    calculateHourly(service, hours, tier = 'standard') {
        const base = this.baseRates[service] || 1000000;
        const multiplier = ServiceTiers[tier]?.multiplier || 1;
        return base * hours * multiplier;
    }

    calculateProject(service, complexity, tier = 'standard') {
        const baseHours = { low: 20, medium: 50, high: 100 }[complexity] || 50;
        return this.calculateHourly(service, baseHours, tier);
    }

    calculateRetainer(services, hoursPerMonth, tier = 'standard') {
        let total = 0;
        services.forEach(s => {
            total += this.calculateHourly(s, hoursPerMonth / services.length, tier);
        });
        return Math.round(total * 0.85); // 15% retainer discount
    }

    calculateROI(investedValue, expectedReturn) {
        return Math.round(((expectedReturn - investedValue) / investedValue) * 100);
    }
}

class PriceQuote {
    constructor(config) {
        this.id = config.id || `quote-${Date.now()}`;
        this.clientName = config.clientName;
        this.model = config.model || 'project';
        this.tier = config.tier || 'standard';
        this.services = config.services || [];
        this.basePrice = config.basePrice || 0;
        this.discount = config.discount || 0;
        this.finalPrice = this.basePrice * (1 - this.discount / 100);
        this.margin = 40; // 40% target margin
        this.createdAt = new Date().toISOString();
    }

    getProfit() {
        return Math.round(this.finalPrice * (this.margin / 100));
    }

    getCost() {
        return this.finalPrice - this.getProfit();
    }
}

class PricingManager {
    constructor() {
        this.quotes = new Map();
        this.calculator = new PricingCalculator();
    }

    createQuote(config) {
        const quote = new PriceQuote(config);
        this.quotes.set(quote.id, quote);
        return quote;
    }

    getQuote(id) { return this.quotes.get(id); }
    getAllQuotes() { return Array.from(this.quotes.values()); }

    getMetrics() {
        const quotes = this.getAllQuotes();
        return {
            totalQuotes: quotes.length,
            totalRevenue: quotes.reduce((sum, q) => sum + q.finalPrice, 0),
            avgDealSize: quotes.length > 0 ? Math.round(quotes.reduce((sum, q) => sum + q.finalPrice, 0) / quotes.length) : 0,
            totalProfit: quotes.reduce((sum, q) => sum + q.getProfit(), 0)
        };
    }
}

function createDemoPricing(manager) {
    manager.createQuote({ clientName: 'ABC Corp', model: 'project', tier: 'premium', services: ['development', 'design'], basePrice: 75000000 });
    manager.createQuote({ clientName: 'XYZ Shop', model: 'retainer', tier: 'standard', services: ['marketing'], basePrice: 20000000 });
    manager.createQuote({ clientName: 'Tech Co', model: 'hourly', tier: 'basic', services: ['consulting'], basePrice: 10000000 });
    return manager.getAllQuotes();
}

const pricingManager = new PricingManager();
if (typeof module !== 'undefined') module.exports = { PricingManager, PriceQuote, PricingCalculator, PricingModels, ServiceTiers, pricingManager, createDemoPricing };

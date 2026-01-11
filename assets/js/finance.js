/**
 * ==============================================
 * MEKONG AGENCY - FINANCE REPORTING
 * AgencyOS Finance Reporting Workflow
 * ==============================================
 */

const AccountTypes = {
    revenue: { id: 'revenue', name: 'Revenue', category: 'income' },
    expense: { id: 'expense', name: 'Expense', category: 'expense' },
    payroll: { id: 'payroll', name: 'Payroll', category: 'expense' },
    marketing: { id: 'marketing', name: 'Marketing', category: 'expense' },
    operations: { id: 'operations', name: 'Operations', category: 'expense' }
};

class Transaction {
    constructor(config) {
        this.id = config.id || `txn-${Date.now()}`;
        this.type = config.type; // revenue, expense
        this.category = config.category;
        this.amount = config.amount;
        this.description = config.description || '';
        this.client = config.client || null;
        this.date = config.date || new Date().toISOString();
        this.status = config.status || 'completed';
    }
}

class Invoice {
    constructor(config) {
        this.id = config.id || `inv-${Date.now()}`;
        this.invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
        this.client = config.client;
        this.items = config.items || [];
        this.subtotal = config.subtotal || 0;
        this.tax = config.tax || 0;
        this.total = this.subtotal + this.tax;
        this.status = 'pending'; // pending, sent, paid, overdue
        this.dueDate = this.calculateDueDate();
        this.createdAt = new Date().toISOString();
        this.paidAt = null;
    }

    calculateDueDate() {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toISOString();
    }

    markPaid() {
        this.status = 'paid';
        this.paidAt = new Date().toISOString();
        return this;
    }

    isOverdue() {
        return this.status !== 'paid' && new Date() > new Date(this.dueDate);
    }
}

class FinanceManager {
    constructor() {
        this.transactions = [];
        this.invoices = new Map();
    }

    addTransaction(config) {
        const txn = new Transaction(config);
        this.transactions.push(txn);
        return txn;
    }

    createInvoice(config) {
        const invoice = new Invoice(config);
        this.invoices.set(invoice.id, invoice);
        return invoice;
    }

    getInvoice(id) { return this.invoices.get(id); }
    getAllInvoices() { return Array.from(this.invoices.values()); }

    getPnL(startDate, endDate) {
        const txns = this.transactions.filter(t => {
            const d = new Date(t.date);
            return d >= new Date(startDate) && d <= new Date(endDate);
        });

        const revenue = txns.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0);
        const expenses = txns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        return { revenue, expenses, profit: revenue - expenses, margin: revenue > 0 ? Math.round((revenue - expenses) / revenue * 100) : 0 };
    }

    getCashFlow() {
        const pending = this.getAllInvoices().filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.total, 0);
        const paid = this.getAllInvoices().filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
        const revenue = this.transactions.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0);
        const expenses = this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        return { inflow: revenue, outflow: expenses, pending, collected: paid, net: revenue - expenses };
    }

    getMetrics() {
        const invoices = this.getAllInvoices();
        const now = new Date();
        const thisMonth = this.transactions.filter(t => new Date(t.date).getMonth() === now.getMonth());

        return {
            totalRevenue: this.transactions.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0),
            totalExpenses: this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
            monthlyRevenue: thisMonth.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0),
            pendingInvoices: invoices.filter(i => i.status === 'pending').length,
            overdueInvoices: invoices.filter(i => i.isOverdue()).length
        };
    }
}

function createDemoFinance(manager) {
    manager.addTransaction({ type: 'revenue', category: 'revenue', amount: 50000000, description: 'Website project', client: 'ABC Corp' });
    manager.addTransaction({ type: 'revenue', category: 'revenue', amount: 20000000, description: 'Monthly retainer', client: 'XYZ Shop' });
    manager.addTransaction({ type: 'expense', category: 'payroll', amount: 30000000, description: 'Staff salary' });
    manager.addTransaction({ type: 'expense', category: 'marketing', amount: 5000000, description: 'Ads budget' });

    const inv1 = manager.createInvoice({ client: 'Tech Co', subtotal: 35000000, tax: 3500000 });
    inv1.markPaid();
    manager.createInvoice({ client: 'Startup Inc', subtotal: 15000000, tax: 1500000 });

    return manager;
}

const financeManager = new FinanceManager();
if (typeof module !== 'undefined') module.exports = { FinanceManager, Transaction, Invoice, AccountTypes, financeManager, createDemoFinance };

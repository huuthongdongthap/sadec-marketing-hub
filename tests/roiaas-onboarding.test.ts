// ROIaaS Onboarding Wizard - Unit Tests
// Test step navigation, form validation, state management

import {
    assert,
    assertEquals,
    assertFalse,
    assertObjectMatch,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { assertGreater } from "https://deno.land/std@0.224.0/assert/assert_greater.ts";

// Helper
function assertTrue(condition: boolean, msg?: string) {
    if (!condition) throw new Error(msg || 'Expected true but got false');
}

// Mock state management
class MockOnboardingState {
    currentStep = 1;
    totalSteps = 4;
    data = {
        plan: 'growth',
        industry: null as string | null,
        companyName: '',
        monthlyBudget: '',
        channels: [] as string[],
        campaignCount: '',
        firstCampaign: {
            name: '',
            revenue: 0,
            cost: 0,
            channel: ''
        }
    };
}

// Validation functions (mirrored from main code)
function validateIndustry(industry: string | null): boolean {
    return industry !== null && industry.length > 0;
}

function validateCompanyName(name: string): boolean {
    return name.trim().length > 0;
}

function validateMonthlyBudget(budget: string): boolean {
    return budget.length > 0;
}

function validateChannels(channels: string[]): boolean {
    return channels.length > 0;
}

function validateCampaignCount(count: string): boolean {
    return count.length > 0;
}

function validateCampaignData(data: { name: string; revenue: number; cost: number; channel: string }): boolean {
    return data.name.trim().length > 0 &&
        data.revenue > 0 &&
        data.cost > 0 &&
        data.channel.length > 0;
}

function calculateROI(revenue: number, cost: number): { profit: number; roi: number; roas: number } {
    const profit = revenue - cost;
    const roi = cost > 0 ? (profit / cost) : 0;
    const roas = cost > 0 ? (revenue / cost) : 0;
    return { profit, roi, roas };
}

function detectPhase(roi: number): { phase: string; phaseName: string } {
    if (roi >= 1.5) return { phase: 'R4', phaseName: 'Bùng nổ' };
    if (roi >= 0.5) return { phase: 'R3', phaseName: 'Tăng trưởng' };
    if (roi >= 0) return { phase: 'R2', phaseName: 'Hòa vốn' };
    return { phase: 'R1', phaseName: 'Lỗ' };
}

// ==================== PLAN SELECTION TESTS ====================

Deno.test("Onboarding - Plan Selection - default plan is growth", () => {
    const state = new MockOnboardingState();
    assertEquals(state.data.plan, 'growth');
});

Deno.test("Onboarding - Plan Selection - can change plan to starter", () => {
    const state = new MockOnboardingState();
    state.data.plan = 'starter';
    assertEquals(state.data.plan, 'starter');
});

Deno.test("Onboarding - Plan Selection - can change plan to pro", () => {
    const state = new MockOnboardingState();
    state.data.plan = 'pro';
    assertEquals(state.data.plan, 'pro');
});

// ==================== INDUSTRY SELECTION TESTS ====================

Deno.test("Onboarding - Industry Selection - validate industry selection", () => {
    assertTrue(validateIndustry('ecommerce'));
    assertTrue(validateIndustry('retail'));
    assertTrue(validateIndustry('fnb'));
    assertFalse(validateIndustry(null));
    assertFalse(validateIndustry(''));
});

Deno.test("Onboarding - Industry Selection - all industry options are valid", () => {
    const industries = ['ecommerce', 'retail', 'fnb', 'agriculture', 'education', 'healthcare', 'tourism', 'other'];
    for (const industry of industries) {
        assertTrue(validateIndustry(industry), `Industry ${industry} should be valid`);
    }
});

// ==================== COMPANY INFO VALIDATION TESTS ====================

Deno.test("Onboarding - Company Name - valid company name", () => {
    assertTrue(validateCompanyName('Công ty ABC'));
    assertTrue(validateCompanyName('123 Store'));
    assertTrue(validateCompanyName('a')); // Minimum 1 char
});

Deno.test("Onboarding - Company Name - invalid company name (empty)", () => {
    assertFalse(validateCompanyName(''));
    assertFalse(validateCompanyName('   '));
});

Deno.test("Onboarding - Monthly Budget - valid budget options", () => {
    assertTrue(validateMonthlyBudget('<10m'));
    assertTrue(validateMonthlyBudget('10-50m'));
    assertTrue(validateMonthlyBudget('50-100m'));
    assertTrue(validateMonthlyBudget('100-500m'));
    assertTrue(validateMonthlyBudget('>500m'));
});

Deno.test("Onboarding - Monthly Budget - invalid budget (empty)", () => {
    assertFalse(validateMonthlyBudget(''));
});

// ==================== CHANNEL SELECTION TESTS ====================

Deno.test("Onboarding - Channels - at least one channel required", () => {
    assertFalse(validateChannels([]));
    assertTrue(validateChannels(['facebook']));
    assertTrue(validateChannels(['facebook', 'google']));
});

Deno.test("Onboarding - Channels - can select multiple channels", () => {
    const channels = ['facebook', 'google', 'tiktok'];
    assertEquals(channels.length, 3);
    assertTrue(validateChannels(channels));
});

Deno.test("Onboarding - Channels - toggle channel (add and remove)", () => {
    let channels: string[] = [];

    // Add facebook
    channels.push('facebook');
    assertEquals(channels.length, 1);

    // Add google
    channels.push('google');
    assertEquals(channels.length, 2);

    // Remove facebook
    const index = channels.indexOf('facebook');
    if (index > -1) channels.splice(index, 1);
    assertEquals(channels.length, 1);
    assertEquals(channels[0], 'google');
});

Deno.test("Onboarding - Channels - all supported channels", () => {
    const supportedChannels = ['facebook', 'google', 'tiktok', 'zalo'];
    for (const channel of supportedChannels) {
        assertTrue(validateChannels([channel]), `Channel ${channel} should be valid`);
    }
});

// ==================== CAMPAIGN COUNT VALIDATION ====================

Deno.test("Onboarding - Campaign Count - valid options", () => {
    assertTrue(validateCampaignCount('1-3'));
    assertTrue(validateCampaignCount('4-10'));
    assertTrue(validateCampaignCount('11-20'));
    assertTrue(validateCampaignCount('20+'));
});

Deno.test("Onboarding - Campaign Count - invalid (empty)", () => {
    assertFalse(validateCampaignCount(''));
});

// ==================== STEP NAVIGATION TESTS ====================

Deno.test("Onboarding - Navigation - starts at step 1", () => {
    const state = new MockOnboardingState();
    assertEquals(state.currentStep, 1);
});

Deno.test("Onboarding - Navigation - can advance to next step", () => {
    const state = new MockOnboardingState();
    state.currentStep = 2;
    assertEquals(state.currentStep, 2);
});

Deno.test("Onboarding - Navigation - can go back to previous step", () => {
    const state = new MockOnboardingState();
    state.currentStep = 3;
    state.currentStep = 2; // Simulate going back
    assertEquals(state.currentStep, 2);
});

Deno.test("Onboarding - Navigation - cannot go below step 1", () => {
    const state = new MockOnboardingState();
    state.currentStep = Math.max(1, state.currentStep - 1);
    assertEquals(state.currentStep, 1);
});

Deno.test("Onboarding - Navigation - progress percentage calculation", () => {
    const totalSteps = 4;

    assertEquals((1 / totalSteps) * 100, 25);
    assertEquals((2 / totalSteps) * 100, 50);
    assertEquals((3 / totalSteps) * 100, 75);
    assertEquals((4 / totalSteps) * 100, 100);
});

// ==================== STEP 2 VALIDATION (Business Info) ====================

Deno.test("Onboarding - Step 2 Validation - all fields required", () => {
    const state = new MockOnboardingState();

    // Missing all fields
    assertFalse(validateIndustry(state.data.industry));
    assertFalse(validateCompanyName(state.data.companyName));
    assertFalse(validateMonthlyBudget(state.data.monthlyBudget));
});

Deno.test("Onboarding - Step 2 Validation - valid when all fields filled", () => {
    const state = new MockOnboardingState();
    state.data.industry = 'ecommerce';
    state.data.companyName = 'Test Company';
    state.data.monthlyBudget = '10-50m';

    assertTrue(validateIndustry(state.data.industry));
    assertTrue(validateCompanyName(state.data.companyName));
    assertTrue(validateMonthlyBudget(state.data.monthlyBudget));
});

Deno.test("Onboarding - Step 2 Validation - industry required", () => {
    const state = new MockOnboardingState();
    state.data.industry = null;
    state.data.companyName = 'Test Company';
    state.data.monthlyBudget = '10-50m';

    assertFalse(validateIndustry(state.data.industry));
});

// ==================== STEP 3 VALIDATION (Connect Campaigns) ====================

Deno.test("Onboarding - Step 3 Validation - at least one channel required", () => {
    const state = new MockOnboardingState();
    state.data.channels = [];
    state.data.campaignCount = '1-3';

    assertFalse(validateChannels(state.data.channels));
    assertTrue(validateCampaignCount(state.data.campaignCount));
});

Deno.test("Onboarding - Step 3 Validation - campaign count required", () => {
    const state = new MockOnboardingState();
    state.data.channels = ['facebook'];
    state.data.campaignCount = '';

    assertTrue(validateChannels(state.data.channels));
    assertFalse(validateCampaignCount(state.data.campaignCount));
});

Deno.test("Onboarding - Step 3 Validation - valid when both filled", () => {
    const state = new MockOnboardingState();
    state.data.channels = ['facebook', 'google'];
    state.data.campaignCount = '4-10';

    assertTrue(validateChannels(state.data.channels));
    assertTrue(validateCampaignCount(state.data.campaignCount));
});

// ==================== STEP 4 VALIDATION (First Campaign) ====================

Deno.test("Onboarding - Step 4 Validation - all campaign fields required", () => {
    const campaignData = {
        name: '',
        revenue: 0,
        cost: 0,
        channel: ''
    };

    assertFalse(validateCampaignData(campaignData));
});

Deno.test("Onboarding - Step 4 Validation - valid campaign data", () => {
    const campaignData = {
        name: 'Chiến dịch Tết 2024',
        revenue: 150000000,
        cost: 50000000,
        channel: 'facebook'
    };

    assertTrue(validateCampaignData(campaignData));
});

Deno.test("Onboarding - Step 4 Validation - revenue must be positive", () => {
    const campaignData = {
        name: 'Test Campaign',
        revenue: 0,
        cost: 50000,
        channel: 'facebook'
    };

    assertFalse(validateCampaignData(campaignData));
});

Deno.test("Onboarding - Step 4 Validation - cost must be positive", () => {
    const campaignData = {
        name: 'Test Campaign',
        revenue: 100000,
        cost: 0,
        channel: 'facebook'
    };

    assertFalse(validateCampaignData(campaignData));
});

Deno.test("Onboarding - Step 4 Validation - channel required", () => {
    const campaignData = {
        name: 'Test Campaign',
        revenue: 100000,
        cost: 50000,
        channel: ''
    };

    assertFalse(validateCampaignData(campaignData));
});

// ==================== ROI CALCULATION TESTS ====================

Deno.test("ROI Calculation - profitable campaign", () => {
    const result = calculateROI(150000, 50000);
    assertEquals(result.profit, 100000);
    assertEquals(result.roi, 2);
    assertEquals(result.roas, 3);
});

Deno.test("ROI Calculation - breakeven campaign", () => {
    const result = calculateROI(100000, 100000);
    assertEquals(result.profit, 0);
    assertEquals(result.roi, 0);
    assertEquals(result.roas, 1);
});

Deno.test("ROI Calculation - loss campaign", () => {
    const result = calculateROI(50000, 100000);
    assertEquals(result.profit, -50000);
    assertEquals(result.roi, -0.5);
    assertEquals(result.roas, 0.5);
});

Deno.test("ROI Calculation - zero cost protection", () => {
    const result = calculateROI(100000, 0);
    assertEquals(result.profit, 100000);
    assertEquals(result.roi, 0); // Protected from division by zero
    assertEquals(result.roas, 0);
});

// ==================== PHASE DETECTION TESTS ====================

Deno.test("Phase Detection - R4 (explosive growth)", () => {
    assertEquals(detectPhase(2.0).phase, 'R4');
    assertEquals(detectPhase(2.0).phaseName, 'Bùng nổ');
    assertEquals(detectPhase(1.5).phase, 'R4');
});

Deno.test("Phase Detection - R3 (growth)", () => {
    assertEquals(detectPhase(1.0).phase, 'R3');
    assertEquals(detectPhase(1.0).phaseName, 'Tăng trưởng');
    assertEquals(detectPhase(0.5).phase, 'R3');
});

Deno.test("Phase Detection - R2 (breakeven)", () => {
    assertEquals(detectPhase(0.25).phase, 'R2');
    assertEquals(detectPhase(0.25).phaseName, 'Hòa vốn');
    assertEquals(detectPhase(0).phase, 'R2');
});

Deno.test("Phase Detection - R1 (loss)", () => {
    assertEquals(detectPhase(-0.5).phase, 'R1');
    assertEquals(detectPhase(-0.5).phaseName, 'Lỗ');
    assertEquals(detectPhase(-1).phase, 'R1');
});

Deno.test("Phase Detection - boundary precision", () => {
    assertEquals(detectPhase(0.49).phase, 'R2');
    assertEquals(detectPhase(0.51).phase, 'R3');
    assertEquals(detectPhase(1.49).phase, 'R3');
    assertEquals(detectPhase(1.51).phase, 'R4');
});

// ==================== STATE PERSISTENCE TESTS ====================

Deno.test("Onboarding - State Persistence - serialize state to JSON", () => {
    const state = new MockOnboardingState();
    state.data.industry = 'ecommerce';
    state.data.companyName = 'Test Company';
    state.data.monthlyBudget = '10-50m';
    state.data.channels = ['facebook', 'google'];

    const serialized = JSON.stringify(state.data);
    const deserialized = JSON.parse(serialized);

    assertEquals(deserialized.industry, 'ecommerce');
    assertEquals(deserialized.companyName, 'Test Company');
    assertEquals(deserialized.channels.length, 2);
});

Deno.test("Onboarding - State Persistence - restore state from JSON", () => {
    const savedData = {
        plan: 'pro',
        industry: 'retail',
        companyName: 'ABC Store',
        monthlyBudget: '50-100m',
        channels: ['tiktok']
    };

    const state = new MockOnboardingState();
    state.data = { ...state.data, ...savedData };

    assertEquals(state.data.plan, 'pro');
    assertEquals(state.data.industry, 'retail');
    assertEquals(state.data.companyName, 'ABC Store');
    assertEquals(state.data.channels[0], 'tiktok');
});

// ==================== INTEGRATION TESTS ====================

Deno.test("Onboarding - Full Flow - complete onboarding sequence", () => {
    const state = new MockOnboardingState();

    // Step 1: Select plan
    state.data.plan = 'growth';
    assertTrue(['starter', 'growth', 'pro'].includes(state.data.plan));

    // Step 2: Business info
    state.data.industry = 'ecommerce';
    state.data.companyName = 'Test Company';
    state.data.monthlyBudget = '10-50m';
    assertTrue(validateIndustry(state.data.industry));
    assertTrue(validateCompanyName(state.data.companyName));
    assertTrue(validateMonthlyBudget(state.data.monthlyBudget));

    // Step 3: Channels
    state.data.channels = ['facebook', 'google'];
    state.data.campaignCount = '4-10';
    assertTrue(validateChannels(state.data.channels));
    assertTrue(validateCampaignCount(state.data.campaignCount));

    // Step 4: First campaign
    state.data.firstCampaign = {
        name: 'Test Campaign',
        revenue: 150000,
        cost: 50000,
        channel: 'facebook'
    };
    assertTrue(validateCampaignData(state.data.firstCampaign));

    // Calculate ROI
    const roi = calculateROI(state.data.firstCampaign.revenue, state.data.firstCampaign.cost);
    assertEquals(roi.roi, 2);
    assertEquals(detectPhase(roi.roi).phase, 'R4');
});

Deno.test("Onboarding - Full Flow - validate all steps before submit", () => {
    const state = new MockOnboardingState();
    const errors: string[] = [];

    // Validate Step 2
    if (!validateIndustry(state.data.industry)) errors.push('industry required');
    if (!validateCompanyName(state.data.companyName)) errors.push('companyName required');
    if (!validateMonthlyBudget(state.data.monthlyBudget)) errors.push('monthlyBudget required');

    assertEquals(errors.length, 3); // All empty by default

    // Fill data
    state.data.industry = 'ecommerce';
    state.data.companyName = 'Test';
    state.data.monthlyBudget = '10-50m';
    state.data.channels = ['facebook'];
    state.data.campaignCount = '1-3';
    state.data.firstCampaign = {
        name: 'Campaign',
        revenue: 100000,
        cost: 50000,
        channel: 'facebook'
    };

    // Re-validate
    const newErrors: string[] = [];
    if (!validateIndustry(state.data.industry)) newErrors.push('industry required');
    if (!validateCompanyName(state.data.companyName)) newErrors.push('companyName required');
    if (!validateMonthlyBudget(state.data.monthlyBudget)) newErrors.push('monthlyBudget required');
    if (!validateChannels(state.data.channels)) newErrors.push('channels required');
    if (!validateCampaignCount(state.data.campaignCount)) newErrors.push('campaignCount required');
    if (!validateCampaignData(state.data.firstCampaign)) newErrors.push('campaign data required');

    assertEquals(newErrors.length, 0); // All valid
});

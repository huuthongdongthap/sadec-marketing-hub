// ROIaaS Onboarding Wizard - JavaScript Controller
// Handles step navigation, form validation, API integration

// State management
const onboardingState = {
    currentStep: 1,
    totalSteps: 4,
    data: {
        plan: 'growth',
        industry: null,
        companyName: '',
        monthlyBudget: '',
        channels: [],
        campaignCount: '',
        firstCampaign: {
            name: '',
            revenue: 0,
            cost: 0,
            channel: ''
        }
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateProgress();
    loadSavedData();
});

// Plan selection
function selectPlan(plan) {
    onboardingState.data.plan = plan;

    // Update UI
    document.querySelectorAll('.plan-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`.plan-card[data-plan="${plan}"]`).classList.add('selected');
}

// Industry selection
function selectIndustry(element) {
    onboardingState.data.industry = element.dataset.industry;

    // Update UI
    document.querySelectorAll('.industry-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
}

// Channel toggle (multi-select)
function toggleChannel(channel) {
    const index = onboardingState.data.channels.indexOf(channel);
    const card = document.querySelector(`.channel-card[data-channel="${channel}"]`);

    if (index > -1) {
        onboardingState.data.channels.splice(index, 1);
        card.classList.remove('selected');
    } else {
        onboardingState.data.channels.push(channel);
        card.classList.add('selected');
    }
}

// Navigation
function nextStep() {
    if (onboardingState.currentStep < onboardingState.totalSteps) {
        goToStep(onboardingState.currentStep + 1);
    }
}

function prevStep() {
    if (onboardingState.currentStep > 1) {
        goToStep(onboardingState.currentStep - 1);
    }
}

function goToStep(step) {
    // Hide all steps
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });

    // Show target step
    document.querySelector(`.step-content[data-step="${step}"]`).classList.add('active');

    // Update step dots
    document.querySelectorAll('.step-dot').forEach((dot, index) => {
        const stepNum = index + 1;
        dot.classList.remove('active', 'completed');

        if (stepNum < step) {
            dot.classList.add('completed');
            dot.innerHTML = '<span class="material-symbols-outlined">check</span>';
        } else if (stepNum === step) {
            dot.classList.add('active');
            dot.textContent = stepNum;
        } else {
            dot.textContent = stepNum;
        }
    });

    onboardingState.currentStep = step;
    updateProgress();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update progress bar
function updateProgress() {
    const progress = (onboardingState.currentStep / onboardingState.totalSteps) * 100;
    document.querySelector('#progress-fill').style.width = `${progress}%`;
    document.querySelector('#progress-text').textContent = `Bước ${onboardingState.currentStep}/${onboardingState.totalSteps}`;
}

// Validation Step 2: Business Info
function validateStep2() {
    const companyName = document.querySelector('#company-name').value.trim();
    const monthlyBudget = document.querySelector('#monthly-budget').value;
    const errorEl = document.querySelector('#step2-error');

    if (!onboardingState.data.industry) {
        showError(errorEl, 'Vui lòng chọn ngành nghề');
        return false;
    }

    if (!companyName) {
        showError(errorEl, 'Vui lòng nhập tên doanh nghiệp');
        return false;
    }

    if (!monthlyBudget) {
        showError(errorEl, 'Vui lòng chọn ngân sách');
        return false;
    }

    // Save data
    onboardingState.data.companyName = companyName;
    onboardingState.data.monthlyBudget = monthlyBudget;

    hideError(errorEl);
    nextStep();
    return true;
}

// Validation Step 3: Connect Campaigns
function validateStep3() {
    const campaignCount = document.querySelector('#campaign-count').value;
    const errorEl = document.querySelector('#step3-error');

    if (onboardingState.data.channels.length === 0) {
        showError(errorEl, 'Vui lòng chọn ít nhất 1 kênh');
        return false;
    }

    if (!campaignCount) {
        showError(errorEl, 'Vui lòng chọn số chiến dịch');
        return false;
    }

    // Save data
    onboardingState.data.campaignCount = campaignCount;

    // Pre-fill channel dropdown in step 4
    const channelSelect = document.querySelector('#campaign-channel');
    if (onboardingState.data.channels.length > 0) {
        channelSelect.value = onboardingState.data.channels[0];
    }

    hideError(errorEl);
    nextStep();
    return true;
}

// Submit Final Step
async function submitOnboarding() {
    const campaignName = document.querySelector('#campaign-name').value.trim();
    const revenue = parseFloat(document.querySelector('#campaign-revenue').value);
    const cost = parseFloat(document.querySelector('#campaign-cost').value);
    const channel = document.querySelector('#campaign-channel').value;
    const errorEl = document.querySelector('#step4-error');

    // Validation
    if (!campaignName) {
        showError(errorEl, 'Vui lòng nhập tên chiến dịch');
        return;
    }

    if (!revenue || revenue <= 0) {
        showError(errorEl, 'Vui lòng nhập doanh thu hợp lệ');
        return;
    }

    if (!cost || cost <= 0) {
        showError(errorEl, 'Vui lòng nhập chi phí hợp lệ');
        return;
    }

    if (!channel) {
        showError(errorEl, 'Vui lòng chọn kênh');
        return;
    }

    // Save first campaign data
    onboardingState.data.firstCampaign = {
        name: campaignName,
        revenue,
        cost,
        channel
    };

    hideError(errorEl);

    // Disable button and show loading
    const submitBtn = document.querySelector('#submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <span class="loading-spinner"></span>
        Đang xử lý...
    `;

    try {
        // Save onboarding data to API
        await saveOnboardingData();

        // Calculate ROI and redirect
        await performFirstROIAnalysis();

        // Show success step
        goToStep(5);

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
            window.location.href = 'roiaas-dashboard.html';
        }, 3000);

    } catch (error) {
        console.error('Onboarding error:', error);
        showError(errorEl, 'Có lỗi xảy ra. Vui lòng thử lại.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            <span class="material-symbols-outlined">analytics</span>
            Phân tích ROI
        `;
    }
}

// Save onboarding data to API
async function saveOnboardingData() {
    // Get auth token from localStorage
    const token = localStorage.getItem('sb-access-token') || localStorage.getItem('auth-token');

    const payload = {
        ...onboardingState.data,
        onboardedAt: new Date().toISOString()
    };

    // Save to localStorage as backup
    localStorage.setItem('roiaas-onboarding', JSON.stringify(payload));

    // Try to save to API (non-blocking)
    try {
        const response = await fetch('/api/roiaas/onboarding', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.warn('API save failed, but continuing with local data');
        }
    } catch (error) {
        console.warn('API unavailable, using local storage only');
    }
}

// Perform first ROI analysis
async function performFirstROIAnalysis() {
    const campaign = onboardingState.data.firstCampaign;
    const token = localStorage.getItem('sb-access-token') || localStorage.getItem('auth-token');

    // Calculate ROI metrics
    const profit = campaign.revenue - campaign.cost;
    const roi = campaign.cost > 0 ? (profit / campaign.cost) : 0;
    const roas = campaign.cost > 0 ? (campaign.revenue / campaign.cost) : 0;

    // Detect phase
    let phase = 'R1';
    let phaseName = 'Lỗ';
    if (roi >= 1.5) { phase = 'R4'; phaseName = 'Bùng nổ'; }
    else if (roi >= 0.5) { phase = 'R3'; phaseName = 'Tăng trưởng'; }
    else if (roi >= 0) { phase = 'R2'; phaseName = 'Hòa vốn'; }

    // Save to roiaas_reports via API
    try {
        await fetch('/api/roiaas/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                campaign_name: campaign.name,
                channel: campaign.channel,
                revenue: campaign.revenue,
                cost: campaign.cost,
                profit,
                roi,
                roas,
                phase,
                phase_name: phaseName
            })
        });
    } catch (error) {
        console.warn('ROI analysis API call failed');
    }
}

// Load saved data (resume onboarding)
function loadSavedData() {
    const saved = localStorage.getItem('roiaas-onboarding');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            onboardingState.data = { ...onboardingState.data, ...data };

            // Restore UI state
            if (data.plan) {
                document.querySelector(`.plan-card[data-plan="${data.plan}"]`)?.classList.add('selected');
            }
            if (data.industry) {
                document.querySelector(`.industry-option[data-industry="${data.industry}"]`)?.classList.add('selected');
            }
            if (data.companyName) {
                document.querySelector('#company-name').value = data.companyName;
            }
            if (data.monthlyBudget) {
                document.querySelector('#monthly-budget').value = data.monthlyBudget;
            }
            if (data.channels && data.channels.length > 0) {
                data.channels.forEach(ch => {
                    document.querySelector(`.channel-card[data-channel="${ch}"]`)?.classList.add('selected');
                });
            }

            console.log('Loaded saved onboarding data');
        } catch (error) {
            console.error('Failed to load saved data:', error);
        }
    }
}

// Utility functions
function showError(element, message) {
    element.textContent = message;
    element.classList.add('visible');

    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideError(element);
    }, 5000);
}

function hideError(element) {
    element.classList.remove('visible');
    element.textContent = '';
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { onboardingState, selectPlan, selectIndustry, toggleChannel, validateStep2, validateStep3, submitOnboarding };
}

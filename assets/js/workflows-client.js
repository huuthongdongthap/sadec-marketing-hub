/**
 * ==============================================
 * MEKONG AGENCY - WORKFLOWS CLIENT
 * Supabase Live Data for Automation Workflows
 * ==============================================
 */

import { workflows } from './supabase.js';

// Load workflows data
async function loadWorkflowsData() {
    try {
        const { data, error } = await workflows.getAll();

        if (error || !data) {
            return getDemoWorkflowsData();
        }

        const activeWorkflows = data.filter(w => w.is_active);
        const inactiveWorkflows = data.filter(w => !w.is_active);

        return {
            workflows: data,
            stats: {
                total: data.length,
                active: activeWorkflows.length,
                inactive: inactiveWorkflows.length,
                scheduled: data.filter(w => w.trigger_type === 'scheduled').length,
                eventBased: data.filter(w => w.trigger_type === 'event').length
            }
        };
    } catch (error) {
        console.error('Workflows data error:', error);
        return getDemoWorkflowsData();
    }
}

function getDemoWorkflowsData() {
    return {
        workflows: [
            { id: 1, name: 'Lead Welcome Email', trigger_type: 'event', is_active: true, trigger_config: { event: 'lead.created' } },
            { id: 2, name: 'Invoice Reminder', trigger_type: 'scheduled', is_active: true, trigger_config: { cron: '0 9 * * 1' } },
            { id: 3, name: 'Weekly Report', trigger_type: 'scheduled', is_active: true, trigger_config: { cron: '0 8 * * 5' } }
        ],
        stats: { total: 3, active: 3, inactive: 0, scheduled: 2, eventBased: 1 }
    };
}

// Get trigger description
function getTriggerDescription(type, config) {
    if (type === 'event') {
        const eventMap = {
            'lead.created': 'Khi có lead mới',
            'deal.won': 'Khi chốt deal',
            'invoice.created': 'Khi tạo hóa đơn',
            'project.complete': 'Khi hoàn thành dự án'
        };
        return eventMap[config?.event] || config?.event || 'Event trigger';
    }

    if (type === 'scheduled') {
        // Parse cron expression (simplified)
        if (config?.cron?.includes('* * 1')) return 'Mỗi thứ Hai';
        if (config?.cron?.includes('* * 5')) return 'Mỗi thứ Sáu';
        if (config?.cron?.includes('1 * *')) return 'Đầu mỗi tháng';
        return 'Đã lên lịch';
    }

    return 'Thủ công';
}

// Render workflows list
function renderWorkflowsList(workflowsData, containerId = 'workflows-list') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const triggerIcons = {
        event: 'bolt',
        scheduled: 'schedule',
        manual: 'touch_app'
    };

    container.innerHTML = workflowsData.map(w => `
        <div class="workflow-card" data-id="${w.id}" style="display: flex; align-items: center; gap: 16px; padding: 16px; background: ${w.is_active ? '#fff' : '#f9f9f9'}; border-radius: 12px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); opacity: ${w.is_active ? 1 : 0.7};">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: ${w.is_active ? '#E0F2F1' : '#f5f5f5'}; color: ${w.is_active ? '#006A60' : '#999'}; display: flex; align-items: center; justify-content: center;">
                <span class="material-symbols-outlined">${triggerIcons[w.trigger_type] || 'settings'}</span>
            </div>
            
            <div style="flex: 1;">
                <div style="font-weight: 600; color: ${w.is_active ? '#333' : '#888'};">${w.name}</div>
                <div style="font-size: 13px; color: #888; margin-top: 2px;">
                    <span class="material-symbols-outlined" style="font-size: 14px; vertical-align: middle;">${triggerIcons[w.trigger_type]}</span>
                    ${getTriggerDescription(w.trigger_type, w.trigger_config)}
                </div>
            </div>
            
            <div style="display: flex; align-items: center; gap: 12px;">
                ${w.last_run_at ? `<span style="font-size: 12px; color: #888;">Chạy: ${new Date(w.last_run_at).toLocaleDateString('vi-VN')}</span>` : ''}
                
                <label class="workflow-toggle" style="position: relative; display: inline-block; width: 48px; height: 24px;">
                    <input type="checkbox" ${w.is_active ? 'checked' : ''} data-workflow-id="${w.id}" style="opacity: 0; width: 0; height: 0;">
                    <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: ${w.is_active ? '#006A60' : '#ccc'}; border-radius: 24px; transition: 0.3s;">
                        <span style="position: absolute; height: 18px; width: 18px; left: ${w.is_active ? '27px' : '3px'}; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s;"></span>
                    </span>
                </label>
                
                <button class="run-workflow-btn" data-workflow-id="${w.id}" style="padding: 8px 16px; background: ${w.is_active ? '#006A60' : '#ccc'}; color: white; border: none; border-radius: 8px; cursor: ${w.is_active ? 'pointer' : 'not-allowed'}; font-size: 13px;" ${!w.is_active ? 'disabled' : ''}>
                    <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">play_arrow</span>
                    Chạy
                </button>
            </div>
        </div>
    `).join('');

    // Bind toggle events
    container.querySelectorAll('input[data-workflow-id]').forEach(input => {
        input.addEventListener('change', async (e) => {
            const workflowId = e.target.dataset.workflowId;
            const isActive = e.target.checked;

            try {
                await workflows.toggle(workflowId, isActive);
                showToast(`Workflow ${isActive ? 'đã bật' : 'đã tắt'}`, 'success');
                // Refresh
                const data = await loadWorkflowsData();
                renderWorkflowsList(data.workflows);
            } catch (err) {
                showToast('Lỗi cập nhật workflow', 'error');
            }
        });
    });

    // Bind run buttons
    container.querySelectorAll('.run-workflow-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const workflowId = e.target.closest('[data-workflow-id]').dataset.workflowId;

            try {
                await workflows.run(workflowId);
                showToast('✅ Workflow đã chạy!', 'success');
            } catch (err) {
                showToast('Lỗi chạy workflow', 'error');
            }
        });
    });
}

// Simple toast
function showToast(message, type = 'info') {
    if (window.MekongAdmin?.Toast) {
        window.MekongAdmin.Toast[type](message);
    } else {
        // console.log(`[${type}] ${message}`);
    }
}

// Bind stats
async function bindWorkflowStats() {
    const { stats } = await loadWorkflowsData();

    const bindings = {
        'stat-workflows': stats.total,
        'stat-active': stats.active,
        'stat-scheduled': stats.scheduled,
        'stat-event': stats.eventBased
    };

    Object.entries(bindings).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });

    return stats;
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    const data = await loadWorkflowsData();

    renderWorkflowsList(data.workflows);
    await bindWorkflowStats();

    // console.debug('✅ Workflows dashboard loaded');
});

export { loadWorkflowsData, renderWorkflowsList, bindWorkflowStats };

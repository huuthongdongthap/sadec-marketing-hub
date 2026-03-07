/**
 * Portal Projects Module
 * Project Display & Detail Functions
 */

import { DEMO_PROJECTS, getProjectById } from './portal-data.js';
import { supabase, utils } from './supabase.js';
import { toast, modal, renderProjects } from './portal-ui.js';
import { formatCurrency } from './portal-utils.js';

// ================================================
// PROJECT DETAIL MODAL
// ================================================

export function showProjectDetail(project) {
    const typeLabels = {
        ads: 'Quảng cáo',
        seo: 'SEO',
        design: 'Thiết kế',
        social: 'Social Media',
        web: 'Website',
        consulting: 'Tư vấn',
        other: 'Khác'
    };

    const statusLabels = {
        planning: 'Chuẩn bị',
        active: 'Đang chạy',
        paused: 'Tạm dừng',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy'
    };

    const milestonesHTML = project.milestones ? project.milestones.map((m, i) => `
        <div style="display: flex; align-items: center; gap: 12px; padding: 8px 0;">
            <span class="material-symbols-outlined" style="color: ${m.completed ? '#2E7D32' : '#9E9E9E'}; font-size: 20px;">
                ${m.completed ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            <span style="flex: 1; ${m.completed ? 'text-decoration: line-through; color: #9E9E9E;' : ''}">${m.name}</span>
        </div>
    `).join('') : '<p style="color: #9E9E9E;">Không có milestones</p>';

    modal.open(`
        <div style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                <div>
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                        <span class="project-type ${project.type}" style="padding: 4px 12px; border-radius: 999px; font-size: 12px;">
                            ${typeLabels[project.type] || project.type}
                        </span>
                        <span class="status-badge ${project.status}" style="padding: 4px 12px; border-radius: 999px; font-size: 12px;">
                            ${statusLabels[project.status] || project.status}
                        </span>
                    </div>
                    <h2 style="margin: 0; font-size: 24px;">${project.name}</h2>
                </div>
                <button class="modal-close" style="background: none; border: none; cursor: pointer; padding: 8px;">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <p style="color: var(--md-sys-color-on-surface-variant, #666); margin-bottom: 24px;">
                ${project.description || 'Không có mô tả'}
            </p>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
                <div style="padding: 16px; background: var(--md-sys-color-surface-container, #f5f5f5); border-radius: 12px;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Ngân sách</div>
                    <div style="font-size: 18px; font-weight: 500;">${formatCurrency(project.budget)}</div>
                </div>
                <div style="padding: 16px; background: var(--md-sys-color-surface-container, #f5f5f5); border-radius: 12px;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Đã chi tiêu</div>
                    <div style="font-size: 18px; font-weight: 500;">${formatCurrency(project.spent)}</div>
                </div>
                <div style="padding: 16px; background: var(--md-sys-color-surface-container, #f5f5f5); border-radius: 12px;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Bắt đầu</div>
                    <div style="font-size: 16px;">${project.start_date ? utils.formatDate(project.start_date) : '--'}</div>
                </div>
                <div style="padding: 16px; background: var(--md-sys-color-surface-container, #f5f5f5); border-radius: 12px;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Kết thúc</div>
                    <div style="font-size: 16px;">${project.end_date ? utils.formatDate(project.end_date) : '--'}</div>
                </div>
            </div>

            <div style="margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-weight: 500;">Tiến độ</span>
                    <span style="font-weight: 500;">${project.progress}%</span>
                </div>
                <div style="height: 12px; background: #E0E0E0; border-radius: 6px; overflow: hidden;">
                    <div style="height: 100%; width: ${project.progress}%; background: linear-gradient(90deg, #006A60, #00897B); border-radius: 6px; transition: width 0.5s ease;"></div>
                </div>
            </div>

            <div>
                <h3 style="font-size: 16px; margin-bottom: 12px;">📌 Milestones</h3>
                ${milestonesHTML}
            </div>
        </div>
    `);
}

// ================================================
// LOAD PROJECTS
// ================================================

/**
 * Load and render projects grid
 */
export async function loadProjects(gridElement, filterStatus = 'all') {
    if (!gridElement) return;

    try {
        // Show loading state
        gridElement.innerHTML = '<div class="loading-state">Đang tải dự án...</div>';

        // Try to load from Supabase first
        let projects = await loadProjectsFromSupabase(filterStatus);

        // Fallback to demo data if no projects found
        if (!projects || projects.length === 0) {
            projects = filterStatus === 'all'
                ? DEMO_PROJECTS
                : DEMO_PROJECTS.filter(p => p.status === filterStatus);
        }

        // Render projects
        renderProjects(gridElement, projects);

    } catch (error) {
        console.error('Load projects error:', error);
        toast.error('Không thể tải danh sách dự án');

        // Fallback to demo data
        const projects = filterStatus === 'all'
            ? DEMO_PROJECTS
            : DEMO_PROJECTS.filter(p => p.status === filterStatus);
        renderProjects(gridElement, projects);
    }
}

/**
 * Load projects from Supabase
 */
async function loadProjectsFromSupabase(filterStatus) {
    if (!supabase) return null;

    try {
        let query = supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (filterStatus !== 'all') {
            query = query.eq('status', filterStatus);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Supabase load projects error:', error);
        return null;
    }
}

/**
 * Filter projects by status
 */
export function filterProjectsByStatus(projects, status) {
    if (status === 'all') return projects;
    return projects.filter(p => p.status === status);
}

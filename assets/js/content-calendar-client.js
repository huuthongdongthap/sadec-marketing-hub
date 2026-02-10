/**
 * ==============================================
 * MEKONG AGENCY - CONTENT CALENDAR CLIENT
 * Supabase Live Data Binding for Content Module
 * ==============================================
 */

import { content, utils } from './supabase.js';

// Platform colors & icons
const PLATFORMS = {
    facebook: { color: '#4267B2', icon: 'thumb_up', name: 'Facebook' },
    zalo: { color: '#0068FF', icon: 'chat', name: 'Zalo' },
    tiktok: { color: '#000000', icon: 'music_note', name: 'TikTok' },
    instagram: { color: '#E4405F', icon: 'photo_camera', name: 'Instagram' },
    website: { color: '#006A60', icon: 'language', name: 'Website' },
    youtube: { color: '#FF0000', icon: 'play_circle', name: 'YouTube' }
};

const STATUS_COLORS = {
    draft: { bg: '#f5f5f5', color: '#666' },
    scheduled: { bg: '#CCE5FF', color: '#004085' },
    published: { bg: '#D4EDDA', color: '#155724' },
    archived: { bg: '#f8d7da', color: '#721C24' }
};

// Load content calendar data
async function loadContentData(filters = {}) {
    try {
        const { data, error } = await content.getAll(filters);

        if (error || !data) {
            return getDemoContentData();
        }

        return {
            posts: data,
            stats: calculateStats(data)
        };
    } catch (error) {
        console.error('Content data error:', error);
        return getDemoContentData();
    }
}

function calculateStats(posts) {
    return {
        total: posts.length,
        draft: posts.filter(p => p.status === 'draft').length,
        scheduled: posts.filter(p => p.status === 'scheduled').length,
        published: posts.filter(p => p.status === 'published').length,
        byPlatform: Object.keys(PLATFORMS).reduce((acc, platform) => {
            acc[platform] = posts.filter(p => p.platform === platform).length;
            return acc;
        }, {})
    };
}

function getDemoContentData() {
    return {
        posts: [
            { id: 1, title: 'Chúc mừng năm mới 2026', platform: 'facebook', status: 'scheduled', scheduled_at: '2026-01-25T09:00:00' },
            { id: 2, title: 'Tips marketing hiệu quả', platform: 'zalo', status: 'draft', scheduled_at: '2026-01-28T10:00:00' },
            { id: 3, title: 'Case study: Riverside Hotel', platform: 'website', status: 'published', published_at: '2026-01-10T08:00:00' }
        ],
        stats: { total: 3, draft: 1, scheduled: 1, published: 1, byPlatform: { facebook: 1, zalo: 1, website: 1 } }
    };
}

// Render calendar grid
function renderCalendarGrid(posts, containerId = 'calendar-grid') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    let html = '<div class="calendar-header" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 8px;">';
    ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].forEach(d => {
        html += `<div style="text-align: center; font-weight: 600; padding: 8px; color: #666;">${d}</div>`;
    });
    html += '</div>';

    html += '<div class="calendar-body" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;">';

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        html += '<div style="min-height: 80px; background: #f9f9f9; border-radius: 8px;"></div>';
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayPosts = posts.filter(p => {
            const postDate = new Date(p.scheduled_at || p.published_at || p.created_at);
            return postDate.toISOString().startsWith(dateStr);
        });

        const isToday = day === now.getDate();

        html += `
            <div style="min-height: 80px; background: ${isToday ? '#E0F2F1' : '#fff'}; border: 1px solid ${isToday ? '#006A60' : '#eee'}; border-radius: 8px; padding: 8px; overflow: hidden;">
                <div style="font-weight: ${isToday ? '700' : '500'}; color: ${isToday ? '#006A60' : '#333'}; margin-bottom: 4px;">${day}</div>
                ${dayPosts.slice(0, 2).map(p => `
                    <div style="font-size: 11px; padding: 2px 6px; margin-top: 2px; border-radius: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; background: ${PLATFORMS[p.platform]?.color || '#888'}; color: white;">
                        ${p.title.slice(0, 15)}${p.title.length > 15 ? '...' : ''}
                    </div>
                `).join('')}
                ${dayPosts.length > 2 ? `<div style="font-size: 10px; color: #888; margin-top: 2px;">+${dayPosts.length - 2} more</div>` : ''}
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

// Render scheduled posts list
function renderPostsList(posts, containerId = 'posts-list') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const scheduledPosts = posts.filter(p => p.status === 'scheduled' || p.status === 'draft')
        .sort((a, b) => new Date(a.scheduled_at || a.created_at) - new Date(b.scheduled_at || b.created_at));

    container.innerHTML = scheduledPosts.map(p => `
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #fff; border-radius: 12px; margin-bottom: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div style="width: 40px; height: 40px; border-radius: 8px; background: ${PLATFORMS[p.platform]?.color || '#888'}; color: white; display: flex; align-items: center; justify-content: center;">
                <span class="material-symbols-outlined" style="font-size: 20px;">${PLATFORMS[p.platform]?.icon || 'article'}</span>
            </div>
            <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.title}</div>
                <div style="font-size: 12px; color: #888;">
                    ${PLATFORMS[p.platform]?.name} • ${p.scheduled_at ? new Date(p.scheduled_at).toLocaleDateString('vi-VN') : 'Chưa lên lịch'}
                </div>
            </div>
            <span style="padding: 4px 12px; border-radius: 999px; font-size: 12px; background: ${STATUS_COLORS[p.status]?.bg}; color: ${STATUS_COLORS[p.status]?.color};">
                ${p.status}
            </span>
        </div>
    `).join('');
}

// Bind stats
async function bindContentStats() {
    const { stats } = await loadContentData();

    const bindings = {
        'stat-total-posts': stats.total,
        'stat-draft': stats.draft,
        'stat-scheduled': stats.scheduled,
        'stat-published': stats.published
    };

    Object.entries(bindings).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });

    return stats;
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    const { posts, stats } = await loadContentData();

    renderCalendarGrid(posts);
    renderPostsList(posts);
    await bindContentStats();
});

export { loadContentData, renderCalendarGrid, renderPostsList, bindContentStats, PLATFORMS, STATUS_COLORS };

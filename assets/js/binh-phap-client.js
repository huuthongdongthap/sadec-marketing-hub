/**
 * ==============================================
 * MEKONG AGENCY - BINH PHAP CLIENT
 * Supabase Live Data for Strategic Intelligence
 * ==============================================
 */

import { strategic, seo, utils } from './supabase.js';

// Load strategic data
async function loadStrategicData() {
    try {
        const [competitorsResult, notesResult, seoResult] = await Promise.all([
            strategic.getCompetitors(),
            strategic.getNotes(),
            seo.getKeywords()
        ]);

        return {
            competitors: competitorsResult.data || [],
            notes: notesResult.data || [],
            keywords: seoResult.data || [],
            stats: {
                competitorCount: competitorsResult.data?.length || 0,
                notesCount: notesResult.data?.length || 0,
                keywordCount: seoResult.data?.length || 0,
                criticalNotes: notesResult.data?.filter(n => n.priority === 'high' || n.priority === 'critical').length || 0
            }
        };
    } catch (error) {
        console.error('Strategic data error:', error);
        return getDemoStrategicData();
    }
}

function getDemoStrategicData() {
    return {
        competitors: [
            { name: 'Agency X', website: 'agencyx.vn', market_position: 'budget', strengths: 'Giá rẻ', weaknesses: 'Chất lượng thấp' },
            { name: 'Saigon Digital', website: 'saigondigital.vn', market_position: 'premium', strengths: 'Chuyên nghiệp', weaknesses: 'Giá cao' }
        ],
        notes: [
            { title: 'Chiến lược Q1', category: 'binh_phap', priority: 'high' },
            { title: 'Kịch bản Crisis', category: 'crisis', priority: 'medium' }
        ],
        keywords: [
            { keyword: 'marketing sa đéc', search_volume: 320, current_rank: 5, target_rank: 1 },
            { keyword: 'quảng cáo đồng tháp', search_volume: 480, current_rank: 8, target_rank: 3 }
        ],
        stats: { competitorCount: 2, notesCount: 2, keywordCount: 2, criticalNotes: 1 }
    };
}

// Render competitor table
function renderCompetitorTable(competitors, containerId = 'competitor-table') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const positionColors = {
        budget: '#FFF3CD',
        'mid-market': '#CCE5FF',
        premium: '#D4EDDA'
    };

    container.innerHTML = competitors.map(c => `
        <tr>
            <td style="font-weight: 500;">${c.name}</td>
            <td><a href="https://${c.website}" target="_blank" style="color: #006A60;">${c.website}</a></td>
            <td><span style="padding: 4px 12px; border-radius: 999px; font-size: 12px; background: ${positionColors[c.market_position] || '#eee'};">${c.market_position}</span></td>
            <td style="color: #155724;">${c.strengths || '-'}</td>
            <td style="color: #721C24;">${c.weaknesses || '-'}</td>
        </tr>
    `).join('');
}

// Render SEO keywords
function renderKeywordsTable(keywords, containerId = 'seo-keywords') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = keywords.map(k => {
        const rankDiff = (k.current_rank || 99) - (k.target_rank || 10);
        const rankColor = rankDiff <= 0 ? '#155724' : rankDiff <= 5 ? '#856404' : '#721C24';

        return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #fff; border-radius: 8px; margin-bottom: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div>
                <div style="font-weight: 500;">${k.keyword}</div>
                <div style="font-size: 12px; color: #888;">Volume: ${k.search_volume?.toLocaleString() || 'N/A'}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 24px; font-weight: 700; color: ${rankColor};">#${k.current_rank || '-'}</div>
                <div style="font-size: 12px; color: #888;">Target: #${k.target_rank || 10}</div>
            </div>
        </div>
    `}).join('');
}

// Render strategic notes
function renderStrategicNotes(notes, containerId = 'strategic-notes') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const categoryIcons = {
        binh_phap: '⚔️',
        intel: '🔍',
        crisis: '⚠️',
        opportunity: '💎'
    };

    const priorityColors = {
        low: '#6b7280',
        medium: '#3b82f6',
        high: '#f59e0b',
        critical: '#ef4444'
    };

    container.innerHTML = notes.map(n => `
        <div style="padding: 16px; background: #fff; border-left: 4px solid ${priorityColors[n.priority] || '#ccc'}; border-radius: 8px; margin-bottom: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <span style="font-size: 18px;">${categoryIcons[n.category] || '📌'}</span>
                    <strong style="margin-left: 8px;">${n.title}</strong>
                </div>
                <span style="padding: 2px 8px; border-radius: 4px; font-size: 11px; background: ${priorityColors[n.priority]}20; color: ${priorityColors[n.priority]};">${n.priority}</span>
            </div>
            ${n.content ? `<p style="margin: 8px 0 0; font-size: 14px; color: #666;">${n.content}</p>` : ''}
        </div>
    `).join('');
}

// Bind stats
async function bindStrategicStats() {
    const { stats } = await loadStrategicData();

    const bindings = {
        'stat-competitors': stats.competitorCount,
        'stat-notes': stats.notesCount,
        'stat-keywords': stats.keywordCount,
        'stat-critical': stats.criticalNotes
    };

    Object.entries(bindings).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });

    return stats;
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    const data = await loadStrategicData();

    renderCompetitorTable(data.competitors);
    renderKeywordsTable(data.keywords);
    renderStrategicNotes(data.notes);
    await bindStrategicStats();

    console.log('✅ Binh Phap dashboard loaded');
});

export { loadStrategicData, renderCompetitorTable, renderKeywordsTable, renderStrategicNotes, bindStrategicStats };

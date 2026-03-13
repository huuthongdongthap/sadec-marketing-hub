/**
 * ==============================================
 * MEKONG AGENCY - BINH PHAP CLIENT (Refactored)
 * Supabase Live Data for Strategic Intelligence
 * @version 2.0.0 | 2026-03-13
 * ==============================================
 */

import { ApiClientBase, onReady, renderTable, renderList } from '../shared/api-client.js';
import { strategic, seo } from '../supabase.js';

/**
 * Binh Phap (Strategic Intelligence) API Client
 */
class BinhPhapClient extends ApiClientBase {
  constructor() {
    super({
      moduleName: 'BinhPhap',
      supabase: { strategic, seo },
      demoDataFn: getDemoStrategicData
    });
  }

  /**
   * Load strategic data
   * @returns {Promise<Object>} Strategic data
   */
  async loadStrategicData() {
    return this.load('strategic', async () => {
      const [competitorsResult, notesResult, seoResult] = await Promise.all([
        this.supabase.strategic.getCompetitors(),
        this.supabase.strategic.getNotes(),
        this.supabase.seo.getKeywords()
      ]);

      return {
        competitors: competitorsResult.data || [],
        notes: notesResult.data || [],
        keywords: seoResult.data || [],
        stats: {
          competitorCount: competitorsResult.data?.length || 0,
          notesCount: notesResult.data?.length || 0,
          keywordCount: seoResult.data?.length || 0,
          criticalNotes: notesResult.data?.filter(n =>
            n.priority === 'high' || n.priority === 'critical'
          ).length || 0
        }
      };
    });
  }

  /**
   * Render competitor table
   * @param {Array} competitors - Competitors array
   * @param {string} containerId - Container ID
   */
  renderCompetitorTable(competitors, containerId = 'competitor-table') {
    const positionColors = {
      budget: { bg: '#FFF3CD', color: '#856404' },
      'mid-market': { bg: '#CCE5FF', color: '#004085' },
      premium: { bg: '#D4EDDA', color: '#155724' }
    };

    renderTable(competitors, (c) => `
      <tr>
        <td style="font-weight: 500;">${c.name}</td>
        <td>
          <a href="https://${c.website}" target="_blank" style="color: #006A60;">
            ${c.website}
          </a>
        </td>
        <td>
          <span style="padding: 4px 12px; border-radius: 999px; font-size: 12px; background: ${positionColors[c.market_position]?.bg || '#eee'}; color: ${positionColors[c.market_position]?.color || '#333'};">
            ${c.market_position}
          </span>
        </td>
        <td style="color: #155724;">${c.strengths || '-'}</td>
        <td style="color: #721C24;">${c.weaknesses || '-'}</td>
      </tr>
    `, containerId);
  }

  /**
   * Render SEO keywords table
   * @param {Array} keywords - Keywords array
   * @param {string} containerId - Container ID
   */
  renderKeywordsTable(keywords, containerId = 'seo-keywords') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!keywords || keywords.length === 0) {
      container.innerHTML = '<div class="text-muted">No keywords</div>';
      return;
    }

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
            <div style="font-size: 24px; font-weight: 700; color: ${rankColor};">
              #${k.current_rank || '-'}
            </div>
            <div style="font-size: 12px; color: #888;">Target: #${k.target_rank || 10}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Render strategic notes
   * @param {Array} notes - Notes array
   * @param {string} containerId - Container ID
   */
  renderStrategicNotes(notes, containerId = 'strategic-notes') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!notes || notes.length === 0) {
      container.innerHTML = '<div class="text-muted">No strategic notes</div>';
      return;
    }

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

    renderList(notes, (n) => `
      <div style="padding: 16px; background: #fff; border-left: 4px solid ${priorityColors[n.priority] || '#ccc'}; border-radius: 8px; margin-bottom: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <span style="font-size: 18px;">${categoryIcons[n.category] || '📌'}</span>
            <strong style="margin-left: 8px;">${n.title}</strong>
          </div>
          <span style="padding: 2px 8px; border-radius: 4px; font-size: 11px; background: ${priorityColors[n.priority]}20; color: ${priorityColors[n.priority]};">
            ${n.priority}
          </span>
        </div>
        ${n.content ? `<p style="margin: 8px 0 0; font-size: 14px; color: #666;">${n.content}</p>` : ''}
      </div>
    `, containerId);
  }

  /**
   * Bind strategic stats to dashboard
   * @returns {Promise<Object>} Strategic stats
   */
  async bindStrategicStats() {
    const { stats } = await this.loadStrategicData();

    this.bind({
      'stat-competitors': stats.competitorCount,
      'stat-notes': stats.notesCount,
      'stat-keywords': stats.keywordCount,
      'stat-critical': stats.criticalNotes
    });

    return stats;
  }
}

/**
 * Demo strategic data fallback
 * @returns {Object} Demo data
 */
function getDemoStrategicData() {
  return {
    competitors: [
      {
        name: 'Agency X',
        website: 'agencyx.vn',
        market_position: 'budget',
        strengths: 'Giá rẻ',
        weaknesses: 'Chất lượng thấp'
      },
      {
        name: 'Saigon Digital',
        website: 'saigondigital.vn',
        market_position: 'premium',
        strengths: 'Chuyên nghiệp',
        weaknesses: 'Giá cao'
      }
    ],
    notes: [
      { title: 'Chiến lược Q1', category: 'binh_phap', priority: 'high' },
      { title: 'Kịch bản Crisis', category: 'crisis', priority: 'medium' }
    ],
    keywords: [
      { keyword: 'marketing sa đéc', search_volume: 320, current_rank: 5, target_rank: 1 },
      { keyword: 'quảng cáo đồng tháp', search_volume: 480, current_rank: 8, target_rank: 3 }
    ],
    stats: {
      competitorCount: 2,
      notesCount: 2,
      keywordCount: 2,
      criticalNotes: 1
    }
  };
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Create singleton instance
const binhPhapClient = new BinhPhapClient();

// Auto-initialize on DOM ready
onReady(async () => {
  const data = await binhPhapClient.loadStrategicData();

  binhPhapClient.renderCompetitorTable(data.competitors);
  binhPhapClient.renderKeywordsTable(data.keywords);
  binhPhapClient.renderStrategicNotes(data.notes);
  await binhPhapClient.bindStrategicStats();
});

// Export for external use
export { binhPhapClient, BinhPhapClient };

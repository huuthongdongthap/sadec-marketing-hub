/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PIPELINE CLIENT - Sales Pipeline API Client
 * Sa Đéc Marketing Hub - CRM Pipeline Management
 * ═══════════════════════════════════════════════════════════════════════════
 */

const PipelineClient = {
    config: {
        baseUrl: '/functions/v1/pipeline',
        timeout: 30000
    },

    init() {
        // Silent initialization
    },

    async getPipelines() {
        return [];
    },

    async getPipeline(id) {
        return null;
    },

    async getDeals() {
        return [];
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PipelineClient.init());
} else {
    PipelineClient.init();
}

export { PipelineClient };
export default PipelineClient;

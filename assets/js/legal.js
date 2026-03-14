/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LEGAL - Legal Module
 * Sa Đéc Marketing Hub - Legal Document Management
 * ═══════════════════════════════════════════════════════════════════════════
 */

const Legal = {
    config: {
        baseUrl: '/functions/v1/legal',
        timeout: 30000
    },

    init() {
        // Silent initialization
    },

    async getDocuments() {
        return [];
    },

    async getDocument(id) {
        return null;
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Legal.init());
} else {
    Legal.init();
}

export { Legal };
export default Legal;

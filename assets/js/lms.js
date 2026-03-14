/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LMS - Learning Management System
 * Sa Đéc Marketing Hub - LMS Module
 * ═══════════════════════════════════════════════════════════════════════════
 */

const LMS = {
    config: {
        baseUrl: '/functions/v1/lms',
        timeout: 30000
    },

    init() {
        console.log('[LMS] Initialized');
    },

    async getCourses() {
        console.log('[LMS] Getting courses...');
        return [];
    },

    async getCourse(id) {
        console.log('[LMS] Getting course:', id);
        return null;
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LMS.init());
} else {
    LMS.init();
}

export { LMS };
export default LMS;

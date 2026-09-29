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
        // Silent initialization
    },

    async getCourses() {
        return [];
    },

    async getCourse(id) {
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

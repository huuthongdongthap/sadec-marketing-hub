/**
 * Portal Route Guard
 * Redirects unauthenticated users to login page.
 * Skip guard on localhost for demo mode.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = window.__ENV__?.SUPABASE_URL || 'https://pzcgvfhppglzfjavxuid.supabase.co';
const SUPABASE_ANON = window.__ENV__?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6Y2d2ZmhwcglsemZqYXZ4dWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc3MDkwMDEsImV4cCI6MjA1MzI4NTAwMX0.sFSNOkFGYBbOFHABLFq-0J5RLWWH7icISppbsJBgMOk';

const isLocalhost = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);

// Skip guard entirely on localhost for demo mode
if (!isLocalhost) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (!user || error) {
            const redirect = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.replace(`/portal/login.html?redirect=${redirect}`);
        }

        // Listen for sign-out events
        supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') {
                window.location.replace('/portal/login.html');
            }
        });

        // Export user info for other scripts
        window.__PORTAL_USER__ = user;

    } catch (e) {
        console.warn('Portal guard error:', e);
        // Don't block page on guard errors — graceful degradation
    }
}

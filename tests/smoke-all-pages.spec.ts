import { test, expect } from '@playwright/test';

/**
 * Smoke Test — All Pages Load Successfully
 * Tests every HTML page in the project for:
 * 1. HTTP 200 response
 * 2. Has a <title> tag
 * 3. No uncaught JS errors
 */

const ALL_PAGES = [
  // Root public pages
  { path: '/', name: 'Homepage' },
  { path: '/login.html', name: 'Login' },
  { path: '/register.html', name: 'Register' },
  { path: '/terms.html', name: 'Terms' },
  { path: '/privacy.html', name: 'Privacy' },
  { path: '/forgot-password.html', name: 'Forgot Password' },
  { path: '/verify-email.html', name: 'Verify Email' },
  { path: '/offline.html', name: 'Offline' },

  // Auth
  { path: '/auth/login.html', name: 'Auth Login' },

  // Admin Portal
  { path: '/admin/dashboard.html', name: 'Admin Dashboard' },
  { path: '/admin/agents.html', name: 'Admin Agents' },
  { path: '/admin/ai-analysis.html', name: 'Admin AI Analysis' },
  { path: '/admin/api-builder.html', name: 'Admin API Builder' },
  { path: '/admin/approvals.html', name: 'Admin Approvals' },
  { path: '/admin/auth.html', name: 'Admin Auth' },
  { path: '/admin/binh-phap.html', name: 'Admin Binh Phap' },
  { path: '/admin/brand-guide.html', name: 'Admin Brand Guide' },
  { path: '/admin/campaigns.html', name: 'Admin Campaigns' },
  { path: '/admin/community.html', name: 'Admin Community' },
  { path: '/admin/content-calendar.html', name: 'Admin Content Calendar' },
  { path: '/admin/customer-success.html', name: 'Admin Customer Success' },
  { path: '/admin/deploy.html', name: 'Admin Deploy' },
  { path: '/admin/docs.html', name: 'Admin Docs' },
  { path: '/admin/ecommerce.html', name: 'Admin Ecommerce' },
  { path: '/admin/events.html', name: 'Admin Events' },
  { path: '/admin/finance.html', name: 'Admin Finance' },
  { path: '/admin/hr-hiring.html', name: 'Admin HR' },
  { path: '/admin/landing-builder.html', name: 'Admin Landing Builder' },
  { path: '/admin/leads.html', name: 'Admin Leads' },
  { path: '/admin/legal.html', name: 'Admin Legal' },
  { path: '/admin/lms.html', name: 'Admin LMS' },
  { path: '/admin/mvp-launch.html', name: 'Admin MVP Launch' },
  { path: '/admin/onboarding.html', name: 'Admin Onboarding' },
  { path: '/admin/payments.html', name: 'Admin Payments' },
  { path: '/admin/pipeline.html', name: 'Admin Pipeline' },
  { path: '/admin/pricing.html', name: 'Admin Pricing' },
  { path: '/admin/proposals.html', name: 'Admin Proposals' },
  { path: '/admin/retention.html', name: 'Admin Retention' },
  { path: '/admin/vc-readiness.html', name: 'Admin VC Readiness' },
  { path: '/admin/video-workflow.html', name: 'Admin Video Workflow' },
  { path: '/admin/workflows.html', name: 'Admin Workflows' },
  { path: '/admin/zalo.html', name: 'Admin Zalo' },

  // Client Portal
  { path: '/portal/dashboard.html', name: 'Portal Dashboard' },
  { path: '/portal/login.html', name: 'Portal Login' },
  { path: '/portal/approve.html', name: 'Portal Approve' },
  { path: '/portal/assets.html', name: 'Portal Assets' },
  { path: '/portal/invoices.html', name: 'Portal Invoices' },
  { path: '/portal/onboarding.html', name: 'Portal Onboarding' },
  { path: '/portal/payment-result.html', name: 'Portal Payment Result' },
  { path: '/portal/payments.html', name: 'Portal Payments' },
  { path: '/portal/projects.html', name: 'Portal Projects' },
  { path: '/portal/reports.html', name: 'Portal Reports' },
  { path: '/portal/subscriptions.html', name: 'Portal Subscriptions' },
  { path: '/portal/missions.html', name: 'Portal Missions (RaaS)' },
  { path: '/portal/credits.html', name: 'Portal Credits (RaaS)' },

  // Affiliate Portal
  { path: '/affiliate/dashboard.html', name: 'Affiliate Dashboard' },
  { path: '/affiliate/commissions.html', name: 'Affiliate Commissions' },
  { path: '/affiliate/links.html', name: 'Affiliate Links' },
  { path: '/affiliate/media.html', name: 'Affiliate Media' },
  { path: '/affiliate/profile.html', name: 'Affiliate Profile' },
  { path: '/affiliate/referrals.html', name: 'Affiliate Referrals' },
  { path: '/affiliate/settings.html', name: 'Affiliate Settings' },
];

test.describe('Smoke Test — All Pages', () => {
  for (const page of ALL_PAGES) {
    test(`${page.name} (${page.path}) loads successfully`, async ({ page: p }) => {
      const errors: string[] = [];

      // Capture JS errors
      p.on('pageerror', (error) => {
        // Ignore known benign errors
        if (error.message.includes('supabase') || error.message.includes('__ENV__')) return;
        errors.push(error.message);
      });

      const response = await p.goto(page.path, { waitUntil: 'domcontentloaded', timeout: 10000 });

      // 1. HTTP 200
      expect(response?.status()).toBe(200);

      // 2. Has a <title>
      const title = await p.title();
      expect(title.length).toBeGreaterThan(0);

      // 3. No critical JS errors
      expect(errors, `JS errors on ${page.path}: ${errors.join(', ')}`).toHaveLength(0);
    });
  }
});

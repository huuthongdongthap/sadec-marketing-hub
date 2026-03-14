/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESPONSIVE VIEWPORT TESTS - VITEST
 * Tests for 375px, 768px, 1024px breakpoints via CSS analysis
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import * as fs from 'fs';
import * as path from 'path';

// Read responsive CSS file
const responsiveCSSPath = path.join(__dirname, '../assets/css/responsive-fix-2026.css');
const responsiveCSS = fs.readFileSync(responsiveCSSPath, 'utf-8');

// Read responsive enhancements CSS
const responsiveEnhancementsPath = path.join(__dirname, '../assets/css/responsive-enhancements.css');
const responsiveEnhancementsCSS = fs.readFileSync(responsiveEnhancementsPath, 'utf-8');

describe('Responsive CSS Breakpoints', () => {
  it('has 1024px breakpoint', () => {
    const hasMaxWidth1024 = responsiveCSS.includes('@media (max-width: 1024px)');
    expect(hasMaxWidth1024).toBe(true);
  });

  it('has 768px breakpoint', () => {
    const hasMaxWidth768 = responsiveCSS.includes('@media (max-width: 768px)');
    expect(hasMaxWidth768).toBe(true);
  });

  it('has 375px breakpoint', () => {
    const hasMaxWidth375 = responsiveCSS.includes('@media (max-width: 375px)');
    expect(hasMaxWidth375).toBe(true);
  });

  it('has responsive enhancements CSS loaded', () => {
    const hasResponsiveEnhancements = responsiveEnhancementsCSS.includes('@media (max-width: 768px)');
    expect(hasResponsiveEnhancements).toBe(true);
  });
});

describe('Responsive Layout Rules', () => {
  it('has sidebar responsive styles', () => {
    const hasSidebarResponsive = responsiveCSS.includes('sadec-sidebar') &&
                                  responsiveCSS.includes('transform: translateX(-100%)');
    expect(hasSidebarResponsive).toBe(true);
  });

  it('has stats grid responsive styles', () => {
    const hasStatsGridResponsive = responsiveCSS.includes('.stats-grid') &&
                                    responsiveCSS.includes('grid-template-columns: repeat(2, 1fr)');
    expect(hasStatsGridResponsive).toBe(true);
  });

  it('has single column layout for mobile', () => {
    const hasSingleColumn = responsiveCSS.includes('grid-template-columns: 1fr');
    expect(hasSingleColumn).toBe(true);
  });

  it('has table responsive wrapper', () => {
    const hasTableResponsive = responsiveCSS.includes('.table-wrapper') &&
                                responsiveCSS.includes('overflow-x: auto');
    expect(hasTableResponsive).toBe(true);
  });
});

describe('Touch Target Sizes', () => {
  it('has touch target variables defined', () => {
    const hasTouchTargetVars = responsiveCSS.includes('--touch-target-small') &&
                                responsiveCSS.includes('--touch-target-normal') &&
                                responsiveCSS.includes('--touch-target-large');
    expect(hasTouchTargetVars).toBe(true);
  });

  it('has 40px touch target for small', () => {
    const hasSmallTouchTarget = responsiveCSS.includes('--touch-target-small: 40px');
    expect(hasSmallTouchTarget).toBe(true);
  });

  it('has 44px touch target for normal', () => {
    const hasNormalTouchTarget = responsiveCSS.includes('--touch-target-normal: 44px');
    expect(hasNormalTouchTarget).toBe(true);
  });

  it('has WCAG compliant button sizes', () => {
    const hasButtonSizes = responsiveCSS.includes('.btn') &&
                           responsiveEnhancementsCSS.includes('min-height: 44px');
    expect(hasButtonSizes).toBe(true);
  });
});

describe('Responsive Typography', () => {
  it('has responsive h1 styles', () => {
    const hasResponsiveH1 = responsiveCSS.includes('h1, .h1') &&
                            responsiveCSS.includes('font-size: 28px');
    expect(hasResponsiveH1).toBe(true);
  });

  it('has responsive h2 styles', () => {
    const hasResponsiveH2 = responsiveCSS.includes('h2, .h2') &&
                            responsiveCSS.includes('font-size: 24px');
    expect(hasResponsiveH2).toBe(true);
  });

  it('has page title responsive', () => {
    const hasResponsiveTitle = responsiveCSS.includes('.page-title') &&
                               responsiveCSS.includes('font-size: 24px');
    expect(hasResponsiveTitle).toBe(true);
  });
});

describe('Responsive Spacing', () => {
  it('has responsive spacing variables', () => {
    const hasSpacingVars = responsiveCSS.includes('--spacing-xs') &&
                           responsiveCSS.includes('--spacing-sm') &&
                           responsiveCSS.includes('--spacing-md') &&
                           responsiveCSS.includes('--spacing-lg') &&
                           responsiveCSS.includes('--spacing-xl');
    expect(hasSpacingVars).toBe(true);
  });

  it('has reduced spacing on mobile', () => {
    const hasMobileSpacing = responsiveCSS.includes('padding: var(--spacing-md)') ||
                             responsiveCSS.includes('padding: var(--spacing-sm)');
    expect(hasMobileSpacing).toBe(true);
  });
});

describe('Modal Responsive', () => {
  it('has modal full width on mobile', () => {
    const hasModalResponsive = responsiveCSS.includes('.modal-content') &&
                               responsiveCSS.includes('width: calc(100% -');
    expect(hasModalResponsive).toBe(true);
  });

  it('has modal footer column on mobile', () => {
    const hasModalFooterColumn = responsiveCSS.includes('flex-direction: column-reverse');
    expect(hasModalFooterColumn).toBe(true);
  });

  it('has full width buttons in modal', () => {
    const hasFullWidthButtons = responsiveCSS.includes('.modal-footer .btn') &&
                                responsiveCSS.includes('width: 100%');
    expect(hasFullWidthButtons).toBe(true);
  });
});

describe('Card Responsive', () => {
  it('has card grid responsive', () => {
    const hasCardGridResponsive = responsiveCSS.includes('.card-grid') &&
                                  (responsiveCSS.includes('grid-template-columns: repeat(2, 1fr)') ||
                                   responsiveCSS.includes('grid-template-columns: 1fr'));
    expect(hasCardGridResponsive).toBe(true);
  });

  it('has card padding responsive', () => {
    const hasCardPaddingResponsive = responsiveCSS.includes('.card,') &&
                                     responsiveCSS.includes('padding: var(--spacing-lg)');
    expect(hasCardPaddingResponsive).toBe(true);
  });
});

describe('Form Responsive', () => {
  it('has form inputs touch friendly', () => {
    const hasFormInputsTouch = responsiveCSS.includes('input[type="text"]') &&
                               responsiveCSS.includes('min-height: var(--touch-target-normal)');
    expect(hasFormInputsTouch).toBe(true);
  });

  it('has form actions stacked on mobile', () => {
    const hasFormActionsStacked = responsiveCSS.includes('.form-actions') &&
                                  responsiveCSS.includes('flex-direction: column');
    expect(hasFormActionsStacked).toBe(true);
  });

  it('has full width form buttons on mobile', () => {
    const hasFullWidthFormButtons = responsiveCSS.includes('.form-actions .btn') &&
                                    responsiveCSS.includes('width: 100%');
    expect(hasFullWidthFormButtons).toBe(true);
  });
});

describe('Tabs Responsive', () => {
  it('has scrollable tabs on mobile', () => {
    const hasScrollableTabs = responsiveCSS.includes('.tabs') &&
                              responsiveCSS.includes('overflow-x: auto');
    expect(hasScrollableTabs).toBe(true);
  });

  it('has nowrap tab labels', () => {
    const hasNowrapTabs = responsiveCSS.includes('white-space: nowrap');
    expect(hasNowrapTabs).toBe(true);
  });
});

describe('Animation Responsive', () => {
  it('has reduced motion support', () => {
    const hasReducedMotion = responsiveCSS.includes('@media (prefers-reduced-motion: reduce)');
    expect(hasReducedMotion).toBe(true);
  });
});

describe('Portal Specific Responsive', () => {
  it('has portal responsive fixes', () => {
    const hasPortalResponsive = responsiveCSS.includes('/* ============================================================================') &&
                                responsiveCSS.includes('PORTAL SPECIFIC FIXES');
    expect(hasPortalResponsive).toBe(true);
  });

  it('has invoice table responsive', () => {
    const hasInvoiceResponsive = responsiveCSS.includes('.invoice-table') &&
                                 responsiveCSS.includes('padding: var(--spacing-sm)');
    expect(hasInvoiceResponsive).toBe(true);
  });

  it('has payment cards responsive', () => {
    const hasPaymentCardsResponsive = responsiveCSS.includes('.payment-card') &&
                                      responsiveCSS.includes('padding: var(--spacing-lg)');
    expect(hasPaymentCardsResponsive).toBe(true);
  });
});

describe('Admin Specific Responsive', () => {
  it('has admin widget responsive', () => {
    const hasAdminWidgetResponsive = responsiveCSS.includes('.widget-grid') &&
                                     responsiveCSS.includes('grid-template-columns: 1fr');
    expect(hasAdminWidgetResponsive).toBe(true);
  });

  it('has campaign card responsive', () => {
    const hasCampaignCardResponsive = responsiveCSS.includes('.campaign-card') &&
                                      responsiveCSS.includes('padding: var(--spacing-lg)');
    expect(hasCampaignCardResponsive).toBe(true);
  });

  it('has leads table responsive', () => {
    const hasLeadsTableResponsive = responsiveCSS.includes('.leads-table') &&
                                    responsiveCSS.includes('padding: var(--spacing-sm)');
    expect(hasLeadsTableResponsive).toBe(true);
  });
});

describe('Utility Classes Responsive', () => {
  it('has hide/show utilities', () => {
    const hasHideShowUtilities = responsiveCSS.includes('.hide-mobile') &&
                                 responsiveCSS.includes('.show-mobile');
    expect(hasHideShowUtilities).toBe(true);
  });

  it('has hide-mobile-small utility', () => {
    const hasHideMobileSmall = responsiveCSS.includes('.hide-mobile-small');
    expect(hasHideMobileSmall).toBe(true);
  });

  it('has responsive text utility', () => {
    const hasResponsiveText = responsiveCSS.includes('.text-small');
    expect(hasResponsiveText).toBe(true);
  });

  it('has responsive padding utility', () => {
    const hasResponsivePadding = responsiveCSS.includes('.responsive-padding');
    expect(hasResponsivePadding).toBe(true);
  });

  it('has mobile full width utility', () => {
    const hasMobileFullWidth = responsiveCSS.includes('.mobile-full');
    expect(hasMobileFullWidth).toBe(true);
  });
});

describe('CSS Coverage', () => {
  it('responsive-fix-2026.css has substantial content', () => {
    const lineCount = responsiveCSS.split('\n').length;
    expect(lineCount).toBeGreaterThan(500);
  });

  it('responsive-enhancements.css has substantial content', () => {
    const lineCount = responsiveEnhancementsCSS.split('\n').length;
    expect(lineCount).toBeGreaterThan(300);
  });

  it('has print styles', () => {
    const hasPrintStyles = responsiveCSS.includes('@media print');
    expect(hasPrintStyles).toBe(true);
  });
});

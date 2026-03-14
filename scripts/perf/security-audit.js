#!/usr/bin/env node
/**
 * Sa Đéc Marketing Hub - Security Headers Audit
 * Audit CSP, CORS, XSS protection headers
 *
 * Usage: node scripts/perf/security-audit.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../..');
const ADMIN_DIR = path.join(ROOT_DIR, 'admin');

// Security headers to check
const securityHeaders = {
  'Content-Security-Policy': {
    name: 'CSP',
    description: 'Content Security Policy - Prevents XSS attacks',
    recommended: "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://supabase.co",
    severity: 'HIGH'
  },
  'X-Content-Type-Options': {
    name: 'MIME Sniffing',
    description: 'Prevents MIME type sniffing',
    recommended: 'nosniff',
    severity: 'MEDIUM'
  },
  'X-Frame-Options': {
    name: 'Clickjacking',
    description: 'Prevents clickjacking attacks',
    recommended: 'SAMEORIGIN',
    severity: 'MEDIUM'
  },
  'X-XSS-Protection': {
    name: 'XSS Filter',
    description: 'Legacy XSS filter (modern browsers use CSP)',
    recommended: '1; mode=block',
    severity: 'LOW'
  },
  'Referrer-Policy': {
    name: 'Referrer Policy',
    description: 'Controls referrer information',
    recommended: 'strict-origin-when-cross-origin',
    severity: 'MEDIUM'
  },
  'Permissions-Policy': {
    name: 'Permissions Policy',
    description: 'Controls browser features',
    recommended: 'geolocation=(), microphone=(), camera=()',
    severity: 'MEDIUM'
  },
  'Strict-Transport-Security': {
    name: 'HSTS',
    description: 'Forces HTTPS connections',
    recommended: 'max-age=31536000; includeSubDomains',
    severity: 'HIGH'
  },
  'Cross-Origin-Embedder-Policy': {
    name: 'COEP',
    description: 'Cross-Origin Embedder Policy',
    recommended: 'require-corp',
    severity: 'MEDIUM'
  },
  'Cross-Origin-Opener-Policy': {
    name: 'COOP',
    description: 'Cross-Origin Opener Policy',
    recommended: 'same-origin',
    severity: 'MEDIUM'
  },
  'Cross-Origin-Resource-Policy': {
    name: 'CORP',
    description: 'Cross-Origin Resource Policy',
    recommended: 'same-site',
    severity: 'MEDIUM'
  }
};

// CORS configuration to check
const corsConfig = {
  'Access-Control-Allow-Origin': {
    description: 'CORS origin policy',
    recommended: 'https://sadec-marketing-hub.com (specific origin, not *)'
  },
  'Access-Control-Allow-Methods': {
    description: 'Allowed HTTP methods',
    recommended: 'GET, POST, PUT, DELETE, OPTIONS'
  },
  'Access-Control-Allow-Headers': {
    description: 'Allowed request headers',
    recommended: 'Content-Type, Authorization, X-Requested-With'
  }
};

/**
 * Check .htaccess for security headers
 */
function checkHtaccessSecurity() {
  const htaccessPath = path.join(ADMIN_DIR, '.htaccess');
  const content = fs.readFileSync(htaccessPath, 'utf8');

  console.log('🔒 SECURITY HEADERS AUDIT\n');
  console.log('File: admin/.htaccess\n');
  console.log('═══════════════════════════════════════════\n');

  const found = [];
  const missing = [];
  const weak = [];

  for (const [header, config] of Object.entries(securityHeaders)) {
    const regex = new RegExp(`Header\\s+(?:set|append|add)\\s+${header.replace('-', '[-]')}`, 'i');
    if (regex.test(content)) {
      found.push({ header, ...config });
      console.log(`   ✅ ${config.name} (${header})`);
      console.log(`      ${config.description}`);
    } else {
      missing.push({ header, ...config });
      console.log(`   ❌ ${config.name} (${header}) - MISSING`);
      console.log(`      Severity: ${config.severity}`);
    }
    console.log();
  }

  console.log('═══════════════════════════════════════════\n');
  console.log('📋 CORS CONFIGURATION\n');

  for (const [header, config] of Object.entries(corsConfig)) {
    const regex = new RegExp(`${header.replace('-', '[-]')}`, 'i');
    if (regex.test(content)) {
      console.log(`   ✅ ${header}`);
    } else {
      console.log(`   ⚠️  ${header} - Not explicitly set`);
    }
  }

  console.log('\n═══════════════════════════════════════════');
  console.log(`\n📊 SUMMARY`);
  console.log(`   Found: ${found.length}/${Object.keys(securityHeaders).length}`);
  console.log(`   Missing: ${missing.length}/${Object.keys(securityHeaders).length}`);
  console.log(`   High Severity Missing: ${missing.filter(h => h.severity === 'HIGH').length}`);
  console.log('\n═══════════════════════════════════════════\n');

  return { found, missing, weak };
}

/**
 * Generate recommended CSP
 */
function generateRecommendedCSP() {
  console.log('📝 RECOMMENDED CONTENT SECURITY POLICY\n');
  console.log('Add this to your .htaccess file:\n');
  console.log('───────────────────────────────────────\n');

  const csp = `Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data: https: blob:; connect-src 'self' https://supabase.co https://api.supabase.co; frame-ancestors 'self'; base-uri 'self'; form-action 'self'"`;

  console.log(csp);
  console.log('\n');
}

/**
 * Generate security fix recommendations
 */
function generateSecurityFixes(missing) {
  const fixes = [];

  if (missing.some(h => h.header === 'Content-Security-Policy')) {
    fixes.push(`
# Content Security Policy - XSS Protection
Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data: https: blob:; connect-src 'self' https://supabase.co https://api.supabase.co; frame-ancestors 'self'; base-uri 'self'; form-action 'self'"
`);
  }

  if (missing.some(h => h.header === 'Permissions-Policy')) {
    fixes.push(`
# Permissions Policy - Browser Feature Control
Header set Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"
`);
  }

  if (missing.some(h => h.header === 'Strict-Transport-Security')) {
    fixes.push(`
# HSTS - Force HTTPS
Header set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
`);
  }

  if (missing.some(h => h.header === 'Cross-Origin-Embedder-Policy') ||
      missing.some(h => h.header === 'Cross-Origin-Opener-Policy') ||
      missing.some(h => h.header === 'Cross-Origin-Resource-Policy')) {
    fixes.push(`
# Cross-Origin Policies
Header set Cross-Origin-Embedder-Policy "require-corp"
Header set Cross-Origin-Opener-Policy "same-origin"
Header set Cross-Origin-Resource-Policy "same-site"
`);
  }

  // CORS improvements
  fixes.push(`
# CORS - Restrict to specific origin (replace * with your domain)
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "https://sadec-marketing-hub.com"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, X-CSRF-Token"
    Header set Access-Control-Allow-Credentials "true"
    Header set Access-Control-Max-Age "86400"
</IfModule>
`);

  return fixes;
}

/**
 * Main audit function
 */
function securityAudit() {
  const { found, missing } = checkHtaccessSecurity();
  generateRecommendedCSP();

  console.log('🔧 RECOMMENDED FIXES\n');
  console.log('Add these security headers to your .htaccess:\n');
  console.log('───────────────────────────────────────\n');

  const fixes = generateSecurityFixes(missing);
  fixes.forEach((fix, i) => {
    console.log(`${i + 1}.${fix}`);
  });

  // Save report
  const reportDir = path.join(ROOT_DIR, 'reports', 'security');
  fs.mkdirSync(reportDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(reportDir, `security-audit-${timestamp}.md`);

  const report = `# Security Headers Audit Report
Generated: ${new Date().toISOString()}

## Summary
- Found: ${found.length}
- Missing: ${missing.length}
- High Severity Missing: ${missing.filter(h => h.severity === 'HIGH').length}

## Missing Headers
${missing.map(h => `- ${h.header} (${h.name}) - ${h.description}`).join('\n')}

## Recommendations
${generateSecurityFixes(missing).join('\n---\n')}
`;

  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 Full report saved to: ${reportPath}\n`);
}

// Run audit
securityAudit();

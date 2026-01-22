const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
  'login.html',
  'register.html',
  'forgot-password.html',
  'verify-email.html',
  'portal/dashboard.html',
  'portal/projects.html',
  'portal/invoices.html',
  'portal/login.html',
  'admin/dashboard.html',
  'admin/leads.html',
  'admin/campaigns.html',
  'admin/pipeline.html',
  'admin/finance.html',
  'admin/content-calendar.html',
  'admin/ai-analysis.html'
];

function auditFile(filePath) {
  try {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
        console.log(`Skipping ${filePath} (not found)`);
        return null;
    }
    const html = fs.readFileSync(absolutePath, 'utf8');

    const report = {
      file: filePath,
      meta: {
        hasTitle: /<title>[\s\S]*?<\/title>/i.test(html) && !/<title>\s*<\/title>/i.test(html),
        hasDescription: /<meta\s+name=["']description["']/i.test(html),
        hasOgTitle: /<meta\s+property=["']og:title["']/i.test(html),
        hasOgDescription: /<meta\s+property=["']og:description["']/i.test(html),
        hasOgImage: /<meta\s+property=["']og:image["']/i.test(html),
        hasCanonical: /<link\s+rel=["']canonical["']/i.test(html)
      },
      headings: {
        h1Count: (html.match(/<h1/gi) || []).length,
        structure: []
      },
      accessibility: {
        imagesWithoutAlt: [],
        inputsWithoutLabel: []
      },
      structuredData: {
          hasJsonLd: /<script\s+type=["']application\/ld\+json["']/i.test(html)
      }
    };

    // Check heading hierarchy (Simple check)
    // Note: Regex is not perfect for hierarchy but good enough for audit existence
    const headings = [];
    const hRegex = /<(h[1-6])[^>]*>(.*?)<\/\1>/gi;
    let match;
    while ((match = hRegex.exec(html)) !== null) {
        headings.push({ tag: match[1], text: match[2], index: match.index });
    }

    let lastLevel = 0;
    headings.forEach(h => {
        const level = parseInt(h.tag.substring(1));
        if (level > lastLevel + 1 && lastLevel !== 0) {
            report.headings.structure.push(`Skipped heading level: H${lastLevel} to H${level}`);
        }
        lastLevel = level;
    });

    // Check images without alt (Basic regex)
    // Matches <img ... > and checks if alt= is missing or empty
    const imgRegex = /<img([^>]*)>/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(html)) !== null) {
        const attrs = imgMatch[1];
        if (!/alt=["']([^"']+)["']/i.test(attrs) || /alt=["']\s*["']/i.test(attrs)) {
            // Check if it's not explicitly empty alt="" (decorative) which is valid, but we want to know
             if (!/alt=["']["']/.test(attrs)) {
                 report.accessibility.imagesWithoutAlt.push(`Image tag at index ${imgMatch.index}`);
             }
        }
    }

    // Check inputs without label (Very basic heuristic)
    const inputRegex = /<input([^>]*)>/gi;
    let inputMatch;
    while ((inputMatch = inputRegex.exec(html)) !== null) {
        const attrs = inputMatch[1];
        if (/type=["'](hidden|submit|button|image)["']/i.test(attrs)) continue;

        const hasId = /id=["']([^"']+)["']/i.test(attrs);
        const hasAriaLabel = /aria-label=["']/.test(attrs);
        const hasAriaLabelledBy = /aria-labelledby=["']/.test(attrs);
        const hasTitle = /title=["']/.test(attrs);

        if (!hasAriaLabel && !hasAriaLabelledBy && !hasTitle) {
             // We can't easily check for <label for="id"> with regex across file easily
             // So we'll just flag it if it lacks ID (cant be labelled) or inline accessibility
             if (!hasId) {
                  report.accessibility.inputsWithoutLabel.push(`Input without ID or aria-label at index ${inputMatch.index}`);
             }
        }
    }

    return report;

  } catch (err) {
    console.error(`Error auditing ${filePath}:`, err.message);
    return null;
  }
}

async function runAudit() {
  const results = [];
  for (const file of files) {
    const result = auditFile(file);
    if (result) results.push(result);
  }

  console.log(JSON.stringify(results, null, 2));
}

runAudit();

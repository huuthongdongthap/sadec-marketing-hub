#!/usr/bin/env node

/**
 * Sa Đéc Marketing Hub - Comprehensive Audit Script
 * Quét broken links, meta tags, và accessibility issues
 *
 * Usage: node scripts/audit-comprehensive.js
 */

const fs = require('fs')
const path = require('path')

const ROOT_DIR = path.join(__dirname, '..')
const EXCLUDE_DIRS = ['node_modules', 'dist', 'reports', 'playwright-report', '.git', '.vercel']

// Results storage
const results = {
  summary: {
    totalFiles: 0,
    totalIssues: 0
  },
  brokenLinks: [],
  missingMetaDescription: [],
  missingTitle: [],
  missingOgTags: [],
  missingAltImages: [],
  missingLangAttribute: [],
  emptyLinks: [],
  multipleH1: [],
  skippedHeadingLevels: [],
  missingFavicon: [],
  missingCanonical: [],
  accessibilityIssues: []
}

// Get all HTML files
function getHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)

    // Skip excluded directories
    if (EXCLUDE_DIRS.some(excluded => filePath.includes(excluded))) {
      continue
    }

    if (fs.statSync(filePath).isDirectory()) {
      getHtmlFiles(filePath, fileList)
    } else if (file.endsWith('.html')) {
      fileList.push(filePath)
    }
  }

  return fileList
}

// Audit a single HTML file
function auditFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const relativePath = path.relative(ROOT_DIR, filePath)
  const issues = []

  // 1. Check for broken hash links
  const hashLinkRegex = /href="#([^"]+)"/g
  let match
  const validHashIds = [...content.matchAll(/id="([^"]+)"/g)].map(m => m[1])
  const validHashNames = [...content.matchAll(/name="([^"]+)"/g)].map(m => m[1])
  const validHashes = new Set([...validHashIds, ...validHashNames, 'top', 'content', 'main', 'skip'])

  while ((match = hashLinkRegex.exec(content)) !== null) {
    const hash = match[1]
    if (hash && !validHashes.has(hash) && !hash.startsWith('!')) {
      results.brokenLinks.push({ file: relativePath, hash: '#' + hash })
      issues.push(`Broken hash link: #${hash}`)
    }
  }

  // 2. Check for missing meta description
  const hasMetaDesc = /<meta\s+name=["']description["']/i.test(content)
  const hasOgDesc = /<meta\s+property=["']og:description["']/i.test(content)
  if (!hasMetaDesc && !hasOgDesc) {
    results.missingMetaDescription.push(relativePath)
    issues.push('Missing meta description')
  }

  // 3. Check for missing or empty title
  const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i)
  if (!titleMatch || !titleMatch[1].trim()) {
    results.missingTitle.push(relativePath)
    issues.push('Missing or empty title tag')
  }

  // 4. Check for missing Open Graph tags
  const hasOgTitle = /<meta\s+property=["']og:title["']/i.test(content)
  const hasOgImage = /<meta\s+property=["']og:image["']/i.test(content)
  if (!hasOgTitle || !hasOgImage) {
    results.missingOgTags.push({
      file: relativePath,
      missing: { ogTitle: !hasOgTitle, ogImage: !hasOgImage }
    })
    issues.push(`Missing OG tags: ${!hasOgTitle ? 'og:title ' : ''}${!hasOgImage ? 'og:image' : ''}`)
  }

  // 5. Check for images without alt text
  const imgRegex = /<img\s+([^>]+)>/gi
  let imgMatch
  while ((imgMatch = imgRegex.exec(content)) !== null) {
    const attrs = imgMatch[1]
    const hasAlt = /alt=["']([^"']*)["']/i.test(attrs)
    if (!hasAlt) {
      results.missingAltImages.push({ file: relativePath, snippet: imgMatch[0].slice(0, 80) })
      issues.push('Image missing alt attribute')
    }
  }

  // 6. Check for missing lang attribute on html
  const htmlTag = content.match(/<html\s+([^>]*)>/i)
  if (htmlTag && !/lang=["'][^"']+["']/i.test(htmlTag[1])) {
    results.missingLangAttribute.push(relativePath)
    issues.push('Missing lang attribute on <html>')
  }

  // 7. Check for empty links (no text, no aria-label)
  const linkRegex = /<a\s+([^>]*)>([\s\S]*?)<\/a>/gi
  let linkMatch
  while ((linkMatch = linkRegex.exec(content)) !== null) {
    const attrs = linkMatch[1]
    const text = linkMatch[2].replace(/<[^>]*>/g, '').trim()
    const hasAriaLabel = /aria-label=["'][^"']+["']/i.test(attrs)
    const hasHref = /href=["'][^"']+["']/i.test(attrs)

    if (!text && !hasAriaLabel && hasHref) {
      results.emptyLinks.push({ file: relativePath, snippet: linkMatch[0].slice(0, 80) })
      issues.push('Empty link without aria-label')
    }
  }

  // 8. Check for multiple H1 tags
  const h1Tags = content.match(/<h1[^>]*>/gi) || []
  if (h1Tags.length > 1) {
    results.multipleH1.push({ file: relativePath, count: h1Tags.length })
    issues.push(`Multiple H1 tags (${h1Tags.length})`)
  }

  // 9. Check heading hierarchy
  const headings = []
  const hRegex = /<(h[1-6])[^>]*>(.*?)<\/\1>/gi
  let hMatch
  while ((hMatch = hRegex.exec(content)) !== null) {
    const level = parseInt(hMatch[1].substring(1))
    headings.push({ level, text: hMatch[2].slice(0, 50) })
  }

  let lastLevel = 0
  for (const h of headings) {
    if (h.level > lastLevel + 1 && lastLevel !== 0) {
      results.skippedHeadingLevels.push({
        file: relativePath,
        issue: `Skipped from H${lastLevel} to H${h.level}`
      })
      issues.push(`Skipped heading level: H${lastLevel} → H${h.level}`)
    }
    lastLevel = h.level
  }

  // 10. Check for missing favicon
  if (!/rel=["'](shortcut )?icon["']/i.test(content)) {
    results.missingFavicon.push(relativePath)
    issues.push('Missing favicon')
  }

  // 11. Check for missing canonical URL
  if (!/<link\s+rel=["']canonical["']/i.test(content)) {
    results.missingCanonical.push(relativePath)
    issues.push('Missing canonical URL')
  }

  // Store accessibility issues
  if (issues.length > 0) {
    results.accessibilityIssues.push({
      file: relativePath,
      issues
    })
  }
}

// Print section helper
function printSection(title, items, max = 10) {
  if (items.length === 0) {
    } else {
    `)
    items.slice(0, max).forEach(item => {
      if (typeof item === 'string') {
        } else {
        const detail = item.file ? item.file : 'unknown'
        const extra = item.hash ? ` ${item.hash}` : item.count ? ` (${item.count} tags)` : ''
        }
    })
    if (items.length > max) {
      }
  }
  }

// Main execution
const htmlFiles = getHtmlFiles(ROOT_DIR)
results.summary.totalFiles = htmlFiles.length
for (const file of htmlFiles) {
  auditFile(file)
}

// Calculate total issues
results.summary.totalIssues = Object.values(results).reduce((sum, value) => {
  if (Array.isArray(value)) return sum + value.length
  return sum
}, 0)

// Print results
printSection('Broken Hash Links', results.brokenLinks)
printSection('Missing Meta Description', results.missingMetaDescription)
printSection('Missing Title Tags', results.missingTitle)
printSection('Missing Open Graph Tags', results.missingOgTags)
printSection('Images Missing Alt Text', results.missingAltImages, 5)
printSection('Missing Lang Attribute', results.missingLangAttribute)
printSection('Empty Links', results.emptyLinks, 5)
printSection('Multiple H1 Tags', results.multipleH1)
printSection('Skipped Heading Levels', results.skippedHeadingLevels)
printSection('Missing Favicon', results.missingFavicon)
printSection('Missing Canonical URL', results.missingCanonical)

// Save report
const reportsDir = path.join(ROOT_DIR, 'reports', 'audit')
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true })
}

const dateStr = new Date().toISOString().split('T')[0]
const reportPath = path.join(reportsDir, `comprehensive-audit-${dateStr}.json`)
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2))

, reportPath)}`)
// Exit with error code if issues found
if (results.summary.totalIssues > 0) {
  process.exit(1)
} else {
  process.exit(0)
}

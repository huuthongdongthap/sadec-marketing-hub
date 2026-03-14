#!/usr/bin/env node

/**
 * Accessibility & SEO Audit Script
 * Quét broken links, meta tags, và accessibility issues
 *
 * Usage: node scripts/audit-accessibility.js
 */

const fs = require('fs')
const path = require('path')

const ROOT_DIR = path.join(__dirname, '..')

// Results storage
const results = {
  brokenLinks: [],
  missingMetaDescription: [],
  missingTitle: [],
  missingAltImages: [],
  missingLangAttribute: [],
  missingAriaLabels: [],
  emptyLinks: [],
  multipleH1: [],
  missingFavicon: []
}

// Get all HTML files
function getHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)

    // Skip node_modules, dist, reports
    if (file.includes('node_modules') || file.includes('dist') || file.includes('reports') || file.includes('playwright-report')) {
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

  // 1. Check for broken hash links (# without target)
  const hashLinks = content.match(/href="#[^"]*"/g) || []
  const validHashIds = [...content.matchAll(/id="([^"]+)"/g)].map(m => m[1])
  const validHashNames = [...content.matchAll(/name="([^"]+)"/g)].map(m => m[1])
  const validHashes = new Set([...validHashIds, ...validHashNames, 'main', 'top', 'content'])

  for (const link of hashLinks) {
    const hash = link.match(/href="(#[^"]+)"/)[1]
    // Skip valid skip links and anchors with aria-labels
    if (!validHashes.has(hash.replace('#', '')) && !content.includes(`aria-label`) && !link.includes('skip')) {
      results.brokenLinks.push({ file: relativePath, link: hash })
    }
  }

  // 2. Check for missing meta description
  if (!content.includes('<meta name="description"') && !content.includes('<meta property="og:description"')) {
    results.missingMetaDescription.push(relativePath)
  }

  // 3. Check for missing title
  if (!content.includes('<title>')) {
    results.missingTitle.push(relativePath)
  }

  // 4. Check for images without alt text
  const imgTags = content.match(/<img[^>]*>/g) || []
  for (const img of imgTags) {
    if (!img.includes('alt=')) {
      results.missingAltImages.push({ file: relativePath, tag: img.slice(0, 100) })
    }
  }

  // 5. Check for missing lang attribute on html
  const htmlTag = content.match(/<html[^>]*>/)
  if (htmlTag && !htmlTag[0].includes('lang=')) {
    results.missingLangAttribute.push(relativePath)
  }

  // 6. Check for buttons without accessible names
  const buttons = content.match(/<button[^>]*>[^<]*<\/button>/g) || []
  for (const btn of buttons) {
    if (!btn.includes('aria-label') && !btn.includes('aria-labelledby') && !btn.trim().match(/<button[^>]*>[^<\s]/)) {
      results.missingAriaLabels.push({ file: relativePath, tag: btn.slice(0, 100) })
    }
  }

  // 7. Check for empty links
  const links = content.match(/<a[^>]*>[^<]*<\/a>/g) || []
  for (const link of links) {
    const text = link.replace(/<[^>]*>/g, '').trim()
    if (!text && !link.includes('aria-label')) {
      results.emptyLinks.push({ file: relativePath, tag: link.slice(0, 100) })
    }
  }

  // 8. Check for multiple H1 tags
  const h1Tags = content.match(/<h1[^>]*>/g) || []
  if (h1Tags.length > 1) {
    results.multipleH1.push({ file: relativePath, count: h1Tags.length })
  }

  // 9. Check for missing favicon
  if (!content.includes('rel="icon"') && !content.includes('rel="shortcut icon"')) {
    results.missingFavicon.push(relativePath)
  }
}

// Main execution
console.log('🔍 Scanning HTML files for accessibility and SEO issues...\n')

const htmlFiles = getHtmlFiles(ROOT_DIR)
console.log(`Found ${htmlFiles.length} HTML files\n`)

for (const file of htmlFiles) {
  auditFile(file)
}

// Print results
console.log('═══════════════════════════════════════════════════════════')
console.log('AUDIT RESULTS')
console.log('═══════════════════════════════════════════════════════════\n')

console.log(`📊 Summary:`)
console.log(`   Broken Links: ${results.brokenLinks.length}`)
console.log(`   Missing Meta Description: ${results.missingMetaDescription.length}`)
console.log(`   Missing Title: ${results.missingTitle.length}`)
console.log(`   Missing Alt Images: ${results.missingAltImages.length}`)
console.log(`   Missing Lang Attribute: ${results.missingLangAttribute.length}`)
console.log(`   Missing Aria Labels: ${results.missingAriaLabels.length}`)
console.log(`   Empty Links: ${results.emptyLinks.length}`)
console.log(`   Multiple H1 Tags: ${results.multipleH1.length}`)
console.log(`   Missing Favicon: ${results.missingFavicon.length}`)
console.log('')

// Print details for each category
function printDetails(title, items, max = 10) {
  if (items.length === 0) {
    console.log(`✅ ${title}`)
  } else {
    console.log(`❌ ${title} (${items.length} issues)`)
    items.slice(0, max).forEach(item => {
      if (typeof item === 'string') {
        console.log(`   - ${item}`)
      } else {
        console.log(`   - ${item.file}: ${item.link || item.tag || item.count + ' tags'}`)
      }
    })
    if (items.length > max) {
      console.log(`   ... and ${items.length - max} more`)
    }
  }
  console.log('')
}

printDetails('Broken Hash Links', results.brokenLinks)
printDetails('Missing Meta Description', results.missingMetaDescription)
printDetails('Missing Title Tags', results.missingTitle)
printDetails('Missing Alt Images', results.missingAltImages, 5)
printDetails('Missing Lang Attribute', results.missingLangAttribute)
printDetails('Missing Aria Labels', results.missingAriaLabels, 5)
printDetails('Empty Links', results.emptyLinks, 5)
printDetails('Multiple H1 Tags', results.multipleH1)
printDetails('Missing Favicon', results.missingFavicon)

// Write report to file
const reportPath = path.join(ROOT_DIR, 'reports', 'accessibility-audit-' + new Date().toISOString().split('T')[0] + '.json')
if (!fs.existsSync(path.join(ROOT_DIR, 'reports'))) {
  fs.mkdirSync(path.join(ROOT_DIR, 'reports'), { recursive: true })
}
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2))

console.log(`📄 Full report saved to: ${path.relative(process.cwd(), reportPath)}`)
console.log('\n✨ Audit complete!')

// Exit with error code if issues found
const totalIssues = Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
if (totalIssues > 0) {
  console.log(`\n⚠️  Total issues found: ${totalIssues}`)
  process.exit(1)
} else {
  console.log('\n🎉 No issues found!')
  process.exit(0)
}

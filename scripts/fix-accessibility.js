#!/usr/bin/env node

/**
 * Accessibility Fix Script
 * Tự động fix accessibility issues
 *
 * Usage: node scripts/fix-accessibility.js
 */

const fs = require('fs')
const path = require('path')

const ROOT_DIR = path.join(__dirname, '..')

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  const relativePath = path.relative(ROOT_DIR, filePath)
  let changes = 0

  // 1. Fix missing favicon - add after existing meta tags
  if (!content.includes('rel="icon"') && !content.includes('rel="shortcut icon"')) {
    const faviconLink = '  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">\n  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">\n  <link rel="manifest" href="/site.webmanifest">\n'

    // Insert after last meta tag in head
    const metaTags = content.match(/<meta[^>]*>\n?/g) || []
    if (metaTags.length > 0) {
      const lastMeta = metaTags[metaTags.length - 1]
      const lastMetaIndex = content.indexOf(lastMeta) + lastMeta.length
      content = content.slice(0, lastMetaIndex) + '\n' + faviconLink + content.slice(lastMetaIndex)
      changes++
      console.log(`  ✅ Added favicon: ${relativePath}`)
    }
  }

  // 2. Fix buttons missing aria-label (pattern matching for common buttons)
  const buttonPatterns = [
    { pattern: /(<button[^>]*class="[^"]*theme-toggle[^"]*"[^>]*>)/g, fix: 'aria-label="Chuyển đổi giao diện"' },
    { pattern: /(<button[^>]*class="[^"]*menu-toggle[^"]*"[^>]*>)/g, fix: 'aria-label="Mở menu"' },
    { pattern: /(<button[^>]*class="[^"]*close[^"]*"[^>]*>)/g, fix: 'aria-label="Đóng"' },
    { pattern: /(<button[^>]*class="[^"]*btn-search[^"]*"[^>]*>)/g, fix: 'aria-label="Tìm kiếm"' },
    { pattern: /(<button[^>]*class="[^"]*notification[^"]*"[^>]*>)/g, fix: 'aria-label="Thông báo"' },
    { pattern: /(<button[^>]*class="[^"]*scroll-top[^"]*"[^>]*>)/g, fix: 'aria-label="Lên đầu trang"' },
    { pattern: /(<button[^>]*class="[^"]*back-to-top[^"]*"[^>]*>)/g, fix: 'aria-label="Lên đầu trang"' },
    { pattern: /(<button[^>]*onclick="[^"]*toggle[^"]*"[^>]*>)/g, fix: 'aria-label="Chuyển đổi"' },
  ]

  for (const { pattern, fix } of buttonPatterns) {
    const matches = [...content.matchAll(pattern)]
    for (const match of matches) {
      if (!match[0].includes('aria-label')) {
        const oldBtn = match[0]
        const newBtn = oldBtn.replace('>', ` ${fix}>`)
        content = content.replace(oldBtn, newBtn)
        changes++
      }
    }
  }

  // 3. Fix multiple H1 tags - change subsequent H1s to H2
  const h1Tags = [...content.matchAll(/<h1[^>]*>/g)]
  if (h1Tags.length > 1) {
    let h1Count = 0
    content = content.replace(/<h1([^>]*)>([^<]*)<\/h1>/g, (match, attrs, text) => {
      h1Count++
      if (h1Count === 1) return match
      changes++
      console.log(`  ✅ Changed H1 to H2: ${relativePath} - "${text.trim()}"`)
      return `<h2${attrs}>${text}</h2>`
    })
  }

  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf8')
    return changes
  }
  return 0
}

// Get all HTML files
function getHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)

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

// Main execution
console.log('🔧 Fixing accessibility issues...\n')

const htmlFiles = getHtmlFiles(ROOT_DIR)
let totalChanges = 0
let filesFixed = 0

for (const file of htmlFiles) {
  const changes = fixFile(file)
  if (changes > 0) {
    totalChanges += changes
    filesFixed++
  }
}

console.log('\n═══════════════════════════════════════════════════════════')
console.log(`✅ Fixed ${totalChanges} issues in ${filesFixed} files`)
console.log('═══════════════════════════════════════════════════════════')
console.log('\n✨ Accessibility fix complete!')
console.log('\n📝 Note: Some issues may require manual fixes:')
console.log('   - Buttons with dynamic content')
console.log('   - Images without meaningful alt text')
console.log('   - Custom ARIA landmarks')

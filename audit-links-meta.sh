#!/bin/bash
# Audit script for broken links, meta tags, and accessibility issues
# Runs in sadec-marketing-hub directory

cd /Users/mac/.gemini/antigravity/scratch/sadec-marketing-hub

echo "=========================================="
echo "SADEC MARKETING HUB - AUDIT REPORT"
echo "Date: $(date +%Y-%m-%d)"
echo "=========================================="
echo ""

# Initialize counters
total_files=0
broken_links=0
missing_meta=0
a11y_issues=0

# Temp files for reports
LINKS_REPORT="/tmp/broken_links.txt"
META_REPORT="/tmp/missing_meta.txt"
A11Y_REPORT="/tmp/a11y_issues.txt"

> "$LINKS_REPORT"
> "$META_REPORT"
> "$A11Y_REPORT"

# Get all HTML files (exclude node_modules, dist, .git)
html_files=$(find . -name "*.html" -not -path "./node_modules/*" -not -path "./dist/*" -not -path "./.git/*")

# Build a map of all valid internal paths
echo "📦 Building file index..."
all_paths=$(echo "$html_files" | sed 's|^\./||' | sort)

# Also collect JS, CSS, image references
all_assets=$(find . \( -name "*.js" -o -name "*.css" -o -name "*.png" -o -name "*.jpg" -o -name "*.svg" \) \
  -not -path "./node_modules/*" -not -path "./dist/*" -not -path "./.git/*" | sed 's|^\./||' | sort)

echo ""
echo "=========================================="
echo "1. BROKEN LINKS SCAN"
echo "=========================================="

for file in $html_files; do
  ((total_files++))

  # Extract all href and src attributes
  links=$(grep -oE '(href|src)="[^"]*"' "$file" 2>/dev/null | grep -v "^$" || true)

  while IFS= read -r link; do
    [ -z "$link" ] && continue

    # Extract the URL
    url=$(echo "$link" | sed 's/.*="\([^"]*\)"/\1/')

    # Skip external URLs, anchors, tel:, mailto:, javascript:, #
    if [[ "$url" =~ ^(http|https|//|tel:|mailto:|javascript:|#) ]]; then
      continue
    fi

    # Remove query params and hash for path matching
    clean_url=$(echo "$url" | sed 's/[?#].*//')

    # Skip empty paths
    [ -z "$clean_url" ] && continue

    # Check if it's an internal file reference
    if [[ "$clean_url" =~ ^[^/]+\.[a-zA-Z]+$ ]]; then
      # Direct file reference like "file.html"
      if [ ! -f "$clean_url" ] && ! echo "$all_paths" | grep -q "^${clean_url}$"; then
        echo "  $file: $link" >> "$LINKS_REPORT"
        ((broken_links++))
      fi
    elif [[ "$clean_url" =~ ^/ ]]; then
      # Absolute path
      check_path="${clean_url#/}"
      if [ ! -f "$check_path" ] && ! echo "$all_paths" | grep -q "^${check_path}$"; then
        echo "  $file: $link" >> "$LINKS_REPORT"
        ((broken_links++))
      fi
    elif [[ "$clean_url" =~ ^\.\./ ]]; then
      # Relative path with ../
      dir=$(dirname "$file")
      resolved=$(cd "$dir" 2>/dev/null && cd "$(dirname "$clean_url")" 2>/dev/null && pwd)/$(basename "$clean_url")
      resolved=${resolved#$(pwd)/}
      if [ ! -f "$resolved" ] && ! echo "$all_paths" | grep -q "^${resolved}$"; then
        echo "  $file: $link" >> "$LINKS_REPORT"
        ((broken_links++))
      fi
    elif [[ "$clean_url" =~ ^\./ || ! "$clean_url" =~ ^\{ ]]; then
      # Relative path
      dir=$(dirname "$file")
      check_path="$dir/$clean_url"
      check_path=$(echo "$check_path" | sed 's|/\./|/|g')
      if [ ! -f "$check_path" ] && ! echo "$all_paths" | grep -q "^${check_path#./}$"; then
        echo "  $file: $link" >> "$LINKS_REPORT"
        ((broken_links++))
      fi
    fi
  done <<< "$links"
done

# Print broken links
if [ -s "$LINKS_REPORT" ]; then
  echo "❌ Broken links found: $broken_links"
  cat "$LINKS_REPORT" | head -50
  [ $broken_links -gt 50 ] && echo "  ... and $((broken_links - 50)) more"
else
  echo "✅ No broken links detected"
fi

echo ""
echo "=========================================="
echo "2. META TAGS SCAN"
echo "=========================================="

for file in $html_files; do
  filename=$(basename "$file")

  # Check for required meta tags
  has_charset=$(grep -c '<meta[^>]*charset' "$file" 2>/dev/null || echo 0)
  has_viewport=$(grep -c '<meta[^>]*viewport' "$file" 2>/dev/null || echo 0)
  has_description=$(grep -c '<meta[^>]*description' "$file" 2>/dev/null || echo 0)
  has_title=$(grep -c '<title>' "$file" 2>/dev/null || echo 0)

  if [ "$has_charset" -eq 0 ]; then
    echo "  $file: Missing charset meta tag" >> "$META_REPORT"
    ((missing_meta++))
  fi
  if [ "$has_viewport" -eq 0 ]; then
    echo "  $file: Missing viewport meta tag" >> "$META_REPORT"
    ((missing_meta++))
  fi
  if [ "$has_description" -eq 0 ]; then
    echo "  $file: Missing description meta tag" >> "$META_REPORT"
    ((missing_meta++))
  fi
  if [ "$has_title" -eq 0 ]; then
    echo "  $file: Missing <title> tag" >> "$META_REPORT"
    ((missing_meta++))
  fi
done

# Print missing meta tags
if [ -s "$META_REPORT" ]; then
  echo "❌ Meta tag issues found: $missing_meta"
  cat "$META_REPORT" | head -50
  [ $missing_meta -gt 50 ] && echo "  ... and $((missing_meta - 50)) more"
else
  echo "✅ All meta tags present"
fi

echo ""
echo "=========================================="
echo "3. ACCESSIBILITY SCAN"
echo "=========================================="

# Check for common a11y issues
for file in $html_files; do
  # Images missing alt attribute
  imgs_no_alt=$(grep -c '<img[^>]*>' "$file" 2>/dev/null | head -1 || echo 0)
  imgs_with_alt=$(grep -c '<img[^>]*alt=' "$file" 2>/dev/null || echo 0)

  # More accurate: find img tags without alt
  while IFS= read -r line; do
    if [[ "$line" =~ \<img[^\>]* ]] && ! [[ "$line" =~ alt= ]]; then
      echo "  $file: <img> without alt attribute" >> "$A11Y_REPORT"
      ((a11y_issues++))
    fi
  done < <(grep -o '<img[^>]*>' "$file" 2>/dev/null)

  # Buttons without accessible text
  while IFS= read -r line; do
    if [[ "$line" =~ \<button[^\>]*\> ]] && ! [[ "$line" =~ aria-label= ]] && ! [[ "$line" =~ \>[^<]+\< ]]; then
      echo "  $file: <button> without accessible text" >> "$A11Y_REPORT"
      ((a11y_issues++))
    fi
  done < <(grep -o '<button[^>]*>[^<]*</button>' "$file" 2>/dev/null)

  # Links without href or with empty href
  while IFS= read -r line; do
    if [[ "$line" =~ \<a[^\>]*\> ]] && ! [[ "$line" =~ href= ]]; then
      echo "  $file: <a> without href" >> "$A11Y_REPORT"
      ((a11y_issues++))
    fi
  done < <(grep -o '<a[^>]*>' "$file" 2>/dev/null)

  # Forms without labels
  while IFS= read -r line; do
    if [[ "$line" =~ \<input[^\>]*type=[\"\\'](text|email|password|search)[\"\\'] ]]; then
      id=$(echo "$line" | grep -oE 'id="[^"]*"' | head -1 | cut -d'"' -f2)
      if [ -n "$id" ]; then
        # Check if there's a label for this input
        has_label=$(grep -c "for=[\"']${id}[\"']" "$file" 2>/dev/null || echo 0)
        if [ "$has_label" -eq 0 ] && ! [[ "$line" =~ aria-label= ]]; then
          echo "  $file: <input id=\"$id\"> without label" >> "$A11Y_REPORT"
          ((a11y_issues++))
        fi
      fi
    fi
  done < <(grep -o '<input[^>]*>' "$file" 2>/dev/null)

  # Missing lang attribute on html
  has_lang=$(grep -c '<html[^>]*lang=' "$file" 2>/dev/null || echo 0)
  if [ "$has_lang" -eq 0 ]; then
    echo "  $file: <html> without lang attribute" >> "$A11Y_REPORT"
    ((a11y_issues++))
  fi

  # Missing role or aria-label on nav
  while IFS= read -r line; do
    if [[ "$line" =~ \<nav[^\>]*\> ]]; then
      if ! [[ "$line" =~ aria-label= ]] && ! [[ "$line" =~ role= ]]; then
        echo "  $file: <nav> without aria-label or role" >> "$A11Y_REPORT"
        ((a11y_issues++))
      fi
    fi
  done < <(grep -o '<nav[^>]*>' "$file" 2>/dev/null)
done

# Print a11y issues
if [ -s "$A11Y_REPORT" ]; then
  echo "❌ Accessibility issues found: $a11y_issues"
  cat "$A11Y_REPORT" | head -50
  [ $a11y_issues -gt 50 ] && echo "  ... and $((a11y_issues - 50)) more"
else
  echo "✅ No accessibility issues detected"
fi

echo ""
echo "=========================================="
echo "SUMMARY"
echo "=========================================="
echo "Total HTML files scanned: $total_files"
echo "Broken links: $broken_links"
echo "Missing meta tags: $missing_meta"
echo "Accessibility issues: $a11y_issues"
echo ""
echo "Reports saved to:"
echo "  - Broken links: $LINKS_REPORT"
echo "  - Missing meta: $META_REPORT"
echo "  - A11y issues: $A11Y_REPORT"
echo "=========================================="

# Generate JSON report
cat > /tmp/sadec-audit-$(date +%Y%m%d).json << EOF
{
  "date": "$(date +%Y-%m-%d)",
  "total_files": $total_files,
  "broken_links": $broken_links,
  "missing_meta_tags": $missing_meta,
  "accessibility_issues": $a11y_issues
}
EOF

echo "JSON report: /tmp/sadec-audit-$(date +%Y%m%d).json"

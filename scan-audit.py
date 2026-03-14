#!/usr/bin/env python3
"""
Quét broken links, meta tags, và accessibility issues trong sadec-marketing-hub.
Full audit pipeline cho HTML files.
"""

import os
import re
import json
from pathlib import Path
from dataclasses import dataclass, field, asdict
from typing import Optional

# ============================================================================
# CONFIGURATION
# ============================================================================

BASE_DIR = Path("/Users/mac/mekong-cli/apps/sadec-marketing-hub")
EXCLUDE_DIRS = {
    'node_modules',
    '.git',
    '.vercel',
    '.wrangler',
    '.pytest_cache',
    '.cto-reports',
    'dist',
    'test-results',
    'tests',
    'playwright-report',
    'reports',
    '.knowledge',
    'SADIEC'
}

# Root-level directories that should use / prefix instead of ../
ROOT_LEVEL_DIRS = {
    'assets', 'admin', 'portal', 'affiliate', 'auth', 'docs', 'database',
    'supabase', 'scripts', 'designs', 'releases',
    'supabase-config.js', 'auth.js', 'index.html', 'login.html', 'register.html',
    'favicon.png', 'manifest.json', 'robots.txt', 'sitemap.xml'
}

# Meta tag patterns
TITLE_PATTERN = re.compile(r'<title>\s*(.+?)\s*</title>', re.IGNORECASE | re.DOTALL)
META_DESC_PATTERN = re.compile(r'<meta\s+name=["\']description["\']\s+content=["\'](.+?)["\']', re.IGNORECASE)
OG_TITLE_PATTERN = re.compile(r'<meta\s+property=["\']og:title["\']\s+content=["\'](.+?)["\']', re.IGNORECASE)
OG_DESC_PATTERN = re.compile(r'<meta\s+property=["\']og:description["\']\s+content=["\'](.+?)["\']', re.IGNORECASE)
OG_IMAGE_PATTERN = re.compile(r'<meta\s+property=["\']og:image["\']\s+content=["\'](.+?)["\']', re.IGNORECASE)
OG_URL_PATTERN = re.compile(r'<meta\s+property=["\']og:url["\']\s+content=["\'](.+?)["\']', re.IGNORECASE)
CANONICAL_PATTERN = re.compile(r'<link\s+rel=["\']canonical["\']\s+href=["\'](.+?)["\']', re.IGNORECASE)
FAVICON_PATTERN = re.compile(r'<link\s+rel=["\']icon["\']', re.IGNORECASE)
VIEWPORT_PATTERN = re.compile(r'<meta\s+name=["\']viewport["\']', re.IGNORECASE)
JSONLD_PATTERN = re.compile(r'<script\s+type=["\']application/ld\+json["\']', re.IGNORECASE)

# Accessibility patterns
IMG_PATTERN = re.compile(r'<img\b[^>]*>', re.IGNORECASE)
ALT_PATTERN = re.compile(r'\balt=["\']([^"\']*)["\']', re.IGNORECASE)
INPUT_PATTERN = re.compile(r'<input\b[^>]*>', re.IGNORECASE)
INPUT_TYPE_PATTERN = re.compile(r'\btype=["\']?(hidden|submit|button|image|reset)["\']?', re.IGNORECASE)
ID_PATTERN = re.compile(r'\bid=["\']([^"\']+)["\']', re.IGNORECASE)
ARIA_LABEL_PATTERN = re.compile(r'\baria-label=["\']([^"\']*)["\']', re.IGNORECASE)
ARIA_LABELLEDBY_PATTERN = re.compile(r'\baria-labelledby=["\']([^"\']*)["\']', re.IGNORECASE)
LABEL_FOR_PATTERN = re.compile(r'<label\s+for=["\']([^"\']+)["\']', re.IGNORECASE)
HEADING_PATTERN = re.compile(r'<(h[1-6])\b[^>]*>(.*?)</\1>', re.IGNORECASE | re.DOTALL)

# Link patterns
HREF_PATTERN = re.compile(r'\bhref=["\']([^"\']+?)["\']', re.IGNORECASE)
SRC_PATTERN = re.compile(r'\bsrc=["\']([^"\']+?)["\']', re.IGNORECASE)
ANCHOLINK_PATTERN = re.compile(r'^#')
EXTERNAL_LINK_PATTERN = re.compile(r'^(https?://|//|mailto:|tel:)', re.IGNORECASE)


# ============================================================================
# DATA CLASSES
# ============================================================================

@dataclass
class MetaTagAudit:
    has_title: bool = False
    title_content: Optional[str] = None
    has_description: bool = False
    has_og_title: bool = False
    has_og_description: bool = False
    has_og_image: bool = False
    has_og_url: bool = False
    has_canonical: bool = False
    has_favicon: bool = False
    has_viewport: bool = False
    has_jsonld: bool = False

    @property
    def score(self) -> int:
        """SEO score out of 10"""
        score = 0
        if self.has_title: score += 2
        if self.has_description: score += 2
        if self.has_og_title: score += 1
        if self.has_og_description: score += 1
        if self.has_og_image: score += 1
        if self.has_og_url: score += 1
        if self.has_canonical: score += 1
        if self.has_favicon: score += 1
        if self.has_viewport: score += 1
        if self.has_jsonld: score += 1
        return score


@dataclass
class HeadingIssue:
    file: str
    line: int
    issue: str
    heading: str


@dataclass
class ImageIssue:
    file: str
    line: int
    issue: str
    snippet: str


@dataclass
class InputIssue:
    file: str
    line: int
    issue: str
    input_type: str


@dataclass
class BrokenLink:
    file: str
    line: int
    link_type: str  # href, src
    current_path: str
    suggested_path: str
    reason: str


@dataclass
class AccessibilityReport:
    images_without_alt: list = field(default_factory=list)
    inputs_without_label: list = field(default_factory=list)
    heading_structure_issues: list = field(default_factory=list)
    missing_lang_attribute: bool = False
    missing_skip_link: bool = False


@dataclass
class FileAuditReport:
    file_path: str
    meta: MetaTagAudit
    accessibility: AccessibilityReport
    broken_links: list
    total_issues: int = 0

    def __post_init__(self):
        self.total_issues = (
            (10 - self.meta.score) +  # Missing meta tags
            len(self.accessibility.images_without_alt) +
            len(self.accessibility.inputs_without_label) +
            len(self.accessibility.heading_structure_issues) +
            len(self.broken_links) +
            (1 if self.accessibility.missing_lang_attribute else 0) +
            (1 if self.accessibility.missing_skip_link else 0)
        )


# ============================================================================
# AUDIT FUNCTIONS
# ============================================================================

def should_convert_to_root(path: str) -> bool:
    """Check if path should be converted to root-relative"""
    if not path.startswith('../'):
        return False

    clean_path = path.lstrip('../')
    first_segment = clean_path.split('/')[0].split('?')[0].split('#')[0]

    # Check against known root-level dirs
    if first_segment in ROOT_LEVEL_DIRS:
        return True

    # Check if it exists at root
    if (BASE_DIR / first_segment).exists():
        return True

    return False


def convert_to_root(path: str) -> str:
    """Convert ../path to /path"""
    if not path.startswith('../'):
        return path
    clean_path = path.lstrip('../')
    return f"/{clean_path}"


def audit_meta_tags(content: str) -> MetaTagAudit:
    """Audit meta tags in HTML content"""
    meta = MetaTagAudit()

    # Title
    title_match = TITLE_PATTERN.search(content)
    if title_match:
        meta.has_title = True
        meta.title_content = title_match.group(1).strip()

    # Meta tags
    meta.has_description = bool(META_DESC_PATTERN.search(content))
    meta.has_og_title = bool(OG_TITLE_PATTERN.search(content))
    meta.has_og_description = bool(OG_DESC_PATTERN.search(content))
    meta.has_og_image = bool(OG_IMAGE_PATTERN.search(content))
    meta.has_og_url = bool(OG_URL_PATTERN.search(content))
    meta.has_canonical = bool(CANONICAL_PATTERN.search(content))
    meta.has_favicon = bool(FAVICON_PATTERN.search(content))
    meta.has_viewport = bool(VIEWPORT_PATTERN.search(content))
    meta.has_jsonld = bool(JSONLD_PATTERN.search(content))

    return meta


def audit_accessibility(content: str, file_path: str) -> AccessibilityReport:
    """Audit accessibility issues in HTML content"""
    report = AccessibilityReport()

    # Check <html lang> attribute
    if not re.search(r'<html\b[^>]*\blang=["\']', content, re.IGNORECASE):
        report.missing_lang_attribute = True

    # Check skip link
    if not re.search(r'<a\s+href=["\']#main', content, re.IGNORECASE):
        report.missing_skip_link = True

    # Images without alt
    for img_match in IMG_PATTERN.finditer(content):
        img_tag = img_match.group(0)
        alt_match = ALT_PATTERN.search(img_tag)

        if not alt_match:
            # No alt attribute at all
            report.images_without_alt.append(ImageIssue(
                file=file_path,
                line=0,  # Line number would require more complex parsing
                issue="Missing alt attribute",
                snippet=img_tag[:100]
            ))
        elif not alt_match.group(1).strip():
            # Empty alt - could be decorative, but flag for review
            # Empty alt is valid for decorative images, but we note it
            pass  # Skip empty alt as it's valid for decorative images

    # Check heading hierarchy
    headings = []
    for match in HEADING_PATTERN.finditer(content):
        level = int(match.group(1)[1])
        text = re.sub(r'<[^>]+>', '', match.group(2)).strip()[:50]
        headings.append((level, match.start(), text))

    # Check for skipped levels
    last_level = 0
    for level, pos, text in headings:
        if level > last_level + 1 and last_level != 0:
            report.heading_structure_issues.append(HeadingIssue(
                file=file_path,
                line=0,
                issue=f"Skipped heading level: H{last_level} → H{level}",
                heading=text
            ))
        # Also check if first heading is not H1
        if last_level == 0 and level != 1:
            report.heading_structure_issues.append(HeadingIssue(
                file=file_path,
                line=0,
                issue=f"First heading should be H1, found H{level}",
                heading=text
            ))
        last_level = level

    # Inputs without labels
    all_labels_for = set()
    for label_match in LABEL_FOR_PATTERN.finditer(content):
        all_labels_for.add(label_match.group(1))

    for input_match in INPUT_PATTERN.finditer(content):
        input_tag = input_match.group(0)

        # Skip hidden, submit, button, image, reset types
        if INPUT_TYPE_PATTERN.search(input_tag):
            continue

        # Check for accessibility attributes
        has_id = ID_PATTERN.search(input_tag)
        has_aria_label = ARIA_LABEL_PATTERN.search(input_tag)
        has_aria_labelledby = ARIA_LABELLEDBY_PATTERN.search(input_tag)

        # Check if has associated label
        has_label = False
        if has_id and has_id.group(1) in all_labels_for:
            has_label = True

        if not has_label and not has_aria_label and not has_aria_labelledby:
            input_type = input_match.group(0)[:50]
            report.inputs_without_label.append(InputIssue(
                file=file_path,
                line=0,
                issue="Input without visible label or aria-label",
                input_type=input_type
            ))

    return report


def audit_links(content: str, file_path: str) -> list:
    """Audit links for broken paths"""
    broken_links = []
    rel_path = str(file_path.relative_to(BASE_DIR))

    # Check href attributes
    for match in HREF_PATTERN.finditer(content):
        href = match.group(1)

        # Skip external links, anchors, mailto, tel
        if EXTERNAL_LINK_PATTERN.match(href) or ANCHOLINK_PATTERN.match(href):
            continue

        # Check for ../ paths that should be root-relative
        if should_convert_to_root(href):
            broken_links.append(BrokenLink(
                file=rel_path,
                line=0,
                link_type="href",
                current_path=href,
                suggested_path=convert_to_root(href),
                reason="Should use root-relative path"
            ))

    # Check src attributes
    for match in SRC_PATTERN.finditer(content):
        src = match.group(1)

        # Skip external URLs and data URIs
        if EXTERNAL_LINK_PATTERN.match(src) or src.startswith('data:'):
            continue

        # Check for ../ paths that should be root-relative
        if should_convert_to_root(src):
            broken_links.append(BrokenLink(
                file=rel_path,
                line=0,
                link_type="src",
                current_path=src,
                suggested_path=convert_to_root(src),
                reason="Should use root-relative path"
            ))

    return broken_links


def audit_file(filepath: Path) -> Optional[FileAuditReport]:
    """Audit a single HTML file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        rel_path = str(filepath.relative_to(BASE_DIR))

        meta = audit_meta_tags(content)
        accessibility = audit_accessibility(content, rel_path)
        broken_links = audit_links(content, filepath)

        return FileAuditReport(
            file_path=rel_path,
            meta=meta,
            accessibility=accessibility,
            broken_links=broken_links
        )

    except Exception as e:
        print(f"  ⚠️  Error processing {filepath}: {e}")
        return None


def scan_all_files() -> list:
    """Scan all HTML files in the project"""
    reports = []
    html_files = []

    # Collect all HTML files
    for root, dirs, files in os.walk(BASE_DIR):
        # Filter out excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        for f in files:
            if f.endswith('.html'):
                html_files.append(os.path.join(root, f))

    print(f"🔍 Quét {len(html_files)} HTML files...\n")

    for filepath in html_files:
        report = audit_file(Path(filepath))
        if report and report.total_issues > 0:
            reports.append(report)

    return reports


def print_summary(reports: list):
    """Print audit summary"""
    print("\n" + "=" * 80)
    print("📊 KẾT QUẢ KIỂM TRA")
    print("=" * 80)

    if not reports:
        print("✅ Không tìm thấy vấn đề nào!")
        return

    total_issues = sum(r.total_issues for r in reports)
    total_broken_links = sum(len(r.broken_links) for r in reports)
    total_missing_alt = sum(len(r.accessibility.images_without_alt) for r in reports)
    total_missing_labels = sum(len(r.accessibility.inputs_without_label) for r in reports)
    total_heading_issues = sum(len(r.accessibility.heading_structure_issues) for r in reports)

    print(f"\n📈 TỔNG QUAN:")
    print(f"   • Files có issues: {len(reports)}")
    print(f"   • Tổng số issues: {total_issues}")
    print(f"   • Broken links: {total_broken_links}")
    print(f"   • Images không alt: {total_missing_alt}")
    print(f"   • Inputs không label: {total_missing_labels}")
    print(f"   • Heading structure issues: {total_heading_issues}")

    # Sort by issue count (most issues first)
    reports.sort(key=lambda r: r.total_issues, reverse=True)

    print(f"\n🔴 TOP 10 FILES NHIỀU ISSUES NHẤT:\n")
    for i, report in enumerate(reports[:10], 1):
        meta_score = report.meta.score
        print(f"   {i}. {report.file_path}")
        print(f"      Issues: {report.total_issues} | SEO Score: {meta_score}/10")

        # Show breakdown
        breakdown = []
        if 10 - meta_score > 0:
            breakdown.append(f"{10 - meta_score} missing meta tags")
        if report.broken_links:
            breakdown.append(f"{len(report.broken_links)} broken links")
        if report.accessibility.images_without_alt:
            breakdown.append(f"{len(report.accessibility.images_without_alt)} missing alt")
        if report.accessibility.inputs_without_label:
            breakdown.append(f"{len(report.accessibility.inputs_without_label)} missing labels")
        if report.accessibility.heading_structure_issues:
            breakdown.append(f"{len(report.accessibility.heading_structure_issues)} heading issues")
        if report.accessibility.missing_lang_attribute:
            breakdown.append("missing lang")
        if report.accessibility.missing_skip_link:
            breakdown.append("missing skip-link")

        print(f"      → {', '.join(breakdown[:5])}")  # Show top 5 issues
        print()


def print_broken_links_detail(reports: list):
    """Print detailed broken links for fixing"""
    all_links = []
    for report in reports:
        all_links.extend(report.broken_links)

    if not all_links:
        print("\n✅ Không có broken links cần sửa!")
        return

    print("\n🔗 CHI TIẾT BROKEN LINKS:")
    print("=" * 80)

    # Group by file
    by_file = {}
    for link in all_links:
        if link.file not in by_file:
            by_file[link.file] = []
        by_file[link.file].append(link)

    for file_path, links in by_file.items():
        print(f"\n📄 {file_path}:")
        for link in links:
            print(f"   • {link.link_type}: \"{link.current_path}\"")
            print(f"     → Sửa thành: \"{link.suggested_path}\"")
            print(f"     → Lý do: {link.reason}")


def print_accessibility_detail(reports: list):
    """Print detailed accessibility issues"""
    print("\n♿ CHI TIẾT ACCESSIBILITY ISSUES:")
    print("=" * 80)

    # Group by file
    images_by_file = {}
    inputs_by_file = {}
    headings_by_file = {}

    for report in reports:
        for img in report.accessibility.images_without_alt:
            if img.file not in images_by_file:
                images_by_file[img.file] = []
            images_by_file[img.file].append(img)

        for inp in report.accessibility.inputs_without_label:
            if inp.file not in inputs_by_file:
                inputs_by_file[inp.file] = []
            inputs_by_file[inp.file].append(inp)

        for h in report.accessibility.heading_structure_issues:
            if h.file not in headings_by_file:
                headings_by_file[h.file] = []
            headings_by_file[h.file].append(h)

    if images_by_file:
        print(f"\n🖼️  IMAGES WITHOUT ALT ({sum(len(v) for v in images_by_file.values())} issues):")
        for file_path, images in sorted(images_by_file.items()):
            print(f"   📄 {file_path}:")
            for img in images[:5]:  # Show first 5
                print(f"      - {img.snippet[:80]}...")
            if len(images) > 5:
                print(f"      ... and {len(images) - 5} more")

    if inputs_by_file:
        print(f"\n📝 INPUTS WITHOUT LABEL ({sum(len(v) for v in inputs_by_file.values())} issues):")
        for file_path, inputs in sorted(inputs_by_file.items()):
            print(f"   📄 {file_path}:")
            for inp in inputs[:5]:  # Show first 5
                print(f"      - {inp.input_type[:80]}")
            if len(inputs) > 5:
                print(f"      ... and {len(inputs) - 5} more")

    if headings_by_file:
        print(f"\n📑 HEADING STRUCTURE ISSUES ({sum(len(v) for v in headings_by_file.values())} issues):")
        for file_path, headings in sorted(headings_by_file.items()):
            print(f"   📄 {file_path}:")
            for h in headings:
                print(f"      - {h.issue}: \"{h.heading}\"")


def print_seo_recommendations(reports: list):
    """Print SEO recommendations based on meta tag analysis"""
    print("\n🔍 SEO META TAG RECOMMENDATIONS:")
    print("=" * 80)

    # Find files missing important meta tags
    missing_title = [r.file_path for r in reports if not r.meta.has_title]
    missing_desc = [r.file_path for r in reports if not r.meta.has_description]
    missing_og = [r.file_path for r in reports if not r.meta.has_og_image]

    if missing_title:
        print(f"\n❌ Missing <title> ({len(missing_title)} files):")
        for f in missing_title[:5]:
            print(f"   - {f}")
        if len(missing_title) > 5:
            print(f"   ... and {len(missing_title) - 5} more")

    if missing_desc:
        print(f"\n❌ Missing meta description ({len(missing_desc)} files):")
        for f in missing_desc[:5]:
            print(f"   - {f}")
        if len(missing_desc) > 5:
            print(f"   ... and {len(missing_desc) - 5} more")

    if missing_og:
        print(f"\n❌ Missing Open Graph tags ({len(missing_og)} files):")
        for f in missing_og[:5]:
            print(f"   - {f}")
        if len(missing_og) > 5:
            print(f"   ... and {len(missing_og) - 5} more")

    # Average SEO score
    avg_score = sum(r.meta.score for r in reports) / len(reports) if reports else 0
    print(f"\n📊 Average SEO Score: {avg_score:.1f}/10")

    if avg_score < 5:
        print("   ⚠️  Cần cải thiện SEO meta tags đáng kể!")
    elif avg_score < 8:
        print("   📈 SEO ở mức khá, cần bổ sung một số tags")
    else:
        print("   ✅ SEO tốt!")


def save_json_report(reports: list, output_path: str):
    """Save audit report to JSON"""
    output = {
        "summary": {
            "total_files_audited": len(reports),
            "total_issues": sum(r.total_issues for r in reports),
            "broken_links": sum(len(r.broken_links) for r in reports),
            "missing_alt": sum(len(r.accessibility.images_without_alt) for r in reports),
            "missing_labels": sum(len(r.accessibility.inputs_without_label) for r in reports),
            "heading_issues": sum(len(r.accessibility.heading_structure_issues) for r in reports),
        },
        "files": []
    }

    for report in reports:
        file_data = {
            "path": report.file_path,
            "total_issues": report.total_issues,
            "meta_score": report.meta.score,
            "meta_tags": {
                "has_title": report.meta.has_title,
                "has_description": report.meta.has_description,
                "has_og_title": report.meta.has_og_title,
                "has_og_description": report.meta.has_og_description,
                "has_og_image": report.meta.has_og_image,
                "has_canonical": report.meta.has_canonical,
            },
            "broken_links": [asdict(link) for link in report.broken_links],
            "accessibility": {
                "images_without_alt": len(report.accessibility.images_without_alt),
                "inputs_without_label": len(report.accessibility.inputs_without_label),
                "heading_issues": len(report.accessibility.heading_structure_issues),
                "missing_lang": report.accessibility.missing_lang_attribute,
                "missing_skip_link": report.accessibility.missing_skip_link,
            }
        }
        output["files"].append(file_data)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"\n💾 Đã lưu report vào: {output_path}")


def main():
    """Main audit function"""
    print("=" * 80)
    print("🔍 SA ĐÉC MARKETING HUB - AUDIT PIPELINE")
    print("   Quét: Broken Links • Meta Tags • Accessibility")
    print("=" * 80)
    print()

    # Run audit
    reports = scan_all_files()

    # Print results
    print_summary(reports)
    print_broken_links_detail(reports)
    print_accessibility_detail(reports)
    print_seo_recommendations(reports)

    # Save JSON report
    output_path = BASE_DIR / "audit-report.json"
    save_json_report(reports, str(output_path))

    print("\n" + "=" * 80)
    print("✅ AUDIT COMPLETE")
    print("=" * 80)


if __name__ == '__main__':
    main()

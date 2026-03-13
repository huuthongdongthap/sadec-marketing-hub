#!/usr/bin/env python3
"""Scan HTML files for broken links and missing meta tags."""

import os
import re
from pathlib import Path
from html.parser import HTMLParser
from dataclasses import dataclass, field
from typing import List, Dict, Set, Tuple
from collections import defaultdict


@dataclass
class HTMLAnalysis:
    """Analysis results for a single HTML file."""
    file_path: str
    relative_path: str
    has_title: bool = False
    title_content: str = ""
    has_description: bool = False
    has_viewport: bool = False
    has_charset: bool = False
    has_og_title: bool = False
    has_og_description: bool = False
    has_og_image: bool = False
    has_og_url: bool = False
    has_twitter_card: bool = False
    internal_links: List[str] = field(default_factory=list)
    external_links: List[str] = field(default_factory=list)
    internal_src: List[str] = field(default_factory=list)
    external_src: List[str] = field(default_factory=list)
    anchor_links: List[Tuple[str, str]] = field(default_factory=list)  # (href, line)


class MetaLinkParser(HTMLParser):
    """Parse HTML for meta tags and links."""

    def __init__(self):
        super().__init__()
        self.analysis = HTMLAnalysis(file_path="", relative_path="")
        self.current_line = 1

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, str]]):
        attrs_dict = dict(attrs)

        # Meta tags
        if tag == "title":
            self.analysis.has_title = True
        elif tag == "meta":
            name = attrs_dict.get("name", "").lower()
            property_ = attrs_dict.get("property", "").lower()
            http_equiv = attrs_dict.get("http-equiv", "").lower()

            if name == "description" or property_ == "description":
                self.analysis.has_description = True
            if name == "viewport":
                self.analysis.has_viewport = True
            if http_equiv == "content-type" or attrs_dict.get("charset"):
                self.analysis.has_charset = True
            if property_ == "og:title":
                self.analysis.has_og_title = True
            if property_ == "og:description":
                self.analysis.has_og_description = True
            if property_ == "og:image":
                self.analysis.has_og_image = True
            if property_ == "og:url":
                self.analysis.has_og_url = True
            if name == "twitter:card":
                self.analysis.has_twitter_card = True

        # Links
        elif tag == "a":
            href = attrs_dict.get("href", "")
            if href:
                line = self.getpos()[0]
                self.analysis.anchor_links.append((href, line))
                if href.startswith(("http://", "https://", "//")):
                    self.analysis.external_links.append(href)
                elif not href.startswith(("#", "javascript:", "mailto:", "tel:")):
                    self.analysis.internal_links.append(href)

        # Script/Image sources
        elif tag in ("script", "img", "link", "source"):
            src = attrs_dict.get("src") or attrs_dict.get("href") or ""
            if src:
                if src.startswith(("http://", "https://", "//")):
                    if tag in ("script", "img", "source"):
                        self.analysis.external_src.append(src)
                elif not src.startswith(("data:", "#")):
                    if tag in ("script", "img", "source"):
                        self.analysis.internal_src.append(src)
                    elif tag == "link" and attrs_dict.get("rel") == "stylesheet":
                        self.analysis.internal_src.append(src)


def normalize_path(path: str, base_dir: Path) -> Path:
    """Normalize a relative path to absolute."""
    # Remove query params and hash
    path = path.split("?")[0].split("#")[0]

    # Handle different path formats
    if path.startswith("/"):
        path = path[1:]

    return (base_dir / path).resolve()


def check_file_exists(path: str, base_dir: Path) -> Tuple[bool, str]:
    """Check if a file exists, return (exists, resolved_path)."""
    try:
        normalized = normalize_path(path, base_dir)
        exists = normalized.exists()
        return exists, str(normalized)
    except Exception as e:
        return False, f"Error: {e}"


def scan_html_files(root_dir: Path) -> Tuple[List[HTMLAnalysis], Dict[str, List[str]]]:
    """Scan all HTML files and return analysis + broken links."""
    results: List[HTMLAnalysis] = []
    broken_links: Dict[str, List[str]] = defaultdict(list)

    html_files = list(root_dir.rglob("*.html"))
    html_files = [f for f in html_files
                  if "node_modules" not in str(f)
                  and ".git" not in str(f)
                  and "playwright-report" not in str(f)]

    for html_file in html_files:
        try:
            with open(html_file, "r", encoding="utf-8") as f:
                content = f.read()

            parser = MetaLinkParser()
            parser.analysis.file_path = str(html_file)
            parser.analysis.relative_path = str(html_file.relative_to(root_dir))
            parser.feed(content)

            results.append(parser.analysis)

        except Exception as e:
            print(f"Error parsing {html_file}: {e}")

    # Check internal links
    for analysis in results:
        file_dir = Path(analysis.file_path).parent
        for link in analysis.internal_links:
            exists, resolved = check_file_exists(link, file_dir)
            if not exists:
                broken_links[analysis.relative_path].append(f"  ❌ {link} → {resolved}")
        for src in analysis.internal_src:
            exists, resolved = check_file_exists(src, file_dir)
            if not exists:
                broken_links[analysis.relative_path].append(f"  ❌ [src] {src} → {resolved}")

    return results, broken_links


def generate_report(results: List[HTMLAnalysis], broken_links: Dict[str, List[str]], output_file: Path):
    """Generate a markdown report."""

    # Missing meta tags
    missing_title = [a for a in results if not a.has_title]
    missing_description = [a for a in results if not a.has_description]
    missing_viewport = [a for a in results if not a.has_viewport]
    missing_charset = [a for a in results if not a.has_charset]
    missing_og_title = [a for a in results if not a.has_og_title]
    missing_og_description = [a for a in results if not a.has_og_description]
    missing_og_image = [a for a in results if not a.has_og_image]
    missing_og_url = [a for a in results if not a.has_og_url]
    missing_twitter = [a for a in results if not a.has_twitter_card]

    report = []
    report.append("# 📊 SADEC Marketing Hub - Link & Meta Tag Audit Report")
    report.append("")
    report.append(f"**Date:** 2026-03-13")
    report.append(f"**Files Scanned:** {len(results)}")
    report.append("")

    # Summary
    report.append("## 🔍 Summary")
    report.append("")
    report.append("| Issue Type | Count |")
    report.append("|------------|-------|")
    report.append(f"| Missing `<title>` | {len(missing_title)} |")
    report.append(f"| Missing `description` meta | {len(missing_description)} |")
    report.append(f"| Missing `viewport` meta | {len(missing_viewport)} |")
    report.append(f"| Missing `charset` meta | {len(missing_charset)} |")
    report.append(f"| Missing `og:title` | {len(missing_og_title)} |")
    report.append(f"| Missing `og:description` | {len(missing_og_description)} |")
    report.append(f"| Missing `og:image` | {len(missing_og_image)} |")
    report.append(f"| Missing `og:url` | {len(missing_og_url)} |")
    report.append(f"| Missing `twitter:card` | {len(missing_twitter)} |")
    report.append(f"| Files with broken links | {len(broken_links)} |")
    report.append("")

    # Broken links
    report.append("## 🔗 Broken Links")
    report.append("")
    if broken_links:
        for file_path, links in sorted(broken_links.items()):
            report.append(f"### `{file_path}`")
            for link in links:
                report.append(link)
            report.append("")
    else:
        report.append("✅ No broken internal links detected!")
        report.append("")

    # Missing meta tags by file
    report.append("## 🏷️ Missing Meta Tags by File")
    report.append("")

    files_with_issues = set()
    for a in missing_title:
        files_with_issues.add(a.relative_path)
    for a in missing_description:
        files_with_issues.add(a.relative_path)
    for a in missing_viewport:
        files_with_issues.add(a.relative_path)
    for a in missing_charset:
        files_with_issues.add(a.relative_path)

    if files_with_issues:
        for rel_path in sorted(files_with_issues):
            analysis = next(a for a in results if a.relative_path == rel_path)
            issues = []
            if not analysis.has_title:
                issues.append("❌ title")
            if not analysis.has_description:
                issues.append("❌ description")
            if not analysis.has_viewport:
                issues.append("❌ viewport")
            if not analysis.has_charset:
                issues.append("❌ charset")
            if not analysis.has_og_title:
                issues.append("❌ og:title")
            if not analysis.has_og_description:
                issues.append("❌ og:description")
            if not analysis.has_og_image:
                issues.append("❌ og:image")
            if not analysis.has_og_url:
                issues.append("❌ og:url")
            if not analysis.has_twitter_card:
                issues.append("❌ twitter:card")

            report.append(f"### `{rel_path}`")
            report.append(f"Issues: {', '.join(issues)}")
            report.append("")
    else:
        report.append("✅ All files have basic meta tags!")
        report.append("")

    # Detailed lists
    if missing_title:
        report.append("## 📝 Files Missing `<title>`")
        for a in missing_title:
            report.append(f"- `{a.relative_path}`")
        report.append("")

    if missing_description:
        report.append("## 📝 Files Missing `description` Meta")
        for a in missing_description:
            report.append(f"- `{a.relative_path}`")
        report.append("")

    if missing_viewport:
        report.append("## 📱 Files Missing `viewport` Meta")
        for a in missing_viewport:
            report.append(f"- `{a.relative_path}`")
        report.append("")

    if missing_charset:
        report.append("## 🔤 Files Missing `charset` Meta")
        for a in missing_charset:
            report.append(f"- `{a.relative_path}`")
        report.append("")

    # Recommendations
    report.append("## 💡 Recommendations")
    report.append("")
    report.append("1. **Add Open Graph tags** to all pages for social media sharing")
    report.append("2. **Add Twitter Card tags** for Twitter sharing")
    report.append("3. **Fix broken links** to avoid 404 errors")
    report.append("4. **Ensure all pages have unique `<title>`** for SEO")
    report.append("5. **Add `description` meta** for SEO and social previews")
    report.append("")

    with open(output_file, "w", encoding="utf-8") as f:
        f.write("\n".join(report))

    return output_file


def main():
    root_dir = Path(__file__).parent.parent
    output_file = root_dir / ".cto-reports" / "link-meta-audit.md"

    output_file.parent.mkdir(parents=True, exist_ok=True)

    print("🔍 Scanning HTML files for broken links and missing meta tags...")
    results, broken_links = scan_html_files(root_dir)

    print(f"📊 Analyzed {len(results)} HTML files")
    print(f"🔗 Found {len(broken_links)} files with broken links")

    report_path = generate_report(results, broken_links, output_file)
    print(f"📄 Report saved to: {report_path}")

    # Print summary
    missing_title = len([a for a in results if not a.has_title])
    missing_desc = len([a for a in results if not a.has_description])
    missing_viewport = len([a for a in results if not a.has_viewport])
    missing_charset = len([a for a in results if not a.has_charset])

    print("\n📋 Summary:")
    print(f"  - Missing <title>: {missing_title}")
    print(f"  - Missing description: {missing_desc}")
    print(f"  - Missing viewport: {missing_viewport}")
    print(f"  - Missing charset: {missing_charset}")
    print(f"  - Files with broken links: {len(broken_links)}")


if __name__ == "__main__":
    main()

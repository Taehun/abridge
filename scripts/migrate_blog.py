#!/usr/bin/env python3
"""
Blog Migration Script
Migrates posts from https://blog.taehun.dev/ to Zola blog format.
"""

import os
import re
import time
from datetime import datetime
from urllib.parse import unquote, urlparse

import requests
from bs4 import BeautifulSoup
from markdownify import markdownify as md

BASE_URL = "https://blog.taehun.dev"
OUTPUT_DIR = "content"

# 40 post paths from homepage
POST_PATHS = [
    "/2024-retrospective",
    "/kubestronaut-review",
    "/ollama-codestral",
    "/review-cks-certified",
    "/llm-blog-search-research",
    "/k8s-job-for-nfs",
    "/nextjs14-docker",
    "/gitops-startup-case",
    "/stop-from-zero-to-hero-mlops-tools",
    "/getting-started-arroyo",
    "/nextjs14-auth0-login",
    "/getting-started-llamaindex",
    "/2023-last-half-review",
    "/from-zero-to-hero-mlops-tools-5-1",
    "/from-zero-to-hero-mlops-tools-4-2",
    "/aws-certification",
    "/rsquery-review",
    "/actix-docs-hangul",
    "/rust-settings",
    "/2023-fisrt-half-review",
    "/from-zero-to-hero-mlops-tools-4-1",
    "/chatgpt-prompt-engineering",
    "/from-zero-to-hero-mlops-tools-3-2",
    "/from-zero-to-hero-mlops-tools-3-1",
    "/from-zero-to-hero-mlops-tools-2",
    "/from-zero-to-hero-mlops-tools-1",
    "/geultto-8-start",
    "/aws-data-mlops-infra",
    "/geultto-7-end",
    "/deploy-deep-learning-model",
    "/docker-buildx-",
    "/mlops-references",
    "/terraform-cdk",
    "/prepare-vision-data",
    "/start-deep-learning-with-flax_jax",
    "/2022-mlops-tools",
    "/training-yolov5",
    "/geultto-start",
    "/mlops-architecture-guide",
    "/introduction-mlops",
    "/arm-paging-2",
]


def extract_image_filename(url: str) -> str:
    """Extract filename from image URL."""
    original_url = url

    # Handle Next.js image URLs: /_next/image?url=...
    if "/_next/image" in url:
        match = re.search(r'url=([^&]+)', url)
        if match:
            url = unquote(match.group(1))

    # Handle Notion image URLs: /image/https%3A%2F%2F...
    if "/image/" in url and "notion.so" in url:
        match = re.search(r'/image/([^?]+)', url)
        if match:
            url = unquote(match.group(1))

    # URL decode multiple times if needed
    prev_url = ""
    while prev_url != url and "%" in url:
        prev_url = url
        url = unquote(url)

    # Parse the URL and get the filename
    parsed = urlparse(url)
    path = parsed.path
    filename = os.path.basename(path)

    # URL decode the filename
    filename = unquote(filename)

    # If no filename, generate one from URL hash
    if not filename or filename == "":
        filename = f"image_{abs(hash(original_url)) % 10000}.png"

    return filename


def extract_images_from_html(content_area) -> tuple[str, list[dict]]:
    """Extract image info and replace with placeholders in HTML string.

    Returns:
        tuple: (modified HTML string, list of image info dicts)
    """
    html_str = str(content_area)
    images = []
    placeholder_counter = [0]  # Use list to allow modification in nested function

    # Find all img tags
    img_pattern = re.compile(r'<img[^>]*>', re.IGNORECASE)

    def replace_img(match):
        img_tag = match.group(0)

        # Extract src
        src_match = re.search(r'src=["\']([^"\']*)["\']', img_tag)
        src = src_match.group(1) if src_match else ''

        # Extract alt
        alt_match = re.search(r'alt=["\']([^"\']*)["\']', img_tag)
        alt = alt_match.group(1) if alt_match else ''

        # Skip small icons and avatars
        if 'avatar' in src.lower() or 'icon' in src.lower():
            return ''

        # Skip if no src
        if not src:
            return ''

        # Extract original URL from Next.js image
        original_url = src
        if "/_next/image" in src:
            url_match = re.search(r'url=([^&]+)', src)
            if url_match:
                original_url = unquote(url_match.group(1))

        filename = extract_image_filename(src)

        # Store image info
        placeholder_id = f"IMGPLACEHOLDER{placeholder_counter[0]}ENDPLACEHOLDER"
        images.append({
            'id': placeholder_id,
            'filename': filename,
            'original_url': original_url,
            'alt': alt
        })
        placeholder_counter[0] += 1

        # Return a unique placeholder that won't be stripped by markdownify
        return f'<p>{placeholder_id}</p>'

    modified_html = img_pattern.sub(replace_img, html_str)
    return modified_html, images


def restore_image_placeholders(content: str, images: list[dict]) -> str:
    """Replace image placeholders with TODO comments and empty image markdown."""
    for img_info in images:
        placeholder = img_info['id']
        replacement = (
            f"\n<!-- TODO: 이미지 추가 - 파일명: {img_info['filename']}, "
            f"원본: {img_info['original_url']} -->\n\n"
            f"![{img_info['alt']}]()\n"
        )
        content = content.replace(placeholder, replacement)
    return content


def fetch_post(path: str) -> dict | None:
    """Fetch and parse a blog post."""
    url = f"{BASE_URL}{path}"

    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"  Error fetching {url}: {e}")
        return None

    soup = BeautifulSoup(response.text, 'html.parser')

    # Extract title from h1 or title tag
    title = ""
    h1 = soup.find('h1')
    if h1:
        title = h1.get_text(strip=True)
    else:
        title_tag = soup.find('title')
        if title_tag:
            title = title_tag.get_text(strip=True).split('|')[0].strip()

    # Extract date - look for date patterns in the page
    date_str = None
    page_text = soup.get_text()

    # Month name to number mapping
    month_map = {
        'january': '01', 'february': '02', 'march': '03', 'april': '04',
        'may': '05', 'june': '06', 'july': '07', 'august': '08',
        'september': '09', 'october': '10', 'november': '11', 'december': '12'
    }

    # Try English date format first: "January 7, 2025" or "Jan 7, 2025"
    eng_date_pattern = re.compile(
        r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})',
        re.IGNORECASE
    )
    eng_match = eng_date_pattern.search(page_text)
    if eng_match:
        month_name, day, year = eng_match.groups()
        month = month_map[month_name.lower()]
        date_str = f"{year}-{month}-{int(day):02d}"

    # Try Korean date format: 2024년 1월 7일
    if not date_str:
        kr_date_pattern = re.compile(r'(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일')
        kr_match = kr_date_pattern.search(page_text)
        if kr_match:
            year, month, day = kr_match.groups()
            date_str = f"{year}-{int(month):02d}-{int(day):02d}"

    # Try ISO format: 2024-01-07
    if not date_str:
        iso_pattern = re.compile(r'(\d{4})-(\d{2})-(\d{2})')
        iso_match = iso_pattern.search(page_text)
        if iso_match:
            year, month, day = iso_match.groups()
            # Validate reasonable date
            if 2000 <= int(year) <= 2030 and 1 <= int(month) <= 12 and 1 <= int(day) <= 31:
                date_str = f"{year}-{month}-{day}"

    # If no date found, try to get from meta tags
    if not date_str:
        meta_date = soup.find('meta', {'property': 'article:published_time'})
        if meta_date:
            date_str = meta_date.get('content', '')[:10]

    # Default to today if no date found
    if not date_str:
        date_str = datetime.now().strftime("%Y-%m-%d")

    # Extract tags - look for tag-like elements
    tags = []

    # Look for Notion property values (multi-select tags)
    # Find individual tag spans within property containers
    property_containers = soup.find_all(class_=re.compile(r'notion-property'))
    for container in property_containers:
        # Look for individual value spans (Notion uses nested spans for each tag)
        value_spans = container.find_all('span', recursive=True)
        for span in value_spans:
            # Get direct text content only (not nested)
            if span.string:
                tag_text = span.string.strip()
                # Filter out concatenated tags and invalid ones
                if tag_text and len(tag_text) < 30 and tag_text not in tags:
                    # Skip if it looks like concatenated tags (camelCase or multiple capitals)
                    if not re.match(r'^[A-Z][a-z]+[A-Z]', tag_text):
                        tags.append(tag_text)

    # If no tags found, try looking for select/multi-select elements
    if not tags:
        select_elements = soup.find_all(class_=re.compile(r'select'))
        for elem in select_elements:
            # Get only immediate text, not children
            for child in elem.children:
                if hasattr(child, 'string') and child.string:
                    tag_text = child.string.strip()
                    if tag_text and len(tag_text) < 30 and tag_text not in tags:
                        tags.append(tag_text)

    # Remove duplicates while preserving order
    seen = set()
    unique_tags = []
    for tag in tags:
        if tag not in seen:
            seen.add(tag)
            unique_tags.append(tag)
    tags = unique_tags

    # Find main content area
    # Notion blogs typically have content in article or main or specific div
    content_area = None

    # Try various selectors for Notion-based blogs
    selectors = [
        'article',
        'main',
        '.notion-page-content',
        '.notion-page',
        '[class*="notion"]',
    ]

    for selector in selectors:
        content_area = soup.select_one(selector)
        if content_area:
            break

    if not content_area:
        content_area = soup.find('body')

    # Remove navigation, header, footer, etc.
    for elem in content_area.find_all(['nav', 'header', 'footer', 'script', 'style', 'noscript']):
        elem.decompose()

    # Remove the h1 title from content (we'll add it in frontmatter)
    first_h1 = content_area.find('h1')
    if first_h1:
        first_h1.decompose()

    # Extract images and replace with placeholders
    content_html, images = extract_images_from_html(content_area)

    # Convert to markdown
    content_md = md(
        content_html,
        heading_style="ATX",
        bullets="-",
        code_language_callback=lambda el: el.get('class', [''])[0].replace('language-', '') if el.get('class') else ''
    )

    # Clean up markdown
    content_md = clean_markdown(content_md)

    # Restore image placeholders with TODO comments
    content_md = restore_image_placeholders(content_md, images)

    return {
        'title': title,
        'date': date_str,
        'tags': tags,
        'content': content_md,
        'path': path,
    }


def detect_code_language(code: str) -> str:
    """Detect programming language from code content."""
    code_lower = code.lower().strip()

    # Python patterns
    if re.search(r'^\s*(import |from .+ import |def |class |if __name__|print\(|async def )', code, re.MULTILINE):
        return 'python'

    # Rust patterns
    if re.search(r'^\s*(use |fn |let |mut |impl |struct |enum |pub |cargo |mod |#\[)', code, re.MULTILINE):
        return 'rust'

    # JavaScript/TypeScript patterns
    if re.search(r'^\s*(const |let |var |function |import .+ from|export |=>\s*\{|async function)', code, re.MULTILINE):
        if 'tsx' in code_lower or ': React' in code or '<>' in code:
            return 'tsx'
        if 'interface ' in code or ': string' in code or ': number' in code:
            return 'typescript'
        return 'javascript'

    # Go patterns
    if re.search(r'^\s*(package |func |import \(|type .+ struct|go |chan |defer )', code, re.MULTILINE):
        return 'go'

    # Shell/Bash patterns
    if re.search(r'^\s*(#!/bin/|apt |apt-get |brew |pip |npm |yarn |docker |kubectl |helm |cd |mkdir |ls |cat |echo |export |curl |wget |sudo |mount |cp |mv |rm |chmod |chown |grep |sed |awk |tar |zip |unzip |git |make |ssh |scp |\$ )', code, re.MULTILINE):
        return 'bash'

    # YAML patterns
    if re.search(r'^[a-zA-Z_-]+:\s*($|\n|["\'\[\{])', code, re.MULTILINE) and ':' in code:
        if 'apiVersion:' in code or 'kind:' in code:
            return 'yaml'
        if code.strip().startswith('-') or ': |' in code or ': >' in code:
            return 'yaml'

    # TOML patterns
    if re.search(r'^\[[\w.-]+\]', code, re.MULTILINE) or re.search(r'^[a-z_]+ = ', code, re.MULTILINE):
        return 'toml'

    # JSON patterns
    if code.strip().startswith('{') or code.strip().startswith('['):
        try:
            import json
            json.loads(code.strip())
            return 'json'
        except:
            pass

    # SQL patterns
    if re.search(r'^\s*(SELECT |INSERT |UPDATE |DELETE |CREATE |DROP |ALTER |FROM |WHERE )', code, re.MULTILINE | re.IGNORECASE):
        return 'sql'

    # HTML patterns
    if re.search(r'<(!DOCTYPE|html|head|body|div|span|p|a|script|style)', code, re.IGNORECASE):
        return 'html'

    # CSS patterns
    if re.search(r'^\s*[.#]?[\w-]+\s*\{', code, re.MULTILINE) and '{' in code and '}' in code:
        return 'css'

    # Dockerfile patterns
    if re.search(r'^\s*(FROM |RUN |COPY |ADD |CMD |ENTRYPOINT |ENV |EXPOSE |WORKDIR )', code, re.MULTILINE):
        return 'dockerfile'

    # Terraform/HCL patterns
    if re.search(r'^\s*(resource |provider |variable |output |data |module )"', code, re.MULTILINE):
        return 'hcl'

    # Default to empty (no language specified)
    return ''


def clean_markdown(content: str) -> str:
    """Clean up converted markdown."""
    # Remove excessive newlines
    content = re.sub(r'\n{4,}', '\n\n\n', content)

    # Remove empty links (but keep image placeholders with empty src)
    content = re.sub(r'\[([^\]!][^\]]*)\]\(\s*\)', r'\1', content)

    # Clean up whitespace
    content = content.strip()

    # Remove any remaining HTML comments that aren't our TODOs
    # Keep comments containing "TODO", remove others
    def remove_non_todo_comments(match):
        comment = match.group(0)
        if 'TODO' in comment:
            return comment
        return ''
    content = re.sub(r'<!--.*?-->', remove_non_todo_comments, content, flags=re.DOTALL)

    # Fix code blocks that might have gotten mangled
    content = re.sub(r'```\s*\n\s*```', '', content)

    # Convert notion-code blocks to proper language-specific code blocks
    def replace_notion_code(match):
        code_content = match.group(1)
        detected_lang = detect_code_language(code_content)
        return f'```{detected_lang}\n{code_content}```'

    content = re.sub(r'```notion-code\n(.*?)```', replace_notion_code, content, flags=re.DOTALL)

    # Remove any remaining "notion-code" text that got merged into code blocks
    # This happens when multiple code blocks are adjacent
    content = re.sub(r'\nnotion-code\n', '\n```\n\n```', content)
    content = re.sub(r'^notion-code$', '', content, flags=re.MULTILINE)

    return content


def generate_frontmatter(post: dict) -> str:
    """Generate Zola TOML frontmatter."""
    title_escaped = post['title'].replace('"', '\\"')

    frontmatter = f'''+++
title = "{title_escaped}"
date = {post['date']}
draft = false

[taxonomies]
tags = {post['tags']}

[extra]
author = "김태훈"
toc = true
+++
'''
    return frontmatter


def save_post(post: dict):
    """Save post as markdown file."""
    # Get slug from path (remove leading slash)
    slug = post['path'].lstrip('/')

    # Create filename
    filename = f"{slug}.md"
    filepath = os.path.join(OUTPUT_DIR, filename)

    # Generate full content
    frontmatter = generate_frontmatter(post)
    full_content = frontmatter + "\n" + post['content']

    # Write file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(full_content)

    return filepath


def main():
    """Main migration function."""
    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"Starting migration of {len(POST_PATHS)} posts...")
    print(f"Output directory: {OUTPUT_DIR}")
    print("-" * 50)

    success_count = 0
    failed_paths = []

    for i, path in enumerate(POST_PATHS, 1):
        print(f"[{i}/{len(POST_PATHS)}] Migrating: {path}")

        post = fetch_post(path)
        if post:
            filepath = save_post(post)
            print(f"  -> Saved: {filepath}")
            print(f"     Title: {post['title']}")
            print(f"     Date: {post['date']}")
            print(f"     Tags: {post['tags']}")
            success_count += 1
        else:
            print(f"  -> FAILED")
            failed_paths.append(path)

        # Be nice to the server
        time.sleep(0.5)

    print("-" * 50)
    print(f"Migration complete!")
    print(f"  Success: {success_count}/{len(POST_PATHS)}")

    if failed_paths:
        print(f"  Failed paths:")
        for path in failed_paths:
            print(f"    - {path}")


if __name__ == "__main__":
    main()

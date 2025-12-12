#!/usr/bin/env python3
"""
Image Download Script
Downloads images from blog posts and saves them to images/<post-slug>/ folder.
Images are numbered sequentially (1.png, 2.png, etc.) in order of appearance.

Image URL format: https://img-src.io/taehun/<post-slug>/1.png
"""

import os
import re
import time
from pathlib import Path
from urllib.parse import unquote

import requests

CONTENT_DIR = "content"
IMAGES_DIR = "static/images"
IMAGE_BASE_URL = "https://img-src.io/taehun"

# Request headers to mimic browser
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
    'Referer': 'https://blog.taehun.dev/',
}


def extract_image_info_from_md(filepath: str) -> list[dict]:
    """Extract image info from TODO comments in markdown file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to match TODO comments with image info
    pattern = re.compile(
        r'<!-- TODO: 이미지 추가 - 파일명: ([^,]+), 원본: ([^ ]+) -->\s*\n\s*!\[([^\]]*)\]\(\)',
        re.MULTILINE
    )

    images = []
    for match in pattern.finditer(content):
        filename, url, alt = match.groups()
        images.append({
            'filename': filename.strip(),
            'url': url.strip(),
            'alt': alt.strip(),
            'full_match': match.group(0)
        })

    return images


def get_extension_from_url(url: str) -> str:
    """Extract file extension from URL or default to .png."""
    # URL decode
    decoded_url = unquote(url)

    # Common image extensions
    for ext in ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']:
        if ext in decoded_url.lower():
            return ext

    return '.png'  # Default


def download_image(url: str, save_path: str) -> bool:
    """Download image from URL and save to path."""
    try:
        response = requests.get(url, headers=HEADERS, timeout=30, stream=True)
        response.raise_for_status()

        # Check if response is actually an image
        content_type = response.headers.get('content-type', '')
        if not content_type.startswith('image/') and 'svg' not in content_type:
            print(f"    Warning: Content-Type is {content_type}, might not be an image")

        with open(save_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        return True
    except requests.RequestException as e:
        print(f"    Error downloading: {e}")
        return False


def process_post(md_filepath: str) -> dict:
    """Process a single markdown file and download its images."""
    # Get post slug from filename
    slug = Path(md_filepath).stem

    # Skip special files
    if slug.startswith('_'):
        return {'slug': slug, 'skipped': True, 'reason': 'index file'}

    print(f"\nProcessing: {slug}")

    # Extract image info
    images = extract_image_info_from_md(md_filepath)

    if not images:
        print(f"  No images found")
        return {'slug': slug, 'images': 0, 'downloaded': 0, 'failed': 0}

    print(f"  Found {len(images)} images")

    # Create image directory for this post
    post_image_dir = os.path.join(IMAGES_DIR, slug)
    os.makedirs(post_image_dir, exist_ok=True)

    downloaded = 0
    failed = 0
    image_mapping = {}  # original_match -> local_path

    for i, img in enumerate(images, 1):
        # Get extension from original URL
        ext = get_extension_from_url(img['url'])

        # Sequential numbering: 1.png, 2.jpg, etc.
        filename = f"{i}{ext}"
        save_path = os.path.join(post_image_dir, filename)

        # URL for markdown reference
        image_url = f"{IMAGE_BASE_URL}/{slug}/{filename}"

        print(f"  [{i}/{len(images)}] {filename} (from: {img['filename'][:50]}...)")

        if os.path.exists(save_path):
            print(f"    Already exists, skipping download")
            image_mapping[img['full_match']] = image_url
            downloaded += 1
            continue

        if download_image(img['url'], save_path):
            print(f"    Downloaded successfully")
            image_mapping[img['full_match']] = image_url
            downloaded += 1
        else:
            print(f"    Failed to download")
            failed += 1

        # Be nice to the server
        time.sleep(0.3)

    # Save mapping for later markdown update (don't update now)
    if image_mapping:
        print(f"  Downloaded {downloaded} images (markdown update deferred)")

    return {
        'slug': slug,
        'images': len(images),
        'downloaded': downloaded,
        'failed': failed
    }


def main():
    """Main function to process all posts."""
    print("=" * 60)
    print("Blog Image Download Script")
    print("=" * 60)

    # Ensure directories exist
    os.makedirs(IMAGES_DIR, exist_ok=True)

    # Get all markdown files
    md_files = sorted(Path(CONTENT_DIR).glob("*.md"))

    print(f"Found {len(md_files)} markdown files in {CONTENT_DIR}")

    total_images = 0
    total_downloaded = 0
    total_failed = 0

    for md_file in md_files:
        result = process_post(str(md_file))

        if result.get('skipped'):
            continue

        total_images += result.get('images', 0)
        total_downloaded += result.get('downloaded', 0)
        total_failed += result.get('failed', 0)

    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"Total images found: {total_images}")
    print(f"Successfully downloaded: {total_downloaded}")
    print(f"Failed: {total_failed}")
    print(f"Images saved to: {IMAGES_DIR}/")


if __name__ == "__main__":
    main()

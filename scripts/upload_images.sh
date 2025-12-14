#!/bin/bash
#
# Image Upload Script
# Uploads images from static/images/<post-slug>/ to img-src.io API.
#
# Usage: ./upload_images.sh [target_path] [start_from]
# Examples:
#   ./upload_images.sh                              # Upload all directories
#   ./upload_images.sh 2024-retrospective           # Upload specific directory only
#   ./upload_images.sh 2024-retrospective 2.png     # Start from specific file
#
# API endpoint: https://api.img-src.io/api/v1/images
# API key: IMG_SRC_API_KEY environment variable
# Rate limit: 100 requests per minute
#

set -e

TARGET_PATH="${1:-}"  # Optional: specific directory to upload
START_FROM="${2:-}"   # Optional: start from specific file (skip files before this)

IMAGES_DIR="static/images"
API_URL="https://api.img-src.io/api/v1/images"
MAX_RETRIES=3
RETRY_WAIT=60  # seconds to wait on rate limit
REQUEST_DELAY=0.7  # seconds between requests

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
total_images=0
total_uploaded=0
total_failed=0

# Check API key
if [ -z "$IMG_SRC_API_KEY" ]; then
    printf "${RED}Error: IMG_SRC_API_KEY environment variable is not set${NC}\n"
    echo "Usage: export IMG_SRC_API_KEY=imgsrc_YOUR_API_KEY_HERE"
    exit 1
fi

# Check images directory
if [ ! -d "$IMAGES_DIR" ]; then
    printf "${RED}Error: Images directory not found: $IMAGES_DIR${NC}\n"
    echo "Run download_images.py first to download images."
    exit 1
fi

# Upload single image with retry logic
# Args: filepath, filename, target_path
upload_image() {
    local filepath="$1"
    local filename="$2"
    local target_path="$3"
    local retry_count=0

    while [ $retry_count -lt $MAX_RETRIES ]; do
        # Make request and capture both response and status code
        local response
        local http_code

        # Upload with filename and target_path parameters
        response=$(curl -s -w "\n%{http_code}" \
            -X POST "$API_URL" \
            -H "Authorization: Bearer $IMG_SRC_API_KEY" \
            -F "file=@$filepath;filename=$filename" \
            -F "target_path=$target_path" \
            2>&1)

        http_code=$(echo "$response" | tail -n1)
        response=$(echo "$response" | sed '$d')

        # Success
        if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
            return 0
        fi

        # Rate limit (429)
        if [ "$http_code" = "429" ]; then
            retry_count=$((retry_count + 1))
            printf "    ${YELLOW}Warning: Rate limit hit. Waiting ${RETRY_WAIT}s before retry ($retry_count/$MAX_RETRIES)...${NC}\n"
            sleep $RETRY_WAIT
            continue
        fi

        # Other errors - retry
        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $MAX_RETRIES ]; then
            printf "    ${YELLOW}Warning: HTTP $http_code. Retrying in 5s ($retry_count/$MAX_RETRIES)...${NC}\n"
            sleep 5
        fi
    done

    return 1
}

echo "============================================================"
echo "Image Upload Script (img-src.io)"
echo "============================================================"
echo "API Key: ${IMG_SRC_API_KEY:0:15}..."
echo ""

# Get post directories
if [ -n "$TARGET_PATH" ]; then
    # Upload specific directory only
    if [ -d "$IMAGES_DIR/$TARGET_PATH" ]; then
        post_dirs="$IMAGES_DIR/$TARGET_PATH"
        echo "Target: $TARGET_PATH"
    else
        printf "${RED}Error: Directory not found: $IMAGES_DIR/$TARGET_PATH${NC}\n"
        exit 1
    fi
else
    # Upload all directories
    post_dirs=$(find "$IMAGES_DIR" -mindepth 1 -maxdepth 1 -type d | sort)
fi

if [ -z "$post_dirs" ]; then
    echo "No post directories found in $IMAGES_DIR"
    exit 0
fi

post_count=$(echo "$post_dirs" | wc -l | tr -d ' ')
echo "Found $post_count post directories"

# Process each post directory
for post_dir in $post_dirs; do
    slug=$(basename "$post_dir")
    echo ""
    echo "Processing: $slug"

    # Get image files sorted by name
    image_files=$(find "$post_dir" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.gif" -o -iname "*.svg" -o -iname "*.webp" \) | sort -V)

    if [ -z "$image_files" ]; then
        echo "  No images found"
        continue
    fi

    image_count=$(echo "$image_files" | wc -l | tr -d ' ')
    echo "  Found $image_count images"

    # Initialize skip mode for START_FROM
    skip_mode="true"
    if [ -z "$START_FROM" ]; then
        skip_mode="false"
    fi

    current=0
    for img_path in $image_files; do
        current=$((current + 1))
        filename=$(basename "$img_path")
        total_images=$((total_images + 1))

        # Skip files until we reach START_FROM
        if [ -n "$START_FROM" ] && [ "$skip_mode" = "true" ]; then
            if [ "$filename" = "$START_FROM" ]; then
                skip_mode="false"
            else
                echo "  [$current/$image_count] Skipping $filename"
                continue
            fi
        fi

        echo "  [$current/$image_count] Uploading $filename -> $slug/$filename"

        if upload_image "$img_path" "$filename" "$slug"; then
            printf "    ${GREEN}Uploaded successfully${NC}\n"
            total_uploaded=$((total_uploaded + 1))
        else
            printf "    ${RED}Failed to upload${NC}\n"
            total_failed=$((total_failed + 1))
        fi

        # Rate limit protection
        sleep $REQUEST_DELAY
    done
done

echo ""
echo "============================================================"
echo "Summary"
echo "============================================================"
echo "Total images: $total_images"
printf "Successfully uploaded: ${GREEN}$total_uploaded${NC}\n"
if [ $total_failed -gt 0 ]; then
    printf "Failed: ${RED}$total_failed${NC}\n"
else
    echo "Failed: $total_failed"
fi

#!/bin/bash

BASE_DIR="site" 
OUTPUT_FILE="site/assets/pages.json"

# Function to scan directories and generate JSON
scan_directories() {
    local dir="$1"
    local base_url="$2"
    local pages=()

    for file in "$dir"/*; do
        if [ -d "$file" ]; then
            local index_path="$file/index.html"
            if [ -f "$index_path" ]; then
                local title=$(basename "$file" | sed -e 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)}1')
                local url="$base_url/$(basename "$file")/"
                pages+=("{\"title\": \"$title\", \"url\": \"$url\"}")
            fi
            local sub_pages=$(scan_directories "$file" "$base_url/$(basename "$file")")
            if [ -n "$sub_pages" ]; then
                pages+=("$sub_pages")
            fi
        fi
    done

    echo "${pages[@]}" | jq -s '. | flatten'
}

# Generate pages.json
scan_directories "$BASE_DIR" "" > "$OUTPUT_FILE"
echo "Index generated: $(cat "$OUTPUT_FILE")"
#!/bin/bash

# Paths
DATA_DIR="site/data"
OUTPUT_DIR="site/social"
TEMPLATE="templates/validator-template.html"

# Node.js script for rendering
RENDER_SCRIPT="scripts/render_images.js"

# Extract the correct filename from files.json
csv_file=$(jq -r '.[0].file' "$DATA_DIR/files.json")  # Extract the "file" key from the first object

# Construct the full path
csv_file_path="$DATA_DIR/$csv_file"

# Check if the CSV file exists
if [ ! -f "$csv_file_path" ]; then
  echo "Error: CSV file not found: $csv_file_path"
  exit 1
fi

# Check if the template exists
if [ ! -f "$TEMPLATE" ]; then
  echo "Error: Template file not found: $TEMPLATE"
  exit 1
fi

# Create the output directory
mkdir -p "$OUTPUT_DIR"

# Extract the second row (actual header)
header=$(sed -n '2p' "$csv_file_path")

# Extract start date from column 5
start_date=$(echo "$header" | awk -F',' '{print $5}' | sed -E 's/ - .*//g' | sed -E 's/ \([0-9]+\)//g')

# Extract last non-empty column
end_date=$(echo "$header" | awk -F',' '{for (i=NF; i>0; i--) if ($i != "") {print $i; break}}' | sed -E 's/ - .*//g' | sed -E 's/ \([0-9]+\)//g')

# Ensure values exist
if [[ -n "$start_date" && -n "$end_date" ]]; then
  date_range="$start_date - $end_date"
else
  echo "Error: Could not determine start or end date."
  exit 1
fi

# Initialize validator counter
validator_count=0

# Inform users 
echo "Generating social cards"

# Read the CSV file (skipping the header row)
while IFS=',' read -r -a columns; do
  # Skip empty moniker lines
  if [ -z "${columns[0]}" ]; then
    continue
  fi

  # Extract the necessary columns
  moniker="${columns[0]}"
  total_points="${columns[1]}"

  # Convert perfection bonus to 🏆 emojis or "0" if zero
  if [[ "${columns[3]}" =~ ^[0-9]+$ ]]; then
    perfection_bonus=$([[ "${columns[3]}" -eq 0 ]] && echo "0" || printf '🏆 %.0s' $(seq 1 "${columns[3]}"))
  else
    perfection_bonus="0"
  fi

  echo "Generating social card for $moniker"

  # Handle additional dynamic columns
  rest_columns=("${columns[@]:4}")

  # Clean up validator moniker to create folder
  folder_name=$(echo "$moniker" | tr ' ' '_' | tr -cd '[:alnum:]_ -')

  # Create a folder for the validator
  validator_dir="$OUTPUT_DIR/$folder_name"
  mkdir -p "$validator_dir"

  # File paths
  output_image="$validator_dir/social-card.webp"
  output_html="$validator_dir/index.html"

  # Escape special characters for the HTML template
  escaped_moniker=$(printf '%s' "$moniker" | sed -e 's/[&/\]/\\&/g')
  escaped_date_range=$(printf '%s' "$date_range" | sed -e 's/[&/\]/\\&/g')

  # Generate the HTML page
  html_content=$(cat "$TEMPLATE")
  html_content=$(echo "$html_content" | sed "s/{{ validator_name }}/$escaped_moniker/g")
  html_content=$(echo "$html_content" | sed "s/{{ total_points }}/$total_points/g")
  html_content=$(echo "$html_content" | sed "s/{{ perfection_bonus }}/$perfection_bonus/g")
  html_content=$(echo "$html_content" | sed "s/{{ date_range }}/$escaped_date_range/g")
  html_content=$(echo "$html_content" | sed "s,{{ social_card }},./social-card.webp,g")
  html_content=$(echo "$html_content" | sed "s,{{ main_page_link }},../../,g")

  # Write the HTML file
  echo "$html_content" > "$output_html"

  # Render the HTML to a webp image
  node "$RENDER_SCRIPT" "$output_html" "$output_image"

  # Increment validator counter
  ((validator_count++))
done < <(tail -n +3 "$csv_file_path")

# Print concise summary log
echo "Date Range: $date_range"
echo "Generated pages and social cards for $validator_count participants."
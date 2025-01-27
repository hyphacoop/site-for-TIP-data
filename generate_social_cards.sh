#!/bin/bash

# Paths
DATA_DIR="data"
OUTPUT_DIR="validators"
FONT="assets/fonts/Symbola.ttf" # Monospace font for text
TEMPLATE="templates/validator_template.html"

# Determine the current month and year
current_month=$(date +%B | tr '[:upper:]' '[:lower:]') # Convert to lowercase
current_year=$(date +%Y)

# Construct the filename
csv_file="$DATA_DIR/${current_month}_${current_year}.csv"

# Check if the CSV file exists
if [ ! -f "$csv_file" ]; then
  echo "Error: CSV file not found: $csv_file"
  exit 1
fi

# Check if the template exists
if [ ! -f "$TEMPLATE" ]; then
  echo "Error: Template file not found: $TEMPLATE"
  exit 1
fi

# Create the output directory
mkdir -p "$OUTPUT_DIR"

# Extract the start and end dates
start_date=$(head -n 2 "$csv_file" | tail -n 1 | cut -d',' -f4 | cut -d'-' -f1 | xargs)
end_date=$(head -n 2 "$csv_file" | tail -n 1 | awk -F',' '{for(i=NF;i>0;i--) if($i!="") {print $i; break}}' | cut -d'-' -f1 | xargs)
date_range="$start_date - $end_date"

# Initialize validator counter
validator_count=0

# Read the CSV file (skipping the header row)
while IFS=',' read -r -a columns; do
  # Skip empty moniker lines
  if [ -z "${columns[0]}" ]; then
    continue
  fi

  # Extract the necessary columns
  moniker="${columns[0]}"
  total_points="${columns[1]}"
  perfection_bonus="${columns[2]}"

  # Handle additional dynamic columns
  rest_columns=("${columns[@]:3}")

  # Clean up moniker for filenames (allow emojis but remove invalid characters)
  folder_name=$(echo "$moniker" | tr ' ' '_' | tr -cd '[:alnum:]_ -')

  # Create a folder for the validator
  validator_dir="$OUTPUT_DIR/$folder_name"
  mkdir -p "$validator_dir"

  # File paths
  output_image="$validator_dir/social-card.webp"
  output_html="$validator_dir/index.html"

  # Generate the social card with updated dates
  convert -size 1200x630 xc:white \
    -gravity NorthWest \
    -font "$FONT" -pointsize 48 -fill black \
    -annotate +50+50 "$moniker" \
    -font "$FONT" -pointsize 36 \
    -annotate +50+150 "Date Range: $date_range" \
    -annotate +50+250 "Total Points: $total_points" \
    -annotate +50+350 "Perfection Bonus: $perfection_bonus" \
    "$output_image"

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

  # Increment validator counter
  ((validator_count++))
done < <(tail -n +3 "$csv_file")

# Print concise summary log
echo "Date Range: $date_range"
echo "Generated pages and social cards for $validator_count validators."
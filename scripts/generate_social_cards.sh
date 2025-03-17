#!/bin/bash

# Paths
DATA_DIR="site/data"
OUTPUT_DIR="site/social"
TEMPLATE="templates/validator-template.html"

# Node.js script for rendering
RENDER_SCRIPT="scripts/render_images.js"

# Check if a CSV file argument is provided; if not, default to the latest file
if [ -n "$1" ]; then
  csv_file_path="$1"
else
  csv_file_path=$(ls -t "$DATA_DIR"/*.csv | head -n 1)
  echo "No CSV argument provided, using latest: $csv_file_path"
fi

# Extract the filename without path
csv_file=$(basename "$csv_file_path")

# Extract month and year (Assuming `month_year.csv` format)
monthly_folder="${csv_file%.csv}"
date_range=$(echo "$monthly_folder" | sed -E 's/_/ /g' | sed -E 's/(^| )([a-z])/\U\2/g')

# Ensure the CSV file exists
if [ ! -f "$csv_file_path" ]; then
  echo "Error: CSV file not found: $csv_file_path"
  exit 1
fi

# Start the local http server that will render HTML to images
node scripts/start_server.js &  
SERVER_PID=$!
echo "Started Express server with PID $SERVER_PID"

# Construct the full path
csv_file_path="$DATA_DIR/$csv_file"
  
# Check if the CSV file exists
if [ ! -f "$csv_file_path" ]; then
  echo "Error: CSV file not found: $csv_file_path"
  continue
fi

# Check if the template exists
if [ ! -f "$TEMPLATE" ]; then
  echo "Error: Template file not found: $TEMPLATE"
  exit 1
fi

# Create the monthly folder inside the output directory
mkdir -p "$OUTPUT_DIR/$monthly_folder"

echo "Processing $csv_file ($date_range)..."

# Initialize validator counter
validator_count=0

# Inform users 
echo "Generating social cards"

# Extract headers from the second row
headers=$(sed -n '2p' "$csv_file_path")
IFS="," read -r -a headers <<< "$headers"

# Find the index of 'Unjailed bonus' (if it exists)
unjailed_bonus_index=-1
for i in "${!headers[@]}"; do
  if [[ "${headers[$i]}" =~ ^Unjailed\ bonus ]]; then
    unjailed_bonus_index=$i
    break
  fi
done

# First Pass to find Max Possible Points
max_total_points=0
while IFS="," read -r -a fields; do
  total_points="${fields[1]}"
  total_points="${total_points#\"}"
  total_points="${total_points%\"}"

  if [[ "$total_points" =~ ^[0-9]+$ ]]; then
    if (( total_points > max_total_points )); then
      max_total_points=$total_points
    fi
  fi
done < <(tail -n +3 "$csv_file_path")

# Read the CSV file (skipping the header row)
while IFS= read -r line; do
  # Initialize empty array for fields
  fields=()
  field=""
  in_quotes=false

  # Read character by character to handle quoted CSV fields correctly
  for (( i=0; i<${#line}; i++ )); do
    char="${line:$i:1}"
    
    if [[ "$char" == '"' ]]; then
      # Check if this is an escaped quote (""") inside a quoted field
      if [[ "$in_quotes" == true && "${line:$i+1:1}" == '"' ]]; then
        field+='"'
        ((i++))  # Skip the next quote character
      else
        in_quotes=$([ "$in_quotes" == true ] && echo false || echo true)  # Toggle quote state
      fi
    elif [[ "$char" == ',' && "$in_quotes" == false ]]; then
      fields+=("$field")  # Add field to array
      field=""  # Reset field buffer
    else
      field+="$char"
    fi
  done
  
  # Add the last field
  fields+=("$field")

  # Extract fields safely
  moniker="${fields[0]}"
  total_points="${fields[1]}"
  perfection_bonus="${fields[3]}"

  # Remove surrounding quotes if present
  moniker="${moniker#\"}"
  moniker="${moniker%\"}"
  total_points="${total_points#\"}"
  total_points="${total_points%\"}"
  perfection_bonus="${perfection_bonus#\"}"
  perfection_bonus="${perfection_bonus%\"}"


  # Extract and clean unjailed bonus only if the column exists
  if [[ $unjailed_bonus_index -ne -1 ]]; then
    unjailed_bonus="${fields[$unjailed_bonus_index]}"
    unjailed_bonus="${unjailed_bonus#\"}"
    unjailed_bonus="${unjailed_bonus%\"}"
  else
    unjailed_bonus=""
  fi

  # Format total points with the highest total
  total_points_formatted="$total_points / $max_total_points"

  # Skip empty moniker lines
  if [ -z "$moniker" ]; then
    continue
  fi

  # Store the numeric value of perfection bonus for the renderer
  numeric_perfection_bonus=$((perfection_bonus + unjailed_bonus))

  echo "Generating social card for $moniker..."

  # Convert perfection bonus to 🏆 emojis or "0" if zero
  if [[ "$perfection_bonus" =~ ^[0-9]+$ ]]; then
    perfection_bonus=$([[ "$perfection_bonus" -eq 0 ]] && echo "0" || printf '🏆 %.0s' $(seq 1 "$perfection_bonus"))
  else
    perfection_bonus="0"
  fi

  # Convert unjailed bonus to emoji or "0" if zero
  if [[ "$unjailed_bonus" =~ ^[0-9]+$ ]]; then
    unjailed_bonus=$([[ "$unjailed_bonus" -eq 0 ]] && echo "0" || printf '🏅 %.0s' $(seq 1 "$unjailed_bonus"))
  else
    unjailed_bonus=""
  fi

  # Clean up validator moniker to create folder
  folder_name=$(echo "$moniker" | tr ' ' '_' | tr -cd '[:alnum:]_ -')

  # Create a folder for the validator inside the monthly folder
  validator_dir="$OUTPUT_DIR/$monthly_folder/$folder_name"
  mkdir -p "$validator_dir"

  # File paths
  output_image="$validator_dir/social-card.webp"
  output_html="$validator_dir/index.html"

  # Escape special characters for the HTML template
  escaped_moniker=$(printf '%s' "$moniker" | sed -e 's/[&/\]/\\&/g')
  escaped_date_range=$(printf '%s' "$date_range" | sed -e 's/[&/\]/\\&/g')

  # Determine roots class based on perfection bonus
  if [[ "$numeric_perfection_bonus" -eq 0 ]]; then
      roots_class="roots1"
  elif [[ "$numeric_perfection_bonus" -eq 1 ]]; then
      roots_class="roots2"
  else
      roots_class="roots3"
  fi

  escaped_total_points=$(printf '%s' "$total_points_formatted" | sed -e 's/[&/\\]/\\&/g')
  
  # Generate the HTML page
  html_content=$(cat "$TEMPLATE")
  html_content=$(echo "$html_content" | sed "s/{{ validator_name }}/$escaped_moniker/g")
  html_content=$(echo "$html_content" | sed "s/{{ total_points }}/$escaped_total_points/g")
  html_content=$(echo "$html_content" | sed "s/{{ perfection_bonus }}/$perfection_bonus/g")
  html_content=$(echo "$html_content" | sed "s/{{ date_range }}/$escaped_date_range/g")
  html_content=$(echo "$html_content" | sed "s,{{ social_card }},./social-card.webp,g")
  html_content=$(echo "$html_content" | sed "s,{{ main_page_link }},../../,g")
  html_content=$(echo "$html_content" | sed "s/{{ roots_bg }}/$roots_class/g")

  if [[ $unjailed_bonus_index -ne -1 ]]; then
    html_content=$(echo "$html_content" | sed "s/{{ unjailed_bonus }}/$unjailed_bonus/g")
  else
    html_content=$(echo "$html_content" | sed '/<tr><td>Unjailed Bonus<\/td><td>{{ unjailed_bonus }}<\/td><\/tr>/d')
  fi

  # Write the HTML file
  echo "$html_content" > "$output_html"

  # Render the HTML to a webp image
  node "$RENDER_SCRIPT" "$output_html" "$output_image"

  # Increment validator counter
  ((validator_count++))
done < <(tail -n +3 "$csv_file_path")  # Skip header row

# Print concise summary log
echo "Generated pages and social cards for $validator_count participants in $date_range."


echo "All CSV files processed successfully!"

# Kill the Express server after processing all files
kill $SERVER_PID
echo "Stopped Express server."
echo "Social card generation complete."
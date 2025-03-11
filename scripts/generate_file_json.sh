#!/bin/bash

# Define the data folder and output file
DATA_FOLDER="./site/data"
OUTPUT_FILE="$DATA_FOLDER/files.json"

# Start the JSON array
echo "[" > $OUTPUT_FILE

# Create an array to store file details
declare -a FILE_ENTRIES

# Iterate over CSV files in the data folder
for FILE in "$DATA_FOLDER"/*.csv; do
  if [ -f "$FILE" ]; then
    BASENAME=$(basename "$FILE")
    NAME_NO_EXT=$(echo "$BASENAME" | sed 's/.csv//')

    # Extract month and year
    MONTH_NAME=$(echo "$NAME_NO_EXT" | cut -d'_' -f1)
    YEAR=$(echo "$NAME_NO_EXT" | cut -d'_' -f2)

    # Convert month name to a numerical value for sorting
    MONTH_NUM=$(date -d "1 $MONTH_NAME $YEAR" +%m 2>/dev/null)
    
    if [ -n "$MONTH_NUM" ]; then
      LABEL="$(echo "$MONTH_NAME" | awk '{print toupper(substr($0,1,1))tolower(substr($0,2))}') $YEAR"
      FILE_ENTRIES+=("$YEAR-$MONTH_NUM-$BASENAME|$LABEL")
    fi
  fi
done

# Sort the files in reverse order (newest first)
IFS=$'\n' SORTED_FILES=($(sort -r <<< "${FILE_ENTRIES[*]}"))
unset IFS

# Write sorted entries to the JSON file
for ENTRY in "${SORTED_FILES[@]}"; do
  FILE_NAME=$(echo "$ENTRY" | cut -d'|' -f1 | cut -d'-' -f3)
  LABEL=$(echo "$ENTRY" | cut -d'|' -f2)
  echo "  { \"file\": \"$FILE_NAME\", \"label\": \"$LABEL\" }," >> "$OUTPUT_FILE"
done

# Remove the trailing comma from the last JSON object
sed -i '$ s/,$//' "$OUTPUT_FILE"

# Close the JSON array
echo "]" >> "$OUTPUT_FILE"

# Print confirmation
echo "Generated $OUTPUT_FILE with sorted contents:"
cat "$OUTPUT_FILE"

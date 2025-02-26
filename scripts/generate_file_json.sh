#!/bin/bash

# Define the data folder and output file
DATA_FOLDER="./site/data"
OUTPUT_FILE="$DATA_FOLDER/files.json"

# Start the JSON array
echo "[" > $OUTPUT_FILE

# Iterate over CSV files in the data folder
for FILE in $DATA_FOLDER/*.csv; do
  if [ -f "$FILE" ]; then
    BASENAME=$(basename "$FILE")
    # Extract the month and year from the file name
    NAME_NO_EXT=$(echo "$BASENAME" | sed 's/.csv//')
    MONTH=$(echo "$NAME_NO_EXT" | cut -d'_' -f1 | awk '{print toupper(substr($0,1,1))tolower(substr($0,2))}')
    YEAR=$(echo "$NAME_NO_EXT" | cut -d'_' -f2)
    LABEL="$MONTH $YEAR"

    # Append the file entry to the JSON file
    echo "  { \"file\": \"$BASENAME\", \"label\": \"$LABEL\" }," >> $OUTPUT_FILE
  fi
done

# Remove the trailing comma from the last JSON object
sed -i '$ s/,$//' $OUTPUT_FILE

# Close the JSON array
echo "]" >> $OUTPUT_FILE

# Print confirmation
echo "Generated $OUTPUT_FILE with the following contents:"
cat $OUTPUT_FILE

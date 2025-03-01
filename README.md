# site-for-TIP-data

Site that displays TIP data

## Overview

This is a basic website designed to display TIP data from the weekly testnet events. It is built using HTML, CSS, and vanilla JavaScript.

## Deployment

We use GitHub Actions for deployment via GitHub Pages to the [testnets.hypha.coop](https://testnets.hypha.coop) domain. The staging branch is deployed to Netlify at [hubtestnets.netlify.app](https://hubtestnets.netlify.app/).  

### Key Features

- **Dynamic Banner**: displays announcements from `announcements.json`. If the `banner` value is empty, the banner will not be shown.
- **Dynamic Dropdown**: populates a dropdown menu with available CSV files listed in `files.json`.
  - Filename expected is `month_year.csv`
  - Filename will be used to generate the dropdown text in the following format `Month YEAR`
- **CSV Parsing**: reads and displays CSV data in a table format.
- **Metadata Display**: extracts and displays important metadata from the CSV (e.g., last updated information, headers with full descriptions).
  - The two first rows of the table are extracted and appended to a list above the table
  - First row contains the date for the last update and information regarding jailing and bonuses
  - Second row takes the week's task and creates a list with that information
  - Information following the `-` is removed from the table to keep the columns small and table clean
- **CSV Parsing**: handles special characters, quoted fields, and multi-line CSV entries.

---

## File Structure

### Root

- `index.html`: The main HTML file for the site.
- `assets/styles.css`: Styles for the site.
- `assets/script.js`: The JavaScript logic for dynamically loading and displaying data.
- `generate_file_json.sh`: A script to generate `files.json` based on the CSV files in the `/data` directory.
- `README.md`: Project documentation.

### Data

- `data/files.json`: Lists available CSV files to populate the dropdown.
- `data/announcements.json`: Contains the text for the announcement banner.
- `data/*.csv`: CSV files containing TIP data (e.g., `january_2025.csv`).

---

## Usage

### How to Add New Data

1. Place new CSV files in the `/data` folder. Files should follow the naming convention:
    - [month]_[year].csv

2. The GH action will generate `files.json`, an index file used to populate the dropdown selector and load monthly data. The GH page branch will be automatically updated and the website deployed to this address https://hyphacoop.github.io/site-for-TIP-data/ 

3. Update announcements.json if needed
```json
{
  "banner": "Upcoming event: Jan 28 - Announcement details"
}
```
4. If no announcements are needed the value of banner can be left empty and the banner will disappear.
```json
{
  "banner": ""
}
```


### How to Serve the Site Locally

To test the site locally, you need to serve it through a web server:

#### Using Python

`python3 -m http.server 8000`

- Access the site at: http://localhost:8000

#### Using Node.js

```javascript
npm install -g http-server
http-server .
```
- Access the site at: http://localhost:8080


### Development

#### To Do

- Improve styles and layout
- Optimize the site for mobile screen and overall responsiveness  

#### Notes

- Compatibility: the project uses vanilla JavaScript and does not rely on any external libraries.
- Limitations: Currently, the script assumes all CSV files follow the same format and structure.
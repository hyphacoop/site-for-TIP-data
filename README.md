# site-for-TIP-data

Site that displays TIP data

## Overview

This is a basic website designed to display TIP data from the weekly testnet events. It is built using HTML, CSS, and vanilla JavaScript.

## Deployment

We use GitHub Actions for deployment via GitHub Pages to the [testnets.hypha.coop](https://testnets.hypha.coop) domain. The staging branch is deployed to Netlify at [hubtestnets.netlify.app](https://hubtestnets.netlify.app/).  

## Creating new pages

### From template  

- Create a new folder in `site` and name it to match the new page title.
- Copy `page-template.html` from `template` folder to the newly created folder.
- In this new folder, rename `page-template.html` to `index.html`
- Fill the template with your content.

The elements in `{{ }}` needs to be populated by replacing these placeholders with the desired content:
- {{pageTitle}}
- {{pageDescription}}
- {{pageSlug}}
- {{mainHeading}}
- {{subHeading}}
- {{pageContent}}
- {{pageContentContinued}} (optional)

`pageSlug` should match the name of the folder that was just created. The social card image that will be displayed when sharing the link to this new page on social media should be placed in the same folder and named `share-card.png`. Sharte cards are created from screenshots of the page. Get in touch with Vincent if you need help with creating the share card. 

We use distinct background images for each pages. The template currently reuses the background-image found on the home page by using the class `roots-bg`. This image is set on the body element with CSS. In `site/assets/styles.css`, on L36:

```css
  @media screen and (min-width: 65em) {
    .roots-bg {
        background-image: url(./images/trollius.webp);
        background-repeat: no-repeat;
        background-position: top right;
        background-size: 30%;
    }
    .canopy {
      background-image: url(./images/new_canopy.webp);
      background-repeat: no-repeat;
      background-position: top right;
      background-size: 30%;
    }
}
```

You can run the script titled `generate_page_json.sh` to update the navigation locally but this is optional since this script runs on build.
When testing locally, you will need to run the script from the root directory:
`./scripts/generate_pages_json.sh`

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

- `site/index.html`: The main HTML file for the site.
- `site/assets/styles.css`: Styles for the site.
- `site/assets/script.js`: The JavaScript logic for dynamically loading and displaying data.
- `scripts/generate_file_json.sh`: A script to generate `files.json` based on the CSV files in the `/data` directory.
- `README.md`: Project documentation.

### Data

- `site/data/files.json`: Lists available CSV files to populate the dropdown.
- `site/data/announcements.json`: Contains the text for the announcement banner.
- `site/data/*.csv`: CSV files containing TIP data (e.g., `january_2025.csv`).

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

`cd site && python3 -m http.server 8000`

- Access the site at: http://localhost:8000

#### Using Node.js

```javascript
npm install -g http-server
http-server ./site/
```
- Access the site at: http://localhost:8080


### Development

#### To Do

- Improve styles and layout
- Optimize the site for mobile screen and overall responsiveness  

#### Notes

- Compatibility: the project uses vanilla JavaScript and does not rely on any external libraries.
- Limitations: Currently, the script assumes all CSV files follow the same format and structure.
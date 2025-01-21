// DOM Elements
const bannerContent = document.getElementById('banner-content');
const banner = document.getElementById('banner');
const monthSelector = document.getElementById('month-selector');
const tableHeaders = document.getElementById('table-headers');
const tableBody = document.querySelector('#scores-table tbody');
const metadataList = document.getElementById('metadata-list');

// Fetch announcements and update the banner
async function loadAnnouncements() {
  try {
    const response = await fetch('data/announcements.json');
    const data = await response.json();

    // Update the banner with the announcement
    if (data.banner) {
      bannerContent.textContent = data.banner;
      banner.style.display = 'block';
    } else {
      banner.style.display = 'none';
    }
  } catch (error) {
    console.error('Error loading announcements:', error);
    banner.textContent = 'Failed to load announcements.';
  }
}

// Fetch and populate the dropdown menu dynamically
async function loadFileList() {
  try {
    const response = await fetch('data/files.json');
    const files = await response.json();

    // Populate the dropdown
    files.forEach(file => {
      const option = document.createElement('option');
      option.value = file.file;
      option.textContent = file.label;
      monthSelector.appendChild(option);
    });

    // Load the first file by default
    if (files.length > 0) {
      loadCSV(files[0].file);
    }
  } catch (error) {
    console.error('Error loading file list:', error);
    banner.textContent = 'Failed to load file list.';
  }
}

// Load and parse a CSV file, then populate the table and metadata
async function loadCSV(file) {
    try {
      const response = await fetch(`data/${file}`);
      const csvText = await response.text();
      const rows = parseCSV(csvText);
  
      // Extract the first two rows
      const firstRow = rows[0];
      const secondRow = rows[1];
      const tableRows = rows.slice(2);
  
      // Populate the metadata list
      metadataList.innerHTML = '';
      firstRow.forEach(cell => {
        if (cell.trim()) {
          const li = document.createElement('li');
          li.textContent = cell.trim();
          metadataList.appendChild(li);
        }
      });
  
        // Format headers (second row) and add to the metadata list, skipping the first two cells
        secondRow.slice(2).forEach(cell => {
            if (cell.trim()) {
            const li = document.createElement('li');
            li.textContent = cell.trim(); // Full header with text after "-"
            metadataList.appendChild(li);
            }
        });
  
      // Clear existing table data
      tableHeaders.innerHTML = '';
      tableBody.innerHTML = '';
  
      // Populate table headers (trimmed text before "-")
      secondRow.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header.split('-')[0].trim(); // Trim text after "-"
        tableHeaders.appendChild(th);
      });
  
      // Populate table rows
      tableRows.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
          const td = document.createElement('td');
          td.textContent = cell.trim();
          tr.appendChild(td);
        });
        tableBody.appendChild(tr);
      });
  
    } catch (error) {
      console.error('Error loading CSV:', error);
      bannerContent.textContent = `Failed to load data for ${file}`;
    }
  }
  
  
  // CSV Parsing Function
  function parseCSV(csvText) {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let inQuotes = false;
  
    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];
  
      if (char === '"' && inQuotes && nextChar === '"') {
        // Handle escaped quotes within a quoted field
        currentCell += '"';
        i++; // Skip the next quote
      } else if (char === '"') {
        // Toggle inQuotes flag
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        // End of a cell
        currentRow.push(currentCell);
        currentCell = '';
      } else if (char === '\n' && !inQuotes) {
        // End of a row
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        // Regular character within a cell
        currentCell += char;
      }
    }
  
    // Push the last row (if any)
    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell);
      rows.push(currentRow);
    }
  
    return rows;
  }
  
// Event listener for month selection
monthSelector.addEventListener('change', (e) => {
  loadCSV(e.target.value);
});

// Initialize the page
loadAnnouncements();
loadFileList();

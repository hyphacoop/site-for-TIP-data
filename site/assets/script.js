// DOM Elements
const bannerContent = document.getElementById('banner-content');
const banner = document.getElementById('banner');
const monthSelector = document.getElementById('month-selector');
const tableHeaders = document.getElementById('table-headers');
const tableBody = document.querySelector('#scores-table tbody');
const metadataList = document.getElementById('metadata-list');
const eventInfo = document.getElementById('event-info');

// Fetch announcements and update the banner
async function loadAnnouncements() {
  try {
    const response = await fetch('data/announcements.json');
    const data = await response.json();

    // Update the banner with the announcement
    if (data.banner) {
      bannerContent.textContent = data.banner;
      if (data.link) {
        banner.style.cursor = 'pointer';
        banner.classList.add('link-hover');
        banner.onclick = () => {
          window.location.href = data.link;
        };
      } else {
        banner.style.cursor = 'default';
        banner.onclick = null;
      }
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

        // Clear existing event info
        eventInfo.innerHTML = '';

        // Format headers (second row) and add to the metadata list, skipping the first two cells
        secondRow.slice(2).forEach(cell => {
            if (cell.trim()) {
            const li = document.createElement('li');
            li.textContent = cell.trim(); // Full header with text after "-"
            eventInfo.appendChild(li);
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
        row.forEach((cell, index) => {
          const td = document.createElement('td');
          td.textContent = cell.trim();

          // Add link emoji to the moniker column (first column)
          if (index === 0) {
            const formattedMoniker = formatMoniker(cell.trim());
            const linkEmoji = document.createElement('span');
            linkEmoji.textContent = ' 🔗';
            linkEmoji.style.cursor = 'pointer';
            linkEmoji.title = 'Copy link to clipboard';
            linkEmoji.addEventListener('click', () => generateLinkForClipboard(formattedMoniker, td));

            // Append the link emoji to the cell content
            td.textContent = cell.trim();

            // Update the data-content attribute to include the link emoji
            td.setAttribute('data-content', cell.trim() + ' 🔗');

            // Append the link emoji to the cell for interactivity
            td.appendChild(linkEmoji);
          } else {
            // For other columns, set the data-content attribute as usual
            td.setAttribute('data-content', cell.trim());
          }

          tr.appendChild(td);
        });
        tableBody.appendChild(tr);
      });
  
    } catch (error) {
      console.error('Error loading CSV:', error);
      bannerContent.textContent = `Failed to load data for ${file}`;
    }
  }
  
  
  // Format moniker to match folder names
  function formatMoniker(moniker) {
    return moniker
      .trim()
      .replace(/ /g, '_') // Replace spaces with underscores
      .replace(/[^a-zA-Z0-9_ -]/g, ''); // Remove invalid characters
  }

  // Generate link for clipboard
  function generateLinkForClipboard(moniker, tdElement) {
    const baseUrl = window.location.origin;

    // Get the selected month from the dropdown
    const selectedMonth = monthSelector.options[monthSelector.selectedIndex].text.toLowerCase().replace(' ', '_');

    // Construct the full URL
    const validatorUrl = `${baseUrl}/social/${selectedMonth}/${moniker}/`;
 
    // Copy the URL to the clipboard
    navigator.clipboard.writeText(validatorUrl)
      .then(() => {
        // Add visual feedback by changing the border color of the entire <td>
        tdElement.style.border = '1px solid #4CAF50'; // Green border for success
        setTimeout(() => {
          tdElement.style.border = ''; // Reset the border after 1 second
        }, 800);
      })
      .catch(() => {
        // Add visual feedback for failure
        tdElement.style.border = '1px solid #FF0000'; // Red border for failure
        setTimeout(() => {
          tdElement.style.border = ''; // Reset the border after 1 second
        }, 800);
      });
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

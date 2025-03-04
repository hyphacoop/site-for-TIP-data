const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    // Get command-line arguments
    const args = process.argv.slice(2);
    const htmlPath = args[0];
    const outputPath = args[1];
    const modifiedHtmlPath = path.join(path.dirname(outputPath), 'modified.html');

    // Check if HTML file exists
    if (!fs.existsSync(htmlPath)) {
        console.error(`Error: HTML file not found at ${htmlPath}`);
        process.exit(1);
    }

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Launch Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Load the HTML file
    await page.goto(`file://${path.resolve(htmlPath)}`);

    // Adjust CSS for better image rendering
    await page.evaluate(() => {
        const bodyElement = document.querySelector('body');
        
        // remove nav item
        const nav = document.querySelector('nav');
        if (nav) nav.remove();

        if (bodyElement) {
            bodyElement.style.overflow = 'clip';
        }
        const mainElement = document.querySelector('main');
        if (mainElement) {
            mainElement.style.display = 'flex';
            mainElement.style.flexDirection = 'column';
            mainElement.style.height = '100vh';
            mainElement.style.alignItems = 'center';
            mainElement.style.justifyContent = 'center';
            mainElement.style.marginTop = '-3rem';
        }
        const h1 = document.querySelector('h1');
        if (h1) { 
            h1.style.fontSize = '4rem';
            h1.style.margin = '0';
        }
        const h2 = document.querySelector('h2');
        if (h2) { 
            h2.style.fontSize = '2rem';
            h2.style.margin = '0';
        }
        const h3 = document.querySelector('h3');
        if (h3) { 
            h3.style.fontSize = '2rem';
            h3.style.margin = '0';
            h3.style.marginLeft = '1rem';
            h3.style.fontWeight = 'normal';
        }

        const header = document.getElementById('page-header');
        if (header) {
            header.style.display = 'flex';
        }
        const tableHeaders = document.querySelectorAll('th')
        if (tableHeaders) {
            tableHeaders.forEach(th => th.remove());
        }

        const table = document.querySelector('table');
        if (table) {
            table.style.maxWidth = "555px";
            table.style.fontSize = '2rem';
        }
        const link = document.querySelector('a.purple');
        if (link) link.remove();
    });

    // Set viewport dimensions
    await page.setViewport({ width: 1080, height: 540 });

    // Capture the screenshot and save it as .webp
    await page.screenshot({ path: outputPath, type: 'webp', quality: 90 });

    // Close the browser
    await browser.close();
})();

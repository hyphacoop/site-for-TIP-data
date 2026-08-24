const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

(async () => {
  // Get command-line arguments
  const args = process.argv.slice(2);
  const htmlPath = args[0]; // HTML file path
  const outputPath = args[1]; // Screenshot output path

  if (!fs.existsSync(htmlPath)) {
    console.error(`Error: HTML file not found at ${htmlPath}`);
    process.exit(1);
  }

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  // Convert file path to URL
  const relativeHtmlPath = path
    .relative(path.join(__dirname, "..", "site"), htmlPath)
    .replace(/\\/g, "/");
  const pageUrl = `http://localhost:8080/${relativeHtmlPath}`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setCacheEnabled(false);

  let loaded = false;
  let attempts = 5;

  while (!loaded && attempts > 0) {
    try {
      await page.goto(pageUrl, { waitUntil: "networkidle0" });
      loaded = true;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      attempts--;
    }
  }

  if (!loaded) {
    console.error("Error: Failed to load page after multiple attempts.");
    process.exit(1);
  }

  try {
    // Load the HTML file
    await page.goto(pageUrl, { waitUntil: "networkidle0" });

    // Adjust CSS for better image rendering
    await page.evaluate(() => {
      try {
        const bodyElement = document.querySelector("body");
        if (bodyElement) {
          bodyElement.style.overflow = "clip";

          // Check if body has the roots1 class and apply specific positioning
          if (bodyElement.classList.contains("roots1")) {
            bodyElement.style.backgroundPosition = "right top";
          }
        }

        const nav = document.querySelector("nav");
        if (nav) nav.remove();

        const mainElement = document.querySelector("main");
        if (mainElement) {
          mainElement.style.display = "flex";
          mainElement.style.flexDirection = "column";
          mainElement.style.height = "100vh";
          mainElement.style.alignItems = "center";
          mainElement.style.justifyContent = "center";
          mainElement.style.marginTop = "-3rem";
        } else {
          console.error("Main element not found");
        }
        const mainHeader = document.querySelector("header");
        if (mainHeader) {
          mainHeader.backgroundColor = "white";
        }
        const h1 = document.querySelector("h1");
        if (h1) {
          h1.style.fontSize = "4rem";
          h1.style.margin = "0";
        }
        const h2 = document.querySelector("h2");
        if (h2) {
          h2.style.fontSize = "2.5rem";
          h2.style.margin = "0";
        }
        const h3 = document.querySelector("h3");
        if (h3) {
          h3.style.fontSize = "2.5rem";
          h3.style.margin = "0";
          h3.style.marginLeft = "1rem";
          h3.style.fontWeight = "normal";
        }

        const textBox = document.getElementById("validator-achievements-info");
        if (textBox) {
          textBox.remove();
        } else {
          console.error("txt description not found");
        }
        const header = document.getElementById("page-header");
        if (header) {
          header.style.display = "flex";
          header.style.backgroundColor = "white";
          header.style.padding = "1rem";
          header.style.border = "1px solid #9900FD";
        }

        const tableHeaders = document.querySelectorAll("th");
        if (tableHeaders) {
          tableHeaders.forEach((th) => th.remove());
        }

        const table = document.querySelector("table");
        if (table) {
          table.style.maxWidth = "555px";
          table.style.fontSize = "2rem";
        }

        const tableData = document.querySelectorAll("td");
        if (tableData) {
          tableData.forEach((td) => {
            td.style.border = "1px solid #9900FD";
          });
        }
      } catch (error) {
        console.error("Error in page.evaluate:", error);
      }
    });

    // Set viewport dimensions
    await page.setViewport({ width: 1080, height: 540 });

    // Capture the screenshot and save it as .webp
    await page.screenshot({ path: outputPath, type: "webp", quality: 90 });

    console.log(`Screenshot saved to ${outputPath}`);
  } catch (error) {
    console.error("Error rendering image:", error);
  } finally {
    // Close the browser
    await browser.close();
  }
})();

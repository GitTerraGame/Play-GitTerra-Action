import puppeteer from "puppeteer";
import http from "http";
import fs from "fs";
import path from "path";

export default async function screenshot(
  htmlFile,
  screenshotWidth,
  screenshotHeight,
  outputFilename,
  serverPort
) {
  try {
    const htmlFilePath = path.resolve(".", htmlFile);
    const htmlFileDir = path.dirname(htmlFilePath);

    // Ensure the HTML file exists
    if (!fs.existsSync(htmlFilePath)) {
      console.log(`Error: HTML file not found at: ${htmlFilePath}`);
      return;
    }

    let server;
    try {
      // Start a simple HTTP server
      server = http
        .createServer((req, res) => {
          const requestedPath = path.join(
            htmlFileDir,
            req.url === "/" ? path.basename(htmlFile) : req.url
          );
          fs.readFile(requestedPath, (err, data) => {
            if (err) {
              res.writeHead(404);
              res.end(JSON.stringify(err));
              return;
            }
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
          });
        })
        .listen(serverPort, () => {
          console.log(`Server listening on http://localhost:${serverPort}`);
        });

      // Wait for the server to be ready (optional, but good practice)
      await new Promise((resolve) => server.on("listening", resolve));

      const browser = await puppeteer.launch({
        headless: "new", // Use the new headless mode
        args: [
          "--no-sandbox", // Required for GitHub Actions environments
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage", // Overcomes limited resource problems
          "--single-process", // Helps with memory issues
        ],
      });
      const page = await browser.newPage();

      // Set the viewport dimensions
      await page.setViewport({
        width: screenshotWidth,
        height: screenshotHeight,
        deviceScaleFactor: 1,
      });

      const urlToScreenshot = `http://localhost:${serverPort}/${path.basename(
        htmlFile
      )}`;
      console.log(`Navigating to: ${urlToScreenshot}`);

      // Navigate to the local HTML file
      await page.goto(urlToScreenshot, { waitUntil: "networkidle0" });

      console.log("Page loaded successfully.");

      // Take the screenshot
      const outputPath = path.join(".", outputFilename);
      await page.screenshot({ path: outputPath, fullPage: false });

      console.log(`Screenshot saved to: ${outputPath}`);

      await browser.close();
    } finally {
      if (server) {
        server.close(() => console.log("Server closed."));
      }
    }
  } catch (error) {
    console.log("Error: ", error.message);
  }
}

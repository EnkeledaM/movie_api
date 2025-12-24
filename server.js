const http = require("http");
const fs = require("fs");
const url = require("url");

http
  .createServer((request, response) => {
    const requestedUrl = request.url;

    // Log URL + timestamp
    fs.appendFile(
      "log.txt",
      `URL: ${requestedUrl}\nTimestamp: ${new Date()}\n\n`,
      (err) => {
        if (err) console.log(err);
      }
    );

    // Parse URL
    const q = new URL(requestedUrl, `http://${request.headers.host}`);

    // Decide which file to serve
    let filePath = "index.html";
    if (q.pathname.includes("documentation")) {
      filePath = "documentation.html";
    }

    // Read file and respond
    fs.readFile(filePath, (err, data) => {
      if (err) {
        response.writeHead(500, { "Content-Type": "text/plain" });
        response.end("Error: Could not read the requested file.");
        return;
      }

      response.writeHead(200, { "Content-Type": "text/html" });
      response.write(data);
      response.end();
    });
  })
  .listen(8080);

console.log("My test server is running on Port 8080.");

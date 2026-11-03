// Tiny server: serves index.html and proxies ZenQuotes (which blocks browser CORS requests).
const http = require("http");
const fs = require("fs");
const path = require("path");

// Read "--name value" flags, e.g. `pnpm dev --port 5173 --base /preview/`.
function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

const PORT = arg("port") || process.env.PORT || 3000;
const HOST = arg("host") || "0.0.0.0";

http
  .createServer(async (req, res) => {
    // Match by suffix so it works whether or not the app is served under a base path.
    const url = req.url.split("?")[0];

    if (url.endsWith("/api/quote")) {
      try {
        const r = await fetch("https://zenquotes.io/api/random");
        const [quote] = await r.json();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ text: quote.q, author: quote.a }));
      } catch (err) {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Could not reach ZenQuotes" }));
      }
      return;
    }

    // Everything else gets the page.
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    fs.createReadStream(path.join(__dirname, "index.html")).pipe(res);
  })
  .listen(PORT, HOST, () => console.log(`Quote app running at http://${HOST}:${PORT}`));

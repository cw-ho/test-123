// Tiny server: serves index.html and proxies ZenQuotes (which blocks browser CORS requests).
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

http
  .createServer(async (req, res) => {
    if (req.url === "/api/quote") {
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

    if (req.url === "/" || req.url === "/index.html") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      fs.createReadStream(path.join(__dirname, "index.html")).pipe(res);
      return;
    }

    res.writeHead(404);
    res.end("Not found");
  })
  .listen(PORT, () => console.log(`Quote app running at http://localhost:${PORT}`));

// api/index.js (handler Vercel)
const path = require("path");
const fs = require("fs");

module.exports = (req, res) => {
  let page = req.url === "/" ? "index" : req.url.replace("/", "");
  let filePath = path.join(__dirname, "../views", `${page}.html`);

  if (!fs.existsSync(filePath)) {
    res.statusCode = 404;
    return res.end("Página não encontrada");
  }

  const html = fs.readFileSync(filePath, "utf8");
  res.setHeader("Content-Type", "text/html");
  res.end(html);
};


/*const app = require("../src/server")

module.exports = (req, res) => {
  const server = app
  server(req, res)
}*/

const path = require("path");
const fs = require("fs");

module.exports = (req, res) => {
  const page = req.url === "/" ? "index" : req.url.replace("/", "");
  const filePath = path.join(__dirname, "../src/views", `${page}.html`);

  if (!fs.existsSync(filePath)) {
    res.statusCode = 404;
    return res.end("Página não encontrada");
  }

  const html = fs.readFileSync(filePath, "utf8");
  res.setHeader("Content-Type", "text/html");
  res.end(html);
};

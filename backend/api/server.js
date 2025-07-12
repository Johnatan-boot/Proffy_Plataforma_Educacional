const express = require("express");
const path = require("path");

const app = express();

// Corrigindo o caminho para views
const rootPath = path.join(__dirname, "..", "..", "src", "views");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Corrige os caminhos públicos
app.use("/public", express.static(path.join(rootPath, "public")));
app.use("/scripts", express.static(path.join(rootPath, "scripts")));
app.use("/assets", express.static(path.join(rootPath, "assets")));

// Rotas
const fs = require("fs");

app.get("/", (req, res) => {
  const file = path.join(rootPath, "index.html");
  res.setHeader("Content-Type", "text/html");
  res.send(fs.readFileSync(file, "utf8"));
});

app.get("/study", (req, res) => {
  const file = path.join(rootPath, "study.html");
  res.setHeader("Content-Type", "text/html");
  res.send(fs.readFileSync(file, "utf8"));
});

app.get("/give-classes", (req, res) => {
  const file = path.join(rootPath, "give-classes.html");
  res.setHeader("Content-Type", "text/html");
  res.send(fs.readFileSync(file, "utf8"));
});

// POST simulativo
app.post("/give-classes", (req, res) => {
  console.log("📨 Dados recebidos:", req.body);
  res.send("Formulário enviado com sucesso!");
});

// Se for rodar localmente (node server.js), escute a porta
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

// Exporta para Vercel como função serverless
module.exports = (req, res) => app(req, res);

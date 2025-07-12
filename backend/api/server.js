const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const rootPath = path.join(__dirname, "../../src/views");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Arquivos estáticos
app.use("/public", express.static(path.join(rootPath, "public")));
app.use("/scripts", express.static(path.join(rootPath, "scripts")));
app.use("/assets", express.static(path.join(rootPath, "assets")));

// Função de leitura de HTML
function renderHTML(fileName, res) {
  const file = path.join(rootPath, fileName);
  if (fs.existsSync(file)) {
    res.setHeader("Content-Type", "text/html");
    res.send(fs.readFileSync(file, "utf8"));
  } else {
    res.status(404).send("Página não encontrada");
  }
}

// Rotas
app.get("/", (req, res) => renderHTML("index.html", res));
app.get("/study", (req, res) => renderHTML("study.html", res));
app.get("/give-classes", (req, res) => renderHTML("give-classes.html", res));

app.post("/give-classes", (req, res) => {
  console.log("📨 Dados recebidos:", req.body);
  res.send("Formulário enviado com sucesso!");
});

// Exporta para Vercel
module.exports = app;

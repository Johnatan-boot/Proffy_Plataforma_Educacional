const path = require("path");
const fs = require("fs");
const express = require("express");

const app = express();

// Caminho absoluto para views (baseado na raiz do projeto Vercel)
const rootPath = path.join(process.cwd(), "src/views");

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir estáticos
app.use("/public", express.static(path.join(rootPath, "public")));
app.use("/scripts", express.static(path.join(rootPath, "scripts")));
app.use("/assets", express.static(path.join(rootPath, "assets")));

// Função para servir HTML com Content-Type forçado
function serveHTML(res, file) {
  try {
    const filePath = path.join(rootPath, file);
    const html = fs.readFileSync(filePath, "utf8");
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  } catch (err) {
    console.error("Erro ao carregar página:", file, err);
    res.status(404).send("Página não encontrada");
  }
}

// Rotas principais
app.get("/", (req, res) => serveHTML(res, "index.html"));
app.get("/study", (req, res) => serveHTML(res, "study.html"));
app.get("/give-classes", (req, res) => serveHTML(res, "give-classes.html"));

// POST para formulário
app.post("/give-classes", (req, res) => {
  console.log("📨 Dados recebidos:", req.body);
  res.send("Formulário recebido com sucesso!");
});

// Exporta como função serverless para Vercel
module.exports = (req, res) => app(req, res);

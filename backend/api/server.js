const express = require("express");
const path = require("path");

const app = express();

// Corrige caminho para views e assets na Vercel
const rootPath = path.join(process.cwd(), "src/views");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Corrige os caminhos públicos
app.use("/public", express.static(path.join(rootPath, "public")));
app.use("/scripts", express.static(path.join(rootPath, "scripts")));
app.use("/assets", express.static(path.join(rootPath, "assets")));

// Rotas
app.get("/", (req, res) => res.sendFile(path.join(rootPath, "index.html")));
app.get("/study", (req, res) => res.sendFile(path.join(rootPath, "study.html")));
app.get("/give-classes", (req, res) => res.sendFile(path.join(rootPath, "give-classes.html")));

// POST simulativo
app.post("/give-classes", (req, res) => {
  console.log("📨 Dados recebidos:", req.body);
  res.send("Formulário enviado com sucesso!");
});

// Exporta para Vercel como função serverless
module.exports = (req, res) => app(req, res);

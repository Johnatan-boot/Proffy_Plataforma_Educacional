const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

// Caminho correto para a pasta de views
const rootPath = path.join(process.cwd(), "..", "src", "views");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servindo arquivos estáticos
app.use("/public", express.static(path.join(rootPath, "public")));
app.use("/scripts", express.static(path.join(rootPath, "scripts")));
app.use("/assets", express.static(path.join(rootPath, "assets")));

// Função para carregar HTML com Content-Type correto
function serveHTML(res, file) {
  const filePath = path.join(rootPath, file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Página não encontrada");
  }
  res.setHeader("Content-Type", "text/html");
  res.send(fs.readFileSync(filePath, "utf8"));
}

// Rotas
app.get("/", (req, res) => serveHTML(res, "index.html"));
app.get("/study", (req, res) => serveHTML(res, "study.html"));
app.get("/give-classes", (req, res) => serveHTML(res, "give-classes.html"));

app.post("/give-classes", (req, res) => {
  console.log("📨 Dados recebidos:", req.body);
  res.send("Formulário enviado com sucesso!");
});

// Para rodar localmente
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

// Para deploy na Vercel
module.exports = (req, res) => app(req, res);

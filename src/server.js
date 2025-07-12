// src/server.js
const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));

});

app.get("/study", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/study.html"));
});

app.get("/give-classes", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/give-classes.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});



/*const express = require("express")
const path = require("path")
const app = express()

app.use(express.static(path.join(__dirname, "../public")))

app.get("/", (req, res) => {
    return res.sendFile(path.join(__dirname, "views/index.html"))
})

app.get("/study", (req, res) => {
    return res.sendFile(path.join(__dirname, "views/study.html"))
})

app.get("/give-classes", (req, res) => {
    return res.sendFile(path.join(__dirname, "views/give-classes.html"))
})

module.exports = app*/

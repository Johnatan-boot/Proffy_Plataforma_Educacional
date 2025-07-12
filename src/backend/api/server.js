const express = require('express');
const path = require('path');

const app = express();

// Caminhos base ajustados para sua estrutura
const rootPath = path.resolve(__dirname, '../../../src/views');
const publicPath = path.join(rootPath, 'public');
const scriptsPath = path.join(rootPath, 'scripts');

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(publicPath));
app.use('/scripts', express.static(scriptsPath));

// Rotas
app.get('/', (req, res) => res.sendFile(path.join(rootPath, 'index.html')));
app.get('/study', (req, res) => res.sendFile(path.join(rootPath, 'study.html')));
app.get('/give-classes', (req, res) => res.sendFile(path.join(rootPath, 'give-classes.html')));


app.post('/give-classes', (req, res) => {
console.log('📨 Dados recebidos:', req.body);
res.send('Formulário enviado com sucesso!');
});

module.exports = (req, res) => app(req, res);






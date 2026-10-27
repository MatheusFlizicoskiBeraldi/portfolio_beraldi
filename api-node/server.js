const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const PORTA = 3000;
const SEGREDO = 'fafefifofoid'
app.use(cors());
app.use(express.json());

// Middleware: confere o token antes da rota rodar. Entra so nas rotas...
function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization ?? '';
  const token = cabecalho.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ erro: 'Token ausente' });
  }
  try {
    req.usuario = jwt.verify(token, SEGREDO);
  } catch (erro) {
    return res.status(401).json({ erro: 'Token invalido ou expirado' });
  }
}

app.get('/', (req, res) => {
  res.send('API do portfolio em Node: no ar');
});

// POST /api/login: confere email e senha e devolve o token. A unica rota que ve a senha.
app.post('/api/login', async (req, res) => {
  try {
    const dados = req.body;
    if (!dados || !dados.email || !dados.senha) {
      return res.status(400).json({ erro: 'Informe email e senha' });
    }
    const [linhas] = await pool.execute('SELECT id, email, senha_hash FROM usuarios WHERE email = ?', [dados.email]);
    const usuario = linhas[0];
    if (!usuario) {
      return res.status(401).json({ erro: 'Email ou senha invalidos' });
    }
    const confere = await bcrypt.compare(dados.senha, usuario.senha_hash);
    if (!confere) {
      return res.status(401).json({ erro: 'Email ou senha invalidos' });
    }
    const token = jwt.sign({ id: usuario.id, email: usuario.email }, SEGREDO, { expiresIn: '2h' });
    res.json({ token });
  } catch (erro) {
    res.status(500).json({ erro: 'Falha no servidor: ' + erro.message });
  }
});

// app.get('/api/projetos', async (req, res) => {
//  try {
//    const sql = 'SELECT id, nome, descricao, tecnologias, link_github, ano FROM projetos WHERE status = "publicado" ORDER BY ano DESC, id';
//    const [linhas] = await pool.query(sql);
//    res.json(linhas);
//  } catch (erro) {
//    res.status(500).json({ erro: 'Falha no servidor: ' + erro.message });
//  }
// });
// POST cria: os dados vem no corpo, em JSON, e o id nasce no banco. Ago...
app.post('/api/projetos', autenticar, async (req, res) => {
  try {
      try {
    req.usuario = jwt.verify(token, SEGREDO);
    next();
  } catch (erro) {
    return res.status(401).json({ erro: 'Token invalido ou expirado' });
  }
    const dados = req.body;
    console.log(dados);
    if (!dados || !dados.nome) {
      return res.status(400).json({ erro: 'Informe pelo menos o nome do projeto' });
    }
    const sql = 'INSERT INTO projetos (nome, descricao, tecnologias, link_github, ano, status) VALUES (?, ?, ?, ?, ?, ?)';
    const [resultado] = await pool.execute(sql, [
      dados.nome, dados.descricao ?? '', dados.tecnologias ?? '',
      dados.link_github ?? '', dados.ano ?? new Date().getFullYear(), 'publicado'
    ]);
    res.status(201).json({ id: resultado.insertId });
  } catch (erro) {
    res.status(500).json({ erro: 'Falha no servidor: ' + erro.message });
  }
});


app.post('/api/projetos', async (req, res) => {
  try {
    const dados = req.body;
    console.log(dados);
    if (!dados || !dados.nome) {
      return res.status(400).json({ erro: 'Informe pelo menos o nome do projeto' });
    }
    const sql = 'INSERT INTO projetos (nome, descricao, tecnologias, link_github, ano, status) VALUES (?, ?, ?, ?, ?, ?)';
    const [resultado] = await pool.execute(sql, [
      dados.nome, dados.descricao ?? '', dados.tecnologias ?? '',
      dados.link_github ?? '', dados.ano ?? new Date().getFullYear(), 'publicado'
    ]);
    res.status(201).json({ id: resultado.insertId });
  } catch (erro) {
    res.status(500).json({ erro: 'Falha no servidor: ' + erro.message });
  }
});

// PUT altera: o id vem no caminho (qual projeto) e os dados no corpo (o que gravar).
app.put('/api/projetos/:id', async (req, res) => {
  try {
    const dados = req.body;
    if (!dados || !dados.nome) {
      return res.status(400).json({ erro: 'Informe pelo menos o nome do projeto' });
    }
    const sql = 'UPDATE projetos SET nome = ?, descricao = ?, tecnologias = ?, link_github = ?, ano = ? WHERE id = ?';
    const [resultado] = await pool.execute(sql, [
      dados.nome, dados.descricao ?? '', dados.tecnologias ?? '',
      dados.link_github ?? '', dados.ano ?? new Date().getFullYear(), req.params.id
    ]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Projeto nao encontrado' });
    }
    res.json({ mensagem: 'Projeto atualizado' });
  } catch (erro) {
    res.status(500).json({ erro: 'Falha no servidor: ' + erro.message });
  }
});

// DELETE apaga: so precisa do id. Nao ha corpo no pedido, e a resposta tambem nao tem.
app.delete('/api/projetos/:id', async (req, res) => {
  try {
    const [resultado] = await pool.execute('DELETE FROM projetos WHERE id = ?', [req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Projeto nao encontrado' });
    }
    res.status(204).end();
  } catch (erro) {
    res.status(500).json({ erro: 'Falha no servidor: ' + erro.message });
  }
});

app.listen(PORTA, () => {
  console.log('API no ar em http://localhost:' + PORTA);
});
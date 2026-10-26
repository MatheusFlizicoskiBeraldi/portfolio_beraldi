const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORTA = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API do portfolio em Node: no ar');
});

app.get('/api/projetos', async (req, res) => {
  try {
    const sql = 'SELECT id, nome, descricao, tecnologias, link_github, ano FROM projetos WHERE status = "publicado" ORDER BY ano DESC, id';
    const [linhas] = await pool.query(sql);
    res.json(linhas);
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
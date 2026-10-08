const db = require('../../db');

// GET /categorias  (publico: usado nos filtros do front)
function listar(req, res, next) {
  try {
    const categorias = db.prepare(`
      SELECT id_categoria, nome, descricao FROM categoria ORDER BY nome
    `).all();
    res.json(categorias);
  } catch (err) {
    next(err);
  }
}

// POST /categorias  (so admin)
function criar(req, res, next) {
  const { nome, descricao } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'Campo obrigatorio: nome.' });
  }

  try {
    const resultado = db.prepare(
      'INSERT INTO categoria (nome, descricao) VALUES (?, ?)'
    ).run(nome, descricao || null);

    res.status(201).json({ id_categoria: resultado.lastInsertRowid, mensagem: 'Categoria cadastrada com sucesso.' });
  } catch (err) {
    next(err); // nome repetido cai no UNIQUE e vira 409 no errorHandler
  }
}

module.exports = { listar, criar };
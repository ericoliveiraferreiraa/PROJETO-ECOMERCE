const db = require('../../db');

// GET /produtos  (RF: listar produtos, com estoque e categoria)
function listar(req, res, next) {
  try {
    const produtos = db.prepare(`
      SELECT pr.id_produto, pr.nome, pr.descricao, pr.preco, pr.imagem, pr.ativo,
             c.nome AS categoria, e.quantidade AS estoque
      FROM produto pr
      JOIN categoria c ON c.id_categoria = pr.id_categoria
      LEFT JOIN estoque e ON e.id_produto = pr.id_produto
      WHERE pr.ativo = 1
      ORDER BY pr.nome
    `).all();
    res.json(produtos);
  } catch (err) {
    next(err);
  }
}

// GET /produtos/:id
function obterPorId(req, res, next) {
  try {
    const produto = db.prepare(`
      SELECT pr.id_produto, pr.nome, pr.descricao, pr.preco, pr.imagem, pr.ativo,
             c.nome AS categoria, e.quantidade AS estoque
      FROM produto pr
      JOIN categoria c ON c.id_categoria = pr.id_categoria
      LEFT JOIN estoque e ON e.id_produto = pr.id_produto
      WHERE pr.id_produto = ?
    `).get(req.params.id);

    if (!produto) return res.status(404).json({ erro: 'Produto nao encontrado.' });
    res.json(produto);
  } catch (err) {
    next(err);
  }
}

// POST /produtos  (RF25 — cadastro de produto, RN02 validado pelo trigger)
function criar(req, res, next) {
  const { id_categoria, nome, descricao, preco, imagem, quantidade_estoque } = req.body;

  if (!id_categoria || !nome || !descricao || preco === undefined) {
    return res.status(400).json({ erro: 'Campos obrigatorios: id_categoria, nome, descricao, preco.' });
  }

  const inserirProduto = db.prepare(`
    INSERT INTO produto (id_categoria, nome, descricao, preco, imagem, ativo)
    VALUES (?, ?, ?, ?, ?, 1)
  `);
  const inserirEstoque = db.prepare(`
    INSERT INTO estoque (id_produto, quantidade) VALUES (?, ?)
  `);

  db.exec('BEGIN');
  try {
    const resultado = inserirProduto.run(id_categoria, nome, descricao, preco, imagem || null);
    inserirEstoque.run(resultado.lastInsertRowid, quantidade_estoque || 0);
    db.exec('COMMIT');
    res.status(201).json({ id_produto: resultado.lastInsertRowid, mensagem: 'Produto cadastrado com sucesso.' });
  } catch (err) {
    db.exec('ROLLBACK');
    next(err);
  }
}

// PATCH /produtos/:id/inativar  (RN10 — nunca DELETE fisico em produto vendido)
function inativar(req, res, next) {
  try {
    const resultado = db.prepare('UPDATE produto SET ativo = 0 WHERE id_produto = ?').run(req.params.id);
    if (resultado.changes === 0) return res.status(404).json({ erro: 'Produto nao encontrado.' });
    res.json({ mensagem: 'Produto inativado.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, obterPorId, criar, inativar };

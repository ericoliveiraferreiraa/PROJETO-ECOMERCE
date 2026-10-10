
const db = require('../../db');
const { registrar } = require('../services/logAdmin');

// GET /estoque
// Lista os produtos e suas quantidades, inclusive produtos sem registro de estoque.
function listar(req, res, next) {
  try {
    const estoques = db.prepare(`
      SELECT
        pr.id_produto,
        pr.nome,
        pr.ativo,
        e.id_estoque,
        e.quantidade
      FROM produto pr
      LEFT JOIN estoque e
        ON e.id_produto = pr.id_produto
      ORDER BY pr.nome
    `).all();

    res.json(estoques);
  } catch (err) {
    next(err);
  }
}

// PATCH /estoque/:id
// Define a quantidade disponível de um produto.
function atualizar(req, res, next) {
  const idProduto = Number(req.params.id);
  const { quantidade } = req.body;

  if (!Number.isInteger(idProduto) || idProduto <= 0) {
    return res.status(400).json({
      erro: 'ID do produto invalido.',
    });
  }

  if (!Number.isInteger(quantidade) || quantidade < 0) {
    return res.status(400).json({
      erro: 'A quantidade deve ser um numero inteiro maior ou igual a zero.',
    });
  }

  try {
    const produto = db.prepare(`
      SELECT id_produto, nome
      FROM produto
      WHERE id_produto = ?
    `).get(idProduto);

    if (!produto) {
      return res.status(404).json({
        erro: 'Produto nao encontrado.',
      });
    }

    const estoqueExistente = db.prepare(`
      SELECT id_estoque
      FROM estoque
      WHERE id_produto = ?
    `).get(idProduto);

    if (estoqueExistente) {
      db.prepare(`
        UPDATE estoque
        SET quantidade = ?
        WHERE id_produto = ?
      `).run(quantidade, idProduto);
    } else {
      db.prepare(`
        INSERT INTO estoque (id_produto, quantidade)
        VALUES (?, ?)
      `).run(idProduto, quantidade);
    }

    registrar(
      req.administrador.id_administrador,
      'ATUALIZAR_ESTOQUE',
      'produto',
      idProduto,
      `Estoque de "${produto.nome}" definido para ${quantidade} unidade(s)`
    );

    res.json({
      mensagem: 'Estoque atualizado com sucesso.',
      id_produto: idProduto,
      quantidade,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, atualizar };
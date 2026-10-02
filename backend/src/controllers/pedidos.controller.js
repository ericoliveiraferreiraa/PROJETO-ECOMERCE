const db = require('../../db');

// POST /pedidos  (RF07, RF16, RF17 — criar pedido com itens do carrinho)
// Corpo esperado:
// { "itens": [ { "id_produto": 1, "quantidade": 2 }, { "id_produto": 2, "quantidade": 1 } ] }
function criar(req, res, next) {
  const { itens } = req.body;
  const id_cliente = req.cliente.id_cliente; // vem do middleware de autenticacao

  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: 'O pedido precisa ter pelo menos um item.' });
  }

  const buscarProduto = db.prepare('SELECT id_produto, preco FROM produto WHERE id_produto = ? AND ativo = 1');
  const inserirPedido = db.prepare(`INSERT INTO pedido (id_cliente, valor_total, status) VALUES (?, ?, 'aguardando_pagamento')`);
  const inserirItem = db.prepare(`
    INSERT INTO item_pedido (id_pedido, id_produto, quantidade, preco_unitario, subtotal)
    VALUES (?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN');
  try {
    let valorTotal = 0;
    const itensValidados = itens.map((item) => {
      const produto = buscarProduto.get(item.id_produto);
      if (!produto) throw new Error(`Produto ${item.id_produto} nao encontrado ou inativo.`);
      if (!item.quantidade || item.quantidade <= 0) throw new Error('Quantidade invalida para um dos itens.');

      const subtotal = produto.preco * item.quantidade;
      valorTotal += subtotal;
      return { id_produto: produto.id_produto, quantidade: item.quantidade, preco: produto.preco, subtotal };
    });

    const resultadoPedido = inserirPedido.run(id_cliente, valorTotal);
    const id_pedido = resultadoPedido.lastInsertRowid;

    for (const item of itensValidados) {
      inserirItem.run(id_pedido, item.id_produto, item.quantidade, item.preco, item.subtotal);
    }

    db.exec('COMMIT');
    res.status(201).json({ id_pedido, valor_total: valorTotal, status: 'aguardando_pagamento' });
  } catch (err) {
    db.exec('ROLLBACK');
    next(err);
  }
}

// GET /pedidos  (RF24 — listar pedidos do cliente autenticado)
function listarDoCliente(req, res, next) {
  try {
    const pedidos = db.prepare(`
      SELECT id_pedido, data_pedido, status, valor_total
      FROM pedido
      WHERE id_cliente = ?
      ORDER BY data_pedido DESC
    `).all(req.cliente.id_cliente);

    res.json(pedidos);
  } catch (err) {
    next(err);
  }
}

// GET /pedidos/:id  (detalhe do pedido com os itens, só se for do proprio cliente)
function obterPorId(req, res, next) {
  try {
    const pedido = db.prepare(`
      SELECT id_pedido, id_cliente, data_pedido, status, valor_total
      FROM pedido WHERE id_pedido = ?
    `).get(req.params.id);

    if (!pedido) return res.status(404).json({ erro: 'Pedido nao encontrado.' });
    if (pedido.id_cliente !== req.cliente.id_cliente) {
      return res.status(403).json({ erro: 'Este pedido nao pertence a voce.' });
    }

    const itens = db.prepare(`
      SELECT ip.id_produto, pr.nome AS produto, ip.quantidade, ip.preco_unitario, ip.subtotal
      FROM item_pedido ip
      JOIN produto pr ON pr.id_produto = ip.id_produto
      WHERE ip.id_pedido = ?
    `).all(pedido.id_pedido);

    res.json({ ...pedido, itens });
  } catch (err) {
    next(err);
  }
}

module.exports = { criar, listarDoCliente, obterPorId };

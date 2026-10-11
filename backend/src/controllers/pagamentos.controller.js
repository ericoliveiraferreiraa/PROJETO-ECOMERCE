
const db = require('../../db');

// POST /pedidos/:id/pagamento
// Pagamento simulado para fins academicos.
// A baixa do estoque, o registro do pagamento e a atualizacao
// do pedido acontecem na mesma transacao.
function registrar(req, res, next) {
  const { metodo } = req.body;
  const id_pedido = Number(req.params.id);
  const id_cliente = req.cliente.id_cliente;

  const metodosPermitidos = ['pix', 'cartao', 'boleto'];

  if (!metodosPermitidos.includes(metodo)) {
    return res.status(400).json({
      erro: 'Metodo invalido. Utilize pix, cartao ou boleto.',
    });
  }

  if (!Number.isInteger(id_pedido) || id_pedido <= 0) {
    return res.status(400).json({ erro: 'ID do pedido invalido.' });
  }

  const buscarPedido = db.prepare(`
    SELECT id_pedido, id_cliente, valor_total, status
    FROM pedido
    WHERE id_pedido = ?
  `);

  const buscarItens = db.prepare(`
    SELECT id_produto, quantidade
    FROM item_pedido
    WHERE id_pedido = ?
  `);

  const buscarEstoque = db.prepare(`
    SELECT quantidade
    FROM estoque
    WHERE id_produto = ?
  `);

  const atualizarEstoque = db.prepare(`
    UPDATE estoque
    SET quantidade = quantidade - ?
    WHERE id_produto = ?
      AND quantidade >= ?
  `);

  const inserirPagamento = db.prepare(`
    INSERT INTO pagamento (
      id_pedido,
      metodo,
      status,
      valor,
      indentificador_transacao
    )
    VALUES (?, ?, 'aprovado', ?, ?)
  `);

  const atualizarPedido = db.prepare(`
    UPDATE pedido
    SET status = 'pago'
    WHERE id_pedido = ?
      AND status = 'aguardando_pagamento'
  `);

  let transacaoAberta = false;

  try {
    db.exec('BEGIN IMMEDIATE');
    transacaoAberta = true;

    const pedido = buscarPedido.get(id_pedido);

    if (!pedido) {
      db.exec('ROLLBACK');
      transacaoAberta = false;

      return res.status(404).json({
        erro: 'Pedido nao encontrado.',
      });
    }

    if (pedido.id_cliente !== id_cliente) {
      db.exec('ROLLBACK');
      transacaoAberta = false;

      return res.status(403).json({
        erro: 'Este pedido nao pertence a voce.',
      });
    }

    if (pedido.status !== 'aguardando_pagamento') {
      db.exec('ROLLBACK');
      transacaoAberta = false;

      return res.status(409).json({
        erro: `Pedido com status "${pedido.status}" nao pode ser pago novamente.`,
      });
    }

    const itens = buscarItens.all(id_pedido);

    if (itens.length === 0) {
      db.exec('ROLLBACK');
      transacaoAberta = false;

      return res.status(409).json({
        erro: 'O pedido nao possui itens.',
      });
    }

    // Primeiro verifica o estoque de todos os itens.
    // Nenhuma quantidade e reduzida nesta etapa.
    for (const item of itens) {
      if (!Number.isInteger(item.quantidade) || item.quantidade <= 0) {
        throw new Error('O pedido possui uma quantidade invalida.');
      }

      const estoque = buscarEstoque.get(item.id_produto);

      if (!estoque || estoque.quantidade < item.quantidade) {
        db.exec('ROLLBACK');
        transacaoAberta = false;

        return res.status(409).json({
          erro: `Estoque insuficiente para o produto ${item.id_produto}.`,
          id_produto: item.id_produto,
        });
      }
    }

    // Depois reduz o estoque. A condicao protege contra
    // uma quantidade insuficiente no momento da atualizacao.
    for (const item of itens) {
      const resultado = atualizarEstoque.run(
        item.quantidade,
        item.id_produto,
        item.quantidade
      );

      if (Number(resultado.changes) !== 1) {
        throw new Error(
          `Nao foi possivel atualizar o estoque do produto ${item.id_produto}.`
        );
      }
    }

    // Identificador ficticio: nao representa uma transacao real.
    const identificador = `SIMULADO-${Date.now()}`;

    inserirPagamento.run(
      id_pedido,
      metodo,
      pedido.valor_total,
      identificador
    );

    const resultadoPedido = atualizarPedido.run(id_pedido);

    if (Number(resultadoPedido.changes) !== 1) {
      throw new Error('Nao foi possivel atualizar o status do pedido.');
    }

    db.exec('COMMIT');
    transacaoAberta = false;

    return res.status(201).json({
      mensagem: 'Pagamento simulado aprovado.',
      id_pedido,
      status: 'pago',
      identificador_transacao: identificador,
    });
  } catch (err) {
    if (transacaoAberta) {
      try {
        db.exec('ROLLBACK');
      } catch (erroRollback) {
        console.error('Erro ao reverter a transacao:', erroRollback);
      }
    }

    // Erros conhecidos de estoque sao tratados como conflito.
    if (
      err.message &&
      (
        err.message.includes('Estoque') ||
        err.message.includes('estoque') ||
        err.message.includes('quantidade insuficiente')
      )
    ) {
      return res.status(409).json({ erro: err.message });
    }

    next(err);
  }
}

module.exports = { registrar };
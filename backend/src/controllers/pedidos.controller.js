
const db = require('../../db');
const { calcularFrete } = require('../services/frete');

// POST /pedidos
// Cria um pedido com endereco e frete validados.
// O estoque nao e reduzido nesta etapa.
function criar(req, res, next) {
  const { itens, id_endereco } = req.body;
  const id_cliente = Number(req.cliente.id_cliente);

  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({
      erro: 'O pedido precisa ter pelo menos um item.',
    });
  }

  const idEndereco = Number(id_endereco);

  if (!Number.isInteger(idEndereco) || idEndereco <= 0) {
    return res.status(400).json({
      erro: 'Selecione um endereco de entrega valido.',
    });
  }

  if (!Number.isInteger(id_cliente) || id_cliente <= 0) {
    return res.status(401).json({
      erro: 'Cliente autenticado invalido.',
    });
  }

  // Valida e consolida produtos repetidos no carrinho.
  const quantidadesPorProduto = new Map();

  for (const item of itens) {
    const id_produto = Number(item?.id_produto);
    const quantidade = Number(item?.quantidade);

    if (!Number.isInteger(id_produto) || id_produto <= 0) {
      return res.status(400).json({
        erro: 'ID de produto invalido.',
      });
    }

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      return res.status(400).json({
        erro: 'A quantidade de cada produto deve ser um inteiro positivo.',
      });
    }

    const quantidadeAcumulada =
      (quantidadesPorProduto.get(id_produto) || 0) + quantidade;

    if (!Number.isSafeInteger(quantidadeAcumulada)) {
      return res.status(400).json({
        erro: 'Quantidade total invalida para um produto.',
      });
    }

    quantidadesPorProduto.set(id_produto, quantidadeAcumulada);
  }

  const buscarEndereco = db.prepare(`
    SELECT id_endereco, cep
    FROM endereco
    WHERE id_endereco = ?
      AND id_cliente = ?
  `);

  const buscarProduto = db.prepare(`
    SELECT id_produto, nome, preco
    FROM produto
    WHERE id_produto = ?
      AND ativo = 1
  `);

  const buscarEstoque = db.prepare(`
    SELECT quantidade
    FROM estoque
    WHERE id_produto = ?
  `);

  const inserirPedido = db.prepare(`
    INSERT INTO pedido (
      id_cliente,
      valor_total,
      status,
      id_endereco,
      valor_frete
    )
    VALUES (?, ?, 'aguardando_pagamento', ?, ?)
  `);

  const inserirItem = db.prepare(`
    INSERT INTO item_pedido (
      id_pedido,
      id_produto,
      quantidade,
      preco_unitario,
      subtotal
    )
    VALUES (?, ?, ?, ?, ?)
  `);

  let transacaoAberta = false;

  try {
    db.exec('BEGIN IMMEDIATE');
    transacaoAberta = true;

    // Impede que um cliente utilize o endereco de outra pessoa.
    const endereco = buscarEndereco.get(idEndereco, id_cliente);

    if (!endereco) {
      db.exec('ROLLBACK');
      transacaoAberta = false;

      return res.status(400).json({
        erro: 'Endereco nao encontrado ou nao pertence ao cliente.',
      });
    }

    // O frete e calculado pelo backend, nunca pelo navegador.
    const frete = calcularFrete(endereco.cep);

    const itensValidados = [];
    let subtotalProdutos = 0;

    for (const [id_produto, quantidade] of quantidadesPorProduto) {
      const produto = buscarProduto.get(id_produto);

      if (!produto) {
        const erro = new Error(
          `Produto ${id_produto} nao encontrado ou inativo.`
        );
        erro.statusCode = 404;
        throw erro;
      }

      const estoque = buscarEstoque.get(id_produto);

      if (!estoque || estoque.quantidade < quantidade) {
        const erro = new Error(
          `Estoque insuficiente para o produto ${produto.nome}.`
        );
        erro.statusCode = 409;
        throw erro;
      }

      const subtotal = produto.preco * quantidade;

      if (!Number.isSafeInteger(subtotal) || subtotal <= 0) {
        const erro = new Error(
          `Valor invalido para o produto ${produto.nome}.`
        );
        erro.statusCode = 400;
        throw erro;
      }

      subtotalProdutos += subtotal;

      if (!Number.isSafeInteger(subtotalProdutos)) {
        const erro = new Error('O subtotal dos produtos e invalido.');
        erro.statusCode = 400;
        throw erro;
      }

      itensValidados.push({
        id_produto,
        quantidade,
        preco: produto.preco,
        subtotal,
      });
    }

    const valorTotal = subtotalProdutos + frete.valor_frete;

    if (
      !Number.isSafeInteger(valorTotal) ||
      valorTotal <= 0
    ) {
      const erro = new Error('O valor total do pedido e invalido.');
      erro.statusCode = 400;
      throw erro;
    }

    const resultadoPedido = inserirPedido.run(
      id_cliente,
      valorTotal,
      idEndereco,
      frete.valor_frete
    );

    const id_pedido = Number(resultadoPedido.lastInsertRowid);

    for (const item of itensValidados) {
      inserirItem.run(
        id_pedido,
        item.id_produto,
        item.quantidade,
        item.preco,
        item.subtotal
      );
    }

    db.exec('COMMIT');
    transacaoAberta = false;

    return res.status(201).json({
      id_pedido,
      id_endereco: idEndereco,
      subtotal_produtos: subtotalProdutos,
      valor_frete: frete.valor_frete,
      valor_total: valorTotal,
      status: 'aguardando_pagamento',
    });
  } catch (err) {
    if (transacaoAberta) {
      try {
        db.exec('ROLLBACK');
      } catch (erroRollback) {
        console.error(
          'Erro ao reverter a transacao:',
          erroRollback
        );
      }
    }

    if (err.statusCode) {
      return res.status(err.statusCode).json({
        erro: err.message,
      });
    }

    return next(err);
  }
}

// GET /pedidos
// Lista os pedidos do cliente autenticado.
function listarDoCliente(req, res, next) {
  try {
    const pedidos = db.prepare(`
      SELECT
        p.id_pedido,
        p.data_pedido,
        p.status,
        p.valor_total,
        p.valor_frete,
        pg.status AS pagamento_status
      FROM pedido p
      LEFT JOIN pagamento pg
        ON pg.id_pedido = p.id_pedido
      WHERE p.id_cliente = ?
      ORDER BY p.data_pedido DESC
    `).all(req.cliente.id_cliente);

    return res.json(pedidos);
  } catch (err) {
    return next(err);
  }
}

// GET /pedidos/:id
// Retorna os detalhes somente para o dono do pedido.
function obterPorId(req, res, next) {
  try {
    const id_pedido = Number(req.params.id);

    if (!Number.isInteger(id_pedido) || id_pedido <= 0) {
      return res.status(400).json({
        erro: 'ID do pedido invalido.',
      });
    }

    const pedido = db.prepare(`
      SELECT
        p.id_pedido,
        p.id_cliente,
        p.data_pedido,
        p.status,
        p.valor_total,
        p.valor_frete,
        e.cep AS endereco_cep,
        e.logradouro AS endereco_logradouro,
        e.numero AS endereco_numero,
        e.complemento AS endereco_complemento,
        e.bairro AS endereco_bairro,
        e.cidade AS endereco_cidade,
        e.estado AS endereco_estado,
        pg.metodo AS pagamento_metodo,
        pg.status AS pagamento_status
      FROM pedido p
      LEFT JOIN endereco e
        ON e.id_endereco = p.id_endereco
       AND e.id_cliente = p.id_cliente
      LEFT JOIN pagamento pg
        ON pg.id_pedido = p.id_pedido
      WHERE p.id_pedido = ?
    `).get(id_pedido);

    if (!pedido) {
      return res.status(404).json({
        erro: 'Pedido nao encontrado.',
      });
    }

    if (
      Number(pedido.id_cliente) !==
      Number(req.cliente.id_cliente)
    ) {
      return res.status(403).json({
        erro: 'Este pedido nao pertence a voce.',
      });
    }

    const itens = db.prepare(`
      SELECT
        ip.id_produto,
        pr.nome AS produto,
        ip.quantidade,
        ip.preco_unitario,
        ip.subtotal
      FROM item_pedido ip
      JOIN produto pr
        ON pr.id_produto = ip.id_produto
      WHERE ip.id_pedido = ?
    `).all(pedido.id_pedido);

    return res.json({ ...pedido, itens });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  criar,
  listarDoCliente,
  obterPorId,
};

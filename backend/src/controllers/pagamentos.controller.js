
const db = require('../../db');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

function obterClienteMercadoPago() {
  const accessToken = process.env.MP_ACCESS_TOKEN;

  if (!accessToken || accessToken === 'SEU_ACCESS_TOKEN_DE_TESTE') {
    const erro = new Error(
      'Configure um token de acesso de teste do Mercado Pago em backend/.env (MP_ACCESS_TOKEN).'
    );
    erro.status = 503;
    throw erro;
  }

  const client = new MercadoPagoConfig({
    accessToken,
  });

  return new Preference(client);
}

function obterConsultaPagamentosMercadoPago() {
  const accessToken = process.env.MP_ACCESS_TOKEN;

  if (!accessToken || accessToken === 'SEU_ACCESS_TOKEN_DE_TESTE') {
    const erro = new Error(
      'Configure um token de acesso de teste do Mercado Pago em backend/.env (MP_ACCESS_TOKEN).'
    );
    erro.status = 503;
    throw erro;
  }

  return new Payment(new MercadoPagoConfig({ accessToken }));
}

// Confirma o pagamento consultando o Mercado Pago, nunca pelos parâmetros
// de status fornecidos pelo navegador.
async function confirmarRetorno(req, res, next) {
  try {
    const idPedido = Number(req.params.id);
    const idCliente = Number(req.cliente.id_cliente);
    const idPagamentoMp = String(req.body?.id_pagamento_mp || '').trim();

    if (!Number.isInteger(idPedido) || idPedido <= 0) {
      return res.status(400).json({ erro: 'ID do pedido inválido.' });
    }
    if (!/^\d+$/.test(idPagamentoMp)) {
      return res.status(400).json({ erro: 'ID do pagamento inválido.' });
    }

    const pedido = db.prepare(`
      SELECT id_pedido, id_cliente, status, valor_total
      FROM pedido
      WHERE id_pedido = ? AND id_cliente = ?
    `).get(idPedido, idCliente);

    if (!pedido) {
      return res.status(404).json({ erro: 'Pedido não encontrado.' });
    }

    const pagamentoLocal = db.prepare(`
      SELECT id_preferencia, status, indentificador_transacao
      FROM pagamento
      WHERE id_pedido = ? AND metodo = 'mercado_pago'
    `).get(idPedido);

    if (!pagamentoLocal) {
      return res.status(404).json({ erro: 'Pagamento do pedido não encontrado.' });
    }

    const pagamentoMp = await obterConsultaPagamentosMercadoPago().get({
      id: idPagamentoMp,
    });

    if (String(pagamentoMp.external_reference) !== String(idPedido)) {
      return res.status(409).json({ erro: 'O pagamento não corresponde a este pedido.' });
    }
    if (
      pagamentoMp.currency_id !== 'BRL' ||
      Math.round(Number(pagamentoMp.transaction_amount) * 100) !== Number(pedido.valor_total)
    ) {
      return res.status(409).json({ erro: 'O valor do pagamento não corresponde ao pedido.' });
    }

    if (pagamentoMp.status !== 'approved') {
      return res.json({
        id_pedido: idPedido,
        pago: false,
        status_mercado_pago: pagamentoMp.status,
        status: pedido.status,
      });
    }

    db.exec('BEGIN IMMEDIATE');
    try {
      // Relê os registros sob bloqueio para impedir baixa dupla em retornos simultâneos.
      const pedidoAtual = db.prepare(`
        SELECT id_pedido, status, estoque_baixado
        FROM pedido
        WHERE id_pedido = ? AND id_cliente = ?
      `).get(idPedido, idCliente);
      const pagamentoAtual = db.prepare(`
        SELECT status, indentificador_transacao
        FROM pagamento
        WHERE id_pedido = ? AND metodo = 'mercado_pago'
      `).get(idPedido);

      if (!pedidoAtual || !pagamentoAtual) {
        const erro = new Error('Pedido ou pagamento não encontrado durante a confirmação.');
        erro.statusCode = 404;
        throw erro;
      }

      if (pedidoAtual.status !== 'aguardando_pagamento' && pedidoAtual.status !== 'pago') {
        const erro = new Error('O pedido não pode ser confirmado no estado atual.');
        erro.statusCode = 409;
        erro.status = pedidoAtual.status;
        throw erro;
      }

      const transacaoExistente = pagamentoAtual.indentificador_transacao;
      if (
        pagamentoAtual.status === 'aprovado' &&
        transacaoExistente &&
        String(transacaoExistente) !== String(pagamentoMp.id)
      ) {
        const erro = new Error('O pedido já possui outro pagamento aprovado.');
        erro.statusCode = 409;
        throw erro;
      }

      let estoqueBaixado = Number(pedidoAtual.estoque_baixado) === 1;
      if (!estoqueBaixado) {
        const itens = db.prepare(`
          SELECT id_produto, SUM(quantidade) AS quantidade
          FROM item_pedido
          WHERE id_pedido = ?
          GROUP BY id_produto
        `).all(idPedido);

        if (itens.length === 0) {
          const erro = new Error('O pedido aprovado não possui itens para baixar do estoque.');
          erro.statusCode = 409;
          throw erro;
        }

        const baixarEstoque = db.prepare(`
          UPDATE estoque
          SET quantidade = quantidade - ?
          WHERE id_produto = ? AND quantidade >= ?
        `);

        for (const item of itens) {
          const quantidade = Number(item.quantidade);
          const resultado = baixarEstoque.run(quantidade, item.id_produto, quantidade);
          if (resultado.changes !== 1) {
            const erro = new Error(
              `Estoque insuficiente para o produto ${item.id_produto} na confirmação do pedido.`
            );
            erro.statusCode = 409;
            erro.code = 'ESTOQUE_INSUFICIENTE';
            throw erro;
          }
        }
        estoqueBaixado = true;
      }

      db.prepare(`
        UPDATE pagamento
        SET status = 'aprovado', indentificador_transacao = ?, id_preferencia = ?
        WHERE id_pedido = ? AND metodo = 'mercado_pago'
      `).run(
        String(pagamentoMp.id),
        String(pagamentoMp.preference_id || pagamentoLocal.id_preferencia),
        idPedido
      );
      db.prepare(`
        UPDATE pedido
        SET status = 'pago', estoque_baixado = ?
        WHERE id_pedido = ?
      `).run(estoqueBaixado ? 1 : 0, idPedido);
      db.exec('COMMIT');
    } catch (erroTransacao) {
      db.exec('ROLLBACK');
      if (erroTransacao.statusCode) {
        return res.status(erroTransacao.statusCode).json({
          erro: erroTransacao.message,
          status: erroTransacao.status,
          codigo: erroTransacao.code,
          pagamento_aprovado: erroTransacao.code === 'ESTOQUE_INSUFICIENTE',
        });
      }
      throw erroTransacao;
    }
    return res.json({
      id_pedido: idPedido,
      pago: true,
      estoque_baixado: true,
      status_mercado_pago: pagamentoMp.status,
      status: 'pago',
    });
  } catch (erro) {
    return next(erro);
  }
}

// POST /pedidos/:id/pagamento
// Cria uma preferência de pagamento no Mercado Pago Checkout Pro.
async function registrar(req, res, next) {
  try {
    const idPedido = Number(req.params.id);
    const idCliente = Number(req.cliente.id_cliente);

    if (!Number.isInteger(idPedido) || idPedido <= 0) {
      return res.status(400).json({
        erro: 'ID do pedido inválido.',
      });
    }

    // Busca somente um pedido pertencente ao cliente autenticado.
    const pedido = db.prepare(`
      SELECT
        p.id_pedido,
        p.id_cliente,
        p.status,
        p.valor_total,
        p.valor_frete,
        c.nome,
        c.email
      FROM pedido p
      INNER JOIN cliente c
        ON c.id_cliente = p.id_cliente
      WHERE p.id_pedido = ?
        AND p.id_cliente = ?
    `).get(idPedido, idCliente);

    if (!pedido) {
      return res.status(404).json({
        erro: 'Pedido não encontrado.',
      });
    }

    if (pedido.status !== 'aguardando_pagamento') {
      return res.status(400).json({
        erro: 'Este pedido não está aguardando pagamento.',
        status: pedido.status,
      });
    }

    if (!pedido.email) {
      return res.status(400).json({
        erro: 'O cliente precisa ter um e-mail cadastrado para pagar.',
      });
    }

    // Busca os itens do pedido e os dados atuais dos produtos.
    const itens = db.prepare(`
      SELECT
        ip.id_produto,
        ip.quantidade,
        ip.preco_unitario,
        p.nome AS nome_produto
      FROM item_pedido ip
      INNER JOIN produto p
        ON p.id_produto = ip.id_produto
      WHERE ip.id_pedido = ?
    `).all(idPedido);

    if (itens.length === 0) {
      return res.status(400).json({
        erro: 'Não é possível pagar um pedido sem itens.',
      });
    }

    // Os valores monetários são armazenados em centavos.
    const subtotalProdutos = itens.reduce((total, item) => {
      return total +
        Number(item.preco_unitario) * Number(item.quantidade);
    }, 0);

    const valorFrete = Number(pedido.valor_frete || 0);
    const valorTotalCalculado = subtotalProdutos + valorFrete;
    const valorTotalPedido = Number(pedido.valor_total);

    if (
      !Number.isSafeInteger(subtotalProdutos) ||
      !Number.isSafeInteger(valorFrete) ||
      !Number.isSafeInteger(valorTotalPedido) ||
      valorTotalCalculado !== valorTotalPedido
    ) {
      return res.status(400).json({
        erro: 'Os valores do pedido não conferem. Verifique os valores dos itens, frete e total.',
      });
    }

    const preference = obterClienteMercadoPago();

    const frontendUrl = (
      process.env.FRONTEND_URL || 'http://localhost:5173'
    ).replace(/\/+$/, '');

    const notificationUrl = process.env.MP_NOTIFICATION_URL;

    const corpoPreferencia = {
      items: [
        ...itens.map((item) => ({
          id: String(item.id_produto),
          title: item.nome_produto,
          quantity: Number(item.quantidade),
          unit_price: Number(item.preco_unitario) / 100,
          currency_id: 'BRL',
        })),

        ...(valorFrete > 0
          ? [{
              id: `frete-pedido-${idPedido}`,
              title: 'Frete',
              quantity: 1,
              unit_price: valorFrete / 100,
              currency_id: 'BRL',
            }]
          : []),
      ],

      payer: {
        name: pedido.nome,
        email: pedido.email,
      },

      external_reference: String(idPedido),

      back_urls: {
        success:
          `${frontendUrl}/pagamento/sucesso?pedido_id=${idPedido}`,
        pending:
          `${frontendUrl}/pagamento/pendente?pedido_id=${idPedido}`,
        failure:
          `${frontendUrl}/pagamento/falha?pedido_id=${idPedido}`,
      },

      auto_return: 'approved',

      statement_descriptor: 'CHOCO WORLD',
    };

    if (notificationUrl) {
      corpoPreferencia.notification_url = notificationUrl;
    }

    // Cria uma nova preferência para usar as URLs de retorno atuais.
    const resposta = await preference.create({
      body: corpoPreferencia,
    });

    const idPreferencia = resposta.id;
    const urlCheckout =
      resposta.sandbox_init_point || resposta.init_point;

    if (!idPreferencia || !urlCheckout) {
      return res.status(502).json({
        erro: 'O Mercado Pago não retornou um link de pagamento válido.',
      });
    }

    // Registra a preferência no banco sem aprovar o pedido.
    const pagamentoExistente = db.prepare(`
      SELECT
        id_pagamento,
        status
      FROM pagamento
      WHERE id_pedido = ?
    `).get(idPedido);

    if (pagamentoExistente) {
      if (pagamentoExistente.status === 'aprovado') {
        return res.status(409).json({
          erro: 'Este pedido já possui um pagamento aprovado.',
        });
      }

      db.prepare(`
        UPDATE pagamento
        SET
          metodo = ?,
          status = ?,
          valor = ?,
          id_preferencia = ?,
          url_checkout = ?
        WHERE id_pedido = ?
      `).run(
        'mercado_pago',
        'pendente',
        valorTotalPedido,
        String(idPreferencia),
        urlCheckout,
        idPedido
      );
    } else {
      db.prepare(`
        INSERT INTO pagamento (
          id_pedido,
          metodo,
          status,
          valor,
          id_preferencia,
          url_checkout
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        idPedido,
        'mercado_pago',
        'pendente',
        valorTotalPedido,
        String(idPreferencia),
        urlCheckout
      );
    }

    return res.status(201).json({
      mensagem: 'Preferência de pagamento criada com sucesso.',
      id_pedido: idPedido,
      id_preferencia: idPreferencia,
      url_checkout: urlCheckout,
      status: 'pendente',
    });
  } catch (erro) {
    // Registra o erro no middleware central da API.
    return next(erro);
  }
}

module.exports = {
  registrar,
  confirmarRetorno,
};

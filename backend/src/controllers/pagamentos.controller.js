
const db = require('../../db');
const { MercadoPagoConfig, Preference } = require('mercadopago');

function obterClienteMercadoPago() {
  const accessToken = process.env.MP_ACCESS_TOKEN;

  if (!accessToken) {
    const erro = new Error(
      'Configure MP_ACCESS_TOKEN no arquivo .env do backend.'
    );
    erro.status = 503;
    throw erro;
  }

  return new Preference(
    new MercadoPagoConfig({ accessToken })
  );
}

// POST /pedidos/:id/pagamento
// Cria ou reutiliza uma preferência do Mercado Pago.
// Não aprova o pedido nem reduz o estoque.
async function registrar(req, res, next) {
  try {
    const idPedido = Number(req.params.id);
    const idCliente = Number(req.cliente.id_cliente);

    if (!Number.isInteger(idPedido) || idPedido <= 0) {
      return res.status(400).json({
        erro: 'ID do pedido invalido.',
      });
    }

    const pedido = db.prepare(`
      SELECT
        p.id_pedido,
        p.id_cliente,
        p.status,
        p.valor_total,
        p.valor_frete,
        c.email
      FROM pedido p
      JOIN cliente c ON c.id_cliente = p.id_cliente
      WHERE p.id_pedido = ?
    `).get(idPedido);

    if (!pedido) {
      return res.status(404).json({
        erro: 'Pedido nao encontrado.',
      });
    }

    if (Number(pedido.id_cliente) !== idCliente) {
      return res.status(403).json({
        erro: 'Este pedido nao pertence a voce.',
      });
    }

    if (pedido.status !== 'aguardando_pagamento') {
      return res.status(409).json({
        erro: `O pedido nao pode iniciar pagamento com status "${pedido.status}".`,
      });
    }

    if (!pedido.email) {
      return res.status(400).json({
        erro: 'O cliente precisa ter um e-mail cadastrado.',
      });
    }

    const itens = db.prepare(`
      SELECT
        ip.id_produto,
        pr.nome,
        ip.quantidade,
        ip.preco_unitario,
        ip.subtotal
      FROM item_pedido ip
      JOIN produto pr ON pr.id_produto = ip.id_produto
      WHERE ip.id_pedido = ?
    `).all(idPedido);

    if (!itens.length) {
      return res.status(409).json({
        erro: 'O pedido nao possui itens.',
      });
    }

    const subtotal = itens.reduce(
      (total, item) => total + Number(item.subtotal),
      0
    );

    const frete = Number(pedido.valor_frete);
    const totalCalculado = subtotal + frete;

    if (
      !Number.isSafeInteger(totalCalculado) ||
      totalCalculado !== Number(pedido.valor_total) ||
      totalCalculado <= 0
    ) {
      return res.status(409).json({
        erro: 'O total do pedido precisa ser conferido antes do pagamento.',
      });
    }

    const pagamentoExistente = db.prepare(`
      SELECT
        id_pagamento,
        metodo,
        status,
        id_preferencia,
        url_checkout
      FROM pagamento
      WHERE id_pedido = ?
    `).get(idPedido);

    if (pagamentoExistente?.status === 'aprovado') {
      return res.status(409).json({
        erro: 'Este pedido ja possui pagamento aprovado.',
      });
    }

    // Reutiliza a preferência se o checkout anterior ainda estiver pendente.
    if (
      pagamentoExistente?.status === 'pendente' &&
      pagamentoExistente?.id_preferencia &&
      pagamentoExistente?.url_checkout
    ) {
      return res.json({
        id_pedido: idPedido,
        status: 'aguardando_pagamento',
        url_checkout: pagamentoExistente.url_checkout,
      });
    }

    const preference = obterClienteMercadoPago();

    const itensMercadoPago = itens.map((item) => ({
      id: String(item.id_produto),
      title: item.nome,
      quantity: Number(item.quantidade),
      currency_id: 'BRL',
      unit_price: Number(
        (Number(item.preco_unitario) / 100).toFixed(2)
      ),
    }));

    if (frete > 0) {
      itensMercadoPago.push({
        id: `frete-${idPedido}`,
        title: 'Frete de entrega',
        quantity: 1,
        currency_id: 'BRL',
        unit_price: Number((frete / 100).toFixed(2)),
      });
    }

    const frontendUrl = (
      process.env.FRONTEND_URL || 'http://localhost:5173'
    ).replace(/\/+$/, '');

    const notificationUrl = process.env.MP_NOTIFICATION_URL;

    const corpoPreferencia = {
      items: itensMercadoPago,
      payer: {
        email: pedido.email,
      },
      external_reference: String(idPedido),
      back_urls: {
        success: `${frontendUrl}/pagamento/sucesso`,
        pending: `${frontendUrl}/pagamento/pendente`,
        failure: `${frontendUrl}/pagamento/falha`,
      },
    };

    if (notificationUrl) {
      corpoPreferencia.notification_url = notificationUrl;
    }

    const dadosPreferencia = await preference.create({
      body: corpoPreferencia,
    });

    const urlCheckout =
      dadosPreferencia.sandbox_init_point ||
      dadosPreferencia.init_point;

    if (!dadosPreferencia.id || !urlCheckout) {
      throw new Error(
        'O Mercado Pago nao retornou o identificador e a URL do checkout.'
      );
    }

    if (pagamentoExistente) {
      db.prepare(`
        UPDATE pagamento
        SET metodo = 'checkout_pro',
            status = 'pendente',
            valor = ?,
            indentificador_transacao = NULL,
            id_preferencia = ?,
            url_checkout = ?
        WHERE id_pedido = ?
      `).run(
        totalCalculado,
        String(dadosPreferencia.id),
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
          indentificador_transacao,
          id_preferencia,
          url_checkout
        )
        VALUES (?, 'checkout_pro', 'pendente', ?, NULL, ?, ?)
      `).run(
        idPedido,
        totalCalculado,
        String(dadosPreferencia.id),
        urlCheckout
      );
    }

    return res.status(201).json({
      id_pedido: idPedido,
      status: 'aguardando_pagamento',
      url_checkout: urlCheckout,
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({
        erro: err.message,
      });
    }

    return next(err);
  }
}

module.exports = { registrar };

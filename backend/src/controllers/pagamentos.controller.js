
const db = require('../../db');
const { MercadoPagoConfig, Preference } = require('mercadopago');

function obterClienteMercadoPago() {
  const accessToken = process.env.MP_ACCESS_TOKEN;

  if (!accessToken || accessToken === 'SEU_ACCESS_TOKEN_DE_TESTE') {
    throw new Error(
      'MP_ACCESS_TOKEN não configurado corretamente no arquivo .env.'
    );
  }

  const client = new MercadoPagoConfig({
    accessToken,
  });

  return new Preference(client);
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
};

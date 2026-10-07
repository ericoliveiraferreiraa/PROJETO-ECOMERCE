const db = require('../../db');

// POST /pedidos/:id/pagamento  (RF18, RF19, RF20, RN06)
// Corpo esperado: { "metodo": "pix" | "cartao" | "boleto" }
// (simulado: aqui a gente so registra o pagamento como aprovado direto,
// sem integrar com um gateway de verdade, ja que e um projeto academico)
function registrar(req, res, next) {
  const { metodo } = req.body;
  const id_pedido = req.params.id;
  const id_cliente = req.cliente.id_cliente;

  if (!metodo) {
    return res.status(400).json({ erro: 'Informe o metodo de pagamento.' });
  }

  const buscarPedido = db.prepare('SELECT * FROM pedido WHERE id_pedido = ?');
  const inserirPagamento = db.prepare(`
    INSERT INTO pagamento (id_pedido, metodo, status, valor, indentificador_transacao)
    VALUES (?, ?, 'aprovado', ?, ?)
  `);
  const atualizarPedido = db.prepare(`UPDATE pedido SET status = 'pago' WHERE id_pedido = ?`);

  db.exec('BEGIN');
  try {
    const pedido = buscarPedido.get(id_pedido);

    if (!pedido) {
      db.exec('ROLLBACK');
      return res.status(404).json({ erro: 'Pedido nao encontrado.' });
    }
    if (pedido.id_cliente !== id_cliente) {
      db.exec('ROLLBACK');
      return res.status(403).json({ erro: 'Este pedido nao pertence a voce.' });
    }
    if (pedido.status !== 'aguardando_pagamento') {
      db.exec('ROLLBACK');
      return res.status(409).json({ erro: `Pedido ja esta com status "${pedido.status}", nao pode ser pago novamente.` });
    }

    // identificador fake, simulando o retorno de um gateway de pagamento
    const identificador = `SIMULADO-${Date.now()}`;

    inserirPagamento.run(id_pedido, metodo, pedido.valor_total, identificador);
    atualizarPedido.run(id_pedido);

    db.exec('COMMIT');
    res.status(201).json({
      mensagem: 'Pagamento aprovado.',
      id_pedido: Number(id_pedido),
      status: 'pago',
      identificador_transacao: identificador,
    });
  } catch (err) {
    db.exec('ROLLBACK');
    next(err);
  }
}

module.exports = { registrar };

const db = require('../../db');

// Status que contam como venda.
// Pedidos aguardando pagamento e cancelados ficam de fora.
const STATUS_VENDA = ['pago'];
const MARCADORES = STATUS_VENDA.map(() => '?').join(',');

// Calcula a variacao percentual entre dois periodos.
function variacao(atual, anterior) {
  if (!anterior) return null;
  return Math.round(((atual - anterior) / anterior) * 100);
}

// Formata uma data como YYYY-MM-DD.
function chaveDia(data) {
  const doisDigitos = (n) => String(n).padStart(2, '0');

  return `${data.getFullYear()}-${doisDigitos(
    data.getMonth() + 1
  )}-${doisDigitos(data.getDate())}`;
}

// GET /dashboard
function resumo(req, res, next) {
  try {
    const MES_ATUAL = "strftime('%Y-%m', 'now', 'localtime')";
    const MES_ANTERIOR =
      "strftime('%Y-%m', 'now', 'localtime', 'start of month', '-1 month')";

    const contar = (tabela, coluna, mes) =>
      db.prepare(`
        SELECT COUNT(*) AS n
        FROM ${tabela}
        WHERE strftime('%Y-%m', ${coluna}) = ${mes}
      `).get().n;

    const somarVendas = (mes) =>
      db.prepare(`
        SELECT COALESCE(SUM(valor_total), 0) AS total
        FROM pedido
        WHERE status IN (${MARCADORES})
          AND strftime('%Y-%m', data_pedido) = ${mes}
      `).get(...STATUS_VENDA).total;

    const totalPedidos = db.prepare(
      'SELECT COUNT(*) AS n FROM pedido'
    ).get().n;

    const totalClientes = db.prepare(
      'SELECT COUNT(*) AS n FROM cliente'
    ).get().n;

    const vendasMes = somarVendas(MES_ATUAL);

    // Vendas dos ultimos 7 dias, incluindo hoje.
    const linhas = db.prepare(`
      SELECT date(data_pedido) AS dia, SUM(valor_total) AS total
      FROM pedido
      WHERE status IN (${MARCADORES})
        AND date(data_pedido) >= date('now', 'localtime', '-6 days')
      GROUP BY date(data_pedido)
    `).all(...STATUS_VENDA);

    const porDia = new Map(
      linhas.map((linha) => [linha.dia, linha.total])
    );

    const vendas7dias = [];

    for (let i = 6; i >= 0; i--) {
      const data = new Date();
      data.setDate(data.getDate() - i);

      const dia = chaveDia(data);

      vendas7dias.push({
        dia,
        total: porDia.get(dia) || 0,
      });
    }

    const pedidosRecentes = db.prepare(`
      SELECT
        p.id_pedido,
        c.nome AS cliente,
        p.valor_total,
        p.status,
        p.data_pedido
      FROM pedido p
      JOIN cliente c ON c.id_cliente = p.id_cliente
      ORDER BY p.id_pedido DESC
      LIMIT 5
    `).all();

    res.json({
      totais: {
        pedidos: totalPedidos,
        clientes: totalClientes,
        vendasMes,
      },
      variacoes: {
        pedidos: variacao(
          contar('pedido', 'data_pedido', MES_ATUAL),
          contar('pedido', 'data_pedido', MES_ANTERIOR)
        ),
        clientes: variacao(
          contar('cliente', 'data_cadastro', MES_ATUAL),
          contar('cliente', 'data_cadastro', MES_ANTERIOR)
        ),
        vendasMes: variacao(
          vendasMes,
          somarVendas(MES_ANTERIOR)
        ),
      },
      vendas7dias,
      pedidosRecentes,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { resumo };

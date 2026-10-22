const path = require('path');
const { DatabaseSync } = require('node:sqlite');
require('dotenv').config();

const dbPath = process.env.DB_PATH || '../database/choco-world.sqlite';

const db = new DatabaseSync(path.resolve(__dirname, dbPath));

// IMPORTANTE: sem isso, as regras de FK (ON DELETE RESTRICT/CASCADE)
// definidas no modelo fisico nao sao aplicadas pelo SQLite
db.exec('PRAGMA foreign_keys = ON');

// Marca pedidos cujo estoque já foi debitado, evitando baixa duplicada
// quando o Mercado Pago repetir o retorno de aprovação.
const colunasPedido = db.prepare('PRAGMA table_info(pedido)').all();
if (!colunasPedido.some((coluna) => coluna.name === 'estoque_baixado')) {
  db.exec(`
    ALTER TABLE pedido
    ADD COLUMN estoque_baixado INTEGER NOT NULL DEFAULT 0
    CHECK (estoque_baixado IN (0, 1))
  `);
}

module.exports = db;

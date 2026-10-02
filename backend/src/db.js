const path = require('path');
const Database = require('better-sqlite3');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './data/choco-world.sqlite';

const db = new Database(path.resolve(dbPath));

// IMPORTANTE: sem isso, as regras de FK (ON DELETE RESTRICT/CASCADE)
// definidas no modelo fisico nao sao aplicadas pelo SQLite
db.pragma('foreign_keys = ON');

module.exports = db;

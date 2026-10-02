const path = require('path');
const { DatabaseSync } = require('node:sqlite');
require('dotenv').config();

const dbPath = process.env.DB_PATH || '../database/choco-world.sqlite';

const db = new DatabaseSync(path.resolve(__dirname, dbPath));

// IMPORTANTE: sem isso, as regras de FK (ON DELETE RESTRICT/CASCADE)
// definidas no modelo fisico nao sao aplicadas pelo SQLite
db.exec('PRAGMA foreign_keys = ON');

module.exports = db;

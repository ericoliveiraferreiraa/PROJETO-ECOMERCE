// backend/seed-admin.js  (rode uma vez: node seed-admin.js)
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

const hash2 = bcrypt.hashSync('eric@4321', 10);
db.prepare('INSERT INTO administrador (nome, email, senha) VALUES (?, ?, ?)')
  .run('eric', 'eric@email.com', hash2);
console.log('Admin criado.');
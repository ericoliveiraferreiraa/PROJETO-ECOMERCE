const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../db');

function login(req, res, next) {
  const email = String(req.body.email || '').trim().toLowerCase();
  const senha = req.body.senha;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Informe e-mail e senha.' });
  }

  try {
    const administrador = db.prepare(
      'SELECT * FROM administrador WHERE lower(email) = ?'
    ).get(email);

    if (administrador && bcrypt.compareSync(senha, administrador.senha)) {
      const token = jwt.sign(
        {
          id_administrador: administrador.id_administrador,
          nome: administrador.nome,
          tipo: 'admin',
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      );

      return res.json({ token, tipo: 'admin' });
    }

    const cliente = db.prepare(
      'SELECT * FROM cliente WHERE lower(email) = ?'
    ).get(email);

    if (cliente && bcrypt.compareSync(senha, cliente.senha)) {
      const token = jwt.sign(
        { id_cliente: cliente.id_cliente, nome: cliente.nome },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      );

      return res.json({ token, tipo: 'cliente' });
    }

    return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
  } catch (err) {
    return next(err);
  }
}

module.exports = { login };

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../db');

const SALT_ROUNDS = 10;

// POST /administradores
// Sem autenticacao por enquanto (projeto academico) — em producao isso
// precisaria ser protegido/feito so por quem ja e admin, ou via seed manual.
function cadastrar(req, res, next) {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Campos obrigatorios: nome, email, senha.' });
  }

  try {
    const senhaHash = bcrypt.hashSync(senha, SALT_ROUNDS);

    const resultado = db.prepare(`
      INSERT INTO administrador (nome, email, senha)
      VALUES (?, ?, ?)
    `).run(nome, email, senhaHash);

    res.status(201).json({ id_administrador: resultado.lastInsertRowid, mensagem: 'Administrador cadastrado com sucesso.' });
  } catch (err) {
    next(err);
  }
}

// POST /administradores/login
function login(req, res, next) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Informe email e senha.' });
  }

  try {
    const admin = db.prepare('SELECT * FROM administrador WHERE email = ?').get(email);

    if (!admin || !bcrypt.compareSync(senha, admin.senha)) {
      return res.status(401).json({ erro: 'Email ou senha invalidos.' });
    }

    // tipo: 'admin' diferencia esse token do token de cliente no middleware de auth
    const token = jwt.sign(
      { id_administrador: admin.id_administrador, nome: admin.nome, tipo: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({ token, administrador: { id_administrador: admin.id_administrador, nome: admin.nome, email: admin.email } });
  } catch (err) {
    next(err);
  }
}

// GET /administradores/logs?limite=50
function listarLogs(req, res, next) {
  try {
    const pedido = Math.floor(Number(req.query.limite));
    const limite = Number.isFinite(pedido) && pedido > 0 ? Math.min(pedido, 200) : 50;

    const logs = db.prepare(`
      SELECT l.id_log, l.data_hora, a.nome AS administrador,
             l.acao, l.entidade, l.id_registro, l.descricao
      FROM log_administrativo l
      JOIN administrador a ON a.id_administrador = l.id_administrador
      ORDER BY l.id_log DESC
      LIMIT ?
    `).all(limite);

    res.json(logs);
  } catch (err) {
    next(err);
  }
}

module.exports = { cadastrar, login, listarLogs };



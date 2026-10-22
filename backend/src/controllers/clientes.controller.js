const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../db');

const SALT_ROUNDS = 10;

// POST /clientes  (RF: cadastro de cliente)
function cadastrar(req, res, next) {
  const { senha } = req.body;
  const nome = String(req.body.nome || '').trim().replace(/\s+/g, ' ').toLocaleUpperCase('pt-BR');
  const cpf = String(req.body.cpf || '').replace(/\D/g, '');
  const email = String(req.body.email || '').trim().toLowerCase();
  const telefone = String(req.body.telefone || '').replace(/\D/g, '');

  if (!nome || !cpf || !email || !telefone || !senha) {
    return res.status(400).json({ erro: 'Campos obrigatorios: nome, cpf, email, telefone, senha.' });
  }

  if (cpf.length !== 11) {
    return res.status(400).json({ erro: 'O CPF deve conter exatamente 11 dígitos.' });
  }

  if (telefone.length !== 10 && telefone.length !== 11) {
    return res.status(400).json({ erro: 'O telefone deve conter DDD e número: 10 ou 11 dígitos.' });
  }

  try {
    const senhaHash = bcrypt.hashSync(senha, SALT_ROUNDS);

    const resultado = db.prepare(`
      INSERT INTO cliente (nome, cpf, email, telefone, senha)
      VALUES (?, ?, ?, ?, ?)
    `).run(nome, cpf, email, telefone, senhaHash);

    res.status(201).json({ id_cliente: resultado.lastInsertRowid, mensagem: 'Cliente cadastrado com sucesso.' });
  } catch (err) {
    next(err);
  }
}

// POST /clientes/login
function login(req, res, next) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Informe email e senha.' });
  }

  try {
    const cliente = db.prepare('SELECT * FROM cliente WHERE email = ?').get(email);

    if (!cliente || !bcrypt.compareSync(senha, cliente.senha)) {
      return res.status(401).json({ erro: 'Email ou senha invalidos.' });
    }

    const token = jwt.sign(
      { id_cliente: cliente.id_cliente, nome: cliente.nome },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({ token, cliente: { id_cliente: cliente.id_cliente, nome: cliente.nome, email: cliente.email } });
  } catch (err) {
    next(err);
  }
}

// GET /clientes/me  (rota protegida — usa req.cliente definido pelo middleware de auth)
function meusDados(req, res, next) {
  try {
    const cliente = db.prepare(`
      SELECT id_cliente, nome, cpf, email, telefone, data_cadastro
      FROM cliente WHERE id_cliente = ?
    `).get(req.cliente.id_cliente);

    if (!cliente) return res.status(404).json({ erro: 'Cliente nao encontrado.' });
    res.json(cliente);
  } catch (err) {
    next(err);
  }
}

module.exports = { cadastrar, login, meusDados };

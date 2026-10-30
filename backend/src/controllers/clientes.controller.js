const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../db');

const SALT_ROUNDS = 10;

// POST /clientes  (RF: cadastro de cliente)
function cadastrar(req, res, next) {
  const { nome, cpf, email, telefone, senha } = req.body;

  if (!nome || !cpf || !email || !telefone || !senha) {
    return res.status(400).json({ erro: 'Campos obrigatorios: nome, cpf, email, telefone, senha.' });
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

function alterarSenha(req, res, next) {
  const { senhaAtual, novaSenha } = req.body;
  if (!senhaAtual || typeof novaSenha !== 'string' || novaSenha.length < 8) {
    return res.status(400).json({ erro: 'Informe sua senha atual e uma nova senha com pelo menos 8 caracteres.' });
  }
  try {
    const cliente = db.prepare('SELECT senha FROM cliente WHERE id_cliente = ?').get(req.cliente.id_cliente);
    if (!cliente || !bcrypt.compareSync(senhaAtual, cliente.senha)) {
      return res.status(401).json({ erro: 'A senha atual está incorreta.' });
    }
    db.prepare('UPDATE cliente SET senha = ? WHERE id_cliente = ?').run(bcrypt.hashSync(novaSenha, SALT_ROUNDS), req.cliente.id_cliente);
    return res.json({ mensagem: 'Senha atualizada com sucesso.' });
  } catch (err) {
    next(err);
  }
}

function redefinirSenha(req, res, next) {
  const email = String(req.body.email ?? '').trim().toLowerCase();
  const { novaSenha } = req.body;
  if (!email || typeof novaSenha !== 'string' || novaSenha.length < 8) {
    return res.status(400).json({ erro: 'Informe o e-mail e uma nova senha com pelo menos 8 caracteres.' });
  }

  try {
    const resultado = db.prepare(`
      UPDATE cliente
      SET senha = ?
      WHERE lower(email) = ?
    `).run(bcrypt.hashSync(novaSenha, SALT_ROUNDS), email);

    if (resultado.changes === 0) {
      return res.status(400).json({ erro: 'Não encontramos uma conta com esse e-mail.' });
    }

    return res.json({ mensagem: 'Senha redefinida. Agora você já pode entrar na sua conta.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { cadastrar, login, meusDados, alterarSenha, redefinirSenha };

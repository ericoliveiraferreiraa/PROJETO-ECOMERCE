
const db = require('../../db');
const { registrar } = require('../services/logAdmin');

// GET /categorias
// Lista somente categorias ativas para uso público.
function listar(req, res, next) {
  try {
    const categorias = db.prepare(`
      SELECT id_categoria, nome, descricao, ativo
      FROM categoria
      WHERE ativo = 1
      ORDER BY nome
    `).all();

    res.json(categorias);
  } catch (err) {
    next(err);
  }
}

// POST /categorias
// Cadastra uma categoria (somente administrador).
function criar(req, res, next) {
  const { nome, descricao } = req.body;

  if (!nome || !nome.trim()) {
    return res.status(400).json({
      erro: 'Campo obrigatório: nome.'
    });
  }

  try {
    const nomeCategoria = nome.trim();

    const resultado = db.prepare(`
      INSERT INTO categoria (nome, descricao)
      VALUES (?, ?)
    `).run(nomeCategoria, descricao || null);

    registrar(
      req.administrador.id_administrador,
      'CRIAR',
      'categoria',
      resultado.lastInsertRowid,
      `Categoria "${nomeCategoria}" cadastrada`
    );

    res.status(201).json({
      id_categoria: Number(resultado.lastInsertRowid),
      mensagem: 'Categoria cadastrada com sucesso.'
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /categorias/:id/inativar
function inativar(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: 'ID da categoria inválido.'
    });
  }

  try {
    const categoria = db.prepare(`
      SELECT id_categoria, nome, ativo
      FROM categoria
      WHERE id_categoria = ?
    `).get(id);

    if (!categoria) {
      return res.status(404).json({
        erro: 'Categoria não encontrada.'
      });
    }

    if (categoria.ativo === 0) {
      return res.status(409).json({
        erro: 'Esta categoria já está inativa.'
      });
    }

    db.prepare(`
      UPDATE categoria
      SET ativo = 0
      WHERE id_categoria = ?
    `).run(id);

    registrar(
      req.administrador.id_administrador,
      'INATIVAR',
      'categoria',
      id,
      `Categoria "${categoria.nome}" inativada`
    );

    res.json({
      mensagem: 'Categoria inativada com sucesso.'
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /categorias/:id/ativar
function ativar(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: 'ID da categoria inválido.'
    });
  }

  try {
    const categoria = db.prepare(`
      SELECT id_categoria, nome, ativo
      FROM categoria
      WHERE id_categoria = ?
    `).get(id);

    if (!categoria) {
      return res.status(404).json({
        erro: 'Categoria não encontrada.'
      });
    }

    if (categoria.ativo === 1) {
      return res.status(409).json({
        erro: 'Esta categoria já está ativa.'
      });
    }

    db.prepare(`
      UPDATE categoria
      SET ativo = 1
      WHERE id_categoria = ?
    `).run(id);

    registrar(
      req.administrador.id_administrador,
      'ATIVAR',
      'categoria',
      id,
      `Categoria "${categoria.nome}" ativada`
    );

    res.json({
      mensagem: 'Categoria ativada com sucesso.'
    });
  } catch (err) {
    next(err);
  }
}


function listarTodas(req, res, next) {
  try {
    const categorias = db.prepare(`
      SELECT id_categoria, nome, descricao, ativo
      FROM categoria
      ORDER BY nome
    `).all();

    res.json(categorias);
  } catch (err) {
    next(err);
  }
}


module.exports = {
  listar,
  listarTodas,
  criar,
  inativar,
  ativar
};
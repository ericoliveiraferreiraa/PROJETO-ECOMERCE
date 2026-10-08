const db = require('../../db');
const { consultarCep } = require('../services/viacep');

// GET /enderecos/cep/:cep  (so consulta, nao grava nada)
async function buscarPorCep(req, res, next) {
  try {
    const endereco = await consultarCep(req.params.cep);
    res.json(endereco);
  } catch (err) {
    next(err);
  }
}

// POST /enderecos
// Corpo: { "cep": "01001-000", "numero": "100", "complemento": "apto 5" }
// Rua, bairro, cidade e estado vem do ViaCEP. Se o CEP for generico
// (cidade pequena, sem rua/bairro), o cliente pode mandar logradouro e bairro.
async function criar(req, res, next) {
  const { cep, numero, complemento, logradouro, bairro } = req.body;

  if (!cep || !numero) {
    return res.status(400).json({ erro: 'Campos obrigatorios: cep, numero.' });
  }

  try {
    const base = await consultarCep(cep);

    const dados = {
      ...base,
      logradouro: logradouro || base.logradouro,
      bairro: bairro || base.bairro,
    };

    if (!dados.logradouro || !dados.bairro) {
      return res.status(400).json({ erro: 'Este CEP nao traz rua/bairro. Informe logradouro e bairro.' });
    }

    const resultado = db.prepare(`
      INSERT INTO endereco (id_cliente, cep, logradouro, numero, complemento, bairro, cidade, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.cliente.id_cliente,
      dados.cep,
      dados.logradouro,
      String(numero),
      complemento || null,
      dados.bairro,
      dados.cidade,
      dados.estado
    );

    res.status(201).json({
      id_endereco: resultado.lastInsertRowid,
      ...dados,
      numero: String(numero),
      complemento: complemento || null,
    });
  } catch (err) {
    next(err);
  }
}

// GET /enderecos  (so os enderecos do cliente logado)
function listar(req, res, next) {
  try {
    const enderecos = db.prepare(`
      SELECT id_endereco, cep, logradouro, numero, complemento, bairro, cidade, estado
      FROM endereco
      WHERE id_cliente = ?
      ORDER BY id_endereco DESC
    `).all(req.cliente.id_cliente);

    res.json(enderecos);
  } catch (err) {
    next(err);
  }
}

// DELETE /enderecos/:id
// O "AND id_cliente = ?" garante que ninguem apaga endereco de outro cliente
function remover(req, res, next) {
  try {
    const resultado = db.prepare(
      'DELETE FROM endereco WHERE id_endereco = ? AND id_cliente = ?'
    ).run(req.params.id, req.cliente.id_cliente);

    if (resultado.changes === 0) {
      return res.status(404).json({ erro: 'Endereco nao encontrado.' });
    }
    res.json({ mensagem: 'Endereco removido.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { buscarPorCep, criar, listar, remover };
// Os triggers do banco (RN02, RN03, RN04/RN08) chamam RAISE(ABORT, 'mensagem').
// O node:sqlite propaga isso como erro com a mensagem do RAISE dentro de
// error.message. Aqui a gente checa pelo CONTEUDO da mensagem (em vez do
// error.code, que varia entre drivers) para responder com HTTP 400/409
// amigavel, em vez de estourar um 500 generico.

function errorHandler(err, req, res, next) {
  const msg = err.message || '';

  if (/RN\d+/.test(msg)) {
    return res.status(400).json({ erro: msg.replace(/^.*?(RN\d+)/, '$1') });
  }

  if (msg.includes('FOREIGN KEY')) {
    return res.status(409).json({ erro: 'Este registro nao pode ser alterado/excluido pois esta vinculado a outro(s).' });
  }

  if (msg.includes('UNIQUE')) {
    return res.status(409).json({ erro: 'Ja existe um registro com esse valor unico (ex: CPF ou e-mail duplicado).' });
  }

  if (msg.toUpperCase().includes('SQLITE')) {
    return res.status(400).json({ erro: 'Violacao de regra do banco de dados.' });
  }

  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
}

module.exports = errorHandler;

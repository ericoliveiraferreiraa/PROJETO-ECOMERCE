// Os triggers do banco (RN02, RN03, RN04/RN08) chamam RAISE(ABORT, 'mensagem').
// O better-sqlite3 propaga isso como erro com code SQLITE_CONSTRAINT_TRIGGER
// e a mensagem do RAISE dentro de error.message. Aqui a gente traduz isso
// para uma resposta HTTP 400 amigavel, em vez de estourar um 500 generico.

function errorHandler(err, req, res, next) {
  if (err.code === 'SQLITE_CONSTRAINT_TRIGGER') {
    // error.message vem tipo: "RN02: o preco do produto deve ser maior que zero"
    return res.status(400).json({ erro: err.message.replace(/^.*: /, '') || err.message });
  }

  if (err.code && err.code.startsWith('SQLITE_CONSTRAINT')) {
    // FK (RN10 - produto ja vendido), UNIQUE (cpf/email duplicado), etc.
    if (err.message.includes('FOREIGN KEY')) {
      return res.status(409).json({ erro: 'Este registro nao pode ser alterado/excluido pois esta vinculado a outro(s).' });
    }
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ erro: 'Ja existe um registro com esse valor unico (ex: CPF ou e-mail duplicado).' });
    }
    return res.status(400).json({ erro: 'Violacao de regra do banco de dados.' });
  }

  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
}

module.exports = errorHandler;

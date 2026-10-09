const db = require('../../db');

// Registra uma acao do administrador em log_administrativo.
// Se o log falhar, so avisa no console: nao pode derrubar a acao principal.
function registrar(id_administrador, acao, entidade, id_registro, descricao) {
  try {
    db.prepare(`
      INSERT INTO log_administrativo (id_administrador, acao, entidade, id_registro, descricao)
      VALUES (?, ?, ?, ?, ?)
    `).run(id_administrador, acao, entidade, id_registro ?? null, descricao || null);
  } catch (err) {
    console.error('Falha ao gravar log administrativo:', err.message);
  }
}

module.exports = { registrar };
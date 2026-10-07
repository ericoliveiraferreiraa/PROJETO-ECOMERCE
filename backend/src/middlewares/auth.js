const jwt = require('jsonwebtoken');

// Protege rotas que exigem cliente autenticado.
// Espera o header: Authorization: Bearer <token>
function autenticarCliente(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token nao informado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.cliente = payload; // { id_cliente, nome }
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token invalido ou expirado.' });
  }
}

// Protege rotas que exigem administrador autenticado.
// So aceita token gerado pelo login de administrador (tem tipo: 'admin').
function autenticarAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token nao informado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.tipo !== 'admin') {
      return res.status(403).json({ erro: 'Acesso restrito a administradores.' });
    }

    req.administrador = payload; // { id_administrador, nome, tipo }
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token invalido ou expirado.' });
  }
}

module.exports = { autenticarCliente, autenticarAdmin };

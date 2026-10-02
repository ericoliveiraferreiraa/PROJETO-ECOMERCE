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

module.exports = { autenticarCliente };

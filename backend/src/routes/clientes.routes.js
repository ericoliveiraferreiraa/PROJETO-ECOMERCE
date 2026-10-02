const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientes.controller');
const { autenticarCliente } = require('../middlewares/auth');

router.post('/', clientesController.cadastrar);
router.post('/login', clientesController.login);
router.get('/me', autenticarCliente, clientesController.meusDados);

module.exports = router;

const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidos.controller');
const pagamentosController = require('../controllers/pagamentos.controller');
const { autenticarCliente } = require('../middlewares/auth');

// todas as rotas de pedido exigem cliente logado
router.use(autenticarCliente);

router.post('/', pedidosController.criar);
router.get('/', pedidosController.listarDoCliente);
router.get('/:id', pedidosController.obterPorId);
router.post('/:id/pagamento', pagamentosController.registrar);

module.exports = router;

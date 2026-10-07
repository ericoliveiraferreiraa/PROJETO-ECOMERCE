const express = require('express');
const router = express.Router();
const produtosController = require('../controllers/produtos.controller');
const { autenticarAdmin } = require('../middlewares/auth');

// rotas publicas (qualquer visitante pode ver o catalogo)
router.get('/', produtosController.listar);
router.get('/:id', produtosController.obterPorId);

// rotas restritas a administrador
router.post('/', autenticarAdmin, produtosController.criar);
router.patch('/:id/inativar', autenticarAdmin, produtosController.inativar);

module.exports = router;

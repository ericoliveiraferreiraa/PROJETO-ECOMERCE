const express = require('express');
const router = express.Router();
const produtosController = require('../controllers/produtos.controller');

router.get('/', produtosController.listar);
router.get('/:id', produtosController.obterPorId);
router.post('/', produtosController.criar);
router.patch('/:id/inativar', produtosController.inativar);

module.exports = router;

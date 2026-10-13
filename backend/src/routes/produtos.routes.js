const express = require('express');
const router = express.Router();
const produtosController = require('../controllers/produtos.controller');
const { autenticarAdmin } = require('../middlewares/auth');

// rotas publicas (qualquer visitante pode ver o catalogo)
router.get('/', produtosController.listar);
router.get('/:id', produtosController.obterPorId);
router.get('/admin/listar', autenticarAdmin, produtosController.listarAdmin);

// rotas restritas a administrador
router.post('/', autenticarAdmin, produtosController.criar);
router.patch('/:id/inativar', autenticarAdmin, produtosController.inativar);
router.patch('/:id', autenticarAdmin, produtosController.editar);

module.exports = router;

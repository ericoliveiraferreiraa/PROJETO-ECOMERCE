const express = require('express');
const router = express.Router();
const enderecosController = require('../controllers/enderecos.controller');
const { autenticarCliente } = require('../middlewares/auth');

// todas as rotas de endereco exigem cliente logado
router.use(autenticarCliente);

router.get('/cep/:cep', enderecosController.buscarPorCep);
router.get('/', enderecosController.listar);
router.post('/', enderecosController.criar);
router.delete('/:id', enderecosController.remover);

module.exports = router;
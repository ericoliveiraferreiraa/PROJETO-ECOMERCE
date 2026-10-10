
const express = require('express');
const router = express.Router();

const estoqueController = require('../controllers/estoque.controller');
const { autenticarAdmin } = require('../middlewares/auth');

// Somente administradores podem consultar e alterar o estoque.
router.use(autenticarAdmin);

router.get('/', estoqueController.listar);
router.patch('/:id', estoqueController.atualizar);

module.exports = router;
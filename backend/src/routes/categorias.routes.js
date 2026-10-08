const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categorias.controller');
const { autenticarAdmin } = require('../middlewares/auth');

router.get('/', categoriasController.listar);
router.post('/', autenticarAdmin, categoriasController.criar);

module.exports = router;
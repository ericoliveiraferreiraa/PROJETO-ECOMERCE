
const express = require('express');

const router = express.Router();

const categoriasController = require('../controllers/categorias.controller');
const { autenticarAdmin } = require('../middlewares/auth');

router.get('/', categoriasController.listar);

router.post('/', autenticarAdmin, categoriasController.criar);

router.patch(
  '/:id/inativar',
  autenticarAdmin,
  categoriasController.inativar
);

router.patch(
  '/:id/ativar',
  autenticarAdmin,
  categoriasController.ativar
);


router.get(
  '/admin/listar',
  autenticarAdmin,
  categoriasController.listarTodas
);

module.exports = router;
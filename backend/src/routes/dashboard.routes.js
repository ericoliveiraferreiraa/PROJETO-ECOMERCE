const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard.controller');
const { autenticarAdmin } = require('../middlewares/auth');

// Resumo da loja para o painel administrativo.
router.get('/', autenticarAdmin, dashboardController.resumo);

module.exports = router;
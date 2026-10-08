const { autenticarAdmin } = require('../middlewares/auth');
const express = require('express');
const router = express.Router();
const administradoresController = require('../controllers/administradores.controller');

router.post('/', autenticarAdmin, administradoresController.cadastrar);
router.post('/login', administradoresController.login);

module.exports = router;

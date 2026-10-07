const express = require('express');
const router = express.Router();
const administradoresController = require('../controllers/administradores.controller');

router.post('/', administradoresController.cadastrar);
router.post('/login', administradoresController.login);

module.exports = router;

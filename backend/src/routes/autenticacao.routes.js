const express = require('express');
const autenticacaoController = require('../controllers/autenticacao.controller');

const router = express.Router();

router.post('/login', autenticacaoController.login);

module.exports = router;

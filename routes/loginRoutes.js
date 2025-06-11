// SIM TODA MINHA PARTE ESTÀ EM REQUIRE, QND ME DEI CONTA ERA TARDE DEMAIS PARA TROCAR

const express = require('express');
const loginController = require('../controllers/loginController');

const router = express.Router();

router.post('/', loginController.login);

module.exports = router;

/**
 * Rutas directas de Liquidaciones
 */
const express = require('express');
const router = express.Router();
const settlementController = require('../controllers/settlementController');

router.delete('/:id', settlementController.deleteSettlement);

module.exports = router;

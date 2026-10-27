/**
 * Rutas de Estadísticas y Reset
 */
const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.get('/overview', statsController.getOverview);
router.post('/reset-seed', statsController.resetSeed);

module.exports = router;

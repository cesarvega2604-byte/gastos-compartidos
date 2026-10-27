/**
 * Enrutador Principal de la API
 */
const express = require('express');
const router = express.Router();

const groupRoutes = require('./groupRoutes');
const expenseRoutes = require('./expenseRoutes');
const settlementRoutes = require('./settlementRoutes');
const statsRoutes = require('./statsRoutes');

// Endpoint de verificación de estado (Health Check)
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Splitwise SENA API',
    version: '1.0.0'
  });
});

// Montar recursos REST
router.use('/groups', groupRoutes);
router.use('/expenses', expenseRoutes);
router.use('/settlements', settlementRoutes);
router.use('/stats', statsRoutes);

module.exports = router;

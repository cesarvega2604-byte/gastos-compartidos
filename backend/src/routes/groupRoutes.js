/**
 * Rutas de Grupos
 */
const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const expenseController = require('../controllers/expenseController');
const settlementController = require('../controllers/settlementController');

// Rutas base de grupos
router.get('/', groupController.getAllGroups);
router.post('/', groupController.createGroup);
router.get('/:id', groupController.getGroupById);
router.put('/:id', groupController.updateGroup);
router.delete('/:id', groupController.deleteGroup);

// Añadir miembros a un grupo
router.post('/:id/members', groupController.addMember);

// Obtener balances y cálculos de deuda de un grupo
router.get('/:id/balances', groupController.getGroupBalances);

// Sub-rutas anidadas de gastos dentro de un grupo
router.get('/:groupId/expenses', expenseController.getExpensesByGroup);
router.post('/:groupId/expenses', expenseController.createExpense);

// Sub-rutas anidadas de liquidaciones dentro de un grupo
router.get('/:groupId/settlements', settlementController.getSettlementsByGroup);
router.post('/:groupId/settlements', settlementController.createSettlement);

module.exports = router;

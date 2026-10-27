/**
 * Controlador de Estadísticas y Utilidades
 */
const { groupRepository, expenseRepository, settlementRepository, resetToSeedData } = require('../models/databaseAdapter');
const { isMongoConnected } = require('../config/database');

const statsController = {
  // GET /api/stats/overview
  async getOverview(req, res, next) {
    try {
      const groups = await groupRepository.findAll();
      let totalGroups = groups.length;
      let totalMembers = 0;
      let totalSpentAllGroups = 0;
      let totalExpensesCount = 0;

      for (const g of groups) {
        totalMembers += g.members?.length || 0;
        const expenses = await expenseRepository.findByGroupId(g.id);
        totalExpensesCount += expenses.length;
        totalSpentAllGroups += expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
      }

      res.status(200).json({
        success: true,
        data: {
          databaseEngine: isMongoConnected() ? 'MongoDB Atlas' : 'Local JSON Persistent Storage',
          totalGroups,
          totalMembers,
          totalExpensesCount,
          totalSpentAllGroups: Math.round(totalSpentAllGroups * 100) / 100
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/stats/reset-seed
  async resetSeed(req, res, next) {
    try {
      await resetToSeedData();
      res.status(200).json({
        success: true,
        message: 'Base de datos restaurada con datos de demostración de alta calidad.'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = statsController;

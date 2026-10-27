/**
 * Controlador de Gastos
 * Maneja el registro, edición, eliminación y división de gastos.
 */
const { groupRepository, expenseRepository } = require('../models/databaseAdapter');

const expenseController = {
  // GET /api/groups/:groupId/expenses
  async getExpensesByGroup(req, res, next) {
    try {
      const { groupId } = req.params;
      const expenses = await expenseRepository.findByGroupId(groupId);
      
      res.status(200).json({
        success: true,
        count: expenses.length,
        data: expenses
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/groups/:groupId/expenses
  async createExpense(req, res, next) {
    try {
      const { groupId } = req.params;
      const { description, amount, category, paidBy, splitType, splits, date, notes } = req.body;

      // 1. Validaciones requeridas
      if (!description || description.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'La descripción del gasto es obligatoria.'
        });
      }

      const numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'El monto debe ser un número mayor a cero.'
        });
      }

      const group = await groupRepository.findById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: `El grupo '${groupId}' no existe.`
        });
      }

      // Validar que el pagador pertenece al grupo
      const memberExists = group.members.some(m => (m.id || m._id?.toString()) === paidBy);
      if (!memberExists) {
        return res.status(400).json({
          success: false,
          message: 'El pagador especificado no es un miembro registrado del grupo.'
        });
      }

      // 2. Procesamiento de splits (división)
      let processedSplits = splits;

      // Si no se enviaron splits o el tipo es EQUAL, dividir equitativamente entre todos los miembros seleccionados
      if (!Array.isArray(splits) || splits.length === 0 || splitType === 'EQUAL') {
        const participantIds = (Array.isArray(splits) && splits.length > 0)
          ? splits.map(s => s.memberId)
          : group.members.map(m => m.id);

        const count = participantIds.length;
        const equalShare = Math.round((numericAmount / count) * 100) / 100;
        
        // Ajustar centavos en el primer participante si hay residuo
        const totalShare = equalShare * count;
        const diff = Math.round((numericAmount - totalShare) * 100) / 100;

        processedSplits = participantIds.map((memberId, index) => ({
          memberId,
          amount: index === 0 ? Math.round((equalShare + diff) * 100) / 100 : equalShare,
          percentage: Math.round((100 / count) * 100) / 100
        }));
      }

      const newExpense = await expenseRepository.create({
        groupId,
        description,
        amount: numericAmount,
        category: category || 'otro',
        paidBy,
        splitType: splitType || 'EQUAL',
        splits: processedSplits,
        date: date || new Date().toISOString(),
        notes
      });

      res.status(201).json({
        success: true,
        message: 'Gasto registrado correctamente.',
        data: newExpense
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/expenses/:id
  async updateExpense(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await expenseRepository.update(id, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: `Gasto con ID '${id}' no encontrado.`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Gasto actualizado correctamente.',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/expenses/:id
  async deleteExpense(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await expenseRepository.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: `Gasto con ID '${id}' no encontrado.`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Gasto eliminado con éxito.'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = expenseController;

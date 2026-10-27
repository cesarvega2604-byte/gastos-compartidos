/**
 * Controlador de Liquidaciones / Pagos
 * Permite registrar pagos entre miembros para saldar deudas calculadas.
 */
const { groupRepository, settlementRepository } = require('../models/databaseAdapter');

const settlementController = {
  // GET /api/groups/:groupId/settlements
  async getSettlementsByGroup(req, res, next) {
    try {
      const { groupId } = req.params;
      const settlements = await settlementRepository.findByGroupId(groupId);

      res.status(200).json({
        success: true,
        count: settlements.length,
        data: settlements
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/groups/:groupId/settlements
  async createSettlement(req, res, next) {
    try {
      const { groupId } = req.params;
      const { fromMemberId, toMemberId, amount, date, notes } = req.body;

      if (!fromMemberId || !toMemberId) {
        return res.status(400).json({
          success: false,
          message: 'Debe especificar el miembro que paga y el miembro que recibe.'
        });
      }

      if (fromMemberId === toMemberId) {
        return res.status(400).json({
          success: false,
          message: 'El pagador y el receptor no pueden ser la misma persona.'
        });
      }

      const numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'El monto de la liquidación debe ser mayor a 0.'
        });
      }

      const group = await groupRepository.findById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: `El grupo '${groupId}' no existe.`
        });
      }

      const newSettlement = await settlementRepository.create({
        groupId,
        fromMemberId,
        toMemberId,
        amount: numericAmount,
        date: date || new Date().toISOString(),
        notes
      });

      res.status(201).json({
        success: true,
        message: 'Liquidación / Pago registrado exitosamente.',
        data: newSettlement
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/settlements/:id
  async deleteSettlement(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await settlementRepository.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: `Liquidación con ID '${id}' no encontrada.`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Liquidación eliminada correctamente.'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = settlementController;

/**
 * Controlador de Grupos
 * Gestiona el ciclo de vida de los grupos y sus miembros.
 */
const { groupRepository, expenseRepository, settlementRepository } = require('../models/databaseAdapter');
const { getGroupFinancialSummary } = require('../services/debtSimplificationService');

const groupController = {
  // GET /api/groups - Listar todos los grupos con métricas rápidas
  async getAllGroups(req, res, next) {
    try {
      const groups = await groupRepository.findAll();
      
      // Enriquecer cada grupo con su total gastado y cantidad de miembros
      const enrichedGroups = await Promise.all(groups.map(async (group) => {
        const expenses = await expenseRepository.findByGroupId(group.id);
        const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        return {
          ...group,
          totalSpent,
          membersCount: group.members?.length || 0,
          expensesCount: expenses.length
        };
      }));

      res.status(200).json({
        success: true,
        count: enrichedGroups.length,
        data: enrichedGroups
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/groups/:id - Detalle completo de un grupo con resumen de deudas
  async getGroupById(req, res, next) {
    try {
      const { id } = req.params;
      const group = await groupRepository.findById(id);

      if (!group) {
        return res.status(404).json({
          success: false,
          message: `Grupo con ID '${id}' no encontrado.`
        });
      }

      const expenses = await expenseRepository.findByGroupId(id);
      const settlements = await settlementRepository.findByGroupId(id);
      const summary = getGroupFinancialSummary(group, expenses, settlements);

      res.status(200).json({
        success: true,
        data: {
          group,
          expenses,
          settlements,
          summary
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/groups - Crear nuevo grupo
  async createGroup(req, res, next) {
    try {
      const { name, description, category, currency, members } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El nombre del grupo es obligatorio.'
        });
      }

      if (!Array.isArray(members) || members.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Un grupo debe tener al menos dos (2) miembros para compartir gastos.'
        });
      }

      const newGroup = await groupRepository.create({
        name,
        description,
        category,
        currency,
        members
      });

      res.status(201).json({
        success: true,
        message: 'Grupo creado exitosamente.',
        data: newGroup
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/groups/:id - Actualizar datos del grupo
  async updateGroup(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await groupRepository.update(id, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: `Grupo con ID '${id}' no encontrado.`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Grupo actualizado correctamente.',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/groups/:id - Eliminar grupo y sus registros asociados en cascada
  async deleteGroup(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await groupRepository.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: `Grupo con ID '${id}' no encontrado.`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Grupo y gastos asociados eliminados correctamente.'
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/groups/:id/members - Añadir nuevo participante al grupo
  async addMember(req, res, next) {
    try {
      const { id } = req.params;
      const { name, email, color } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El nombre del participante es obligatorio.'
        });
      }

      const updated = await groupRepository.addMember(id, { name, email, color });
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: `Grupo con ID '${id}' no encontrado.`
        });
      }

      res.status(201).json({
        success: true,
        message: 'Miembro agregado exitosamente.',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/groups/:id/balances - Obtener balances y sugerencias de pago simplificadas
  async getGroupBalances(req, res, next) {
    try {
      const { id } = req.params;
      const group = await groupRepository.findById(id);

      if (!group) {
        return res.status(404).json({
          success: false,
          message: `Grupo con ID '${id}' no encontrado.`
        });
      }

      const expenses = await expenseRepository.findByGroupId(id);
      const settlements = await settlementRepository.findByGroupId(id);
      const summary = getGroupFinancialSummary(group, expenses, settlements);

      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = groupController;

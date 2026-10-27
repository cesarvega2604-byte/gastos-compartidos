/**
 * Adaptador de Base de Datos y Repositorios
 * 
 * Implementa el patrón Repository para desacoplar los controladores del motor de base de datos.
 * - Conexión principal: MongoDB Atlas (mediante Mongoose Schemas).
 * - Persistencia local fallback: Almacenamiento JSON transaccional en disco (data/db.json),
 *   asegurando que NUNCA se pierdan datos al reiniciar el servidor.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { isMongoConnected } = require('../config/database');
const { Group, Expense, Settlement } = require('./mongooseSchemas');
const { initialGroups, initialExpenses, initialSettlements } = require('../utils/seedData');

// Ruta del archivo JSON de persistencia local
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Asegurar que el directorio de datos existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Inicializar archivo de base de datos local si no existe
function loadLocalData() {
  if (!fs.existsSync(DB_FILE)) {
    const defaultData = {
      groups: initialGroups,
      expenses: initialExpenses,
      settlements: initialSettlements
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error leyendo db.json local:', err);
    return { groups: [], expenses: [], settlements: [] };
  }
}

function saveLocalData(data) {
  try {
    const tempPath = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, DB_FILE);
  } catch (err) {
    console.error('Error guardando en db.json local:', err);
    throw new Error('Error al persistir datos en disco');
  }
}

function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

// ==========================================
// REPOSITORIO DE GRUPOS
// ==========================================
const groupRepository = {
  async findAll() {
    if (isMongoConnected()) {
      return await Group.find().lean();
    }
    const data = loadLocalData();
    return data.groups;
  },

  async findById(id) {
    if (isMongoConnected()) {
      return await Group.findOne({ $or: [{ _id: id }, { id: id }] }).lean();
    }
    const data = loadLocalData();
    return data.groups.find(g => g.id === id) || null;
  },

  async create(groupData) {
    const newGroup = {
      id: groupData.id || generateId('grp'),
      name: groupData.name.trim(),
      description: (groupData.description || '').trim(),
      category: groupData.category || 'viaje',
      currency: groupData.currency || 'COP',
      members: (groupData.members || []).map((m, idx) => ({
        id: m.id || generateId('usr'),
        name: m.name.trim(),
        email: (m.email || '').trim(),
        avatar: m.avatar || m.name.trim().charAt(0).toUpperCase(),
        color: m.color || ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#14B8A6'][idx % 6]
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isMongoConnected()) {
      const created = await Group.create(newGroup);
      return created.toObject();
    }

    const data = loadLocalData();
    data.groups.push(newGroup);
    saveLocalData(data);
    return newGroup;
  },

  async update(id, updateData) {
    if (isMongoConnected()) {
      return await Group.findOneAndUpdate(
        { $or: [{ _id: id }, { id: id }] },
        { ...updateData, updatedAt: new Date().toISOString() },
        { new: true }
      ).lean();
    }

    const data = loadLocalData();
    const index = data.groups.findIndex(g => g.id === id);
    if (index === -1) return null;

    data.groups[index] = {
      ...data.groups[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    saveLocalData(data);
    return data.groups[index];
  },

  async delete(id) {
    if (isMongoConnected()) {
      await Group.deleteOne({ $or: [{ _id: id }, { id: id }] });
      await Expense.deleteMany({ groupId: id });
      await Settlement.deleteMany({ groupId: id });
      return true;
    }

    const data = loadLocalData();
    const prevCount = data.groups.length;
    data.groups = data.groups.filter(g => g.id !== id);
    data.expenses = data.expenses.filter(e => e.groupId !== id);
    data.settlements = data.settlements.filter(s => s.groupId !== id);
    saveLocalData(data);
    return data.groups.length < prevCount;
  },

  async addMember(groupId, memberData) {
    const group = await this.findById(groupId);
    if (!group) return null;

    const newMember = {
      id: memberData.id || generateId('usr'),
      name: memberData.name.trim(),
      email: (memberData.email || '').trim(),
      avatar: memberData.avatar || memberData.name.trim().charAt(0).toUpperCase(),
      color: memberData.color || '#3B82F6'
    };

    const updatedMembers = [...(group.members || []), newMember];
    return await this.update(groupId, { members: updatedMembers });
  }
};

// ==========================================
// REPOSITORIO DE GASTOS
// ==========================================
const expenseRepository = {
  async findByGroupId(groupId) {
    if (isMongoConnected()) {
      return await Expense.find({ groupId }).sort({ date: -1 }).lean();
    }
    const data = loadLocalData();
    return data.expenses
      .filter(e => e.groupId === groupId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async findById(id) {
    if (isMongoConnected()) {
      return await Expense.findOne({ $or: [{ _id: id }, { id: id }] }).lean();
    }
    const data = loadLocalData();
    return data.expenses.find(e => e.id === id) || null;
  },

  async create(expenseData) {
    const newExpense = {
      id: expenseData.id || generateId('exp'),
      groupId: expenseData.groupId,
      description: expenseData.description.trim(),
      amount: Number(expenseData.amount),
      category: expenseData.category || 'otro',
      paidBy: expenseData.paidBy,
      splitType: expenseData.splitType || 'EQUAL',
      splits: expenseData.splits || [],
      date: expenseData.date ? new Date(expenseData.date).toISOString() : new Date().toISOString(),
      notes: (expenseData.notes || '').trim(),
      createdAt: new Date().toISOString()
    };

    if (isMongoConnected()) {
      const created = await Expense.create(newExpense);
      return created.toObject();
    }

    const data = loadLocalData();
    data.expenses.push(newExpense);
    saveLocalData(data);
    return newExpense;
  },

  async update(id, updateData) {
    if (isMongoConnected()) {
      return await Expense.findOneAndUpdate(
        { $or: [{ _id: id }, { id: id }] },
        updateData,
        { new: true }
      ).lean();
    }

    const data = loadLocalData();
    const index = data.expenses.findIndex(e => e.id === id);
    if (index === -1) return null;

    data.expenses[index] = {
      ...data.expenses[index],
      ...updateData,
      amount: updateData.amount !== undefined ? Number(updateData.amount) : data.expenses[index].amount
    };
    saveLocalData(data);
    return data.expenses[index];
  },

  async delete(id) {
    if (isMongoConnected()) {
      const res = await Expense.deleteOne({ $or: [{ _id: id }, { id: id }] });
      return res.deletedCount > 0;
    }

    const data = loadLocalData();
    const prevCount = data.expenses.length;
    data.expenses = data.expenses.filter(e => e.id !== id);
    saveLocalData(data);
    return data.expenses.length < prevCount;
  }
};

// ==========================================
// REPOSITORIO DE LIQUIDACIONES / PAGOS
// ==========================================
const settlementRepository = {
  async findByGroupId(groupId) {
    if (isMongoConnected()) {
      return await Settlement.find({ groupId }).sort({ date: -1 }).lean();
    }
    const data = loadLocalData();
    return data.settlements
      .filter(s => s.groupId === groupId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async create(settlementData) {
    const newSettlement = {
      id: settlementData.id || generateId('stl'),
      groupId: settlementData.groupId,
      fromMemberId: settlementData.fromMemberId,
      toMemberId: settlementData.toMemberId,
      amount: Number(settlementData.amount),
      date: settlementData.date ? new Date(settlementData.date).toISOString() : new Date().toISOString(),
      notes: (settlementData.notes || '').trim(),
      createdAt: new Date().toISOString()
    };

    if (isMongoConnected()) {
      const created = await Settlement.create(newSettlement);
      return created.toObject();
    }

    const data = loadLocalData();
    data.settlements.push(newSettlement);
    saveLocalData(data);
    return newSettlement;
  },

  async delete(id) {
    if (isMongoConnected()) {
      const res = await Settlement.deleteOne({ $or: [{ _id: id }, { id: id }] });
      return res.deletedCount > 0;
    }

    const data = loadLocalData();
    const prevCount = data.settlements.length;
    data.settlements = data.settlements.filter(s => s.id !== id);
    saveLocalData(data);
    return data.settlements.length < prevCount;
  }
};

// Reiniciar a datos de semilla (útil para pruebas en vivo)
async function resetToSeedData() {
  if (isMongoConnected()) {
    await Group.deleteMany({});
    await Expense.deleteMany({});
    await Settlement.deleteMany({});
    await Group.insertMany(initialGroups);
    await Expense.insertMany(initialExpenses);
    await Settlement.insertMany(initialSettlements);
    return true;
  }

  saveLocalData({
    groups: initialGroups,
    expenses: initialExpenses,
    settlements: initialSettlements
  });
  return true;
}

module.exports = {
  groupRepository,
  expenseRepository,
  settlementRepository,
  resetToSeedData,
  generateId
};

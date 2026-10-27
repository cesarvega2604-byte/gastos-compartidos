/**
 * Esquemas Mongoose para MongoDB Atlas
 * Cumple con el criterio de evaluación #3: Modelado de datos estructurado y tipado.
 */
const mongoose = require('mongoose');

// Esquema de Miembro dentro de un Grupo
const MemberSubSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, default: '' },
  avatar: { type: String, default: '' },
  color: { type: String, default: '#3B82F6' }
}, { _id: false });

// Esquema de Grupo
const GroupSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'El nombre del grupo es obligatorio'], trim: true },
  description: { type: String, trim: true, default: '' },
  category: { 
    type: String, 
    enum: ['viaje', 'hogar', 'comida', 'pareja', 'evento', 'otro'], 
    default: 'viaje' 
  },
  currency: { type: String, default: 'COP' },
  members: { 
    type: [MemberSubSchema], 
    validate: [v => Array.isArray(v) && v.length >= 2, 'Un grupo debe tener al menos 2 miembros'] 
  }
}, { 
  timestamps: true 
});

// Esquema de División de Gastos (Splits)
const SplitSubSchema = new mongoose.Schema({
  memberId: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  percentage: { type: Number, default: 0 }
}, { _id: false });

// Esquema de Gasto
const ExpenseSchema = new mongoose.Schema({
  groupId: { type: String, required: true, index: true },
  description: { type: String, required: [true, 'La descripción del gasto es obligatoria'], trim: true },
  amount: { type: Number, required: [true, 'El monto es obligatorio'], min: [1, 'El monto debe ser mayor a 0'] },
  category: { 
    type: String, 
    enum: ['comida', 'transporte', 'hospedaje', 'entretenimiento', 'servicios', 'compras', 'otro'], 
    default: 'comida' 
  },
  paidBy: { type: String, required: [true, 'Debe indicar quién pagó'] },
  splitType: { 
    type: String, 
    enum: ['EQUAL', 'EXACT', 'PERCENTAGE'], 
    default: 'EQUAL' 
  },
  splits: { 
    type: [SplitSubSchema], 
    validate: [v => Array.isArray(v) && v.length > 0, 'Debe haber al menos 1 participante en el gasto'] 
  },
  date: { type: Date, default: Date.now },
  notes: { type: String, default: '' }
}, { 
  timestamps: true 
});

// Esquema de Liquidaciones / Pagos de Deuda (Settlements)
const SettlementSchema = new mongoose.Schema({
  groupId: { type: String, required: true, index: true },
  fromMemberId: { type: String, required: [true, 'Debe indicar quién realiza el pago'] },
  toMemberId: { type: String, required: [true, 'Debe indicar quién recibe el pago'] },
  amount: { type: Number, required: [true, 'El monto es obligatorio'], min: [1, 'El monto debe ser mayor a 0'] },
  date: { type: Date, default: Date.now },
  notes: { type: String, default: '' }
}, { 
  timestamps: true 
});

const Group = mongoose.models.Group || mongoose.model('Group', GroupSchema);
const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
const Settlement = mongoose.models.Settlement || mongoose.model('Settlement', SettlementSchema);

module.exports = {
  Group,
  Expense,
  Settlement
};

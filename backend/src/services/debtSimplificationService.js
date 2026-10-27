/**
 * Servicio de Simplificación de Deudas (Min-Cash-Flow Greedy Algorithm)
 * 
 * Este algoritmo resuelve el problema de balance de cuentas en grupos compartidos (estilo Splitwise).
 * Reduce la cantidad de transacciones entre miembros al mínimo posible (máximo N-1 transacciones para N miembros),
 * optimizando los pagos para que nadie tenga que hacer múltiples transferencias innecesarias.
 */

/**
 * Calcula los balances netos de cada miembro de un grupo a partir de sus gastos y liquidaciones.
 * 
 * Regla contable:
 * - Un miembro que paga un gasto acumula balance positivo (+monto).
 * - Un miembro que participa en la división de un gasto adquiere una obligación (-monto dividido).
 * - Una liquidación (pago directo entre dos miembros):
 *     - Quien envía el dinero suma a su balance (+monto).
 *     - Quien recibe el dinero resta de su balance (-monto).
 * 
 * @param {Array} members - Lista de miembros del grupo [{ id, name, ... }]
 * @param {Array} expenses - Lista de gastos del grupo
 * @param {Array} settlements - Lista de pagos/liquidaciones registrados
 * @returns {Object} Mapa de memberId -> balance neto (número flotante)
 */
function calculateNetBalances(members = [], expenses = [], settlements = []) {
  const balances = {};

  // Inicializar balance de cada miembro en 0.00
  members.forEach(member => {
    const id = member.id || member._id?.toString();
    balances[id] = 0;
  });

  // Procesar gastos
  expenses.forEach(expense => {
    const payerId = expense.paidBy?.id || expense.paidBy?._id?.toString() || expense.paidBy;
    const amount = Number(expense.amount) || 0;

    // El pagador aportó el total del gasto
    if (balances[payerId] !== undefined) {
      balances[payerId] += amount;
    } else {
      balances[payerId] = amount;
    }

    // Cada participante en el split debe su parte correspondiente
    if (Array.isArray(expense.splits) && expense.splits.length > 0) {
      expense.splits.forEach(split => {
        const participantId = split.memberId?.id || split.memberId?._id?.toString() || split.memberId;
        const splitAmount = Number(split.amount) || 0;
        if (balances[participantId] !== undefined) {
          balances[participantId] -= splitAmount;
        } else {
          balances[participantId] = -splitAmount;
        }
      });
    }
  });

  // Procesar liquidaciones previas (pagos entre miembros para saldar deudas)
  settlements.forEach(settlement => {
    const fromId = settlement.fromMemberId?.id || settlement.fromMemberId?._id?.toString() || settlement.fromMemberId;
    const toId = settlement.toMemberId?.id || settlement.toMemberId?._id?.toString() || settlement.toMemberId;
    const amount = Number(settlement.amount) || 0;

    // Quien pagó saldó deuda -> su balance mejora (+)
    if (balances[fromId] !== undefined) {
      balances[fromId] += amount;
    }
    // Quien recibió el dinero -> reduce lo que le debían (-)
    if (balances[toId] !== undefined) {
      balances[toId] -= amount;
    }
  });

  // Redondear a 2 decimales para evitar problemas de precisión flotante
  Object.keys(balances).forEach(id => {
    balances[id] = Math.round(balances[id] * 100) / 100;
  });

  return balances;
}

/**
 * Algoritmo Voraz (Greedy) para simplificar deudas en el número mínimo de transferencias.
 * 
 * @param {Object} netBalances - Mapa de memberId -> balance neto
 * @param {Array} members - Lista de miembros para incluir nombres en la respuesta
 * @returns {Array} Lista de transferencias óptimas [{ from, fromName, to, toName, amount }]
 */
function simplifyDebts(netBalances = {}, members = []) {
  const membersMap = new Map();
  members.forEach(m => {
    const id = m.id || m._id?.toString();
    membersMap.set(id, m.name || `Miembro ${id}`);
  });

  // Clasificar en deudores (balance < 0) y acreedores (balance > 0)
  const debtors = [];
  const creditors = [];

  Object.entries(netBalances).forEach(([memberId, balance]) => {
    // Usamos un umbral de 0.01 para ignorar residuos por redondeo
    if (balance < -0.01) {
      debtors.push({ memberId, amount: Math.abs(balance) });
    } else if (balance > 0.01) {
      creditors.push({ memberId, amount: balance });
    }
  });

  // Ordenar de mayor a menor para emparejar de forma óptima
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const simplifiedTransactions = [];
  let dIndex = 0;
  let cIndex = 0;

  while (dIndex < debtors.length && cIndex < creditors.length) {
    const debtor = debtors[dIndex];
    const creditor = creditors[cIndex];

    // La transferencia es el mínimo entre lo que debe el deudor y lo que espera el acreedor
    const transferAmount = Math.min(debtor.amount, creditor.amount);
    const roundedAmount = Math.round(transferAmount * 100) / 100;

    if (roundedAmount > 0) {
      simplifiedTransactions.push({
        fromMemberId: debtor.memberId,
        fromMemberName: membersMap.get(debtor.memberId) || 'Desconocido',
        toMemberId: creditor.memberId,
        toMemberName: membersMap.get(creditor.memberId) || 'Desconocido',
        amount: roundedAmount,
        currency: 'COP', // Moneda por defecto
        message: `${membersMap.get(debtor.memberId)} debe pagarle $${roundedAmount.toLocaleString('es-CO')} a ${membersMap.get(creditor.memberId)}`
      });
    }

    debtor.amount -= transferAmount;
    creditor.amount -= transferAmount;

    // Si el deudor ya pagó todo, pasar al siguiente
    if (debtor.amount < 0.01) {
      dIndex++;
    }
    // Si el acreedor ya recibió todo, pasar al siguiente
    if (creditor.amount < 0.01) {
      cIndex++;
    }
  }

  return simplifiedTransactions;
}

/**
 * Genera el resumen financiero completo de un grupo:
 * - Balances individuales (en verde le deben, en rojo debe, en gris al día)
 * - Transferencias simplificadas recomendadas
 * - Total gastado en el grupo
 * - Promedio por miembro
 */
function getGroupFinancialSummary(group, expenses = [], settlements = []) {
  const members = group.members || [];
  const netBalances = calculateNetBalances(members, expenses, settlements);
  const suggestedSettlements = simplifyDebts(netBalances, members);

  const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalSettled = settlements.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const averagePerMember = members.length > 0 ? Math.round((totalSpent / members.length) * 100) / 100 : 0;

  const memberSummaries = members.map(m => {
    const id = m.id || m._id?.toString();
    const balance = netBalances[id] || 0;
    
    // Total aportado como pagador directo
    const paidTotal = expenses
      .filter(e => {
        const pId = e.paidBy?.id || e.paidBy?._id?.toString() || e.paidBy;
        return pId === id;
      })
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    // Total de su consumo asignado
    let owedTotal = 0;
    expenses.forEach(e => {
      if (Array.isArray(e.splits)) {
        const split = e.splits.find(s => {
          const sId = s.memberId?.id || s.memberId?._id?.toString() || s.memberId;
          return sId === id;
        });
        if (split) {
          owedTotal += Number(split.amount) || 0;
        }
      }
    });

    return {
      memberId: id,
      name: m.name,
      email: m.email || '',
      avatar: m.avatar || m.name.charAt(0).toUpperCase(),
      color: m.color || '#3B82F6',
      totalPaid: Math.round(paidTotal * 100) / 100,
      totalOwed: Math.round(owedTotal * 100) / 100,
      netBalance: balance,
      status: balance > 0.01 ? 'owed' : balance < -0.01 ? 'owes' : 'settled',
      statusText: balance > 0.01 ? `Le deben $${balance.toLocaleString('es-CO')}` : balance < -0.01 ? `Debe $${Math.abs(balance).toLocaleString('es-CO')}` : 'Al día'
    };
  });

  return {
    groupId: group.id || group._id?.toString(),
    groupName: group.name,
    currency: group.currency || 'COP',
    totalSpent: Math.round(totalSpent * 100) / 100,
    totalSettled: Math.round(totalSettled * 100) / 100,
    averagePerMember,
    membersCount: members.length,
    expensesCount: expenses.length,
    settlementsCount: settlements.length,
    members: memberSummaries,
    suggestedSettlements
  };
}

module.exports = {
  calculateNetBalances,
  simplifyDebts,
  getGroupFinancialSummary
};

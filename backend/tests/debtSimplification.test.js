/**
 * Pruebas unitarias para el algoritmo de cálculo de balances y simplificación de deudas
 * Ejecutar con: npm test
 */
const { calculateNetBalances, simplifyDebts, getGroupFinancialSummary } = require('../src/services/debtSimplificationService');

console.log('🧪 Iniciando pruebas unitarias de Splitwise Service...\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASÓ: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ❌ FALLÓ: ${message}`);
    testsFailed++;
  }
}

// ----------------------------------------------------
// Test 1: Balances con división equitativa simple
// ----------------------------------------------------
console.log('Prueba 1: Balances con gasto equitativo entre 3 amigos');
const members1 = [
  { id: '1', name: 'Carlos' },
  { id: '2', name: 'Laura' },
  { id: '3', name: 'Andrés' }
];

// Carlos paga un almuerzo de $30.000 dividido equitativamente ($10.000 c/u)
const expenses1 = [
  {
    paidBy: '1',
    amount: 30000,
    splits: [
      { memberId: '1', amount: 10000 },
      { memberId: '2', amount: 10000 },
      { memberId: '3', amount: 10000 }
    ]
  }
];

const balances1 = calculateNetBalances(members1, expenses1, []);
assert(balances1['1'] === 20000, 'Carlos tiene balance neto de +$20.000 (le deben)');
assert(balances1['2'] === -10000, 'Laura tiene balance neto de -$10.000 (debe)');
assert(balances1['3'] === -10000, 'Andrés tiene balance neto de -$10.000 (debe)');

// ----------------------------------------------------
// Test 2: Algoritmo voraz de simplificación de deudas
// ----------------------------------------------------
console.log('\nPrueba 2: Simplificación mínima de transferencias');
const transfers1 = simplifyDebts(balances1, members1);
assert(transfers1.length === 2, 'Debe generar exactamente 2 transferencias mínimas');
assert(transfers1.every(t => t.toMemberName === 'Carlos'), 'Todas las transferencias deben tener como destino a Carlos');

// ----------------------------------------------------
// Test 3: Liquidación de deuda (Settlement)
// ----------------------------------------------------
console.log('\nPrueba 3: Registrar liquidación (Laura le paga $10.000 a Carlos)');
const settlements1 = [
  {
    fromMemberId: '2',
    toMemberId: '1',
    amount: 10000
  }
];

const balancesAfterPayment = calculateNetBalances(members1, expenses1, settlements1);
assert(balancesAfterPayment['2'] === 0, 'Laura queda con balance en 0 (Al día)');
assert(balancesAfterPayment['1'] === 10000, 'A Carlos ahora sólo le deben $10.000');
assert(balancesAfterPayment['3'] === -10000, 'Andrés aún debe $10.000');

// ----------------------------------------------------
// Test 4: Caso circular (A le debe a B, B le debe a C, C le debe a A)
// ----------------------------------------------------
console.log('\nPrueba 4: Cadena circular de deudas compensadas');
// Carlos paga $30k para Laura
// Laura paga $30k para Andrés
// Andrés paga $30k para Carlos
const expensesCircular = [
  { paidBy: '1', amount: 30000, splits: [{ memberId: '2', amount: 30000 }] },
  { paidBy: '2', amount: 30000, splits: [{ memberId: '3', amount: 30000 }] },
  { paidBy: '3', amount: 30000, splits: [{ memberId: '1', amount: 30000 }] }
];
const balancesCircular = calculateNetBalances(members1, expensesCircular, []);
assert(balancesCircular['1'] === 0 && balancesCircular['2'] === 0 && balancesCircular['3'] === 0, 'Todos los balances netos circulares deben ser 0');
const transfersCircular = simplifyDebts(balancesCircular, members1);
assert(transfersCircular.length === 0, 'No debe requerir ninguna transferencia');

console.log('\n=======================================');
console.log(`Resultados: ${testsPassed} pasaron, ${testsFailed} fallaron`);
console.log('=======================================\n');

if (testsFailed > 0) {
  process.exit(1);
}

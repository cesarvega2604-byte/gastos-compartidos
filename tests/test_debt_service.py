"""
Pruebas Unitarias para el Algoritmo de Simplificación de Deudas (Splitwise en Python)
Ejecutar con: python -m unittest tests/test_debt_service.py
"""
import unittest
from services.debt_service import calculate_net_balances, simplify_debts, get_group_financial_summary


class TestDebtSimplification(unittest.TestCase):

    def setUp(self):
        self.members = [
            {'id': '1', 'name': 'Carlos'},
            {'id': '2', 'name': 'Laura'},
            {'id': '3', 'name': 'Andrés'}
        ]

    def test_equal_split_calculation(self):
        """Prueba 1: Cálculo exacto de balances con gasto equitativo"""
        expenses = [
            {
                'paidBy': '1',
                'amount': 30000,
                'splits': [
                    {'memberId': '1', 'amount': 10000},
                    {'memberId': '2', 'amount': 10000},
                    {'memberId': '3', 'amount': 10000}
                ]
            }
        ]
        balances = calculate_net_balances(self.members, expenses, [])
        self.assertEqual(balances['1'], 20000.0)
        self.assertEqual(balances['2'], -10000.0)
        self.assertEqual(balances['3'], -10000.0)

    def test_greedy_simplification_count(self):
        """Prueba 2: El algoritmo voraz debe reducir a 2 transferencias mínimas"""
        balances = {'1': 20000.0, '2': -10000.0, '3': -10000.0}
        transfers = simplify_debts(balances, self.members)
        self.assertEqual(len(transfers), 2)
        for t in transfers:
            self.assertEqual(t['toMemberName'], 'Carlos')

    def test_settlement_payment(self):
        """Prueba 3: Liquidación de deuda actualiza el balance a cero"""
        expenses = [
            {
                'paidBy': '1',
                'amount': 30000,
                'splits': [
                    {'memberId': '1', 'amount': 10000},
                    {'memberId': '2', 'amount': 10000},
                    {'memberId': '3', 'amount': 10000}
                ]
            }
        ]
        settlements = [
            {'fromMemberId': '2', 'toMemberId': '1', 'amount': 10000}
        ]
        balances = calculate_net_balances(self.members, expenses, settlements)
        self.assertEqual(balances['2'], 0.0)  # Laura saldó
        self.assertEqual(balances['1'], 10000.0)  # A Carlos ahora sólo le deben 10k
        self.assertEqual(balances['3'], -10000.0)  # Andrés aún debe 10k

    def test_circular_debts(self):
        """Prueba 4: Cadena circular de deudas compensadas da balance neto 0"""
        expenses = [
            {'paidBy': '1', 'amount': 100, 'splits': [{'memberId': '2', 'amount': 100}]},
            {'paidBy': '2', 'amount': 100, 'splits': [{'memberId': '3', 'amount': 100}]},
            {'paidBy': '3', 'amount': 100, 'splits': [{'memberId': '1', 'amount': 100}]}
        ]
        balances = calculate_net_balances(self.members, expenses, [])
        self.assertEqual(balances['1'], 0.0)
        self.assertEqual(balances['2'], 0.0)
        self.assertEqual(balances['3'], 0.0)
        transfers = simplify_debts(balances, self.members)
        self.assertEqual(len(transfers), 0)

    def test_financial_summary(self):
        """Prueba 5: Resumen financiero consolidado calcula totales correctamente"""
        group = {'id': 'grp_1', 'name': 'Viaje Test', 'members': self.members, 'currency': 'COP'}
        expenses = [{'paidBy': '1', 'amount': 30000, 'splits': [{'memberId': '1', 'amount': 10000}, {'memberId': '2', 'amount': 10000}, {'memberId': '3', 'amount': 10000}]}]
        summary = get_group_financial_summary(group, expenses, [])
        self.assertEqual(summary['totalSpent'], 30000.0)
        self.assertEqual(summary['averagePerMember'], 10000.0)
        self.assertEqual(len(summary['suggestedSettlements']), 2)


if __name__ == '__main__':
    unittest.main()

"""
Servicio de Simplificación de Deudas (Min-Cash-Flow Greedy Algorithm en Python)
Proyecto: Partir / SplitSENA - App de Gastos Compartidos
"""
from typing import List, Dict, Any
from dataclasses import dataclass


def calculate_net_balances(members: List[Dict[str, Any]], expenses: List[Dict[str, Any]], settlements: List[Dict[str, Any]] = None) -> Dict[str, float]:
    """
    Calcula los balances netos de cada miembro de un grupo a partir de sus gastos y pagos directos.
    
    Regla contable:
    - Pagador del gasto: +monto aportado
    - Participante del split: -monto debido
    - Liquidación directa:
        * Emisor: +monto (saldó parte de su deuda)
        * Receptor: -monto (recibió su pago)
    """
    if settlements is None:
        settlements = []

    balances: Dict[str, float] = {}

    # Inicializar en 0.00
    for m in members:
        m_id = str(m.get('id') or m.get('_id', ''))
        balances[m_id] = 0.0

    # Procesar gastos
    for exp in expenses:
        payer_id = str(exp.get('paidBy') or '')
        amount = float(exp.get('amount') or 0.0)

        if payer_id in balances:
            balances[payer_id] += amount
        else:
            balances[payer_id] = amount

        splits = exp.get('splits') or []
        for s in splits:
            p_id = str(s.get('memberId') or '')
            s_amount = float(s.get('amount') or 0.0)
            if p_id in balances:
                balances[p_id] -= s_amount
            else:
                balances[p_id] = -s_amount

    # Procesar liquidaciones
    for stl in settlements:
        from_id = str(stl.get('fromMemberId') or '')
        to_id = str(stl.get('toMemberId') or '')
        amount = float(stl.get('amount') or 0.0)

        if from_id in balances:
            balances[from_id] += amount
        if to_id in balances:
            balances[to_id] -= amount

    # Redondear a 2 decimales
    for m_id in balances:
        balances[m_id] = round(balances[m_id], 2)

    return balances


def simplify_debts(net_balances: Dict[str, float], members: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Algoritmo Voraz (Greedy) para minimizar el número de transferencias entre amigos.
    Reduce hasta N(N-1)/2 deudas a un máximo de N-1 transferencias.
    """
    members_map = {}
    for m in members:
        m_id = str(m.get('id') or m.get('_id', ''))
        members_map[m_id] = m.get('name', f"Miembro {m_id}")

    # Separar en deudores (balance < 0) y acreedores (balance > 0)
    debtors = []
    creditors = []

    for m_id, bal in net_balances.items():
        if bal < -0.01:
            debtors.append({'member_id': m_id, 'amount': abs(bal)})
        elif bal > 0.01:
            creditors.append({'member_id': m_id, 'amount': bal})

    # Ordenar descendente por monto
    debtors.sort(key=lambda x: x['amount'], reverse=True)
    creditors.sort(key=lambda x: x['amount'], reverse=True)

    transactions = []
    d_idx = 0
    c_idx = 0

    while d_idx < len(debtors) and c_idx < len(creditors):
        debtor = debtors[d_idx]
        creditor = creditors[c_idx]

        transfer_amount = min(debtor['amount'], creditor['amount'])
        rounded_amount = round(transfer_amount, 2)

        if rounded_amount > 0:
            transactions.append({
                'fromMemberId': debtor['member_id'],
                'fromMemberName': members_map.get(debtor['member_id'], 'Desconocido'),
                'toMemberId': creditor['member_id'],
                'toMemberName': members_map.get(creditor['member_id'], 'Desconocido'),
                'amount': rounded_amount,
                'currency': 'MXN',
                'message': f"{members_map.get(debtor['member_id'])} debe pagarle ${rounded_amount:,.2f} a {members_map.get(creditor['member_id'])}"
            })

        debtor['amount'] -= transfer_amount
        creditor['amount'] -= transfer_amount

        if debtor['amount'] < 0.01:
            d_idx += 1
        if creditor['amount'] < 0.01:
            c_idx += 1

    return transactions


def get_group_financial_summary(group: Dict[str, Any], expenses: List[Dict[str, Any]], settlements: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Genera el resumen financiero completo del grupo."""
    if settlements is None:
        settlements = []

    members = group.get('members') or []
    net_balances = calculate_net_balances(members, expenses, settlements)
    suggested_settlements = simplify_debts(net_balances, members)

    total_spent = sum(float(e.get('amount') or 0.0) for e in expenses)
    total_settled = sum(float(s.get('amount') or 0.0) for s in settlements)
    avg_per_member = round(total_spent / len(members), 2) if members else 0.0

    member_summaries = []
    for m in members:
        m_id = str(m.get('id') or m.get('_id', ''))
        balance = net_balances.get(m_id, 0.0)

        # Total pagado
        paid_total = sum(float(e.get('amount') or 0.0) for e in expenses if str(e.get('paidBy')) == m_id)

        # Total consumido
        owed_total = 0.0
        for e in expenses:
            splits = e.get('splits') or []
            for s in splits:
                if str(s.get('memberId')) == m_id:
                    owed_total += float(s.get('amount') or 0.0)

        status = 'owed' if balance > 0.01 else 'owes' if balance < -0.01 else 'settled'
        status_text = f"Le deben ${balance:,.0f}" if balance > 0.01 else f"Debe ${abs(balance):,.0f}" if balance < -0.01 else "Al día"

        member_summaries.append({
            'memberId': m_id,
            'name': m.get('name', ''),
            'email': m.get('email', ''),
            'avatar': m.get('avatar', ''),
            'color': m.get('color', '#10B981'),
            'totalPaid': round(paid_total, 2),
            'totalOwed': round(owed_total, 2),
            'netBalance': balance,
            'status': status,
            'statusText': status_text
        })

    return {
        'groupId': group.get('id'),
        'groupName': group.get('name'),
        'currency': group.get('currency', 'MXN'),
        'totalSpent': round(total_spent, 2),
        'totalSettled': round(total_settled, 2),
        'averagePerMember': avg_per_member,
        'membersCount': len(members),
        'expensesCount': len(expenses),
        'settlementsCount': len(settlements),
        'members': member_summaries,
        'suggestedSettlements': suggested_settlements
    }

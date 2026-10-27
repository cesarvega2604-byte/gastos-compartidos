"""
Capa de Base de Datos Relacional SQLite3 (Python Puro)
Persistencia garantizada en disco (data/splitwise.db)
Cumple con el Criterio 3 de la rúbrica de evaluación SENA.
"""
import os
import sqlite3
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
DB_FILE = os.path.join(DB_DIR, 'splitwise.db')


def get_db_connection() -> sqlite3.Connection:
    """Crea y retorna una conexión a la base de datos SQLite."""
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db():
    """Inicializa las tablas relacionales de la base de datos."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS groups_tbl (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'viaje',
        currency TEXT DEFAULT 'MXN',
        image_url TEXT,
        created_at TEXT,
        updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS members_tbl (
        id TEXT PRIMARY KEY,
        group_id TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        avatar TEXT,
        color TEXT DEFAULT '#10B981',
        is_current_user INTEGER DEFAULT 0,
        FOREIGN KEY (group_id) REFERENCES groups_tbl(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS expenses_tbl (
        id TEXT PRIMARY KEY,
        group_id TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT DEFAULT 'otro',
        paid_by TEXT NOT NULL,
        split_type TEXT DEFAULT 'EQUAL',
        date TEXT,
        notes TEXT,
        created_at TEXT,
        FOREIGN KEY (group_id) REFERENCES groups_tbl(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS splits_tbl (
        id TEXT PRIMARY KEY,
        expense_id TEXT NOT NULL,
        member_id TEXT NOT NULL,
        amount REAL NOT NULL,
        percentage REAL DEFAULT 0,
        FOREIGN KEY (expense_id) REFERENCES expenses_tbl(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settlements_tbl (
        id TEXT PRIMARY KEY,
        group_id TEXT NOT NULL,
        from_member_id TEXT NOT NULL,
        to_member_id TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT,
        notes TEXT,
        created_at TEXT,
        FOREIGN KEY (group_id) REFERENCES groups_tbl(id) ON DELETE CASCADE
    );
    """)

    conn.commit()

    # Si no hay grupos, cargar datos de semilla
    cursor.execute("SELECT COUNT(*) FROM groups_tbl;")
    count = cursor.fetchone()[0]
    conn.close()

    if count == 0:
        seed_data()


def seed_data():
    """Carga los datos iniciales de demostración basados en la maqueta de Google Stitch."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Limpiar tablas
    cursor.execute("DELETE FROM splits_tbl;")
    cursor.execute("DELETE FROM settlements_tbl;")
    cursor.execute("DELETE FROM expenses_tbl;")
    cursor.execute("DELETE FROM members_tbl;")
    cursor.execute("DELETE FROM groups_tbl;")

    # 1. GRUPOS
    groups = [
        ('grp_cancun_2025', 'Viaje Cancún 2025', 'Viaje vacacional con amigos a la Riviera Maya', 'viaje', 'MXN', 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=800&q=80'),
        ('grp_depa_roma', 'Depa Roma Norte (Roomies)', 'Renta, servicios, limpieza e internet de la casa', 'hogar', 'MXN', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'),
        ('grp_asado_fin', 'Asado Fin de Semana', 'Carne asada, carbón, bebidas y botanas con amigos', 'salidas', 'MXN', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80'),
        ('grp_gasolina_valle', 'Gasolina & Casetas Valle', 'Roadtrip y peajes fin de semana Valle de Bravo', 'viaje', 'MXN', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80')
    ]

    now = datetime.now().isoformat()
    for g in groups:
        cursor.execute("INSERT INTO groups_tbl (id, name, description, category, currency, image_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
                       (g[0], g[1], g[2], g[3], g[4], g[5], now, now))

    # 2. MIEMBROS
    members = [
        # Cancún (5)
        ('usr_diego', 'grp_cancun_2025', 'Tú (Diego)', 'diego@stitch.dev', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', '#10B981', 1),
        ('usr_sofia', 'grp_cancun_2025', 'Sofía Ramos', 'sofia@stitch.dev', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', '#EC4899', 0),
        ('usr_mateo', 'grp_cancun_2025', 'Mateo López', 'mateo@stitch.dev', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', '#3B82F6', 0),
        ('usr_valeria', 'grp_cancun_2025', 'Valeria Gómez', 'valeria@stitch.dev', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', '#F59E0B', 0),
        ('usr_carlos_r', 'grp_cancun_2025', 'Carlos Ruiz', 'carlos.r@stitch.dev', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', '#8B5CF6', 0),
        
        # Depa Roma (3)
        ('usr_diego_roma', 'grp_depa_roma', 'Tú (Diego)', 'diego@stitch.dev', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', '#10B981', 1),
        ('usr_carlos_m', 'grp_depa_roma', 'Carlos Mendoza', 'carlos.m@stitch.dev', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80', '#3B82F6', 0),
        ('usr_andrea', 'grp_depa_roma', 'Andrea Paz', 'andrea@stitch.dev', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80', '#EC4899', 0),

        # Asado (3)
        ('usr_diego_asado', 'grp_asado_fin', 'Tú (Diego)', 'diego@stitch.dev', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', '#10B981', 1),
        ('usr_sofia_asado', 'grp_asado_fin', 'Sofía Ramos', 'sofia@stitch.dev', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', '#EC4899', 0),
        ('usr_mateo_asado', 'grp_asado_fin', 'Mateo López', 'mateo@stitch.dev', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', '#3B82F6', 0),

        # Gasolina Valle (4)
        ('usr_diego_valle', 'grp_gasolina_valle', 'Tú (Diego)', 'diego@stitch.dev', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', '#10B981', 1),
        ('usr_mateo_valle', 'grp_gasolina_valle', 'Mateo López', 'mateo@stitch.dev', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', '#3B82F6', 0),
        ('usr_valeria_valle', 'grp_gasolina_valle', 'Valeria Gómez', 'valeria@stitch.dev', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', '#F59E0B', 0),
        ('usr_carlos_valle', 'grp_gasolina_valle', 'Carlos Ruiz', 'carlos.r@stitch.dev', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', '#8B5CF6', 0)
    ]

    for m in members:
        cursor.execute("INSERT INTO members_tbl (id, group_id, name, email, avatar, color, is_current_user) VALUES (?, ?, ?, ?, ?, ?, ?);", m)

    # 3. GASTOS CANCÚN
    expenses = [
        ('exp_cancun_01', 'grp_cancun_2025', 'Cena Mariscos El Farito', 3200.0, 'comida', 'usr_sofia', 'EQUAL', now, 'Pescado frito y cócteles frente a la playa', now),
        ('exp_cancun_02', 'grp_cancun_2025', 'Entradas Parque Xcaret Plus', 12500.0, 'entretenimiento', 'usr_diego', 'EQUAL', now, 'Acceso total y buffet mexicano', now),
        ('exp_cancun_03', 'grp_cancun_2025', 'Renta de Auto & Gasolina', 4800.0, 'transporte', 'usr_mateo', 'EQUAL', now, 'Camioneta familiar Hertz 4 días', now),
        ('exp_cancun_04', 'grp_cancun_2025', 'Supermercado y snacks', 3100.0, 'comida', 'usr_diego', 'EQUAL', now, 'Bebidas, botanas y bloqueadores', now),
        ('exp_cancun_05', 'grp_cancun_2025', 'Hospedaje Villa frente al mar', 19000.0, 'hospedaje', 'usr_diego', 'EQUAL', now, 'Reserva Airbnb 4 noches', now),

        # Depa Roma
        ('exp_roma_01', 'grp_depa_roma', 'Internet Fibra Óptica 500MB', 850.0, 'servicios', 'usr_carlos_m', 'EQUAL', now, 'Totalplay mensual', now),
        ('exp_roma_02', 'grp_depa_roma', 'Renta Mensual y Mantenimiento', 5600.0, 'hogar', 'usr_carlos_m', 'EQUAL', now, 'Abono proporcional departamento', now),

        # Gasolina Valle
        ('exp_valle_01', 'grp_gasolina_valle', 'Casetas autopista y peajes', 2500.0, 'transporte', 'usr_diego_valle', 'EQUAL', now, 'Tag pase autopista Toluca - Valle', now),
        ('exp_valle_02', 'grp_gasolina_valle', 'Gasolina tanque lleno', 5300.0, 'transporte', 'usr_diego_valle', 'EQUAL', now, 'Pemex Premium', now)
    ]

    for e in expenses:
        cursor.execute("INSERT INTO expenses_tbl (id, group_id, description, amount, category, paid_by, split_type, date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", e)

    # 4. SPLITS
    # Splits Cancún (5 personas, divide monto / 5)
    cancun_members = ['usr_diego', 'usr_sofia', 'usr_mateo', 'usr_valeria', 'usr_carlos_r']
    cancun_expenses = [('exp_cancun_01', 3200.0), ('exp_cancun_02', 12500.0), ('exp_cancun_03', 4800.0), ('exp_cancun_04', 3100.0), ('exp_cancun_05', 19000.0)]
    
    for exp_id, total in cancun_expenses:
        share = round(total / 5, 2)
        for m_id in cancun_members:
            cursor.execute("INSERT INTO splits_tbl (id, expense_id, member_id, amount, percentage) VALUES (?, ?, ?, ?, 20.0);",
                           (str(uuid.uuid4()), exp_id, m_id, share))

    # Splits Depa Roma (3 personas)
    roma_members = ['usr_diego_roma', 'usr_carlos_m', 'usr_andrea']
    for exp_id, total in [('exp_roma_01', 850.0), ('exp_roma_02', 5600.0)]:
        share = round(total / 3, 2)
        for m_id in roma_members:
            cursor.execute("INSERT INTO splits_tbl (id, expense_id, member_id, amount, percentage) VALUES (?, ?, ?, ?, 33.33);",
                           (str(uuid.uuid4()), exp_id, m_id, share))

    # Splits Valle (4 personas)
    valle_members = ['usr_diego_valle', 'usr_mateo_valle', 'usr_valeria_valle', 'usr_carlos_valle']
    for exp_id, total in [('exp_valle_01', 2500.0), ('exp_valle_02', 5300.0)]:
        share = round(total / 4, 2)
        for m_id in valle_members:
            cursor.execute("INSERT INTO splits_tbl (id, expense_id, member_id, amount, percentage) VALUES (?, ?, ?, ?, 25.0);",
                           (str(uuid.uuid4()), exp_id, m_id, share))

    # 5. LIQUIDACIONES PREVIAS
    settlements = [
        ('stl_hist_01', 'grp_depa_roma', 'usr_diego_roma', 'usr_carlos_m', 850.0, now, 'Ayer a las 18:30 • Vía SPEI BBVA', now),
        ('stl_hist_02', 'grp_cancun_2025', 'usr_sofia', 'usr_diego', 1400.0, now, 'Hace 3 días • SPEI Santander', now)
    ]
    for s in settlements:
        cursor.execute("INSERT INTO settlements_tbl (id, group_id, from_member_id, to_member_id, amount, date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?);", s)

    conn.commit()
    conn.close()
    print("✅ Base de datos SQLite inicializada y cargada con datos de demostración.")


# ==========================================
# FUNCIONES DE CONSULTA Y MANIPULACIÓN (CRUD)
# ==========================================

def get_all_groups() -> List[Dict[str, Any]]:
    """Retorna todos los grupos registrados enriquecidos con métricas."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM groups_tbl ORDER BY created_at DESC;")
    groups_rows = cursor.fetchall()

    result = []
    for g in groups_rows:
        g_dict = dict(g)
        # Miembros
        cursor.execute("SELECT * FROM members_tbl WHERE group_id = ?;", (g['id'],))
        members = [dict(m) for m in cursor.fetchall()]
        g_dict['members'] = members

        # Total gastado
        cursor.execute("SELECT COALESCE(SUM(amount), 0), COUNT(*) FROM expenses_tbl WHERE group_id = ?;", (g['id'],))
        total_spent, expenses_count = cursor.fetchone()
        g_dict['totalSpent'] = float(total_spent)
        g_dict['expensesCount'] = expenses_count
        g_dict['membersCount'] = len(members)

        result.append(g_dict)

    conn.close()
    return result


def get_group_by_id(group_id: str) -> Optional[Dict[str, Any]]:
    """Retorna los datos completos de un grupo incluyendo miembros, gastos y liquidaciones."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM groups_tbl WHERE id = ?;", (group_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None

    group = dict(row)

    # Miembros
    cursor.execute("SELECT * FROM members_tbl WHERE group_id = ?;", (group_id,))
    group['members'] = [dict(m) for m in cursor.fetchall()]

    # Gastos con splits
    cursor.execute("SELECT * FROM expenses_tbl WHERE group_id = ? ORDER BY date DESC;", (group_id,))
    expenses_rows = cursor.fetchall()
    expenses = []
    for er in expenses_rows:
        e = dict(er)
        cursor.execute("SELECT * FROM splits_tbl WHERE expense_id = ?;", (e['id'],))
        e['splits'] = [{'memberId': s['member_id'], 'amount': float(s['amount']), 'percentage': float(s['percentage'])} for s in cursor.fetchall()]
        expenses.append(e)

    # Liquidaciones
    cursor.execute("SELECT * FROM settlements_tbl WHERE group_id = ? ORDER BY date DESC;", (group_id,))
    settlements = [dict(s) for s in cursor.fetchall()]

    conn.close()
    return {'group': group, 'expenses': expenses, 'settlements': settlements}


def create_group(name: str, description: str = '', category: str = 'salidas', currency: str = 'MXN', members: List[Dict[str, str]] = None) -> Dict[str, Any]:
    """Crea un nuevo grupo y registra sus integrantes."""
    if members is None:
        members = []

    group_id = f"grp_{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("INSERT INTO groups_tbl (id, name, description, category, currency, image_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
                   (group_id, name.strip(), description.strip(), category, currency, None, now, now))

    colors = ['#10B981', '#3B82F6', '#EC4899', '#F59E0B', '#8B5CF6', '#14B8A6']
    created_members = []
    for idx, m in enumerate(members):
        m_id = f"usr_{uuid.uuid4().hex[:8]}"
        m_name = m.get('name', f"Miembro {idx+1}").strip()
        m_email = m.get('email', '').strip()
        color = colors[idx % len(colors)]
        cursor.execute("INSERT INTO members_tbl (id, group_id, name, email, avatar, color, is_current_user) VALUES (?, ?, ?, ?, ?, ?, ?);",
                       (m_id, group_id, m_name, m_email, None, color, 1 if idx == 0 else 0))
        created_members.append({'id': m_id, 'name': m_name, 'email': m_email, 'color': color})

    conn.commit()
    conn.close()

    return {'id': group_id, 'name': name, 'description': description, 'category': category, 'currency': currency, 'members': created_members}


def create_expense(group_id: str, description: str, amount: float, category: str = 'otro', paid_by: str = '', split_type: str = 'EQUAL', splits: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Registra un nuevo gasto y procesa su división."""
    expense_id = f"exp_{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()

    conn = get_db_connection()
    cursor = conn.cursor()

    # Si no se enviaron splits, repartir equitativamente entre los miembros del grupo
    if not splits:
        cursor.execute("SELECT id FROM members_tbl WHERE group_id = ?;", (group_id,))
        m_ids = [row[0] for row in cursor.fetchall()]
        if not m_ids:
            conn.close()
            raise ValueError("El grupo no tiene miembros registrados.")
        share = round(amount / len(m_ids), 2)
        splits = [{'memberId': mid, 'amount': share} for mid in m_ids]

    # Si no se envió pagador, usar el primero
    if not paid_by:
        paid_by = splits[0]['memberId']

    cursor.execute("INSERT INTO expenses_tbl (id, group_id, description, amount, category, paid_by, split_type, date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
                   (expense_id, group_id, description.strip(), float(amount), category, paid_by, split_type, now, '', now))

    for s in splits:
        cursor.execute("INSERT INTO splits_tbl (id, expense_id, member_id, amount, percentage) VALUES (?, ?, ?, ?, ?);",
                       (str(uuid.uuid4()), expense_id, s['memberId'], float(s['amount']), 0.0))

    conn.commit()
    conn.close()

    return {'id': expense_id, 'groupId': group_id, 'description': description, 'amount': amount, 'paidBy': paid_by, 'splits': splits}


def create_settlement(group_id: str, from_member_id: str, to_member_id: str, amount: float, notes: str = '') -> Dict[str, Any]:
    """Registra una liquidación directa entre dos miembros."""
    settlement_id = f"stl_{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("INSERT INTO settlements_tbl (id, group_id, from_member_id, to_member_id, amount, date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
                   (settlement_id, group_id, from_member_id, to_member_id, float(amount), now, notes.strip(), now))

    conn.commit()
    conn.close()

    return {'id': settlement_id, 'groupId': group_id, 'fromMemberId': from_member_id, 'toMemberId': to_member_id, 'amount': amount, 'notes': notes}


# Inicializar automáticamente al importar
init_db()

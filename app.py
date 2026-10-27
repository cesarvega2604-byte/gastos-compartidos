"""
Servidor Web Fullstack en Python Puro (Zero External Dependencies)
Proyecto: Partir / SplitSENA - App de Gastos Compartidos
Desarrollado para el Programa de Análisis y Desarrollo de Software (ADSO) - SENA
"""
import os
import sys
import json
import mimetypes
from urllib.parse import urlparse, parse_qs
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

import database
from services.debt_service import get_group_financial_summary

PORT = int(os.environ.get('PORT', 5000))
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')


class SplitwiseAPIRequestHandler(BaseHTTPRequestHandler):
    """Manejador HTTP robusto con soporte REST API y servicio de archivos estáticos."""

    def _set_cors_headers(self, status=200, content_type='application/json'):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def do_OPTIONS(self):
        """Manejo de pre-vuelos CORS para clientes web."""
        self._set_cors_headers(204)
        self.end_headers()

    def _send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self._set_cors_headers(status, 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_error_json(self, message, status=400):
        self._send_json({'success': False, 'message': message}, status=status)

    def _read_json_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0:
            return {}
        raw_body = self.rfile.read(content_length).decode('utf-8')
        try:
            return json.loads(raw_body)
        except Exception:
            return {}

    # ==========================================
    # MANEJADOR GET
    # ==========================================
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip('/')

        # 1. Health check
        if path == '/api/health':
            return self._send_json({
                'status': 'healthy',
                'service': 'Partir Python Server',
                'language': f"Python {sys.version.split()[0]}",
                'database': 'SQLite3 Relational (splitwise.db)'
            })

        # 2. Listar grupos
        if path == '/api/groups':
            groups = database.get_all_groups()
            return self._send_json({'success': True, 'count': len(groups), 'data': groups})

        # 3. Detalle de grupo con balances calculados por el algoritmo voraz
        if path.startswith('/api/groups/'):
            parts = path.split('/')
            # /api/groups/<group_id>
            if len(parts) == 4:
                group_id = parts[3]
                detail = database.get_group_by_id(group_id)
                if not detail:
                    return self._send_error_json(f"Grupo '{group_id}' no encontrado", 404)
                
                # Calcular resumen con algoritmo voraz en Python
                summary = get_group_financial_summary(detail['group'], detail['expenses'], detail['settlements'])
                detail['summary'] = summary
                return self._send_json({'success': True, 'data': detail})

            # /api/groups/<group_id>/balances
            if len(parts) == 5 and parts[4] == 'balances':
                group_id = parts[3]
                detail = database.get_group_by_id(group_id)
                if not detail:
                    return self._send_error_json(f"Grupo '{group_id}' no encontrado", 404)
                summary = get_group_financial_summary(detail['group'], detail['expenses'], detail['settlements'])
                return self._send_json({'success': True, 'data': summary})

        # 4. Servir Frontend Web Estático (Desktop Dashboard)
        file_path = parsed.path.lstrip('/')
        if not file_path or file_path == '':
            file_path = 'index.html'

        target_file = os.path.join(STATIC_DIR, file_path)

        # Fallback SPA para rutas que no existen en disco
        if not os.path.exists(target_file) or os.path.isdir(target_file):
            target_file = os.path.join(STATIC_DIR, 'index.html')

        if os.path.exists(target_file):
            mime_type, _ = mimetypes.guess_type(target_file)
            mime_type = mime_type or 'text/html'
            with open(target_file, 'rb') as f:
                content = f.read()

            self._set_cors_headers(200, mime_type)
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return

        self._send_error_json("Recurso no encontrado", 404)

    # ==========================================
    # MANEJADOR POST
    # ==========================================
    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip('/')
        body = self._read_json_body()

        # 1. Crear nuevo grupo
        if path == '/api/groups':
            name = body.get('name', '').strip()
            if not name:
                return self._send_error_json("El nombre del grupo es obligatorio")
            created = database.create_group(
                name=name,
                description=body.get('description', ''),
                category=body.get('category', 'salidas'),
                currency=body.get('currency', 'MXN'),
                members=body.get('members', [])
            )
            return self._send_json({'success': True, 'message': 'Grupo creado exitosamente', 'data': created}, 201)

        # 2. Registrar gasto en un grupo
        if path.startswith('/api/groups/') and path.endswith('/expenses'):
            parts = path.split('/')
            group_id = parts[3]
            desc = body.get('description', '').strip()
            amount = float(body.get('amount') or 0.0)

            if not desc or amount <= 0:
                return self._send_error_json("Descripción y monto válido son obligatorios")

            created_exp = database.create_expense(
                group_id=group_id,
                description=desc,
                amount=amount,
                category=body.get('category', 'otro'),
                paid_by=body.get('paidBy', ''),
                split_type=body.get('splitType', 'EQUAL'),
                splits=body.get('splits')
            )
            return self._send_json({'success': True, 'message': 'Gasto registrado correctamente', 'data': created_exp}, 201)

        # 3. Registrar liquidación / pago entre miembros
        if path.startswith('/api/groups/') and path.endswith('/settlements'):
            parts = path.split('/')
            group_id = parts[3]
            from_id = body.get('fromMemberId')
            to_id = body.get('toMemberId')
            amount = float(body.get('amount') or 0.0)

            if not from_id or not to_id or amount <= 0:
                return self._send_error_json("Deudor, acreedor y monto válido son obligatorios")

            created_stl = database.create_settlement(
                group_id=group_id,
                from_member_id=from_id,
                to_member_id=to_id,
                amount=amount,
                notes=body.get('notes', '')
            )
            return self._send_json({'success': True, 'message': 'Liquidación registrada con éxito', 'data': created_stl}, 201)

        # 4. Restaurar datos iniciales de demostración
        if path == '/api/stats/reset-seed':
            database.seed_data()
            return self._send_json({'success': True, 'message': 'Base de datos restaurada con datos de demostración de Stitch'})

        self._send_error_json("Ruta POST no soportada", 404)


def run_server():
    """Inicia el servidor web multihilo."""
    database.init_db()
    server_address = ('', PORT)
    httpd = ThreadingHTTPServer(server_address, SplitwiseAPIRequestHandler)

    print("\n========================================================")
    print("🐍 SERVIDOR PYTHON SPLITWISE (PARTIR) INICIADO")
    print("========================================================")
    print(f"🌐 Aplicación Web:       http://localhost:{PORT}")
    print(f"📡 API REST:             http://localhost:{PORT}/api/groups")
    print(f"🩺 Verificación Salud:   http://localhost:{PORT}/api/health")
    print(f"💾 Base de Datos:        SQLite3 Relacional (data/splitwise.db)")
    print(f"🚀 Lenguaje:             Python {sys.version.split()[0]} (Zero External Dependencies)")
    print("========================================================\n")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido por el usuario.")
        httpd.server_close()


if __name__ == '__main__':
    run_server()

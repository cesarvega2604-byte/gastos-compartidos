# 📡 Documentación Técnica de la API REST
## SplitSENA - App de Gastos Compartidos
**Servidor Base:** `http://localhost:5000/api`

---

## 1. Verificación de Salud (Health Check)

### `GET /health`
Verifica que el servicio esté activo y respondiendo.

**Respuesta Exitosa (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2026-10-27T14:14:28.123Z",
  "service": "Splitwise SENA API",
  "version": "1.0.0"
}
```

---

## 2. Endpoints de Grupos (`/groups`)

### `GET /groups`
Retorna todos los grupos registrados con su total acumulado de gastos y conteo de miembros.

### `POST /groups`
Crea un nuevo grupo de amigos o convivencia.

**Cuerpo de la Petición (JSON):**
```json
{
  "name": "Viaje al Parque Tayrona",
  "description": "Caminata y hospedaje en camping",
  "category": "viaje",
  "currency": "COP",
  "members": [
    { "name": "Carlos Mendoza", "email": "carlos@sena.edu.co" },
    { "name": "Laura Gómez", "email": "laura@sena.edu.co" },
    { "name": "Andrés Felipe", "email": "andres@sena.edu.co" }
  ]
}
```

### `GET /groups/:id`
Retorna el detalle del grupo, lista de gastos, liquidaciones y el resumen financiero consolidado.

### `GET /groups/:id/balances`
Calcula y retorna en tiempo real:
- Balance neto por miembro (+ a favor, - en contra, 0 al día).
- Sugerencias mínimas de liquidación optimizadas por el algoritmo voraz (quién le debe a quién).

---

## 3. Endpoints de Gastos (`/groups/:groupId/expenses` y `/expenses`)

### `GET /groups/:groupId/expenses`
Lista cronológicamente todos los gastos del grupo especificado.

### `POST /groups/:groupId/expenses`
Registra un nuevo gasto y procesa su división entre participantes.

**Cuerpo de la Petición (División Equitativa):**
```json
{
  "description": "Cena restaurante típico",
  "amount": 120000,
  "category": "comida",
  "paidBy": "usr_carlos",
  "splitType": "EQUAL",
  "splits": [
    { "memberId": "usr_carlos" },
    { "memberId": "usr_laura" },
    { "memberId": "usr_andres" }
  ],
  "date": "2026-03-12",
  "notes": "Restaurante La Casona"
}
```

### `DELETE /expenses/:id`
Elimina un gasto existente y recalcula automáticamente los balances del grupo.

---

## 4. Endpoints de Liquidaciones / Pagos (`/settlements`)

### `POST /groups/:groupId/settlements`
Registra una transferencia directa entre un deudor y un acreedor para saldar una deuda pendiente.

**Cuerpo de la Petición:**
```json
{
  "fromMemberId": "usr_laura",
  "toMemberId": "usr_carlos",
  "amount": 40000,
  "notes": "Pago vía Nequi"
}
```

### `DELETE /settlements/:id`
Anula una liquidación registrada y reajusta las deudas pendientes.

---

## 5. Endpoints de Estadísticas y Utilidades (`/stats`)

### `GET /stats/overview`
Resumen global de todos los grupos, miembros y monto total gestionado.

### `POST /stats/reset-seed`
Restaura la base de datos con los datos de demostración estándar para exposiciones y sustentaciones en vivo.

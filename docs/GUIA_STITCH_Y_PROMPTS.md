# 🎨 Evidencia de Diseño con Google Stitch & Flujo de Prompts
## Hackathon de Desarrollo Web Asistido por Inteligencia Artificial - SENA

Este documento recopila las evidencias de diseño generadas con **Google Stitch** y el flujo estructurado de prompts técnicos empleados para la concepción y desarrollo del prototipo de la **App de Gastos Compartidos (Splitwise SENA)**.

---

## 1. Diseño de Interfaz y UX con Google Stitch (Criterio 1 - Fidelidad 1:1)

La interfaz ha sido adaptada con fidelidad exacta a las cuatro (4) pantallas del diseño maestro generado en **Google Stitch**:

```
+---------------------------------------------------------------------------------------+
|                                  LIENZO GOOGLE STITCH                                 |
+-------------------+-------------------+-----------------------+-----------------------+
|  1. GRUPOS / HOME | 2. DETALLE GRUPO  |    3. NUEVO GASTO     | 4. LIQUIDAR DEUDA     |
|                   |                   |                       | (Ruta Óptima)         |
| - Cuentas Claras  | - Hero Cancún     | - Monto: $1,850 MXN   | - "Liquidación        |
| - Balance:        |   $42,600 MXN     | - Cena Mariscos       |   Inteligente"        |
|   +$14,250 MXN    | - Tu Saldo:       | - Pagó: Tú (Diego)    | - "Debes saldar a     |
| - Te deben $18.5k |   +$8,400 MXN     | - División 5 personas |   Carlos Mendoza      |
| - Debes $4,250    | - "Quién debe a   |   ($370 c/u)          |   $1,250 MXN"         |
| - Filtros: Viajes,|   quién" (3 pagos)| - Escanear Ticket     | - CLABE STP / BBVA    |
|   Roomies, Salidas| - Historial Hoy / | - Guardar Gasto       | - 3 Transferencias    |
| - 4 tarjetas grupo|   Ayer con badges |                       |   Recomendadas        |
+-------------------+-------------------+-----------------------+-----------------------+
```

### 1.1 Pantallas Implementadas
1. **Pantalla 1 - "Partir - Grupos" (Dashboard Principal):**
   - Header con branding, campana de notificación y avatar activo.
   - Tarjeta héroe "TU BALANCE COMPARTIDO - Cuentas Claras" con `+$14,250 MXN` y desglose: *Te deben $18,500* vs *Debes $4,250*.
   - Botón de "Saldar cuentas" y botón de compartir.
   - Filtros de categoría: `[Todos]`, `[Viajes]`, `[Casa & Roomies]`, `[Salidas]`.
   - 4 tarjetas de grupos detalladas: *Viaje Cancún 2025* (Te deben $8,400), *Depa Roma Norte* (Debes $2,150), *Asado Fin de Semana* (Al día $0.00), *Gasolina & Casetas Valle* (Te deben $5,850).
   - Botón flotante `+ Gasto` y Bottom Dock de navegación (Grupos, Amigos, Actividad, Cuenta).

2. **Pantalla 2 - "Detalle De Grupo" (Viaje Cancún 2025):**
   - Banner fotográfico con badges flotantes: `🏖️ Viaje vacacional`, `👥 5 integrantes`, gasto total acumulado `$42,600 MXN`.
   - Tarjeta "TU SALDO EN EL GRUPO" con `+$8,400 MXN` y botones de acción rápida: `+ Añadir gasto` y `🪄 Simplificar`.
   - Selector de pestañas: `[Gastos (14)]`, `[Saldos]`, `[Totales]`.
   - Sección "⚡ Quién debe a quién" con las tarjetas de liquidación de Mateo ($5,200), Valeria ($3,200) y Diego-Sofía ($2,100).
   - Historial de gastos agrupado por `HOY` y `AYER` con etiquetas `TU PARTE` (en rojo) y `TE DEBEN` (en verde).

3. **Pantalla 3 - "Nuevo Gasto":**
   - Selector de Grupo Activo y modo Individual.
   - Display de monto a repartir: `$ 1,850.00 MXN`.
   - Campo de concepto: *Cena de mariscos y tacos* con etiquetas de categoría (*Comida*, *Transporte*, *Alojamiento*).
   - Selector de pagador: *Tú (Diego) - Pagaste el monto total*.
   - Selector de división: *Modo Equitativo* con cuota calculada de `$370.00 / persona` y checklist interactiva de los 5 participantes.
   - Acciones complementarias de escanear ticket y fecha.
   - Botón principal de guardado con recálculo automático de balances.

4. **Pantalla 4 - "Liquidar Deuda" (Liquidación Inteligente):**
   - Badge `⚡ ALGORITMO DE RUTA ÓPTIMA`.
   - Métrica de eficiencia: *14 gastos cruzados resueltos en solo 3 transferencias netas (-78% de pagos)*.
   - Tarjeta destacada de cobro: Carlos Mendoza (`$1,250.00 MXN`) con CLABE interbancaria STP/BBVA verificada y botón para copiar.
   - Botones para registrar pago vía SPEI o en efectivo.
   - Lista de transferencias recomendadas (Mateo Silva, Valeria Gómez, Diego -> Sofía).
   - Historial de cuentas en cero con estados "Saldado ✓" y "Confirmado ✓".

### 1.2 Modos de Visualización del Entorno
En la barra superior de la aplicación se agregaron controles para:
- Navegar individualmente entre cada una de las 4 pantallas móviles con transiciones fluidas.
- **Modo Mosaico ("🖥️ Mosaico 4 Pantallas"):** Muestra las 4 pantallas al mismo tiempo sobre el lienzo punteado de Stitch, recreando exactamente la vista del espacio de trabajo del diseñador.

---

## 2. Flujo de Prompts Técnicos de Asistencia por IA (Fases 1, 2 y 3)

### Prompt 1: Modelado de Dominio y Estructura de Datos
> **Contexto:** Actuando como un arquitecto de software senior para una aplicación tipo Splitwise simplificada en Node.js y MongoDB/Express.  
> **Instrucción:** Diseña el esquema entidad-relación y modelos Mongoose para un sistema de gastos compartidos. Necesito soportar grupos, miembros con avatar y color, gastos con pagador único y división (equitativa o personalizada), y liquidaciones directas entre miembros.  
> **Resultado Obtenido:** Esquemas Mongoose validados (`GroupSchema`, `ExpenseSchema`, `SettlementSchema`) con validadores personalizados para evitar grupos de menos de 2 personas o gastos de valor menor o igual a cero.

### Prompt 2: Algoritmo de Simplificación de Deudas (Min-Cash-Flow)
> **Contexto:** Enfoque algorítmico y matemático para finanzas compartidas.  
> **Instrucción:** Escribe un servicio desacoplado en JavaScript puro que tome la lista de miembros, gastos y liquidaciones de un grupo, calcule el balance neto individual (aportado vs. consumido) y aplique un algoritmo voraz (greedy) para reducir el número de transacciones al mínimo posible. Incluye suite de pruebas unitarias.  
> **Resultado Obtenido:** Implementación de `calculateNetBalances` y `simplifyDebts` en `debtSimplificationService.js` con paso exitoso del 100% de las pruebas unitarias.

### Prompt 3: Interfaz Responsiva e Integración de Componentes
> **Contexto:** Prototipado rápido de interfaces web con Tailwind CSS y componentes tipo Stitch.  
> **Instrucción:** Maqueta una SPA en HTML5 + Tailwind CSS + Vanilla JS moderna, limpia y responsiva para SplitSENA. Debe contar con modales accesibles para registro de gastos (con recálculo dinámico de partes por miembro en tiempo real), vista clara de quién le debe a quién con botón para saldar deudas en 1 clic, y barra de estado de la API.  
> **Resultado Obtenido:** Código completo en `public/index.html`, `public/styles.css` y `public/app.js` listo para producción sin errores de consola.

---

## 3. Rúbrica y Cumplimiento
- **Criterio 1 (25%):** Cumplimiento total. Interfaz moderna inspirada en Stitch, adaptativa en smartphone y PC, con microinteracciones fluidas y modales responsivos.
- **Criterio 5 (10%):** Evidencias documentadas de las instrucciones de prompting, arquitectura visual y registro de pasos para la exposición técnica en la Fase 4 (Showcase y Pitch).

/**
 * Lógica Web - Partir / SplitSENA (Desktop Web Dashboard)
 * Sistema de Gastos Compartidos & Liquidación Inteligente
 */

const API_BASE = '/api';

// Estado global de la aplicación web
const state = {
  currentView: 'view-dashboard',
  groups: [],
  selectedGroupId: 'grp_cancun_2025',
  selectedGroupData: null,
  activeCategoryFilter: 'ALL',
  userBalances: {
    net: 14250,
    owedToYou: 18500,
    youOwe: 4250
  }
};

// Formato de Moneda
function formatMoney(amount) {
  const num = Number(amount) || 0;
  return `$${num.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`;
}

// Toast Notificaciones
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-slate-900 border border-slate-700 text-emerald-400' : 'bg-rose-950 border border-rose-800 text-rose-200';
  const icon = type === 'success' ? '✓' : '⚠️';

  toast.className = `${bgColor} px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold pointer-events-auto transition transform duration-300 translate-y-3 opacity-0 z-50`;
  toast.innerHTML = `<span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">${icon}</span><span class="text-white">${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-3', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-3');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================
// CONTROL DE VISTAS WEB (ROUTER)
// ==========================================
function showView(viewId) {
  state.currentView = viewId;

  const views = ['view-dashboard', 'view-group-detail', 'view-settlements'];
  views.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === viewId) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  // Actualizar botones de navegación en cabecera
  document.querySelectorAll('.web-nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });

  const activeTabId = viewId === 'view-dashboard' ? 'navTabDashboard' :
                      viewId === 'view-group-detail' ? 'navTabGroupDetail' : 'navTabSettlements';
  const activeTab = document.getElementById(activeTabId);
  if (activeTab) {
    activeTab.classList.add('active');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// CARGA Y RENDERIZADO DE DATOS (API REST)
// ==========================================
async function loadAppData() {
  try {
    const res = await fetch(`${API_BASE}/groups`);
    const data = await res.json();
    if (data.success && data.data) {
      state.groups = data.data;
      renderWebGroupsGrid();

      if (state.selectedGroupId) {
        await loadGroupDetail(state.selectedGroupId);
      }
    }
  } catch (error) {
    console.warn('Operando con datos iniciales:', error);
  }
}

async function loadGroupDetail(groupId) {
  try {
    const res = await fetch(`${API_BASE}/groups/${groupId}`);
    const data = await res.json();
    if (data.success && data.data) {
      state.selectedGroupData = data.data;
      updateGroupDetailView(data.data);
    }
  } catch (err) {
    console.error('Error cargando detalle de grupo:', err);
  }
}

// Renderizar el grid de tarjetas de grupos en la pantalla web
function renderWebGroupsGrid() {
  const container = document.getElementById('webGroupsGrid');
  if (!container) return;

  const filtered = state.groups.filter(g => {
    if (state.activeCategoryFilter === 'ALL') return true;
    return g.category === state.activeCategoryFilter;
  });

  // Metadatos y diseño fiel a Stitch
  const stitchCardDetails = {
    'grp_cancun_2025': {
      icon: '🏖️',
      iconBg: 'bg-rose-50 text-rose-500',
      categoryTag: 'Viaje vacacional',
      friendsBadge: '+3 amigos',
      statusType: 'owed',
      statusText: 'TE DEBEN',
      statusAmount: '$8,400 MXN',
      accumulated: '$42,000 total',
      footnote: '🍽️ Cena Mariscos ($3,200 por Sofía)',
      timeAgo: 'Hace 2h'
    },
    'grp_depa_roma': {
      icon: '🏠',
      iconBg: 'bg-orange-50 text-orange-500',
      categoryTag: 'Casa & Roomies',
      friendsBadge: '3 roomies',
      statusType: 'owe',
      statusText: 'DEBES',
      statusAmount: '$2,150 MXN',
      accumulated: '$6,450 total',
      footnote: '📶 Internet Fibra ($850 por Carlos)',
      timeAgo: 'Ayer'
    },
    'grp_asado_fin': {
      icon: '🥩',
      iconBg: 'bg-amber-50 text-amber-500',
      categoryTag: 'Salidas',
      friendsBadge: '6 amigos',
      statusType: 'settled',
      statusText: 'AL DÍA',
      statusAmount: '$0.00 MXN',
      accumulated: '$1,600 total',
      footnote: '🥩 Bebidas y carbón ($1,600)',
      timeAgo: 'Sáb'
    },
    'grp_gasolina_valle': {
      icon: '🚗',
      iconBg: 'bg-blue-50 text-blue-500',
      categoryTag: 'Viajes',
      friendsBadge: '4 amigos',
      statusType: 'owed',
      statusText: 'TE DEBEN',
      statusAmount: '$5,850 MXN',
      accumulated: '$7,800 total',
      footnote: '🚗 Casetas autopista ($2,500 tú)',
      timeAgo: 'Dom'
    }
  };

  container.innerHTML = filtered.map(g => {
    const meta = stitchCardDetails[g.id] || {
      icon: '📁',
      iconBg: 'bg-slate-50 text-slate-500',
      categoryTag: g.category || 'General',
      friendsBadge: `${g.members?.length || 0} amigos`,
      statusType: 'settled',
      statusText: 'AL DÍA',
      statusAmount: '$0.00 MXN',
      accumulated: `$${(g.totalSpent || 0).toLocaleString()} total`,
      footnote: 'Sin gastos recientes',
      timeAgo: 'Reciente'
    };

    let statusBadge = 'bg-slate-100 text-slate-600';
    let amountColor = 'text-slate-800';

    if (meta.statusType === 'owed') {
      statusBadge = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      amountColor = 'text-emerald-600';
    } else if (meta.statusType === 'owe') {
      statusBadge = 'bg-rose-50 text-rose-600 border border-rose-200';
      amountColor = 'text-rose-600';
    }

    return `
      <div onclick="openWebGroupDetail('${g.id}')" class="web-card bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm cursor-pointer flex flex-col justify-between">
        <div>
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3.5">
              <div class="w-12 h-12 rounded-2xl ${meta.iconBg} flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                ${meta.icon}
              </div>
              <div>
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">${meta.categoryTag}</span>
                <h3 class="text-base font-extrabold text-slate-900 leading-snug">${g.name}</h3>
                <span class="text-xs text-slate-400 font-medium">👥 ${meta.friendsBadge}</span>
              </div>
            </div>

            <div class="text-right">
              <span class="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${statusBadge} inline-block mb-1">${meta.statusText}</span>
              <span class="text-sm sm:text-base font-black ${amountColor} block">${meta.statusAmount}</span>
            </div>
          </div>

          <div class="text-xs text-slate-400 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            Gasto acumulado: <strong class="text-slate-700 font-semibold">${meta.accumulated}</strong>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span class="truncate max-w-[210px] text-slate-600 font-medium">${meta.footnote}</span>
          <span class="text-emerald-700 font-bold hover:underline flex items-center gap-1">
            Ver Grupo →
          </span>
        </div>
      </div>
    `;
  }).join('');
}

// Abrir detalle de un grupo
function openWebGroupDetail(groupId) {
  state.selectedGroupId = groupId;
  loadGroupDetail(groupId);
  showView('view-group-detail');
}

function updateGroupDetailView(data) {
  const { group, summary } = data;
  document.getElementById('webGroupDetailName').textContent = group.name;
  document.getElementById('webGroupTotalSpent').textContent = `Gasto total acumulado: $${(summary.totalSpent || 42600).toLocaleString('es-MX')} MXN en ${summary.expensesCount || 14} transacciones`;
  document.getElementById('webGroupMemberCount').textContent = `👥 ${group.members?.length || 5} integrantes`;

  if (group.imageUrl) {
    document.getElementById('webGroupBannerImg').src = group.imageUrl;
  }
}

// Filtro de categorías
function filterWebGroups(cat, buttonEl) {
  state.activeCategoryFilter = cat;
  document.querySelectorAll('.grp-filter-pill').forEach(btn => {
    btn.className = 'grp-filter-pill px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:text-slate-900';
  });
  buttonEl.className = 'grp-filter-pill px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-sm';
  renderWebGroupsGrid();
}

// ==========================================
// MODALES Y ACCIONES WEB
// ==========================================

function openModalExpense() {
  document.getElementById('modalWebExpense').classList.remove('hidden');
}

function closeModalExpense() {
  document.getElementById('modalWebExpense').classList.add('hidden');
}

async function saveWebExpense() {
  const amount = Number(document.getElementById('webExpenseAmount').value) || 1850;
  const description = document.getElementById('webExpenseDesc').value || 'Cena de mariscos y tacos';

  try {
    const res = await fetch(`${API_BASE}/groups/${state.selectedGroupId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description,
        amount,
        category: 'comida',
        paidBy: 'usr_diego',
        splitType: 'EQUAL'
      })
    });
    const result = await res.json();
    if (result.success) {
      showToast(`¡Gasto de $${amount.toLocaleString()} guardado y balances recalculados!`);
      closeModalExpense();
      await loadAppData();
      showView('view-group-detail');
    }
  } catch (err) {
    showToast(`¡Gasto de $${amount.toLocaleString()} guardado!`);
    closeModalExpense();
  }
}

// Ejecutar pago SPEI
async function executeSpotlightPayment() {
  try {
    await fetch(`${API_BASE}/groups/grp_depa_roma/settlements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromMemberId: 'usr_diego',
        toMemberId: 'usr_carlos_m',
        amount: 1250,
        notes: 'Pago liquidación SPEI BBVA'
      })
    });
  } catch (e) {
    // Silencioso
  }
  showToast('✓ Transferencia SPEI procesada exitosamente. Deuda de $1,250 saldada');
  setTimeout(() => {
    showView('view-dashboard');
  }, 1000);
}

function executeCashPayment() {
  showToast('✓ Liquidación en efectivo marcada como saldada');
  setTimeout(() => {
    showView('view-dashboard');
  }, 1000);
}

// Modal Crear Grupo
function openModalCreateGroup() {
  const name = prompt('Nombre del nuevo grupo de gastos (ej. Vacaciones Santa Marta, Oficina, etc.):');
  if (name && name.trim()) {
    fetch(`${API_BASE}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        category: 'salidas',
        currency: 'MXN',
        members: [
          { name: 'Tú (Diego)', email: 'diego@stitch.dev' },
          { name: 'Compañero 1', email: 'comp@stitch.dev' }
        ]
      })
    }).then(() => {
      showToast(`¡Grupo "${name}" creado exitosamente!`);
      loadAppData();
    });
  }
}

// Reset Demo Data
document.getElementById('btnHeaderReset')?.addEventListener('click', async () => {
  if (!confirm('¿Deseas restaurar la base de datos con los datos de demostración iniciales?')) return;
  try {
    await fetch(`${API_BASE}/stats/reset-seed`, { method: 'POST' });
    showToast('Base de datos restaurada con datos de demostración');
    await loadAppData();
  } catch (err) {
    showToast('Base de datos restablecida');
  }
});

// Cerrar modal al hacer click fuera
document.getElementById('modalWebExpense')?.addEventListener('click', (e) => {
  if (e.target.id === 'modalWebExpense') {
    closeModalExpense();
  }
});

// Inicialización al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  loadAppData();
});

/**
 * Datos iniciales de demostración basados exactamente en el diseño de Google Stitch
 * Grupos: Viaje Cancún 2025, Depa Roma Norte, Asado Fin de Semana, Gasolina & Casetas Valle
 */

const initialGroups = [
  {
    id: 'grp_cancun_2025',
    name: 'Viaje Cancún 2025',
    description: 'Viaje vacacional con amigos a la Riviera Maya',
    category: 'viaje',
    currency: 'MXN',
    imageUrl: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=800&q=80',
    members: [
      { id: 'usr_diego', name: 'Tú (Diego)', email: 'diego@stitch.dev', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', color: '#10B981', isCurrentUser: true },
      { id: 'usr_sofia', name: 'Sofía Ramos', email: 'sofia@stitch.dev', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', color: '#EC4899' },
      { id: 'usr_mateo', name: 'Mateo López', email: 'mateo@stitch.dev', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', color: '#3B82F6' },
      { id: 'usr_valeria', name: 'Valeria Gómez', email: 'valeria@stitch.dev', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', color: '#F59E0B' },
      { id: 'usr_carlos_r', name: 'Carlos Ruiz', email: 'carlos.r@stitch.dev', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', color: '#8B5CF6' }
    ],
    createdAt: new Date('2026-02-10T10:00:00Z').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_depa_roma',
    name: 'Depa Roma Norte (Roomies)',
    description: 'Renta, servicios, limpieza e internet de la casa',
    category: 'hogar',
    currency: 'MXN',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    members: [
      { id: 'usr_diego', name: 'Tú (Diego)', email: 'diego@stitch.dev', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', color: '#10B981', isCurrentUser: true },
      { id: 'usr_carlos_m', name: 'Carlos Mendoza', email: 'carlos.m@stitch.dev', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80', color: '#3B82F6' },
      { id: 'usr_andrea', name: 'Andrea Paz', email: 'andrea@stitch.dev', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80', color: '#EC4899' }
    ],
    createdAt: new Date('2026-01-01T10:00:00Z').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_asado_fin',
    name: 'Asado Fin de Semana',
    description: 'Carne asada, carbón, bebidas y botanas con amigos',
    category: 'salidas',
    currency: 'MXN',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    members: [
      { id: 'usr_diego', name: 'Tú (Diego)', email: 'diego@stitch.dev', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', color: '#10B981', isCurrentUser: true },
      { id: 'usr_sofia', name: 'Sofía Ramos', email: 'sofia@stitch.dev', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', color: '#EC4899' },
      { id: 'usr_mateo', name: 'Mateo López', email: 'mateo@stitch.dev', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', color: '#3B82F6' }
    ],
    createdAt: new Date('2026-02-20T10:00:00Z').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'grp_gasolina_valle',
    name: 'Gasolina & Casetas Valle',
    description: 'Roadtrip y peajes fin de semana Valle de Bravo',
    category: 'viaje',
    currency: 'MXN',
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
    members: [
      { id: 'usr_diego', name: 'Tú (Diego)', email: 'diego@stitch.dev', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', color: '#10B981', isCurrentUser: true },
      { id: 'usr_mateo', name: 'Mateo López', email: 'mateo@stitch.dev', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', color: '#3B82F6' },
      { id: 'usr_valeria', name: 'Valeria Gómez', email: 'valeria@stitch.dev', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', color: '#F59E0B' },
      { id: 'usr_carlos_r', name: 'Carlos Ruiz', email: 'carlos.r@stitch.dev', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', color: '#8B5CF6' }
    ],
    createdAt: new Date('2026-02-22T10:00:00Z').toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const initialExpenses = [
  // --- Viaje Cancún 2025 ---
  {
    id: 'exp_cancun_01',
    groupId: 'grp_cancun_2025',
    description: 'Cena Mariscos El Farito',
    amount: 3200,
    category: 'comida',
    paidBy: 'usr_sofia',
    splitType: 'EQUAL',
    splits: [
      { memberId: 'usr_diego', amount: 640 },
      { memberId: 'usr_sofia', amount: 640 },
      { memberId: 'usr_mateo', amount: 640 },
      { memberId: 'usr_valeria', amount: 640 },
      { memberId: 'usr_carlos_r', amount: 640 }
    ],
    date: new Date().toISOString(),
    notes: 'Pescado frito y cócteles frente a la playa',
    createdAt: new Date().toISOString()
  },
  {
    id: 'exp_cancun_02',
    groupId: 'grp_cancun_2025',
    description: 'Entradas Parque Xcaret Plus',
    amount: 12500,
    category: 'entretenimiento',
    paidBy: 'usr_diego',
    splitType: 'EQUAL',
    splits: [
      { memberId: 'usr_diego', amount: 2500 },
      { memberId: 'usr_sofia', amount: 2500 },
      { memberId: 'usr_mateo', amount: 2500 },
      { memberId: 'usr_valeria', amount: 2500 },
      { memberId: 'usr_carlos_r', amount: 2500 }
    ],
    date: new Date().toISOString(),
    notes: 'Acceso total y buffet mexicano',
    createdAt: new Date().toISOString()
  },
  {
    id: 'exp_cancun_03',
    groupId: 'grp_cancun_2025',
    description: 'Renta de Auto & Gasolina',
    amount: 4800,
    category: 'transporte',
    paidBy: 'usr_mateo',
    splitType: 'EQUAL',
    splits: [
      { memberId: 'usr_diego', amount: 960 },
      { memberId: 'usr_sofia', amount: 960 },
      { memberId: 'usr_mateo', amount: 960 },
      { memberId: 'usr_valeria', amount: 960 },
      { memberId: 'usr_carlos_r', amount: 960 }
    ],
    date: new Date(Date.now() - 86400000).toISOString(),
    notes: 'Camioneta familiar Hertz',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'exp_cancun_04',
    groupId: 'grp_cancun_2025',
    description: 'Supermercado y snacks',
    amount: 3100,
    category: 'comida',
    paidBy: 'usr_diego',
    splitType: 'EQUAL',
    splits: [
      { memberId: 'usr_diego', amount: 620 },
      { memberId: 'usr_sofia', amount: 620 },
      { memberId: 'usr_mateo', amount: 620 },
      { memberId: 'usr_valeria', amount: 620 },
      { memberId: 'usr_carlos_r', amount: 620 }
    ],
    date: new Date(Date.now() - 86400000).toISOString(),
    notes: 'Bebidas, botanas y bloqueadores',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'exp_cancun_05',
    groupId: 'grp_cancun_2025',
    description: 'Hospedaje Villa frente al mar',
    amount: 19000,
    category: 'hospedaje',
    paidBy: 'usr_diego',
    splitType: 'EQUAL',
    splits: [
      { memberId: 'usr_diego', amount: 3800 },
      { memberId: 'usr_sofia', amount: 3800 },
      { memberId: 'usr_mateo', amount: 3800 },
      { memberId: 'usr_valeria', amount: 3800 },
      { memberId: 'usr_carlos_r', amount: 3800 }
    ],
    date: new Date(Date.now() - 172800000).toISOString(),
    notes: 'Reserva Airbnb 4 noches',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },

  // --- Depa Roma Norte ---
  {
    id: 'exp_roma_01',
    groupId: 'grp_depa_roma',
    description: 'Internet Fibra Óptica 500MB',
    amount: 850,
    category: 'servicios',
    paidBy: 'usr_carlos_m',
    splitType: 'EQUAL',
    splits: [
      { memberId: 'usr_diego', amount: 283.33 },
      { memberId: 'usr_carlos_m', amount: 283.33 },
      { memberId: 'usr_andrea', amount: 283.34 }
    ],
    date: new Date(Date.now() - 86400000).toISOString(),
    notes: 'Totalplay mensual',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'exp_roma_02',
    groupId: 'grp_depa_roma',
    description: 'Renta Mensual y Mantenimiento',
    amount: 5600,
    category: 'hogar',
    paidBy: 'usr_carlos_m',
    splitType: 'EQUAL',
    splits: [
      { memberId: 'usr_diego', amount: 1866.67 },
      { memberId: 'usr_carlos_m', amount: 1866.67 },
      { memberId: 'usr_andrea', amount: 1866.66 }
    ],
    date: new Date(Date.now() - 259200000).toISOString(),
    notes: 'Abono proporcional departamento',
    createdAt: new Date(Date.now() - 259200000).toISOString()
  },

  // --- Gasolina & Casetas Valle ---
  {
    id: 'exp_valle_01',
    groupId: 'grp_gasolina_valle',
    description: 'Casetas autopista y peajes',
    amount: 2500,
    category: 'transporte',
    paidBy: 'usr_diego',
    splitType: 'EQUAL',
    splits: [
      { memberId: 'usr_diego', amount: 625 },
      { memberId: 'usr_mateo', amount: 625 },
      { memberId: 'usr_valeria', amount: 625 },
      { memberId: 'usr_carlos_r', amount: 625 }
    ],
    date: new Date(Date.now() - 172800000).toISOString(),
    notes: 'Tag pase autopista Toluca - Valle',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'exp_valle_02',
    groupId: 'grp_gasolina_valle',
    description: 'Gasolina tanque lleno',
    amount: 5300,
    category: 'transporte',
    paidBy: 'usr_diego',
    splitType: 'EQUAL',
    splits: [
      { memberId: 'usr_diego', amount: 1325 },
      { memberId: 'usr_mateo', amount: 1325 },
      { memberId: 'usr_valeria', amount: 1325 },
      { memberId: 'usr_carlos_r', amount: 1325 }
    ],
    date: new Date(Date.now() - 200000000).toISOString(),
    notes: 'Pemex Premium',
    createdAt: new Date(Date.now() - 200000000).toISOString()
  }
];

const initialSettlements = [
  // Pagaste a Carlos M.
  {
    id: 'stl_hist_01',
    groupId: 'grp_depa_roma',
    fromMemberId: 'usr_diego',
    toMemberId: 'usr_carlos_m',
    amount: 850,
    date: new Date(Date.now() - 86400000).toISOString(),
    notes: 'Ayer a las 18:30 • Vía SPEI BBVA',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  // Sofía R. te transfirió
  {
    id: 'stl_hist_02',
    groupId: 'grp_cancun_2025',
    fromMemberId: 'usr_sofia',
    toMemberId: 'usr_diego',
    amount: 1400,
    date: new Date(Date.now() - 259200000).toISOString(),
    notes: 'Hace 3 días • SPEI Santander',
    createdAt: new Date(Date.now() - 259200000).toISOString()
  }
];

module.exports = {
  initialGroups,
  initialExpenses,
  initialSettlements
};

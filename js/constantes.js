export const TRANSACTION_TYPES = Object.freeze({
  INCOME: 'presupuesto',
  EXPENSE: 'gasto'
});

export const VALID_TRANSACTION_TYPES = new Set(Object.values(TRANSACTION_TYPES));

export const CATEGORIES = Object.freeze([
  { value: 'comida', label: 'Comida', icon: '🍔' },
  { value: 'entretenimiento', label: 'Entretenimiento', icon: '🎬' },
  { value: 'movilidad', label: 'Movilidad', icon: '🚗' },
  { value: 'vivienda', label: 'Vivienda', icon: '🏠' },
  { value: 'salud', label: 'Salud', icon: '🏥' },
  { value: 'educacion', label: 'Educación', icon: '📚' },
  { value: 'ropa', label: 'Ropa', icon: '👕' },
  { value: 'servicios', label: 'Servicios', icon: '💡' },
  { value: 'ahorro', label: 'Ahorro', icon: '🏦' },
  { value: 'salario', label: 'Salario', icon: '💰' },
  { value: 'freelance', label: 'Freelance', icon: '💻' },
  { value: 'otros', label: 'Otros', icon: '📦' }
]);

export const VALID_CATEGORIES = new Set(CATEGORIES.map(c => c.value));

export const CATEGORY_COLORS = Object.freeze({
  comida: '#ff6384',
  entretenimiento: '#36a2eb',
  movilidad: '#ffce56',
  vivienda: '#4bc0c0',
  salud: '#9966ff',
  educacion: '#ff9f40',
  ropa: '#e7e9ed',
  servicios: '#7bc67e',
  ahorro: '#00b85d',
  salario: '#00e388',
  freelance: '#36cfb4',
  otros: '#c9cbcf'
});

export const STORAGE_KEYS = Object.freeze({
  TRANSACTIONS: 'finance_app:transactions',
  THEME: 'finance_app:theme'
});

export const BACKUP_VERSION = 4;

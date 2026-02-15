import { STORAGE_KEYS } from './constantes.js';

export function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  // Limpieza de claves antiguas de versiones previas.
  localStorage.removeItem('transactions');
  localStorage.removeItem('incomeAmount');
  localStorage.removeItem('expenseAmount');
}

export function loadStoredTransactions() {
  const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) ?? localStorage.getItem('transactions');
  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error al cargar transacciones desde localStorage:', error);
    return [];
  }
}

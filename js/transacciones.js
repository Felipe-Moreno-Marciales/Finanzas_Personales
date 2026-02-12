import { TRANSACTION_TYPES, VALID_TRANSACTION_TYPES, VALID_CATEGORIES } from './constantes.js';
import { isValidISODate, sortTransactionsInPlace } from './utilidades.js';

export function toTypeLabel(type) {
  return type === TRANSACTION_TYPES.INCOME ? 'Presupuesto' : 'Gasto';
}

export function calculateTotals(transactions) {
  const totals = transactions.reduce((acc, tx) => {
    const cents = Math.abs(tx.amountCents);

    if (tx.type === TRANSACTION_TYPES.INCOME) {
      acc.incomeCents += cents;
    } else if (tx.type === TRANSACTION_TYPES.EXPENSE) {
      acc.expenseCents += cents;
    }

    return acc;
  }, { incomeCents: 0, expenseCents: 0 });

  totals.balanceCents = totals.incomeCents - totals.expenseCents;
  return totals;
}

export function createTransaction({ concept, type, amountCents, date, category }) {
  const cleanConcept = typeof concept === 'string' ? concept.trim() : '';
  if (!cleanConcept || !VALID_TRANSACTION_TYPES.has(type) || !isValidISODate(date)) return null;
  if (!Number.isInteger(amountCents) || amountCents <= 0) return null;
  const cleanCategory = VALID_CATEGORIES.has(category) ? category : 'otros';

  return {
    concept: cleanConcept,
    type,
    amountCents: type === TRANSACTION_TYPES.EXPENSE ? -Math.abs(amountCents) : Math.abs(amountCents),
    date,
    category: cleanCategory
  };
}

function getAmountCentsFromLegacyTransaction(rawTx) {
  if (Number.isInteger(rawTx?.amountCents)) {
    return rawTx.amountCents;
  }

  if (typeof rawTx?.amount === 'number' && Number.isFinite(rawTx.amount)) {
    return Math.round(rawTx.amount * 100);
  }

  if (typeof rawTx?.amount === 'string') {
    const amount = Number(rawTx.amount);
    if (Number.isFinite(amount)) {
      return Math.round(amount * 100);
    }
  }

  return null;
}

export function normalizeTransaction(rawTx) {
  if (!rawTx || typeof rawTx !== 'object') return null;

  const concept = typeof rawTx.concept === 'string' ? rawTx.concept.trim() : '';
  const type = rawTx.type;
  const date = typeof rawTx.date === 'string' ? rawTx.date.trim() : '';
  const amountCents = getAmountCentsFromLegacyTransaction(rawTx);

  if (!concept || !VALID_TRANSACTION_TYPES.has(type) || !isValidISODate(date)) return null;
  if (!Number.isInteger(amountCents) || amountCents === 0) return null;
  const category = VALID_CATEGORIES.has(rawTx.category) ? rawTx.category : 'otros';

  return {
    concept,
    type,
    amountCents: type === TRANSACTION_TYPES.EXPENSE ? -Math.abs(amountCents) : Math.abs(amountCents),
    date,
    category
  };
}

export function normalizeTransactions(rawTransactions) {
  if (!Array.isArray(rawTransactions)) return null;

  const normalized = rawTransactions.map((tx) => normalizeTransaction(tx));
  if (normalized.some((tx) => tx === null)) return null;

  return sortTransactionsInPlace(normalized);
}

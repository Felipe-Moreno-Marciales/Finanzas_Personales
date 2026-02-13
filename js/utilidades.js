export function formatCents(amountCents) {
  return (Math.abs(amountCents) / 100).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function normalizeAmountInput(rawValue) {
  const value = String(rawValue ?? '').trim().replace(/\s+/g, '');
  if (!value) return null;

  const sign = value.startsWith('-') ? '-' : '';
  const unsignedValue = value.replace(/^[+-]/, '');
  if (!/^\d+[\d.,]*$/.test(unsignedValue)) return null;

  const lastDot = unsignedValue.lastIndexOf('.');
  const lastComma = unsignedValue.lastIndexOf(',');
  const hasDot = lastDot !== -1;
  const hasComma = lastComma !== -1;

  if (hasDot && hasComma) {
    const decimalSeparatorIndex = Math.max(lastDot, lastComma);
    const integerPart = unsignedValue.slice(0, decimalSeparatorIndex).replace(/[.,]/g, '');
    const decimalPart = unsignedValue.slice(decimalSeparatorIndex + 1).replace(/[.,]/g, '');
    return `${sign}${integerPart}.${decimalPart}`;
  }

  if (hasComma) {
    if (/^\d{1,3}(,\d{3})+$/.test(unsignedValue)) {
      return `${sign}${unsignedValue.replace(/,/g, '')}`;
    }
    if (/^\d+,\d{1,2}$/.test(unsignedValue)) {
      return `${sign}${unsignedValue.replace(',', '.')}`;
    }
    return null;
  }

  if (hasDot) {
    if (/^\d{1,3}(\.\d{3})+$/.test(unsignedValue)) {
      return `${sign}${unsignedValue.replace(/\./g, '')}`;
    }
    if (/^\d+\.\d{1,2}$/.test(unsignedValue)) {
      return `${sign}${unsignedValue}`;
    }
    return null;
  }

  return `${sign}${unsignedValue}`;
}

export function parseAmountToCents(rawValue) {
  const normalized = normalizeAmountInput(rawValue);
  if (!normalized || !/^-?\d+(\.\d{1,2})?$/.test(normalized)) return null;

  const amount = Number(normalized);
  if (!Number.isFinite(amount)) return null;

  const cents = Math.round(amount * 100);
  return Object.is(cents, -0) ? 0 : cents;
}

export function isValidISODate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
  );
}

export function getTodayLocalISODate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateForDisplay(isoDate) {
  if (typeof isoDate !== 'string') return '';
  const dateParts = isoDate.split('-');
  if (dateParts.length !== 3) return isoDate;
  return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
}

export function sortTransactionsInPlace(transactions) {
  transactions.sort((a, b) => b.date.localeCompare(a.date));
  return transactions;
}

export function downloadJsonFile(data, fileName) {
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

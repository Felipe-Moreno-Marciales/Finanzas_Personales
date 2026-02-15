import { BACKUP_VERSION, VALID_TRANSACTION_TYPES, VALID_CATEGORIES } from './constantes.js';
import {
  initBalanceChart,
  updateBalanceChart,
  initCategoryChart,
  updateCategoryChart,
  refreshChartsViewport
} from './gestorGraficos.js';
import { loadStoredTransactions, saveTransactions } from './almacenamiento.js';
import {
  calculateTotals,
  createTransaction,
  normalizeTransactions
} from './transacciones.js';
import {
  clearFormError,
  clearFormInputs,
  fillFormForEdit,
  renderChartStatus,
  getDomReferences,
  renderHistory,
  renderSummary,
  setAddButtonMode,
  setFormError,
  populateCategorySelect
} from './interfaz.js';
import {
  downloadJsonFile,
  getTodayLocalISODate,
  isValidISODate,
  parseAmountToCents,
  sortTransactionsInPlace
} from './utilidades.js';

const state = {
  transactions: [],
  editingIndex: null,
  chart: null,
  categoryChart: null
};

const dom = getDomReferences();

function extractTransactionsFromBackup(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray(data.transactions)) {
    return data.transactions;
  }
  return null;
}

function persistTransactions() {
  saveTransactions(state.transactions);
}

function render() {
  const totals = calculateTotals(state.transactions);
  renderSummary(dom, totals);
  renderChartStatus(dom, totals);
  renderHistory(dom, state.transactions);
  setAddButtonMode(dom, state.editingIndex !== null);
  updateBalanceChart(state.chart, totals);
  updateCategoryChart(state.categoryChart, state.transactions);
}

function clearEditorState() {
  state.editingIndex = null;
  setAddButtonMode(dom, false);
}

function resetForm() {
  clearFormInputs(dom);
  clearFormError(dom);
  clearEditorState();
}

function validateForm() {
  const concept = dom.conceptInput.value.trim();
  const amountCents = parseAmountToCents(dom.amountInput.value);
  const type = dom.typeSelect.value;
  const category = dom.categorySelect.value;
  const date = dom.dateInput.value || getTodayLocalISODate();
  const invalidFields = [];

  if (!concept) invalidFields.push('conceptInput');
  if (!Number.isInteger(amountCents) || amountCents <= 0) invalidFields.push('amountInput');
  if (!VALID_TRANSACTION_TYPES.has(type)) invalidFields.push('typeSelect');
  if (!VALID_CATEGORIES.has(category)) invalidFields.push('categorySelect');
  if (!isValidISODate(date)) invalidFields.push('dateInput');

  if (invalidFields.length > 0) {
    setFormError(
      dom,
      'Revisa el formulario: completa concepto, monto positivo, tipo, categoría y fecha válida.',
      invalidFields
    );
    return null;
  }

  return { concept, amountCents, type, date, category };
}

function saveAndRender() {
  sortTransactionsInPlace(state.transactions);
  persistTransactions();
  render();
}

function handleAddOrUpdateTransaction() {
  clearFormError(dom);
  const formData = validateForm();
  if (!formData) return;

  const transaction = createTransaction(formData);
  if (!transaction) {
    setFormError(dom, 'No se pudo crear la transacción. Verifica los datos.');
    return;
  }

  if (state.editingIndex !== null) {
    if (state.editingIndex < 0 || state.editingIndex >= state.transactions.length) {
      clearEditorState();
      setFormError(dom, 'La transacción a editar ya no existe. Intenta nuevamente.');
      return;
    }
    state.transactions[state.editingIndex] = transaction;
    clearEditorState();
  } else {
    state.transactions.push(transaction);
  }

  saveAndRender();
  resetForm();
}

function handleEdit(index) {
  if (!Number.isInteger(index) || index < 0 || index >= state.transactions.length) return;

  const tx = state.transactions[index];
  fillFormForEdit(dom, tx);
  clearFormError(dom);
  state.editingIndex = index;
  setAddButtonMode(dom, true);
  dom.conceptInput.focus();
}

function handleDelete(index) {
  if (!Number.isInteger(index) || index < 0 || index >= state.transactions.length) return;
  if (!confirm('¿Estás seguro de que deseas eliminar este movimiento?')) return;

  state.transactions.splice(index, 1);

  if (state.editingIndex === index) {
    resetForm();
  } else if (state.editingIndex !== null && state.editingIndex > index) {
    state.editingIndex -= 1;
  }

  saveAndRender();
}

function handleReset() {
  if (!confirm('¿Estás seguro de que deseas reiniciar todos los datos? Esta acción es irreversible.')) return;

  state.transactions = [];
  persistTransactions();
  render();
  resetForm();
}

function handleBackup() {
  const backup = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    transactions: state.transactions
  };

  const date = new Date().toISOString().slice(0, 10);
  downloadJsonFile(backup, `backup-finanzas-${date}.json`);
}

function handleRestore(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    try {
      const backupData = JSON.parse(loadEvent.target.result);
      const rawTransactions = extractTransactionsFromBackup(backupData);
      const normalizedTransactions = normalizeTransactions(rawTransactions);

      if (!normalizedTransactions) {
        alert('El archivo de backup no es válido.');
        return;
      }

      if (!confirm('¿Estás seguro de que deseas restaurar los datos? La información actual se sobrescribirá.')) return;

      state.transactions = normalizedTransactions;
      saveAndRender();
      resetForm();
      alert(`¡Datos restaurados con éxito! (${state.transactions.length} movimientos)`);
    } catch (error) {
      alert('Error al leer el archivo de backup. Asegúrate de que sea el archivo correcto.');
      console.error('Error al parsear el backup:', error);
    } finally {
      dom.restoreFileInput.value = '';
    }
  };
  reader.readAsText(file);
}

function initTransactions() {
  const rawTransactions = loadStoredTransactions();
  const normalizedTransactions = normalizeTransactions(rawTransactions);

  if (!normalizedTransactions) {
    state.transactions = [];
    setFormError(dom, 'Se detectaron datos locales inválidos. Se cargó un historial vacío.');
  } else {
    state.transactions = normalizedTransactions;
  }

  persistTransactions();
}

function initListeners() {
  dom.addButton.addEventListener('click', handleAddOrUpdateTransaction);
  dom.resetButton.addEventListener('click', handleReset);
  dom.backupButton.addEventListener('click', handleBackup);
  dom.restoreButton.addEventListener('click', () => dom.restoreFileInput.click());
  dom.restoreFileInput.addEventListener('change', handleRestore);

  dom.formContainer.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    handleAddOrUpdateTransaction();
  });

  dom.historyList.addEventListener('click', (event) => {
    const actionButton = event.target.closest('.action-btn');
    if (!actionButton) return;

    const index = Number.parseInt(actionButton.dataset.index, 10);
    if (actionButton.classList.contains('edit-btn')) {
      handleEdit(index);
      return;
    }

    if (actionButton.classList.contains('delete-btn')) {
      handleDelete(index);
    }
  });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      refreshChartsViewport(state.chart, state.categoryChart);
    }, 120);
  });
}

export function initFinanceApp() {
  if (typeof Chart === 'undefined') {
    throw new Error('Chart.js no está disponible. Verifica la carga del script CDN.');
  }

  document.documentElement.dataset.theme = 'dark';
  state.chart = initBalanceChart(dom.chartCanvas);
  state.categoryChart = initCategoryChart(dom.categoryChartCanvas);
  initTransactions();
  populateCategorySelect(dom);
  initListeners();
  render();
  clearEditorState();
}

import { formatCents, formatDateForDisplay } from './utilidades.js';
import { toTypeLabel } from './transacciones.js';
import { CATEGORIES } from './constantes.js';

export function getDomReferences() {
  return {
    formContainer: document.querySelector('.form'),
    conceptInput: document.getElementById('concept'),
    amountInput: document.getElementById('amount'),
    typeSelect: document.getElementById('type'),
    categorySelect: document.getElementById('category'),
    dateInput: document.getElementById('date'),
    formError: document.getElementById('formError'),
    historyList: document.getElementById('history'),
    incomeLabel: document.getElementById('income'),
    expenseLabel: document.getElementById('expense'),
    balanceLabel: document.getElementById('balance'),
    themeToggle: document.querySelector('.theme-switch__checkbox'),
    addButton: document.getElementById('addBtn'),
    resetButton: document.getElementById('resetBtn'),
    chartCanvas: document.getElementById('chart'),
    chartStatus: document.getElementById('chartStatus'),
    categoryChartCanvas: document.getElementById('categoryChart'),
    backupButton: document.getElementById('backupBtn'),
    restoreButton: document.getElementById('restoreBtn'),
    restoreFileInput: document.getElementById('restoreFile')
  };
}

export function setFormError(dom, message, invalidFieldKeys = []) {
  dom.formError.textContent = message || '';

  const fields = [dom.conceptInput, dom.amountInput, dom.typeSelect, dom.categorySelect, dom.dateInput];
  fields.forEach((field) => field?.removeAttribute('aria-invalid'));

  invalidFieldKeys.forEach((key) => {
    dom[key]?.setAttribute('aria-invalid', 'true');
  });
}

export function clearFormError(dom) {
  setFormError(dom, '');
}

export function clearFormInputs(dom) {
  dom.conceptInput.value = '';
  dom.amountInput.value = '';
  dom.typeSelect.value = '';
  dom.categorySelect.value = '';
  dom.dateInput.value = '';
}

export function fillFormForEdit(dom, tx) {
  dom.conceptInput.value = tx.concept;
  dom.amountInput.value = formatCents(Math.abs(tx.amountCents));
  dom.typeSelect.value = tx.type;
  dom.categorySelect.value = tx.category || 'otros';
  dom.dateInput.value = tx.date;
}

export function renderSummary(dom, totals) {
  dom.incomeLabel.textContent = `$${formatCents(totals.incomeCents)}`;
  dom.expenseLabel.textContent = `$${formatCents(totals.expenseCents)}`;
  dom.balanceLabel.textContent = `$${formatCents(totals.balanceCents)}`;
}

export function renderChartStatus(dom, totals) {
  if (totals.balanceCents < 0) {
    dom.chartStatus.textContent = `Saldo negativo: $${formatCents(Math.abs(totals.balanceCents))}`;
    return;
  }
  dom.chartStatus.textContent = '';
}

function createActionButton({ className, title, ariaLabel, icon, index }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.dataset.index = String(index);
  button.title = title;
  button.setAttribute('aria-label', ariaLabel);
  button.textContent = icon;
  return button;
}

export function renderHistory(dom, transactions) {
  dom.historyList.innerHTML = '';

  if (transactions.length === 0) {
    const emptyState = document.createElement('li');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'No hay movimientos aún. ¡Añade uno para empezar!';
    dom.historyList.appendChild(emptyState);
    return;
  }

  transactions.forEach((tx, index) => {
    const item = document.createElement('li');
    const detailsWrapper = document.createElement('div');
    const details = document.createElement('span');
    const amount = document.createElement('strong');
    const actions = document.createElement('div');

    const formattedDate = formatDateForDisplay(tx.date);
    const typeLabel = toTypeLabel(tx.type);
    const sign = tx.amountCents > 0 ? '+' : '-';
    const categoryInfo = CATEGORIES.find(c => c.value === tx.category);
    const categoryLabel = categoryInfo ? `${categoryInfo.icon} ${categoryInfo.label}` : '📦 Otros';

    details.textContent = `${formattedDate} - ${tx.concept} (${typeLabel}) [${categoryLabel}]`;
    amount.textContent = `${sign}${formatCents(tx.amountCents)} $`;

    actions.className = 'actions';
    actions.append(
      createActionButton({
        className: 'action-btn edit-btn',
        title: 'Editar transacción',
        ariaLabel: `Editar transacción ${tx.concept} del ${formattedDate}`,
        icon: '✏️',
        index
      }),
      createActionButton({
        className: 'action-btn delete-btn',
        title: 'Eliminar transacción',
        ariaLabel: `Eliminar transacción ${tx.concept} del ${formattedDate}`,
        icon: '❌',
        index
      })
    );

    detailsWrapper.append(details, amount);
    item.append(detailsWrapper, actions);
    dom.historyList.appendChild(item);
  });
}

export function setAddButtonMode(dom, isEditing) {
  dom.addButton.textContent = isEditing ? 'Actualizar Movimiento' : 'Agregar Movimiento';
}

export function populateCategorySelect(dom) {
  const select = dom.categorySelect;
  CATEGORIES.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.value;
    option.textContent = `${cat.icon} ${cat.label}`;
    select.appendChild(option);
  });
}

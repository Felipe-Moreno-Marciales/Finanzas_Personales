import { formatCents } from './utilidades.js';
import { CATEGORIES, CATEGORY_COLORS, TRANSACTION_TYPES } from './constantes.js';

const CENTER_VALUE_ANIMATION_MS = 700;

function getViewportWidth() {
  return window.innerWidth || document.documentElement.clientWidth || 1024;
}

function getViewportProfile() {
  const width = getViewportWidth();
  if (width <= 480) return 'mobile';
  if (width <= 900) return 'tablet';
  return 'desktop';
}

function getBalanceChartResponsiveOptions() {
  const profile = getViewportProfile();

  if (profile === 'mobile') {
    return {
      aspectRatio: 0.95,
      cutout: '74%',
      radius: '98%',
      layoutPadding: 3,
      legendFontSize: 13,
      legendPadding: 12
    };
  }

  if (profile === 'tablet') {
    return {
      aspectRatio: 1.45,
      cutout: '75%',
      radius: '90%',
      layoutPadding: 8,
      legendFontSize: 13,
      legendPadding: 14
    };
  }

  return {
    aspectRatio: 1.7,
    cutout: '76%',
    radius: '92%',
    layoutPadding: 8,
    legendFontSize: 15,
    legendPadding: 18
  };
}

function getCategoryChartResponsiveOptions() {
  const profile = getViewportProfile();

  if (profile === 'mobile') {
    return {
      aspectRatio: 0.95,
      cutout: '56%',
      radius: '98%',
      layoutPadding: 3,
      legendFontSize: 13,
      legendPadding: 12
    };
  }

  if (profile === 'tablet') {
    return {
      aspectRatio: 1.45,
      cutout: '60%',
      radius: '90%',
      layoutPadding: 8,
      legendFontSize: 12,
      legendPadding: 12
    };
  }

  return {
    aspectRatio: 1.7,
    cutout: '60%',
    radius: '92%',
    layoutPadding: 8,
    legendFontSize: 14,
    legendPadding: 14
  };
}

function applyBalanceChartResponsiveOptions(chart) {
  if (!chart) return;
  const options = getBalanceChartResponsiveOptions();

  chart.options.maintainAspectRatio = true;
  chart.options.aspectRatio = options.aspectRatio;
  chart.options.cutout = options.cutout;
  chart.options.radius = options.radius;
  chart.options.layout.padding = options.layoutPadding;
  chart.options.plugins.legend.labels.font = {
    size: options.legendFontSize,
    weight: 600
  };
  chart.options.plugins.legend.labels.padding = options.legendPadding;
}

function applyCategoryChartResponsiveOptions(chart) {
  if (!chart) return;
  const options = getCategoryChartResponsiveOptions();

  chart.options.maintainAspectRatio = true;
  chart.options.aspectRatio = options.aspectRatio;
  chart.options.cutout = options.cutout;
  chart.options.radius = options.radius;
  chart.options.layout.padding = options.layoutPadding;
  chart.options.plugins.legend.labels.font = {
    size: options.legendFontSize,
    weight: 600
  };
  chart.options.plugins.legend.labels.padding = options.legendPadding;
}

function getChartPalette() {
  const isLightTheme = document.documentElement.dataset.theme === 'light';

  return isLightTheme
    ? {
      availableColor: '#00b85d',
      expenseColor: '#ff355f',
      legendColor: '#1f2937',
      secondaryText: '#6b7280',
      emptyCenterText: '#111827',
      ringBorder: 'rgba(255, 255, 255, 0.9)',
      tooltipBg: '#ffffff',
      tooltipFg: '#111827'
    }
    : {
      availableColor: '#00e388',
      expenseColor: '#ff5174',
      legendColor: '#e5e7eb',
      secondaryText: '#b3bac8',
      emptyCenterText: '#ffffff',
      ringBorder: 'rgba(20, 24, 31, 0.9)',
      tooltipBg: '#1f2937',
      tooltipFg: '#f9fafb'
    };
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function prepareCenterValueAnimation(chart, targetCents) {
  const previous = Number.isFinite(chart.$displayedBalanceCents)
    ? chart.$displayedBalanceCents
    : targetCents;

  chart.$centerValueAnimation = {
    startCents: previous,
    targetCents,
    startTime: performance.now(),
    duration: CENTER_VALUE_ANIMATION_MS
  };
}

function getAnimatedBalanceCents(chart, fallbackTargetCents) {
  const animationState = chart.$centerValueAnimation;
  if (!animationState) {
    chart.$displayedBalanceCents = fallbackTargetCents;
    return fallbackTargetCents;
  }

  const elapsed = performance.now() - animationState.startTime;
  const rawProgress = elapsed / animationState.duration;
  const progress = Math.min(1, Math.max(0, rawProgress));
  const easedProgress = easeOutCubic(progress);
  const current = Math.round(
    animationState.startCents
    + ((animationState.targetCents - animationState.startCents) * easedProgress)
  );

  chart.$displayedBalanceCents = current;

  if (progress >= 1) {
    chart.$centerValueAnimation = null;
    return animationState.targetCents;
  }

  return current;
}

const balanceCenterTextPlugin = {
  id: 'balanceCenterText',
  afterDraw(chart, _args, options) {
    if (!chart?.chartArea || !options) return;

    const { ctx, chartArea } = chart;
    const arcElement = chart.getDatasetMeta(0)?.data?.[0];
    const innerRadius = arcElement?.innerRadius
      ?? Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top) * 0.3;
    const maxTextWidth = innerRadius * 1.75;
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;
    const hasData = Boolean(options.hasData);
    const targetBalanceCents = Number(options.balanceCents || 0);
    const balanceCents = getAnimatedBalanceCents(chart, targetBalanceCents);
    const expenseCents = Number(options.expenseCents || 0);
    const availableCents = Math.max(balanceCents, 0);
    const total = availableCents + expenseCents;
    const expensePercent = total > 0 ? Math.round((expenseCents / total) * 100) : 0;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const fitFontSize = (text, startSize, minSize, weight = 700) => {
      let size = startSize;
      while (size > minSize) {
        ctx.font = `${weight} ${size}px Inter, sans-serif`;
        if (ctx.measureText(text).width <= maxTextWidth) break;
        size -= 1;
      }
      return size;
    };

    if (!hasData) {
      const useTwoLines = innerRadius < 62;
      const emptyText = useTwoLines ? 'Sin\nmovimientos' : 'Sin movimientos';
      const emptyFontSize = fitFontSize(
        useTwoLines ? 'Sin movimientos' : emptyText,
        Math.round(innerRadius * 0.3),
        13,
        600
      );
      ctx.fillStyle = options.emptyCenterText || options.secondaryText;
      ctx.font = `600 ${emptyFontSize}px Inter, sans-serif`;
      if (useTwoLines) {
        const lineGap = Math.round(emptyFontSize * 1.05);
        ctx.fillText('Sin', centerX, centerY - (lineGap / 2));
        ctx.fillText('movimientos', centerX, centerY + (lineGap / 2));
      } else {
        ctx.fillText(emptyText, centerX, centerY - 1);
      }
      ctx.restore();
      return;
    }

    const balanceLabel = balanceCents < 0
      ? `-$${formatCents(balanceCents)}`
      : `$${formatCents(balanceCents)}`;
    const balanceFontSize = fitFontSize(balanceLabel, Math.round(innerRadius * 0.54), 14, 700);

    ctx.fillStyle = balanceCents >= 0 ? options.balanceColor : options.deficitColor;
    ctx.font = `700 ${balanceFontSize}px Inter, sans-serif`;
    ctx.fillText(balanceLabel, centerX, centerY - 13);

    const subtitleText = `Gastos ${expensePercent}%`;
    const subtitleFontSize = fitFontSize(
      subtitleText,
      Math.max(Math.round(balanceFontSize * 0.6), 13),
      13,
      500
    );
    ctx.fillStyle = options.secondaryText;
    ctx.font = `500 ${subtitleFontSize}px Inter, sans-serif`;
    ctx.fillText(subtitleText, centerX, centerY + Math.round(subtitleFontSize * 1.5));
    ctx.restore();
  }
};

function applyChartStyle(chart, totals) {
  const palette = getChartPalette();
  const dataset = chart.data.datasets[0];

  dataset.backgroundColor = [palette.availableColor, palette.expenseColor];
  dataset.borderColor = palette.ringBorder;
  dataset.borderWidth = 2;
  dataset.hoverBorderWidth = 2;

  chart.options.plugins.legend.labels.color = palette.legendColor;
  chart.options.plugins.tooltip.backgroundColor = palette.tooltipBg;
  chart.options.plugins.tooltip.titleColor = palette.tooltipFg;
  chart.options.plugins.tooltip.bodyColor = palette.tooltipFg;

  chart.options.plugins.balanceCenterText = {
    hasData: totals.incomeCents > 0 || totals.expenseCents > 0,
    balanceCents: totals.balanceCents,
    expenseCents: totals.expenseCents,
    secondaryText: palette.secondaryText,
    emptyCenterText: palette.emptyCenterText,
    balanceColor: palette.availableColor,
    deficitColor: '#ffad0a'
  };
}

export function initBalanceChart(canvas) {
  const context = canvas.getContext('2d');
  const responsive = getBalanceChartResponsiveOptions();

  return new Chart(context, {
    type: 'doughnut',
    plugins: [balanceCenterTextPlugin],
    data: {
      labels: ['Disponible', 'Gastos'],
      datasets: [{
        data: [1, 0],
        backgroundColor: ['#00e388', '#ff5174'],
        borderColor: 'rgba(0,0,0,0.1)',
        hoverOffset: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: responsive.aspectRatio,
      cutout: responsive.cutout,
      radius: responsive.radius,
      animation: {
        duration: 850,
        easing: 'easeOutQuart'
      },
      layout: {
        padding: responsive.layoutPadding
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'center',
          fullSize: false,
          labels: {
            font: { size: responsive.legendFontSize, weight: 600 },
            usePointStyle: true,
            pointStyle: 'circle',
            padding: responsive.legendPadding
          }
        },
        tooltip: {
          displayColors: false,
          callbacks: {
            label: (ctx) => {
              const total = ctx.dataset.data.reduce((acc, value) => acc + value, 0) || 1;
              const percent = ((ctx.raw / total) * 100).toFixed(2);
              return `${ctx.label}: $${formatCents(ctx.raw)} (${percent}%)`;
            }
          }
        },
        balanceCenterText: {}
      }
    }
  });
}

export function updateBalanceChart(chart, totals) {
  if (!chart) return;

  applyBalanceChartResponsiveOptions(chart);

  prepareCenterValueAnimation(chart, totals.balanceCents);

  const hasMovements = totals.incomeCents > 0 || totals.expenseCents > 0;
  if (!hasMovements) {
    chart.data.datasets[0].data = [1, 0];
    applyChartStyle(chart, totals);
    chart.update();
    return;
  }

  const availableCents = Math.max(totals.balanceCents, 0);
  chart.data.datasets[0].data = [availableCents, totals.expenseCents];
  applyChartStyle(chart, totals);
  chart.update();
}

function aggregateByCategory(transactions) {
  const map = {};
  transactions.forEach(tx => {
    if (tx.type !== TRANSACTION_TYPES.EXPENSE) return;
    const cat = tx.category || 'otros';
    map[cat] = (map[cat] || 0) + Math.abs(tx.amountCents);
  });
  return map;
}

export function initCategoryChart(canvas) {
  if (!canvas) return null;
  const context = canvas.getContext('2d');
  const palette = getChartPalette();
  const responsive = getCategoryChartResponsiveOptions();

  return new Chart(context, {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [],
        borderColor: palette.ringBorder,
        borderWidth: 2,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: responsive.aspectRatio,
      cutout: responsive.cutout,
      radius: responsive.radius,
      animation: {
        duration: 850,
        easing: 'easeOutQuart'
      },
      layout: { padding: responsive.layoutPadding },
      plugins: {
        legend: {
          position: 'top',
          align: 'center',
          labels: {
            font: { size: responsive.legendFontSize, weight: 600 },
            usePointStyle: true,
            pointStyle: 'circle',
            padding: responsive.legendPadding,
            color: palette.legendColor
          }
        },
        tooltip: {
          displayColors: true,
          callbacks: {
            label: (ctx) => {
              const total = ctx.dataset.data.reduce((a, v) => a + v, 0) || 1;
              const percent = ((ctx.raw / total) * 100).toFixed(1);
              return `${ctx.label}: $${formatCents(ctx.raw)} (${percent}%)`;
            }
          }
        }
      }
    }
  });
}

export function updateCategoryChart(chart, transactions) {
  if (!chart) return;

  applyCategoryChartResponsiveOptions(chart);

  const categoryTotals = aggregateByCategory(transactions);
  const entries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    chart.data.labels = ['Sin gastos'];
    chart.data.datasets[0].data = [1];
    chart.data.datasets[0].backgroundColor = ['#e5e7eb'];
    chart.update();
    return;
  }

  const palette = getChartPalette();
  const labels = entries.map(([cat]) => {
    const info = CATEGORIES.find(c => c.value === cat);
    return info ? `${info.icon} ${info.label}` : cat;
  });
  const data = entries.map(([, cents]) => cents);
  const colors = entries.map(([cat]) => CATEGORY_COLORS[cat] || '#c9cbcf');

  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.data.datasets[0].backgroundColor = colors;
  chart.data.datasets[0].borderColor = palette.ringBorder;
  chart.options.plugins.legend.labels.color = palette.legendColor;
  chart.options.plugins.tooltip.backgroundColor = palette.tooltipBg;
  chart.options.plugins.tooltip.titleColor = palette.tooltipFg;
  chart.options.plugins.tooltip.bodyColor = palette.tooltipFg;
  chart.update();
}

export function refreshChartsViewport(balanceChart, categoryChart) {
  if (balanceChart) {
    applyBalanceChartResponsiveOptions(balanceChart);
    balanceChart.update('none');
  }

  if (categoryChart) {
    applyCategoryChartResponsiveOptions(categoryChart);
    categoryChart.update('none');
  }
}

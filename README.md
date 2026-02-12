# 💰 Control Financiero Personal

Aplicación web para registrar ingresos y gastos, visualizar el balance en tiempo real y gestionar respaldo/restauración de datos en JSON.

## 🌐 Demo

- App en vivo: [Control Financiero](https://felipe-moreno-marciales.github.io/Finanzas_Personales/)

![Preview de la app Control Financiero](/Preview/preview.png)


## ✨ Funcionalidades principales

- Registro de movimientos con concepto, monto, tipo, categoría y fecha.
- Edición y eliminación de transacciones desde el historial.
- Resumen automático de presupuesto, gastos y disponible.
- Gráfico de balance general + gráfico de gastos por categoría.
- Modo claro/oscuro con persistencia en `localStorage`.
- Exportación de backup `.json` y restauración con validación.
- Interfaz responsiva y mejoras de accesibilidad (`aria-*`, foco visible).

## 🛠️ Stack

- HTML5
- CSS3
- JavaScript ES Modules
- Chart.js 4.4.1 (CDN)
- LocalStorage API

## 🧪 Validaciones clave

- Concepto obligatorio.
- Monto obligatorio y mayor a 0.
- Tipo válido: `presupuesto` o `gasto`.
- Categoría válida según catálogo.
- Fecha válida en formato `YYYY-MM-DD`.
- Soporte de montos como `1500`, `1.500,50` y `1500.25`.

## 📌 Requisitos

- Navegador moderno con soporte de ES Modules (Chrome, Edge, Firefox, Safari).
- Conexión a internet para cargar Chart.js desde CDN.
- Servidor local para ejecutar la app (recomendado evitar `file://`).
- Node.js y npm (si usarás `npx serve .`).

## 🚀 Ejecución local

No requiere build.

Con Node.js/npm:

```bash
npx serve .
```

Alternativa con Python:

```bash
python3 -m http.server 8000
```

Luego abre la app desde el servidor local.

## 🧱 Estructura

```text
Finanzas_Personales/
├── README.md
├── LICENSE
├── index.html
├── css/
│   └── estilos.css
├── js/
│   ├── aplicacion.js
│   ├── principal.js
│   ├── constantes.js
│   ├── almacenamiento.js
│   ├── utilidades.js
│   ├── transacciones.js
│   ├── interfaz.js
│   └── gestorGraficos.js
└── Preview/
	└── preview.png
```

## ⚠️ Limitaciones conocidas

- Los datos se guardan en `localStorage` del navegador actual.
- No hay autenticación de usuarios ni sincronización en la nube.
- El proyecto no incluye backend ni base de datos remota.

## 🛣️ Roadmap

- Filtros por rango de fechas y categoría.
- Métricas adicionales (promedios mensuales y tendencias).
- Mejoras de exportación de reportes.
- Optimización de experiencia móvil.

## 📄 Licencia

Este proyecto está bajo licencia **GNU GPL v3.0**. Revisa [LICENSE](LICENSE).

## 🤝 Soporte

Si encuentras un bug o quieres proponer mejoras, abre un [Issue](https://github.com/Felipe-Moreno-Marciales/Finanzas_Personales/issues).

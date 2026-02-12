# 💰 Control Financiero Personal

Aplicación web para registrar movimientos de finanzas personales, visualizar totales en tiempo real y mantener respaldo de datos con importación/exportación en JSON.

## 🌐 Demo

Enlace: [App en vivo](https://felipe-moreno-marciales.github.io/App_Web_finanzas_personales/)

<img width="1914" height="941" alt="Vista de la app" src="https://github.com/user-attachments/assets/5c423d27-1d29-4dd6-8ac8-acafc8b9c511" />

## ✨ Funcionalidades

- ✅ Alta de movimientos con `concepto`, `monto`, `tipo`, `categoría` y `fecha`.
- ✏️ Edición y eliminación de movimientos desde el historial.
- 📊 Resumen automático de `presupuesto`, `gastos` y `disponible`.
- 🍩 Gráfico principal de balance (dona) con texto/animación en el centro.
- 🧩 Gráfico de gastos por categoría.
- 🌗 Modo claro/oscuro con persistencia en `localStorage`.
- 💾 Backup (`.json`) y restauración de datos con validación.
- 🛡️ Validaciones de formulario y feedback visual (`aria-invalid` + mensaje de error).
- 📱 Soporte responsivo para escritorio, tablet y móvil.

## 🛠️ Stack técnico

- HTML5.
- CSS3 (variables de tema, layout adaptable y estilos de componentes).
- JavaScript ES Modules (arquitectura modular sin framework).
- Chart.js 4.4.1 vía CDN.
- LocalStorage API.

## 🚀 Ejecución local

No requiere build ni dependencias.

1. Clonar el repositorio.
2. Abrir la carpeta del proyecto.
3. Servir estáticos con cualquier servidor local.

Ejemplo con VS Code Live Server o con:

```bash
npx serve .
```

Abrir `index.html` desde el servidor local (no recomendado abrir con `file://` para evitar problemas con módulos ES).

## 🧱 Estructura del proyecto

```text
Finanzas_Personales/
├── index.html
├── css/
│   └── estilos.css
└── js/
    ├── aplicacion.js
    ├── principal.js
    ├── constantes.js
    ├── almacenamiento.js
    ├── utilidades.js
    ├── transacciones.js
    ├── interfaz.js
    └── gestorGraficos.js
```

## 🧠 Arquitectura de módulos

- `js/aplicacion.js`: punto de entrada, inicia la app al cargar el DOM.
- `js/principal.js`: orquestación general, estado en memoria, listeners, flujo CRUD, backup/restore y tema.
- `js/constantes.js`: enums, categorías, colores, claves de almacenamiento y versión de backup.
- `js/almacenamiento.js`: lectura/escritura en `localStorage` y compatibilidad con claves antiguas.
- `js/transacciones.js`: reglas de negocio, normalización y cálculo de totales.
- `js/interfaz.js`: renderizado del historial/resumen y utilidades de UI.
- `js/gestorGraficos.js`: creación/actualización de gráficos y plugin de texto central.
- `js/utilidades.js`: parseo/formateo de montos, fechas, orden y descarga de JSON.

## 📦 Modelo de datos

### 🧾 Transacción

```json
{
  "concept": "Salario",
  "type": "presupuesto",
  "amountCents": 250000,
  "date": "2026-02-08",
  "category": "salario"
}
```

- `amountCents` siempre se maneja en enteros.
- Ingresos se guardan positivos y gastos negativos.
- El historial se ordena por `date` descendente.

### 💾 Backup

```json
{
  "version": 4,
  "exportedAt": "2026-02-10T00:00:00.000Z",
  "transactions": []
}
```

- El import soporta tanto un array directo como un objeto con `transactions`.
- Si el backup o los datos locales no son válidos, la app evita cargar datos corruptos.

### 🔑 Claves de almacenamiento

- `finance_app:transactions`
- `finance_app:theme`

Compatibilidad heredada:

- `transactions`
- `theme`

## ✅ Reglas de validación implementadas

- `concept` obligatorio.
- `amount` obligatorio y mayor a 0.
- `type` válido: `presupuesto` o `gasto`.
- `category` obligatoria y dentro del catálogo definido.
- `date` en formato ISO `YYYY-MM-DD` válida.
- Soporte para montos como `1500`, `1.500,50`, `1500.25`.

## 🏷️ Categorías disponibles

`comida`, `entretenimiento`, `movilidad`, `vivienda`, `salud`, `educacion`, `ropa`, `servicios`, `ahorro`, `salario`, `freelance`, `otros`.

## ♿ UX y accesibilidad

- Etiquetas invisibles para lectores de pantalla (`.visually-hidden`).
- `aria-label` en botones de acción de historial.
- `aria-invalid` en campos con error.
- Mensajes dinámicos en `role="alert"` y `role="status"`.
- Envío rápido del formulario con tecla `Enter`.

## 🧪 Checklist de pruebas manuales

1. Crear un ingreso y un gasto y validar resumen + gráficos.
2. Editar un movimiento y confirmar que no se duplica.
3. Eliminar un movimiento y comprobar recálculo inmediato.
4. Probar formatos de monto (`1500`, `1.500,50`, `1500.25`).
5. Probar saldo negativo y ver mensaje de estado en gráfico.
6. Exportar backup y restaurarlo.
7. Intentar restaurar JSON inválido y confirmar manejo de error.
8. Cambiar tema, recargar y confirmar persistencia.
9. Navegar con teclado y validar foco visible en acciones.
10. Probar en móvil (<=900px y <=480px) para revisar layout responsivo.

## 📝 Notas

Proyecto frontend puro, sin backend ni base de datos remota. Si encuentras un bug o quieres proponer mejoras, puedes abrir un [Issue](https://github.com/Felipe-Moreno-Marciales/App_Web_finanzas_personales/issues).

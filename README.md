<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="logo-thiqa-dark.png">
    <img src="logo-thiqa.png" alt="thiqa — Control de Gastos de Obra" width="320">
  </picture>
</p>

<h1 align="center">Control de Gastos de Obra</h1>

<p align="center">
  Captura gastos de obra desde el celular: foto del comprobante, lectura con OCR y sincronización con el maestro en Google Sheets.
</p>

<p align="center">
  <a href="https://eliasgaribi-ctrl-z.github.io/thiqa-gastos-obra/"><b>▶ Abrir la app</b></a>
</p>

---

## Qué hace

- **Captura por foto** — se fotografía el ticket o factura, el OCR propone monto, fecha y proveedor, y solo se revisa antes de guardar. Sirve sin señal: el gasto queda guardado en el celular y se sincroniza cuando vuelve el internet.
- **Sincronización con el maestro** — cada gasto se escribe en la pestaña de su obra dentro del Google Sheets maestro, y la foto del comprobante se sube a la carpeta de esa obra en Google Drive. Si se reintenta un envío no se duplica.
- **Organización por obra** — la app trae el catálogo de obras, conceptos, pagadores y formas de pago desde el propio maestro, así todos capturan con las mismas listas.
- **Exportar** — genera un Excel con los gastos y un ZIP con los comprobantes, por si se quiere trabajar fuera de línea.

## Uso

Todo corre en el navegador, sin instalar nada. Desde el celular conviene abrir la liga y agregarla a la pantalla de inicio (Chrome → menú → *Agregar a pantalla principal*) para que quede como aplicación.

Los gastos capturados se guardan localmente en cada dispositivo y se sincronizan con el maestro cuando hay conexión. Para conectar un dispositivo con el maestro se usan tres datos: la URL de la aplicación web, la clave compartida y el nombre de quien captura. Los pasos completos están en **Conectar con Google Sheets.md**.

## Actualizar la versión publicada

El sitio se sirve desde `index.html` en la rama `main`. Para publicar cambios:

1. Renombrar el HTML nuevo a **`index.html`**.
2. Subirlo en [/upload/main](https://github.com/eliasgaribi-ctrl-z/thiqa-gastos-obra/upload/main) y hacer commit a `main`.
3. Esperar entre 30 y 60 segundos a que GitHub Pages redespliegue.

Si el celular sigue mostrando la versión anterior, es la caché: recargar forzando o abrir la liga con `?v=2` al final.

## Archivos

- **`index.html`** — la app completa, en un solo archivo.
- **`Codigo.gs`** — el backend de Google Apps Script que va dentro del Sheets maestro.
- **`Conectar con Google Sheets.md`** — guía paso a paso para conectar la app con el maestro.

---

<p align="center"><sub>thiqa · Grupo Inmobiliario · Guadalajara, Jalisco</sub></p>

# Conectar la app con el maestro de Google Sheets

Todo esto se hace **una sola vez**, desde la cuenta de **rematesthiqa**. Son unos 15 minutos.

Cuando termines, cada gasto que capture Luis en su celular va a aparecer solo en la pestaña de su obra, y la foto del recibo va a quedar guardada en la carpeta de Drive de esa misma obra, con el link en la columna que ya usan.

---

## Antes de empezar

Ten a la mano el archivo `Control De Gastos De Obra - (Espejo).xlsx`, el que ya usan hoy.

---

## Paso 1 · Sube el Excel a Drive y conviértelo en Sheets

1. Entra a `drive.google.com` con la cuenta **rematesthiqa**.
2. Arrastra el `.xlsx` a Drive.
3. Click derecho sobre el archivo → **Abrir con** → **Hojas de cálculo de Google**.
4. En el menú: **Archivo** → **Guardar como Hojas de cálculo de Google**.
5. Renómbralo a **Maestro Gastos de Obra**.

Ya quedaron las 17 pestañas (SENDERO REAL, LIMÓN, VIATICOS…) con todo el histórico que ya tenían. El `.xlsx` original déjalo ahí como respaldo.

> **Ojo:** de aquí en adelante el maestro es el de Sheets. Si alguien sigue editando el Excel viejo, se van a separar los datos.

---

## Paso 2 · Crea la carpeta de comprobantes

1. En Drive, botón **Nuevo** → **Carpeta nueva** → nómbrala **Comprobantes de Obra**.
2. Ábrela y copia el **ID de la carpeta** de la barra de direcciones. Es lo que va después de `folders/`:

```
https://drive.google.com/drive/folders/1a2B3cD4eF5gH6iJ7kL8mN9oP
                                        └──────── esto ────────┘
```

No hace falta que crees las carpetas de cada obra: el script las va creando solo conforme lleguen recibos.

---

## Paso 3 · Pega el script

1. Abre el **Maestro Gastos de Obra** en Sheets.
2. Menú **Extensiones** → **Apps Script**.
3. Borra lo que traiga el editor y pega **todo** el contenido de `Codigo.gs`.
4. Hasta arriba del archivo, cambia estas dos líneas:

```javascript
var CLAVE = 'CAMBIA-ESTA-CLAVE';
var CARPETA_RAIZ = 'PEGA-AQUI-EL-ID-DE-LA-CARPETA';
```

- **CLAVE**: invéntate una. Algo como `thiqa-obra-2026-x7k2`. Que no sea una contraseña que uses en otro lado.
- **CARPETA_RAIZ**: el ID que copiaste en el paso 2.

5. Guarda con el ícono de disquete.

---

## Paso 4 · Autoriza los permisos

1. Arriba del editor hay un menú que dice *Función*. Elige **probar**.
2. Click en **Ejecutar**.
3. Google te va a pedir permisos:
   - **Revisar permisos** → elige la cuenta **rematesthiqa**
   - Va a aparecer *"Google no ha verificado esta aplicación"*. Es normal: la app la estás haciendo tú. Click en **Configuración avanzada** → **Ir a Maestro Gastos de Obra (no seguro)**
   - **Permitir**
4. Abajo se abre el registro de ejecución. Si dice el nombre del maestro y el de la carpeta, quedó bien. Si dice *"no pude abrir la carpeta"*, revisa el ID del paso 2.

---

## Paso 5 · Publica la aplicación web

1. Arriba a la derecha: **Implementar** → **Nueva implementación**.
2. En el engrane, elige **Aplicación web**.
3. Llénalo así:

| Campo | Qué poner |
|---|---|
| Descripción | `Maestro de gastos v1` |
| Ejecutar como | **Yo (rematesthiqa@…)** |
| Quién tiene acceso | **Cualquier usuario** |

> "Cualquier usuario" suena a que se abre al mundo, pero no: sin la CLAVE nadie puede escribir nada. Tiene que estar así para que la app pueda mandar datos desde el celular sin obligar a iniciar sesión de Google, que es lo que la deja funcionar con mala señal.

4. **Implementar**.
5. Copia la **URL de la aplicación web**. Termina en `/exec`:

```
https://script.google.com/macros/s/AKfycb…muy-larga…/exec
```

---

## Paso 6 · Conecta la app

1. Abre `Gastos de Obra.html`.
2. Ve a **Exportar** (menú de la izquierda).
3. En la tarjeta **Maestro en Google Sheets**, llena:
   - **URL de la aplicación web**: la del paso 5
   - **Clave compartida**: la que inventaste en el paso 3
   - **¿Quién captura en este equipo?**: `Luis`, `Elías`, quien use ese celular
   - **Envío automático**: *Sí, subir en cuanto guardo*
4. Click en **Probar conexión**.

Si todo quedó bien, sale un aviso: *Conectado a "Maestro Gastos de Obra" · 17 obras · carpeta Comprobantes de Obra*.

5. Click en **Traer catálogos del maestro**. La primera vez crea una pestaña `_Catálogos` con tus obras, proveedores y conceptos actuales.

---

## Paso 7 · Repite el paso 6 en cada equipo

Manda el mismo archivo `Gastos de Obra.html` a cada persona (WhatsApp, Drive, correo) y que cada quien haga el paso 6 en su celular, **cambiando solo el nombre de quien captura**. La URL y la clave son las mismas para todos.

---

# Cómo queda trabajando

**Luis en obra:** toma la foto, la app lee el recibo, revisa y guarda. Si hay señal se sube solo. Si no, se queda en *Pendiente* y se manda cuando vuelva la red — no tiene que hacer nada.

**La arquitecta en Sheets:** ve las filas llegar a la pestaña de cada obra. En la columna *Comprobante Digital* hay un link que abre la foto en Drive. Si edita la pestaña `_Catálogos` (agrega una obra, un proveedor), esos cambios llegan a la app cuando cada quien pique *Traer catálogos del maestro*.

**Tú:** en *Exportar* sigues teniendo el Excel y el ZIP para lo que necesites entregar aparte.

---

# Cosas que conviene saber

**Los reintentos no duplican.** Cada gasto lleva un ID interno. Si se manda dos veces, el script actualiza la fila en lugar de crear otra. Lo mismo si editas un gasto ya subido: corrige la fila que ya existía.

**Hay una columna nueva al final.** Se llama `ID App` y es la que permite lo anterior. Puedes ocultarla (click derecho en la columna → Ocultar) pero **no la borres**. Junto a ella está `Capturado por`, que dice quién registró cada gasto.

**Cambiar la clave.** Si sale del equipo alguien que tenía la app: cambia `CLAVE` en el script, vuelve a implementar (**Implementar** → **Administrar implementaciones** → editar → **Nueva versión**), y pasa la clave nueva solo a quien sigue.

**El historial te cubre.** Sheets guarda todo en *Archivo* → *Historial de versiones*. Si algo se borra o se altera por error, se puede regresar.

**Respaldo.** Aunque esté conectado, de vez en cuando pica *Guardar respaldo (.json)* en Exportar. Es el seguro por si alguien borra el Sheets.

---

# Si algo falla

| Lo que ves | Qué pasó |
|---|---|
| *Clave incorrecta* | La clave de la app no es igual a la del script. Revisa mayúsculas y espacios. |
| *Sin conexión con el maestro* | No hay señal. No se pierde nada: queda pendiente y se manda solo cuando vuelva. |
| *El maestro respondió 401 / 403* | En el paso 5 quedó *Quién tiene acceso* en algo distinto de "Cualquier usuario". Corrígelo y vuelve a implementar. |
| *No pude abrir la carpeta* | El ID de `CARPETA_RAIZ` está mal, o la carpeta no es de rematesthiqa. |
| Cambié el script y no pasa nada | Los cambios no salen en vivo. Hay que **Implementar** → **Administrar implementaciones** → editar → **Nueva versión**. |
| Las filas llegan pero sin foto | Revisa que el gasto tenga foto adjunta y que la carpeta raíz exista. |

---

# Lo que sigue faltando

Con esto quedan resueltos los datos compartidos, los permisos y el respaldo. Sigue pendiente una cosa:

**La API key de Claude Vision está expuesta.** Si van a usar Claude Vision, hoy la key se guarda en cada navegador y cualquiera con acceso al equipo la puede sacar. La solución es agregar al mismo Apps Script una función que guarde la key del lado del servidor y que la app le pegue ahí en lugar de ir directo a Anthropic. Es media hora de trabajo cuando lo quieras hacer.

Si por ahora usan solo el OCR del navegador (que es gratis y no necesita key), esto no aplica.

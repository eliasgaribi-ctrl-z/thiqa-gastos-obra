/**
 * ============================================================================
 *  thiqa · Maestro de gastos de obra
 *  Recibe los gastos que manda la app, los escribe en la pestaña de su obra
 *  y sube la foto del comprobante a la carpeta de Drive de esa misma obra.
 *
 *  Se pega en: Extensiones › Apps Script, dentro del Google Sheets maestro.
 *  Se publica en: Implementar › Nueva implementación › Aplicación web.
 * ============================================================================
 */

/* --------------------------- CONFIGURACIÓN --------------------------- */

/** Clave compartida. Cámbiala por una tuya y ponla igual en la app. */
var CLAVE = 'CAMBIA-ESTA-CLAVE';

/** ID de la carpeta raíz en el Drive de rematesthiqa donde van los
 *  comprobantes. Se saca de la URL de la carpeta:
 *  drive.google.com/drive/folders/ESTO_ES_EL_ID            */
var CARPETA_RAIZ = 'PEGA-AQUI-EL-ID-DE-LA-CARPETA';

/** Encabezados del maestro. Son los mismos 13 del Excel de la dirección,
 *  más una columna de control al final que puedes ocultar. */
var COLS = [
  'ID Operación', 'Concepto del Gasto', 'Descripción Detallada',
  'Fecha limite de Gasto', 'Monto ($)', 'Pagado por (interno)',
  'Pagado a (externo)', 'Forma de Pago', 'Linea de pago',
  'Comprobante Digital (link Drive)', 'Autorizado por', 'Estatus',
  'Comentario', 'Capturado por', 'ID App'
];
var COL_ID_APP = COLS.length;          // última columna, 1-based
var HOJA_CATALOGOS = '_Catálogos';

/* ------------------------------ ENTRADA ------------------------------ */

function doPost(e) {
  var r;
  try {
    var p = JSON.parse(e.postData.contents);
    if (p.clave !== CLAVE) throw new Error('Clave incorrecta. Revisa la configuración de la app.');

    if (p.accion === 'ping')            r = ping();
    else if (p.accion === 'push')       r = push(p.gastos || []);
    else if (p.accion === 'catalogos')  r = leerCatalogos();
    else if (p.accion === 'sembrar')    r = sembrarCatalogos(p.catalogos || {});
    else throw new Error('Acción desconocida: ' + p.accion);

    r.ok = true;
  } catch (err) {
    r = { ok: false, error: String(err && err.message || err) };
  }
  return ContentService
    .createTextOutput(JSON.stringify(r))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Permite abrir la URL en el navegador para comprobar que quedó publicada. */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, mensaje: 'Maestro de gastos thiqa en línea.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ------------------------------ ACCIONES ------------------------------ */

function ping() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojas = ss.getSheets().map(function (h) { return h.getName(); })
    .filter(function (n) { return n.charAt(0) !== '_'; });
  var carpeta = '';
  try { carpeta = DriveApp.getFolderById(CARPETA_RAIZ).getName(); }
  catch (e) { carpeta = '(no pude abrir la carpeta: revisa CARPETA_RAIZ)'; }
  return { maestro: ss.getName(), obras: hojas, carpeta: carpeta };
}

/**
 * Escribe los gastos. Si un gasto ya existe (mismo ID App) lo actualiza en
 * lugar de duplicarlo, así se puede reintentar sin miedo.
 */
function push(gastos) {
  var res = [];
  for (var i = 0; i < gastos.length; i++) {
    var g = gastos[i];
    try {
      var hoja = hojaDeObra(g.obra);
      var link = g.link || '';

      // 1. la foto va a la carpeta de la obra
      if (g.foto && g.foto.base64) {
        link = subirFoto(g.obra, g.foto.nombre, g.foto.base64);
      }

      // 2. la fila
      var fila = [
        g.id_operacion || '',
        g.concepto || '',
        g.descripcion || '',
        g.fecha ? new Date(g.fecha + 'T12:00:00') : 'NA',
        Number(g.monto) || 0,
        g.pagado_por || '',
        g.pagado_a || '',
        g.forma_pago || '',
        g.linea_pago || '-',
        link || g.comprobante || '',
        g.autorizado_por || '',
        g.estatus || '',
        g.comentario || '',
        g.capturado_por || '',
        g.rid || ''
      ];

      var r = filaDeId(hoja, g.rid);
      if (r > 0) {
        hoja.getRange(r, 1, 1, COLS.length).setValues([fila]);
      } else {
        hoja.appendRow(fila);
        r = hoja.getLastRow();
      }
      formatoFila(hoja, r);

      res.push({ rid: g.rid, ok: true, fila: r, link: link, hoja: hoja.getName() });
    } catch (err) {
      res.push({ rid: g.rid, ok: false, error: String(err && err.message || err) });
    }
  }
  return { resultados: res };
}

/** La arquitecta manda en el Sheets: la app lee de aquí sus listas. */
function leerCatalogos() {
  var h = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_CATALOGOS);
  if (!h) return { catalogos: null };
  var v = h.getDataRange().getValues();
  var col = function (n) {
    var c = v[0].indexOf(n);
    if (c < 0) return [];
    var out = [];
    for (var i = 1; i < v.length; i++) {
      var x = String(v[i][c] || '').trim();
      if (x) out.push(x);
    }
    return out;
  };
  var obras = [], nom = col('Obra'), ids = col('ID Operación');
  for (var i = 0; i < nom.length; i++) obras.push({ nombre: nom[i], id: ids[i] || '' });
  return {
    catalogos: {
      obras: obras,
      conceptos: col('Concepto'),
      pagadores: col('Pagado por'),
      formas: col('Forma de pago'),
      proveedores: col('Proveedor')
    }
  };
}

/** Crea la hoja de catálogos la primera vez, con lo que ya trae la app. */
function sembrarCatalogos(c) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var h = ss.getSheetByName(HOJA_CATALOGOS) || ss.insertSheet(HOJA_CATALOGOS);
  h.clear();
  var cab = ['Obra', 'ID Operación', 'Concepto', 'Pagado por', 'Forma de pago', 'Proveedor'];
  var obras = c.obras || [];
  var n = Math.max(obras.length, (c.conceptos || []).length, (c.pagadores || []).length,
                   (c.formas || []).length, (c.proveedores || []).length);
  var datos = [cab];
  for (var i = 0; i < n; i++) {
    datos.push([
      obras[i] ? obras[i].nombre : '',
      obras[i] ? obras[i].id : '',
      (c.conceptos || [])[i] || '',
      (c.pagadores || [])[i] || '',
      (c.formas || [])[i] || '',
      (c.proveedores || [])[i] || ''
    ]);
  }
  h.getRange(1, 1, datos.length, cab.length).setValues(datos);
  h.getRange(1, 1, 1, cab.length).setFontWeight('bold').setBackground('#F7F9FB');
  h.setFrozenRows(1);
  return { sembrado: datos.length - 1 };
}

/* ------------------------------ AYUDANTES ------------------------------ */

/** Devuelve la pestaña de la obra; si no existe la crea con los encabezados. */
function hojaDeObra(obra) {
  var nombre = String(obra || 'SIN OBRA').substring(0, 99);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var h = ss.getSheetByName(nombre);
  if (!h) {
    h = ss.insertSheet(nombre);
    h.getRange(1, 1, 1, COLS.length).setValues([COLS]);
  }
  // si la hoja venía del Excel viejo y le faltan las 2 columnas de control
  if (h.getLastRow() === 0) {
    h.getRange(1, 1, 1, COLS.length).setValues([COLS]);
  } else {
    var cab = h.getRange(1, 1, 1, Math.max(h.getLastColumn(), COLS.length)).getValues()[0];
    if (String(cab[COL_ID_APP - 1] || '') !== 'ID App') {
      h.getRange(1, COLS.length - 1, 1, 2).setValues([['Capturado por', 'ID App']]);
    }
  }
  h.getRange(1, 1, 1, COLS.length).setFontWeight('bold').setBackground('#F7F9FB');
  h.setFrozenRows(1);
  return h;
}

/** Busca una fila por el ID que genera la app. 0 si no existe. */
function filaDeId(hoja, rid) {
  if (!rid) return 0;
  var n = hoja.getLastRow();
  if (n < 2) return 0;
  var v = hoja.getRange(2, COL_ID_APP, n - 1, 1).getValues();
  for (var i = 0; i < v.length; i++) {
    if (String(v[i][0]) === String(rid)) return i + 2;
  }
  return 0;
}

function formatoFila(hoja, r) {
  hoja.getRange(r, 4).setNumberFormat('dd/mm/yyyy');
  hoja.getRange(r, 5).setNumberFormat('$#,##0.00');
}

/** Sube la foto a Drive, dentro de la carpeta de su obra, y regresa el link. */
function subirFoto(obra, nombre, base64) {
  var raiz = DriveApp.getFolderById(CARPETA_RAIZ);
  var sub = carpetaDeObra(raiz, etiquetaObra(obra));
  var blob = Utilities.newBlob(Utilities.base64Decode(base64), 'image/jpeg', (nombre || 'comprobante') + '.jpg');

  // si ya se había subido con ese nombre, se reemplaza en vez de duplicar
  var iguales = sub.getFilesByName(blob.getName());
  while (iguales.hasNext()) iguales.next().setTrashed(true);

  var f = sub.createFile(blob);
  f.setDescription('Comprobante de gasto · ' + obra);
  return f.getUrl();
}

function carpetaDeObra(raiz, nombre) {
  var it = raiz.getFoldersByName(nombre);
  return it.hasNext() ? it.next() : raiz.createFolder(nombre);
}

/** Misma convención que usa la app y que ya venía en el Excel. */
function etiquetaObra(obra) {
  var o = String(obra || '').toUpperCase().trim();
  if (!o) return 'SIN OBRA';
  if (/^(VIATICOS|VIÁTICOS|TICKETS DIGITALES|DIGITAL)/.test(o)) return o;
  return 'CASA ' + o;
}

/* --------------------------- PARA PROBAR A MANO --------------------------- */

/** Córrela una vez desde el editor para autorizar los permisos y ver que
 *  la carpeta y el maestro estén bien configurados. */
function probar() {
  var r = ping();
  Logger.log(JSON.stringify(r, null, 2));
  return r;
}

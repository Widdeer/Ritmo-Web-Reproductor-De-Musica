/* ============================================================
   router.js — decide qué vista mostrar según el #hash de la URL
   (#inicio, #playlist, #subir, #buscar/algo ...)

   Cada vista (js/vistas/*.js) exporta un objeto con estas partes, todas opcionales:
     plantilla : ruta de un archivo .html (carpeta views/) con el contenido
     html(arg, plantilla) : devuelve el HTML (puede ser dinámico); si no existe se usa la plantilla tal cual
     montar(contenedor, arg, { render }) : se llama cuando el HTML ya está en pantalla,
                                           para conectar botones y formularios
   ============================================================ */
import { $, $$ } from './core/utils.js';
import { pintarIconos } from './core/iconos.js';
import { note } from './core/componentes.js';

import inicio from './vistas/inicio.js';
import buscar from './vistas/buscar.js';
import playlist from './vistas/playlist.js';
import guardados from './vistas/guardados.js';
import descargados from './vistas/descargados.js';
import subir from './vistas/subir.js';
import config from './vistas/config.js';

// Nombre en el hash -> vista
const VISTAS = { inicio, buscar, playlist, guardados, descargados, subir, config };

// Descarga el HTML de una plantilla (siempre la versión más nueva)
async function cargarPlantilla(ruta) {
  try {
    const r = await fetch(ruta, { cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    return await r.text();
  } catch {
    return note('No se pudo cargar esta pantalla', 'Revisá que el servidor esté corriendo (<code>python server.py</code>).');
  }
}

let rt = 0;   // número de la última navegación: sirve para ignorar respuestas viejas

// Dibuja la vista que corresponde al hash actual
export async function render() {
  const id = ++rt, [v, a] = location.hash.slice(1).split('/');
  const name = Object.hasOwn(VISTAS, v) ? v : 'inicio', vista = VISTAS[name], view = $('#view');
  const arg = decodeURIComponent(a || '');

  // marca el enlace activo del menú lateral
  $$('[data-v]').forEach(x => x.classList.toggle('on', x.dataset.v === name));
  view.innerHTML = '<p class="mut">Cargando…</p>';

  let h = vista.plantilla ? await cargarPlantilla(vista.plantilla) : '';
  if (vista.html) h = await vista.html(arg, h);
  if (id !== rt) return;   // el usuario ya fue a otra vista

  view.innerHTML = h;
  pintarIconos(view);
  if (vista.montar) vista.montar(view, arg, { render });
}

export function initRouter() {
  addEventListener('hashchange', render);
}

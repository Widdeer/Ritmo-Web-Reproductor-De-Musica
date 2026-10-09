/* ============================================================
   acciones.js — lo que se puede hacer con una tarjeta de canción:
   tocarla, guardarla con el corazón o agregarla a una playlist.
   Los clics se atienden acá, en un solo lugar, porque las tarjetas
   aparecen en muchas vistas (Inicio, Buscar, Guardados, Playlist).
   ============================================================ */
import { $, $$, esc, toast } from './core/utils.js';
import { DB, save } from './core/datos.js';
import { T } from './core/biblioteca.js';
import { play } from './reproductor.js';
import { abrir } from './ampliado.js';

let renderVista = () => {};   // función del router para redibujar la vista actual

// Guarda o quita una canción de "Guardados"
function toggleSave(t, a) {
  const i = DB.saved.findIndex(x => x.id === t.id);
  i < 0 ? DB.saved.unshift(t) : DB.saved.splice(i, 1);
  save(); a.setAttribute('aria-pressed', i < 0);
  if (location.hash === '#guardados') renderVista();
}

// Ventana para elegir (o crear) la playlist donde agregar la canción
function pick(t) {
  const dlg = $('#dlg'), n = Object.keys(DB.lists);
  dlg.innerHTML = `<h2>Agregar a playlist</h2>${n.map(k => `<button class="btn ghost" value="${esc(k)}">${esc(k)}</button>`).join('')}<div class="nl"><input id="dn" placeholder="Nueva playlist" aria-label="Nueva playlist"><button class="btn" value="__new">Crear y agregar</button></div><button class="lnk" value="">Cancelar</button>`;
  dlg.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    let k = b.value; if (k === '__new') k = $('#dn').value.trim();
    if (k) { DB.lists[k] = DB.lists[k] || []; if (!DB.lists[k].some(x => x.id === t.id)) DB.lists[k].push(t); save(); toast('Agregada a ' + k); }
    dlg.close();
  };
  dlg.showModal();
}

// `render` es la función del router; se pasa desde main.js
export function initAcciones(render) {
  renderVista = render;
  // Delegación de eventos: un solo oyente en #view para todas las tarjetas
  $('#view').addEventListener('click', e => {
    const c = e.target.closest('.card'); if (!c) return;
    const t = T[c.dataset.id], a = e.target.closest('[data-a]');
    if (a) return a.dataset.a === 'save' ? toggleSave(t, a) : pick(t);
    // clic en la tarjeta: se reproduce, la cola es el resto de tarjetas del mismo grupo
    // y se abre directo el panel grande
    play(t, $$('.card', c.parentNode).map(x => x.dataset.id));
    abrir(true);
  });
}

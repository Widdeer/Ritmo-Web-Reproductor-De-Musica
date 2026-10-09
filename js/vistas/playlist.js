/* ============================================================
   Vista "Playlist" (#playlist)
   Crear playlists, ver sus canciones y eliminarlas.
   ============================================================ */
import { $, $$, esc } from '../core/utils.js';
import { DB, save } from '../core/datos.js';
import { grid, note } from '../core/componentes.js';

export default {
  html() {
    const n = Object.keys(DB.lists);
    return `<h1>Playlists</h1><form class="nl" data-do="newform"><input id="nn" placeholder="Nombre de la playlist" aria-label="Nombre de la playlist"><button class="btn">Crear</button></form>` +
      (n.length ? n.map(k => `<div class="pl-h"><h2>${esc(k)}</h2><button class="lnk" data-do="del" data-n="${esc(k)}">Eliminar</button></div>` + (DB.lists[k].length ? grid(DB.lists[k]) : '<p class="mut">Vacía. Usá + en una canción para agregarla.</p>')).join('') : note('Todavía no tenés playlists', 'Creá una arriba y sumale canciones.'));
  },

  // Conecta el formulario de "Crear" y los botones "Eliminar"
  montar(cont, arg, { render }) {
    $('[data-do=newform]', cont).addEventListener('submit', e => {
      e.preventDefault();
      const n = $('#nn').value.trim();
      if (n && !DB.lists[n]) { DB.lists[n] = []; save(); render(); }
    });
    $$('[data-do=del]', cont).forEach(b => b.onclick = () => { delete DB.lists[b.dataset.n]; save(); render(); });
  }
};

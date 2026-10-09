/* ============================================================
   Vista "Configuración" (#config)
   Recargar la biblioteca y borrar tus datos.
   ============================================================ */
import { $, toast } from '../core/utils.js';
import { DB, save } from '../core/datos.js';
import { LIB, loadLib } from '../core/biblioteca.js';

export default {
  html() {
    return `<h1>Configuración</h1><h2>Biblioteca</h2><p class="mut">${LIB ? LIB.length + ' archivos encontrados.' : 'Todavía no se generó la biblioteca.'} Guardá tus archivos en <code>content/Musica</code> y <code>content/Video</code> y tocá “Recargar biblioteca”. Si querés una imagen para un tema o video, poné un .jpg o .png con el mismo nombre al lado del archivo.</p><button class="btn" data-do="reload">Recargar biblioteca</button><h2>Tus datos</h2><button class="btn ghost" data-do="clrtaste">Reiniciar mis gustos</button> <button class="btn ghost" data-do="clrall">Borrar todo</button>`;
  },

  // Conecta los tres botones
  montar(cont, arg, { render }) {
    $('[data-do=reload]', cont).onclick = async () => { await loadLib(); render(); toast('Biblioteca recargada'); };
    $('[data-do=clrtaste]', cont).onclick = () => { DB.tastes = {}; DB.recent = []; save(); toast('Gustos reiniciados'); };
    $('[data-do=clrall]', cont).onclick = () => {
      if (confirm('Se borran gustos, guardados, playlists y el Client ID.')) {
        localStorage.removeItem('ritmo'); sessionStorage.clear(); location.hash = ''; location.reload();
      }
    };
  }
};

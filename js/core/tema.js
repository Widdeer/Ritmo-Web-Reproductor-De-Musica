/* ============================================================
   tema.js — botón sol/luna: cambia entre tema oscuro y claro
   ============================================================ */
import { $ } from './utils.js';
import { DB, save } from './datos.js';

// Pone el tema guardado en <html data-theme="...">
const aplicar = () => { document.documentElement.dataset.theme = DB.theme; };

export function initTema() {
  aplicar();
  $('#theme').onclick = e => {
    DB.theme = DB.theme === 'dark' ? 'light' : 'dark'; save(); aplicar();
    // reinicia la animación de giro del ícono
    const b = e.currentTarget; b.classList.remove('spin'); void b.offsetWidth; b.classList.add('spin');
  };
}

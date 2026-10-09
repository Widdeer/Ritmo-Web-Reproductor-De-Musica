/* ============================================================
   buscador.js — la barra de búsqueda de arriba:
   al enviar, navega a #buscar/<texto>
   ============================================================ */
import { $ } from './core/utils.js';

export function initBuscador() {
  $('#sf').onsubmit = e => {
    e.preventDefault();
    const q = $('#q').value.trim();
    if (q) location.hash = 'buscar/' + encodeURIComponent(q);
  };
}

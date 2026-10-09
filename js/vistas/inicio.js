/* ============================================================
   Vista "Inicio" (#inicio)
   Recomendaciones: lo escuchado hace poco, más de tus artistas favoritos,
   toda tu música y los temas con video.
   ============================================================ */
import { esc } from '../core/utils.js';
import { DB } from '../core/datos.js';
import { LIB } from '../core/biblioteca.js';
import { row, note, empty } from '../core/componentes.js';

export default {
  html() {
    if (!LIB) return empty;
    if (!LIB.length) return note('Tu biblioteca está vacía', 'Copiá archivos a content/Musica y content/Video y recargá la biblioteca.');
    // los 2 artistas más escuchados que existen en la biblioteca
    const top = Object.entries(DB.tastes).filter(([k]) => LIB.some(t => t.ch === k)).sort((a, b) => b[1] - a[1]).slice(0, 2).map(e => e[0]);
    let h = '<h1>Hecho para vos</h1>';
    if (DB.recent.length) h += row('Escuchado hace poco', DB.recent.slice(0, 6));
    top.forEach(k => h += row(`Porque escuchás ${esc(k)}`, LIB.filter(t => t.ch === k).slice(0, 12)));
    const m = LIB, v = LIB.filter(t => t.vsrc);
    if (m.length) h += row('Tu música', m.slice(0, 24));
    if (v.length) h += row('Con video', v.slice(0, 24));
    return h;
  }
};

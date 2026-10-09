/* ============================================================
   Vista "Buscar" (#buscar/lo-que-escribiste)
   Busca por título o artista, sin importar mayúsculas ni tildes.
   ============================================================ */
import { esc } from '../core/utils.js';
import { LIB } from '../core/biblioteca.js';
import { grid, note, empty } from '../core/componentes.js';

export default {
  html(q) {
    if (!LIB) return empty;
    // quita tildes y pasa a minúsculas para comparar
    const n = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(), k = n(q);
    const l = LIB.filter(t => n(t.title + ' ' + t.ch).includes(k));
    return `<h1>Resultados para “${esc(q)}”</h1>` + (l.length ? grid(l) : note('Sin resultados', 'Probá con otro título o artista.'));
  }
};

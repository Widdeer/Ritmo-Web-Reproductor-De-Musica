/* ============================================================
   Vista "Guardados" (#guardados)
   Las canciones a las que les diste corazón.
   ============================================================ */
import { DB } from '../core/datos.js';
import { grid, note } from '../core/componentes.js';

export default {
  html() {
    return '<h1>Guardados</h1>' + (DB.saved.length ? grid(DB.saved) : note('Nada guardado todavía', 'Tocá el corazón en cualquier canción.'));
  }
};

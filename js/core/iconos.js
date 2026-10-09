/* ============================================================
   iconos.js — todos los íconos de la app (SVG dibujados a mano)
   ============================================================ */
import { $$ } from './utils.js';

// Envuelve el dibujo en un <svg> de 24x24
const S = p => `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;

export const I = {
  home: S('<path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/>'),
  list: S('<path d="M4 6h12M4 12h8M4 18h8M17 9v8"/><circle cx="15" cy="17" r="2"/>'),
  heart: S('<path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z"/>'),
  down: S('<path d="M12 3v12M7 11l5 5 5-5M4 21h16"/>'),
  plus: S('<path d="M12 5v14M5 12h14"/>'),
  check: S('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  moon: S('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),
  sun: S('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  gear: S('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>'),
  play: S('<path d="M7 4v16l13-8z"/>'),
  pause: S('<path d="M7 4h4v16H7zM13 4h4v16h-4z"/>'),
  next: S('<path d="M5 4l10 8-10 8zM19 5v14"/>'),
  vol: S('<path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>'),
  chev: S('<path d="M6 9l6 6 6-6"/>'),
  expand: S('<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>'),
  prev: S('<path d="M19 4 9 12l10 8zM5 5v14"/>')
};

// Rellena todos los elementos con data-i="nombre" con su ícono.
// Se puede llamar con un contenedor (por ejemplo, una vista recién cargada).
export const pintarIconos = (raiz = document) =>
  $$('[data-i]', raiz).forEach(e => { e.innerHTML = I[e.dataset.i]; });

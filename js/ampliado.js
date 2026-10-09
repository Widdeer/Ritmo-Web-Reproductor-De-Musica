/* ============================================================
   ampliado.js — el panel grande (portada o video, "A continuación")
   Se abre desde la barra de abajo y se minimiza con el botón, con Esc
   y automáticamente al navegar.
   ============================================================ */
import { $, $$, esc } from './core/utils.js';
import { DB, save } from './core/datos.js';
import { T } from './core/biblioteca.js';
import { I } from './core/iconos.js';
import { P, au, play, swap } from './reproductor.js';

let full;   // el panel (#full)

// Color de fondo según la portada: promedio de colores en un canvas chiquito
function tint() {
  try {
    const c = document.createElement('canvas'); c.width = c.height = 8;
    const x = c.getContext('2d'); x.drawImage($('#fi'), 0, 0, 8, 8);
    const d = x.getImageData(0, 0, 8, 8).data; let r = 0, g = 0, b = 0;
    for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
    const n = d.length / 4; full.style.setProperty('--tint', `rgb(${r / n | 0},${g / n | 0},${b / n | 0})`);
  } catch { full.style.setProperty('--tint', '#ff6a13'); }   // si falla, naranja
}

// Muestra el video o la portada según el modo y si la canción tiene video
function mostrarModo() {
  const v = !!(P.cur && P.cur.vsrc && P.mode === 'video');
  au.classList.toggle('off', !v); $('#fi').classList.toggle('off', v); $('.stage').classList.toggle('wide', v);
  $$('[data-mode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === P.mode));
  $('#fnote').textContent = P.cur && !P.cur.vsrc && P.mode === 'video' ? 'Este tema no tiene video: se muestra su imagen.' : '';
}

// Dibuja la fila "A continuación" con la cola actual
function renderCola() {
  $('#cola').innerHTML = P.queue.map(id => T[id]).filter(Boolean).map(t => `<li><button data-id="${esc(t.id)}" class="${P.cur && t.id === P.cur.id ? 'on' : ''}"><img src="${esc(t.img)}" alt=""><b>${esc(t.title)}</b><small>${esc(t.ch)}</small></button></li>`).join('');
}

// Abre (true) o minimiza (false) el panel
export const abrir = v => {
  full.hidden = !v;
  document.body.style.overflow = v ? 'hidden' : '';
  $('#expand').innerHTML = I[v ? 'chev' : 'expand'];
  if (v) $('#shrink').focus();
};

export function initAmpliado() {
  full = $('#full');
  $('#fi').onload = tint;

  // Cuando el reproductor cambia de canción, se actualizan modo y cola
  document.addEventListener('ritmo:play', () => { mostrarModo(); renderCola(); });

  // Abrir / minimizar
  $('#expand').onclick = () => P.cur && abrir(full.hidden);
  $('#bar .cov').onclick = $('#bar .np').onclick = () => P.cur && abrir(true);
  $('#shrink').onclick = () => abrir(false);
  addEventListener('keydown', e => { if (e.key === 'Escape' && !full.hidden) abrir(false); });

  // Al navegar (menú lateral, configuración, buscador) el panel se minimiza
  $$('#side a').forEach(a => a.addEventListener('click', () => abrir(false)));
  addEventListener('hashchange', () => abrir(false));
  $('#sf').addEventListener('submit', () => abrir(false));

  // Botones Video / Solo audio
  $$('[data-mode]').forEach(b => b.onclick = () => { P.mode = DB.mode = b.dataset.mode; save(); mostrarModo(); swap(); });

  // Clic en un tema de "A continuación"
  $('#cola').onclick = e => { const b = e.target.closest('button'); if (b && T[b.dataset.id]) play(T[b.dataset.id], P.queue); };
}

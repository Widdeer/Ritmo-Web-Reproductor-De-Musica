/* ============================================================
   utils.js — herramientas chicas que usan todos los módulos
   ============================================================ */

// Atajos para buscar elementos: $('#id') devuelve uno, $$('.clase') devuelve una lista
export const $ = (s, e = document) => e.querySelector(s);
export const $$ = (s, e = document) => [...e.querySelectorAll(s)];

// Escapa un texto antes de meterlo en innerHTML, para que un nombre de archivo
// (o lo que escriba el usuario) no pueda romper la página ni meter código.
export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Limpia el nombre de un artista ("Artista - Topic" -> "Artista")
export const clean = s => s.replace(/ - Topic$|VEVO$/i, '').trim();

// Segundos -> "m:ss"
export const fmt = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

// Aviso flotante que desaparece solo
export const toast = m => {
  const t = $('#toast'); t.textContent = m; t.classList.add('on');
  setTimeout(() => t.classList.remove('on'), 2200);
};

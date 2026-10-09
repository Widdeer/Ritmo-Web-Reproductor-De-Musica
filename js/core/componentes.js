/* ============================================================
   componentes.js — piezas de HTML que se repiten en varias vistas
   (tarjetas de canciones, títulos con grilla, avisos)
   ============================================================ */
import { esc } from './utils.js';
import { DB } from './datos.js';
import { I } from './iconos.js';
import { T } from './biblioteca.js';

const isSaved = id => DB.saved.some(t => t.id === id);

// Grilla de tarjetas. Los clics sobre las tarjetas se atienden en acciones.js
export const grid = l => {
  l.forEach(t => T[t.id] = t);
  return `<div class="grid">${l.map(t => `<article class="card" data-id="${esc(t.id)}"><button class="pl" aria-label="Reproducir ${esc(t.title)}"><img src="${esc(t.img)}" alt="" loading="lazy">${t.vsrc ? '<em class="tag">Video</em>' : ''}</button><h3>${esc(t.title)}</h3><p>${esc(t.ch)}</p><div class="acts"><button data-a="save" aria-pressed="${isSaved(t.id)}" aria-label="Guardar">${I.heart}</button><button data-a="add" aria-label="Agregar a una playlist">${I.plus}</button></div></article>`).join('')}</div>`;
};

// Un subtítulo seguido de una grilla
export const row = (h, l) => `<h2>${h}</h2>${grid(l)}`;

// Cuadro de aviso con título y texto
export const note = (t, p) => `<div class="note"><h2>${t}</h2><p>${p}</p></div>`;

// Aviso que se muestra si no hay conexión con el servidor
export const empty = note('No encuentro la biblioteca', 'Iniciá el servidor con <code>python server.py</code> y abrí http://localhost:5000.');

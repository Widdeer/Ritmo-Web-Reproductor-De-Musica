/* ============================================================
   biblioteca.js — carga la lista de canciones que entrega server.py
   ============================================================ */
import { esc } from './utils.js';
import { DB } from './datos.js';

// T: registro "id -> canción" (todas las que conoce la app, incluso guardadas y de playlists)
export const T = {};
// LIB: lista del servidor. null = no se pudo conectar. (Se importa como "binding vivo": siempre trae el valor actual)
export let LIB = null;

// Codifica cada tramo de una ruta para usarla en una URL (espacios, tildes, etc.)
const enc = p => p.split('/').map(encodeURIComponent).join('/');

// Imagen naranja con la inicial, para canciones sin portada
const ph = t => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90"><rect width="160" height="90" fill="#ff6a13"/><text x="80" y="60" font-size="44" font-weight="700" text-anchor="middle" fill="#0a0a0a" font-family="sans-serif">${esc((t.title[0] || '♪').toUpperCase())}</text></svg>`);

export async function loadLib() {
  try {
    const r = await fetch('/api/library', { cache: 'no-store' });
    // v: 2 marca las canciones con el formato actual
    LIB = (await r.json()).map(t => ({ ...t, v: 2, src: enc(t.src), vsrc: t.vsrc ? enc(t.vsrc) : '', img: t.img ? enc(t.img) : ph(t) }));
  } catch { LIB = null; }
  // descarta lo guardado con formatos viejos (migración)
  DB.saved = DB.saved.filter(t => t.v === 2); DB.recent = DB.recent.filter(t => t.v === 2);
  for (const k in DB.lists) DB.lists[k] = DB.lists[k].filter(t => t.v === 2);
  [...DB.saved, ...DB.recent, ...Object.values(DB.lists).flat(), ...(LIB || [])].forEach(t => T[t.id] = t);
}

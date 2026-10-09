/* ============================================================
   datos.js — los datos del usuario (gustos, guardados, playlists, tema)
   Por ahora viven en el localStorage del navegador.
   ============================================================ */

// Valores por defecto. (`key` es un campo viejo que ya no se usa; se deja para no tocar lo guardado.)
const D = { key: '', tastes: {}, saved: [], lists: {}, recent: [], theme: 'dark' };

// DB: objeto único con todo. Los demás módulos lo importan y lo modifican directamente.
export const DB = (() => {
  try { return { ...D, ...JSON.parse(localStorage.getItem('ritmo')) }; } catch { return { ...D }; }
})();

// Guarda DB en el navegador (se llama después de cada cambio)
export const save = () => { try { localStorage.setItem('ritmo', JSON.stringify(DB)); } catch {} };

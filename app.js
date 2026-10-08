'use strict';
const $ = (s, e = document) => e.querySelector(s), $$ = (s, e = document) => [...e.querySelectorAll(s)];

/* ---------- Datos (temporales, en el navegador) ---------- */
const D = { key: '', tastes: {}, saved: [], lists: {}, recent: [], theme: 'dark' };
let DB;
try { DB = { ...D, ...JSON.parse(localStorage.getItem('ritmo')) }; } catch { DB = { ...D }; }
const save = () => { try { localStorage.setItem('ritmo', JSON.stringify(DB)); } catch {} };

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dec = s => { const t = document.createElement('textarea'); t.innerHTML = s; return t.value; };
const clean = s => s.replace(/ - Topic$|VEVO$/i, '').trim();
const G = ['Rock nacional', 'Pop', 'Reggaeton', 'Cumbia', 'Cuarteto', 'Trap argentino', 'Electrónica', 'Hip hop', 'Jazz', 'Lo-fi', 'Clásica', 'Folklore'];

/* ---------- Iconos ---------- */
const S = p => `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const I = {
  home: S('<path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/>'),
  list: S('<path d="M4 6h12M4 12h8M4 18h8M17 9v8"/><circle cx="15" cy="17" r="2"/>'),
  heart: S('<path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z"/>'),
  down: S('<path d="M12 3v12M7 11l5 5 5-5M4 21h16"/>'),
  plus: S('<path d="M12 5v14M5 12h14"/>'),
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
$$('[data-i]').forEach(e => e.innerHTML = I[e.dataset.i]);

/* ---------- Tema ---------- */
const applyTheme = () => { document.documentElement.dataset.theme = DB.theme; };
applyTheme();
$('#theme').onclick = e => {
  DB.theme = DB.theme === 'dark' ? 'light' : 'dark'; save(); applyTheme();
  const b = e.currentTarget; b.classList.remove('spin'); void b.offsetWidth; b.classList.add('spin');
};
$('#logo').onclick = () => $('#side').classList.toggle('open');

const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 2200); };

/* ---------- Biblioteca local (la entrega server.py en /api/library) ---------- */
const T = {}; let LIB = null;
const enc = p => p.split('/').map(encodeURIComponent).join('/');
const ph = t => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90"><rect width="160" height="90" fill="#ff6a13"/><text x="80" y="60" font-size="44" font-weight="700" text-anchor="middle" fill="#0a0a0a" font-family="sans-serif">${esc((t.title[0] || '♪').toUpperCase())}</text></svg>`);
async function loadLib() {
  try {
    const r = await fetch('/api/library', { cache: 'no-store' });
    LIB = (await r.json()).map(t => ({ ...t, v: 2, src: enc(t.src), vsrc: t.vsrc ? enc(t.vsrc) : '', img: t.img ? enc(t.img) : ph(t) }));
  } catch { LIB = null; }
  DB.saved = DB.saved.filter(t => t.v === 2); DB.recent = DB.recent.filter(t => t.v === 2);
  for (const k in DB.lists) DB.lists[k] = DB.lists[k].filter(t => t.v === 2);
  [...DB.saved, ...DB.recent, ...Object.values(DB.lists).flat(), ...(LIB || [])].forEach(t => T[t.id] = t);
}

/* ---------- Reproductor ---------- */
let queue = [], cur, mode = DB.mode || 'video', drag = false;
const au = $('#au'); au.volume = 0.8;
const full = $('#full');
const fmt = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
function setPlaying(p) { $$('.ppb').forEach(b => { b.innerHTML = I[p ? 'pause' : 'play']; b.setAttribute('aria-label', p ? 'Pausar' : 'Reproducir'); }); }
function showMode() {
  const v = !!(cur && cur.vsrc && mode === 'video');
  au.classList.toggle('off', !v); $('#fi').classList.toggle('off', v); $('.stage').classList.toggle('wide', v);
  $$('[data-mode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === mode));
  $('#fnote').textContent = cur && !cur.vsrc && mode === 'video' ? 'Este tema no tiene video: se muestra su imagen.' : '';
}
let curSrc = '';
const srcFor = t => (mode === 'video' && t.vsrc) ? t.vsrc : t.src;
function load(t, at = 0, go = true) {
  const s = srcFor(t); if (s === curSrc) return;
  curSrc = s; au.src = s;
  if (at) au.addEventListener('loadedmetadata', () => { au.currentTime = at; }, { once: true });
  if (go) au.play().catch(() => toast('Tocá play para reproducir'));
}
const swap = () => { if (cur) load(cur, au.currentTime, !au.paused); };
function tint() {   // color de fondo según la portada
  try {
    const c = document.createElement('canvas'); c.width = c.height = 8;
    const x = c.getContext('2d'); x.drawImage($('#fi'), 0, 0, 8, 8);
    const d = x.getImageData(0, 0, 8, 8).data; let r = 0, g = 0, b = 0;
    for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
    const n = d.length / 4; full.style.setProperty('--tint', `rgb(${r / n | 0},${g / n | 0},${b / n | 0})`);
  } catch { full.style.setProperty('--tint', '#ff6a13'); }
}
$('#fi').onload = tint;
function renderQ() {
  $('#q').innerHTML = queue.map(id => T[id]).filter(Boolean).map(t => `<li><button data-id="${esc(t.id)}" class="${cur && t.id === cur.id ? 'on' : ''}"><img src="${esc(t.img)}" alt=""><b>${esc(t.title)}</b><small>${esc(t.ch)}</small></button></li>`).join('');
}
function play(t, ids) {
  cur = t; queue = ids || [t.id];
  $$('.np-t').forEach(e => e.textContent = t.title); $$('.np-c').forEach(e => e.textContent = t.ch); $$('.cov').forEach(e => e.src = t.img);
  $$('.sk').forEach(e => e.value = 0); $$('.tc').forEach(e => e.textContent = '0:00');
  curSrc = ''; load(t);
  showMode(); renderQ();
  const k = clean(t.ch); DB.tastes[k] = (DB.tastes[k] || 0) + 1;       // aprende tus gustos
  DB.recent = [t, ...DB.recent.filter(x => x.id !== t.id)].slice(0, 12);
  save();
}
function next(d) {
  if (!cur) return;
  const i = queue.indexOf(cur.id), n = T[queue[(i + d + queue.length) % queue.length]];
  if (n) play(n, queue);
}
const open = v => { full.hidden = !v; document.body.style.overflow = v ? 'hidden' : ''; $('#expand').innerHTML = I[v ? 'chev' : 'expand']; if (v) $('#shrink').focus(); };
$('#expand').onclick = () => cur && open(full.hidden);
$('#bar .cov').onclick = $('#bar .np').onclick = () => cur && open(true);
$('#shrink').onclick = () => open(false);
addEventListener('keydown', e => { if (e.key === 'Escape' && !full.hidden) open(false); });
// al navegar (menú lateral, configuración, buscador) el reproductor ampliado se minimiza
$$('#side a').forEach(a => a.addEventListener('click', () => open(false)));
addEventListener('hashchange', () => open(false));
$('#sf').addEventListener('submit', () => open(false));
$$('[data-mode]').forEach(b => b.onclick = () => { mode = DB.mode = b.dataset.mode; save(); showMode(); swap(); });
$('#q').onclick = e => { const b = e.target.closest('button'); if (b && T[b.dataset.id]) play(T[b.dataset.id], queue); };
$$('.ppb').forEach(b => b.onclick = () => { if (cur) au.paused ? au.play() : au.pause(); });
$$('.nxb').forEach(b => b.onclick = () => next(1));
$$('.pvb').forEach(b => b.onclick = () => next(-1));
au.onplay = () => setPlaying(true);
au.onpause = () => setPlaying(false);
au.onended = () => next(1);
au.onerror = () => { if (cur) toast('No se pudo reproducir este archivo'); };
au.onloadedmetadata = () => { $$('.sk').forEach(e => e.max = au.duration || 100); $$('.td').forEach(e => e.textContent = fmt(au.duration)); };
au.ontimeupdate = () => { if (drag) return; $$('.sk').forEach(e => e.value = au.currentTime); $$('.tc').forEach(e => e.textContent = fmt(au.currentTime)); };
$$('.sk').forEach(el => {
  el.oninput = e => { drag = true; $$('.sk').forEach(x => x.value = e.target.value); $$('.tc').forEach(x => x.textContent = fmt(e.target.value)); };
  el.onchange = e => { if (cur) au.currentTime = +e.target.value; drag = false; };
});
$$('.vl').forEach(el => el.oninput = e => { au.volume = e.target.value / 100; $$('.vl').forEach(x => x.value = e.target.value); });

/* ---------- Vistas ---------- */
const view = $('#view');
const isSaved = id => DB.saved.some(t => t.id === id);
const grid = l => {
  l.forEach(t => T[t.id] = t);
  return `<div class="grid">${l.map(t => `<article class="card" data-id="${esc(t.id)}"><button class="pl" aria-label="Reproducir ${esc(t.title)}"><img src="${esc(t.img)}" alt="" loading="lazy">${t.vsrc ? '<em class="tag">Video</em>' : ''}</button><h3>${esc(t.title)}</h3><p>${esc(t.ch)}</p><div class="acts"><button data-a="save" aria-pressed="${isSaved(t.id)}" aria-label="Guardar">${I.heart}</button><button data-a="add" aria-label="Agregar a una playlist">${I.plus}</button></div></article>`).join('')}</div>`;
};
const row = (h, l) => `<h2>${h}</h2>${grid(l)}`;
const note = (t, p) => `<div class="note"><h2>${t}</h2><p>${p}</p></div>`;
const empty = note('No encuentro la biblioteca', 'Iniciá el servidor con <code>python server.py</code> y abrí http://localhost:5000.');
const V = {
  inicio() {
    if (!LIB) return empty;
    if (!LIB.length) return note('Tu biblioteca está vacía', 'Copiá archivos a content/Musica y content/Video y recargá la biblioteca.');
    const top = Object.entries(DB.tastes).filter(([k]) => LIB.some(t => t.ch === k)).sort((a, b) => b[1] - a[1]).slice(0, 2).map(e => e[0]);
    let h = '<h1>Hecho para vos</h1>';
    if (DB.recent.length) h += row('Escuchado hace poco', DB.recent.slice(0, 6));
    top.forEach(k => h += row(`Porque escuchás ${esc(k)}`, LIB.filter(t => t.ch === k).slice(0, 12)));
    const m = LIB, v = LIB.filter(t => t.vsrc);
    if (m.length) h += row('Tu música', m.slice(0, 24));
    if (v.length) h += row('Con video', v.slice(0, 24));
    return h;
  },
  buscar(q) {
    if (!LIB) return empty;
    const n = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(), k = n(q);
    const l = LIB.filter(t => n(t.title + ' ' + t.ch).includes(k));
    return `<h1>Resultados para “${esc(q)}”</h1>` + (l.length ? grid(l) : note('Sin resultados', 'Probá con otro título o artista.'));
  },
  playlist() {
    const n = Object.keys(DB.lists);
    return `<h1>Playlists</h1><form class="nl" data-do="newform"><input id="nn" placeholder="Nombre de la playlist" aria-label="Nombre de la playlist"><button class="btn">Crear</button></form>` +
      (n.length ? n.map(k => `<div class="pl-h"><h2>${esc(k)}</h2><button class="lnk" data-do="del" data-n="${esc(k)}">Eliminar</button></div>` + (DB.lists[k].length ? grid(DB.lists[k]) : '<p class="mut">Vacía. Usá + en una canción para agregarla.</p>')).join('') : note('Todavía no tenés playlists', 'Creá una arriba y sumale canciones.'));
  },
  guardados() { return '<h1>Guardados</h1>' + (DB.saved.length ? grid(DB.saved) : note('Nada guardado todavía', 'Tocá el corazón en cualquier canción.')); },
  descargados() { return '<h1>Descargados</h1>' + note('Las descargas llegan con las cuentas', 'Cuando agregues inicio de sesión, acá van a aparecer las canciones disponibles sin conexión.'); },
  config() {
    return `<h1>Configuración</h1><h2>Biblioteca</h2><p class="mut">${LIB ? LIB.length + ' archivos encontrados.' : 'Todavía no se generó la biblioteca.'} Guardá tus archivos en <code>content/Musica</code> y <code>content/Video</code> y tocá “Recargar biblioteca”. Si querés una imagen para un tema o video, poné un .jpg o .png con el mismo nombre al lado del archivo.</p><button class="btn" data-do="reload">Recargar biblioteca</button><h2>Tus datos</h2><button class="btn ghost" data-do="clrtaste">Reiniciar mis gustos</button> <button class="btn ghost" data-do="clrall">Borrar todo</button>`;
  }
};

let rt = 0;
async function render() {
  const id = ++rt, [v, a] = location.hash.slice(1).split('/'), name = V[v] ? v : 'inicio';
  $$('[data-v]').forEach(x => x.classList.toggle('on', x.dataset.v === name));
  view.innerHTML = '<p class="mut">Cargando…</p>';
  const h = await V[name](decodeURIComponent(a || ''));
  if (id === rt) view.innerHTML = h;
}
addEventListener('hashchange', render);

/* ---------- Acciones ---------- */
function toggleSave(t, a) {
  const i = DB.saved.findIndex(x => x.id === t.id);
  i < 0 ? DB.saved.unshift(t) : DB.saved.splice(i, 1);
  save(); a.setAttribute('aria-pressed', i < 0);
  if (location.hash === '#guardados') render();
}
function pick(t) {
  const dlg = $('#dlg'), n = Object.keys(DB.lists);
  dlg.innerHTML = `<h2>Agregar a playlist</h2>${n.map(k => `<button class="btn ghost" value="${esc(k)}">${esc(k)}</button>`).join('')}<div class="nl"><input id="dn" placeholder="Nueva playlist" aria-label="Nueva playlist"><button class="btn" value="__new">Crear y agregar</button></div><button class="lnk" value="">Cancelar</button>`;
  dlg.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    let k = b.value; if (k === '__new') k = $('#dn').value.trim();
    if (k) { DB.lists[k] = DB.lists[k] || []; if (!DB.lists[k].some(x => x.id === t.id)) DB.lists[k].push(t); save(); toast('Agregada a ' + k); }
    dlg.close();
  };
  dlg.showModal();
}
const act = {
  chip: b => b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'),
  done() {
    const s = $$('.chip[aria-pressed=true]'); if (!s.length) return toast('Elegí al menos un género');
    s.forEach(c => DB.tastes[c.textContent] = (DB.tastes[c.textContent] || 0) + 3); save(); render();
  },
  async reload() { await loadLib(); render(); toast('Biblioteca recargada'); },
  del(b) { delete DB.lists[b.dataset.n]; save(); render(); },
  clrtaste() { DB.tastes = {}; DB.recent = []; save(); toast('Gustos reiniciados'); },
  clrall() { if (confirm('Se borran gustos, guardados, playlists y el Client ID.')) { localStorage.removeItem('ritmo'); sessionStorage.clear(); location.hash = ''; location.reload(); } }
};
view.onclick = e => {
  const c = e.target.closest('.card');
  if (c) {
    const t = T[c.dataset.id], a = e.target.closest('[data-a]');
    if (a) return a.dataset.a === 'save' ? toggleSave(t, a) : pick(t);
    return play(t, $$('.card', c.parentNode).map(x => x.dataset.id));
  }
  const b = e.target.closest('[data-do]'); if (b && act[b.dataset.do]) act[b.dataset.do](b);
};
view.onsubmit = e => {
  e.preventDefault(); const f = e.target.dataset.do;
  if (f === 'newform') { const n = $('#nn').value.trim(); if (n && !DB.lists[n]) { DB.lists[n] = []; save(); render(); } }
};
$('#sf').onsubmit = e => { e.preventDefault(); const q = $('#q').value.trim(); if (q) location.hash = 'buscar/' + encodeURIComponent(q); };

loadLib().then(render);

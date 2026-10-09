/* ============================================================
   reproductor.js — el motor de reproducción y la barra de abajo
   - Un solo elemento <video id="au"> reproduce todo (audio y video).
   - Este módulo NO sabe nada del panel ampliado: cuando cambia la
     canción avisa con el evento 'ritmo:play' y ampliado.js reacciona.
   ============================================================ */
import { $, $$, fmt, toast, clean } from './core/utils.js';
import { DB, save } from './core/datos.js';
import { T } from './core/biblioteca.js';
import { I } from './core/iconos.js';

// Estado compartido del reproductor (ampliado.js también lo lee)
//   cur   = canción actual     queue = ids de la lista desde la que se tocó
//   mode  = 'video' | 'audio'
export const P = { cur: null, queue: [], mode: DB.mode || 'video' };

// El elemento <video id="au"> (se busca en initReproductor)
export let au;

let curSrc = '';     // fuente que está cargada ahora
let drag = false;    // true mientras el usuario arrastra la barra de posición

// Qué archivo corresponde: el video si estamos en modo video y existe; si no, el audio
const srcFor = t => (P.mode === 'video' && t.vsrc) ? t.vsrc : t.src;

// Muestra u oculta la barra de abajo (solo se ve si hay una canción cargada)
function mostrarBarra(v) {
  $('#bar').hidden = !v;
  document.body.classList.toggle('con-bar', v);   // el CSS usa esta clase para dejar lugar abajo
}

// Cambia el ícono play/pausa en todos los botones
function setPlaying(p) {
  $$('.ppb').forEach(b => { b.innerHTML = I[p ? 'pause' : 'play']; b.setAttribute('aria-label', p ? 'Pausar' : 'Reproducir'); });
}

// Carga la fuente de la canción `t`. `at` = segundo desde el que seguir, `go` = reproducir enseguida.
function load(t, at = 0, go = true) {
  const s = srcFor(t); if (s === curSrc) return;
  curSrc = s; au.src = s;
  if (at) au.addEventListener('loadedmetadata', () => { au.currentTime = at; }, { once: true });
  if (go) au.play().catch(() => toast('Tocá play para reproducir'));
}

// Cambia entre video y solo audio conservando el segundo y el estado de pausa
export const swap = () => { if (P.cur) load(P.cur, au.currentTime, !au.paused); };

// Reproduce la canción `t`. `ids` = lista de ids del grupo desde el que se tocó (la cola)
export function play(t, ids) {
  P.cur = t; P.queue = ids || [t.id];
  $$('.np-t').forEach(e => e.textContent = t.title); $$('.np-c').forEach(e => e.textContent = t.ch); $$('.cov').forEach(e => e.src = t.img);
  $$('.sk').forEach(e => e.value = 0); $$('.tc').forEach(e => e.textContent = '0:00');
  curSrc = ''; load(t);
  mostrarBarra(true);
  document.dispatchEvent(new Event('ritmo:play'));   // avisa al panel ampliado (modo y cola)
  const k = clean(t.ch); DB.tastes[k] = (DB.tastes[k] || 0) + 1;       // aprende tus gustos
  DB.recent = [t, ...DB.recent.filter(x => x.id !== t.id)].slice(0, 12);
  save();
}

// Cierra la música: frena el audio/video, vuelve todo al estado inicial y esconde la barra
export function cerrar() {
  if (!P.cur) return;
  P.cur = null; P.queue = []; curSrc = '';          // primero se borra la canción: así el error de "sin fuente" no avisa nada
  au.pause(); au.removeAttribute('src'); au.load();   // frena y suelta el archivo
  $$('.np-t').forEach(e => e.textContent = 'Nada reproduciéndose');
  $$('.np-c').forEach(e => e.textContent = 'Elegí una canción');
  $$('.cov').forEach(e => e.removeAttribute('src'));  // sin src, el CSS esconde la portada
  $$('.sk').forEach(e => e.value = 0);
  $$('.tc, .td').forEach(e => e.textContent = '0:00');
  mostrarBarra(false);
  document.dispatchEvent(new Event('ritmo:cerrar'));  // avisa al panel ampliado para que se minimice
}

// Pasa a la canción siguiente (d = 1) o anterior (d = -1); da la vuelta al llegar al final
export function next(d) {
  if (!P.cur) return;
  const i = P.queue.indexOf(P.cur.id), n = T[P.queue[(i + d + P.queue.length) % P.queue.length]];
  if (n) play(n, P.queue);
}

// Conecta botones, barra de posición, volumen y eventos del audio/video
export function initReproductor() {
  au = $('#au'); au.volume = 0.8;

  $$('.ppb').forEach(b => b.onclick = () => { if (P.cur) au.paused ? au.play() : au.pause(); });
  $$('.nxb').forEach(b => b.onclick = () => next(1));
  $$('.pvb').forEach(b => b.onclick = () => next(-1));
  $$('.cerrar').forEach(b => b.onclick = cerrar);   // hay un botón en la barra y otro en el panel grande

  au.onplay = () => setPlaying(true);
  au.onpause = () => setPlaying(false);
  au.onended = () => next(1);
  au.onerror = () => { if (P.cur) toast('No se pudo reproducir este archivo'); };
  au.onloadedmetadata = () => { $$('.sk').forEach(e => e.max = au.duration || 100); $$('.td').forEach(e => e.textContent = fmt(au.duration)); };
  au.ontimeupdate = () => { if (drag) return; $$('.sk').forEach(e => e.value = au.currentTime); $$('.tc').forEach(e => e.textContent = fmt(au.currentTime)); };

  // Barras de posición (hay una en la barra de abajo)
  $$('.sk').forEach(el => {
    el.oninput = e => { drag = true; $$('.sk').forEach(x => x.value = e.target.value); $$('.tc').forEach(x => x.textContent = fmt(e.target.value)); };
    el.onchange = e => { if (P.cur) au.currentTime = +e.target.value; drag = false; };
  });
  // Volumen
  $$('.vl').forEach(el => el.oninput = e => { au.volume = e.target.value / 100; $$('.vl').forEach(x => x.value = e.target.value); });
}

/* ============================================================
   Vista "Subir música" (#subir)
   Formulario que manda título, artista, audio, video y portada a
   POST /api/upload. El servidor arma content/Musica/Artista - Título/
   ============================================================ */
import { $, $$, toast } from '../core/utils.js';
import { I } from '../core/iconos.js';
import { loadLib } from '../core/biblioteca.js';

// Cuadrado con un + en el centro para elegir un archivo
const up = (name, title, hint, accept) => `<label class="up"><input class="sr" type="file" name="${name}" accept="${accept}"><span class="box">${I.plus}</span><b>${title}</b><small class="mut">${hint}</small><span class="fn mut"></span></label>`;

// Manda el formulario al servidor. Se usa XMLHttpRequest (y no fetch) para poder mostrar el progreso.
function subir(form) {
  const err = $('#uerr'), bar = $('#upr'), btn = $('.btn', form);
  const fail = m => { err.textContent = m; btn.disabled = false; bar.hidden = true; };
  err.textContent = '';
  if (!form.elements.audio.files.length) return fail('Elegí un archivo de audio: es obligatorio.');
  const x = new XMLHttpRequest();
  x.open('POST', '/api/upload'); x.responseType = 'json';
  btn.disabled = true; bar.value = 0; bar.hidden = false;
  x.upload.onprogress = e => { if (e.lengthComputable) bar.value = e.loaded / e.total * 100; };
  x.onload = async () => {
    if (x.status !== 200) return fail((x.response && x.response.error) || 'No se pudo subir la canción. Probá de nuevo.');
    toast('Música subida'); await loadLib(); location.hash = 'inicio';
  };
  x.onerror = () => fail('No se pudo conectar con el servidor. ¿Está corriendo python server.py?');
  x.send(new FormData(form));
}

export default {
  html() {
    return `<h1>Subir música</h1><form class="uf" data-do="upload">
      <label class="fld">Título de la música <span>Obligatorio</span><input name="title" required maxlength="100" autocomplete="off"></label>
      <label class="fld">Artista o creador <span>Obligatorio</span><input name="artist" required maxlength="100" autocomplete="off"></label>
      <div class="ups">
        ${up('audio', 'Subir audio', 'Obligatorio', 'audio/*,.mp3,.m4a,.wav,.ogg,.opus,.flac,.aac')}
        ${up('video', 'Subir video', 'Opcional', 'video/*,.mp4,.webm,.mov,.m4v,.ogv')}
        ${up('cover', 'Subir portada', 'Opcional', 'image/*,.jpg,.jpeg,.png,.webp')}
      </div>
      <p id="uerr" class="err" role="alert"></p>
      <progress id="upr" max="100" value="0" hidden aria-label="Progreso de la subida"></progress>
      <div><button class="btn">Subir</button></div>
    </form>`;
  },

  // Conecta el formulario: vista previa al elegir archivos y envío
  montar(cont) {
    const form = $('.uf', cont);
    // al elegir un archivo: muestra su nombre (y la vista previa si es la portada)
    form.addEventListener('change', e => {
      const f = e.target; if (f.type !== 'file') return;
      const lab = f.closest('.up'), file = f.files[0], box = $('.box', lab);
      $('.fn', lab).textContent = file ? file.name : '';
      lab.classList.toggle('has', !!file);
      if (f.name === 'cover' && file) box.innerHTML = `<img alt="" src="${URL.createObjectURL(file)}" onload="URL.revokeObjectURL(this.src)">`;
      else box.innerHTML = file ? I.check : I.plus;
    });
    form.addEventListener('submit', e => { e.preventDefault(); subir(form); });
  }
};

/* ============================================================
   main.js — punto de entrada de Ritmo.
   Solo arma las piezas y las enciende, en orden. La lógica vive en cada módulo:

     core/         utils, datos (localStorage), iconos, tema, biblioteca, componentes
     reproductor   motor de audio/video y barra de abajo
     ampliado      panel grande con portada o video
     acciones      clics en tarjetas (tocar, guardar, agregar a playlist)
     buscador      barra de búsqueda
     router        elige la vista según el #hash
     vistas/       una vista por archivo (inicio, buscar, playlist, guardados,
                   descargados, subir, config)
   ============================================================ */
import { $ } from './core/utils.js';
import { pintarIconos } from './core/iconos.js';
import { initTema } from './core/tema.js';
import { loadLib } from './core/biblioteca.js';
import { initReproductor } from './reproductor.js';
import { initAmpliado } from './ampliado.js';
import { initAcciones } from './acciones.js';
import { initBuscador } from './buscador.js';
import { initRouter, render } from './router.js';

pintarIconos();                                                    // íconos de la página base
initTema();                                                        // sol/luna
$('#logo').onclick = () => $('#side').classList.toggle('open');    // logo: abre/cierra el menú (celulares)
initReproductor();
initAmpliado();
initAcciones(render);
initBuscador();
initRouter();

// Carga la biblioteca del servidor y dibuja la primera vista
loadLib().then(render);

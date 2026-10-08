<div align="center">

# 🎧 Ritmo

**Tu música y tus videos, con la experiencia de un reproductor moderno.**
Un reproductor tipo Spotify que corre en el navegador y lee tu biblioteca personal desde una carpeta.

![Python](https://img.shields.io/badge/Python-3.9%2B-ff6a13?style=flat-square&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-backend-000000?style=flat-square&logo=flask&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-ff6a13?style=flat-square&logo=javascript&logoColor=white)
![Sin frameworks](https://img.shields.io/badge/frontend-sin%20frameworks-000000?style=flat-square)

</div>

<!--
  💡 Agregá capturas acá. Guardalas en una carpeta `docs/` y usá, por ejemplo:
  ![Inicio](docs/inicio.png)
  ![Reproductor ampliado](docs/ampliado.png)
-->

---

## ✨ Características

- 🗂️ **Biblioteca desde carpetas**: cada carpeta es una canción, con su audio, su video y su portada.
- 🖼️ **Reproductor ampliado** con la portada grande y centrada, y un fondo que toma el color de la imagen.
- 🎬 **Dos modos**: ver el **video** o escuchar **solo audio** mostrando la portada. Cambiás en medio de la canción y sigue desde el mismo segundo.
- 🎨 **Portada automática**: usa la imagen de la carpeta, o la que viene incrustada en el archivo de audio (MP3, M4A, FLAC).
- ⏱️ **Barra de reproducción completa**: anterior, pausa, siguiente, adelantar/atrasar y volumen.
- 📜 **"A continuación"**: mirá lo que sigue y saltá a cualquier tema.
- 🧠 **Recomendaciones** según lo que más escuchás.
- ❤️ **Guardados y playlists** propias.
- 🔎 **Buscador** por título o artista.
- 🌗 **Tema claro y oscuro** (sol/luna) en una paleta naranja, negro y blanco.
- 📌 **Barra lateral desplegable**: solo iconos hasta que pasás el mouse.

## 🚀 Empezar

### Requisitos

- Python 3.9 o superior
- Un navegador moderno (Chrome, Edge, Firefox)

### Instalación

```bash
git clone https://github.com/<tu-usuario>/ritmo.git
cd ritmo
pip install -r requirements.txt
```

### Ejecutar

```bash
python server.py
```

Abrí **http://localhost:5000** y listo.

> ℹ️ Usá siempre `server.py` y no un servidor estático cualquiera: es el que permite adelantar y atrasar en archivos largos.

## 📁 Tu biblioteca

Creá la carpeta `content/` junto a `server.py` y poné **una carpeta por canción**:

```
content/
└── Musica/
    ├── Home - Resonance/
    │   ├── Resonance.mp3      ← audio
    │   ├── Resonance.mp4      ← video (opcional)
    │   └── portada.jpg        ← imagen (opcional)
    └── Otra Banda - Otra Canción/
        └── cancion.mp3
```

| Detalle | Cómo funciona |
|---|---|
| **Nombre de la carpeta** | `Artista - Título`. Sin el guion, se usa el nombre completo como título |
| **Portada** | Imagen de la carpeta (mejor si se llama `cover` o `portada`) → portada incrustada en el audio → tarjeta naranja con la inicial |
| **Archivos sueltos** | Se agrupan por nombre de archivo |
| **Actualizar** | Recargá la página, o tocá **Recargar biblioteca** en Configuración |

**Formatos:** audio `mp3 m4a wav ogg opus flac aac` · video `mp4 webm mov m4v ogv` · imagen `jpg png webp`.
Algunos formatos (como `.mkv`) pueden no reproducirse en el navegador.

## 🧩 Cómo funciona

```
┌────────────────────┐   /api/library    ┌────────────────────┐
│  Navegador         │ ────────────────▶ │  Flask (server.py) │
│  HTML + CSS + JS   │ ◀──────────────── │  lee content/      │
│                    │   /content/...    │  portadas con      │
│  localStorage:     │   (con rangos)    │  mutagen           │
│  gustos, listas    │                   │                    │
└────────────────────┘                   └────────────────────┘
```

| Ruta | Descripción |
|---|---|
| `GET /api/library` | Lista de canciones encontradas en `content/` |
| `GET /api/cover/<ruta>` | Portada incrustada en un archivo de audio |
| `GET /content/<ruta>` | Archivos multimedia, con soporte para adelantar/atrasar |

El servidor solo expone `index.html`, `style.css`, `app.js` y la carpeta `content/`.

## 🛠️ Tecnologías

- **Frontend:** HTML, CSS y JavaScript puro, sin dependencias ni paso de compilación
- **Backend:** [Flask](https://flask.palletsprojects.com/) y [mutagen](https://mutagen.readthedocs.io/)
- **Tipografía:** [Sora](https://fonts.google.com/specimen/Sora)

## 🗺️ Próximos pasos

- [ ] Inicio de sesión y cuentas de usuario (guardar gustos y playlists en una base de datos)
- [ ] Miniaturas automáticas para videos sin imagen
- [ ] Reordenar la cola, modo aleatorio y repetir
- [ ] Atajos de teclado
- [ ] Sección **Descargados** para uso sin conexión

## ⚖️ Nota sobre el contenido

Ritmo reproduce **tus propios archivos**. No incluye música ni videos, y el contenido de `content/` no se sube al repositorio. Respetá los derechos de autor de lo que agregues.

---

<div align="center">
Hecho con 🧡 y mucho <b>ritmo</b>.
</div>

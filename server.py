"""Servidor de Ritmo.  Uso:  pip install flask mutagen   y luego   python server.py
Abrí http://localhost:5000

Cada carpeta dentro de content/ con un audio (y opcionalmente un video y una imagen)
es una canción. Si no hay imagen, se usa la portada incrustada en el audio.
"""
import re
import shutil
from pathlib import Path
from flask import Flask, Response, abort, jsonify, request, send_from_directory

try:
    import mutagen
except ImportError:  # sin mutagen funciona igual, solo que no lee portadas incrustadas
    mutagen = None

ROOT = Path(__file__).parent.resolve()
CONTENT = ROOT / "content"
AUDIO = {".mp3", ".m4a", ".wav", ".ogg", ".opus", ".flac", ".aac"}
VIDEO = {".mp4", ".webm", ".mov", ".m4v", ".ogv"}
IMAGE = {".jpg", ".jpeg", ".png", ".webp"}
COVER_NAMES = ("cover", "portada", "folder", "front")
GENERIC = {"content", "Musica", "Video"}
PUBLIC = {"style.css"}  # archivos sueltos que se exponen
PUBLIC_DIRS = {"js": {".js"}, "views": {".html"}}  # carpetas expuestas y qué extensiones se permiten
BAD_CHARS = re.compile(r'[<>:"/\\|?*\x00-\x1f]')  # caracteres que Windows no permite en nombres

app = Flask(__name__, static_folder=None)
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 ** 3  # tope de 2 GB por subida


def embedded_cover(path):
    """Devuelve (bytes, mime) de la portada incrustada en el archivo, o None."""
    if not mutagen:
        return None
    try:
        f = mutagen.File(path)
        if f is None:
            return None
        pics = getattr(f, "pictures", None)  # FLAC / OGG
        if pics:
            return pics[0].data, pics[0].mime
        tags = f.tags
        if not tags:
            return None
        for k in tags.keys():  # MP3 (ID3)
            if str(k).startswith("APIC"):
                return tags[k].data, tags[k].mime
        if "covr" in tags and tags["covr"]:  # M4A / MP4
            c = tags["covr"][0]
            return bytes(c), ("image/png" if c.imageformat == 14 else "image/jpeg")
    except Exception:
        pass
    return None


def pick(files, exts):
    return sorted(p for p in files if p.suffix.lower() in exts)


def url(p):
    return p.relative_to(ROOT).as_posix()


def make(name, owner, audio, video, cover):
    artist, sep, title = name.partition(" - ")  # "Artista - Título"
    base = audio or video
    art = next((p for p in (audio, video) if p and embedded_cover(p)), None)
    return {
        "id": url(base),
        "title": title if sep else name,
        "ch": artist if sep else (owner if owner not in GENERIC else "Música"),
        "src": url(base),                      # audio (o el video si no hay audio)
        "vsrc": url(video) if video else "",   # video, si existe
        "img": url(cover) if cover else ("/api/cover/" + url(art) if art else ""),
    }


def scan():
    if not CONTENT.exists():
        return []
    items = []
    for folder in sorted({p.parent for p in CONTENT.rglob("*") if p.is_file()}):
        files = [p for p in folder.iterdir() if p.is_file()]
        audios, videos, images = pick(files, AUDIO), pick(files, VIDEO), pick(files, IMAGE)
        if not audios and not videos:
            continue
        if folder.name not in GENERIC and len(audios) <= 1 and len(videos) <= 1:  # una carpeta = una canción
            cover = next((p for p in images if p.stem.lower() in COVER_NAMES), images[0] if images else None)
            items.append(make(folder.name, folder.parent.name, audios[0] if audios else None, videos[0] if videos else None, cover))
        else:  # varios archivos sueltos: se agrupan por nombre
            for stem in sorted({p.stem for p in audios + videos}):
                a = next((p for p in audios if p.stem == stem), None)
                v = next((p for p in videos if p.stem == stem), None)
                c = next((p for p in images if p.stem == stem), None)
                items.append(make(stem, folder.name, a, v, c))
    return items


def safe_name(text):
    """Limpia un texto para usarlo como nombre de carpeta/archivo (sin /, \\, :, etc.)."""
    text = BAD_CHARS.sub("", text or "")
    text = re.sub(r"\s+", " ", text).strip(" .")
    return text[:100]


def error(msg, code=400):
    return jsonify(error=msg), code


@app.errorhandler(413)
def too_big(_):
    return error("Los archivos son demasiado grandes (máximo 2 GB en total).", 413)


@app.get("/api/library")
def library():
    return jsonify(scan())


@app.post("/api/upload")
def upload():
    """Recibe el formulario de 'Subir música' y arma content/Musica/Artista - Título/."""
    title = safe_name(request.form.get("title"))
    artist = safe_name(request.form.get("artist")).replace(" - ", " ")  # " - " separa artista y título
    audio = request.files.get("audio")
    video = request.files.get("video")
    cover = request.files.get("cover")
    has = lambda f: bool(f and f.filename)  # el navegador manda un archivo vacío si no eligieron nada

    if not title:
        return error("Falta el título de la música.")
    if not artist:
        return error("Falta el nombre del artista o creador.")
    if not has(audio):
        return error("Falta el archivo de audio.")

    ext = lambda f: Path(f.filename).suffix.lower()
    if ext(audio) not in AUDIO:
        return error("El audio tiene que ser: " + ", ".join(sorted(AUDIO)) + ".")
    if has(video) and ext(video) not in VIDEO:
        return error("El video tiene que ser: " + ", ".join(sorted(VIDEO)) + ".")
    if has(cover) and ext(cover) not in IMAGE:
        return error("La portada tiene que ser: " + ", ".join(sorted(IMAGE)) + ".")

    folder = CONTENT / "Musica" / f"{artist} - {title}"
    if folder.exists():
        return error("Ya existe una canción con ese artista y título.", 409)

    try:
        folder.mkdir(parents=True)
        audio.save(folder / (title + ext(audio)))
        if has(video):
            video.save(folder / (title + ext(video)))
        if has(cover):
            cover.save(folder / ("portada" + ext(cover)))
    except Exception:
        shutil.rmtree(folder, ignore_errors=True)  # no dejar carpetas a medio crear
        return error("No se pudo guardar la canción en el servidor.", 500)
    return jsonify(ok=True, folder=folder.name)


@app.get("/api/cover/<path:path>")
def cover(path):
    full = (ROOT / path).resolve()
    if CONTENT not in full.parents or not full.is_file():
        abort(404)
    art = embedded_cover(full)
    if not art:
        abort(404)
    return Response(art[0], mimetype=art[1] or "image/jpeg", headers={"Cache-Control": "max-age=3600"})


@app.get("/content/<path:path>")
def media(path):
    # conditional=True activa las peticiones por rango (adelantar/atrasar en audio y video)
    return send_from_directory(CONTENT, path, conditional=True)


@app.get("/")
def index():
    return send_from_directory(ROOT, "index.html", max_age=0)


@app.get("/<path:name>")
def static_files(name):
    ext = Path(name).suffix.lower()
    carpeta = name.split("/")[0]
    # lista blanca: archivos sueltos, o archivos .js / .html dentro de js/ y views/ (nada más, ni server.py)
    permitido = name in PUBLIC or ("/" in name and ext in PUBLIC_DIRS.get(carpeta, ()))
    if not permitido:
        abort(404)
    # tipo explícito para .js: en algunos Windows se detecta mal y los módulos no cargarían
    mime = "text/javascript" if ext == ".js" else None
    return send_from_directory(ROOT, name, max_age=0, mimetype=mime)  # sin caché: siempre ves la última versión


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)

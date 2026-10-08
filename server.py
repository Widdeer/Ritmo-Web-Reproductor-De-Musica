"""Servidor de Ritmo.  Uso:  pip install flask mutagen   y luego   python server.py
Abrí http://localhost:5000

Cada carpeta dentro de content/ con un audio (y opcionalmente un video y una imagen)
es una canción. Si no hay imagen, se usa la portada incrustada en el audio.
"""
from pathlib import Path
from flask import Flask, Response, abort, jsonify, send_from_directory

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
PUBLIC = {"style.css", "app.js"}  # únicos archivos estáticos que se exponen

app = Flask(__name__, static_folder=None)


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


@app.get("/api/library")
def library():
    return jsonify(scan())


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
    if name not in PUBLIC:
        abort(404)
    return send_from_directory(ROOT, name, max_age=0)  # sin caché: siempre ves la última versión


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)

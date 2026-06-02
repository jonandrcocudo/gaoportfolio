from pathlib import Path
import json
from urllib.parse import quote

ROOT = Path(__file__).parent
IMAGES_DIR = ROOT / "imagens"
VIDEOS_TXT = ROOT / "videos.txt"
OUT = ROOT / "gallery-data.js"

# Anything here will NOT be added to design gallery.
# Keep your personal photo and social preview here.
EXCLUDED_IMAGES = {
    "20260430_194126.png",
    "preview-card.png",
    "profile.png",
    "perfil.png",
    "foto.png",
    "avatar.png",
}

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"}

def read_videos():
    if not VIDEOS_TXT.exists():
        VIDEOS_TXT.write_text("# Add one YouTube link per line.\n", encoding="utf-8")
    videos = []
    for line in VIDEOS_TXT.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        videos.append({"url": line})
    return videos

def read_images():
    if not IMAGES_DIR.exists():
        IMAGES_DIR.mkdir(exist_ok=True)
    files = []
    for p in sorted(IMAGES_DIR.iterdir(), key=lambda x: x.name.lower()):
        if not p.is_file():
            continue
        if p.suffix.lower() not in IMAGE_EXTS:
            continue
        if p.name in EXCLUDED_IMAGES:
            continue
        files.append({
            "src": "imagens/" + quote(p.name),
            "alt": f"Design project by Gao - {p.stem}"
        })
    return files

videos = read_videos()
images = read_images()

content = "window.GAO_VIDEOS = " + json.dumps(videos, ensure_ascii=False, indent=2) + ";\n\n"
content += "window.GAO_IMAGES = " + json.dumps(images, ensure_ascii=False, indent=2) + ";\n"

OUT.write_text(content, encoding="utf-8")
print(f"Updated {OUT.name}: {len(videos)} videos, {len(images)} images.")

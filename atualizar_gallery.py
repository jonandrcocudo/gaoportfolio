from pathlib import Path
import json
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent
VIDEOS = ROOT / 'videos.txt'
IMAGES = ROOT / 'imagens'
OUT = ROOT / 'gallery-data.js'

image_exts = {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'}

def clean_alt(path: Path) -> str:
    name = path.stem.replace('-', ' ').replace('_', ' ')
    while '  ' in name:
        name = name.replace('  ', ' ')
    return f'Design project by Gao - {name.strip()}'

videos = []
if VIDEOS.exists():
    for line in VIDEOS.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        videos.append({'url': line})

images = []
if IMAGES.exists():
    for path in sorted(IMAGES.iterdir(), key=lambda p: p.name.lower()):
        if path.is_file() and path.suffix.lower() in image_exts:
            src = 'imagens/' + quote(path.name)
            images.append({'src': src, 'alt': clean_alt(path)})

content = 'window.GAO_VIDEOS = ' + json.dumps(videos, ensure_ascii=False, indent=2) + ';\n\n'
content += 'window.GAO_IMAGES = ' + json.dumps(images, ensure_ascii=False, indent=2) + ';\n'
OUT.write_text(content, encoding='utf-8')
print(f'OK: {len(videos)} vídeos e {len(images)} imagens salvos em {OUT.name}')
